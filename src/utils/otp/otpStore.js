import { getRedisClient } from "../cache/cache.js";
import AppError from "../error/appError.js";
import { hashValue, compareValue } from "../security/hash.js";
import { OTP_TTL_SECONDS } from "./otp.js";

/**
 * OTP store — keeps verification codes in Redis instead of MongoDB.
 *
 * Why Redis?
 *  - OTPs are short-lived, throwaway data; they don't belong in our main DB.
 *  - Redis gives us a built-in TTL: with SET ... EX <seconds> the key is
 *    deleted automatically once it expires, so we never store stale codes
 *    and don't need a cleanup job.
 *
 * Each code is namespaced by its type and email, e.g.
 *   otp:confirmEmail:someone@example.com
 * so a user can have a confirm-email code and a reset-password code at once
 * without them clashing.
 */
const buildKey = (type, email) => `otp:${type}:${String(email).toLowerCase()}`;

/**
 * Save a freshly generated code. We store the bcrypt hash, never the plain
 * code, and attach the TTL so Redis expires it for us.
 */
export const saveOtp = async ({ email, type, code }) => {
  const client = getRedisClient();
  const key = buildKey(type, email);
  const hashed = await hashValue(code);

  // "EX" sets the expiry (in seconds) atomically with the value. Writing the
  // key again (e.g. on resend) simply overwrites the old code and resets the
  // countdown, so only the latest code is ever valid.
  await client.set(key, hashed, "EX", OTP_TTL_SECONDS);
};

/**
 * Verify a submitted code and consume it on success (one-time use).
 * If the key is missing, the code either never existed or Redis already
 * expired it — either way the user needs a new one.
 */
export const consumeOtp = async ({ email, type, code }) => {
  const client = getRedisClient();
  const key = buildKey(type, email);

  const hashed = await client.get(key);
  if (!hashed) {
    throw AppError.badRequest("Code expired or not found, please request a new one");
  }

  const match = await compareValue(code, hashed);
  if (!match) {
    throw AppError.badRequest("Invalid verification code");
  }

  await client.del(key); // burn it so the same code can't be reused
};
