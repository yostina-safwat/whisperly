import bcrypt from "bcryptjs";

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

/** Hash a plain value (password or OTP) with bcrypt. */
export const hashValue = async (plain) => {
  return bcrypt.hash(String(plain), SALT_ROUNDS);
};

/** Compare a plain value against a stored bcrypt hash. */
export const compareValue = async (plain, hashed) => {
  return bcrypt.compare(String(plain), hashed);
};
