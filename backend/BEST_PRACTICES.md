# Best Practices & Production Readiness

This checklist reflects what is already in place and what to keep in mind for scale and security.

---

## Backend (tweetweb)

### Already in place
- **Auth**: JWT with Bearer token; protected routes; token expiry handling; 401 → app logout.
- **Passwords**: bcrypt (10 rounds) on signup; never returned in API.
- **Validation**: Input validation on signup/login (username, email, password length/format); tweet text length (280).
- **Database**: MongoDB connection pooling (`maxPoolSize: 50`), indexes on Tweet (author, createdAt, etc.), lean queries where used.
- **Real-time**: Socket.IO only (no feed polling) for new tweets; scales better at high user counts.
- **Errors**: Try/catch in controllers; 404/500 handlers; graceful shutdown (SIGTERM/SIGINT).
- **Security (added)**: `helmet` for HTTP security headers; `express-rate-limit` on `/api/` (e.g. 300 req/15 min per IP). Run `npm install helmet express-rate-limit` if not already installed.
- **CORS**: Configurable via `FRONTEND_URL`; avoid `*` in production when you have a known origin.
- **Body limit**: 50MB for media; request timeout 2 min for uploads.
- **Health**: `/health` for DB and Redis; used by Render/load balancers.

### Recommended for production
- Set **FRONTEND_URL** (and/or your mobile app origin) in production; avoid CORS `*` if possible.
- Set **JWT_SECRET** to a long, random value (e.g. 32+ chars); rotate if compromised.
- Use **Redis** for rate-limit store (or session store) when running multiple server instances.
- Optional: **express-mongo-sanitize** to guard against NoSQL injection.
- Optional: Stricter rate limits per route (e.g. lower limit for `/api/auth/login`, higher for read-only feed).

---

## Mobile app (mytweet)

### Already in place
- **Token**: Stored in AsyncStorage; sent as `Authorization: Bearer <token>`; 401 triggers logout and token clear.
- **Socket**: Single listener in FeedScreen; cleanup on unmount (`socket.off`, `socket.disconnect()`).
- **Feed**: Pagination (page/limit); infinite scroll; “new posts” bubble when scrolled down; no polling.
- **API**: Centralized `apiService` with get/post/put/delete; error and 401 handling.

### Recommended
- Keep **API_URL** / **SOCKET_URL** in env or constants; use production URLs in release builds.
- For very heavy use: consider one app-level Socket.IO connection (e.g. context) and subscribe in screens to avoid multiple connections per tab/mount.

---

## Summary

- **Security**: Helmet + rate limiting on API; JWT + bcrypt; validation on inputs.
- **Scale**: Connection pooling; indexes; Socket.IO for real-time (no feed polling); pagination everywhere.
- **Reliability**: Error handling; health check; graceful shutdown; 401 → logout.

Install new backend deps if needed:
```bash
cd backend && npm install helmet express-rate-limit
```
