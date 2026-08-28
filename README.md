# Gatewise Visitor Management System

Gatewise is a production-oriented visitor entry and exit system for multi-block company campuses. It is split into three independently deployable applications:

- `backend` — Express + TypeScript API with MongoDB/Mongoose, JWT access tokens, HTTP-only refresh sessions, role and block authorization, audit logging, reports, validation and rate limiting.
- `admin` — React/Vite administration console for dashboard activity, block credentials, visitors, live occupancy and reports.
- `watchman` — mobile-first React/Vite gate portal for block-scoped check-in, check-out and history.

## Architecture

Both portals use the API under `/api`. Access tokens are held in memory and sent as Bearer tokens. Refresh tokens are hashed in MongoDB and stored in separate HTTP-only cookies (`vms_admin_refresh` and `vms_watchman_refresh`). A refresh is attempted once on startup and once for an expired API request. Watchman block scope is taken from the authenticated user on the server; no client-provided `blockId` is used for Watchman reads or writes.

Visitor timestamps are UTC MongoDB dates. Day filters are converted using `COMPANY_TIMEZONE` (default `Asia/Kolkata`) before querying. Checkout uses an atomic `status: INSIDE` update to prevent double checkout.

## Folder structure

```text
backend/
  src/config, middleware, modules, utils, scripts
  tests/api.test.ts
admin/
  src/api, components, hooks, layouts, pages, routes
watchman/
  src/api, components, hooks, layouts, pages, routes
```

## Requirements

Node.js 20+ and a MongoDB Atlas connection. Each folder has its own `package.json` and can be installed or deployed separately.

## Environment variables

Backend variables are documented in [`backend/.env.example`](backend/.env.example):

`NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_DAYS`, `BCRYPT_ROUNDS`, `ADMIN_FRONTEND_URL`, `WATCHMAN_FRONTEND_URL`, `COMPANY_TIMEZONE`, `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_USERNAME`, and `INITIAL_ADMIN_PASSWORD`.

The Admin portal uses `VITE_API_BASE_URL` and `VITE_APP_NAME` from [`admin/.env.example`](admin/.env.example). The Watchman portal uses the same variables from [`watchman/.env.example`](watchman/.env.example). Never commit a real `.env` file.

## Local setup

```powershell
cd backend
npm install
Copy-Item .env.example .env       # edit MongoDB URI and secrets
npm run seed:initial               # creates the admin and Blocks 1–6 idempotently
npm run dev
```

In a second terminal:

```powershell
cd admin
npm install
npm run dev                        # http://localhost:5173
```

In a third terminal:

```powershell
cd watchman
npm install
npm run dev                        # http://localhost:5174
```

The seed does not create Watchman passwords. Sign in to Admin, open Manage blocks, and configure each block’s Watchman credentials.

## API surface

Health: `GET /api/health`.

Admin auth: `/api/auth/admin/{login,refresh,logout,me}`. Admin data: `/api/admin/dashboard`, `/api/admin/blocks`, `/api/admin/visitors`, `/api/admin/reports/*`.

Watchman auth: `/api/auth/watchman/{login,refresh,logout,me}`. Watchman data: `/api/watchman/dashboard`, `/api/watchman/visitors/check-in`, `/inside`, `/history`, and `/:visitorId/check-out`.

## MongoDB Atlas

Create a database user, allow the deployed API’s outbound IP range (or the Atlas network policy appropriate for your organization), and place the SRV connection string in `MONGODB_URI`. Mongoose creates indexes for block/status/date visitor queries and a TTL index for refresh sessions.

## Deployment

### Render backend

Create a Render Web Service with root directory `backend`, build command `npm ci && npm run build`, start command `npm start`, and health check path `/api/health`. [`backend/render.yaml`](backend/render.yaml) contains the same configuration. Set the MongoDB URI, both JWT secrets, exact frontend origins, and production environment variables in Render. Do not use wildcard CORS with credentials.

### Vercel portals

Create two Vercel projects:

- Admin root directory `admin`, build command `npm run build`, output directory `dist`.
- Watchman root directory `watchman`, build command `npm run build`, output directory `dist`.

Set `VITE_API_BASE_URL` to the API origin plus `/api` and set `VITE_APP_NAME`. Both `vercel.json` files rewrite SPA routes to `index.html`, so refreshing `/dashboard`, `/blocks`, `/people-inside`, or `/history` works.

For the most reliable production cookie behavior, use custom subdomains such as `admin.company-domain.com`, `security.company-domain.com`, and `api.company-domain.com`. Configure the API’s exact two origins and serve all three over HTTPS; production cookies use `Secure`, `HttpOnly`, and `SameSite=None`.

## Security checklist

- Use long random JWT secrets and a strong MongoDB user password.
- Set `NODE_ENV=production` and HTTPS origins in Render/Vercel.
- Configure Atlas network access deliberately.
- Configure every Watchman credential through Admin; never put credentials in source or frontend environment variables.
- Rotate secrets and review audit logs operationally.
- Keep dependencies updated and review `npm audit` output before release.

## Verification

```powershell
cd backend; npm run lint; npm run typecheck; npm run test; npm run build
cd ../admin; npm run lint; npm run typecheck; npm run build
cd ../watchman; npm run lint; npm run typecheck; npm run build
```

The default backend tests cover health, unauthenticated protection and timezone utilities. The full MongoDB-backed workflow suite is in `backend/tests/workflows.integration.test.ts`; run it against an isolated test database with `$env:TEST_MONGODB_URI='mongodb://...' ; npm run test:integration` in PowerShell. It covers admin login and block management, credential setup, deactivation, block-scoped check-in/history/occupancy, atomic checkout and validation, cross-block rejection, admin-wide visibility, timezone day filtering, refresh sessions, and password-reset revocation.
