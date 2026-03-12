<?php
/**
 * waitlist.php
 *
 * Supports:
 * 1) Standard waitlist step flow
 * 2) Newsletter popup email capture
 *
 * Changes in this version:
 * - Removed Resend auto email logic
 * - Added popup support (email-only submission)
 * - Added source / page / client_timestamp fields
 * - Keeps CSV storage, dedupe, Brevo sync, rate limit, and Lark notify
 *
 * Recommended deployment:
 *  public_html/
 *    api/
 *      waitlist.php
 *      _lark.php
 *      config.php
 *    data/
 *      waitlist.csv
 *      ratelimit/
 *
 * Response JSON:
 * { status: "success"|"error", message: "...", message_en?: "...", step?: "1"|"2", source?: "popup"|"waitlist_modal"|... }
 */

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// ==================== Load config ====================
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
  "http://localhost:5173",
  "http://127.0.0.1:5173",
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
  if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
    return trim($parts[0]);
  }
  if (!empty($_SERVER['HTTP_X_REAL_IP'])) return trim($_SERVER['HTTP_X_REAL_IP']);
  return '0.0.0.0';
}

function data_dir() {
  $root = realpath(__DIR__ . "/..");
  if ($root === false) $root = dirname(__DIR__);
  $dir = $root . "/data";
  if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
  }
  return $dir;
}

