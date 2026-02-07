import { createClient } from 'redis'

/**
 * ============================================
 * REDIS SERVICE - Production Scaling
 * ============================================
 * 
 * Redis enables the app to handle MILLIONS of users by:
 * 1. Caching frequently accessed data
 * 2. Managing Socket.IO connections across multiple servers
 * 3. Storing user sessions and online status
 * 4. Load balancing real-time features
 * 
 * Copied from ThreadTrain - Battle-tested architecture
 */

// Redis client singleton (single instance shared across app)
let redisClient = null
let pubClient = null   // For Socket.IO publishing
let subClient = null   // For Socket.IO subscribing

/**
 * Initialize Redis Connection
 * REQUIRED for production - app won't start without it
 */
export const initRedis = async () => {
  // Check if REDIS_URL is configured
  if (!process.env.REDIS_URL) {
    console.error('❌ CRITICAL: REDIS_URL not set in environment variables!')
    console.error('❌ Redis is REQUIRED for scaling to millions of users')
    console.error('❌ Please set REDIS_URL in your .env file')
    console.error('❌ Example: REDIS_URL=redis://localhost:6379')
    process.exit(1) // Exit if Redis not configured
  }

  try {
    const redisUrl = process.env.REDIS_URL
    console.log('🔄 Connecting to Redis...')
    
    // ============ Main Redis Client ============
    // Used for general operations (caching, sessions, etc.)
    redisClient = createClient({
      url: redisUrl,
      socket: {
        // Auto-reconnect strategy
        reconnectStrategy: (retries) => {
          if (retries > 20) {
            console.error('❌ Redis: Too many reconnection attempts, giving up')
            return new Error('Too many retries')
          }
          const delay = Math.min(retries * 200, 5000)
          if (retries <= 3) {
            console.log(`🔄 Redis: Reconnecting in ${delay}ms (attempt ${retries})`)
          }
          return delay
        },
        connectTimeout: 10000 // 10 second timeout
      }
    })

    // ============ Pub/Sub Clients ============
    // Required for Socket.IO to work across multiple server instances
    pubClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 20) return new Error('Too many retries')
          return Math.min(retries * 200, 5000)
        },
        connectTimeout: 10000
      }
    })

    // Duplicate pubClient for subscribing
    subClient = pubClient.duplicate()

    // ============ Error Handlers ============
    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err.message)
    })

    pubClient.on('error', (err) => {
      console.error('❌ Redis Pub Client Error:', err.message)
    })

    subClient.on('error', (err) => {
      console.error('❌ Redis Sub Client Error:', err.message)
    })

    // ============ Connect All Clients ============
    await Promise.all([
      redisClient.connect(),
      pubClient.connect(),
      subClient.connect()
    ])

    console.log('✅ Redis connected successfully - App ready for scaling!')
    return { redisClient, pubClient, subClient }

  } catch (error) {
    console.error('❌ CRITICAL: Redis connection failed!')
    console.error('❌ Error:', error.message)
    console.error('❌ Redis is REQUIRED for production scaling')
    console.error('❌ Please ensure Redis is running and REDIS_URL is correct')
    process.exit(1) // Exit if Redis connection fails
  }
}

/**
 * Get Redis Client
 * Use this in your controllers to access Redis
 */
export const getRedis = () => {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis client not available - Redis is required for production')
  }
  return redisClient
}

/**
 * Get Pub/Sub Clients (for Socket.IO)
 */
export const getRedisPubSub = () => {
  if (!pubClient || !subClient || !pubClient.isOpen || !subClient.isOpen) {
    return null
  }
  return { pubClient, subClient }
}

/**
 * Check if Redis is Available
 */
export const isRedisAvailable = () => {
  return redisClient && redisClient.isOpen
}

/**
 * Ensure Redis is Available (throws error if not)
 */
export const ensureRedis = () => {
  if (!isRedisAvailable()) {
    throw new Error('Redis is not available - Redis is required for production scaling')
  }
}

/**
 * Close All Redis Connections
 * Called when server shuts down
 */
export const closeRedis = async () => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit()
    }
    if (pubClient && pubClient.isOpen) {
      await pubClient.quit()
    }
    if (subClient && subClient.isOpen) {
      await subClient.quit()
    }
    console.log('✅ Redis connections closed')
  } catch (error) {
    console.error('❌ Error closing Redis connections:', error)
  }
}

// ============================================
// HELPER FUNCTIONS - Common Redis Operations
// ============================================

/**
 * Set a value in Redis (with optional expiration)
 * @param {String} key - Redis key
 * @param {Any} value - Value to store (will be JSON stringified)
 * @param {Number} ttl - Time to live in seconds (optional)
 */
export const redisSet = async (key, value, ttl = null) => {
  const client = getRedis()
  if (!client) return false
  
  try {
    if (ttl) {
      await client.setEx(key, ttl, JSON.stringify(value))
    } else {
      await client.set(key, JSON.stringify(value))
    }
    return true
  } catch (error) {
    console.error(`❌ Redis SET error for key ${key}:`, error)
    return false
  }
}

/**
 * Get a value from Redis
 * @param {String} key - Redis key
 * @returns {Any} Parsed JSON value or null
 */
export const redisGet = async (key) => {
  const client = getRedis()
  if (!client) return null
  
  try {
    const value = await client.get(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error(`❌ Redis GET error for key ${key}:`, error)
    return null
  }
}

/**
 * Delete a key from Redis
 * @param {String} key - Redis key
 */
export const redisDel = async (key) => {
  const client = getRedis()
  if (!client) return false
  
  try {
    await client.del(key)
    return true
  } catch (error) {
    console.error(`❌ Redis DEL error for key ${key}:`, error)
    return false
  }
}

/**
 * Delete multiple keys from Redis
 * @param {Array} keys - Array of Redis keys
 */
export const redisDelMultiple = async (keys) => {
  const client = getRedis()
  if (!client) return false
  
  try {
    if (keys.length > 0) {
      await client.del(keys)
    }
    return true
  } catch (error) {
    console.error('❌ Redis DEL multiple error:', error)
    return false
  }
}

/**
 * Check if a key exists in Redis
 * @param {String} key - Redis key
 * @returns {Boolean}
 */
export const redisExists = async (key) => {
  const client = getRedis()
  if (!client) return false
  
  try {
    const exists = await client.exists(key)
    return exists === 1
  } catch (error) {
    console.error(`❌ Redis EXISTS error for key ${key}:`, error)
    return false
  }
}

/**
 * Set expiration on an existing key
 * @param {String} key - Redis key
 * @param {Number} ttl - Time to live in seconds
 */
export const redisExpire = async (key, ttl) => {
  const client = getRedis()
  if (!client) return false
  
  try {
    await client.expire(key, ttl)
    return true
  } catch (error) {
    console.error(`❌ Redis EXPIRE error for key ${key}:`, error)
    return false
  }
}
