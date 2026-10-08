# Prisma migration fix for an existing database

The project originally had an existing PostgreSQL schema but no migration history. The migrations are now structured correctly:

1. `20261009000000_baseline_existing_schema` = describes the existing database schema.
2. `20261009010000_paypal_media_pricing` = adds `Media.priceCents`, `Media.currency`, and `Payment`.

## IMPORTANT: existing database

Do NOT run `prisma migrate reset`.

If your current database already contains the original model-portfolio tables, mark the baseline as applied:

```bash
npx prisma migrate resolve --applied 20261009000000_baseline_existing_schema
```

Then apply the PayPal migration:

```bash
npx prisma migrate deploy
npx prisma generate
```

Then start the app:

```bash
npm run dev
```

## If this is a brand-new empty database

Do NOT run the baseline resolve command. Instead run:

```bash
npx prisma migrate deploy
npx prisma generate
```

## If you already attempted the broken migration

First inspect:

```bash
npx prisma migrate status
```

If the old broken migration is recorded as failed, resolve it according to the status output before using the corrected migrations. Do not reset a database containing real data.
