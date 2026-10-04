# Model Portfolio — Step 07: Video CMS

This milestone adds a database-driven video CMS and connects the public video section to published PostgreSQL records.

## Included

- Admin video upload
- MP4, WebM and MOV support
- 100 MB maximum video size
- Optional poster/thumbnail image
- 5 MB maximum poster size
- Video preview/player inside admin
- Edit title and description
- Publish / unpublish
- Delete video and local poster
- Published / draft filtering
- Video ordering
- Public video section now reads only `published = true`
- Local development storage adapter
- `package.json` included

## Run

From the project root:

```bash
npm install
npx prisma generate
npm run dev
```

Then:

```text
http://localhost:3000/admin/videos
```

## Existing Prisma schema

No database migration is required for this milestone because the existing `Media` model already supports:

```text
type = VIDEO
url
thumbnail
title
description
published
sortOrder
size
```

## Production note

Local files under:

```text
public/uploads/videos
public/uploads/video-thumbnails
```

are intended for local development.

For production, replace the storage implementation with Cloudinary, Amazon S3, Cloudflare R2, or another persistent object-storage/CDN provider. The PostgreSQL `Media` record should continue storing only URLs and metadata.

The next milestones can build on this abstraction without changing the public/admin UI architecture.
