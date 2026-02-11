import mongoose from 'mongoose'

/**
 * Notification Model - Twitter-style
 *
 * Lightweight: recipient + actor + type + optional tweet ref.
 * Indexed for millions: list by recipient (newest first), unread count.
 */
const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'retweet', 'follow', 'reply'],
      required: true,
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
)

// List notifications for a user, newest first (paginated) – scales to millions
NotificationSchema.index({ recipient: 1, createdAt: -1 })

// Unread count per user
NotificationSchema.index({ recipient: 1, read: 1 })

const Notification = mongoose.model('Notification', NotificationSchema)
export default Notification
