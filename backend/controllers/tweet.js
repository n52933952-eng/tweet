import Tweet from '../models/Tweet.js'
import User from '../models/User.js'

/**
 * ============================================
 * TWEET CONTROLLER
 * ============================================
 * 
 * Handles:
 * - Create tweet/reply
 * - Get feed
 * - Get single tweet
 * - Delete tweet
 * - Like/unlike tweet
 * - Retweet/unretweet
 */

/**
 * CREATE TWEET
 * POST /api/tweets
 */
export const createTweet = async (req, res) => {
  try {
    const { text, media, replyTo, quotedTweet } = req.body
    const userId = req.user._id

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Tweet text is required' })
    }

    if (text.length > 280) {
      return res.status(400).json({ error: 'Tweet exceeds 280 characters' })
    }

    // Determine tweet type
    let tweetType = 'tweet'
    let replyToUser = null

    if (replyTo) {
      tweetType = 'reply'
      const parentTweet = await Tweet.findById(replyTo)
      if (!parentTweet) {
        return res.status(404).json({ error: 'Parent tweet not found' })
      }
      replyToUser = parentTweet.author
    } else if (quotedTweet) {
      tweetType = 'quote'
    }

    // Create tweet
    const newTweet = new Tweet({
      author: userId,
      text: text.trim(),
      media: media || [],
      tweetType,
      replyTo: replyTo || null,
      replyToUser: replyToUser || null,
      quotedTweet: quotedTweet || null
    })

    await newTweet.save()

    // Update user's tweet count
    await User.findByIdAndUpdate(userId, { 
      $inc: { tweetCount: 1 } 
    })

    // If reply, add to parent tweet's replies
    if (replyTo) {
      await Tweet.findByIdAndUpdate(replyTo, {
        $push: { replies: newTweet._id },
        $inc: { replyCount: 1 }
      })
    }

    // Populate author info
    await newTweet.populate('author', '-password')

    res.status(201).json({
      message: 'Tweet created successfully',
      tweet: newTweet
    })

    console.log('✅ Tweet created by:', req.user.username)

  } catch (error) {
    console.error('❌ Error in createTweet:', error)
    res.status(500).json({ error: 'Failed to create tweet' })
  }
}

/**
 * GET FEED - Get tweets from followed users
 * GET /api/tweets/feed
 */
export const getFeed = async (req, res) => {
  try {
    const userId = req.user._id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    // Get user's following list
    const user = await User.findById(userId).select('following')
    const following = user.following || []

    // Include user's own tweets + tweets from people they follow
    const feedUserIds = [userId, ...following]

    // Get tweets (exclude deleted, only published)
    const tweets = await Tweet.find({
      author: { $in: feedUserIds },
      isDeleted: false,
      isPublished: true,
      tweetType: { $ne: 'reply' } // Don't show replies in main feed
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', '-password')
      .populate('retweetOf')
      .populate('quotedTweet')
      .lean()

    // Get total count for pagination
    const totalCount = await Tweet.countDocuments({
      author: { $in: feedUserIds },
      isDeleted: false,
      isPublished: true,
      tweetType: { $ne: 'reply' }
    })

    res.status(200).json({
      tweets,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    })

  } catch (error) {
    console.error('❌ Error in getFeed:', error)
    res.status(500).json({ error: 'Failed to get feed' })
  }
}

/**
 * GET SINGLE TWEET
 * GET /api/tweets/:id
 */
export const getTweet = async (req, res) => {
  try {
    const { id } = req.params

    const tweet = await Tweet.findById(id)
      .populate('author', '-password')
      .populate('retweetOf')
      .populate('quotedTweet')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: '-password' }
      })

    if (!tweet || tweet.isDeleted) {
      return res.status(404).json({ error: 'Tweet not found' })
    }

    // Increment view count
    tweet.viewCount += 1
    await tweet.save()

    res.status(200).json({ tweet })

  } catch (error) {
    console.error('❌ Error in getTweet:', error)
    res.status(500).json({ error: 'Failed to get tweet' })
  }
}

/**
 * DELETE TWEET
 * DELETE /api/tweets/:id
 */
