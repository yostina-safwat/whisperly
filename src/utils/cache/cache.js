import Redis from "ioredis";
import logger from "../logger/logger.js";

/**
 * Cache — a thin wrapper around a Redis client.
 *
 * Designed to degrade gracefully: if REDIS_URL is not set or Redis is
 * unreachable, the app keeps working and every cache call becomes a no-op.
 * This way caching is an optimisation, never a hard dependency.
 */
const DEFAULT_TTL = Number(process.env.CACHE_TTL_SECONDS) || 60;

let client = null;
let ready = false;

export const initCache = () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn("REDIS_URL not set — caching is disabled");
    return;
  }

  client = new Redis(url, {
    lazyConnect: false,
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
  });

  client.on("ready", () => {
    ready = true;
    logger.info("Redis cache connected ✅");
  });
  client.on("error", (err) => {
    ready = false;
    logger.error(`Redis error: ${err.message}`);
  });
  client.on("end", () => {
    ready = false;
  });
};

export const isCacheReady = () => ready;

export const cacheGet = async (key) => {
  if (!ready) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error(`cacheGet failed for ${key}: ${error.message}`);
    return null;
  }
};

export const cacheSet = async (key, value, ttl = DEFAULT_TTL) => {
  if (!ready) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttl);
  } catch (error) {
    logger.error(`cacheSet failed for ${key}: ${error.message}`);
  }
};

export const cacheDel = async (pattern) => {
  if (!ready) return;
  try {
    // Support simple wildcard invalidation (e.g. "user:*").
    if (pattern.includes("*")) {
      const keys = await client.keys(pattern);
      if (keys.length) await client.del(keys);
    } else {
      await client.del(pattern);
    }
  } catch (error) {
    logger.error(`cacheDel failed for ${pattern}: ${error.message}`);
  }
};

/** Close the Redis connection (used during graceful shutdown). */
export const closeCache = async () => {
  if (client) {
    await client.quit().catch(() => client.disconnect());
    ready = false;
  }
};
