# Swell-Web

Surf session tracker with real auth, cloud database, and live swell data.

## Live

[swell-v3-bice.vercel.app](https://swell-v3-bice.vercel.app)

## What's new in V3

V2 was a solid Vite + React app but sessions lived in localStorage — one device, no accounts. V3 is the full-stack upgrade.

- **Clerk auth** — sign up, sign in, Google OAuth. Every surfer has their own account
- **Neon PostgreSQL + Prisma** — sessions save to a real database, accessible from any device
- **Next.js 15 App Router** — proper full-stack framework with API routes
- **Architecture built for React Native** — Expo conversion is next

Everything else you loved about V2 is still here — live swell data, responsive layout, the gold/blue design system, all the Puerto Rico spots.

## Stack

- Next.js 15 (App Router)
- Clerk — auth (email + Google OAuth)
- Neon PostgreSQL + Prisma — session storage
- Open-Meteo Marine + Weather API — live conditions
- Syne + DM Sans + DM Mono — typography
- Vercel — deployment

## Setup

1. Clone the repo
2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Create `.env.local` at the root:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
DATABASE_URL=postgresql://...
```

4. Push the database schema:
```bash
DATABASE_URL="your_connection_string" npx prisma db push
```

5. Run dev server:
```bash
npm run dev
```

## File structure

```
app/
  (auth)/
    sign-in/[[...sign-in]]/page.jsx
    sign-up/[[...sign-up]]/page.jsx
  (dashboard)/
    layout.jsx             — responsive nav (sidebar + bottom bar)
    page.jsx               — Home dashboard + live conditions
    log/page.jsx           — Log session form
    history/page.jsx       — Session history with filters
    progress/page.jsx      — Stats, streak, charts
  api/
    sessions/route.js      — GET + POST sessions
    sessions/[id]/route.js — DELETE session
  layout.jsx               — Root layout with ClerkProvider
lib/
  db.js                    — Prisma client singleton
  spots.js                 — 20 surf spots with lat/lng (includes Puerto Rico)
prisma/
  schema.prisma            — Session model
styles/
  globals.css              — Design tokens + global styles
middleware.js              — Clerk auth protection
```

## Surf spots

10 classic world-class spots plus 10 Puerto Rico breaks — Rincon, Tres Palmas, Wilderness, Domes, Crash Boat, Rio Grande, Avalanche, Wobbles, BCs, and The Mix.

## Deploying to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add all `.env.local` variables in Vercel project settings
4. Deploy — Vercel auto-deploys on every push to main

## Roadmap

- React Native conversion via Expo (iOS + Android App Store)
- Custom spot entry with map picker
- Session detail + edit view
- Water temperature from Open-Meteo Marine
- Custom domain + Clerk production instance

## Built by

Justin Adame — UX Designer + Frontend Developer — Austin, TX  
[justinadame.com](https://justinadame.com)
