/**
 * server.js — WoafyPet Hostinger Node.js Server
 *
 * Replaces all PHP backend files:
 *   - waitlist.php   → POST /api/waitlist
 *   - stripe_webhook → POST /api/stripe-webhook
 *
 * Email is sent via Brevo transactional API (not Resend).
 * Stripe promo codes are generated via Stripe API.
 * Contacts are synced to Brevo list.
 * Lark bot notifications on new signup / payment.
 *
 * Requires Node.js 18+ (uses built-in fetch).
 * Set PORT env var for the listening port (Hostinger sets this automatically).
 *
 * Environment variables (set in Hostinger dashboard):
 *   BREVO_API_KEY, BREVO_LIST_ID, BREVO_FROM_EMAIL, BREVO_FROM_NAME
 *   LARK_BOT_WEBHOOK_URL
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, VIP_PAYMENT_LINK_ID
 *   VIP_COUPON_ID, PROMO_PREFIX, PROMO_EXPIRES_DAYS
 *   SUPPORT_EMAIL
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Config ─────────────────────────────────────────────────────────────────

function cfg(key, defaultVal = '') {
  return process.env[key] || defaultVal;
}

// ─── Allowed Origins ─────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  'https://woafy.pet',
  'https://www.woafy.pet',
  'https://woafmeow.com',
  'https://www.woafmeow.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// ─── Utilities ───────────────────────────────────────────────────────────────

function nowIso() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function cleanStr(val) {
  return String(val ?? '').replace(/[\r\n\t|]/g, ' ').replace(/\s+/g, ' ').trim();
}

function clampLen(val, max) {
  const s = String(val ?? '');
  return s.length > max ? s.substring(0, max) : s;
}

function getClientIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  );
}

// ─── Rate Limiting (in-memory) ───────────────────────────────────────────────

const rateLimitMap = new Map();

function checkRateLimit(ip, limit = 3, windowMs = 60_000) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= limit) return false;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

// ─── CSV Helpers ─────────────────────────────────────────────────────────────

function dataDir() {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Async mutex per file so concurrent requests don't corrupt CSV
const csvMutexes = new Map();

async function withFileLock(name, fn) {
  while (csvMutexes.has(name)) {
    await csvMutexes.get(name);
  }
  let release;
  const lock = new Promise(r => { release = r; });
  csvMutexes.set(name, lock);
  try {
    return await fn();
  } finally {
    csvMutexes.delete(name);
    release();
  }
}

function csvEscape(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function readCsv(filePath, headers) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(l => l.trim());
  if (lines.length <= 1) return [];
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
    return row;
  });
}

function writeCsv(filePath, headers, rows) {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => csvEscape(row[h] ?? '')).join(','));
  }
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
}

// ─── Lark Notify ─────────────────────────────────────────────────────────────

async function larkSendText(text) {
  const url = cfg('LARK_BOT_WEBHOOK_URL');
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg_type: 'text', content: { text } }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error('lark_error:', e.message);
  }
}

async function larkNotifyWaitlist(email, name) {
  const text = `✅ New Waitlist Signup\nEmail: ${email || '-'}\nName: ${name || '-'}\nTime: ${nowIso()}`;
  return larkSendText(text);
}

async function larkNotifyPaid(email, amountHuman, currency) {
  const text = `✅ New Early Bird Order\nEmail: ${email || '-'}\nAmount: ${amountHuman} ${currency}\nTime: ${nowIso()}`;
  return larkSendText(text);
}

// ─── Brevo ───────────────────────────────────────────────────────────────────

async function brevoSyncContact(email, attributes = {}) {
  const apiKey = cfg('BREVO_API_KEY');
  const listId = parseInt(cfg('BREVO_LIST_ID', '13'), 10);
  if (!apiKey || !listId) {
    console.error('brevo_skip: BREVO_API_KEY or BREVO_LIST_ID not set');
    return;
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, attributes, listIds: [listId], updateEnabled: true }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) console.error('brevo_sync_error:', res.status, await res.text());
  } catch (e) {
    console.error('brevo_sync_exception:', e.message);
  }
}

async function brevoSendEmail(toEmail, toName, subject, htmlContent, textContent = '') {
  const apiKey = cfg('BREVO_API_KEY');
  if (!apiKey) throw new Error('BREVO_API_KEY missing');

  const payload = {
    sender: {
      name: cfg('BREVO_FROM_NAME', 'WoafyPet'),
      email: cfg('BREVO_FROM_EMAIL', 'noreply@woafmeow.com'),
    },
    to: [{ email: toEmail, name: toName || toEmail }],
    subject,
    htmlContent,
  };
  if (textContent) payload.textContent = textContent;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo email ${res.status}: ${body}`);
  }
  return true;
}

// ─── Stripe Helpers ───────────────────────────────────────────────────────────

function stripeVerifySignature(rawBody, sigHeader, secret) {
  if (!sigHeader) return false;
  const parts = sigHeader.split(',');
  let timestamp = null;
  const signatures = [];

  for (const part of parts) {
    const [k, v] = part.trim().split('=');
    if (k === 't') timestamp = v;
    if (k === 'v1') signatures.push(v);
  }
  if (!timestamp || !signatures.length) return false;

  const tolerance = 300;
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > tolerance) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return signatures.some(sig => {
    try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)); } catch { return false; }
  });
}

async function stripePost(path, fields) {
  const secretKey = cfg('STRIPE_SECRET_KEY');
  const body = Object.entries(fields)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    signal: AbortSignal.timeout(15000),
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

async function stripeGet(path) {
  const secretKey = cfg('STRIPE_SECRET_KEY');
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    signal: AbortSignal.timeout(15000),
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, json };
}

function generatePromoCode(prefix) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = n => Array.from({ length: n }, () => alphabet[crypto.randomInt(0, alphabet.length)]).join('');
  return `${prefix.toUpperCase()}-${pick(4)}-${pick(4)}`;
}

// ─── Promo Email Template ─────────────────────────────────────────────────────

function buildPromoEmailHtml(name, promoCode, expiresDate) {
  const safeName = (name || 'there').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const safeCode = promoCode.replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const supportEmail = cfg('SUPPORT_EMAIL', 'support@woafmeow.com');

  return `
<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.55;color:#1B1B1B">
  <h2 style="margin:0 0 12px 0">Hi ${safeName} 👋</h2>
  <p style="margin:0 0 12px 0">
    Thanks for your VIP reservation deposit. Here is your <b>50% OFF</b> code:
  </p>
  <div style="margin:14px 0 18px 0;padding:14px 16px;border:1px solid #eee;border-radius:12px;background:#fafafa">
    <div style="font-size:12px;color:#666;margin-bottom:6px">Your code</div>
    <div style="font-size:22px;letter-spacing:1px;font-weight:700">${safeCode}</div>
    <div style="font-size:12px;color:#666;margin-top:8px">Expires: ${expiresDate}</div>
  </div>
  <p style="margin:0 0 10px 0">
    <b>How it works</b><br/>
    • This code is <b>one-time use</b> (max 1 redemption).<br/>
    • Use it at checkout on our official purchase page.<br/>
    • If your deposit is refunded, this code will be automatically disabled.
  </p>
  <p style="margin:14px 0 0 0">
    Questions? Email <a href="mailto:${supportEmail}">${supportEmail}</a>.
  </p>
  <p style="margin:18px 0 0 0;font-size:12px;color:#666">
    You're receiving this because you completed a VIP reservation deposit on woafmeow.com.
  </p>
</div>`;
}

function buildPromoEmailText(name, promoCode, expiresDate) {
  const supportEmail = cfg('SUPPORT_EMAIL', 'support@woafmeow.com');
  return `Hi ${name || 'there'},\n\nThanks for your VIP reservation deposit. Here is your 50% OFF code:\n\n${promoCode}\nExpires: ${expiresDate}\n\nHow it works:\n- One-time use (max 1 redemption)\n- Use at checkout on our official purchase page\n- If your deposit is refunded, this code will be disabled\n\nSupport: ${supportEmail}\n`;
}

// ─── Stripe Webhook (needs raw body — registered BEFORE json middleware) ──────

const CODES_HEADERS = [
  'created_at', 'email', 'name', 'session_id', 'payment_intent', 'charge_id',
  'amount_total', 'currency', 'payment_link_id', 'coupon_id',
  'promotion_code', 'promotion_code_id', 'status', 'refunded_at', 'refund_reason', 'email_sent_at',
];

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const rawBody = req.body.toString('utf8');
  const sigHeader = req.headers['stripe-signature'];
  const webhookSecret = cfg('STRIPE_WEBHOOK_SECRET');
  const secretKey = cfg('STRIPE_SECRET_KEY');
  const vipPaymentLinkId = cfg('VIP_PAYMENT_LINK_ID');
  const vipCouponId = cfg('VIP_COUPON_ID');

  if (!secretKey || !webhookSecret || !vipPaymentLinkId || !vipCouponId) {
    return res.status(500).json({ status: 'error', message: 'Missing config' });
  }

  if (!stripeVerifySignature(rawBody, sigHeader, webhookSecret)) {
    return res.status(400).json({ status: 'error', message: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ status: 'error', message: 'Invalid JSON' });
  }

  const type = event.type;
  const obj = event.data?.object;
  const codesFile = path.join(dataDir(), 'codes.csv');

  // ── checkout.session.completed ────────────────────────────────────────────
  if (type === 'checkout.session.completed') {
    if (!obj) return res.json({ status: 'ok' });

    if (obj.payment_status !== 'paid') {
      return res.json({ status: 'ignored', reason: 'not_paid' });
    }
    if (obj.payment_link !== vipPaymentLinkId) {
      return res.json({ status: 'ignored', reason: 'not_target_payment_link' });
    }

    const sessionId = obj.id ?? '';
    const paymentIntent = obj.payment_intent ?? '';
    const amountTotal = obj.amount_total ?? 0;
    const currency = (obj.currency ?? '').toUpperCase();
    const name = cleanStr(obj.customer_details?.name ?? '');
    const email = cleanStr(obj.customer_details?.email ?? '').toLowerCase();

    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      console.error('stripe_webhook: missing email for session', sessionId);
      return res.json({ status: 'ok', note: 'missing_email' });
    }

    // Lark notify
    try {
      const amountHuman = amountTotal ? (amountTotal / 100).toFixed(2) : '-';
      await larkNotifyPaid(email, amountHuman, currency);
    } catch (e) {
      console.error('lark_paid_error:', e.message);
    }

    // Get charge ID from payment intent
    let chargeId = '';
    try {
      const { ok, json: piJson } = await stripeGet(`/payment_intents/${paymentIntent}`);
      if (ok && piJson.latest_charge) chargeId = piJson.latest_charge;
    } catch (e) {
      console.error('stripe_get_charge_error:', e.message);
    }

    await withFileLock('codes.csv', async () => {
      const rows = readCsv(codesFile, CODES_HEADERS);

      // Idempotency: skip if already processed
      const existing = rows.find(r => r.session_id === sessionId);
      if (existing?.promotion_code) return;

      // Generate promo code (retry on collision)
      const prefix = cfg('PROMO_PREFIX', 'WOAFY');
      const expiresDays = parseInt(cfg('PROMO_EXPIRES_DAYS', '365'), 10);
      const expiresAt = Math.floor(Date.now() / 1000) + expiresDays * 86400;
      const expiresDate = new Date(expiresAt * 1000).toISOString().substring(0, 10);

      let promoCode = '';
      let promoId = '';
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = generatePromoCode(prefix);
        const { ok, json: promo } = await stripePost('/promotion_codes', {
          coupon: vipCouponId,
          code,
          max_redemptions: 1,
          expires_at: expiresAt,
          active: 'true',
          'metadata[source]': 'vip_deposit',
          'metadata[session_id]': sessionId,
          'metadata[email]': email,
        });
        if (ok && promo.id) {
          promoCode = code;
          promoId = promo.id;
          break;
        }
        const errMsg = JSON.stringify(promo);
        if (!errMsg.includes('already exists')) {
          console.error('stripe_create_promo_failed:', errMsg);
          break;
        }
      }

      if (!promoCode) return;

      // Save to CSV
      const row = {
        created_at: nowIso(), email, name, session_id: sessionId,
        payment_intent: String(paymentIntent), charge_id: chargeId,
        amount_total: String(amountTotal), currency,
        payment_link_id: vipPaymentLinkId, coupon_id: vipCouponId,
        promotion_code: promoCode, promotion_code_id: promoId,
        status: 'active', refunded_at: '', refund_reason: '', email_sent_at: '',
      };

      const idx = rows.findIndex(r => r.session_id === sessionId);
      if (idx === -1) rows.push(row);
      else rows[idx] = { ...rows[idx], ...row };
      writeCsv(codesFile, CODES_HEADERS, rows);

      // Send email via Brevo
      try {
        const html = buildPromoEmailHtml(name, promoCode, expiresDate);
        const text = buildPromoEmailText(name, promoCode, expiresDate);
        await brevoSendEmail(email, name, 'Your WoafyPet 50% OFF code', html, text);

        // Mark email_sent_at
        const rows2 = readCsv(codesFile, CODES_HEADERS);
        const idx2 = rows2.findIndex(r => r.session_id === sessionId);
        if (idx2 !== -1) {
          rows2[idx2].email_sent_at = nowIso();
          writeCsv(codesFile, CODES_HEADERS, rows2);
        }
      } catch (e) {
        console.error('brevo_email_failed:', e.message);
      }
    });

    return res.json({ status: 'ok' });
  }

  // ── charge.refunded ────────────────────────────────────────────────────────
  if (type === 'charge.refunded' || type === 'charge.refund.updated') {
    if (!obj) return res.json({ status: 'ok' });

    const chargeId = obj.id ?? '';
    const paymentIntent = obj.payment_intent ?? '';

    await withFileLock('codes.csv', async () => {
      const rows = readCsv(codesFile, CODES_HEADERS);
      const idx = rows.findIndex(r =>
        (paymentIntent && r.payment_intent === paymentIntent) ||
        (chargeId && r.charge_id === chargeId)
      );

      if (idx === -1) return;

      const promoId = rows[idx].promotion_code_id;
      if (promoId) {
        try {
          await stripePost(`/promotion_codes/${promoId}`, { active: 'false' });
        } catch (e) {
          console.error('stripe_deactivate_promo_error:', e.message);
        }
      }

      rows[idx].status = 'refunded';
      rows[idx].refunded_at = nowIso();
      rows[idx].refund_reason = 'stripe_refund_event';
      writeCsv(codesFile, CODES_HEADERS, rows);
    });

    return res.json({ status: 'ok' });
  }

  res.json({ status: 'ok', ignored: type });
});

// ─── JSON Middleware (after raw body route) ────────────────────────────────────

app.use(express.json({ limit: '1mb' }));

// ─── CORS ─────────────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ─── Waitlist API ─────────────────────────────────────────────────────────────

const WAITLIST_HEADERS = [
  'email', 'name', 'consent', 'pets', 'source', 'page', 'client_timestamp',
  'utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term',
  'referrer', 'ip', 'created_at', 'updated_at',
];

app.post('/api/waitlist', async (req, res) => {
  // Rate limit
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 3, 60_000)) {
    return res.status(429).json({
      status: 'error',
      message: '操作过于频繁，请稍后再试',
      message_en: 'Too many attempts. Please try again later.',
    });
  }

  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ status: 'error', message: 'Invalid JSON', message_en: 'Invalid JSON' });
  }

  const source = clampLen(cleanStr(data.source ?? '').toLowerCase(), 60);
  const isPopup = source === 'popup';
  const step = String(data.step ?? '1');

  if (!isPopup && step !== '1' && step !== '2') {
    return res.status(400).json({ status: 'error', message: 'Invalid step', message_en: 'Invalid step' });
  }

  const email = clampLen(cleanStr(data.email ?? '').toLowerCase(), 200);
  const name = clampLen(cleanStr(data.name ?? ''), 120);
  const pets = clampLen(cleanStr(data.pets ?? ''), 800);
  const consentBool = Boolean(data.consent);
  const page = clampLen(cleanStr(data.page ?? ''), 120);
  const clientTimestamp = clampLen(cleanStr(data.timestamp ?? ''), 50);
  const utmSource = clampLen(cleanStr(data.utm_source ?? ''), 120);
  const utmCampaign = clampLen(cleanStr(data.utm_campaign ?? ''), 120);
  const utmMedium = clampLen(cleanStr(data.utm_medium ?? ''), 120);
  const utmContent = clampLen(cleanStr(data.utm_content ?? ''), 200);
  const utmTerm = clampLen(cleanStr(data.utm_term ?? ''), 120);
  const referrer = clampLen(cleanStr(data.referrer ?? ''), 500);

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      status: 'error',
      message: '邮箱格式不正确',
      message_en: 'Invalid email format',
    });
  }

  // Step 1 validation
  if (!isPopup && step === '1') {
    if (!name) {
      return res.status(400).json({ status: 'error', message: '请填写姓名', message_en: 'Name missing' });
    }
    if (!consentBool) {
      return res.status(400).json({ status: 'error', message: '请勾选同意接收更新', message_en: 'Consent required' });
    }
  }

  const waitlistFile = path.join(dataDir(), 'waitlist.csv');
  const now = nowIso();
  const clientIp = clampLen(cleanStr(ip), 80);

  try {
    await withFileLock('waitlist.csv', async () => {
      const rows = readCsv(waitlistFile, WAITLIST_HEADERS);
      const idx = rows.findIndex(r => r.email === email);

      if (idx === -1) {
        rows.push({
          email,
          name: (!isPopup && step === '1') ? name : '',
          consent: isPopup ? 'Newsletter' : (step === '1' && consentBool ? 'Yes' : 'No'),
          pets: (!isPopup && step === '2' && pets) ? pets : '',
          source, page, client_timestamp: clientTimestamp,
          utm_source: utmSource, utm_campaign: utmCampaign, utm_medium: utmMedium,
          utm_content: utmContent, utm_term: utmTerm, referrer,
          ip: clientIp, created_at: now, updated_at: now,
        });
      } else {
        const existing = rows[idx];
        if (isPopup) {
          if (!existing.consent) existing.consent = 'Newsletter';
        } else if (step === '1') {
          existing.name = name;
          existing.consent = consentBool ? 'Yes' : 'No';
        } else if (step === '2' && pets) {
          existing.pets = pets;
        }
        if (source) existing.source = source;
        if (page) existing.page = page;
        if (utmSource) existing.utm_source = utmSource;
        if (utmCampaign) existing.utm_campaign = utmCampaign;
        if (utmMedium) existing.utm_medium = utmMedium;
        if (utmContent) existing.utm_content = utmContent;
        if (utmTerm) existing.utm_term = utmTerm;
        if (referrer) existing.referrer = referrer;
        if (clientIp) existing.ip = clientIp;
        if (!existing.created_at) existing.created_at = now;
        existing.updated_at = now;
        rows[idx] = existing;
      }

      writeCsv(waitlistFile, WAITLIST_HEADERS, rows);
    });
  } catch (e) {
    console.error('waitlist_save_error:', e.message);
    return res.status(500).json({
      status: 'error',
      message: '保存失败，请稍后再试',
      message_en: 'Failed to save. Please try again.',
    });
  }

  // Brevo sync + Lark notify (non-blocking)
  const shouldSyncBrevo = isPopup || (!isPopup && step === '1');
  if (shouldSyncBrevo) {
    const attrs = {};
    if (name) attrs.FIRSTNAME = name;
    if (source) attrs.SOURCE = source;
    if (page) attrs.PAGE = page;
    if (utmSource) attrs.UTM_SOURCE = utmSource;
    if (utmMedium) attrs.UTM_MEDIUM = utmMedium;
    if (utmCampaign) attrs.UTM_CAMPAIGN = utmCampaign;

    brevoSyncContact(email, attrs).catch(e => console.error('brevo_sync_error:', e.message));
    larkNotifyWaitlist(email, name).catch(e => console.error('lark_waitlist_error:', e.message));
  }

  res.json({
    status: 'success',
    message: 'Saved',
    message_en: 'Saved',
    step: isPopup ? 'popup' : step,
    source,
  });
});

// ─── Static Files + SPA Fallback ─────────────────────────────────────────────

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, {
  maxAge: '1y',
  setHeaders(res, filePath) {
    // Don't cache index.html so users always get latest
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
}));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`WoafyPet server running on port ${PORT}`);
});
