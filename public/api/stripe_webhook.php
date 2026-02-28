<?php
// public/api/stripe_webhook.php
// Stripe webhook: payment success -> create unique promotion code -> email via Resend -> store in data/codes.csv
// refund -> deactivate promotion code -> mark invalid/refunded in CSV

header("Content-Type: application/json; charset=UTF-8");

// ---------- Load config ----------
$config = [];
$configPath = __DIR__ . "/config.php";
if (file_exists($configPath)) {
  $maybe = include $configPath;
  if (is_array($maybe)) $config = $maybe;
}
function cfg($key, $default = "") {
  global $config;
  if (isset($config[$key]) && $config[$key] !== "") return $config[$key];
  $v = getenv($key);
  return ($v !== false && $v !== null && $v !== "") ? $v : $default;
}

$STRIPE_SECRET_KEY     = cfg("STRIPE_SECRET_KEY");
$STRIPE_WEBHOOK_SECRET = cfg("STRIPE_WEBHOOK_SECRET");
$VIP_PAYMENT_LINK_ID   = cfg("VIP_PAYMENT_LINK_ID");
$VIP_COUPON_ID         = cfg("VIP_COUPON_ID");
$PROMO_PREFIX          = cfg("PROMO_PREFIX", "WOAFY");
$PROMO_EXPIRES_DAYS    = (int)cfg("PROMO_EXPIRES_DAYS", 365);

// Lark bot webhook (internal notification)
$LARK_BOT_WEBHOOK_URL  = cfg("LARK_BOT_WEBHOOK_URL", "");

if ($STRIPE_SECRET_KEY === "" || $STRIPE_WEBHOOK_SECRET === "" || $VIP_PAYMENT_LINK_ID === "" || $VIP_COUPON_ID === "") {
  http_response_code(500);
  echo json_encode(["status" => "error", "message" => "Missing config"]);
  exit;
}

// ---------- Paths ----------
function data_dir() {
  // public/api -> project root -> /data
  $dir = realpath(__DIR__ . "/../..") . "/data";
  if (!is_dir($dir)) @mkdir($dir, 0755, true);
  return $dir;
}
function codes_csv_path() {
  return data_dir() . "/codes.csv";
}

// ---------- Utilities ----------
function now_iso() { return date("Y-m-d H:i:s"); }
function clean_str($s) {
  $s = (string)$s;
  $s = str_replace(["\r","\n","\t"], [" "," "," "], $s);
  $s = preg_replace('/\s+/', ' ', $s);
  return trim($s);
}
function json_out($code, $arr) {
  http_response_code($code);
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
}

// ---------- Lark notify (internal) ----------
function lark_send_text($text) {
  $url = cfg("LARK_BOT_WEBHOOK_URL", "");
  if ($url === "") return false;

  $payload = [
    "msg_type" => "text",
    "content" => ["text" => $text],
  ];

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));
  curl_setopt($ch, CURLOPT_TIMEOUT, 8);

  $resp = curl_exec($ch);
  $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  return ($http >= 200 && $http < 300);
}

function lark_notify_paid_minimal($email, $amountHuman, $currency) {
  $email = clean_str($email);
  $currency = strtoupper(clean_str($currency));
  $time = now_iso();

  $text = "✅ New Early Bird Order\n"
        . "Email: " . ($email ?: "-") . "\n"
        . "Amount: " . ($amountHuman !== "" ? $amountHuman : "-") . " " . ($currency ?: "-") . "\n"
        . "Time: " . $time;

  return lark_send_text($text);
}

