/**
 * SMS OTP — tries providers in order:
 * 1. 2Factor.in  (set TWO_FACTOR_API_KEY)
 * 2. Fast2SMS    (set FAST2SMS_API_KEY — free tier: 100 SMS/day)
 *    Sign up free: https://www.fast2sms.com
 * If neither key is set, falls back to console log (dev mode).
 */

const TWO_FACTOR_API_BASE = 'https://2factor.in/API/V1';

const normalizeIndianPhoneNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
};

const getIndianMobileNumber = (phone) => {
  const normalized = normalizeIndianPhoneNumber(phone).replace(/\D/g, '');
  if (!/^91\d{10}$/.test(normalized)) {
    throw new Error('Enter a valid 10-digit Indian mobile number.');
  }
  return normalized.slice(2);
};

// ── Provider 1: 2Factor.in ──
const sendVia2Factor = async (mobileNumber, otp) => {
  const apiKey = process.env.TWO_FACTOR_API_KEY;
  const response = await fetch(
    `${TWO_FACTOR_API_BASE}/${encodeURIComponent(apiKey)}/SMS/${mobileNumber}/${encodeURIComponent(otp)}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error(`2Factor error: ${response.status}`);
  return response.json().catch(() => ({}));
};

// ── Provider 2: Fast2SMS Quick SMS (no DLT needed, free tier 100/day) ──
// Sign up at https://www.fast2sms.com → API Keys
const sendViaFast2SMS = async (mobileNumber, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  const message = `Your OTP for Nandini Chende Kateel booking verification is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'q',          // Quick SMS — no DLT registration needed
      message,
      language: 'english',
      flash: 0,
      numbers: mobileNumber,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!data.return) throw new Error(`Fast2SMS error: ${JSON.stringify(data)}`);
  return data;
};

const sendOtp = async ({ to, otp }) => {
  const mobileNumber = getIndianMobileNumber(to);

  // Try Fast2SMS first — Quick SMS, no DLT needed, actual SMS
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const result = await sendViaFast2SMS(mobileNumber, otp);
      console.log(`✅ OTP sent via Fast2SMS to ${mobileNumber}`);
      return result;
    } catch (err) {
      console.warn(`⚠️ Fast2SMS failed: ${err.message}`);
    }
  }

  // Fallback: 2Factor.in (note: free plan may use voice call)
  if (process.env.TWO_FACTOR_API_KEY) {
    try {
      const result = await sendVia2Factor(mobileNumber, otp);
      console.log(`✅ OTP sent via 2Factor to ${mobileNumber}`);
      return result;
    } catch (err) {
      console.warn(`⚠️ 2Factor failed: ${err.message}`);
    }
  }

  // Dev fallback — log OTP to console
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📱 DEV MODE — OTP for ${mobileNumber}: ${otp}\n`);
    return { fallback: true };
  }

  throw new Error('No SMS provider configured. Set FAST2SMS_API_KEY or TWO_FACTOR_API_KEY in .env');
};

module.exports = { normalizeIndianPhoneNumber, sendOtp };
