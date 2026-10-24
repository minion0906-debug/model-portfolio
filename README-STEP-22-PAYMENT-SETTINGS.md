# Step 22 — Admin Payment Settings

This step adds an admin-only payment settings panel under **Admin → Settings**. It supports enabling/disabling Ethereum USDT checkout, choosing a required confirmation threshold (1–1000), and adding customer-facing instructions. It also reports whether the receiving wallet, Ethereum RPC endpoint, and PayPal credentials appear configured.

## Environment variables

Keep private/runtime configuration in deployment environment variables:

- `ETHEREUM_RPC_URL` — Ethereum Mainnet JSON-RPC endpoint
- `ERC20_USDT_RECEIVE_ADDRESS` — public receiving wallet address
- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` — PayPal credentials

The admin panel never displays secret values. The database confirmation threshold is now authoritative for public USDT checkout and admin reconciliation. The legacy `ERC20_REQUIRED_CONFIRMATIONS` variable remains a fallback for code paths that do not provide a saved site setting.

## Deploy

Back up the database, then run:

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run typecheck
npm run build
```

Test with a non-production payment flow first. Disabling USDT checkout prevents new on-site verification, but it does not cancel transactions already sent to the blockchain.
