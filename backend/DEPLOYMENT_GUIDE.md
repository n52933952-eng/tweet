# 🚀 Twitter Clone Backend - Deployment Guide (Render)

## 📋 Pre-Deployment Checklist

### 1. Create Required Accounts (Free Tier Available)

#### MongoDB Atlas (Database)
- Go to: https://cloud.mongodb.com
- Create free cluster (M0 Sandbox - 512MB)
- Click "Connect" → "Connect your application"
- Copy connection string
- Replace `<password>` with your database password

#### Redis Cloud (Required for Socket.IO)
- Go to: https://redis.com/try-free
- Create free database (30MB)
- Copy Redis URL from database details
- Format: `redis://default:<password>@<host>:<port>`

#### Cloudinary (Media Storage)
- Go to: https://cloudinary.com
- Sign up for free account (25GB storage, 25GB bandwidth)
- Go to Dashboard
- Copy: Cloud Name, API Key, API Secret

---

## 🌐 Deploy to Render

### Step 1: Push to GitHub
```bash
cd C:\Users\muhanad\Desktop\tweetweb
git init
git add .
git commit -m "Initial Twitter clone backend"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Create Render Web Service
1. Go to: https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `twitterclone-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free (or paid for better performance)

### Step 3: Add Environment Variables
In Render dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/twitterclone?retryWrites=true&w=majority
REDIS_URL=redis://default:password@your-redis-host:port
JWT_SECRET=your-super-secret-jwt-key-change-this-make-it-very-long-and-random
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=*
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment (2-5 minutes)
- Your backend URL will be: `https://twitterclone-backend.onrender.com`

---

## 📱 Update Mobile App with Server URL

### Update `constants.ts`:
```typescript
// C:\Users\muhanad\Desktop\tweet\mytweet\src\utils\constants.ts

export const API_URL = __DEV__ 
  ? 'http://10.0.2.2:5000'  // Android emulator local server
  : 'https://your-app-name.onrender.com';  // Replace with your Render URL
```

---

## 🧪 Test Deployment

### 1. Health Check
```bash
curl https://your-app-name.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-07T...",
  "uptime": 123.45,
  "checks": {
    "database": "ok",
    "redis": "ok"
  }
}
```

### 2. Test Authentication
```bash
# Signup
curl -X POST https://your-app-name.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","email":"test@example.com","password":"password123"}'
```

---

## ⚙️ Render Configuration Details

### Build Settings:
- **Branch**: `main`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`

### Advanced Settings:
- **Health Check Path**: `/health`
- **Auto-Deploy**: Enabled (deploys on git push)
- **Pull Request Previews**: Optional

### Free Tier Limitations:
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes 30-50 seconds
- ✅ Unlimited hours per month
- ✅ 512MB RAM (sufficient for development)

### Upgrade to Paid ($7/month):
- ✅ No spin-down (always on)
- ✅ 512MB RAM minimum
- ✅ Custom domain support
- ✅ Better performance

---

## 🔧 Local Development vs Production

### Local (Development):
```bash
# Start backend locally
cd C:\Users\muhanad\Desktop\tweetweb\backend
npm run dev

# Mobile app uses: http://10.0.2.2:5000
```

### Production (Deployed):
```bash
# Backend runs on Render automatically
# Mobile app uses: https://your-app-name.onrender.com
```

---

## 🛠️ Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution**: Check MongoDB Atlas:
1. Go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. This is required for Render to connect

### Issue: "Redis connection failed"
**Solution**: Verify Redis URL format:
- Correct: `redis://default:password@host:port`
- Include username (usually `default`)
- Check Redis Cloud dashboard for exact URL

### Issue: "Health check failing"
**Solution**: Check Render logs:
1. Go to Render dashboard
2. Click on your service
3. View "Logs" tab
4. Look for connection errors

### Issue: "App crashes on startup"
**Solution**: 
1. Verify all environment variables are set
2. Check MongoDB and Redis are accessible
3. View Render logs for specific error

---

## 📊 Monitoring Your Backend

### Render Dashboard:
- **Logs**: Real-time server logs
- **Metrics**: CPU, Memory, Request count
- **Events**: Deploy history, health checks

### MongoDB Atlas:
- **Metrics**: Database size, operations/sec
- **Performance**: Query performance advisor

### Redis Cloud:
- **Metrics**: Memory usage, operations/sec
- **Commands**: Monitor Redis commands

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` file** - Already in `.gitignore`
2. ✅ **Use strong JWT_SECRET** - At least 32 random characters
3. ✅ **Enable MongoDB IP whitelist** - Use 0.0.0.0/0 for Render
4. ✅ **HTTPS only in production** - Render provides this automatically
5. ✅ **Rate limiting** - Consider adding `express-rate-limit` later
6. ✅ **Input validation** - Already implemented in controllers

---

## 🎯 Next Steps After Deployment

1. ✅ Get your Render backend URL
2. ✅ Update mobile app `constants.ts` with the URL
3. ✅ Test signup/login from mobile app
4. ✅ Test creating tweets
5. ✅ Test real-time features (likes, follows)
6. ✅ Test image uploads
7. ✅ Monitor logs for errors

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Redis Cloud Docs**: https://docs.redis.com/latest/rc
- **Cloudinary Docs**: https://cloudinary.com/documentation

---

## 🏁 You're Ready to Deploy!

Once you have your MongoDB URL, update the `.env` file and push to GitHub. Render will automatically build and deploy your backend! 🚀
