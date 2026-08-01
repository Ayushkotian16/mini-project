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

const sendOtp = async ({ to, otp }) => {
  const apiKey = process.env.TWO_FACTOR_API_KEY;
  if (!apiKey) {
    throw new Error('OTP is not configured. Set TWO_FACTOR_API_KEY in the root .env file.');
  }

  const phoneNumber = getIndianMobileNumber(to);
  const response = await fetch(
    `${TWO_FACTOR_API_BASE}/${encodeURIComponent(apiKey)}/SMS/${phoneNumber}/${encodeURIComponent(otp)}`,
    { method: 'POST' }
  );

  if (!response.ok) {
    throw new Error(`2Factor OTP provider error: ${response.status} ${await response.text()}`);
  }

  return response.json().catch(() => ({}));
};

module.exports = { normalizeIndianPhoneNumber, sendOtp };
