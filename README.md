# Zaylo Admin

Vite + React admin panel wired to the Backend `/api/v1` APIs via RTK Query.

## Setup

```bash
cd admin
cp .env.development .env.local   # optional
npm install
npm run dev
```

Ensure Backend is running on port `5000` and `CLIENT_URL` includes `http://localhost:5173`.

## Env

| Variable | Default |
|----------|---------|
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1` |

## Seed logins

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@zaylo.com` | `Admin123!` |
| Manager | `manager@zaylo.com` | `Manager123!` |

Auth uses Bearer JWT stored in `sessionStorage` (key `zaylo-admin-token`). Bootstrap calls `GET /auth/me`.

## Architecture

- `src/store/api/*` — RTK Query endpoints + tag cache
- `src/store/slices/authSlice.js` — token + user only
- Feature pages lazy-loaded via route `React.lazy` + root `<Suspense>`
