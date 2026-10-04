# Step 14 — Direct Browser-to-Storage Uploads

This milestone adds direct browser uploads for production object storage.

## Flow

Instead of:

```text
Browser → Next.js → S3/R2
```

the production upload flow becomes:

```text
Browser → Next.js (request signed URL)
Browser → S3/R2 (upload file)
Browser → Next.js (complete + save metadata)
```

The application server no longer receives the large media payload.

## Included

- Protected presigned upload endpoint
- Protected upload-completion endpoint
- Browser direct-upload component
- Direct image uploads
- Direct video uploads
- Upload size/type validation
- S3/R2 object-key validation
- Server-side object existence check before database creation
- Gallery admin direct-upload UI
- Video admin direct-upload UI
- `package.json`
- Production environment guidance

## Limits

Images:

- JPG / PNG / WebP
- 10MB

Videos:

- MP4 / WebM / MOV
- 500MB

Video thumbnails remain a separate image workflow and can be added to the direct-upload flow in a later media-processing milestone.

## Required production variables

```env
MEDIA_STORAGE=s3
S3_BUCKET=your-bucket
S3_REGION=auto
S3_ENDPOINT=https://your-s3-compatible-endpoint
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=https://cdn.example.com
S3_FORCE_PATH_STYLE=false
```

## Security

The S3 credentials remain server-side. The browser only receives a short-lived presigned PUT URL.

The server validates:

- authenticated admin session
- file type
- file size
- allowed storage folder
- uploaded object existence
- uploaded object size

## Important

This step assumes the S3/R2 bucket is configured for browser PUT requests with the appropriate CORS policy.

Example CORS policy concept:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"]
  }
]
```

For local development, keep using the existing local media storage implementation.

No Prisma migration is required.
