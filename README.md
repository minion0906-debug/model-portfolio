# Model Portfolio — Step 04

Step 04 connects the public gallery to PostgreSQL through Prisma.

## What changed

- Gallery images now come from PostgreSQL.
- Only `Media` records with `type = IMAGE` and `published = true` are displayed.
- Images are ordered by `sortOrder`.
- Gallery tags are loaded from the `Tag` / `MediaTag` relationship.
- The existing fullscreen lightbox remains in place.
- A seed script creates six demo published images.
- The seed also creates initial site settings.

## 1. Install dependencies

From the project root:

```bash
npm install prisma @prisma/client
npm install -D tsx dotenv
```

## 2. Create your environment file

Copy `.env.example` to `.env` and set your PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/model_portfolio"
```

## 3. Create the database schema

Run:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## 4. Seed demo gallery data

Run:

```bash
npx prisma db seed
```

## 5. Start the site

```bash
npm run dev
```

Open:

http://localhost:3000

## Important

The seed images use Unsplash URLs only as temporary development content.

In the production admin system, images will be uploaded to media/object storage such as Cloudinary or S3-compatible storage. PostgreSQL will store the media metadata and URLs.

Do not put actual uploaded image/video files inside PostgreSQL.
