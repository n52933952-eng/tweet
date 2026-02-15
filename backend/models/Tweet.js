import mongoose from 'mongoose'

/**
 * Tweet Model - Twitter Clone
 * 
 * Handles tweets, replies, retweets, and likes
 * Optimized with indexes for feed generation
 */

const TweetSchema = new mongoose.Schema({
  // ============ Basic Information ============
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  text: {
    type: String,
    required: true,
    maxlength: 280 // Twitter's character limit
  },

  // ============ Media Attachments ============
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'gif'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String, // For videos
      default: ''
    }
  }],

  // ============ Tweet Type ============
  tweetType: {
    type: String,
    enum: ['tweet', 'reply', 'retweet', 'quote'],
    default: 'tweet'
  },

  // ============ Reply Information ============
  // If this is a reply to another tweet
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    default: null
  },

  // Original tweet author (for replies)
  replyToUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // ============ Retweet Information ============
  // If this is a retweet
  retweetOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    default: null
  },

  // If this is a quote tweet (retweet with comment)
  quotedTweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet',
    default: null
  },

  // ============ Engagement ============
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  retweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  }],

  // ============ Statistics (for quick access) ============
  likeCount: {
    type: Number,
    default: 0
  },

  retweetCount: {
    type: Number,
    default: 0
  },

  replyCount: {
    type: Number,
    default: 0
  },

  viewCount: {
    type: Number,
    default: 0
  },

  // ============ Visibility ============
  isDeleted: {
    type: Boolean,
    default: false
  },

  // For scheduled tweets
  scheduledAt: {
    type: Date,
    default: null
  },

  isPublished: {
    type: Boolean,
    default: true
  }

}, { 
  timestamps: true // Adds createdAt and updatedAt
})

// ============ INDEXES (Critical for Feed Performance) ============

// Author lookup (user's tweets)
TweetSchema.index({ author: 1, createdAt: -1 })

// Feed generation (timeline)
TweetSchema.index({ createdAt: -1 })

// Reply chains + paginated reply list
TweetSchema.index({ replyTo: 1 })
TweetSchema.index({ replyTo: 1, createdAt: -1 })

// Retweets
TweetSchema.index({ retweetOf: 1 })

// User engagement (who liked/retweeted)
TweetSchema.index({ likes: 1 })
TweetSchema.index({ retweets: 1 })

// Published status
TweetSchema.index({ isPublished: 1, isDeleted: 1 })

// Text search (for search feature)
TweetSchema.index({ text: 'text' })

const Tweet = mongoose.model('Tweet', TweetSchema)

export default Tweet
