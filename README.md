# GS-26 Summit Admin Console

Organiser dashboard for the **GS-26 Gender & Inclusion Summit 2026** (Abuja, 8–9 September 2026). This is the admin-only web console — one of three apps alongside the NestJS API and the delegate mobile app. Delegates never see this app; all delegate-facing features live in the mobile client.

## Surfaces

| Route | Purpose |
|---|---|
| `/overview` | Live summit metrics — delegates, streaming viewers, live sessions, flagged accounts, top pitches |
| `/sessions` | Agenda CRUD + status control (`scheduled → live → completed`); the status drives captions routing and the mobile LIVE NOW card |
| `/announce` | Push-notification composer with audience segments (all / vip / press / speakers / volunteers) |
| `/live-ops` | Broadcast control — cut-to-break, captions & sign-language overlays, per-room capture health |
| `/trivia` | Trivia manager — draft questions, push one live at a time, watch the answer distribution in real time |
| `/security` | Audit trail of admin actions and security events, filterable by severity |
| `/delegates` | Placeholder — directory + CSV export land when the backend exposes the delegate list |
| `/signin` | Organiser sign-in (admin-tier accounts only) |

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19
- **Tailwind CSS 4** + shadcn/ui primitives
- **TanStack Query** for server state, **socket.io** for realtime invalidation
- **Vitest** for tests, type-checked ESLint
- **OpenNext → Cloudflare Workers** for deployment

## Architecture notes

**Auth is a BFF (backend-for-frontend).** The browser never sees a token. Next.js route handlers under `app/api/gs26/` log in against the API, keep the access/refresh pair in `httpOnly` cookies, and proxy every API call server-side — including automatic refresh-token rotation on 401. Client code calls `api("/Sessions")` (see `lib/summit/api.ts`) and knows nothing about tokens. The one exception is the socket.io handshake, which needs a bearer token in JS: `/api/gs26/auth/socket-token` hands out the short-lived access token on demand, and it is never persisted client-side.

**Realtime.** `RealtimeRefresher` (mounted in the summit layout) opens one socket, joins the notification/voting/trivia rooms, and invalidates the relevant queries when events arrive — so every open admin screen stays in sync without polling. Rooms are re-joined automatically after a reconnect.

**Route protection.** `proxy.ts` (Next middleware) redirects unauthenticated visits to `/signin`; the API independently rejects non-admin tiers on every admin route — UI gating is convenience, not security.

## Getting started

```bash
pnpm install
```

Create `.env.local` (or `.env`) in the repo root:

```
API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

`API_BASE_URL` is used server-side by the auth proxy; the `NEXT_PUBLIC_` variant is only used to derive the socket.io host.

Run the API locally (defaults to port 3000), then:

```bash
pnpm dev
```

The dashboard picks the next free port (usually **3001**). Sign in at `/signin` with an admin-tier account.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build:next` | Production build + type check (what CI runs) |
| `pnpm lint` | Type-checked ESLint |
| `pnpm test` | Vitest |
| `pnpm audit:prod` | Dependency audit (CI gate, high severity) |
| `pnpm preview` | OpenNext build + local Cloudflare preview |
| `pnpm deploy` | Build and deploy to Cloudflare Workers |

## Deployment

Set both env vars in the Cloudflare environment (pointing at the production API), then `pnpm deploy`. The backend must be deployed first and its CORS/socket origin must allow the dashboard's domain.
