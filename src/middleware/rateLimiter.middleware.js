import { rateLimit } from "express-rate-limit";
import AppError from "../utils/error/appError.js";

/**
 * Rate limiting with the express-rate-limit package.
 *
 * Every limiter counts requests per IP inside a time window; once the limit
 * is reached the request is rejected with 429 through our normal error
 * handler, so the response shape stays the same as any other error.
 */
const createLimiter = ({ windowMinutes, limit, message }) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-7", // RateLimit-* headers so clients can see what's left
    legacyHeaders: false,
    handler: (_req, _res, next) => next(AppError.tooManyRequests(message)),
  });

// Whole API — generous, just stops someone hammering the server.
export const globalLimiter = createLimiter({
  windowMinutes: 15,
  limit: 200,
  message: "Too many requests from this IP, please try again later",
});

// Auth routes (login, register, otp, reset) — strict, these are what
// attackers brute force and what costs us an email each time.
export const authLimiter = createLimiter({
  windowMinutes: 15,
  limit: 20,
  message: "Too many auth requests, please try again in 15 minutes",
});

// Sending anonymous whispers — keeps one person from spamming a user.
export const messageLimiter = createLimiter({
  windowMinutes: 1,
  limit: 5,
  message: "You're sending whispers too fast, slow down a bit 🙂",
});
