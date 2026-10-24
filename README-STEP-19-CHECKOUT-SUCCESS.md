# Step 19 — Checkout success experience

This update adds a dedicated purchase-success page for verified PayPal and Ethereum ERC-20 USDT purchases.

## What changed

- Successful PayPal capture responses now include the internal payment ID.
- Successful USDT verification responses now include the internal payment ID.
- The checkout components redirect to `/checkout/success?paymentId=...` after the server confirms payment.
- The success page displays the item, paid amount, payment method, order reference, payment date, and completed status.
- Customers can open the purchased media, view the receipt, or visit the purchase library.
- The page checks that the payment is completed and that the current browser's access cookie or matching customer session authorizes the purchase. A payment ID alone is not sufficient to view it.
- No database schema migration is required.

## Verify before deployment

```bash
npm install
npx prisma generate
npm run typecheck
npm run build
```

Test both PayPal Sandbox and a controlled USDT test flow. Confirm the success page only opens for the browser/session that has access to the completed purchase.
