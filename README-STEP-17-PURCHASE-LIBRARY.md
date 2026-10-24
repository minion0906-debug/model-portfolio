# Step 17 — Customer Purchase Library

This step improves the customer-facing `/purchases` page on top of the secure purchase access and email recovery flow.

## Improvements
- Search purchases by media title, type, or PayPal order ID.
- Filter the library to all media, images, or videos.
- Sort purchases newest-first or oldest-first.
- Show a result count and a clear empty state when filters do not match.
- Show helpful recovery guidance for invalid, expired, or unsuccessful one-time email links.
- Keep the purchase library excluded from search indexing.
- Preserve protected viewing and downloading through `/api/media/[id]`; no public payment-history-by-email endpoint is added.
- No database migration is required.

## Run locally
```bash
npm install
npx prisma generate
npm run dev
```

## Email recovery setup
Configure the email provider variables documented in the existing magic-link/email setup guide. The recovery flow uses one-time, expiring tokens and creates a customer session only after the user confirms the link.

## Before deployment
Run `npm run typecheck` and `npm run build`, then test a completed purchase, access from a fresh browser, expired-link handling, and view/download permissions using PayPal Sandbox.
