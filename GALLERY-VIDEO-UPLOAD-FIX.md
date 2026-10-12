# Gallery and video upload fix (Vercel)

This project uses browser-to-object-storage uploads so large videos do not pass through a Vercel Function body limit. A persistent S3-compatible bucket is required in Vercel. The app filesystem is ephemeral and must not be used as media storage in production.

## Required Vercel environment variables

Set these in **Vercel → Project → Settings → Environment Variables** for both Preview (use a separate test bucket) and Production (use the production bucket), then redeploy:

- `MEDIA_STORAGE=s3`
- `S3_BUCKET` — bucket name
- `S3_REGION` — region expected by your provider (`auto` for Cloudflare R2)
- `S3_ENDPOINT` — S3 API endpoint, not the public CDN URL
- `S3_ACCESS_KEY_ID` — key with permission to put and head objects in this bucket
- `S3_SECRET_ACCESS_KEY` — matching secret
- `S3_PUBLIC_URL` — public base URL for media, without a trailing slash, e.g. your bucket's public custom domain

Never set the access key or secret in a `NEXT_PUBLIC_*` variable, and do not commit them to Git.

### Provider examples

- **Cloudflare R2:** endpoint normally looks like `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, region `auto`. `S3_PUBLIC_URL` should be the R2 custom domain or public bucket URL you have configured.
- **AWS S3:** use the bucket's region and the S3 API endpoint for that region. `S3_PUBLIC_URL` should be the URL/domain from which objects are actually readable.
- Other providers: use their S3-compatible endpoint, region, access keys, and public media domain.

Do not copy these examples literally with placeholder values.

## Bucket CORS is required

Because the browser uploads directly to the bucket, the bucket's CORS policy must allow the exact domain where the admin page is open. Configure your storage provider with a rule equivalent to:

```json
[
  {
    "AllowedOrigins": [
      "https://YOUR-PRODUCTION-DOMAIN",
      "https://YOUR-PREVIEW-DOMAIN.vercel.app"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Replace the example origins with your real origins (scheme included, no path). Add each Preview domain you actually use. Avoid `*` for production origins if the provider supports explicit origins. CORS is configured in the storage provider, not in Next.js.

## Test

1. Redeploy after setting the Vercel environment variables.
2. Sign in to `/admin`.
3. Upload one small JPG/PNG/WebP first. Confirm it appears in the gallery as hidden/unpublished.
4. Publish it and confirm the public image URL loads.
5. Upload a small MP4 next. Confirm it appears in the video manager and plays.
6. If upload progress fails before reaching 100%, inspect the browser console/network tab and Vercel function logs. A browser “network error” on the PUT commonly indicates a bucket CORS rule or incorrect `S3_ENDPOINT`.
7. If progress reaches 100% but saving fails, the object may already be in the bucket. Check `/api/admin/uploads/complete` response and the Vercel function logs; confirm `DATABASE_URL` points at the right PostgreSQL database and the Prisma `Media` table is present.

## Important

- Do not run `prisma db push`, `prisma migrate reset`, or any destructive database command to fix uploads.
- The old server-side upload endpoints are not a reliable production fallback on Vercel for large files. This upload UI intentionally reports missing object-storage configuration instead of silently writing to the ephemeral deployment filesystem.
- A failed database finalization can leave an unreferenced object in the bucket. You can clean up such orphaned objects after verifying they are not referenced by any media record.