// ---------- Stripe signature verify (no SDK) ----------
function stripe_verify_signature($payload, $sigHeader, $secret) {
  // Stripe-Signature: t=timestamp,v1=signature,...
  if (!$sigHeader) return false;

  $parts = explode(",", $sigHeader);
  $timestamp = null;
  $signatures = [];

  foreach ($parts as $p) {
    $kv = explode("=", trim($p), 2);
    if (count($kv) !== 2) continue;
    if ($kv[0] === "t") $timestamp = $kv[1];
    if ($kv[0] === "v1") $signatures[] = $kv[1];
  }
  if (!$timestamp || empty($signatures)) return false;

  // tolerance 5 min
  $tolerance = 300;
  if (abs(time() - (int)$timestamp) > $tolerance) return false;

  $signedPayload = $timestamp . "." . $payload;
  $expected = hash_hmac("sha256", $signedPayload, $secret);

  foreach ($signatures as $sig) {
    if (hash_equals($expected, $sig)) return true;
  }
  return false;
}

// ---------- HTTP helpers ----------
function http_post_form($url, $headers, $fields) {
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
  $body = curl_exec($ch);
  $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  return [$status, $body, $err];
}
function http_get($url, $headers) {
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  $body = curl_exec($ch);
  $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  return [$status, $body, $err];
}
function stripe_headers($secretKey) {
  return [
    "Authorization: Bearer " . $secretKey,
    "Content-Type: application/x-www-form-urlencoded",
  ];
}

// ---------- CSV storage ----------
function ensure_codes_csv() {
  $path = codes_csv_path();
  if (!file_exists($path)) {
    $fp = fopen($path, "c+");
    if ($fp) {
      flock($fp, LOCK_EX);
      $stat = fstat($fp);
      if ($stat && (int)$stat["size"] === 0) {
        fputcsv($fp, [
          "created_at",
          "email",
          "name",
          "session_id",
          "payment_intent",
          "charge_id",
          "amount_total",
          "currency",
          "payment_link_id",
          "coupon_id",
          "promotion_code",
          "promotion_code_id",
          "status",          // active|refunded|invalid
          "refunded_at",
          "refund_reason",
          "email_sent_at"
        ]);
      }
      fflush($fp);
      flock($fp, LOCK_UN);
      fclose($fp);
    }
  }
}
function read_codes_rows() {
  ensure_codes_csv();
  $path = codes_csv_path();
  $fp = fopen($path, "r");
  if (!$fp) return [[], []];

  $header = fgetcsv($fp);
  if (!$header) { fclose($fp); return [[], []]; }

  $rows = [];
  while (($row = fgetcsv($fp)) !== false) {
    $row = array_pad($row, count($header), "");
    $assoc = [];
    for ($i=0; $i<count($header); $i++) $assoc[$header[$i]] = $row[$i] ?? "";
    $rows[] = $assoc;
  }
  fclose($fp);
  return [$header, $rows];
}
function write_codes_rows($header, $rows) {
  $path = codes_csv_path();
  $fp = fopen($path, "c+");
  if (!$fp) return false;

  if (!flock($fp, LOCK_EX)) { fclose($fp); return false; }

  rewind($fp);
  ftruncate($fp, 0);
  fputcsv($fp, $header);

  foreach ($rows as $r) {
    $line = [];
    foreach ($header as $h) $line[] = $r[$h] ?? "";
    fputcsv($fp, $line);
  }

  fflush($fp);
  flock($fp, LOCK_UN);
  fclose($fp);
  return true;
}
function find_row_by_session($rows, $sessionId) {
  for ($i=0; $i<count($rows); $i++) {
    if (($rows[$i]["session_id"] ?? "") === $sessionId) return $i;
  }
  return -1;
}
function find_row_by_payment_intent_or_charge($rows, $pi, $charge) {
  for ($i=0; $i<count($rows); $i++) {
    if ($pi && ($rows[$i]["payment_intent"] ?? "") === $pi) return $i;
    if ($charge && ($rows[$i]["charge_id"] ?? "") === $charge) return $i;
  }
  return -1;
}

// ---------- Generate promo code ----------
function generate_promo_code($prefix) {
  // WOAFY-XXXX-XXXX (no ambiguous chars)
  $alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  $pick = function($n) use ($alphabet) {
    $out = "";
    for ($i=0; $i<$n; $i++) $out .= $alphabet[random_int(0, strlen($alphabet)-1)];
    return $out;
  };
  return strtoupper($prefix) . "-" . $pick(4) . "-" . $pick(4);
}

