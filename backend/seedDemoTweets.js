/**
 * Seed Script: Add Demo Tweets with Images & Videos
 * Creates realistic Twitter-style posts for customer demo
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Tweet from './models/Tweet.js'
import User from './models/User.js'

dotenv.config()

const demoTweets = [
  {
    text: "Just launched our new app! 🚀 Check out the smooth animations and beautiful UI. #ReactNative #MobileApp",
    media: [
      {
        url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 1245,
    retweetCount: 234,
    replyCount: 67,
    viewCount: 45000
  },
  {
    text: "Beautiful sunset at the beach today 🌅 Nature never disappoints!",
    media: [
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 3420,
    retweetCount: 567,
    replyCount: 189,
    viewCount: 120000
  },
  {
    text: "Coffee and code ☕💻 The perfect combination for a productive morning!",
    media: [
      {
        url: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 892,
    retweetCount: 145,
    replyCount: 34,
    viewCount: 28000
  },
  {
    text: "Our team at the tech conference! Amazing speakers and great networking 🎤👥 #TechConf2026",
    media: [
      {
        url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 567,
    retweetCount: 89,
    replyCount: 23,
    viewCount: 19000
  },
  {
    text: "New product feature dropping next week! 👀 Stay tuned for the announcement 🔥",
    media: [
      {
        url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 2134,
    retweetCount: 456,
    replyCount: 178,
    viewCount: 89000
  },
  {
    text: "Mountains are calling 🏔️ Weekend hiking trip was incredible!",
    media: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 1876,
    retweetCount: 334,
    replyCount: 92,
    viewCount: 67000
  },
  {
    text: "Workspace goals 💼✨ Finally organized my desk and it feels amazing!",
    media: [
      {
        url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 723,
    retweetCount: 123,
    replyCount: 45,
    viewCount: 23000
  },
  {
    text: "City lights at night 🌃 There's something magical about the urban skyline",
    media: [
      {
        url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 1567,
    retweetCount: 289,
    replyCount: 78,
    viewCount: 56000
  },
  {
    text: "Fresh food, fresh start 🥗🍎 Healthy eating is the best investment you can make",
    media: [
      {
        url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 945,
    retweetCount: 167,
    replyCount: 54,
    viewCount: 34000
  },
  {
    text: "Coding session complete! ✅ Built a new feature today, feeling accomplished 💪 #100DaysOfCode",
    media: [
      {
        url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 1234,
    retweetCount: 234,
    replyCount: 89,
    viewCount: 45000
  },
  {
    text: "Golden hour vibes 🌇 Photography is my passion",
    media: [
      {
        url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 2345,
    retweetCount: 456,
    replyCount: 134,
    viewCount: 87000
  },
  {
    text: "Book recommendation time 📚 Just finished this amazing read, highly recommend!",
    media: [
      {
        url: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 678,
    retweetCount: 123,
    replyCount: 45,
    viewCount: 29000
  },
  {
    text: "Fitness journey update 💪🏋️ Consistency is key! #FitnessMotivation",
    media: [
      {
        url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 1456,
    retweetCount: 267,
    replyCount: 89,
    viewCount: 52000
  },
  {
    text: "Travel diary: Exploring new cities and cultures 🌍✈️ Life is an adventure!",
    media: [
      {
        url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 2890,
    retweetCount: 567,
    replyCount: 178,
    viewCount: 98000
  },
  {
    text: "Design inspiration 🎨 Working on a new project and the creativity is flowing!",
    media: [
      {
        url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
        type: "image",
        width: 800,
        height: 600
      }
    ],
    likeCount: 834,
    retweetCount: 156,
    replyCount: 67,
    viewCount: 31000
  }
]

async function seedDemoTweets() {
  try {
    console.log('🌱 Starting demo tweets seed...')
    console.log('📡 Connecting to MongoDB...')
    
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Get the first user (or any user) to be the author
    const user = await User.findOne().lean()
    
    if (!user) {
      console.error('❌ No users found in database. Please run seed users first.')
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.name} (@${user.username})`)

    // Delete existing tweets (optional - comment out if you want to keep old ones)
    // await Tweet.deleteMany({})
    // console.log('🗑️  Deleted existing tweets')

    // Create demo tweets
    console.log('📝 Creating demo tweets with images...')
    
    for (const tweetData of demoTweets) {
      const tweet = await Tweet.create({
        author: user._id,
        text: tweetData.text,
        media: tweetData.media,
        tweetType: 'tweet',
        likeCount: tweetData.likeCount,
        retweetCount: tweetData.retweetCount,
        replyCount: tweetData.replyCount,
        viewCount: tweetData.viewCount,
        isPublished: true
      })
      console.log(`✅ Created: "${tweetData.text.substring(0, 50)}..."`)
    }

    // Update user's tweet count
    const tweetCount = await Tweet.countDocuments({ author: user._id })
    await User.findByIdAndUpdate(user._id, { tweetCount })
    console.log(`✅ Updated user tweet count: ${tweetCount}`)

    console.log('\n🎉 Demo tweets seeded successfully!')
    console.log(`📊 Total tweets: ${demoTweets.length}`)
    console.log('✅ All tweets have images from Unsplash')
    console.log('\n💡 Your feed is now ready for customer demo!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding demo tweets:', error)
    process.exit(1)
  }
}

seedDemoTweets()
