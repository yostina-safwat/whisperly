import crypto from "crypto";

export const OtpTypes = {
  CONFIRM_EMAIL: "confirmEmail",
  FORGOT_PASSWORD: "forgotPassword",
};

const OTP_EXPIRES_IN_MINUTES = Number(process.env.OTP_EXPIRES_IN_MINUTES) || 10;

// How long an OTP lives, in seconds. We hand this straight to Redis as the
// key's TTL, so Redis itself deletes the code once it expires.
export const OTP_TTL_SECONDS = OTP_EXPIRES_IN_MINUTES * 60;

/** Generate a random 6-digit numeric OTP code. */
export const generateOtpCode = () => {
  // 0–999999 padded to 6 digits.
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
};
