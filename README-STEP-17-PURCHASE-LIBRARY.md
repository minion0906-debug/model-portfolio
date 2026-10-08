# Step 17 — Customer Purchase Library

Added a `/purchases` customer library for completed PayPal purchases on the current browser.

## Features
- Lists completed purchases using the secure `media_access_*` cookies issued after PayPal capture.
- Shows media thumbnail, type, title, amount, purchase date and PayPal order ID.
- View purchased media through the protected `/api/media/[id]` endpoint.
- Download purchased media through the same protected endpoint with `?download=1`.
- Adds a Purchases link to the public navigation.
- No database migration is required for this step.

## Run
```bash
npm install
npx prisma generate
npm run dev
```

## Important
The library intentionally uses the browser's secure purchase tokens. It does not expose a public payment-history lookup by email. A later customer-account/magic-link step can add cross-device purchase recovery without making purchase records publicly enumerable.
