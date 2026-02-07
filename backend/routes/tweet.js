import express from 'express'
import { 
  createTweet, 
  getFeed, 
  getTweet, 
  deleteTweet, 
  likeTweet, 
  retweet,
  getUserTweets
} from '../controllers/tweet.js'
import protectRoute from '../middleware/protectRoute.js'

const router = express.Router()

/**
 * ============================================
 * TWEET ROUTES
 * ============================================
 */

// All tweet routes require authentication
router.use(protectRoute)

// Create tweet
router.post('/', createTweet)                    // POST /api/tweets

// Get feed
router.get('/feed', getFeed)                     // GET /api/tweets/feed

// Get user's tweets
router.get('/user/:username', getUserTweets)     // GET /api/tweets/user/:username

// Get single tweet
router.get('/:id', getTweet)                     // GET /api/tweets/:id

// Delete tweet
router.delete('/:id', deleteTweet)               // DELETE /api/tweets/:id

// Like/unlike tweet
router.post('/:id/like', likeTweet)              // POST /api/tweets/:id/like

// Retweet/unretweet
router.post('/:id/retweet', retweet)             // POST /api/tweets/:id/retweet

export default router
