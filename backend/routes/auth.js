import express from 'express'
import { signup, login, logout, getCurrentUser, googleSignIn } from '../controllers/auth.js'
import protectRoute from '../middleware/protectRoute.js'

const router = express.Router()

/**
 * ============================================
 * AUTHENTICATION ROUTES
 * ============================================
 */

// Public routes (no authentication required)
router.post('/signup', signup)           // POST /api/auth/signup
router.post('/login', login)             // POST /api/auth/login
router.post('/logout', logout)           // POST /api/auth/logout
router.post('/google', googleSignIn)     // POST /api/auth/google (Firebase)

// Protected routes (requires authentication)
router.get('/me', protectRoute, getCurrentUser)  // GET /api/auth/me

export default router
