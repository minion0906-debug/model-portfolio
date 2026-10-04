# Model Portfolio V2 — real auth, storage and database

## Stack
Next.js 14 + Supabase Auth + Supabase Postgres + Supabase Storage.

## Setup
1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. In Authentication > Users, create the model/admin user with email/password.
4. Copy that user's UUID into the final commented INSERT in schema.sql and run it.
5. Copy `.env.example` to `.env.local` and fill in the Supabase URL and anon key.
6. `npm install`
7. `npm run dev`
8. Open `/login`.

## What is real
- Email/password authentication through Supabase Auth.
- Auth-protected dashboard.
- Real Postgres tables for profile, media and bookings.
- Real photo/video uploads to Supabase Storage.
- Row Level Security policies.
- Public portfolio reads only public media.
- Model owns and manages their own media/profile.

## Production hardening
- Use a private bucket + signed URLs if portfolio media should not be publicly downloadable.
- Add file-size/type limits and server-side validation.
- Add image/video transcoding and thumbnails for large videos.
- Add CSRF/rate limiting/anti-spam on booking endpoint.
- Add booking email notifications.
- Add admin roles if multiple staff users need access.
- Add delete/edit media actions and gallery ordering.
- Add privacy policy, terms, copyright/consent workflow.
- Never expose SUPABASE_SERVICE_ROLE_KEY in browser code.
