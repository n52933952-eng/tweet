# Seed data for testing For You vs Following

So you can test **For You** (mixed + suggested) and **Following** (only people you follow) without manually creating many users and likes.

## What the script does

1. **Creates 6 seed users** (if they don’t exist):  
   `alexdev`, `sariatech`, `jordancode`, `sambuilder`, `rileydesign`, `caseylabs`  
   Password for all: **`SeedPass123`**

2. **Creates tweets** for each user with **different engagement** (likes, retweets, views) so “For You” suggested feed has high-engagement tweets to show.

3. **Makes your main account follow the first 3 seed users** so the **Following** tab has their tweets. (Your main account = first user in the DB, usually the one you created first.)

## How to run

From the **backend** folder:

```bash
cd backend
node seedFeedTest.js
```

Or with npm (if you add `"seed:feed": "node seedFeedTest.js"` to `scripts` in `package.json`):

```bash
npm run seed:feed
```

**Requirement:** You must have at least one user in the DB (your real account). Create it by signing up in the app, then run the seed.

## How to test in the app

1. Log in with **your main account**.
2. **For You** → You should see tweets from the 3 users you follow **and** suggested tweets from the other seed users (because of high like/view counts).
3. **Following** → You should see **only** tweets from the 3 followed seed users.
4. (Optional) Log in as a seed user (e.g. `alex.seed@test.com` / `SeedPass123`) to post more tweets and see them in feeds.
