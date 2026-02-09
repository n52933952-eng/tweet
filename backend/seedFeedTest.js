/**
 * Seed script for testing For You vs Following feed
 *
 * Creates:
 * - Several fake users (with tweets that have likes/views)
 * - Your main user will follow some of them (so "Following" has content)
 * - Other users' tweets have high engagement (so "For You" suggested shows them)
 *
 * Run: node seedFeedTest.js   (from backend folder)
 * Or:  npm run seed:feed      (if you add the script)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcryptjs from 'bcryptjs';
import User from './models/User.js';
import Tweet from './models/Tweet.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const SEED_PASSWORD = 'SeedPass123'; // same for all seed users

const seedUsers = [
  { name: 'Alex Dev', username: 'alexdev', email: 'alex.seed@test.com' },
  { name: 'Sara Tech', username: 'sariatech', email: 'sara.seed@test.com' },
  { name: 'Jordan Code', username: 'jordancode', email: 'jordan.seed@test.com' },
  { name: 'Sam Builder', username: 'sambuilder', email: 'sam.seed@test.com' },
  { name: 'Riley Design', username: 'rileydesign', email: 'riley.seed@test.com' },
  { name: 'Casey Labs', username: 'caseylabs', email: 'casey.seed@test.com' },
];

// Tweets with varied engagement (high = more likely in "For You" suggested)
const tweetTemplates = [
  { text: 'Just shipped a huge feature! 🚀', likeCount: 1200, retweetCount: 340, viewCount: 85000 },
  { text: 'Coffee and code – the only way to start the day ☕', likeCount: 560, retweetCount: 89, viewCount: 42000 },
  { text: 'New blog post: Building scalable APIs. Link in bio.', likeCount: 890, retweetCount: 210, viewCount: 67000 },
  { text: 'Debugging in production at 2am. Who else? 😅', likeCount: 2340, retweetCount: 567, viewCount: 120000 },
  { text: 'The best error message is the one you never see.', likeCount: 450, retweetCount: 78, viewCount: 31000 },
  { text: 'Weekend project: automated tests for the whole app. Worth it.', likeCount: 670, retweetCount: 123, viewCount: 48000 },
  { text: 'Merged 47 PRs this week. Team is on fire 🔥', likeCount: 1100, retweetCount: 290, viewCount: 92000 },
  { text: 'Learning a new framework every quarter keeps you sharp.', likeCount: 380, retweetCount: 56, viewCount: 28000 },
  { text: 'Deployed to prod. Fingers crossed 🤞', likeCount: 780, retweetCount: 145, viewCount: 55000 },
  { text: 'Code review tip: be kind. Everyone was a junior once.', likeCount: 2100, retweetCount: 432, viewCount: 145000 },
];

async function seedFeedTest() {
  try {
    console.log('🔵 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const hashedPassword = await bcryptjs.hash(SEED_PASSWORD, 10);
    const birthDate = new Date('1995-06-15');

    // 1) Create or get seed users
    const createdUsers = [];
    for (const u of seedUsers) {
      let user = await User.findOne({ username: u.username });
      if (!user) {
        user = await User.create({
          name: u.name,
          username: u.username,
          email: u.email,
          password: hashedPassword,
          authProvider: 'local',
          birthDate,
          bio: `Seed user for feed testing – ${u.username}`,
          followerCount: 0,
          followingCount: 0,
          tweetCount: 0,
        });
        console.log(`✅ Created user: @${u.username}`);
      } else {
        console.log(`⏭️  User exists: @${u.username}`);
      }
      createdUsers.push(user);
    }

    // 2) Create tweets for each seed user with engagement
    console.log('\n🔵 Creating tweets with likes/views...');
    let tweetCount = 0;
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      const numTweets = 3 + (i % 3); // 3–5 tweets per user
      for (let j = 0; j < numTweets; j++) {
        const t = tweetTemplates[(i + j) % tweetTemplates.length];
        const exists = await Tweet.findOne({ author: user._id, text: t.text });
        if (!exists) {
          await Tweet.create({
            author: user._id,
            text: t.text,
            media: [],
            tweetType: 'tweet',
            likeCount: t.likeCount,
            retweetCount: t.retweetCount,
            viewCount: t.viewCount,
            replyCount: Math.floor(t.likeCount / 20),
            isPublished: true,
            isDeleted: false,
          });
          tweetCount++;
        }
      }
    }
    console.log(`✅ Created/checked ${tweetCount} tweets with engagement.\n`);

    // 3) Get your main user and make them follow some seed users (so "Following" tab has content)
    const mainUser = await User.findOne({}).sort({ createdAt: 1 });
    if (!mainUser) {
      console.log('⚠️  No main user found. Create an account in the app first, then run this again.');
      process.exit(0);
    }

    const toFollow = createdUsers.slice(0, 3); // follow first 3 seed users
    const mainFollowing = mainUser.following || [];
    let followed = 0;
    for (const u of toFollow) {
      if (u._id.equals(mainUser._id)) continue;
      if (mainFollowing.some(id => id.equals(u._id))) continue;
      mainUser.following.push(u._id);
      mainUser.followingCount = (mainUser.followingCount || 0) + 1;
      await User.findByIdAndUpdate(u._id, { $inc: { followerCount: 1 }, $push: { followers: mainUser._id } });
      followed++;
    }
    if (followed > 0) {
      await mainUser.save();
      console.log(`✅ Your account (@${mainUser.username}) now follows ${followed} seed users (Following tab will show their tweets).\n`);
    } else {
      console.log(`⏭️  Your account (@${mainUser.username}) already follows the seed users.\n`);
    }

    console.log('📋 How to test:');
    console.log('   1. Open the app and log in as your main account.');
    console.log('   2. For You  → should show tweets from people you follow + suggested (other users with high engagement).');
    console.log('   3. Following → should show only tweets from the 3 seed users you follow.');
    console.log('   4. Seed user logins (password for all): ' + SEED_PASSWORD);
    console.log('      Emails: ' + seedUsers.map(u => u.email).join(', '));
    console.log('\n✅ Done.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedFeedTest();
