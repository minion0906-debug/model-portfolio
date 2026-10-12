# Production Media Storage Fix

This upgrade makes image/video storage safer for deployed environments.

## Required production variables

MEDIA_STORAGE=s3
S3_BUCKET=your_bucket
S3_REGION=auto
S3_ENDPOINT=https://your-endpoint
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_PUBLIC_URL=https://cdn.your-domain.com

Do not use public/uploads as permanent production storage on serverless hosting.
