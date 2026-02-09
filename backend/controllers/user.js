import User from '../models/User.js'
import Tweet from '../models/Tweet.js'

/**
 * ============================================
 * USER CONTROLLER
 * ============================================
 * 
 * Handles:
 * - Get user profile
 * - Update user profile
 * - Follow/unfollow user
 * - Get followers/following
 * - Search users
 */

/**
 * GET USER PROFILE BY ID (for app when you have userId e.g. from tweet.author)
 * GET /api/users/profile/:id
 * Returns user + isFollowing (whether current user follows this profile)
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const currentUserId = req.user._id

    const user = await User.findById(id).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const currentUser = await User.findById(currentUserId).select('following')
    const isFollowing = (currentUser.following || []).some(
      (fid) => fid.toString() === id
    )

    res.status(200).json({
      user: user.toObject ? user.toObject() : user,
      isFollowing
    })
  } catch (error) {
    console.error('❌ Error in getUserById:', error)
    res.status(500).json({ error: 'Failed to get user profile' })
  }
}

/**
 * GET USER PROFILE BY USERNAME
 * GET /api/users/:username
 */
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params

    const user = await User.findOne({ username: username.toLowerCase() })
      .select('-password')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({ user })

  } catch (error) {
    console.error('❌ Error in getUserProfile:', error)
    res.status(500).json({ error: 'Failed to get user profile' })
  }
}

/**
 * UPDATE USER PROFILE
 * PUT /api/users/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id
    const { name, bio, location, website, profilePic, coverPhoto } = req.body

    // Validation
    if (name && name.length > 50) {
      return res.status(400).json({ error: 'Name must be 50 characters or less' })
    }

    if (bio && bio.length > 160) {
      return res.status(400).json({ error: 'Bio must be 160 characters or less' })
    }

    if (location && location.length > 30) {
      return res.status(400).json({ error: 'Location must be 30 characters or less' })
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(location !== undefined && { location: location.trim() }),
        ...(website !== undefined && { website: website.trim() }),
        ...(profilePic && { profilePic }),
        ...(coverPhoto !== undefined && { coverPhoto })
      },
      { new: true }
    ).select('-password')

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

    console.log('✅ Profile updated:', updatedUser.username)

  } catch (error) {
    console.error('❌ Error in updateProfile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

/**
 * FOLLOW USER
 * POST /api/users/:id/follow
 */
export const followUser = async (req, res) => {
  try {
    const { id } = req.params // User to follow
    const userId = req.user._id // Current user

    // Can't follow yourself
    if (id === userId.toString()) {
      return res.status(400).json({ error: 'Cannot follow yourself' })
    }

    const userToFollow = await User.findById(id)
    const currentUser = await User.findById(userId)

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if already following
    const isFollowing = (currentUser.following || []).some(
      (fid) => fid.toString() === id
    )

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        followId => followId.toString() !== id
      )
      currentUser.followingCount = Math.max(0, currentUser.followingCount - 1)

      userToFollow.followers = userToFollow.followers.filter(
        followerId => followerId.toString() !== userId.toString()
      )
      userToFollow.followerCount = Math.max(0, userToFollow.followerCount - 1)

      await currentUser.save()
      await userToFollow.save()

      return res.status(200).json({
        message: 'Unfollowed successfully',
        following: false
      })

    } else {
      // Follow
      currentUser.following.push(id)
      currentUser.followingCount += 1

      userToFollow.followers.push(userId)
      userToFollow.followerCount += 1

      await currentUser.save()
      await userToFollow.save()

      // TODO: Create notification for followed user

      return res.status(200).json({
        message: 'Followed successfully',
        following: true
      })
    }

  } catch (error) {
    console.error('❌ Error in followUser:', error)
    res.status(500).json({ error: 'Failed to follow user' })
  }
}

/**
 * GET FOLLOWERS
 * GET /api/users/:username/followers
 */
export const getFollowers = async (req, res) => {
  try {
    const { username } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    const user = await User.findOne({ username: username.toLowerCase() })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get followers with pagination
    const followers = await User.find({
      _id: { $in: user.followers }
    })
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit)

    const totalCount = user.followers.length

    res.status(200).json({
      followers,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    })

  } catch (error) {
    console.error('❌ Error in getFollowers:', error)
    res.status(500).json({ error: 'Failed to get followers' })
  }
}

/**
 * GET FOLLOWING
 * GET /api/users/:username/following
 */
export const getFollowing = async (req, res) => {
  try {
    const { username } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    const user = await User.findOne({ username: username.toLowerCase() })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get following with pagination
    const following = await User.find({
      _id: { $in: user.following }
    })
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit)

    const totalCount = user.following.length

    res.status(200).json({
      following,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    })

  } catch (error) {
    console.error('❌ Error in getFollowing:', error)
    res.status(500).json({ error: 'Failed to get following' })
  }
}

/**
 * SEARCH USERS
 * GET /api/users/search?q=query
 */
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    const currentUserId = req.user._id

    // Search by name or username (case-insensitive); exclude current user
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ]
    })
      .select('-password')
      .sort({ followerCount: -1 }) // Sort by popularity
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const totalCount = await User.countDocuments({
      _id: { $ne: currentUserId },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ]
    })

    const currentUser = await User.findById(currentUserId).select('following').lean()
    const followingIds = new Set((currentUser.following || []).map(fid => fid.toString()))

    const usersWithFollow = users.map(u => ({
      ...u,
      isFollowing: followingIds.has(u._id.toString())
    }))

    res.status(200).json({
      users: usersWithFollow,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    })

  } catch (error) {
    console.error('❌ Error in searchUsers:', error)
    res.status(500).json({ error: 'Failed to search users' })
  }
}

/**
 * GET SUGGESTED USERS (Who to follow)
 * GET /api/users/suggested
 */
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id
    const limit = parseInt(req.query.limit) || 5

    // Get current user's following list
    const currentUser = await User.findById(userId).select('following')

    // Find users that current user is NOT following
    // Sort by follower count (popular users)
    const suggestedUsers = await User.find({
      _id: { 
        $ne: userId, // Not the current user
        $nin: currentUser.following // Not already following
      }
    })
      .select('-password')
      .sort({ followerCount: -1 })
      .limit(limit)

    res.status(200).json({ users: suggestedUsers })

  } catch (error) {
    console.error('❌ Error in getSuggestedUsers:', error)
    res.status(500).json({ error: 'Failed to get suggested users' })
  }
}
