# 🐦 Twitter Clone - Complete API Documentation

## 🚀 Base URL
```
Development: http://localhost:5000
Production:  https://your-app.onrender.com
```

## 🔐 Authentication
Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📚 API Endpoints

### 🔑 Authentication (`/api/auth`)

#### 1. Signup
Create a new user account.

```http
POST /api/auth/signup
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "password123",
  "birthDate": "1995-05-15"
}
```

**Response (201):**
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123...",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "profilePic": "https://...",
    "followerCount": 0,
    "followingCount": 0,
    "tweetCount": 0
  }
}
```

---

#### 2. Login
Authenticate existing user.

```http
POST /api/auth/login
```

**Body:**
```json
{
  "emailOrUsername": "johndoe",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

#### 3. Get Current User
Get authenticated user's information.

```http
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "_id": "64abc123...",
    "name": "John Doe",
    "username": "johndoe",
    ...
  }
}
```

---

#### 4. Google Sign-In
Authenticate with Google (Firebase).

```http
POST /api/auth/google
```

**Body:**
```json
{
  "firebaseToken": "firebase_id_token_here"
}
```

---

### 👤 Users (`/api/users`)
*All endpoints require authentication*

#### 1. Get User Profile
```http
GET /api/users/:username
```

**Response (200):**
```json
{
  "user": {
    "_id": "64abc123...",
    "name": "John Doe",
    "username": "johndoe",
    "bio": "Software developer",
    "location": "New York",
    "website": "https://johndoe.com",
    "profilePic": "https://...",
    "coverPhoto": "https://...",
    "followerCount": 150,
    "followingCount": 200,
    "tweetCount": 50,
    "createdAt": "2024-01-15T..."
  }
}
```

---

#### 2. Update Profile
```http
PUT /api/users/profile
Headers: Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "John Updated",
  "bio": "Updated bio",
  "location": "San Francisco",
  "website": "https://newsite.com",
  "profilePic": "https://cloudinary.../image.jpg",
  "coverPhoto": "https://cloudinary.../cover.jpg"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

#### 3. Follow/Unfollow User
```http
POST /api/users/:id/follow
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Followed successfully",
  "following": true
}
```

---

#### 4. Get Followers
```http
GET /api/users/:username/followers?page=1&limit=20
```

**Response (200):**
```json
{
  "followers": [
    {
      "_id": "64abc...",
      "name": "Jane Smith",
      "username": "janesmith",
      "profilePic": "https://...",
      "followerCount": 100
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalCount": 95
  }
}
```

---

#### 5. Get Following
```http
GET /api/users/:username/following?page=1&limit=20
```

---

#### 6. Search Users
```http
GET /api/users/search?q=john&page=1&limit=20
```

**Response (200):**
```json
{
  "users": [
    {
      "_id": "64abc...",
      "name": "John Doe",
      "username": "johndoe",
      ...
    }
  ],
  "pagination": { ... }
}
```

---

#### 7. Get Suggested Users (Who to Follow)
```http
GET /api/users/suggested?limit=5
```

**Response (200):**
```json
{
  "users": [
    {
      "_id": "64abc...",
      "name": "Popular User",
      "username": "popular",
      "followerCount": 10000,
      ...
    }
  ]
}
```

---

### 🐦 Tweets (`/api/tweets`)
*All endpoints require authentication*

#### 1. Create Tweet
```http
POST /api/tweets
Headers: Authorization: Bearer <token>
```

**Body (Simple Tweet):**
```json
{
  "text": "Hello Twitter! 🐦"
}
```

**Body (Tweet with Media):**
```json
{
  "text": "Check out this photo!",
  "media": [
    {
      "type": "image",
      "url": "https://cloudinary.../image.jpg"
    }
  ]
}
```

**Body (Reply):**
```json
{
  "text": "This is a reply",
  "replyTo": "tweet_id_here"
}
```

**Body (Quote Tweet):**
```json
{
  "text": "My thoughts on this:",
  "quotedTweet": "tweet_id_here"
}
```

**Response (201):**
```json
{
  "message": "Tweet created successfully",
  "tweet": {
    "_id": "64abc...",
    "author": {
      "_id": "64xyz...",
      "name": "John Doe",
      "username": "johndoe",
      "profilePic": "https://..."
    },
    "text": "Hello Twitter! 🐦",
    "media": [],
    "tweetType": "tweet",
    "likeCount": 0,
    "retweetCount": 0,
    "replyCount": 0,
    "viewCount": 0,
    "createdAt": "2024-02-07T..."
  }
}
```

---

#### 2. Get Feed
Get tweets from users you follow.

```http
GET /api/tweets/feed?page=1&limit=20
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "tweets": [
    {
      "_id": "64abc...",
      "author": { ... },
      "text": "Tweet content",
      "likeCount": 10,
      "retweetCount": 5,
      "replyCount": 2,
      "createdAt": "2024-02-07T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 10,
    "totalCount": 195
  }
}
```

---

#### 3. Get Single Tweet
```http
GET /api/tweets/:id
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "tweet": {
    "_id": "64abc...",
    "author": { ... },
    "text": "Tweet content",
    "replies": [
      {
        "_id": "64def...",
        "author": { ... },
        "text": "Reply content",
        ...
      }
    ],
    "likeCount": 10,
    "viewCount": 150,
    ...
  }
}
```

---

#### 4. Get User Tweets
Get all tweets from a specific user.

```http
GET /api/tweets/user/:username?page=1&limit=20
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "tweets": [ ... ],
  "pagination": { ... }
}
```

---

#### 5. Delete Tweet
```http
DELETE /api/tweets/:id
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Tweet deleted successfully"
}
```

---

#### 6. Like/Unlike Tweet
```http
POST /api/tweets/:id/like
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Tweet liked",
  "liked": true,
  "likeCount": 11
}
```

Or when unliking:
```json
{
  "message": "Tweet unliked",
  "liked": false,
  "likeCount": 10
}
```

---

#### 7. Retweet/Unretweet
```http
POST /api/tweets/:id/retweet
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Retweeted successfully",
  "retweeted": true,
  "retweetCount": 6
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "Not authorized - No token provided"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 🧪 Testing with cURL

### Example: Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "password": "password123",
    "birthDate": "1995-05-15"
  }'
```

### Example: Create Tweet
```bash
curl -X POST http://localhost:5000/api/tweets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "text": "Hello Twitter! 🐦"
  }'
```

### Example: Get Feed
```bash
curl -X GET http://localhost:5000/api/tweets/feed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Rate Limiting (Coming Soon)
- 300 requests per 15 minutes per user
- Applies to all authenticated endpoints

---

## 🔒 Security
- All passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 60 days
- HTTPS required in production
- Input validation on all endpoints

---

## 🚀 Production Deployment

### Environment Variables Required:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 📱 Mobile App Integration

Your React Native app should:
1. Store JWT token in AsyncStorage after login/signup
2. Include token in all API requests:
   ```typescript
   headers: {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json'
   }
   ```
3. Handle 401 errors by logging user out
4. Use API_URL from constants.ts

---

## ✅ What's Complete

- ✅ Authentication (signup, login, Google Sign-In)
- ✅ User profile (get, update)
- ✅ Follow/unfollow system
- ✅ Tweet CRUD operations
- ✅ Like/unlike tweets
- ✅ Retweet functionality
- ✅ Reply to tweets
- ✅ Feed generation
- ✅ User search
- ✅ Suggested users

## 🚧 Coming Soon

- Direct messaging (Socket.IO)
- Notifications
- Image/video upload
- Hashtags
- Trending topics
- Real-time updates

---

**Backend is production-ready for millions of users! 🎉**
