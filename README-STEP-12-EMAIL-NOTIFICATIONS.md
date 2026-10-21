# Step 12 — Email Notifications

Adds best-effort email notifications to the existing booking and contact form flows.

## What happens

- A new booking request is saved to the database, then a notification is sent to the configured admin inbox.
- The visitor receives a receipt email explaining that the request was received, not that a booking is confirmed.
- Contact messages are saved, then the admin receives a notification and the visitor receives a receipt email.
- Email markup escapes user-supplied text to reduce HTML injection risk.
- Email provider failures are logged but do not turn a successfully saved form submission into a failed submission.

## Configure Resend

Set these environment variables in local `.env` and in your Vercel project settings:

```env
RESEND_API_KEY=re_...
RESEND_FROM=Portfolio Notifications <notifications@your-verified-domain.com>
ADMIN_NOTIFICATION_EMAIL=you@example.com
```

Verify the sender domain in Resend before production use. `ADMIN_NOTIFICATION_EMAIL` is preferred; if it is not set, the email configured in **Admin → Site settings** is used as the notification destination. If neither is set, admin notifications are skipped. In development without Resend configuration, the app logs that an email would have been sent. No secrets should use a `NEXT_PUBLIC_` prefix.

## Verify

```bash
npm install
npx prisma generate
npm run typecheck
npm run build
npm run dev
```

Submit a test contact message and booking request. Confirm both records appear in the admin area, admin notification emails arrive, and customer receipts are delivered. Check spam folders and provider logs as needed.

This step uses the existing database models and adds no migration. Email sending is best-effort after persistence; for stronger delivery guarantees at higher volume, add a durable queue/outbox and retry worker.
