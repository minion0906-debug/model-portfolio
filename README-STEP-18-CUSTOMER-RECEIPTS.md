# Step 18 — Customer receipts and account experience

This step builds on Step 17 and adds:

- A more polished customer purchase-recovery page.
- A private receipt page for each completed purchase at `/purchases/receipt/[paymentId]`.
- A print / Save as PDF action for receipts.
- Receipt links on each purchase-library card.
- Receipt access checks requiring either the completed purchase's per-media access cookie or a valid customer session whose email matches the payment email.
- `noindex` metadata on customer purchase and receipt pages.

## No schema migration

No Prisma schema changes are required.

## Verify locally

```bash
npm install
npx prisma generate
npm run typecheck
npm run build
```

The receipt page intentionally returns a not-found response when the payment is missing, not completed, or the current customer cannot prove access. Test both a completed purchase and an unauthorized session before deploying.
