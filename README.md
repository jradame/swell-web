# Swell - Surf Session Tracker (Web)

Full-stack surf session tracker built with Next.js, Neon PostgreSQL, and Clerk. Live at swelltrackerapp.com. The native iOS app connects to this backend via Bearer token auth.

Web: [swelltrackerapp.com](https://swelltrackerapp.com)

App Store: [apps.apple.com/us/app/swell/id6761311243](https://apps.apple.com/us/app/swell/id6761311243)

---

## Stack

- Next.js 15 App Router
- Clerk - auth (email + Google OAuth), production instance on swelltrackerapp.com
- Neon PostgreSQL + Prisma - session storage
- Open-Meteo Marine + Weather API - live conditions
- NOAA Tides and Currents API - tide predictions and water temperature
- Syne + DM Sans + DM Mono - typography
- Vercel - deployment

---

## Screens

**Home** - Time-of-day greeting, region tabs, spot selector, live conditions (wave height, period, wind, water temp, quality badge), tide predictions, stat cards, recent sessions.

**Log** - Spot selector, date, wave height, duration, board type, star rating, notes. Save disabled until required fields are filled.

**History** - Full session list with filter chips (All, This Month, Best Rated, Biggest Waves), color-coded rating pills, inline notes, edit and delete with confirmation.

**Progress** - Session streak, total sessions, average wave height, monthly bar chart, top spots by session count.

---

## Quality badge logic

| Badge | Condition |
|-------|-----------|
| Flat | Wave height under 1.5 ft |
| Clean | 1.5 to 12 ft, wind under 15 kt |
| Fair | 1.5 to 12 ft, wind 15 to 25 kt, or wave over 12 ft |
| Blown | Wind over 25 kt regardless of wave height |

---

## Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/jradame/swell-web.git
cd swell-web
npm install --legacy-peer-deps
```

2. Create `.env.local` at the root:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
DATABASE_URL=postgresql://...

3. Push the database schema:

```bash
DATABASE_URL="your_connection_string" npx prisma db push
```

4. Run dev server:

```bash
npm run dev
```

Note: Clerk is configured for the production domain. Local development requires updating allowed origins in the Clerk dashboard.

---

## File structure
app/
(auth)/
sign-in/[[...sign-in]]/page.jsx
sign-up/[[...sign-up]]/page.jsx
(dashboard)/
layout.jsx              responsive nav (sidebar + bottom bar)
page.jsx                Home dashboard + live conditions
log/page.jsx            Log session form
history/page.jsx        Session history with filters and edit
progress/page.jsx       Stats, streak, charts
api/
sessions/route.js       GET + POST sessions
sessions/[id]/route.js  PUT + DELETE session by ID
layout.jsx                Root layout with ClerkProvider
lib/
db.js                     Prisma client singleton
spots.js                  29 surf spots with lat/lng and NOAA station IDs
prisma/
schema.prisma             Session model
styles/
globals.css               Design tokens + global styles
middleware.js               Clerk auth protection

---

## API routes

All routes require a valid Clerk session (cookie for web, Bearer token for native iOS app).

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/sessions | Fetch all sessions for the authenticated user |
| POST | /api/sessions | Create a new session |
| PUT | /api/sessions/[id] | Update an existing session |
| DELETE | /api/sessions/[id] | Delete a session |

---

## Surf spots

29 spots across Hawaii, West Coast, Gulf Coast, East Coast, Puerto Rico, and International regions. Each spot includes lat/lng for live API fetches and a NOAA station ID for US spots.

---

## Deploying to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add all env vars in Vercel project settings
4. Deploy - Vercel auto-deploys on every push to main

---

## Related

- Swell iOS app: [github.com/jradame/swell-app](https://github.com/jradame/swell-app)
- Portfolio: [justinadame.com](https://justinadame.com)

---

Built by Justin Adame - UX Designer and Frontend Developer - Austin, TX