// ---------- Stripe API: create promotion code ----------
function stripe_create_promotion_code($secretKey, $couponId, $code, $expiresAtUnix, $metadata) {
  $url = "https://api.stripe.com/v1/promotion_codes";
  $fields = [
    "coupon" => $couponId,
    "code" => $code,
    "max_redemptions" => 1,
    "expires_at" => $expiresAtUnix,
    "active" => "true",
  ];
  // metadata[k]=v
  foreach ($metadata as $k => $v) {
    $fields["metadata[".$k."]"] = (string)$v;
  }

  [$status, $body, $err] = http_post_form($url, stripe_headers($secretKey), $fields);
  if ($err) return [false, "curl_error: ".$err, null];

  $json = json_decode($body, true);
  if ($status >= 200 && $status < 300 && is_array($json) && isset($json["id"])) {
    return [true, "", $json];
  }
  return [false, "stripe_error: ".$body, null];
}

// ---------- Stripe API: deactivate promotion code ----------
function stripe_deactivate_promotion_code($secretKey, $promoId) {
  $url = "https://api.stripe.com/v1/promotion_codes/" . urlencode($promoId);
  $fields = ["active" => "false"];
  [$status, $body, $err] = http_post_form($url, stripe_headers($secretKey), $fields);
  if ($err) return [false, "curl_error: ".$err];
  if ($status >= 200 && $status < 300) return [true, ""];
  return [false, "stripe_error: ".$body];
}

// ---------- Mail (Resend) ----------
function send_promo_email($toEmail, $toName, $promoCode, $expiresAtIso) {
  require_once __DIR__ . "/_mail.php";

  $safeName = htmlspecialchars($toName ?: "there", ENT_QUOTES, "UTF-8");
  $safeCode = htmlspecialchars($promoCode, ENT_QUOTES, "UTF-8");

  $subject = "Your WoafyPet 50% OFF code";

  $html = '
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.55;color:#1B1B1B">
    <h2 style="margin:0 0 12px 0;">Hi '.$safeName.' 👋</h2>

    <p style="margin:0 0 12px 0;">
      Thanks for your VIP reservation deposit. Here is your <b>50% OFF</b> code:
    </p>

    <div style="margin:14px 0 18px 0;padding:14px 16px;border:1px solid #eee;border-radius:12px;background:#fafafa;">
      <div style="font-size:12px;color:#666;margin-bottom:6px;">Your code</div>
      <div style="font-size:22px;letter-spacing:1px;font-weight:700;">'.$safeCode.'</div>
      <div style="font-size:12px;color:#666;margin-top:8px;">Expires: '.$expiresAtIso.'</div>
    </div>

    <p style="margin:0 0 10px 0;">
      <b>How it works</b><br/>
      • This code is <b>one-time use</b> (max 1 redemption).<br/>
      • Use it at checkout on our official purchase page (Stripe checkout).<br/>
      • If your deposit order is refunded, this code will be automatically disabled.
    </p>

    <p style="margin:14px 0 0 0;">
      Questions? Email <a href="mailto:'.cfg("SUPPORT_EMAIL","support@woafmeow.com").'">'.cfg("SUPPORT_EMAIL","support@woafmeow.com").'</a>.
    </p>

    <p style="margin:18px 0 0 0;font-size:12px;color:#666;">
      You’re receiving this because you completed a VIP reservation deposit on woafmeow.com.
    </p>
  </div>';

  $text = "Hi ".($toName ?: "there").",\n\n".
          "Thanks for your VIP reservation deposit. Here is your 50% OFF code:\n\n".
          $promoCode."\n".
          "Expires: ".$expiresAtIso."\n\n".
          "How it works:\n".
          "- One-time use (max 1 redemption)\n".
          "- Use at checkout on our official purchase page (Stripe checkout)\n".
          "- If your deposit is refunded, this code will be disabled\n\n".
          "Support: ".cfg("SUPPORT_EMAIL","support@woafmeow.com")."\n";

  // _mail.php: resend_send_email($to,$subject,$html,$text)
  resend_send_email($toEmail, $subject, $html, $text);
}

