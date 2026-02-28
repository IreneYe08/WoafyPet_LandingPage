<?php
// public/api/config.php
// Use environment variables in production. Do not commit real secrets.

return [
  // ===== Resend =====
  "RESEND_API_KEY" => getenv("RESEND_API_KEY") ?: "",
  "RESEND_FROM"    => getenv("RESEND_FROM") ?: "WoafyPet <noreply@woafmeow.com>",
  "SUPPORT_EMAIL"  => getenv("SUPPORT_EMAIL") ?: "support@woafmeow.com",

  // ===== Stripe =====
  "STRIPE_SECRET_KEY"     => getenv("STRIPE_SECRET_KEY") ?: "",
  "STRIPE_WEBHOOK_SECRET" => getenv("STRIPE_WEBHOOK_SECRET") ?: "",

  //  1.99 订金 Payment Link 的 ID
  "VIP_PAYMENT_LINK_ID" => getenv("VIP_PAYMENT_LINK_ID") ?: "",

  // 50% off 的 coupon id（用于生成 promotion code）
  "VIP_COUPON_ID" => getenv("VIP_COUPON_ID") ?: "",

  // 折扣码规则
  "PROMO_PREFIX" => getenv("PROMO_PREFIX") ?: "WOAFY",
  "PROMO_EXPIRES_DAYS" => (int)(getenv("PROMO_EXPIRES_DAYS") ?: "365"),

  // ===== Lark internal notification =====
  "LARK_BOT_WEBHOOK_URL" => getenv("LARK_BOT_WEBHOOK_URL") ?: "",
  "LARK_NOTIFY_PREFIX"  => getenv("LARK_NOTIFY_PREFIX") ?: "[woafmeow.com]",
  "LARK_NOTIFY_WAITLIST"=> getenv("LARK_NOTIFY_WAITLIST") ?: "1",
  "LARK_NOTIFY_PAYMENT" => getenv("LARK_NOTIFY_PAYMENT") ?: "1",
];
