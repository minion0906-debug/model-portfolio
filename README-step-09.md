# Step 09 — Booking Requests

Adds the public booking request flow and admin booking workflow.

## Included

- Public booking form at `#booking`
- Zod validation
- `POST /api/bookings`
- Booking acceptance controlled by `SiteSettings.acceptingBookings`
- PostgreSQL persistence through existing `BookingRequest` model
- Admin booking inbox at `/admin/bookings`
- Filter by booking status
- Detailed request view
- Statuses:
  - NEW
  - REVIEWING
  - ACCEPTED
  - DECLINED
  - COMPLETED
  - CANCELLED
- Delete booking requests
- `package.json` included

## Integration

Replace the existing `BookingCTA.tsx` with the supplied version and add `BookingForm.tsx`.

The Prisma schema already contains `BookingRequest`, so no new model is required.

Run:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Then test:

- Public booking form: `http://localhost:3000/#booking`
- Admin: `http://localhost:3000/admin/bookings`

## Production notes

Before public launch, add rate limiting and bot protection to the public booking endpoint. Consider email notifications when a new request arrives. Keep booking records server-side and never expose them through public queries.
