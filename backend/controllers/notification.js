import Notification from '../models/Notification.js'

/**
 * Create a notification (used by tweet + user controllers). No duplicate like for same actor+tweet+type.
 */
export const createNotification = async ({ recipientId, actorId, type, tweetId = null }) => {
  if (!recipientId || !actorId || recipientId.toString() === actorId.toString()) return
  try {
    const filter = { recipient: recipientId, actor: actorId, type }
    if (tweetId) filter.tweet = tweetId
    const existing = await Notification.findOne(filter).sort({ createdAt: -1 }).limit(1).lean()
    if (existing) return // avoid spam: one notification per actor+type+tweet
    await Notification.create({
      recipient: recipientId,
      actor: actorId,
      type,
      tweet: tweetId || null,
    })
  } catch (e) {
    console.error('❌ createNotification:', e)
  }
}

/**
 * GET NOTIFICATIONS - Paginated, Twitter-style
 * GET /api/notifications?page=1&limit=20
 * Returns list + unreadCount (for tab badge). Light: one query for list, one for count.
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 20, 50)

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('actor', 'name username profilePic')
        .populate('tweet', 'text')
        .lean(),
      Notification.countDocuments({ recipient: userId, read: false }),
    ])

    const totalCount = await Notification.countDocuments({ recipient: userId })
    const totalPages = Math.ceil(totalCount / limit)

    res.status(200).json({
      notifications,
      unreadCount,
      pagination: { page, limit, totalPages, totalCount },
    })
  } catch (error) {
    console.error('❌ Error in getNotifications:', error)
    res.status(500).json({ error: 'Failed to get notifications' })
  }
}

/**
 * GET UNREAD COUNT - For tab badge only (light)
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id
    const count = await Notification.countDocuments({ recipient: userId, read: false })
    res.status(200).json({ unreadCount: count })
  } catch (error) {
    console.error('❌ Error in getUnreadCount:', error)
    res.status(500).json({ error: 'Failed to get unread count' })
  }
}

/**
 * MARK AS READ - Mark all or one
 * PATCH /api/notifications/read (body: { id } optional – if omitted, mark all)
 */
export const markRead = async (req, res) => {
  try {
    const userId = req.user._id
    const { id } = req.body || {}

    if (id) {
      await Notification.findOneAndUpdate(
        { _id: id, recipient: userId },
        { read: true }
      )
    } else {
      await Notification.updateMany({ recipient: userId }, { read: true })
    }

    res.status(200).json({ message: 'Marked as read' })
  } catch (error) {
    console.error('❌ Error in markRead:', error)
    res.status(500).json({ error: 'Failed to mark as read' })
  }
}