export const deleteTweet = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const tweet = await Tweet.findById(id)

    if (!tweet || tweet.isDeleted) {
      return res.status(404).json({ error: 'Tweet not found' })
    }

    // Check if user owns the tweet
    if (tweet.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this tweet' })
    }

    // Soft delete
    tweet.isDeleted = true
    await tweet.save()

    // Update user's tweet count
    await User.findByIdAndUpdate(userId, { 
      $inc: { tweetCount: -1 } 
    })

    res.status(200).json({ message: 'Tweet deleted successfully' })

    console.log('✅ Tweet deleted by:', req.user.username)

  } catch (error) {
    console.error('❌ Error in deleteTweet:', error)
    res.status(500).json({ error: 'Failed to delete tweet' })
  }
}

/**
 * LIKE TWEET
 * POST /api/tweets/:id/like
 */
export const likeTweet = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const tweet = await Tweet.findById(id)

    if (!tweet || tweet.isDeleted) {
      return res.status(404).json({ error: 'Tweet not found' })
    }

    // Check if already liked
    const alreadyLiked = tweet.likes.includes(userId)

    if (alreadyLiked) {
      // Unlike
      tweet.likes = tweet.likes.filter(id => id.toString() !== userId.toString())
      tweet.likeCount = Math.max(0, tweet.likeCount - 1)
      await tweet.save()

      return res.status(200).json({ 
        message: 'Tweet unliked',
        liked: false,
        likeCount: tweet.likeCount
      })
    } else {
      // Like
      tweet.likes.push(userId)
      tweet.likeCount += 1
      await tweet.save()

      // TODO: Create notification for tweet author

      return res.status(200).json({ 
        message: 'Tweet liked',
        liked: true,
        likeCount: tweet.likeCount
      })
    }

  } catch (error) {
    console.error('❌ Error in likeTweet:', error)
    res.status(500).json({ error: 'Failed to like tweet' })
  }
}

/**
 * RETWEET
 * POST /api/tweets/:id/retweet
 */
export const retweet = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const originalTweet = await Tweet.findById(id)

    if (!originalTweet || originalTweet.isDeleted) {
      return res.status(404).json({ error: 'Tweet not found' })
    }

    // Check if already retweeted
    const alreadyRetweeted = originalTweet.retweets.includes(userId)

    if (alreadyRetweeted) {
      // Unretweet - remove the retweet
      originalTweet.retweets = originalTweet.retweets.filter(
        id => id.toString() !== userId.toString()
      )
      originalTweet.retweetCount = Math.max(0, originalTweet.retweetCount - 1)
      await originalTweet.save()

      // Delete the retweet tweet
      await Tweet.deleteOne({ 
        author: userId, 
        retweetOf: id,
        tweetType: 'retweet'
      })

      return res.status(200).json({ 
        message: 'Retweet removed',
        retweeted: false,
        retweetCount: originalTweet.retweetCount
      })
    } else {
      // Retweet - create new retweet
      const newRetweet = new Tweet({
        author: userId,
        text: '', // Retweets don't have text
        tweetType: 'retweet',
        retweetOf: id
      })

      await newRetweet.save()

      originalTweet.retweets.push(userId)
      originalTweet.retweetCount += 1
      await originalTweet.save()

      // TODO: Create notification for original tweet author

      return res.status(200).json({ 
        message: 'Retweeted successfully',
        retweeted: true,
        retweetCount: originalTweet.retweetCount
      })
    }

  } catch (error) {
    console.error('❌ Error in retweet:', error)
    res.status(500).json({ error: 'Failed to retweet' })
  }
}

/**
 * GET USER TWEETS
 * GET /api/tweets/user/:username
 */
export const getUserTweets = async (req, res) => {
  try {
    const { username } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    // Find user
    const user = await User.findOne({ username: username.toLowerCase() })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's tweets
    const tweets = await Tweet.find({
      author: user._id,
      isDeleted: false,
      isPublished: true
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', '-password')
      .populate('retweetOf')
      .populate('quotedTweet')
      .lean()

    const totalCount = await Tweet.countDocuments({
      author: user._id,
      isDeleted: false,
      isPublished: true
    })

    res.status(200).json({
      tweets,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    })

  } catch (error) {
    console.error('❌ Error in getUserTweets:', error)
    res.status(500).json({ error: 'Failed to get user tweets' })
  }
}
