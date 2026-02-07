import express from 'express'
import {
  getUserProfile,
  updateProfile,
  followUser,
  getFollowers,
  getFollowing,
  searchUsers,
  getSuggestedUsers
} from '../controllers/user.js'
import protectRoute from '../middleware/protectRoute.js'

const router = express.Router()

/**
 * ============================================
 * USER ROUTES
 * ============================================
 */

// All user routes require authentication
router.use(protectRoute)

// Update current user's profile
router.put('/profile', updateProfile)            // PUT /api/users/profile

// Get suggested users (who to follow)
router.get('/suggested', getSuggestedUsers)      // GET /api/users/suggested

// Search users
router.get('/search', searchUsers)               // GET /api/users/search?q=query

// Get user profile by username
router.get('/:username', getUserProfile)         // GET /api/users/:username

// Follow/unfollow user
router.post('/:id/follow', followUser)           // POST /api/users/:id/follow

// Get followers
router.get('/:username/followers', getFollowers) // GET /api/users/:username/followers

// Get following
router.get('/:username/following', getFollowing) // GET /api/users/:username/following

export default router
