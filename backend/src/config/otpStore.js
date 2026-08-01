// In-memory OTP store (use Redis in production)
const otpStore = new Map();
const verifiedPhones = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const VERIFICATION_EXPIRY_MS = 10 * 60 * 1000;

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const storeOTP = (phone, otp) => {
  // A newly requested OTP invalidates an earlier verification.
  verifiedPhones.delete(phone);
  otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });
};

const verifyOTP = (phone, otp) => {
  const record = otpStore.get(phone);
  if (!record) return { valid: false, message: 'OTP not found. Please request a new one.' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  if (record.otp !== otp) return { valid: false, message: 'Invalid OTP. Please try again.' };

  otpStore.delete(phone);
  verifiedPhones.set(phone, { expiresAt: Date.now() + VERIFICATION_EXPIRY_MS });
  return { valid: true, message: 'OTP verified successfully.' };
};

const consumeVerifiedPhone = (phone) => {
  const record = verifiedPhones.get(phone);
  if (!record) return false;

  verifiedPhones.delete(phone);
  return Date.now() <= record.expiresAt;
};

module.exports = { generateOTP, storeOTP, verifyOTP, consumeVerifiedPhone };
