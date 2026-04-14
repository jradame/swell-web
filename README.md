# Swell - Surf Session Tracker (Web)

A full-stack surf session tracker built with Next.js, Neon PostgreSQL, and Clerk. Live at swelltrackerapp.com. The native iOS app connects to this backend via Bearer token auth.

Web app: [swelltrackerapp.com](https://swelltrackerapp.com)

App Store: [apps.apple.com/us/app/swell/id6761311243](https://apps.apple.com/us/app/swell/id6761311243)

---

## What it does

Swell lets surfers log sessions, track wave height and duration, rate conditions with a 1-5 star system, and view progress over time. The home screen pulls live swell data and tide information for 29 spots across Hawaii, West Coast, Gulf Coast, East Coast, Puerto Rico, and International regions.

Sessions are stored in Neon PostgreSQL and sync across the web app and native iOS app using the same user account.

---

## Stack

- Next.js 15 App Router
- Clerk for authentication (email and Google OAuth)
- Neon PostgreSQL with Prisma ORM
- Open-Meteo Marine and Weather API for live conditions
- NOAA Tides and Currents API for tide predictions and water temperature
- Deployed on Vercel with custom domain via GoDaddy DNS

---

## Screens

**Home** - Time-of-day greeting, region tabs, spot selector, live conditions widget (wave height, period, wind speed, water temperature, quality badge), tide predictions, stat cards, and recent sessions list.

**Log** - Region and spot selector, date picker, wave height, duration, board type, star rating, and notes. Save is disabled until required fields are filled.

**History** - Full session list with filter chips (All, This Month, Best Rated, Biggest Waves), color-coded rating pills, inline notes, edit and delete with confirmation.

**Progress** - Session streak, total sessions, average wave height, monthly bar chart, and top spots ranked by session count.

---

## Design system

- Background: `#0D1B2A`
- Card surface: `#1B2D3F`
- Gold (brand): `#C9A96E`
- Gold (small text): `#d4b483`
- Blue (data): `#38bdf8`
- Typography: Syne (headings), DM Sans (body), DM Mono (numeric data)

---

## Quality badge logic

| Badge | Condition |
|-------|-----------|
| Flat | Wave height under 1.5 ft |
| Clean | 1.5 to 12 ft, wind under 15 kt |
| Fair | 1.5 to 12 ft, wind 15 to 25 kt, or wave over 12 ft |
| Blown | Wind over 25 kt regardless of wave height |

---

## Project structure

app/
api/
sessions/
route.js          GET and POST sessions
[id]/route.js     PUT and DELETE session by ID
(auth)/
sign-in/            Clerk sign-in page
sign-up/            Clerk sign-up page
(dashboard)/
layout.jsx          Sidebar and mobile bottom nav
page.jsx            Home screen
history/page.jsx    Session history
log/page.jsx        Log session
progress/page.jsx   Progress and stats
lib/
db.js                 Prisma client
spots.js              29 surf spots with regions, coordinates, and NOAA station IDs
styles/
globals.css           Design tokens and base styles
prisma/
schema.prisma         Session model

---

## Getting started

Clone the repo and install dependencies:

```bash
git clone https://github.com/jradame/swell-web.git
cd swell-web
npm install
```

Create a `.env.local` file with:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
DATABASE_URL=

Run the dev server:

```bash
npm run dev
```

Note: Clerk is configured for the production domain. Local development requires updating the allowed origins in the Clerk dashboard.

---

## API routes

All session routes require a valid Clerk session (cookie for web, Bearer token for native).

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/sessions | Fetch all sessions for the authenticated user |
| POST | /api/sessions | Create a new session |
| PUT | /api/sessions/[id] | Update an existing session |
| DELETE | /api/sessions/[id] | Delete a session |

---

## Deployment

Deployed on Vercel. Push to main triggers an automatic deployment. Environment variables are set in the Vercel dashboard.

Custom domain swelltrackerapp.com is pointed via GoDaddy DNS.

---

## Related

- Swell iOS app: [github.com/jradame/swell-app](https://github.com/jradame/swell-app)
- Portfolio: [justinadame.com](https://justinadame.com)

---

Built by Justin Adame - UX Designer and Frontend Developer based in Austin, TX.

