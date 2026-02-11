/**
 * OneSignal Push Notifications Service
 * Like ThreadTrain: send push to users via OneSignal REST API
 * For when app is closed or backgrounded (real-time = Socket.io)
 */

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY

if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
  console.warn('⚠️ OneSignal env vars missing – push notifications disabled')
}

/**
 * Send notification to one user (by userId = external_id in OneSignal)
 */
async function sendNotificationToUser(userId, title, message, data = {}, images = {}) {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) return
  try {
    const { profilePic, postImage } = images
    const notification = {
      app_id: ONESIGNAL_APP_ID,
      target_channel: 'push',
      include_aliases: {
        external_id: [userId]
      },
      headings: { en: title },
      contents: { en: message },
      subtitle: { en: message },
      data: data,
      ...(profilePic && {
        large_icon: profilePic,
        ios_attachments: { id: profilePic },
      }),
      ...(postImage && { big_picture: postImage }),
      sound: 'default',
      android_accent_color: 'FF1D9BF0',
      priority: 10,
    }

    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notification),
    })

    const result = await response.json()
    if (!response.ok) {
      console.error('❌ OneSignal error:', result)
      return
    }
    console.log('✅ OneSignal sent to', userId, ':', title)
  } catch (error) {
    console.error('❌ OneSignal sendNotificationToUser:', error)
  }
}

/**
 * Twitter-style notification helpers (like, retweet, follow, reply)
 */
export const sendLikeNotification = async (userId, actorName, tweetId, images = {}) => {
  await sendNotificationToUser(
    userId,
    'New like',
    `${actorName} liked your tweet`,
    { type: 'like', tweetId },
    images
  )
}

export const sendRetweetNotification = async (userId, actorName, tweetId, images = {}) => {
  await sendNotificationToUser(
    userId,
    'New retweet',
    `${actorName} retweeted your tweet`,
    { type: 'retweet', tweetId },
    images
  )
}

export const sendFollowNotification = async (userId, actorName, actorId, images = {}) => {
  await sendNotificationToUser(
    userId,
    'New follower',
    `${actorName} started following you`,
    { type: 'follow', userId: actorId },
    images
  )
}

export const sendReplyNotification = async (userId, actorName, tweetId, images = {}) => {
  await sendNotificationToUser(
    userId,
    'New reply',
    `${actorName} replied to your tweet`,
    { type: 'reply', tweetId },
    images
  )
}
