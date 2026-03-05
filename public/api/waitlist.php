<?php
/**
 * waitlist.php - CSV storage with dedupe + source tracking + simple rate limit + Resend email
 *
 * Recommended deployment:
 *  public_html/
 *    api/
 *      waitlist.php
 *      _mail.php
 *      config.php   (protected by .htaccess)
 *    data/
 *      waitlist.csv
 *      ratelimit/
 *
 * Response JSON:
 * { status: "success"|"error", message: "...", message_en?: "...", step?: "1"|"2", email_sent?: boolean }
 */

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// ==================== Load config (fallback if env not available) ====================
$config = [];
$configPath = __DIR__ . "/config.php";
if (file_exists($configPath)) {
  $maybe = include $configPath;
  if (is_array($maybe)) $config = $maybe;
}

function cfg_or($key, $default = '') {
  global $config;
  if (isset($config[$key]) && $config[$key] !== '') return $config[$key];
  $v = getenv($key);
  return ($v !== false && $v !== null && $v !== '') ? $v : $default;
}

// ==================== CORS whitelist ====================
$ALLOWED_ORIGINS = [
  "https://woafy.pet",
  "https://www.woafy.pet",
  "https://woafmeow.com",
  "https://www.woafmeow.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $ALLOWED_ORIGINS, true)) {
  header("Access-Control-Allow-Origin: " . $origin);
  header("Vary: Origin");
}

// OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// Only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode([
    "status" => "error",
    "message" => "Method not allowed",
    "message_en" => "Method not allowed",
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// ==================== Helpers ====================
function clean_str($data) {
  $s = (string)$data;
  // remove CR/LF/tab/pipe to avoid CSV/log injection
  $s = str_replace(["\r", "\n", "\t", "|"], [" ", " ", " ", " "], $s);
  $s = preg_replace('/\s+/', ' ', $s);
  return trim($s);
}

function clamp_len($s, $max) {
  $s = (string)$s;
  if (mb_strlen($s, 'UTF-8') > $max) {
    return mb_substr($s, 0, $max, 'UTF-8');
  }
  return $s;
}

function now_iso() {
  return date('Y-m-d H:i:s');
}

function read_json_body() {
  $raw = file_get_contents('php://input');
  if ($raw === false || trim($raw) === '') return [null, "Empty request body"];
  $data = json_decode($raw, true);
  if ($data === null || json_last_error() !== JSON_ERROR_NONE) return [null, "Invalid JSON data"];
  if (!is_array($data)) return [null, "Invalid JSON data"];
  return [$data, null];
}

function get_client_ip() {
  if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) return trim($_SERVER['HTTP_CF_CONNECTING_IP']);
  if (!empty($_SERVER['REMOTE_ADDR'])) return trim($_SERVER['REMOTE_ADDR']);
  // XFF should only be trusted behind a known proxy; keep as best-effort fallback
  if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
    return trim($parts[0]);
  }
  if (!empty($_SERVER['HTTP_X_REAL_IP'])) return trim($_SERVER['HTTP_X_REAL_IP']);
  return '0.0.0.0';
}

/**
 * Data directory
 * api/ is inside public_html/api, so go up one level to public_html, then /data
 */
function data_dir() {
  $root = realpath(__DIR__ . "/.."); // public_html
  if ($root === false) $root = dirname(__DIR__); // fallback
  $dir = $root . "/data";
  if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
  }
  return $dir;
}

