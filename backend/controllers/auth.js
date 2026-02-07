import User from '../models/User.js'
import bcryptjs from 'bcryptjs'
import generateToken from '../utils/generateToken.js'

/**
 * ============================================
 * AUTHENTICATION CONTROLLER
 * ============================================
 * 
 * Handles:
 * - User signup (email/password)
 * - User login (email/username + password)
 * - User logout
 * - Google Sign-In (Firebase) - coming soon
 * - Get current user info
 */

/**
 * SIGNUP - Create new user account
 * POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { name, username, email, password, birthDate } = req.body

    // 1. Validate input
    if (!name || !username || !email || !password || !birthDate) {
      return res.status(400).json({ 
        error: 'Please provide all required fields' 
      })
    }

    // Username validation (Twitter format)
    if (username.length < 3 || username.length > 15) {
      return res.status(400).json({ 
        error: 'Username must be between 3 and 15 characters' 
      })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ 
        error: 'Username can only contain letters, numbers, and underscores' 
      })
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters' 
      })
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }]
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ 
          error: 'Email already registered' 
        })
      }
      if (existingUser.username === username.toLowerCase()) {
        return res.status(400).json({ 
          error: 'Username already taken' 
        })
      }
    }

    // 3. Hash password (10 rounds)
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    // 4. Create new user
    const newUser = new User({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      birthDate: new Date(birthDate),
      authProvider: 'local'
    })

    await newUser.save()

    // 5. Generate JWT token
    const token = generateToken(newUser._id)

    // 6. Return user data (exclude password)
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
      coverPhoto: newUser.coverPhoto,
      bio: newUser.bio,
      location: newUser.location,
      website: newUser.website,
      verified: newUser.verified,
      followerCount: newUser.followerCount,
      followingCount: newUser.followingCount,
      tweetCount: newUser.tweetCount,
      createdAt: newUser.createdAt
    }

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: userResponse
    })

    console.log('✅ New user registered:', username)

  } catch (error) {
    console.error('❌ Error in signup:', error)
    res.status(500).json({ 
      error: 'Failed to create account. Please try again.' 
    })
  }
}

/**
 * LOGIN - Authenticate existing user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body

    // 1. Validate input
    if (!emailOrUsername || !password) {
      return res.status(400).json({ 
        error: 'Please provide email/username and password' 
      })
    }

    // 2. Find user by email OR username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() }
      ]
    })

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      })
    }

    // 3. Check if user signed up with Google
    if (user.authProvider === 'google') {
      return res.status(400).json({ 
        error: 'This account uses Google Sign-In. Please sign in with Google.' 
      })
    }

    // 4. Compare password
    const isPasswordValid = await bcryptjs.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      })
    }

    // 5. Generate JWT token
    const token = generateToken(user._id)

    // 6. Return user data (exclude password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      coverPhoto: user.coverPhoto,
      bio: user.bio,
      location: user.location,
      website: user.website,
      verified: user.verified,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      tweetCount: user.tweetCount,
      createdAt: user.createdAt
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse
    })

    console.log('✅ User logged in:', user.username)

  } catch (error) {
    console.error('❌ Error in login:', error)
    res.status(500).json({ 
      error: 'Failed to login. Please try again.' 
    })
  }
}

/**
 * LOGOUT - Clear user session
 * POST /api/auth/logout
 * 
 * Note: For JWT tokens, logout is handled client-side
 * The mobile app simply deletes the token from storage
 */
export const logout = async (req, res) => {
  try {
    // For JWT authentication, logout is client-side
    // The client removes the token from AsyncStorage
    
    res.status(200).json({ 
      message: 'Logout successful' 
    })

    console.log('✅ User logged out')

  } catch (error) {
    console.error('❌ Error in logout:', error)
    res.status(500).json({ 
      error: 'Failed to logout' 
    })
  }
}

/**
 * GET CURRENT USER - Get authenticated user's info
 * GET /api/auth/me
 * Protected route (requires token)
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is attached by protectRoute middleware
    const user = req.user

    const userResponse = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      coverPhoto: user.coverPhoto,
      bio: user.bio,
      location: user.location,
      website: user.website,
      verified: user.verified,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      tweetCount: user.tweetCount,
      createdAt: user.createdAt
    }

    res.status(200).json({ user: userResponse })

  } catch (error) {
    console.error('❌ Error in getCurrentUser:', error)
    res.status(500).json({ 
      error: 'Failed to get user info' 
    })
  }
}

/**
 * GOOGLE SIGN-IN - Authenticate with Google (Firebase)
 * POST /api/auth/google
 * 
 * Uses Firebase Admin SDK to verify Google Sign-In tokens
 */
export const googleSignIn = async (req, res) => {
  try {
    const { firebaseToken } = req.body

    if (!firebaseToken) {
      return res.status(400).json({ 
        error: 'Firebase token is required' 
      })
    }

    // TODO: Uncomment when Firebase Admin SDK is configured
    /*
    // 1. Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken)
    const { email, name, picture, uid } = decodedToken
    
    // 2. Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { googleId: uid },
        { email: email.toLowerCase() }
      ]
    })

    if (user) {
      // User exists - just login
      // Update profile pic if changed
      if (picture && user.profilePic !== picture) {
        user.profilePic = picture
        await user.save()
      }
    } else {
      // New user - create account
      // Generate unique username from email
      let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
      let username = baseUsername
      let counter = 1
      
      // Ensure username is unique
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      user = new User({
        name: name || email.split('@')[0],
        username: username,
        email: email.toLowerCase(),
        googleId: uid,
        authProvider: 'google',
        profilePic: picture || '',
        password: 'N/A' // Google users don't have passwords
      })

      await user.save()
      console.log('✅ New Google user created:', username)
    }

    // 3. Generate JWT token
    const token = generateToken(user._id)

    // 4. Return user data
    const userResponse = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      coverPhoto: user.coverPhoto,
      bio: user.bio,
      location: user.location,
      website: user.website,
      verified: user.verified,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      tweetCount: user.tweetCount,
      createdAt: user.createdAt
    }

    res.status(200).json({
      message: 'Google Sign-In successful',
      token,
      user: userResponse
    })

    console.log('✅ Google Sign-In successful:', user.username)
    */

    // TEMPORARY: Until Firebase Admin is set up
    res.status(501).json({ 
      error: 'Google Sign-In requires Firebase Admin SDK setup. Please configure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in .env' 
    })

  } catch (error) {
    console.error('❌ Error in googleSignIn:', error)
    
    // Handle Firebase token verification errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Firebase token expired. Please sign in again.' })
    }
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({ error: 'Invalid Firebase token' })
    }

    res.status(500).json({ 
      error: 'Failed to sign in with Google' 
    })
  }
}
