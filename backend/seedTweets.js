import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';
import Tweet from './models/Tweet.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '../.env') });

/**
 * Sample Tweets Seeder
 * Creates 10 tweets with various media types
 */

const sampleTweets = [
  {
    text: "Just launched my new React Native app! 🚀 Built with passion and lots of coffee ☕",
    media: [{
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
      thumbnail: ''
    }],
    likeCount: 245,
    retweetCount: 32,
    replyCount: 18,
    viewCount: 15600
  },
  {
    text: "Beautiful sunset in Dubai 🌅 #photography #sunset",
    media: [{
      type: 'image',
      url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      thumbnail: ''
    }],
    likeCount: 892,
    retweetCount: 156,
    replyCount: 45,
    viewCount: 67800
  },
  {
    text: "Working on something exciting! Can't wait to share it with you all 💻✨",
    media: [{
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'
    }],
    likeCount: 567,
    retweetCount: 89,
    replyCount: 34,
    viewCount: 45200
  },
  {
    text: "Coffee and code - the perfect combination ☕💻 #devlife",
    media: [{
      type: 'image',
      url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      thumbnail: ''
    }],
    likeCount: 1234,
    retweetCount: 234,
    replyCount: 67,
    viewCount: 98500
  },
  {
    text: "Just finished reading an amazing book on system design! Highly recommend 📚👨‍💻",
    media: [],
    likeCount: 445,
    retweetCount: 78,
    replyCount: 29,
    viewCount: 32100
  },
  {
    text: "Amazing view from my office today! 🏔️ #workfromhome",
    media: [{
      type: 'image',
      url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
      thumbnail: ''
    }],
    likeCount: 678,
    retweetCount: 123,
    replyCount: 41,
    viewCount: 54300
  },
  {
    text: "New tutorial on React Native animations is live! Check it out 🎬✨",
    media: [{
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'
    }],
    likeCount: 1567,
    retweetCount: 345,
    replyCount: 89,
    viewCount: 125000
  },
  {
    text: "Travel is the only thing you buy that makes you richer ✈️🌍 #wanderlust",
    media: [{
      type: 'image',
      url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
      thumbnail: ''
    }],
    likeCount: 2345,
    retweetCount: 456,
    replyCount: 123,
    viewCount: 187000
  },
  {
    text: "Important reminder: Take breaks, drink water, and stretch! Your health matters 💙 #selfcare",
    media: [],
    likeCount: 892,
    retweetCount: 167,
    replyCount: 52,
    viewCount: 67400
  },
  {
    text: "The future of AI is incredible! Just tested the new model and mind = blown 🤯🤖",
    media: [{
      type: 'image',
      url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      thumbnail: ''
    }],
    likeCount: 3456,
    retweetCount: 789,
    replyCount: 234,
    viewCount: 298000
  }
];

const seedTweets = async () => {
  try {
    console.log('🔵 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the first user (your account)
    const user = await User.findOne({}).sort({ createdAt: 1 });
    
    if (!user) {
      console.error('❌ No users found! Please create an account first.');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.username}`);

    // Delete existing tweets (optional - comment out if you want to keep existing)
    // await Tweet.deleteMany({});
    // console.log('🗑️  Cleared existing tweets');

    // Create sample tweets
    console.log('🔵 Creating sample tweets...');
    
    const createdTweets = [];
    
    for (let i = 0; i < sampleTweets.length; i++) {
      const tweetData = {
        ...sampleTweets[i],
        author: user._id,
        tweetType: 'tweet',
        isPublished: true,
        isDeleted: false,
        // Spread tweets over the last 24 hours
        createdAt: new Date(Date.now() - (i * 2 * 60 * 60 * 1000)) // 2 hours apart
      };

      const tweet = await Tweet.create(tweetData);
      createdTweets.push(tweet);
      console.log(`✅ Created tweet ${i + 1}/10: "${tweet.text.substring(0, 50)}..."`);
    }

    console.log(`\n🎉 Successfully created ${createdTweets.length} sample tweets!`);
    console.log(`\n📊 Stats:`);
    console.log(`  - Total tweets: ${createdTweets.length}`);
    console.log(`  - With images: ${createdTweets.filter(t => t.media.some(m => m.type === 'image')).length}`);
    console.log(`  - With videos: ${createdTweets.filter(t => t.media.some(m => m.type === 'video')).length}`);
    console.log(`  - Text only: ${createdTweets.filter(t => t.media.length === 0).length}`);
    
    console.log(`\n✅ Done! Check your app to see the tweets!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding tweets:', error);
    process.exit(1);
  }
};

// Run the seeder
seedTweets();
