import express from 'express'
import { getNotifications, getUnreadCount, markRead } from '../controllers/notification.js'
import protectRoute from '../middleware/protectRoute.js'

const router = express.Router()
router.use(protectRoute)

router.get('/', getNotifications)              // GET /api/notifications?page=1&limit=20
router.get('/unread-count', getUnreadCount)    // GET /api/notifications/unread-count
router.patch('/read', markRead)                // PATCH /api/notifications/read (body: { id } optional)

export default router
