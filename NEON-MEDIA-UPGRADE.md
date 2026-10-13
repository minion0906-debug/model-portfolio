# Neon Postgres Media Upload Upgrade

This version removes dependency on Vercel writable storage.

Media is stored in Neon Postgres using Prisma `MediaBlob`.

Required env:

DATABASE_URL=your_neon_connection_string

After deployment:

npx prisma migrate dev --name add_media_blob
npx prisma generate

No S3 variables are required.
