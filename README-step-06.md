# Model Portfolio — Step 06: Gallery CMS

This milestone adds the authenticated admin gallery manager.

## Included

- Multi-image upload
- JPG, PNG and WebP validation
- 10 MB maximum per image
- 20-image maximum per upload
- Local image previews before upload
- Image metadata stored in PostgreSQL
- Local development media storage under `public/uploads/gallery`
- Edit image title and description
- Publish / unpublish
- Delete image
- Published / draft filtering
- Move images up/down to control public gallery order
- API routes protected by the existing admin session
- Existing remote demo images are safe to delete because only local `/uploads/gallery/*` files are removed from disk

## Run

From the project root:

```bash
npm install
npx prisma generate
npm run dev
```

Then open:

```text
http://localhost:3000/admin/gallery
```

Sign in through:

```text
http://localhost:3000/admin/login
```

## Important production note

This step deliberately uses local disk storage so the CMS works immediately during local development.

For a production deployment such as Vercel, do **not** rely on `public/uploads` as permanent media storage because serverless filesystems can be ephemeral.

The storage layer is isolated in:

```text
src/lib/media-storage.ts
```

The next production media milestone can replace this adapter with Cloudinary, S3, R2, or another object-storage/CDN provider while keeping PostgreSQL responsible for media metadata.
