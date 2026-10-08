# Model Portfolio — Step 05

Step 05 adds secure admin authentication and the first protected CMS dashboard.

## Features

- `/admin/login`
- PostgreSQL-backed admin account
- Password hashing with bcrypt
- Signed HTTP-only session cookie
- Seven-day admin sessions
- Logout
- Protected `/admin` routes
- Admin dashboard statistics
- Responsive admin navigation
- Login redirects to the dashboard
- Unauthenticated dashboard requests are rejected server-side

## 1. Install dependencies

```bash
npm install bcryptjs zod
npm install -D tsx dotenv
```

## 2. Configure `.env`

Copy `.env.example` to `.env`.

Set a strong `AUTH_SECRET`.

For local development you can use:

```env
AUTH_SECRET="replace-with-a-long-random-secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="ChangeMe123!"
```

For production, generate a random secret:

```bash
openssl rand -hex 32
```

Do not commit `.env` to Git.

## 3. Update the database

If you already completed Step 04, the `Admin` table is already in the Prisma schema.

Run:

```bash
npx prisma generate
npx prisma migrate dev --name admin-auth
```

If this is a fresh project:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## 4. Create the initial admin

Run:

```bash
npx prisma db seed
```

The seed uses `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

Do not use the example password on a public deployment.

## 5. Start the application

```bash
npm run dev
```

Open:

http://localhost:3000/admin/login

Then sign in using your configured admin credentials.

## Authentication design

The password is never stored as plaintext.

The login route:

1. Finds the admin by email.
2. Compares the submitted password with the bcrypt hash.
3. Creates a signed session cookie.
4. Redirects the user to `/admin`.

The admin layout calls `requireAdmin()` on the server before rendering any protected admin page.

The session cookie is:

- HTTP-only
- SameSite=Lax
- Secure in production
- Scoped to the entire site
- Automatically expired after seven days

## Important production note

This is a strong foundation for the CMS, but before a high-traffic public launch we should add:

- Rate limiting for login attempts
- CSRF protection for state-changing operations
- Password reset/change flow
- Admin account management
- Optional two-factor authentication
- Audit logging
- Session revocation

#Neon Database
connect Neon database with Database_url
