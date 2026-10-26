# Whisperly 🤫

**Whisperly** is an anonymous messaging app (a Saraha-style app) with a full authentication system, built with **Node.js**, **Express**, and **MongoDB**.

Anyone can send an anonymous "whisper" to a registered user. Users sign up, confirm their email with an OTP, log in with JWT, and read the whispers they receive.

> Originally built as **Assignment 8 – Saraha App** (Week 11), re-branded as *Whisperly*.

---

## ✨ Features

- 🔐 **Full authentication**
  - Register with email + password (hashed with bcrypt)
  - Email confirmation via a 6-digit **OTP** (Nodemailer)
  - OTP codes stored in **Redis** with an automatic **TTL** (self-expiring)
  - Login with **JWT** access tokens
  - Resend OTP
  - Forgot password / reset password (OTP based)
- 💬 **Anonymous messaging (Saraha core)**
  - Send an anonymous whisper to any confirmed user
  - Read the whispers you received (protected)
  - Delete your own whispers
- 🖼️ **File uploads (Multer)**
  - Upload / replace a profile picture
  - Two-layer validation: file filter (mime type) **and magic-number** check (real file content)
  - Files saved to disk and served as static files from Express
- ⚡ **Caching (Redis)**
  - `with-cache` middleware for GET endpoints (public profile)
  - Automatic cache invalidation on update
  - Degrades gracefully — if Redis isn't configured, caching is simply skipped
- 🛡️ **Graceful shutdown**
  - Closes the HTTP server, MongoDB and Redis cleanly on SIGINT/SIGTERM
- 🧱 **Clean, professional architecture (from the course)**
  - MVC / modular folder structure
  - Custom **`AppError`** class (OOP, extends `Error`)
  - Central async error handler (`asyncHandler` + global handler)
  - Custom **`Logger`** class
  - **Dependency Inversion** for the email layer (`EmailService` depends on an `EmailProvider` abstraction, not on Nodemailer directly)
  - Joi request validation middleware
  - JWT authentication + role authorization middleware

---

## 🧰 Tech Stack

| Area        | Tool                         |
| ----------- | ---------------------------- |
| Runtime     | Node.js (ESM)                |
| Framework   | Express                      |
| Database    | MongoDB + Mongoose           |
| Auth        | JWT + bcryptjs               |
| Validation  | Joi                          |
| Email       | Nodemailer (Gmail)           |
| Uploads     | Multer (+ magic-number check)|
| Cache       | Redis (ioredis)              |

---

## 📁 Folder Structure

```
Whisperly/
├── index.js                     # Entry point
├── .env.example                 # Environment variables template
├── src/
│   ├── app.controller.js        # App bootstrap (middleware + routes + error layer)
│   ├── DB/
│   │   ├── connection.js
│   │   └── models/
│   │       ├── user.model.js
│   │       └── message.model.js
│   ├── middleware/
│   │   ├── authentication.middleware.js
│   │   └── validation.middleware.js
│   ├── modules/
│   │   ├── auth/                 # register / confirm / login / otp / reset
│   │   ├── user/                 # profile / public profile / my messages
│   │   └── message/             # send / delete anonymous whispers
│   ├── middleware/
│   │   ├── authentication.middleware.js
│   │   ├── validation.middleware.js
│   │   └── withCache.middleware.js   # Redis response cache
│   └── utils/
│       ├── error/               # AppError (OOP) + error handler
│       ├── logger/              # custom Logger class
│       ├── email/               # EmailProvider (abstraction) + Nodemailer + service
│       ├── otp/                 # OTP generation + Redis store (with TTL)
│       ├── upload/              # Multer config + magic numbers + saveFile
│       ├── cache/              # Redis client wrapper
│       └── security/            # hashing + JWT
├── uploads/                     # Uploaded files (served statically)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string
- Redis — stores OTP codes (with TTL) and backs response caching

### 2. Install
```bash
npm install
```

### 3. Configure environment
Copy the example file and fill in your values:
```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `PORT` | Server port (default 3000) |
| `DB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret used to sign JWTs |
| `JWT_ACCESS_EXPIRES_IN` | Token lifetime (e.g. `1d`) |
| `SALT_ROUNDS` | bcrypt salt rounds |
| `OTP_EXPIRES_IN_MINUTES` | OTP validity window |
| `EMAIL_USER` / `EMAIL_PASSWORD` | Gmail + App Password for Nodemailer |
| `EMAIL_FROM` | The "from" address shown in emails |
| `REDIS_URL` | Redis connection string (OTP storage + caching) |
| `CACHE_TTL_SECONDS` | Default cache lifetime in seconds |

> **Gmail tip:** use a [Google App Password](https://myaccount.google.com/apppasswords), not your normal password.

### 4. Run
```bash
npm run dev    # auto-restart on changes
# or
npm start
```

Server: `http://localhost:3000`

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

### Auth
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | ❌ | Register a new user + send OTP |
| POST | `/auth/confirm-email` | ❌ | Confirm account with OTP |
| POST | `/auth/login` | ❌ | Login, returns JWT |
| POST | `/auth/resend-otp` | ❌ | Resend an OTP code |
| POST | `/auth/forgot-password` | ❌ | Send password reset OTP |
| POST | `/auth/reset-password` | ❌ | Reset password with OTP |

### User
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/user/profile` | ✅ | My profile |
| GET | `/user/messages` | ✅ | Whispers I received |
| POST | `/user/profile/image` | ✅ | Upload/replace profile picture (form-data, field `image`) |
| GET | `/user/:id` | ❌ | Public profile (cached) — to send a whisper |

> Uploaded images are served statically, e.g. `GET /uploads/users/<file>.jpg`.

### Message
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/message/:receiverId` | ❌ | Send an anonymous whisper |
| DELETE | `/message/:id` | ✅ | Delete one of my whispers |

**Auth header for protected routes:**
```
Authorization: Bearer <your_jwt_token>
```

---

## 📮 Postman

**📖 Published API documentation:** https://documenter.getpostman.com/view/49920929/2sBYB2s8QY

A ready-to-use collection is also included in the repo: [`Whisperly.postman_collection.json`](./Whisperly.postman_collection.json).

Import it into Postman. It uses these variables:
- `baseUrl` (default `http://localhost:3000`)
- `token` (auto-filled after a successful login)
- `receiverId` / `messageId` (auto-filled by test scripts)

---

## 📄 License

MIT
