
---

# 📘 Backend – Social Matching Application

Backend for a social matching platform providing **authentication, profile management, connection requests, real-time chat, email notifications, and background jobs**.

---

## 🚀 Tech Stack

* **Node.js + Express**
* **TypeScript**
* **MongoDB + Mongoose**
* **JWT Authentication (Cookies)**
* **Socket.IO**
* **AWS S3 (Presigned URLs)**
* **Zod** – request & payload validation
* **node-cron**
* **PM2**
* **Brevo (Sendinblue)** – transactional emails

---

## 🧱 Architecture Overview

* REST APIs for core application logic
* WebSocket (Socket.IO) for real-time chat
* JWT-based authentication shared between **HTTP & WebSocket**
* Middleware-driven authorization & validation
* Single EC2 deployment with Cloudflare DNS & SSL

---

## 🔐 Authentication & Authorization

### JWT Strategy

* JWT stored in **HTTP-only cookies**
* Valid for **24 hours**
* Used for:

  * REST APIs
  * Socket.IO authentication

---

### `userAuth.ts` (HTTP Middleware)

* Extracts JWT from cookies
* Verifies token
* Fetches user from DB
* Attaches sanitized user to request

```ts
req.user = foundUser; // password omitted
```

Used by all protected REST routes.

---

## 🔌 Socket Authentication (WebSockets)

### `socketAuth.ts` Middleware

* Applied globally to Socket.IO server
* Uses **same JWT cookie** as REST APIs
* Flow:

  1. Extracts `token` from `socket.handshake.headers.cookie`
  2. Verifies JWT
  3. Fetches user from DB
  4. Attaches minimal user context to `socket.data.user`

```ts
socket.data.user = {
  _id,
  firstName,
  lastName
};
```

If auth fails:

* `UNAUTHORIZED`
* `USER_NOT_FOUND`
* `INVALID_SESSION`

✅ This ensures **only authenticated users can establish socket connections**

---

## 🧾 Validation Strategy

* **Zod** schemas used everywhere:

  * REST routes
  * Socket events
* Each REST route has its own validation middleware
* Validated data is attached to:

```ts
req.validatedData
```

For sockets, invalid payloads emit structured errors instead of crashing connections.

---

## 📦 REST API Routes

### 🔑 Auth (`auth.ts`)

* `POST /signup`
* `POST /login`
* `GET /logout`

Responsibilities:

* User creation
* Password hashing
* JWT issuance
* Cookie handling

---

### 👤 Profile (`profile.ts`)

* `GET /profile/view`
* `PATCH /profile/edit`

---

### 🖼️ Profile Image Upload (AWS S3)

**Presigned URL strategy (no file passes through backend)**

* `POST /profile/upload-url`

  * Validates content type (`jpeg | jpg | png`)
  * Returns presigned upload URL

* `POST /profile/image/confirm`

  * Stores metadata:

```ts
profileImageMeta: {
  key,
  contentType,
  isUserUploaded: true,
  imageVersion: Date.now()
}
```

* `POST /profile/download-url`

  * Returns presigned download URL

---

### 🔁 Connection Requests (`request.ts`)

* `POST /request/send/:status/:toUserId`

  * Status: `interested`, `ignored`
  * Blocks users with incomplete profiles
  * Prevents duplicate requests

* `POST /request/review/:status/:requestId`

  * Status: `accepted`, `rejected`
  * Ensures ownership and valid state transition

---

### 👥 Users (`user.ts`)

* `GET /user/requests/received`
* `GET /user/connections`
* `GET /user/feed`

Feed logic excludes:

* Logged-in user
* Existing connections
* Previously interacted users

---

### 💬 Chat REST (`chat.ts`)

* `GET /chat/:targetUserId`
* Ensures users are connected (`accepted`)
* Fetches or creates chat document
* Returns past messages and participant info

---

### 📨 Contact Us (`contactUs.ts`)

* `POST /contact-us`
* Uses `req.user` from JWT
* Sends email to site admin

---

## 🔊 Real-Time Chat (Socket.IO)

### Initialization (`utils/socketIO.ts`)

* Socket.IO initialized on HTTP server
* CORS restricted to frontend origin
* Global socket authentication applied

```ts
socketAuth(io);
```

---

### Socket Events

#### `joinChat`

* Payload validated using Zod
* Verifies:

  * User is a participant of the chat
* Joins chat room using `chatId` as room ID

Errors emitted as structured events:

```ts
{
  code,
  message,
  context,
  retryable
}
```

---

#### `sendMessage`

* Payload validated via Zod
* Single DB operation:

  * Confirms sender is participant
  * Pushes message atomically

```ts
ChatModel.updateOne(
  { _id: chatId, participants: senderUserId },
  { $push: { messages: { senderId, text } } }
);
```

* Broadcasts message to room:

```ts
io.to(roomId).emit("messageReceived", {...});
```

🚀 Optimized to avoid multiple DB calls per message

---

### Error Handling Strategy (Sockets)

* All socket errors emitted via `app_error` event
* Errors are:

  * Machine-readable (`code`)
  * User-safe (`message`)
  * Context-aware (`joinChat`, `sendMessage`)
  * Retry-aware (`retryable`)

---

## 📧 Email Service (`utils/emailBuilder.ts`)

Uses **Brevo (Sendinblue)** transactional emails.

### Supported Emails

#### 1️⃣ Pending Connection Reminder

* Triggered by cron job
* Sends daily summary of pending requests

#### 2️⃣ Contact Form Submission

* Sends message to site admin
* Includes sender details from JWT

Templates are managed in Brevo dashboard.

---

## ⏰ Cron Job

Runs **daily at 8:00 AM IST**

Purpose:

* Find connection requests with status `interested`
* Created in the previous day
* Deduplicate recipients
* Send reminder emails

Timezone-safe:

```ts
timezone: "Asia/Kolkata"
```

---

## 🛠️ Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET_KEY=your_secret

AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
AWS_S3_BUCKET_NAME=xxxx

BREVO_API_KEY=xxxx
SITE_ADMIN_EMAIL_FOR_BREVO=xxxx
NO_REPLY_BREVO=xxxx
CONTACT_FORM_NO_REPLY_BREVO=xxxx
```

A sample file with all required Environment Variables is provided:

`.env.example`

---

## ▶️ Running Locally

```bash
pnpm install
pnpm run dev
```

---

## 🚀 Production

* Managed with **PM2**
* `ecosystem.config.cjs` used for process control
* Deployed on **AWS EC2**
* **Cloudflare** used for DNS & SSL

---
