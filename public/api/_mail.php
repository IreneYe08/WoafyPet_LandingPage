<?php
// _mail.php - minimal Resend sender

function resend_send_email($to, $subject, $html, $text = '', $fromOverride = null) {
  // Load config.php if present
  $config = [];
  $configPath = __DIR__ . "/config.php";
  if (file_exists($configPath)) {
    $maybe = include $configPath;
    if (is_array($maybe)) $config = $maybe;
  }

  $cfg_or = function($key, $default='') use ($config) {
    if (isset($config[$key]) && $config[$key] !== '') return $config[$key];
    $v = getenv($key);
    return ($v !== false && $v !== null && $v !== '') ? $v : $default;
  };

  $apiKey = $cfg_or("RESEND_API_KEY", "");
  if ($apiKey === "") throw new Exception("RESEND_API_KEY missing");

  $from = $fromOverride ?: $cfg_or("FROM_EMAIL", "WoafyPet <noreply@woafmeow.com>");

  $payload = [
    "from" => $from,
    "to" => [$to],
    "subject" => $subject,
    "html" => $html,
  ];
  if ($text !== '') $payload["text"] = $text;

  $ch = curl_init("https://api.resend.com/emails");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $apiKey,
    "Content-Type: application/json",
  ]);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

  $resp = curl_exec($ch);
  $err  = curl_error($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($resp === false) {
    throw new Exception("Resend curl error: " . $err);
  }
  if ($code < 200 || $code >= 300) {
    throw new Exception("Resend HTTP $code: " . $resp);
  }

  return true;
}