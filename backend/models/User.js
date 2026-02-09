import mongoose from 'mongoose'

/**
 * User Model - Twitter Clone
 * 
 * This model handles both traditional signup and Google Sign-In
 * Optimized with indexes for millions of users
 */

const UserSchema = new mongoose.Schema({
  // ============ Basic Information ============
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },

  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 15,
    // Twitter username format: alphanumeric and underscores only
    match: /^[a-zA-Z0-9_]+$/
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^\S+@\S+\.\S+$/ // Basic email validation
  },

  password: {
    type: String,
    minlength: 8,
    // Password is NOT required if user signs up with Google
    required: function() {
      return this.authProvider === 'local'
    }
  },

  // ============ Authentication Provider ============
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },

  googleId: {
    type: String,
    sparse: true, // Allows null values, but unique if present
    unique: true
  },

  // ============ Profile Information ============
  bio: {
    type: String,
    default: "",
    maxlength: 160 // Twitter's bio limit
  },

  location: {
    type: String,
    default: "",
    maxlength: 30
  },

  website: {
    type: String,
    default: "",
    maxlength: 100
  },

  profilePic: {
    type: String,
    // Twitter's default profile picture
    default: "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
  },

  coverPhoto: {
    type: String,
    default: ""
  },

  // Twitter requires birth date on signup
  birthDate: {
    type: Date,
    required: true
  },

  // ============ Social Graph ============
  // Arrays of user IDs
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // ============ Verification ============
  verified: {
    type: Boolean,
    default: false // Twitter Blue verification badge
  },

  // ============ Statistics (for quick access) ============
  followerCount: {
    type: Number,
    default: 0
  },

  followingCount: {
    type: Number,
    default: 0
  },

  tweetCount: {
    type: Number,
    default: 0
  }

}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
})

// ============ INDEXES (Critical for Performance) ============
// These indexes allow the database to handle MILLIONS of users efficiently

// Email lookup (login)
UserSchema.index({ email: 1 })

// Username lookup (login, profile)
UserSchema.index({ username: 1 })

// Google ID lookup (Google Sign-In)
UserSchema.index({ googleId: 1 }, { sparse: true })

// Followers array (who follows this user?)
UserSchema.index({ followers: 1 })

// Following array (who does this user follow?)
UserSchema.index({ following: 1 })

// Recent users (registration date)
UserSchema.index({ createdAt: -1 })

// Search by name (for user search feature)
UserSchema.index({ name: 'text', username: 'text' })

// Suggested users / who to follow (filter: _id $nin following, sort by popularity)
// Lets MongoDB scan in sort order and skip excluded ids – scales to millions
UserSchema.index({ followerCount: -1, tweetCount: -1, createdAt: -1 })

const User = mongoose.model('User', UserSchema)

export default User
