# Step 20 — Ethereum Mainnet USDT checkout and PayPal allocation tracking

## Added

- A USDT (ERC-20) checkout alongside the existing PayPal checkout for paid USD-priced media.
- Direct wallet-to-wallet payment: the buyer sends USDT on Ethereum Mainnet to the configured receive address. The app never holds private keys and never signs blockchain transactions.
- Server-side verification of Ethereum Mainnet chain ID, receipt success, USDT token contract, Transfer event recipient, amount, transaction hash, and configurable confirmation count (default 12).
- Duplicate transaction prevention through a unique database constraint.
- Purchase unlock/access cookie only after successful chain verification.
- Admin payment list now distinguishes PayPal vs Ethereum USDT and displays the transaction hash.
- PayPal sales store a 40% crypto allocation and 60% PayPal allocation, with crypto status `MANUAL_REQUIRED`.
- Existing PayPal checkout, capture, webhook, purchase library, and refund flow are retained. Crypto refunds are marked manual in the admin screen.

## Required configuration

Set these on the server/deployment platform (not client-side):

```env
ERC20_USDT_RECEIVE_ADDRESS="0x0c0b7871720635cC3eE4eCe01c78058292C9aA41"
ETHEREUM_RPC_URL="YOUR_TRUSTED_ETHEREUM_MAINNET_RPC_URL"
ERC20_REQUIRED_CONFIRMATIONS="12"
```

Configured destination wallet (provided by the project owner): `0x0c0b7871720635cC3eE4eCe01c78058292C9aA41`. Independently verify this address in your wallet before accepting real payments. The address is inserted into the example environment files; copy it into your actual server/deployment environment as well. Never add a seed phrase or private key to this project. `ETHEREUM_RPC_URL` must point to Ethereum Mainnet; the verifier rejects other chain IDs. Public RPCs can rate-limit production traffic, so use a reliable provider for production.

USDT is the Ethereum Mainnet token at `0xdAC17F958D2ee523a2206206994597C13D831ec7` and uses 6 decimals. Crypto checkout is limited to items priced in USD; the amount is treated as a USDT equivalent at 1 USDT = 1 USD for the checkout calculation. Do not use this assumption for non-USD prices.

## Database deployment

The schema adds payment method, unique crypto transaction hash, received token base units, and split-allocation tracking fields. This archive does not include the project’s full historical migration chain. For an existing database, back it up first, then use the database workflow already used by your deployment. If your deployment manages schema with `prisma db push`, run `npx prisma db push` after reviewing the schema diff. If you use Prisma Migrate, baseline/verify the existing migration history before running deploy; do not assume this single incremental migration initializes a blank database. Never run `prisma migrate reset` against production.

```bash
npm ci
npx prisma generate
# Use ONE of the database paths documented above after verifying your existing workflow.
# npx prisma migrate deploy
# or: npx prisma db push
npm run typecheck
npm run build
```

## PayPal 40% crypto allocation — important limitation

PayPal checkout proceeds still settle to your PayPal account. This version records 40% of the gross captured amount as `cryptoAllocationCents`, records the remaining 60% as `paypalAllocationCents`, and marks the crypto allocation `MANUAL_REQUIRED`. It does **not** claim that the 40% is automatically converted to USDT or sent on-chain.

PayPal's standard Payouts API pays PayPal/Venmo recipients, not arbitrary ERC-20 wallet addresses. To automate the 40% conversion and wallet payout, select and onboard an exchange/on-ramp or crypto payout provider that explicitly supports your country, PayPal-funded balances or a compatible funding route, USDT on Ethereum, and an API suitable for business use. Until that provider and credentials are configured and tested, manually convert and transfer the recorded allocation. Network fees, exchange fees, holds, refunds/chargebacks, and compliance checks may change the actual transferable amount.

## Test checklist

1. Use a non-production wallet and test database first; never test by sending real funds to an unverified address.
2. Confirm the public checkout only shows a usable wallet after the environment variables are set.
3. Verify wrong-network, wrong-token, failed, underpaid, unconfirmed, malformed, and already-used transaction hashes are rejected.
4. Verify a successful transaction unlocks the media and appears as `Ethereum USDT` in admin payments.
5. Verify PayPal capture and webhook events are idempotent and produce the 40/60 allocation record.
6. Verify no `.env` or credentials are committed/deployed in the project archive.