// ---------- Read + verify webhook ----------
$payload = file_get_contents("php://input");
$sigHeader = $_SERVER["HTTP_STRIPE_SIGNATURE"] ?? "";

if (!$payload) json_out(400, ["status" => "error", "message" => "Empty payload"]);
if (!stripe_verify_signature($payload, $sigHeader, $STRIPE_WEBHOOK_SECRET)) {
  json_out(400, ["status" => "error", "message" => "Invalid signature"]);
}

$event = json_decode($payload, true);
if (!is_array($event) || !isset($event["type"])) json_out(400, ["status" => "error", "message" => "Invalid event"]);

$type = (string)$event["type"];
$obj  = $event["data"]["object"] ?? null;

ensure_codes_csv();

// ---------- Handler: checkout.session.completed ----------
if ($type === "checkout.session.completed") {
  if (!is_array($obj)) json_out(200, ["status" => "ok"]);

  // ✅ 必须是 paid（否则一律忽略）
  $paymentStatus = (string)($obj["payment_status"] ?? "");
  if ($paymentStatus !== "paid") {
    json_out(200, ["status" => "ignored", "reason" => "not_paid", "payment_status" => $paymentStatus]);
  }

  $sessionId = $obj["id"] ?? "";
  $paymentLinkId = $obj["payment_link"] ?? "";
  $paymentIntent = $obj["payment_intent"] ?? "";
  $amountTotal = $obj["amount_total"] ?? ""; // cents
  $currency = $obj["currency"] ?? "";
  $name = clean_str(($obj["customer_details"]["name"] ?? "") ?: "");
  $email = clean_str(($obj["customer_details"]["email"] ?? "") ?: "");

  // ✅ 只处理你的 VIP 订金 Payment Link
  if ($paymentLinkId !== $VIP_PAYMENT_LINK_ID) {
    json_out(200, ["status" => "ignored", "reason" => "not_target_payment_link"]);
  }

  if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    error_log("vip_webhook_missing_email session=".$sessionId);
    json_out(200, ["status" => "ok", "note" => "missing_email"]);
  }

  // ✅ 这里发送 Lark 内部提醒（极简），只在真实 paid + 目标 payment_link 时触发
  try {
    if (cfg("LARK_BOT_WEBHOOK_URL","") !== "") {
      $amountHuman = "";
      if ($amountTotal !== "" && is_numeric($amountTotal)) {
        $amountHuman = number_format(((int)$amountTotal) / 100, 2, '.', '');
      }
      lark_notify_paid_minimal($email, $amountHuman, $currency);
    }
  } catch (Throwable $e) {
    error_log("lark_paid_notify_failed session=".$sessionId." err=".$e->getMessage());
  }

  // 拿 charge id（用于退款匹配）
  $chargeId = "";
  if ($paymentIntent) {
    // GET payment_intent to fetch latest_charge
    $url = "https://api.stripe.com/v1/payment_intents/" . urlencode($paymentIntent);
    [$st, $body, $err] = http_get($url, ["Authorization: Bearer ".$STRIPE_SECRET_KEY]);
    if (!$err && $st >= 200 && $st < 300) {
      $pi = json_decode($body, true);
      if (is_array($pi) && isset($pi["latest_charge"])) $chargeId = (string)$pi["latest_charge"];
    }
  }

  // 幂等：如果同一个 session 已经生成过码，就不重复生成/不重复发信
  [$header, $rows] = read_codes_rows();
  $idx = find_row_by_session($rows, $sessionId);
  if ($idx !== -1 && ($rows[$idx]["promotion_code"] ?? "") !== "") {
    json_out(200, ["status" => "ok", "idempotent" => true]);
  }

  // 生成 promotion code
  $promoCode = generate_promo_code($PROMO_PREFIX);
  $expiresAt = time() + ($PROMO_EXPIRES_DAYS * 86400);
  $expiresIso = date("Y-m-d", $expiresAt);

  // 为了避免极低概率 code 冲突：最多重试 5 次
  $created = null;
  $promoId = "";
  $attempts = 0;
  while ($attempts < 5) {
    $attempts++;

    [$ok, $msg, $promo] = stripe_create_promotion_code(
      $STRIPE_SECRET_KEY,
      $VIP_COUPON_ID,
      $promoCode,
      $expiresAt,
      [
        "source" => "vip_deposit",
        "session_id" => $sessionId,
        "email" => $email,
      ]
    );

    if ($ok && is_array($promo)) {
      $created = $promo;
      $promoId = $promo["id"] ?? "";
      break;
    }

    // 如果是 code 冲突，就换一个再试
    if (strpos($msg, "already exists") !== false) {
      $promoCode = generate_promo_code($PROMO_PREFIX);
      continue;
    }

    error_log("vip_create_promo_failed session=".$sessionId." err=".$msg);
    json_out(200, ["status" => "ok", "note" => "promo_create_failed"]);
  }

  if (!$created || $promoId === "") {
    json_out(200, ["status" => "ok", "note" => "promo_not_created"]);
  }

  // 写入 CSV
  $row = [
    "created_at" => now_iso(),
    "email" => $email,
    "name" => $name,
    "session_id" => $sessionId,
    "payment_intent" => (string)$paymentIntent,
    "charge_id" => (string)$chargeId,
    "amount_total" => (string)$amountTotal,
    "currency" => (string)$currency,
    "payment_link_id" => (string)$paymentLinkId,
    "coupon_id" => (string)$VIP_COUPON_ID,
    "promotion_code" => (string)$promoCode,
    "promotion_code_id" => (string)$promoId,
    "status" => "active",
    "refunded_at" => "",
    "refund_reason" => "",
    "email_sent_at" => ""
  ];

  // 追加 or 更新该 session 行
  if ($idx === -1) {
    $rows[] = $row;
  } else {
    $rows[$idx] = array_merge($rows[$idx], $row);
  }
  write_codes_rows($header, $rows);

  // 发邮件（失败不阻断 webhook）
  try {
    send_promo_email($email, $name, $promoCode, $expiresIso);

    // 记录 email_sent_at
    [$header2, $rows2] = read_codes_rows();
    $idx2 = find_row_by_session($rows2, $sessionId);
    if ($idx2 !== -1) {
      $rows2[$idx2]["email_sent_at"] = now_iso();
      write_codes_rows($header2, $rows2);
    }
  } catch (Throwable $e) {
    error_log("vip_email_send_failed session=".$sessionId." err=".$e->getMessage());
  }

  json_out(200, ["status" => "ok"]);
}

