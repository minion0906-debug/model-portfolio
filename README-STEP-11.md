# Step 11 — Site Settings CMS

This milestone adds a PostgreSQL-backed Site Settings CMS and connects the public portfolio to those settings.

## Included

- Admin Site Settings page at `/admin/settings`
- Profile name
- Public biography
- Profile image selector using published gallery images
- Email
- Phone
- Instagram URL
- TikTok URL
- YouTube URL
- Accepting bookings toggle
- Protected GET/PATCH settings API
- Automatic creation of the settings row when missing
- Public settings helper
- About section now uses CMS profile data
- Contact section now displays CMS contact/social information
- Booking section closes when accepting bookings is disabled
- Footer uses the CMS name
- Hero fallback title uses the CMS name
- `package.json` included

## Run

```bash
npm install
npx prisma generate
npm run dev
```

Open:

- Public site: `http://localhost:3000`
- Admin settings: `http://localhost:3000/admin/settings`

## Important

The profile image is selected from existing published gallery images, so Step 11 does not introduce a second upload pipeline.

Social fields expect complete URLs, for example:

```text
https://instagram.com/yourname
https://tiktok.com/@yourname
https://youtube.com/@yourname
```

The existing Prisma `SiteSettings` model is used; no schema migration is required for this milestone.

Production recommendations remain:

- object storage/CDN for media
- rate limiting and bot protection on public forms
- email notifications for bookings/contact messages
- strong `AUTH_SECRET`
- production database backups
