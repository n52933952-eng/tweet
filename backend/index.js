import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { v2 as cloudinary } from 'cloudinary'
import { createServer } from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import services
import { initRedis, isRedisAvailable } from './services/redis.js'
import { initSocket } from './socket/socket.js'

// Import routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import tweetRoutes from './routes/tweet.js'

/**
 * ============================================
 * TWITTER CLONE BACKEND
 * ============================================
 * 
 * Production-ready architecture for millions of users
 * Based on ThreadTrain's proven patterns
 * 
 * Stack:
 * - Node.js + Express
 * - MongoDB with connection pooling
 * - Redis for caching & scaling
 * - Socket.IO for real-time features (coming soon)
 * - Cloudinary for media uploads
 * - JWT authentication
 */

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') })

// Initialize Express app
const app = express()

// Create HTTP server for Socket.IO
const httpServer = createServer(app)

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// ============================================
// MIDDLEWARE
// ============================================

// Body parser - parse JSON requests (limit: 50MB for media)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Cookie parser - for cookie-based authentication (if needed)
app.use(cookieParser())

// CORS - Allow mobile app and web frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Update with your mobile app URL
  credentials: true
}))

// Request timeout - 2 minutes for large uploads
app.use((req, res, next) => {
  req.setTimeout(120000) // 2 minutes
  res.setTimeout(120000)
  next()
})

// ============================================
// MONGODB CONNECTION
// ============================================
// Connection pooling for high performance with millions of users
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 50,        // Maximum 50 connections
  minPoolSize: 5,         // Minimum 5 connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,              // Use IPv4
  retryWrites: true,
  w: 'majority'           // Write concern: wait for majority of replicas
})
.then(async () => {
  console.log('✅ MongoDB Connected with connection pooling')
  
  // Initialize Redis after MongoDB connection
  await initRedis()
  
  // Initialize Socket.IO after Redis
  initSocket(httpServer)
  
  console.log('🚀 Database, Redis, and Socket.IO ready for millions of users!')
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error)
  process.exit(1) // Exit if database connection fails
})

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
// Used by Render and load balancers to check server health
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(), // Server uptime in seconds
      checks: {
        database: mongoose.connection.readyState === 1 ? 'ok' : 'error',
        redis: isRedisAvailable() ? 'ok' : 'error'
      }
    }
    
    // If all services are healthy: 200, otherwise: 503
    const allHealthy = Object.values(health.checks).every(c => c === 'ok')
    const statusCode = allHealthy ? 200 : 503
    
    res.status(statusCode).json(health)
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

// ============================================
// API ROUTES
// ============================================

// Authentication routes
app.use('/api/auth', authRoutes)

// User routes
app.use('/api/users', userRoutes)

// Tweet routes
app.use('/api/tweets', tweetRoutes)

// Message routes (coming soon)
// app.use('/api/messages', messageRoutes)

// Notification routes (coming soon)
// app.use('/api/notifications', notificationRoutes)

// ============================================
// 404 HANDLER - Route not found
// ============================================
app.use((req, res, next) => {
  // Only handle API routes that weren't matched
  if (req.path.startsWith('/api/')) {
    console.log(`[404] API route not found: ${req.method} ${req.originalUrl}`)
    return res.status(404).json({ 
      error: 'API route not found', 
      path: req.originalUrl 
    })
  }
  next()
})

// ============================================
// ERROR HANDLER
// ============================================
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  })
})

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🐦 Twitter Clone Backend')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`✅ Health check: http://localhost:${PORT}/health`)
  console.log(`✅ Socket.IO ready for real-time features`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚀 Ready to handle millions of users!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
// Handle server shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('⚠️ SIGTERM received, shutting down gracefully...')
  
  // Close database connection
  await mongoose.connection.close()
  console.log('✅ MongoDB connection closed')
  
  // Close Redis connections
  const { closeRedis } = await import('./services/redis.js')
  await closeRedis()
  
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('⚠️ SIGINT received, shutting down gracefully...')
  
  await mongoose.connection.close()
  const { closeRedis } = await import('./services/redis.js')
  await closeRedis()
  
  process.exit(0)
})