// ==================== Rate Limit (file-based) ====================
// Same IP max 3 requests per 60 seconds
function rate_limit_or_die($ip, $limit = 3, $windowSeconds = 60) {
  $ip = clamp_len(clean_str($ip), 80);

  $dir = data_dir() . "/ratelimit";
  if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
  }

  $file = $dir . "/ip_" . hash('sha256', $ip) . ".json";
  $now = time();
  $data = ["ts" => []];

  $fp = @fopen($file, 'c+');
  if (!$fp) {
    // if cannot open rate limit file, do not block business
    return;
  }

  if (!flock($fp, LOCK_EX)) {
    fclose($fp);
    return;
  }

  rewind($fp);
  $raw = stream_get_contents($fp);
  if ($raw) {
    $decoded = json_decode($raw, true);
    if (is_array($decoded) && isset($decoded['ts']) && is_array($decoded['ts'])) {
      $data = $decoded;
    }
  }

  // keep timestamps within window
  $ts = [];
  foreach ($data['ts'] as $t) {
    if (is_int($t) || ctype_digit((string)$t)) {
      $t = (int)$t;
      if ($now - $t < $windowSeconds) $ts[] = $t;
    }
  }

  if (count($ts) >= $limit) {
    // write back unchanged list
    rewind($fp);
    ftruncate($fp, 0);
    fwrite($fp, json_encode(["ts" => $ts], JSON_UNESCAPED_UNICODE));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    http_response_code(429);
    echo json_encode([
      "status" => "error",
      "message" => "操作过于频繁，请稍后再试",
      "message_en" => "Too many attempts. Please try again later.",
    ], JSON_UNESCAPED_UNICODE);
    exit;
  }

  $ts[] = $now;

  rewind($fp);
  ftruncate($fp, 0);
  fwrite($fp, json_encode(["ts" => $ts], JSON_UNESCAPED_UNICODE));
  fflush($fp);

  flock($fp, LOCK_UN);
  fclose($fp);
}

// ==================== Apply rate limit early ====================
$clientIp = get_client_ip();
rate_limit_or_die($clientIp, 3, 60);

