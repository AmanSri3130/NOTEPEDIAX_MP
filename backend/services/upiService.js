import QRCode from 'qrcode';
import crypto from 'crypto';
import { redis } from '../config/redis.js';

const UPI_VPA = process.env.UPI_VPA || 'notepediax@paytm';
const UPI_NAME = process.env.UPI_NAME || 'Notepediax Edtech';
const UPI_MERCHANT = process.env.UPI_MERCHANT_CODE || '';

// Encryption setup
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.JWT_SECRET || 'supersecretjwtkey123').digest(); // 32 bytes
const IV_LENGTH = 16;

export function encryptString(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptString(text) {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return text; // fallback to plain text if not encrypted
  }
}

// ── Generate UPI payment string ──────────────────────────
export function generateUpiString(params) {
  const { amount, orderId, txnRef, note } = params;
  const amountFormatted = amount.toFixed(2);
  const txnNote = encodeURIComponent(note || `Order ${orderId} - Notepediax`);

  return (
    `upi://pay?` +
    `pa=${UPI_VPA}` +
    `&pn=${encodeURIComponent(UPI_NAME)}` +
    `&am=${amountFormatted}` +
    `&cu=INR` +
    `&tn=${txnNote}` +
    `&tr=${txnRef}` +
    (UPI_MERCHANT ? `&mc=${UPI_MERCHANT}` : '')
  );
}

// ── Generate UPI app deep links (app-specific) ────────────
export function generateAppDeepLinks(upiString, amount) {
  const cleanString = upiString.replace('upi://pay?', '');
  const paGpay = process.env.UPI_VPA_GPAY || 'notepediax@oksbi';
  const paPhonepe = process.env.UPI_VPA_PHONEPE || 'notepediax@ybl';
  const paPaytm = process.env.UPI_VPA_PAYTM || 'notepediax@paytm';

  const gpayString = upiString.replace(`pa=${UPI_VPA}`, `pa=${paGpay}`);
  const phonepeString = upiString.replace(`pa=${UPI_VPA}`, `pa=${paPhonepe}`);
  const paytmString = upiString.replace(`pa=${UPI_VPA}`, `pa=${paPaytm}`);

  return {
    gpay: `tez://upi/pay?${gpayString.replace('upi://pay?', '')}`,
    phonepe: `phonepe://pay?${phonepeString.replace('upi://pay?', '')}`,
    paytm: `paytmmp://pay?${paytmString.replace('upi://pay?', '')}`,
    navi: `navi://pay?${upiString.replace('upi://pay?', '')}`,
    bhim: `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount.toFixed(2)}&cu=INR`,
    generic: upiString
  };
}

// ── Generate QR code as base64 (server-side only) ─────────
export async function generateUpiQR(upiString) {
  // Generates purple QR code (#6D366C)
  const qrBase64 = await QRCode.toDataURL(upiString, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
    color: { dark: '#6D366C', light: '#FFFFFF' }
  });
  return qrBase64;
}

// ── Store payment session in Redis ─────────────────────────
export async function createPaymentSession(params) {
  const sessionToken = crypto.randomUUID();
  const sessionData = JSON.stringify({
    orderId: params.orderId,
    studentId: params.studentId,
    amount: params.amount,
    upiStringHash: crypto
      .createHash('sha256')
      .update(params.upiString)
      .digest('hex'),
    createdAt: new Date().toISOString()
  });
  // expires in 10 minutes
  await redis.setEx(`payment_session:${sessionToken}`, 600, sessionData);
  return sessionToken;
}

// ── Verify session token ───────────────────────────────────
export async function getPaymentSession(token) {
  const data = await redis.get(`payment_session:${token}`);
  if (!data) return null;
  return JSON.parse(data);
}

// ── Mark session as completed ──────────────────────────────
export async function completePaymentSession(token) {
  await redis.del(`payment_session:${token}`);
}

// ── Generate order number ──────────────────────────────────
export async function generateOrderNumber() {
  const count = await redis.incr('order_counter');
  const year = new Date().getFullYear();
  return `NP-${year}-${String(count).padStart(6, '0')}`;
}

// ── Generate transaction reference ────────────────────────
export function generateTxnRef() {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN${timestamp}${random}`;
}
