# Step 21 — Payment reconciliation and audit history

## Included

- Admin payment method filter (PayPal / Ethereum USDT).
- Admin-only reconciliation action for existing pending Ethereum USDT payment records.
- Re-checks the stored transaction hash against the configured Ethereum Mainnet RPC, official USDT contract transfer logs, destination wallet, expected amount, and confirmation threshold before marking a pending payment completed.
- Uses a conditional status update so a concurrent status change cannot be overwritten.
- Adds a payment audit history for reconciliation attempts and successful PayPal refunds.
- Shows recent audit events inside the admin Payments screen.

## Deployment

Back up your database, then deploy the new migration:

```bash
npx prisma migrate deploy
npx prisma generate
npm run typecheck
npm run build
```

Configure `ETHEREUM_RPC_URL`, `ERC20_USDT_RECEIVE_ADDRESS`, and optionally `ERC20_REQUIRED_CONFIRMATIONS` for Ethereum Mainnet. Reconciliation is intentionally limited to already-existing pending USDT records with a stored transaction hash; it does not create payment records or accept arbitrary transaction hashes from the admin browser. A pending result remains pending until the required confirmations are reached.

## Important limitation

The current customer verification flow creates a payment only after sufficient confirmations, so the reconciliation action is mainly for pending records created by other/older flows or manual imports. It does not manufacture missing payment records from arbitrary hashes. On-chain USDT refunds remain manual and should be recorded only after independently verifying the outgoing transaction.
