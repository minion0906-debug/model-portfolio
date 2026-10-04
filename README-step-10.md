# Step 10 — Contact Messages CMS

Adds the public contact form and private admin message inbox.

## Included

- Public contact form at `#contact`
- Zod server-side validation
- `POST /api/contact`
- PostgreSQL persistence through existing `ContactMessage` model
- Admin inbox at `/admin/messages`
- Read/unread filtering
- Mark read / unread
- Full message detail view
- Reply by email via `mailto`
- Delete messages
- `package.json` included

## Integration

Replace the existing `Contact.tsx` with the supplied version and add `ContactForm.tsx`.

The Prisma schema already contains `ContactMessage`, so no new model is required.

Run:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Then test:

- Public contact form: `http://localhost:3000/#contact`
- Admin messages: `http://localhost:3000/admin/messages`

## Production notes

Before public launch, add rate limiting and bot protection to `/api/contact`. Consider email notifications for new messages. Contact messages are only accessible through authenticated admin routes.
