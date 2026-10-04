# Step 13 — Production Media System

This milestone replaces the hard-coded local media implementation with a storage abstraction that supports production object storage.

## Included

- S3-compatible media storage
- AWS S3 / Cloudflare R2 / MinIO-compatible configuration
- Local filesystem fallback for development
- Image optimization with Sharp
- Uploaded images converted to WebP
- Image rotation/metadata normalization
- Video thumbnail optimization to WebP
- Long-lived immutable cache headers for object storage
- Protected gallery upload endpoint
- Protected video upload endpoint
- Safe object deletion
- `package.json`
- Production environment template

## Storage behavior

Development:

```env
MEDIA_STORAGE=local
```

Media is stored under:

```text
public/uploads/gallery
public/uploads/videos
public/uploads/video-thumbnails
```

Production:

```env
MEDIA_STORAGE=s3
```

Files are stored in:

```text
gallery/*
videos/*
video-thumbnails/*
```

The public URL is generated from `S3_PUBLIC_URL`.

## Cloudflare R2

R2 works through its S3-compatible API. Use:

```env
MEDIA_STORAGE=s3
S3_BUCKET=your-bucket
S3_REGION=auto
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=https://cdn.yourdomain.com
S3_FORCE_PATH_STYLE=false
```

Use a custom CDN/domain for `S3_PUBLIC_URL` rather than exposing private bucket credentials.

## AWS S3

Use the S3 regional endpoint:

```env
S3_ENDPOINT=https://s3.us-east-1.amazonaws.com
S3_REGION=us-east-1
```

Configure a CDN such as CloudFront in front of the bucket and use that CDN URL as `S3_PUBLIC_URL`.

## Important production note

The current admin upload endpoints still receive files through the Next.js server. This is a deliberate compatibility step with the existing CMS.

For very large video libraries, the next media milestone should switch the browser to direct-to-object-storage multipart uploads using short-lived signed URLs. That avoids routing large video files through the application server.

## Install

```bash
npm install
npx prisma generate
npm run dev
```

No Prisma migration is required.

## New dependency

- `@aws-sdk/client-s3`
- `sharp`

Both are included in `package.json`.
