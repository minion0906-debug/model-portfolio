# PayPal media pricing

This upgrade adds per-image/per-video pricing and PayPal one-time checkout.

## Admin

Open `/admin/gallery` or `/admin/videos`, open an item with **Edit**, and set:

- Price: `0` = free
- Price above `0` = paid
- Currency: USD/EUR/GBP/CAD/AUD (the PayPal account must support the currency)

The current price is shown on each media tile.

## PayPal configuration

Create a PayPal Developer app and use Sandbox credentials locally.

Add these to `.env.local`:

```env
PAYPAL_ENVIRONMENT="sandbox"
PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
```

The PayPal client secret is server-only. Never expose it as `NEXT_PUBLIC_*`.

For production change:

```env
PAYPAL_ENVIRONMENT="production"
```

and use the matching live REST app credentials.

## Database

Run:

```bash
npx prisma generate
npx prisma migrate deploy
```

For local development with an existing development database, `npx prisma migrate dev` can be used instead.

## Buyer flow

1. A paid image/video shows its price and PayPal unlock control.
2. The server creates the PayPal order using the price stored in PostgreSQL.
3. After approval, the server captures the order and verifies amount/currency/status.
4. A signed opaque access token is stored in an HttpOnly cookie.
5. Paid media is served through `/api/media/:id`; the raw media URL is not sent to the browser for the paid asset.

The storage bucket itself should still be private in production if you use S3-compatible storage. The application proxy is the access-control layer, so do not expose the same paid objects through another public URL.

## Test mode

Use PayPal Sandbox first. Test with a PayPal sandbox buyer account, not the merchant account.
