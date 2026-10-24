# BrightSmile Booking Studio

An appointment booking demo for **Seabright Dental**, a fictional clinic. Customers choose a service, dentist and time; staff can explore a calendar and manage sample bookings.

This is a portfolio demo. The clinic is fictional and all data is sample data.

## Status

All bookings and the demo staff session are stored in this browser's localStorage. Booking links are not authenticated private links. There is no database, real login service, email delivery or payment processing.

## Features

- Mobile-first booking flow: service, dentist (or anyone available), date and time, details, confirmation
- Cancel and reschedule
- Staff area: day and week calendar, booking details and statuses, services, dentists and working hours, dashboard

## Tech stack

React, TypeScript, TanStack Start/Router, Vite, Tailwind CSS, Radix UI and Nitro targeting Vercel. PostgreSQL on Neon and Drizzle ORM are future work, not installed backend functionality.

## Local development

    npm ci
    npm run dev

Use Node **22.23.4** (the `package.json` engine pin); npm **10.9.9** was used for verification. Keep only `package-lock.json` as the authoritative lockfile.

Run `npm run build`, `npm test` and `npm run lint` to check changes. Existing lint failures and verification limits are recorded in [VALIDATION.md](VALIDATION.md). No environment variables are needed for the demo; `.env.example` contains an unused, empty `DATABASE_URL` placeholder. Never commit secrets or put them in `VITE_*` variables.

## Deployment

| Setting | Value |
| --- | --- |
| Framework preset | TanStack Start |
| Root directory | Repository root (`.`) |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | Framework default; leave override disabled |
| Node.js version | 22.x |
| Environment variables | None required for the current demo |

Nitro uses the `vercel` preset and emits `.vercel/output` with static assets and a server function. The custom server entry is `src/server.ts`; no separate always-on server is required. Vercel manages the hosted Node minor/patch version, so the local exact pin does not pin Vercel's patch release. [Node version documentation](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

Use Hobby only for personal, non-commercial demo use. A live Vercel deployment still needs verification; local build output alone does not establish that the hosted pages work.
