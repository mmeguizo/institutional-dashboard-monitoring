/**
 * Redis Cache Utility
 * Provides caching layer for high-traffic API endpoints
 * 
 * Configuration:
 * - REDIS_URL: Redis connection URL (default: redis://localhost:6379)
 * - CACHE_TTL: Default cache TTL in seconds (default: 300 = 5 minutes)
 * - REDIS_ENABLED: Set to 'true' to enable Redis (default: false)
 */

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes default
  ttl: {
    departments: 600,      // 10 minutes - rarely changes
    users: 300,            // 5 minutes
    goalsDashboard: 60,    // 1 minute - dashboard needs fresher data
    goalsViewTable: 120,   // 2 minutes
    notifications: 30,     // 30 seconds - needs to be fresh
  },
  prefixes: {
    departments: "dept:",
    users: "user:",
    goals: "goal:",
    notifications: "notif:",
    dashboard: "dash:",
  },
};

// Redis client singleton
let redisClient = null;
let isRedisConnected = false;
let redisInitialized = false;

/**
 * Initialize Redis connection
 * Only attempts connection if REDIS_ENABLED=true
 * @returns {Promise<boolean>} Connection status
 */
async function initRedis() {
  // Skip if already initialized or Redis not enabled
  if (redisInitialized) return isRedisConnected;
  redisInitialized = true;
  
  // Check if Redis is explicitly enabled
  const redisEnabled = process.env.REDIS_ENABLED === "true";
  if (!redisEnabled) {
    console.log("📝 Redis caching disabled (set REDIS_ENABLED=true to enable)");
    return false;
  }

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  try {
    const Redis = require("ioredis");
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        // Stop retrying after 3 attempts
        if (times > 3) {
          console.log("📝 Redis connection failed after 3 attempts - caching disabled");
          return null; // Stop retrying
        }
        return Math.min(times * 100, 1000); // Retry delay
      },
      enableReadyCheck: true,
      connectTimeout: 3000,
      lazyConnect: true,
      enableOfflineQueue: false, // Don't queue commands when disconnected
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected");
      isRedisConnected = true;
    });

    redisClient.on("error", (err) => {
      // Only log once, not on every retry
      if (isRedisConnected) {
        console.warn("⚠️ Redis connection lost");
      }
      isRedisConnected = false;
    });

    redisClient.on("close", () => {
      isRedisConnected = false;
    });

    await redisClient.connect();
    return true;
  } catch (error) {
    console.log("📝 Redis unavailable - running without cache");
    isRedisConnected = false;
    redisClient = null;
    return false;
  }
}

/**
 * Get cache key with prefix
 * @param {string} prefix - Cache prefix
 * @param {string} key - Cache key
 * @returns {string} Full cache key
 */
function getCacheKey(prefix, key) {
  return `${prefix}${key}`;
}

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached data or null
 */
async function getCache(key) {
  if (!isRedisConnected || !redisClient) return null;

  try {
    const data = await redisClient.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.warn("⚠️ Cache get error:", error.message);
    return null;
  }
}

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - TTL in seconds
 * @returns {Promise<boolean>} Success status
 */
async function setCache(key, data, ttl = CACHE_CONFIG.defaultTTL) {
  if (!isRedisConnected || !redisClient) return false;

  try {
    await redisClient.setex(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("⚠️ Cache set error:", error.message);
    return false;
  }
}

/**
 * Delete cache by key
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
async function deleteCache(key) {
  if (!isRedisConnected || !redisClient) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.warn("⚠️ Cache delete error:", error.message);
    return false;
  }
}

/**
 * Delete cache by pattern
 * @param {string} pattern - Cache pattern (e.g., "dept:*")
 * @returns {Promise<boolean>} Success status
 */
async function deleteCacheByPattern(pattern) {
  if (!isRedisConnected || !redisClient) return false;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    return true;
  } catch (error) {
    console.warn("⚠️ Cache pattern delete error:", error.message);
    return false;
  }
}

/**
 * Clear all cache
 * @returns {Promise<boolean>} Success status
 */
async function clearAllCache() {
  if (!isRedisConnected || !redisClient) return false;

  try {
    await redisClient.flushdb();
    return true;
  } catch (error) {
    console.warn("⚠️ Cache flush error:", error.message);
    return false;
  }
}

/**
 * Cache middleware factory
 * Creates Express middleware for caching responses
 * @param {string} keyPrefix - Cache key prefix
 * @param {number} ttl - TTL in seconds
 * @param {Function} keyGenerator - Function to generate cache key from request
 * @returns {Function} Express middleware
 */
function cacheMiddleware(keyPrefix, ttl, keyGenerator = null) {
  return async (req, res, next) => {
    // Skip cache if disabled or Redis not connected
    if (!isRedisConnected || req.query.noCache === "true") {
      return next();
    }

    // Generate cache key
    const baseKey = keyGenerator ? keyGenerator(req) : req.originalUrl;
    const cacheKey = getCacheKey(keyPrefix, baseKey);

    try {
      // Try to get from cache
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        return res.json({ ...cachedData, fromCache: true });
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = async (data) => {
        // Only cache successful responses
        if (data && data.success !== false) {
          await setCache(cacheKey, data, ttl);
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.warn("⚠️ Cache middleware error:", error.message);
      next();
    }
  };
}

/**
 * Invalidate related caches when data changes
 * @param {string} entityType - Type of entity (departments, users, goals, etc.)
 * @returns {Promise<void>}
 */
async function invalidateCache(entityType) {
  const patterns = {
    departments: ["dept:*", "dash:*"],
    users: ["user:*", "dash:*"],
    goals: ["goal:*", "dash:*"],
    objectives: ["goal:*", "dash:*"],
    notifications: ["notif:*"],
  };

  const patternsToInvalidate = patterns[entityType] || [];
  
  for (const pattern of patternsToInvalidate) {
    await deleteCacheByPattern(pattern);
  }
}

/**
 * Get Redis connection status
 * @returns {boolean} Connection status
 */
function isConnected() {
  return isRedisConnected;
}

/**
 * Close Redis connection gracefully
 * @returns {Promise<void>}
 */
async function closeConnection() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isRedisConnected = false;
  }
}

module.exports = {
  initRedis,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
  clearAllCache,
  cacheMiddleware,
  invalidateCache,
  isConnected,
  closeConnection,
  getCacheKey,
  CACHE_CONFIG,
};
