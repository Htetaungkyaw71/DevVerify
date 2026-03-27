# DevVerify Frontend

DevVerify is an AI-assisted coding assessment frontend for recruiters and candidates.

It provides:

- recruiter workflows (create positions, invite candidates, review submissions)
- candidate coding workspace (timer, Monaco editor, run/submit, result breakdown)
- auth flows (login, register with OTP, forgot/reset password)
- AI report view for submissions

## Tech Stack

- React 18 + TypeScript
- Vite
- Redux Toolkit + RTK Query + redux-persist
- React Router v6
- TailwindCSS + shadcn/ui + Radix UI
- Monaco Editor (`@monaco-editor/react`)
- Zod input schemas for frontend validation
- DOMPurify for safe HTML rendering

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```dotenv
VITE_API_BASE_URL=https://devverify-api.vercel.app/api
VITE_APP_BASE_URL=http://localhost:3000
VITE_ONLINECOMPILER_API_KEY=your_key_here
```

3. Start development server:

```bash
npm run dev
```

4. Open the app (usually):

```bash
http://localhost:5173
```

## Available Scripts

- `npm run dev` — start local development server
- `npm run build` — production build
- `npm run build:dev` — development mode build
- `npm run preview` — preview production build
- `npm run lint` — lint project
- `npm run test` — run Vitest (requires tests to exist)
- `npm run test:watch` — watch mode tests

## Main Routes

- `/` — landing page
- `/auth` — login/register (OTP flow)
- `/forgot-password` — reset password flow
- `/dashboard` — recruiter dashboard (protected)
- `/positions/:id` — position details (protected)
- `/invite/:token` — candidate invite page
- `/workspace/:id` — candidate workspace
- `/report` — AI report page

## Auth + Protection

- Protected routes are wrapped with `ProtectedRoute`.
- Unauthenticated access to protected pages redirects to `/auth`.
- Redirect target is preserved through route state (`redirectTo`).

## Input Validation + Security (Frontend)

- Shared `zod` schemas validate auth and position payloads before API calls.
- Challenge HTML is sanitized with DOMPurify before rendering.
- API base URL is centralized in `src/lib/apiConfig.ts`.

## Important Security Note

`VITE_*` variables are exposed to the browser at build time.

Do not put long-lived private secrets in frontend env variables. If possible, move compiler/API secret handling to backend proxy endpoints.

## Project Structure (High Level)

- `src/pages` — route screens
- `src/components` — reusable UI components
- `src/store` — Redux slices + RTK Query APIs
- `src/lib` — API config/clients, helpers, shared schemas
- `public` — static assets (e.g. celebration Lottie)

## Troubleshooting

### 1) API calls fail locally

- Verify backend is running and reachable at `VITE_API_BASE_URL`.
- Ensure CORS is configured for frontend origin.

### 2) OTP / Auth redirects not working

- Confirm backend auth routes match frontend expectations.
- Check GitHub OAuth callback URL and frontend app URL.

### 3) "No test files found"

- Current setup includes Vitest, but test files may not exist yet.
- Add tests under `src/**/*.{test,spec}.{ts,tsx}`.

### 4) Redis backend warning

If backend logs show messages like:

`Redis unavailable, continuing without cache`

the frontend can still work, but backend caching is disabled. This is a backend deployment/config issue.

## Deployment Notes

- Set `VITE_API_BASE_URL` to your deployed backend API URL.
- Rebuild frontend after env changes.
- Verify protected routes and auth redirect flow in production.
