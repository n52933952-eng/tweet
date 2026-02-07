import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { getRedisPubSub } from '../services/redis.js'
import { redisSet, redisGet, redisDel } from '../services/redis.js'

/**
 * ============================================
 * SOCKET.IO SETUP - Real-time Features
 * ============================================
 * 
 * Handles:
 * - Real-time messaging (DMs)
 * - Online/Offline presence
 * - Notifications
 * - Tweet updates (likes, retweets in real-time)
 * 
 * Uses Redis adapter for horizontal scaling across multiple servers
 * Based on ThreadTrain's production-tested architecture
 */

let io = null

/**
 * Initialize Socket.IO Server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
export const initSocket = (httpServer) => {
  // Create Socket.IO server with CORS
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      credentials: true
    },
    // Optimize for production
    pingTimeout: 60000,     // 60 seconds
    pingInterval: 25000,    // 25 seconds
    upgradeTimeout: 30000,  // 30 seconds
    maxHttpBufferSize: 1e8  // 100 MB for file transfers
  })

  // Setup Redis adapter for multi-server support
  const { pubClient, subClient } = getRedisPubSub() || {}
  
  if (pubClient && subClient) {
    io.adapter(createAdapter(pubClient, subClient))
    console.log('✅ Socket.IO using Redis adapter - Multi-server ready!')
  } else {
    console.warn('⚠️ Socket.IO running WITHOUT Redis adapter')
    console.warn('⚠️ Real-time features will ONLY work on single server')
  }

  // ============================================
  // SOCKET EVENT HANDLERS
  // ============================================

  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id)

    // ============ SETUP: Associate socket with user ============
    socket.on('setup', async (userId) => {
      if (!userId) return

      try {
        // Join personal room for notifications
        socket.join(userId.toString())
        
        // Store socket-user mapping in Redis
        await redisSet(`socketUser:${socket.id}`, userId.toString(), 3600) // 1 hour TTL
        await redisSet(`userSocket:${userId}`, socket.id, 3600)
        
        // Set user as online
        await redisSet(`presence:${userId}`, 'online', 3600)
        
        // Emit to all followers that user is online
        socket.broadcast.emit('userOnline', userId.toString())
        
        console.log(`✅ User ${userId} connected (socket: ${socket.id})`)
      } catch (error) {
        console.error('❌ Error in setup:', error)
      }
    })

    // ============ GET ONLINE USERS ============
    socket.on('getOnlineUsers', async (userIds) => {
      try {
        const onlineUsers = []
        
        for (const userId of userIds) {
          const presence = await redisGet(`presence:${userId}`)
          if (presence === 'online') {
            onlineUsers.push(userId)
          }
        }
        
        socket.emit('onlineUsersList', onlineUsers)
      } catch (error) {
        console.error('❌ Error getting online users:', error)
      }
    })

    // ============ SUBSCRIBE TO USER PRESENCE ============
    socket.on('subscribePresence', async (userIds) => {
      try {
        // Join rooms for specific users' presence updates
        userIds.forEach(userId => {
          socket.join(`presence:${userId}`)
        })
      } catch (error) {
        console.error('❌ Error subscribing to presence:', error)
      }
    })

    // ============ SEND MESSAGE ============
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, message } = data
        
        // Emit to receiver's room
        io.to(receiverId.toString()).emit('newMessage', message)
        
        // Also emit notification
        io.to(receiverId.toString()).emit('notification', {
          type: 'message',
          from: message.senderId,
          message: 'sent you a message'
        })
        
        console.log(`📩 Message sent from ${message.senderId} to ${receiverId}`)
      } catch (error) {
        console.error('❌ Error sending message:', error)
      }
    })

    // ============ TYPING INDICATOR ============
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data
      io.to(receiverId.toString()).emit('userTyping', {
        userId: data.senderId,
        isTyping
      })
    })

    // ============ TWEET UPDATES ============
    socket.on('tweetLiked', (data) => {
      const { tweetId, userId, likeCount } = data
      // Broadcast to all connected clients
      io.emit('tweetUpdate', {
        tweetId,
        type: 'like',
        userId,
        likeCount
      })
    })

    socket.on('tweetRetweeted', (data) => {
      const { tweetId, userId, retweetCount } = data
      io.emit('tweetUpdate', {
        tweetId,
        type: 'retweet',
        userId,
        retweetCount
      })
    })

    socket.on('newReply', (data) => {
      const { tweetId, reply } = data
      io.emit('tweetUpdate', {
        tweetId,
        type: 'reply',
        reply
      })
    })

    // ============ NOTIFICATIONS ============
    socket.on('sendNotification', (data) => {
      const { userId, notification } = data
      io.to(userId.toString()).emit('notification', notification)
    })

    // ============ DISCONNECT ============
    socket.on('disconnect', async () => {
      try {
        // Get userId from Redis
        const userId = await redisGet(`socketUser:${socket.id}`)
        
        if (userId) {
          // Remove socket mapping
          await redisDel(`socketUser:${socket.id}`)
          await redisDel(`userSocket:${userId}`)
          
          // Set user as offline
          await redisDel(`presence:${userId}`)
          
          // Notify others user is offline
          socket.broadcast.emit('userOffline', userId)
          
          console.log(`👋 User ${userId} disconnected (socket: ${socket.id})`)
        } else {
          console.log('👋 Anonymous user disconnected:', socket.id)
        }
      } catch (error) {
        console.error('❌ Error in disconnect:', error)
      }
    })
  })

  return io
}

/**
 * Get Socket.IO instance
 * Use this in controllers to emit events
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket first.')
  }
  return io
}

/**
 * Emit to specific user
 * @param {String} userId - User ID to emit to
 * @param {String} event - Event name
 * @param {Any} data - Data to send
 */
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId.toString()).emit(event, data)
  }
}

/**
 * Emit to all connected clients
 * @param {String} event - Event name
 * @param {Any} data - Data to send
 */
export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data)
  }
}

/**
 * Check if user is online
 * @param {String} userId - User ID
 * @returns {Boolean}
 */
export const isUserOnline = async (userId) => {
  try {
    const presence = await redisGet(`presence:${userId}`)
    return presence === 'online'
  } catch (error) {
    return false
  }
}

/**
 * Get online users from list
 * @param {Array} userIds - Array of user IDs
 * @returns {Array} Array of online user IDs
 */
export const getOnlineUsers = async (userIds) => {
  try {
    const onlineUsers = []
    
    for (const userId of userIds) {
      const isOnline = await isUserOnline(userId)
      if (isOnline) {
        onlineUsers.push(userId)
      }
    }
    
    return onlineUsers
  } catch (error) {
    console.error('Error getting online users:', error)
    return []
  }
}
