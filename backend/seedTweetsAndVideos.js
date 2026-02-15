/**
 * Seed: Create posts + video tweets (for fresh tweet collection)
 * Run from tweetweb folder: node backend/seedTweetsAndVideos.js
 *
 * Requires: .env with MONGO_URI, and at least one user in the database.
 * Use after dropping the tweets collection to refill with sample data.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';
import Tweet from './models/Tweet.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// ---- Text + image posts (only text + media; counts set to 0 in seed) ----
const textImageTweets = [
  {
    text: "Just launched my new React Native app! 🚀 Built with passion and lots of coffee ☕",
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800', thumbnail: '' }]
  },
  {
    text: "Beautiful sunset in Dubai 🌅 #photography #sunset",
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', thumbnail: '' }]
  },
  {
    text: "Coffee and code - the perfect combination ☕💻 #devlife",
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800', thumbnail: '' }]
  },
  {
    text: "Just finished reading an amazing book on system design! Highly recommend 📚👨‍💻",
    media: []
  },
  {
    text: "Amazing view from my office today! 🏔️ #workfromhome",
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800', thumbnail: '' }]
  }
];

// ---- Video posts ----
const videoTweets = [
  {
    text: "Debugging in production at 2am. Who else? 😅",
    media: [{ type: 'video', url: 'https://www.w3schools.com/howto/rain.mp4', thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800' }],
  },
  {
    text: "The best error message is the one you never see.",
    media: [{ type: 'video', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4', thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800' }],
  },
  {
    text: "Weekend project: automated tests for the whole app. Worth it.",
    media: [{ type: 'video', url: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4', thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800' }]
  },
  {
    text: "Code review at 11pm. No regrets. 🚀",
    media: [{ type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800' }]
  },
  {
    text: "When the build finally passes after 47 tries 💚",
    media: [{ type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800' }]
  }
];

async function seed() {
  try {
    console.log('🔵 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    const user = await User.findOne({}).sort({ createdAt: 1 });
    if (!user) {
      console.error('❌ No users in database. Create an account in the app first (or run your user seed).');
      process.exit(1);
    }
    console.log('✅ Author for all tweets:', user.username + '\n');

    // 1) Video posts first (newest dates = show at top of feed)
    console.log('🔵 Creating video posts...');
    for (let i = 0; i < videoTweets.length; i++) {
      const data = {
        ...videoTweets[i],
        author: user._id,
        tweetType: 'tweet',
        isPublished: true,
        isDeleted: false,
        likes: [],
        retweets: [],
        replies: [],
        likeCount: 0,
        retweetCount: 0,
        replyCount: 0,
        viewCount: 0,
        createdAt: new Date(Date.now() - (videoTweets.length - 1 - i) * 60 * 60 * 1000)
      };
      await Tweet.create(data);
      console.log('  ✅', (i + 1) + '.', data.text.substring(0, 50) + '...');
    }

    // 2) Text + image posts (older dates = show below videos)
    console.log('\n🔵 Creating text/image posts...');
    for (let i = 0; i < textImageTweets.length; i++) {
      const data = {
        ...textImageTweets[i],
        author: user._id,
        tweetType: 'tweet',
        isPublished: true,
        isDeleted: false,
        likes: [],
        retweets: [],
        replies: [],
        likeCount: 0,
        retweetCount: 0,
        replyCount: 0,
        viewCount: 0,
        createdAt: new Date(Date.now() - (videoTweets.length + textImageTweets.length - i) * 60 * 60 * 1000)
      };
      await Tweet.create(data);
      console.log('  ✅', (i + 1) + '.', data.text.substring(0, 50) + '...');
    }

    const total = videoTweets.length + textImageTweets.length;
    console.log('\n🎉 Done! Created ' + total + ' tweets (' + videoTweets.length + ' video + ' + textImageTweets.length + ' text/image).');
    console.log('   Likes, replies, retweets, views all start at 0.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌', err);
    process.exit(1);
  }
}

seed();
