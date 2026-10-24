# Brightsmile Booking Studio

Design a polished, mobile-first appointment booking website for a small fictional dental clinic. Invent a fictional clinic name. Use mock data only: no backend, no login service, no database yet.

Style: clean, calm and trustworthy, with a soft color palette (teal or soft blue with warm white), rounded cards and generous spacing. It should look like a real clinic's website.

Customer pages:

- Home with a short intro, the services, the dentists, and a "Book appointment" button

- Booking flow in steps: choose a service, choose a dentist (or "anyone available"), pick a date and time slot (show some slots as taken), enter name, phone and email, then a confirmation screen with the booking summary and a cancel or reschedule option

- Clean states for empty, loading and "no slots available"

Admin pages (at /admin, pre-filled demo login button, no real auth):

- Day and week calendar of bookings

- Booking detail with status (confirmed, cancelled, completed)

- Manage services, dentists and working hours

- A simple dashboard (bookings today, this week, popular services)

Include a visible "Demo with sample data" banner. Make everything work on a phone first, then desktop.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4c43dc96-1dc3-4427-8aee-c85e38a19b65).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Use Node.js **22.23.4** (pinned in `package.json` engines) and npm. The clean install was verified with npm **10.9.9**, bundled with that Node release. `package-lock.json` is the authoritative lockfile; do not generate a second package-manager lockfile.

```sh
git clone <this-repository-url>
cd <repository-name>
npm ci
npm run dev
```

Run `npm run build` and `npm test` to verify changes. See [VALIDATION.md](VALIDATION.md) for the baseline lint failures and migration checks. Switching from Bun removes its 24-hour minimum-release-age installation guard; npm 10 does not apply that Bun policy. Dependency updates should be reviewed separately; this migration preserves the existing npm-locked package versions.

No environment variables are required by the current browser-local demo. `.env.example` contains only an empty `DATABASE_URL` placeholder for a future backend; it is unused and does not connect or create a database. Keep actual values in ignored environment files or hosting settings. Never put secrets in `VITE_*` variables, which are exposed to client code.

## Vercel project settings

Import this repository from its root with these settings:

| Setting | Value |
| --- | --- |
| Framework Preset | **TanStack Start** |
| Root Directory | Repository root (`.`) |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | Leave the override disabled; use the framework default |
| Node.js Version | **22.x** |
| Environment Variables | None required for this demo; do not set `DATABASE_URL` yet |

`vite.config.ts` explicitly selects Nitro's `vercel` preset through the existing Lovable wrapper. Keep that single wrapper; do not add duplicate Nitro/Start plugins or force a static `dist` output. Nitro emits `.vercel/output` with assets and server functions. No separate API or always-on server is configured.

The local verification release is Node **22.23.4**, pinned in `package.json`. Vercel only offers major-version selection and automatically updates minor/patch releases; the exact hosted patch cannot be pinned through project settings. Confirm its selected version in the first deployment's build logs. [Vercel Node version documentation](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

Build in Vercel's repository environment, not the Lovable sandbox, which can override Nitro's target. Do not copy Lovable sandbox environment variables into Vercel. The deployment configuration follows the [official TanStack Start/Nitro guide](https://vercel.com/kb/guide/deploy-a-tanstack-start-app-to-vercel); that guide's newer starter prerequisites do not change this repository's pinned dependencies.

No live deployment was performed. After importing, verify direct visits to `/`, `/book`, `/booking/<id>`, `/admin`, `/admin/calendar`, `/admin/manage`, `/admin/bookings/<id>` and an unknown route. Booking IDs still refer to browser-local sample data. Use Hobby only for the personal, non-commercial demo described in the audit.
