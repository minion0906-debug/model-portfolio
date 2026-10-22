# Step 13 — Booking Management Upgrade

## Included

- Admin booking list/calendar toggle. Calendar view lists requests by preferred date and lets you open a request.
- Admin-only internal notes per booking for follow-up reminders and call notes.
- Existing status workflow retained (NEW, REVIEWING, ACCEPTED, DECLINED, COMPLETED, CANCELLED).
- PATCH endpoint validates status and notes independently and limits internal notes to 10,000 characters.
- Prisma migration adds the nullable `internalNotes` field without changing existing booking records.

## Apply the database migration

Back up your database, then run:

```bash
npx prisma migrate deploy
npx prisma generate
npm run typecheck
npm run build
```

For local development, `npx prisma migrate dev` can be used instead. Review the migration status first if this database was previously managed without Prisma migrations. Internal notes are visible in the admin UI only; do not put sensitive payment details or passwords in them.

## Note

The calendar is an agenda-style view sorted by preferred date, not a full month grid. A missing preferred date is shown in the list view only.