// ==================== Read request ====================
[$data, $jsonErr] = read_json_body();
if ($jsonErr) {
  http_response_code(400);
  echo json_encode([
    "status" => "error",
    "message" => $jsonErr,
    "message_en" => $jsonErr,
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// Step
$step = (string)($data['step'] ?? '1');
if ($step !== '1' && $step !== '2') {
  http_response_code(400);
  echo json_encode([
    "status" => "error",
    "message" => "Invalid step",
    "message_en" => "Invalid step",
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// ==================== Sanitize + length limits ====================
$email = strtolower(clean_str($data['email'] ?? ''));
$email = clamp_len($email, 200);

$name = clean_str($data['name'] ?? '');
$name = clamp_len($name, 120);

$pets = clean_str($data['pets'] ?? '');
$pets = clamp_len($pets, 800);

$consentBool = isset($data['consent']) ? (bool)$data['consent'] : false;

// Source tracking (body preferred, fallback to query/referrer header)
$utm_source   = clean_str($data['utm_source'] ?? ($_GET['utm_source'] ?? ''));
$utm_campaign = clean_str($data['utm_campaign'] ?? ($_GET['utm_campaign'] ?? ''));
$utm_medium   = clean_str($data['utm_medium'] ?? ($_GET['utm_medium'] ?? ''));
$utm_content  = clean_str($data['utm_content'] ?? ($_GET['utm_content'] ?? ''));
$utm_term     = clean_str($data['utm_term'] ?? ($_GET['utm_term'] ?? ''));

$referrer = clean_str($data['referrer'] ?? ($_SERVER['HTTP_REFERER'] ?? ''));

// Clamp source fields
$utm_source   = clamp_len($utm_source, 120);
$utm_campaign = clamp_len($utm_campaign, 120);
$utm_medium   = clamp_len($utm_medium, 120);
$utm_content  = clamp_len($utm_content, 200);
$utm_term     = clamp_len($utm_term, 120);
$referrer     = clamp_len($referrer, 500);

// Email validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode([
    "status" => "error",
    "message" => "邮箱格式不正确",
    "message_en" => "Invalid email format",
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// Step 1 enforcement
if ($step === '1') {
  if ($name === '') {
    http_response_code(400);
    echo json_encode([
      "status" => "error",
      "message" => "请填写姓名",
      "message_en" => "Name missing",
    ], JSON_UNESCAPED_UNICODE);
    exit;
  }
  if (!$consentBool) {
    http_response_code(400);
    echo json_encode([
      "status" => "error",
      "message" => "请勾选同意接收更新",
      "message_en" => "Consent required",
    ], JSON_UNESCAPED_UNICODE);
    exit;
  }
}

// ==================== CSV storage ====================
$csvFile = data_dir() . "/waitlist.csv";

$headers = [
  "email", "name", "consent", "pets",
  "utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term",
  "referrer", "ip",
  "created_at", "updated_at"
];

$fp = @fopen($csvFile, 'c+');
if (!$fp) {
  http_response_code(500);
  echo json_encode([
    "status" => "error",
    "message" => "无法打开存储文件",
    "message_en" => "Cannot open storage file",
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

if (!flock($fp, LOCK_EX)) {
  fclose($fp);
  http_response_code(500);
  echo json_encode([
    "status" => "error",
    "message" => "无法锁定存储文件",
    "message_en" => "Cannot lock storage file",
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// Ensure header exists if file is empty
$stat = fstat($fp);
if ($stat && (int)$stat['size'] === 0) {
  fputcsv($fp, $headers);
  fflush($fp);
}

// Read all rows
rewind($fp);
$rows = [];
$lineNum = 0;

while (($row = fgetcsv($fp)) !== false) {
  $lineNum++;
  if ($lineNum === 1) continue; // skip header
  if (!is_array($row) || count($row) < 1) continue;

  // Support older CSV by padding missing columns
  $row = array_pad($row, count($headers), "");

  $rows[] = [
    "email" => $row[0] ?? "",
    "name" => $row[1] ?? "",
    "consent" => $row[2] ?? "",
    "pets" => $row[3] ?? "",
    "utm_source" => $row[4] ?? "",
    "utm_campaign" => $row[5] ?? "",
    "utm_medium" => $row[6] ?? "",
    "utm_content" => $row[7] ?? "",
    "utm_term" => $row[8] ?? "",
    "referrer" => $row[9] ?? "",
    "ip" => $row[10] ?? "",
    "created_at" => $row[11] ?? "",
    "updated_at" => $row[12] ?? "",
  ];
}

// Find existing by email
$foundIndex = -1;
for ($i = 0; $i < count($rows); $i++) {
  if (strtolower((string)$rows[$i]["email"]) === $email) {
    $foundIndex = $i;
    break;
  }
}

$now = now_iso();

function merge_source_fields(&$target, $utm_source, $utm_campaign, $utm_medium, $utm_content, $utm_term, $referrer, $ip) {
  if ($utm_source !== "")   $target["utm_source"] = $utm_source;
  if ($utm_campaign !== "") $target["utm_campaign"] = $utm_campaign;
  if ($utm_medium !== "")   $target["utm_medium"] = $utm_medium;
  if ($utm_content !== "")  $target["utm_content"] = $utm_content;
  if ($utm_term !== "")     $target["utm_term"] = $utm_term;
  if ($referrer !== "")     $target["referrer"] = $referrer;
  if ($ip !== "")           $target["ip"] = $ip; // keep latest
}

$isNewRow = false;

// Create or update row
if ($foundIndex === -1) {
  $isNewRow = true;
  $rows[] = [
    "email" => $email,
    "name" => ($step === '1') ? $name : "",
    "consent" => ($step === '1' && $consentBool) ? "Yes" : "No",
    "pets" => ($step === '2' && $pets !== "") ? $pets : "",

    "utm_source" => $utm_source,
    "utm_campaign" => $utm_campaign,
    "utm_medium" => $utm_medium,
    "utm_content" => $utm_content,
    "utm_term" => $utm_term,
    "referrer" => $referrer,
    "ip" => clamp_len(clean_str($clientIp), 80),

    "created_at" => $now,
    "updated_at" => $now,
  ];
} else {
  $existing = $rows[$foundIndex];

  if ($step === '1') {
    $existing["name"] = $name;
    $existing["consent"] = $consentBool ? "Yes" : "No";
    // Step 1 does not overwrite pets
  } else {
    if ($pets !== "") $existing["pets"] = $pets;
  }

  merge_source_fields(
    $existing,
    $utm_source, $utm_campaign, $utm_medium, $utm_content, $utm_term,
    $referrer,
    clamp_len(clean_str($clientIp), 80)
  );

  if ($existing["created_at"] === "") $existing["created_at"] = $now;
  $existing["updated_at"] = $now;

  $rows[$foundIndex] = $existing;
}

// Rewrite entire file under lock
rewind($fp);
ftruncate($fp, 0);
fputcsv($fp, $headers);

foreach ($rows as $r) {
  fputcsv($fp, [
    $r["email"], $r["name"], $r["consent"], $r["pets"],
    $r["utm_source"], $r["utm_campaign"], $r["utm_medium"], $r["utm_content"], $r["utm_term"],
    $r["referrer"], $r["ip"],
    $r["created_at"], $r["updated_at"],
  ]);
}

fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

// ===== Lark internal notify: waitlist signup (Step 1 only) =====
if ($step === '1') {
  try {
    require_once __DIR__ . '/_lark.php';
    // 只发 waitlist 提醒，不要用 paid 的模板
    lark_notify_waitlist($email, $name);
  } catch (Throwable $e) {
    error_log("lark_waitlist_error: " . $e->getMessage());
  }
}

// ===== Brevo: add/update contact in list (Step 1 only) =====
if ($step === '1') {
  $brevoApiKey = cfg_or("BREVO_API_KEY", "");
  $brevoListId = (int)cfg_or("BREVO_LIST_ID", "13");

  if ($brevoApiKey !== "" && $brevoListId > 0) {
    try {
      $payload = json_encode([
        "email"         => $email,
        "attributes"    => ["FIRSTNAME" => $name],
        "listIds"       => [$brevoListId],
        "updateEnabled" => true,
      ]);

      $ch = curl_init("https://api.brevo.com/v3/contacts");
      curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
          "api-key: " . $brevoApiKey,
          "Content-Type: application/json",
          "Accept: application/json",
        ],
        CURLOPT_TIMEOUT        => 8,
      ]);

      $brevoResp     = curl_exec($ch);
      $brevoHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);

      // 201 = created, 204 = updated (no body) — both are success
      if ($brevoHttpCode !== 201 && $brevoHttpCode !== 204) {
        error_log("brevo_error: HTTP $brevoHttpCode — $brevoResp");
      }
    } catch (Throwable $e) {
      error_log("brevo_exception: " . $e->getMessage());
    }
  } else {
    if ($brevoApiKey === "") error_log("brevo_skip: BREVO_API_KEY not set");
    if ($brevoListId <= 0)  error_log("brevo_skip: BREVO_LIST_ID invalid");
  }
}

// ------------------ Waitlist email content (Step 1 only) ------------------
$emailSent = false;

if ($step === '1') {
  $apiKey = cfg_or("RESEND_API_KEY", "");
  $from   = cfg_or("RESEND_FROM", "WoafyPet <noreply@woafmeow.com>");

  if ($apiKey !== "") {
    try {
      require_once __DIR__ . "/_mail.php";

      $subject = "Welcome to WoafyPet 🐾 You’re in.";

      $supportEmail = cfg_or("SUPPORT_EMAIL", "support@woafmeow.com");
      $discordUrl   = "https://discord.gg/fkzqUnY9";

      $safeName    = htmlspecialchars($name ?: "there", ENT_QUOTES, "UTF-8");
      $safeSupport = htmlspecialchars($supportEmail, ENT_QUOTES, "UTF-8");

      $html = '
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color:#1B1B1B;">
        <h2 style="margin:0 0 12px 0;">Hi '.$safeName.' 👋</h2>

        <p style="margin:0 0 10px 0;">We’re so glad you’re here.</p>

        <p style="margin:0 0 14px 0;">
          By joining the WoafyPet waitlist, you\'re not just signing up for a product —
          you’re joining a group of thoughtful pet parents who care about the subtle signs others miss.
        </p>

        <p style="margin:0 0 10px 0;">
          WoafyPet is building a smarter, more comforting bed that quietly tracks:
        </p>

        <ul style="margin:0 0 14px 18px; padding:0;">
          <li>Heart rate</li>
          <li>Weight changes</li>
          <li>Heat cycles</li>
          <li>Sleep patterns</li>
          <li>Automatic temperature adjustments</li>
        </ul>

        <p style="margin:0 0 14px 0;">
          <b>No wearables.</b><br/>
          <b>No stress.</b><br/>
          Just invisible health awareness — while your dog rests.
        </p>

        <hr style="border:none;border-top:1px solid #eee;margin:18px 0;" />

        <h3 style="margin:0 0 10px 0;">💬 Join our early community</h3>

        <p style="margin:0 0 10px 0;">
          We’ve opened a private Discord for early supporters where you can:
        </p>

        <ul style="margin:0 0 14px 18px; padding:0;">
          <li>See behind-the-scenes development</li>
          <li>Vote on features</li>
          <li>Share feedback</li>
          <li>Get early beta access</li>
          <li>Connect with other proactive dog owners</li>
        </ul>

        <p style="margin:0 0 16px 0;">
          👉 <a href="'.$discordUrl.'" style="color:#FD8829; font-weight:700; text-decoration:none;">Join the WoafyPet Community</a>: '.$discordUrl.'
        </p>

        <div style="margin:18px 0;">
          <a href="'.$discordUrl.'"
             style="display:inline-block;background:#FD8829;color:#fff;text-decoration:none;
                    padding:12px 16px;border-radius:10px;font-weight:700;">
            Join the WoafyPet Community
          </a>
        </div>

        <p style="margin:0 0 10px 0;">
          This is where we’re building WoafyPet together.
        </p>

        <p style="margin:0 0 10px 0;">
          We’ll keep you updated as we move closer to launch — and as always, you can just contact
          <a href="mailto:'.$safeSupport.'" style="color:#FD8829; font-weight:600; text-decoration:none;">'.$safeSupport.'</a>
          if you have questions. A real human will answer.
        </p>

        <p style="margin:18px 0 0 0;">
          With care,<br/>
          The WoafyPet Team 🐾
        </p>

        <p style="margin:18px 0 0 0; font-size:12px; color:#777;">
          You’re receiving this because you joined the WoafyPet waitlist on woafy.pet.
        </p>
      </div>';

      $text =
      "Hi ".($name ?: "there")." 👋\n\n".
      "We’re so glad you’re here.\n\n".
      "By joining the WoafyPet waitlist, you're not just signing up for a product —\n".
      "you’re joining a group of thoughtful pet parents who care about the subtle signs others miss.\n\n".
      "WoafyPet is building a smarter, more comforting bed that quietly tracks:\n".
      "• Heart rate\n".
      "• Weight changes\n".
      "• Heat cycles\n".
      "• Sleep patterns\n".
      "• Automatic temperature adjustments\n\n".
      "No wearables.\n".
      "No stress.\n".
      "Just invisible health awareness — while your dog rests.\n\n".
      "💬 Join our early community\n".
      "We’ve opened a private Discord for early supporters where you can:\n".
      "• See behind-the-scenes development\n".
      "• Vote on features\n".
      "• Share feedback\n".
      "• Get early beta access\n".
      "• Connect with other proactive dog owners\n".
      "👉 Join the WoafyPet Community: ".$discordUrl."\n\n".
      "Questions? ".$supportEmail."\n\n".
      "With care,\n".
      "The WoafyPet Team 🐾\n";

      // 注意：你的 _mail.php 里 resend_send_email 的参数签名要匹配
      $emailSent = resend_send_email($email, $subject, $html, $text, $from);

    } catch (Throwable $e) {
      error_log("waitlist_email_error: " . $e->getMessage());
    }
  } else {
    error_log("waitlist_email_skip: RESEND_API_KEY missing");
  }
}

http_response_code(200);
echo json_encode([
  "status" => "success",
  "message" => "Saved",
  "message_en" => "Saved",
  "step" => $step,
  "email_sent" => $emailSent,
], JSON_UNESCAPED_UNICODE);
exit;
