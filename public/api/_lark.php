<?php
// public/api/_lark.php

function lark_cfg_or($key, $default = '') {
  // 复用你 waitlist.php 里的 cfg_or 思路：优先 config.php，其次 getenv
  static $config = null;
  if ($config === null) {
    $config = [];
    $configPath = __DIR__ . "/config.php";
    if (file_exists($configPath)) {
      $maybe = include $configPath;
      if (is_array($maybe)) $config = $maybe;
    }
  }
  if (isset($config[$key]) && $config[$key] !== '') return $config[$key];
  $v = getenv($key);
  return ($v !== false && $v !== null && $v !== '') ? $v : $default;
}

function lark_send_text($text) {
  $url = lark_cfg_or('LARK_BOT_WEBHOOK_URL', '');
  if ($url === '') return false;

  $payload = [
    "msg_type" => "text",
    "content"  => ["text" => $text],
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

/** 1) waitlist 提醒：极简 */
function lark_notify_waitlist($email, $name = '') {
  $email = trim((string)$email);
  $name  = trim((string)$name);
  $time  = date('Y-m-d H:i:s');

  $text = "✅ New Waitlist Signup\n"
        . "Email: " . ($email ?: '-') . "\n"
        . "Name: " . ($name ?: '-') . "\n"
        . "Time: " . $time;

  return lark_send_text($text);
}

/** 2) 支付提醒：极简 */
function lark_notify_paid($email, $amount, $currency, $paymentLinkId = '') {
  $email = trim((string)$email);
  $currency = strtoupper(trim((string)$currency));
  $time = date('Y-m-d H:i:s');

  // amount 通常是 cents -> 你在 webhook 里传进来时就处理成正确单位即可
  $text = "✅ New Early Bird Order\n"
        . "Email: " . ($email ?: '-') . "\n"
        . "Amount: " . ($amount !== '' ? $amount : '-') . " " . ($currency ?: '-') . "\n"
        . "Time: " . $time;

  // 可选：加一行标识 payment link
  if ($paymentLinkId) $text .= "\nLink: " . $paymentLinkId;

  return lark_send_text($text);
}