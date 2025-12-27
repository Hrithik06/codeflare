# Secure User Profile Images with AWS S3 (Presigned URLs)

This document explains **every step** we took to design, implement, debug, and validate a **secure profile image upload & download system** using AWS S3.

The focus is not just *what* we did, but *why* each decision was made.

---

## 1. Problem We Are Solving

We want users to:
- Upload their own profile photo
- View other users’ profile photos

While ensuring:
- S3 is **never public**
- AWS credentials are **never exposed to frontend**
- A bug or leaked key has **limited blast radius**

---

## 2. Core Design Decision: Split Read and Write

Instead of one powerful identity, we deliberately split responsibilities.

### Why?

Reading and writing are **different risks**:
- Read leak → privacy breach
- Write leak → data corruption

So we created **two IAM users**.

### IAM Users

```text
myapp-backend-profile-image-uploader
myapp-backend-profile-image-reader
```

This ensures:
- Upload credentials can never read files
- Read credentials can never overwrite files

This is called **least privilege + blast radius reduction**.

---

## 3. S3 Bucket Setup

Bucket name:
```text
myapp-profile-images
```

Bucket configuration:
- ✅ Block all public access
- ✅ Object ownership: Bucket owner enforced

This guarantees:
- No object can ever be public
- ACLs cannot accidentally override security

---

## 4. IAM Policies (Most Important Part)

### Upload Policy

Attached to:
```text
myapp-backend-profile-image-uploader
```

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:PutObject",
    "s3:AbortMultipartUpload"
  ],
  "Resource": "arn:aws:s3:::myapp-profile-images/*"
}
```

Why only these?
- `PutObject` → upload file
- `AbortMultipartUpload` → cleanup failed uploads

❌ No Get
❌ No Delete
❌ No List

---

### Read Policy

Attached to:
```text
myapp-backend-profile-image-reader
```

```json
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::myapp-profile-images/*"
}
```

This user can only read objects — nothing else.

---

## 5. Access Keys

Each IAM user gets **its own access keys**.

Why two keys?
- Presigned URLs are signed using the identity’s permissions
- AWS enforces what the URL can do

### Environment Variables

```env
S3_UPLOAD_KEY=...
S3_UPLOAD_SECRET=...

S3_READ_KEY=...
S3_READ_SECRET=...

AWS_REGION=ap-south-1
S3_BUCKET=myapp-profile-images
```

⚠️ These keys are **backend-only**.

---

## 6. Installing Required Packages

We only install what is actually needed.

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Why only these two?
- `client-s3` → S3 commands
- `s3-request-presigner` → generate signed URLs

No v2 SDK. No extras.

---

## 7. Creating Two S3 Clients

We create **two separate S3 clients**, each with different credentials.

```js
import { S3Client } from "@aws-sdk/client-s3";

export const uploadClient = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_KEY,
    secretAccessKey: process.env.S3_UPLOAD_SECRET,
  },
});

export const readClient = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_READ_KEY,
    secretAccessKey: process.env.S3_READ_SECRET,
  },
});
```

This guarantees:
- Upload URLs can never become read URLs
- Read URLs can never upload

---

## 8. Object Key Design (Critical)

S3 does **not** understand users.

The *key string* defines ownership.

### Correct Pattern

```text
profiles/<userId>/photo.jpg
```

Example:
```text
profiles/9f23ab3/avatar.png
```

Your backend must enforce:
- User can only sign URLs for their own key

AWS does **not** enforce this.

---

## 9. Generate Upload Presigned URL

```js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { uploadClient } from "./s3Clients";

export async function getUploadUrl(key) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(uploadClient, command, {
    expiresIn: 600, // 10 minutes
  });
}
```

Why no Content-Type?
- Browsers and tools add extra headers
- Signed headers must match **exactly**

Leaving it flexible prevents failures.

---

## 10. Generate Download Presigned URL

```js
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { readClient } from "./s3Clients";

export async function getDownloadUrl(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(readClient, command, {
    expiresIn: 300, // 5 minutes
  });
}
```

Short expiry limits damage if a URL leaks.

---

## 11. Testing Without Frontend

### Upload Test (curl)

```bash
curl -X PUT \
  --data "Hello from test" \
  "SIGNED_UPLOAD_URL"
```

### Download Test

Paste the signed GET URL in browser.

This isolates:
- IAM
- S3
- Signing

No CORS involved yet.

---

## 12. Why Bruno/Postman Failed

These tools send:
```text
multipart/form-data
```

But presigned PUT expects:
```text
raw bytes
```

curl works because it sends raw data.
Browsers work because `fetch(blob)` sends raw bytes.

---

## 13. CORS (Frontend Only)

CORS is needed **only when browser JS talks to S3**.

```json
[
  {
    "AllowedOrigins": ["https://yourapp.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

Backend does **not** require CORS.

---

## 14. Expiry Strategy

| Action | Expiry |
|------|-------|
| Upload during signup | 10 minutes |
| Download profile image | 2–5 minutes |

Uploads need tolerance.
Downloads need protection.

---

## 15. Final Security Model

| Layer | Responsibility |
|------|---------------|
| IAM | What actions are allowed |
| Backend | Which object is allowed |
| Presigned URL | Time-limited access |
| S3 | Enforces cryptographic signature |

No public buckets.
No frontend credentials.

---

## 16. What You Achieved

- Production-grade S3 security
- Least-privilege IAM
- Correct presigned URL usage
- Clean debugging methodology

This is **real backend engineering**, not tutorial code.

