# Twitter Clone Backend

Production-ready backend for a Twitter clone mobile app. Built to handle millions of users with Redis caching, MongoDB connection pooling, and horizontal scaling capabilities.

## 🚀 Features

- **Authentication**: Email/Password + Google Sign-In (Firebase)
- **Scalable**: Redis + MongoDB with indexes for millions of users
- **Real-time**: Socket.IO with Redis adapter (coming soon)
- **Media**: Cloudinary for image/video uploads
- **Security**: JWT authentication, bcrypt password hashing
- **Production**: Ready to deploy to Render

## 📦 Installation

```bash
# Install dependencies
npm install

# Setup environment variables (see .env file)

# Run development server
npm run dev

# Run production server
npm start
```

## 🔧 Environment Setup

1. **MongoDB Atlas** (Database)
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create cluster (free tier available)
   - Get connection string
   - Add to `.env` as `MONGO_URI`

2. **Redis Cloud** (Caching)
   - Sign up at https://redis.com/try-free/
   - Create database (30MB free)
   - Get connection URL
   - Add to `.env` as `REDIS_URL`

3. **Cloudinary** (Media Storage)
   - Sign up at https://cloudinary.com
   - Get cloud name, API key, API secret
   - Add to `.env`

4. **Firebase** (Google Sign-In) - Optional for now
   - Will be added when integrating mobile app

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/signup    - Create new account
POST   /api/auth/login     - Login with email/username
POST   /api/auth/logout    - Logout user
GET    /api/auth/me        - Get current user (protected)
POST   /api/auth/google    - Google Sign-In (coming soon)
```

### Health Check
```
GET    /health             - Server health status
```

## 🏗️ Project Structure

```
backend/
├── controllers/       # Business logic
│   └── auth.js       # Authentication controller
├── middleware/       # Express middleware
│   ├── protectRoute.js
│   └── upload.js
├── models/           # MongoDB schemas
│   └── User.js
├── routes/           # API routes
│   └── auth.js
├── services/         # External services
│   └── redis.js      # Redis setup
├── utils/            # Helper functions
│   └── generateToken.js
├── .env              # Environment variables
├── .gitignore
├── index.js          # Main entry point
└── package.json
```

## 🔐 Authentication Flow

### Signup/Login
1. Client sends credentials
2. Server validates and hashes password (bcrypt)
3. Server generates JWT token
4. Client stores token in AsyncStorage
5. Client sends token in Authorization header: `Bearer <token>`

### Google Sign-In (Coming Soon)
1. Mobile app uses Firebase Auth
2. Gets Firebase token
3. Sends to backend
4. Backend verifies with Firebase Admin SDK
5. Creates/finds user in MongoDB
6. Returns our JWT token

## 🚀 Deployment to Render

```bash
# 1. Push code to GitHub

# 2. Create Web Service on Render
# 3. Connect GitHub repo
# 4. Set environment variables
# 5. Deploy

# Your production URL:
https://your-app-name.onrender.com
```

## 📊 Performance Features

- **MongoDB Connection Pooling**: 50 max connections
- **Redis Caching**: Fast data access
- **Database Indexes**: Optimized queries
- **Horizontal Scaling**: Add more server instances anytime
- **Health Checks**: Monitor server status

## 🔒 Security

- Password hashing with bcryptjs (10 rounds)
- JWT tokens with 60-day expiration
- Input validation on all endpoints
- Protected routes with middleware
- CORS configuration

## 🛠️ Development

```bash
# Run with nodemon (auto-restart)
npm run dev

# Test endpoints with curl or Postman
curl http://localhost:5000/health
```

## 📝 Next Steps

- [ ] Implement Tweet model and routes
- [ ] Implement User profile routes
- [ ] Add Socket.IO for real-time features
- [ ] Implement Google Sign-In with Firebase
- [ ] Add Direct Messaging
- [ ] Add Notifications
- [ ] Deploy to production

## 🤝 Contributing

This is a private project for a client. 

## 📄 License

Private - All rights reserved
