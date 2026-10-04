# Maya Model Portfolio

A polished Next.js starter for an individual model's commercial portfolio.

## Included
- Responsive public portfolio
- Photo gallery
- Video/showreel section
- About/model stats
- Booking inquiry form
- Login page
- Private dashboard UI for photos, videos, bookings and profile

## Run locally
```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production work still required
The dashboard is intentionally a UI starter. Before deployment, connect:
- Authentication (Clerk, Auth.js, Supabase Auth, etc.)
- Database (Postgres/Supabase)
- Photo/video storage (Cloudinary, S3, or Mux)
- Real upload API with file-size/type validation
- Booking form backend/email
- CMS or database for profile and gallery data
- Replace demo image URLs and social/contact links
- Add consent, copyright, privacy policy and terms

For video-heavy portfolios, Mux or Cloudinary is recommended instead of storing large files on the Next.js server.
