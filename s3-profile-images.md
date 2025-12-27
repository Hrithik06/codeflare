# Secure User Profile Images with AWS S3 (Presigned URLs)

## Overview
This guide documents how to securely upload and serve private user profile images using AWS S3 with presigned URLs and least-privilege IAM.

## Architecture
Two IAM users:
- Uploader: can PutObject only
- Reader: can GetObject only

## S3 Bucket
- Name: myapp-profile-images
- Block all public access
- Bucket owner enforced

## IAM Policies
### Upload
Allow s3:PutObject, s3:AbortMultipartUpload on arn:aws:s3:::myapp-profile-images/*

### Read
Allow s3:GetObject on arn:aws:s3:::myapp-profile-images/*

## Environment Variables
S3_UPLOAD_KEY, S3_UPLOAD_SECRET
S3_READ_KEY, S3_READ_SECRET
AWS_REGION, S3_BUCKET

## Install
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

## Upload URL
Use PutObjectCommand + getSignedUrl with 10 min expiry.

## Download URL
Use GetObjectCommand + getSignedUrl with 5 min expiry.

## Key Design
Use paths like profiles/{userId}/photo.jpg

## Testing
Use curl for PUT, browser for GET.

## CORS
Only required for browser direct access.

## Security Notes
Backend controls which keys are signed. IAM enforces allowed actions.
