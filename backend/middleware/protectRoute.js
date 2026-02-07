import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * Protect Route Middleware
 * 
 * Validates JWT token from Authorization header
 * Attaches user object to request for use in controllers
 * 
 * Mobile apps send token as: Authorization: Bearer <token>
 */
const protectRoute = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Not authorized - No token provided' 
      })
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ 
        error: 'Not authorized - Invalid token format' 
      })
    }

    // 2. Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Not authorized - Token expired' 
        })
      }
      return res.status(401).json({ 
        error: 'Not authorized - Invalid token' 
      })
    }

    // 3. Get user from database (exclude password)
    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(401).json({ 
        error: 'Not authorized - User not found' 
      })
    }

    // 4. Attach user to request object
    req.user = user

    // 5. Continue to next middleware/controller
    next()

  } catch (error) {
    console.error('❌ Error in protectRoute middleware:', error)
    return res.status(500).json({ 
      error: 'Internal server error in authentication' 
    })
  }
}

export default protectRoute
