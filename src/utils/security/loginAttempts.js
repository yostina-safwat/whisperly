import { getRedisClient, isCacheReady } from "../cache/cache.js";
import AppError from "../error/appError.js";

/**
 * Lock an account after too many wrong passwords, using Redis.
 *
 *   login:attempts:<email>  -> counter of failed tries (expires after the window)
 *   login:blocked:<email>   -> exists while the account is locked (expires = unlock)
 *
 * Both keys use TTL, so nothing has to be cleaned up by hand.
 */
const MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS) || 5;
const BLOCK_MINUTES = Number(process.env.LOGIN_BLOCK_MINUTES) || 15;

const attemptsKey = (email) => `login:attempts:${email.toLowerCase()}`;
const blockedKey = (email) => `login:blocked:${email.toLowerCase()}`;

// If Redis is down we just skip the lockout instead of blocking every login.
const redis = () => (isCacheReady() ? getRedisClient() : null);

/** Throw 429 if the account is currently locked. */
export const ensureNotBlocked = async (email) => {
  const client = redis();
  if (!client) return;

  const ttl = await client.ttl(blockedKey(email));
  if (ttl > 0) {
    const minutes = Math.ceil(ttl / 60);
    throw AppError.tooManyRequests(
      `Too many failed login attempts. Try again in ${minutes} minute(s)`
    );
  }
};

/** Count a wrong password; lock the account once it hits the limit. */
export const registerFailedAttempt = async (email) => {
  const client = redis();
  if (!client) return;

  const key = attemptsKey(email);
  const attempts = await client.incr(key);
  // Start the window on the first failure only.
  if (attempts === 1) await client.expire(key, BLOCK_MINUTES * 60);

  if (attempts >= MAX_ATTEMPTS) {
    await client.set(blockedKey(email), "1", "EX", BLOCK_MINUTES * 60);
    await client.del(key);
    throw AppError.tooManyRequests(
      `Too many failed login attempts. Your account is locked for ${BLOCK_MINUTES} minutes`
    );
  }

  return MAX_ATTEMPTS - attempts; // tries left
};

/** Successful login -> forget previous failures. */
export const resetAttempts = async (email) => {
  const client = redis();
  if (!client) return;
  await client.del(attemptsKey(email));
};
