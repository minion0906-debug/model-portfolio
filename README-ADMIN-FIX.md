# Admin route/auth fix

The `/admin` route is now a direct protected App Router page. It performs the session check itself and redirects unauthenticated visitors to `/admin/login`.

## Important after replacing the project

1. Stop the running Next.js dev server.
2. Replace the project files with this ZIP.
3. Delete the `.next` folder from the project root.
4. Run `npm install`.
5. Make sure `.env` contains `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` as appropriate for the seeded account.
6. Run `npx prisma generate`.
7. Run `npm run dev`.
8. Open `http://localhost:3000/admin` in a fresh/incognito browser window.

Expected behavior when logged out:
`/admin` -> `/admin/login`

After successful login:
`/admin/login` -> `/admin`
