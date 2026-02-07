import jwt from 'jsonwebtoken'

/**
 * Generate JWT Token
 * 
 * Creates a secure token for user authentication
 * Token expires in 60 days (like Twitter's "Remember me")
 * 
 * @param {String} userId - MongoDB user ID
 * @returns {String} JWT token
 */
const generateToken = (userId) => {
  try {
    // Create token with user ID as payload
    const token = jwt.sign(
      { userId }, 
      process.env.JWT_SECRET,
      { expiresIn: '60d' } // Token valid for 60 days
    )

    return token
  } catch (error) {
    console.error('❌ Error generating token:', error)
    throw new Error('Failed to generate authentication token')
  }
}

export default generateToken
