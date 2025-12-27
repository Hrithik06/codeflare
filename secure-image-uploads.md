# Secure Image Uploads to AWS S3 (React + Backend + Presigned URLs)

This document explains how to securely allow **only image uploads** (e.g., user profile photos) to an S3 bucket using a modern production-grade architecture.

---

## 🎯 Goal

Allow users to upload **only images** to S3:
- No PDFs
- No executables
- No renamed files pretending to be images

Uploads should happen directly from the browser to S3 using **presigned URLs**.

---

## ❗ Important Realization

This:

```js
ContentType: "image/png"
```
does not restrict what can be uploaded.
It only sets metadata unless it is used inside a presigned URL.

Also:

S3 does not support image/* in PutObjectCommand

It must be an exact MIME type (image/png, image/jpeg, etc)

## 🧱 The 3-Layer Security Model
### 1️⃣ Frontend (UX only)
```html
<input type="file" accept="image/*" />
```

This only helps users pick image files.
It does not provide security.

Attackers can bypass it.

### 2️⃣ Backend (Real Security)

Your backend must:

1. Receive:
  - filename
  - mimeType

2. Validate the type

3. Generate a presigned URL locked to that MIME type

Example:
```js
const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
];

if (!allowedTypes.includes(mimeType)) {
  throw new Error("Only image uploads allowed");
}

const command = new PutObjectCommand({
  Bucket: BUCKET,
  Key: key,
  ContentType: mimeType
});
```

Because the MIME type is part of the signature:

- If the browser changes it → upload fails

- If attacker lies → upload fails

### 3️⃣ S3 Bucket Policy (Final Firewall)

Add this policy to your S3 bucket:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyNonImageUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*",
      "Condition": {
        "StringNotLike": {
          "s3:content-type": "image/*"
        }
      }
    }
  ]
}
```

This tells S3:

> “Reject any upload whose Content-Type is not an image.”

Even if:

- Your backend has a bug
- Someone manually crafts a request
- Someone renames .exe → .png

S3 will block it.

## 🖥 Local vs Production

This policy works the same for:
- localhost
- EC2
- Vercel
- anywhere

S3 only cares about:
- IAM credentials
- Request signature
- Request headers

Not where the request came from.

## 🏆 Final Result

You now have four layers of protection:

| Layer                   | Protects Against       |
|-------------------------|------------------------|
| React `accept="image/*"`  | User mistakes          |
| Backend validation      | Fake MIME types        |
| Presigned URL signature | Header tampering       |
| S3 Bucket Policy        | Backend bugs & attacks |

This is the same security model used by large platforms (Slack, Dropbox, Instagram, etc).
