import crypto from "crypto";

const OTP_EXPIRES_IN_MINUTES = Number(process.env.OTP_EXPIRES_IN_MINUTES) || 10;

/** Generate a random 6-digit numeric OTP code. */
export const generateOtpCode = () => {
  // 0–999999 padded to 6 digits.
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
};

/** Compute the OTP expiry timestamp from now. */
export const getOtpExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000);
};
