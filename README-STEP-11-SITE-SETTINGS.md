# Step 11 — Site Settings CMS

This project includes a protected Site Settings screen at `/admin/settings` for updating the public model profile and contact details without editing source code.

## Settings available

- Public profile name and biography
- Profile image selected from published gallery images
- Location, height, clothing size, shoe size, languages, and specialties
- Email and phone
- Instagram, TikTok, and YouTube URLs
- Accepting bookings toggle

## API and security notes

- `GET` and `PATCH /api/admin/settings` require an authenticated admin.
- Updates are validated with Zod.
- Profile images must match a published image in the existing gallery.
- Public portfolio cache is revalidated after settings are saved.
- This step uses the existing `SiteSettings` Prisma model; it does not add a migration.

## Local verification

```bash
npm install
npx prisma generate
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:3000/admin/settings` after signing in. Verify that settings can be saved, then check the public About, Contact, Hero fallback, Footer, and booking availability behavior.

## Deployment checklist

- Configure the production `DATABASE_URL` and `AUTH_SECRET`.
- Set `NEXT_PUBLIC_SITE_URL` to the real canonical public URL.
- Confirm admin authentication is enabled and public visitors cannot access `/api/admin/settings`.
- Run the typecheck and production build before deploying.

Build/typecheck status was not verified in the preparation environment because dependency installation timed out. Treat local verification as required before production deployment.