// ==================== Rate Limit ====================
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
  if (!$fp) return;

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

  $ts = [];
  foreach ($data['ts'] as $t) {
    if (is_int($t) || ctype_digit((string)$t)) {
      $t = (int)$t;
      if ($now - $t < $windowSeconds) $ts[] = $t;
    }
  }

  if (count($ts) >= $limit) {
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

// ==================== Determine source / mode ====================
$source = strtolower(clean_str($data['source'] ?? ''));
$source = clamp_len($source, 60);

$page = clean_str($data['page'] ?? '');
$page = clamp_len($page, 120);

$clientTimestamp = clean_str($data['timestamp'] ?? '');
$clientTimestamp = clamp_len($clientTimestamp, 50);

// popup mode: email only
$isPopup = ($source === 'popup');

// Step
$step = (string)($data['step'] ?? '1');
if (!$isPopup && $step !== '1' && $step !== '2') {
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

// UTM / source fields
$utm_source   = clean_str($data['utm_source'] ?? ($_GET['utm_source'] ?? ''));
$utm_campaign = clean_str($data['utm_campaign'] ?? ($_GET['utm_campaign'] ?? ''));
$utm_medium   = clean_str($data['utm_medium'] ?? ($_GET['utm_medium'] ?? ''));
$utm_content  = clean_str($data['utm_content'] ?? ($_GET['utm_content'] ?? ''));
$utm_term     = clean_str($data['utm_term'] ?? ($_GET['utm_term'] ?? ''));

$referrer = clean_str($data['referrer'] ?? ($_SERVER['HTTP_REFERER'] ?? ''));

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

// ==================== Validation by mode ====================
// Popup: email only
if ($isPopup) {
  // nothing else required
} else {
  // Step 1 standard waitlist validation
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
}

// ==================== CSV storage ====================
$csvFile = data_dir() . "/waitlist.csv";

$headers = [
  "email",
  "name",
  "consent",
  "pets",
  "source",
  "page",
  "client_timestamp",
  "utm_source",
  "utm_campaign",
  "utm_medium",
  "utm_content",
  "utm_term",
  "referrer",
  "ip",
  "created_at",
  "updated_at"
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
  if ($lineNum === 1) continue;
  if (!is_array($row) || count($row) < 1) continue;

  // Backward compatibility with older CSV
  $row = array_pad($row, count($headers), "");

  $rows[] = [
    "email" => $row[0] ?? "",
    "name" => $row[1] ?? "",
    "consent" => $row[2] ?? "",
    "pets" => $row[3] ?? "",
    "source" => $row[4] ?? "",
    "page" => $row[5] ?? "",
    "client_timestamp" => $row[6] ?? "",
    "utm_source" => $row[7] ?? "",
    "utm_campaign" => $row[8] ?? "",
    "utm_medium" => $row[9] ?? "",
    "utm_content" => $row[10] ?? "",
    "utm_term" => $row[11] ?? "",
    "referrer" => $row[12] ?? "",
    "ip" => $row[13] ?? "",
    "created_at" => $row[14] ?? "",
    "updated_at" => $row[15] ?? "",
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

function merge_source_fields(
  &$target,
  $source,
  $page,
  $clientTimestamp,
  $utm_source,
  $utm_campaign,
  $utm_medium,
  $utm_content,
  $utm_term,
  $referrer,
  $ip
) {
  if ($source !== "")          $target["source"] = $source;
  if ($page !== "")            $target["page"] = $page;
  if ($clientTimestamp !== "") $target["client_timestamp"] = $clientTimestamp;
  if ($utm_source !== "")      $target["utm_source"] = $utm_source;
  if ($utm_campaign !== "")    $target["utm_campaign"] = $utm_campaign;
  if ($utm_medium !== "")      $target["utm_medium"] = $utm_medium;
  if ($utm_content !== "")     $target["utm_content"] = $utm_content;
  if ($utm_term !== "")        $target["utm_term"] = $utm_term;
  if ($referrer !== "")        $target["referrer"] = $referrer;
  if ($ip !== "")              $target["ip"] = $ip;
}

$isNewRow = false;

// Create or update row
if ($foundIndex === -1) {
  $isNewRow = true;

  $rows[] = [
    "email" => $email,
    "name" => (!$isPopup && $step === '1') ? $name : "",
    "consent" => (!$isPopup && $step === '1' && $consentBool) ? "Yes" : ($isPopup ? "Newsletter" : "No"),
    "pets" => (!$isPopup && $step === '2' && $pets !== "") ? $pets : "",
    "source" => $source,
    "page" => $page,
    "client_timestamp" => $clientTimestamp,
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

  if ($isPopup) {
    // popup should not overwrite name / pets
    if ($existing["consent"] === "") {
      $existing["consent"] = "Newsletter";
    }
  } else {
    if ($step === '1') {
      $existing["name"] = $name;
      $existing["consent"] = $consentBool ? "Yes" : "No";
    } else {
      if ($pets !== "") $existing["pets"] = $pets;
    }
  }

  merge_source_fields(
    $existing,
    $source,
    $page,
    $clientTimestamp,
    $utm_source,
    $utm_campaign,
    $utm_medium,
    $utm_content,
    $utm_term,
    $referrer,
    clamp_len(clean_str($clientIp), 80)
  );

  if ($existing["created_at"] === "") $existing["created_at"] = $now;
  $existing["updated_at"] = $now;

  $rows[$foundIndex] = $existing;
}

// Rewrite file
rewind($fp);
ftruncate($fp, 0);
fputcsv($fp, $headers);

foreach ($rows as $r) {
  fputcsv($fp, [
    $r["email"],
    $r["name"],
    $r["consent"],
    $r["pets"],
    $r["source"],
    $r["page"],
    $r["client_timestamp"],
    $r["utm_source"],
    $r["utm_campaign"],
    $r["utm_medium"],
    $r["utm_content"],
    $r["utm_term"],
    $r["referrer"],
    $r["ip"],
    $r["created_at"],
    $r["updated_at"],
  ]);
}

fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

// ===== Lark notify =====
// Notify for:
// - standard waitlist step 1
// - popup new capture
$shouldNotifyLark = (!$isPopup && $step === '1') || $isPopup;

if ($shouldNotifyLark) {
  try {
    require_once __DIR__ . '/_lark.php';
    lark_notify_waitlist($email, $name);
  } catch (Throwable $e) {
    error_log("lark_waitlist_error: " . $e->getMessage());
  }
}

// ===== Brevo sync =====
// Sync for:
// - popup
// - standard waitlist step 1
$shouldSyncBrevo = $isPopup || (!$isPopup && $step === '1');

if ($shouldSyncBrevo) {
  $brevoApiKey = cfg_or("BREVO_API_KEY", "");
  $brevoListId = (int)cfg_or("BREVO_LIST_ID", "13");

  if ($brevoApiKey !== "" && $brevoListId > 0) {
    try {
      $attributes = [];

      if ($name !== "") {
        $attributes["FIRSTNAME"] = $name;
      }

      if ($source !== "") {
        $attributes["SOURCE"] = $source;
      }

      if ($page !== "") {
        $attributes["PAGE"] = $page;
      }

      if ($utm_source !== "")   $attributes["UTM_SOURCE"] = $utm_source;
      if ($utm_medium !== "")   $attributes["UTM_MEDIUM"] = $utm_medium;
      if ($utm_campaign !== "") $attributes["UTM_CAMPAIGN"] = $utm_campaign;

      $payload = json_encode([
        "email"         => $email,
        "attributes"    => $attributes,
        "listIds"       => [$brevoListId],
        "updateEnabled" => true,
      ], JSON_UNESCAPED_UNICODE);

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
        CURLOPT_TIMEOUT        => 10,
      ]);

      $brevoResp     = curl_exec($ch);
      $brevoHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

      if ($brevoResp === false) {
        $curlErr = curl_error($ch);
        error_log("brevo_curl_error: " . $curlErr);
      }

      curl_close($ch);

      // 201 = created, 204 = updated, 200 sometimes returned in proxy scenarios
      if (!in_array($brevoHttpCode, [200, 201, 204], true)) {
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

http_response_code(200);
echo json_encode([
  "status" => "success",
  "message" => "Saved",
  "message_en" => "Saved",
  "step" => $isPopup ? "popup" : $step,
  "source" => $source,
], JSON_UNESCAPED_UNICODE);

exit;