// ---------- Handler: charge.refunded / charge.refund.updated ----------
if ($type === "charge.refunded" || $type === "charge.refund.updated") {
  if (!is_array($obj)) json_out(200, ["status" => "ok"]);

  $chargeId = (string)($obj["id"] ?? "");
  $paymentIntent = (string)($obj["payment_intent"] ?? "");

  // 从 CSV 找到对应码
  [$header, $rows] = read_codes_rows();
  $idx = find_row_by_payment_intent_or_charge($rows, $paymentIntent, $chargeId);

  if ($idx === -1) {
    json_out(200, ["status" => "ok", "note" => "not_found_in_csv"]);
  }

  $promoId = $rows[$idx]["promotion_code_id"] ?? "";
  if ($promoId) {
    // 禁用 promotion code
    [$ok, $msg] = stripe_deactivate_promotion_code($STRIPE_SECRET_KEY, $promoId);
    if (!$ok) error_log("vip_deactivate_promo_failed charge=".$chargeId." err=".$msg);
  }

  $rows[$idx]["status"] = "refunded";
  $rows[$idx]["refunded_at"] = now_iso();
  $rows[$idx]["refund_reason"] = "stripe_refund_event";
  write_codes_rows($header, $rows);

  json_out(200, ["status" => "ok"]);
}

// ---------- Default ----------
json_out(200, ["status" => "ok", "ignored" => $type]);