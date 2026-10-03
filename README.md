# Hub Freelance

A freelance marketplace connecting clients and freelancers: projects, proposals, contracts with escrow, tasks, scope changes, live chat, delivery files, disputes, reviews, subscriptions and AI assistance — plus an admin dashboard.

```
backend/   Express 5 + PostgreSQL + Socket.io API
frontend/  React 19 + Vite + Tailwind (client, freelancer and admin workspaces)
```

## Requirements

- Node.js 18+
- PostgreSQL 14+

## Backend

```bash
cd backend
cp .env.example .env      # then fill in DATABASE_URL / PGPASSWORD and JWT_SECRET
npm install
npm run migrate           # creates the database (if missing) and applies all migrations
npm run dev               # http://localhost:5000
```

Important variables in `backend/.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` or `PG*` | PostgreSQL connection |
| `JWT_SECRET` | Required. Long random string used to sign tokens |
| `CORS_ORIGIN` | Frontend origin (default `http://localhost:5173`) |
| `APP_BASE_URL` | Frontend URL used in password-reset emails |
| `PUBLIC_API_URL` | Public URL of this API, used for uploaded file links (defaults to the request host) |
| `GEMINI_API_KEY` | Enables AI features (assistant, matching, description writer) |
| `SMTP_*` / `RESEND_API_KEY` | Email delivery (password reset, contact form) |

Uploaded files are stored in `backend/uploads/` and served at `/uploads/...`.

### Creating an admin

Admins cannot sign up from the UI. Create one (or promote an existing account) from the backend folder:

```bash
npm run create-admin -- admin@hub.com StrongPass123 "Hub Admin"
```

Then sign in at `/admin`.

## Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm install
npm run dev               # http://localhost:5173
```

## Main routes

| Route | Page |
| --- | --- |
| `/` | Landing page |
| `/register`, `/login` | Sign up / sign in |
| `/forgot-password`, `/reset-password?token=` | Password recovery |
| `/client` | Client workspace |
| `/freelancer` | Freelancer workspace |
| `/admin` | Admin dashboard |

## API overview

All endpoints are under `/api` and return `{ success, data }` or `{ success: false, message, errors }`.

- **Auth**: `POST /auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/change-password`
- **Users**: `GET|PATCH /users/me`, `GET|PATCH /users/me/preferences`
- **Profiles**: `/clients/:id`, `/freelancers/:id` (+ `/skills`, `/services`, `/portfolio`, `/reviews`), `GET /skills?search=`
- **Projects & proposals**: `/projects`, `/projects/:id/proposals`, `/projects/:id/invitations`, `/invitations`, `/proposals/:id/accept|reject`
- **Workspace**: `/contracts`, `/contracts/:id/tasks`, `/contracts/:id/scope-changes`, `/contracts/:id/attachments`, `/contracts/:id/review`, `/conversations` (+ Socket.io chat)
- **Wallet**: `GET /wallet`, `/wallet/transactions`, `POST /wallet/topup`, `/wallet/escrow/:contractId`, `/wallet/release/:contractId`, `/wallet/withdraw`
- **Other**: `/disputes`, `/notifications` (+ `PATCH /notifications/read-all`), `/subscriptions`, `/uploads`, `/ai/*`, `/contact`, `/advertisements`, `/admin/*`
