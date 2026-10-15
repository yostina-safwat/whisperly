import { cacheGet, cacheSet } from "../utils/cache/cache.js";

/**
 * withCache — caches a GET endpoint's JSON response in Redis.
 *
 * - keyBuilder(req) builds a unique cache key for the request.
 * - On a hit, the cached body is returned immediately (served: "cache").
 * - On a miss, we intercept res.json, cache the body, then send it.
 *
 * If the cache is disabled/unavailable the helpers are no-ops, so the
 * request simply runs normally.
 */
export const withCache = (keyBuilder, ttl) => {
  return async (req, res, next) => {
    const key = keyBuilder(req);

    const cached = await cacheGet(key);
    if (cached) {
      return res.status(200).json({ ...cached, served: "cache" });
    }

    // Wrap res.json so we can store the response before sending it.
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        cacheSet(key, body, ttl);
      }
      return originalJson(body);
    };

    next();
  };
};
