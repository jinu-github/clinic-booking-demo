# Project audit

Audited 24 October 2026. Source inspection only; no application code, configuration, dependencies, or existing work changed. No installation, build, deployment, browser session, or test run was performed. Accessibility/mobile findings below distinguish source defects from layout risks that need device testing.

## Summary

- This is React + TypeScript + TanStack Start, with Vite, Tailwind and Nitro; Bun is a package-manager choice, not an application requirement.
- All clinic data and the fake admin session live in React state and browser localStorage; there is no business backend.
- TanStack Start can run on Vercel Functions; the installed Lovable wrapper already supports Vercel detection and an explicit preset.
- Vercel Hobby fits a personal fictional demo, but its non-commercial restriction rules out a real clinic booking business.
- Neon Free + Drizzle over HTTP fits the requested architecture without an always-on application server, WebSockets or AI.
- Start server functions can supply the entire booking API, provided authentication, authorization, validation and database concurrency controls are added.
- Prefer npm + a supported Node version and one committed lockfile; retain the visual design and route structure.
- Prioritize deployment proof, data integrity and access control before connecting the existing UI to shared patient data.

## Scope and existing work

At audit start, `git status --short` already showed a modified `src/routeTree.gen.ts` and an untracked `package-lock.json`. These were left untouched. `AUDIT.md` is the only file added by this audit. All eight route modules, the root shell, store, slot logic, shared site components, styles, configuration, tests and Lovable integration were inspected. The installed Lovable wrapper's implementation and types were also read to resolve deployment behavior.

## Stack and structure

Versions below are declarations from `package.json`, not a claim that every caret range resolves to that exact version.

| Layer | Current implementation |
| --- | --- |
| App | React/React DOM `^19.2.0`, TypeScript `^5.8.3`, ES modules |
| Framework | `@tanstack/react-start` `1.168.60`, router `1.170.41`, router plugin `1.168.42`; file-based routes and SSR entry |
| Build | Vite `8.1.5`, Lovable Vite wrapper `2.26.5`, Nitro `3.0.260603-beta`, Rolldown override `1.2.1` |
| Styling/UI | Tailwind `^4.2.1`, shadcn-style local components, Radix primitives, Lucide icons, CSS theme tokens, `tw-animate-css` |
| Data | React context/useState + localStorage. React Query `^5.101.1` is provided but no route uses queries/mutations or loaders for business data |
| Other libraries | Zod, React Hook Form/resolvers, date-fns, Recharts, Sonner, Embla, Vaul and other UI utilities; much of this is template infrastructure rather than current booking behavior |
| Checks | Vitest/jsdom/Testing Library, ESLint 9, Prettier. Scripts: dev, build, build:dev, preview, lint, format, test, test:watch |
| Package management | Tracked `bun.lock` and `bunfig.toml`; untracked npm lockfile also exists. README explicitly documents npm. No `Bun.*` use found in application source |

```text
AGENTS.md                 Lovable Git-history instructions
README.md                 Original fictional-demo brief and Lovable/local setup links
.lovable/project.json     Template identity and revision
package.json              Dependencies and scripts
bun.lock, bunfig.toml      Bun lock and installation policy
package-lock.json         Existing untracked npm lockfile
vite.config.ts            Lovable wrapper; custom Start server entry
tsconfig.json             Strict TS; @/* -> src/*; noEmit
vitest.config.ts           jsdom tests; independent React Vite config
eslint.config.js           Lint configuration
components.json           shadcn component-generation configuration
public/                   favicon.ico and permissive robots.txt
src/assets/               Bundled clinic.jpg
src/routes/               Pages, root shell and routing convention README
src/routeTree.gen.ts       Generated route tree; do not hand-edit
src/router.tsx            Router factory and per-router QueryClient
src/start.ts              Request error middleware and server-function CSRF middleware
src/server.ts             SSR entry wrapper and catastrophic-error normalization
src/lib/                  Store, slot/date helpers, styling utility and error helpers
src/components/site.tsx   Clinic shell, cards, avatars, loading/empty/status UI
src/components/ui/        Reusable UI component library
src/hooks/use-mobile.tsx  Responsive hook
src/styles.css            Theme, fonts, color tokens and utilities
src/test/                 Slot tests, root-route matching test and jsdom setup
node_modules/, .tanstack/ Local dependencies/generated tooling state
```

There is no Supabase directory, database schema, migration directory, dedicated API directory, Vercel config or production process-manager configuration in the tracked project. The absence of `vercel.json` is not itself a deployment defect.

## Every route and page

| URL / route | Source | Behavior and data |
| --- | --- | --- |
| Shared root, no independent URL | `src/routes/__root.tsx` | Document shell, metadata, Google Fonts, QueryClient/Store providers, demo banner, generic error and 404 screens |
| `/` | `index.tsx` | Hero, services, active dentists, booking links and staff footer. Services/dentists come from the local store; promotional copy/image are fixed |
| `/book` | `book.tsx` | Four local steps: service, dentist/anyone, date/time, patient details. Creates a local booking. Four steps are not separate routes |
| `/book?reschedule=<id>` | Same file | Looks up a local booking, preselects service/dentist/date and starts at time selection; updates date/time/dentist/status on confirmation |
| `/booking/$id` | `booking.$id.tsx` | Confirmation/detail, cancel confirmation and reschedule link. Missing IDs render an empty state; no server lookup or access token |
| `/admin` layout | `admin.tsx` | Fake sign-in gate, desktop/mobile navigation, reset data and sign-out. Gate only checks local `state.admin`; children use Outlet |
| `/admin` index (route ID `/admin/`) | `admin.index.tsx` | Today's bookings, current Monday–Sunday totals/value, popular services across all non-cancelled local bookings |
| `/admin/calendar` | `admin.calendar.tsx` | Day grouped by dentist; week grouped by day; previous/next/today navigation. View/date are component state, not URL state |
| `/admin/bookings/$id` | `admin.bookings.$id.tsx` | Patient contact links, details, editable status and internal notes; local writes, behind fake layout gate |
| `/admin/manage` | `admin.manage.tsx` | Local tabs for services, dentists and weekly hours; edits save immediately. Tabs are not separate URLs |

`$id` is TanStack's dynamic parameter notation. Unknown URLs use the root 404 component. There are no separate login, API, privacy, payment or AI routes. Route errors have a retry/home screen. Booking IDs missing from local state are UI empty states, not explicit server-side 404 responses.

## Data sources, hard-coded behavior and functional gaps

### Actual data flow

`src/lib/store.tsx` initializes state to null for SSR/first render, reads `seabright-demo-v1` from localStorage in an effect, waits 350 ms, then loads saved JSON or generates sample data. Subsequent state changes serialize the entire store back to localStorage. Nothing is sent to a booking service. Refresh retains local data; another browser/device does not share it. There is no cross-tab storage listener, reconciliation, schema validation or migration. Malformed JSON/storage access failures are not handled. Patient details, notes and the admin boolean are all stored together in plaintext browser storage.

`src/lib/slots.ts` computes 30-minute candidate starts, opening-hour bounds and overlapping bookings. “Anyone available” chooses the first eligible free dentist in array order. The algorithm also invents busy periods using a deterministic hash unless `mockBusy: false`; callers currently leave that default enabled. Slot computation is local and never reserves anything centrally.

### Fictional or fixed content

- Six seeded services with fixed descriptions, durations and dollar prices; three fictional dentists with fixed biographies and active flags; seven fixed weekday schedules.
- Sample patient names, generated phones and `example.com` emails; bookings generated from six days before to twelve days after the first seed date. Saved samples do not roll forward daily. Seeds do not ensure valid hours or conflict-free appointments.
- Clinic identity/address, “4.9 from 600+ patient reviews,” insurance claim, “Open 6 days,” hero image, marketing text and “Good morning” greeting are fixed. Public claims do not follow edited hours or any review service.
- A 350 ms store delay and 450 ms slot delay simulate loading; they do not represent network requests.
- Read-only demo email/password fields are cosmetic. Sign-in sets a boolean; sign-out clears it. Reset regenerates all sample data while retaining the current admin flag.
- Confirmation says email was sent, immediately qualified by “demo — no email sent.” There is no email/SMS integration, payment processing or reminder delivery.
- Dashboard “Week value” sums current service prices for non-cancelled bookings, not received payments. Historical price/duration are not snapshotted.
- Booking horizon is 14 days; slot increment is 30 minutes; dates/today use the viewer's local timezone; formatting uses `en-US`, `$` and 12-hour time without a configured clinic timezone/currency.
- New booking IDs are random `B2000`–`B8999`, without uniqueness checks. New service/dentist IDs use `Date.now()`.
- Manage supports service name/price/duration and dentist name/title/active status, but has no editor for service descriptions or dentist biographies. Newly added descriptions are placeholders.

### Correctness/security work before a shared backend

- There is no real authentication, role enforcement, booking ownership or capability token. `noindex` is indexing guidance, not access control. Never carry predictable ID-only access into a shared database.
- `confirm()` does not require that the chosen slot is still available or revalidate all input. Its fallback can access `activeDentists[0].id` when none exist. Past-time availability is memoized, so merely waiting does not expire a selected time.
- Reschedule requests do not enforce status, ownership or a permitted date range. A crafted query can target completed/cancelled local bookings. If someone changes service during the reschedule flow, the update still omits `serviceId`.
- No database-enforced exclusion/locking prevents two users booking overlapping intervals. A unique dentist/date/start key alone is insufficient with 30-, 45- and 60-minute appointments.
- Deleting services/dentists can orphan bookings; changing duration changes historical overlap calculations; changing prices changes historical dashboard totals. Admin status changes can reactivate conflicting appointments.
- Numeric `min` attributes do not validate writes made directly from `onChange`; names, time ranges and hours also lack enforced rules.
- “Try next day” advances one day, not necessarily to availability, and becomes a no-op on the final displayed date. “Clinic is closed” can also be shown when there are no eligible dentists.
- The completed-booking customer screen still says “You're booked in!” and shows the demo email message.

## Lovable, Supabase and external dependencies

| Item | Assessment |
| --- | --- |
| `.lovable/project.json` | Identifies template `tanstack_start_ts_current` and its revision; not clinic data or a database connection |
| `@lovable.dev/vite-tanstack-config` | Actual build-time dependency. Supplies Start/React/Tailwind/path plugins, Nitro, devtools/error diagnostics, environment injection and sandbox behavior |
| `vite.config.ts` | Uses that wrapper and directs Start to `src/server.ts`; warns against adding duplicate plugins |
| `src/lib/lovable-error-reporting.ts` + root import | Optional editor/global error-reporting hooks; no direct fetch. Safe no-op when globals are absent. Remove/replace together if disconnecting tooling |
| `src/server.ts`, `src/start.ts`, error helpers | Template SSR/error infrastructure; useful concepts but review wrapper behavior when adding APIs. Global last-error capture can associate the wrong error under concurrent requests; avoid logging patient data |
| `bunfig.toml` | 24-hour minimum release age; exceptions include Lovable config/MCP/AI gateway/email/webhooks package names. These entries are not proof those SDKs are installed or used; the config package is the direct Lovable dependency |
| `README.md`, `AGENTS.md` | Lovable project link/workflow and Git-history preservation instructions |
| `.gitignore` | Cloudflare/Wrangler and generated output patterns from the template. Plain `.env` is not ignored; add secret-file exclusions before introducing database credentials |
| Supabase | No Supabase dependency/client/schema/migrations/functions/auth calls found. Its name appears only in an error-serialization comment describing a possible thrown object |
| Other external resources | Root loads Google Fonts; clinic image is bundled. No business API, AI SDK calls, production WebSocket connection or paid-service requirement found |

Development Vite HMR uses WebSockets in normal tooling; that is separate from production app functionality. If the prohibition also covers development, disable HMR later. No production realtime feature is needed.

### Instructions and goal conflicts

`AGENTS.md` says not to rewrite published Git history: no force pushing or rebasing/amending/squashing already-pushed commits. Pushed commits sync into Lovable, so keep the connected branch working. These instructions do **not** require Lovable hosting, Supabase, Bun, AI or paid services and do not conflict with the proposed stack. Make future migrations with normal new commits.

The README's original brief explicitly requested mock data and no database/login service **yet**. That describes the current prototype; the user's newer Neon/Drizzle goals supersede it for future implementation. `src/routes/README.md` correctly requests file routing and no manual generated-tree edits. The Bun comment requests confirmation before adding supply-chain exceptions; this audit adds none.

## Deployment and architecture decision

### Vercel Hobby: technically yes, with a use-case restriction

Vercel officially supports TanStack Start through Nitro, which packages server code as Vercel Functions. Keep SSR and server functions; a standalone persistent Node server is unnecessary. Framework detection normally supplies build settings. This is a compatibility finding, **not a successful deployment test of this checkout**. [Vercel deployment guide](https://vercel.com/kb/guide/deploy-a-tanstack-start-app-to-vercel)

Hobby is restricted to personal, non-commercial use. A personal fictional clinic demo fits that scope; an actual clinic's booking/advertising site does not become non-commercial just because it takes no online payments. Thus “real clinic + Vercel Hobby + no paid services” cannot all be promised together. Limits can suspend features until their reset rather than providing unlimited free capacity. [Vercel Hobby documentation](https://vercel.com/docs/plans/hobby)

Use a Hobby account and the included deployment domain, without a Pro trial, domain purchase or paid add-ons. Vercel's official community guidance states a free project can run without a card; account-specific signup verification was not tested here. [Vercel community billing guidance](https://community.vercel.com/t/cant-delete-my-payment-method-even-though-im-a-hobby-plan/3263/6)

### Adapter/configuration for this exact template

Inspection of installed `@lovable.dev/vite-tanstack-config/dist/index.js` and `index.d.ts` shows that its Cloudflare setting is a **fallback** (`defaultPreset: "cloudflare-module"`), not an unconditional target outside Lovable. Nitro runs on production builds; Vercel auto-detection or `NITRO_PRESET` can select another platform. The existing config may therefore deploy unchanged when built by Vercel. An explicit target makes local/CI builds reproducible:

```ts
// Proposed future change only; not applied by this audit.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: { preset: "vercel" },
  tanstackStart: { server: { entry: "server" } },
});
```

Do not add a second Nitro or Start plugin while retaining the wrapper. Inside the Lovable sandbox, its forced preset/output behavior overrides outside-host choices; deploy from the repository in Vercel's build environment. Do not copy Lovable sandbox variables into Vercel.

Use the TanStack Start framework preset, `npm run build` (or the equivalent Bun command) and framework-managed output settings. Do not force a static `dist` deployment that drops server functions. Verify Nitro's Vercel output and direct/deep routes in a preview. No hand-written `vercel.json` or Next.js adapter is inherently required. If removing Lovable later, replace its wrapper with ordinary Vite config containing Start, `nitro({ preset: "vercel" })`, React, Tailwind and tsconfig-paths once each, preserving the server entry and aliases. Vercel documents Nitro's automatic Vercel preset selection. [Cloudflare-to-Vercel guide](https://vercel.com/kb/guide/migrate-a-tanstack-start-app-from-cloudflare-to-vercel)

The pinned Nitro version is a beta. Validate the existing versions before undertaking unrelated upgrades; the installed Vite requires Node `^20.19.0 || >=22.12.0`. Prefer a Vercel-supported Node 22 release meeting that minimum, pinned consistently in development and deployment.

### Neon + Drizzle without WebSockets

Use this request flow:

```text
Browser -> HTTPS Start server function on Vercel
        -> Drizzle neon-http -> Neon Postgres
```

Add `drizzle-orm`, `@neondatabase/serverless`, and development-only `drizzle-kit`. Use `drizzle-orm/neon-http`; do not choose the WebSocket-based Neon Pool/Client adapter. HTTP supports queries/non-interactive transactions, so plan atomic booking operations around supported HTTP batches or a single database-side operation instead of assuming interactive transaction callbacks are available. [Drizzle Neon documentation](https://orm.drizzle.team/docs/connect-neon)

Create Neon directly on its Free plan and put `DATABASE_URL` only in server environment variables, never `VITE_*`. Keep DB modules server-only, commit migrations, and run migrations explicitly rather than on every request. Use Postgres constraints/atomic SQL for conflicts and preserve appointment duration/price snapshots. No always-on app process, socket subscription, AI gateway, paid email provider or separate API deployment is required.

Neon currently advertises Free with no card, 100 CU-hours/month/project and 1 GB storage/project; idle compute scales to zero. These are a dated snapshot, not a guarantee of unlimited operation. Cold starts and quota exhaustion need honest UI handling. Avoid keepalive traffic and unnecessary polling; refresh on navigation, mutation or user request. Neon offers other features, but this design only needs Postgres. [Neon pricing and scale-to-zero](https://neon.com/pricing)

### Can server functions replace a separate API?

Yes. Implement reads for services/dentists/hours/availability/bookings and mutations for booking creation, cancellation, rescheduling and staff edits with `createServerFn`. These execute on the server and can be called through Start's client transport; a separate Express/Fastify server is unnecessary. Use explicit HTTP server routes only if external consumers later need stable endpoints. [TanStack server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)

Currently **no business server functions exist**. `src/server.ts` is an SSR wrapper, and `src/start.ts` is middleware. Its existing server-function CSRF protection should remain, but does not replace input validation, authenticated staff sessions, per-operation authorization, rate controls or unguessable customer booking capabilities. Keep sessions in secure HttpOnly cookies backed by server validation, not the local admin boolean. Handle expected validation/conflict errors explicitly rather than converting them into generic HTML 500 pages. Revalidate availability in the database when confirming; client state is only a presentation cache.

### Bun or npm?

Recommend **npm + Node** for the initial Vercel migration: the code is not Bun-specific, scripts are portable, README already uses npm, and one toolchain simplifies reproducibility. Keep the existing untracked npm lockfile intact until a dedicated session checks it against `package.json`; then choose and commit one authoritative lockfile, declare the package manager/Node version, and use `npm ci` in CI. Do not silently discard the existing lockfile or regenerate both.

Bun is also viable as an installer/build runner and does not require a Bun production runtime. Staying with it is reasonable if it is already the team's standard. A move to npm does not automatically preserve Bun's minimum-release-age policy; choose an explicit supported equivalent or document that tradeoff. Avoid changing package manager, adapter and framework versions in one session.

## Accessibility and mobile findings

Confirmed from markup:

- `admin.manage.tsx`: service names, dentist names/titles, weekday open/close inputs and weekday switches lack explicit accessible labels. Add IDs and labels that include the relevant service/dentist/day. Demo sign-in labels also lack associations to their inputs.
- `admin.calendar.tsx`: previous/next icon buttons have no accessible names. Add contextual labels. Reset/sign-out use `title`; explicit labels would be more robust for touch and assistive technology.
- Date/time selection, day/week buttons, manage tabs and status choices indicate selection visually without selected/pressed semantics. Use appropriate radio/tab patterns or `aria-pressed`; mark the current booking step with `aria-current="step"`.
- Booking step transitions replace content without explicit focus management or announcements. Skeletons, available-slot changes, save results and cancellation state lack live status messaging. The inline cancellation prompt should receive appropriate focus and restore it after dismissal.
- Patient fields have useful labels/types/autocomplete, but validation only disables Confirm. There are no per-field errors, required indicators or error associations, and the details inputs are not inside a form supporting ordinary submit behavior.
- Calendar chips communicate booking status only through border color/opacity. Include readable status text. Status pills elsewhere already have text.
- No skip-to-main link. Custom buttons rely largely on browser focus defaults; verify consistent visible keyboard focus. Skeleton animation lacks an explicit reduced-motion treatment.

Mobile/layout risks inferred from source, not verified on devices:

- Staff header combines an unwrapping logo, Staff badge, gap and two 36 px controls; likely crowded/overflowing at 320 px. Dashboard always uses three columns, so money totals may exceed narrow cards.
- Fixed booking actions and mobile staff navigation lack `env(safe-area-inset-bottom)` padding. Test iOS home indicator, on-screen keyboard and zoom; hard-coded bottom padding may not cover all cases.
- Several controls are 36–40 px and text links are smaller; improve toward comfortable 44 px touch areas rather than claiming every smaller control violates WCAG.
- Week view correctly stacks on phones, but changes to seven columns at `md`, leaving narrow booking chips on small tablets. Names/services truncate without an expanded summary in the calendar.
- Long patient names, emails and confirmation values lack robust word-breaking; detail heading/status rows may overflow. Test realistic long inputs and 200% text enlargement.
- Horizontal date scrolling lacks a clear scroll affordance and does not explicitly scroll the selected date into view. Closed dates are dimmed but remain selectable without a direct “closed” label.
- Primary/destructive text/background pairs and small muted text require measured contrast testing. Do not treat this source review as a WCAG contrast pass.

Useful existing foundations: document language and viewport, semantic headings/main landmarks, hero alt text and dimensions, labeled customer inputs, native buttons/links, disabled unavailable slots, responsive grids, descriptive status pills and Radix components. Their presence does not make the custom flows fully accessible.

## What is reusable as-is

- The file-route map, router factory, root document structure and QueryClient provider can remain while data access changes.
- Clinic image asset, general page composition, reusable Card/Avatar/EmptyState/LoadingCards/StatusPill, responsive home layout and most theme styling are useful prototype assets. Fictional claims must remain identified as such.
- Existing UI primitives, class-merging utility and component-generation setup can remain; remove unused dependencies only after checking imports.
- Pure time-conversion and interval-overlap helpers are useful building blocks. `getSlots` already accepts `mockBusy: false`; reuse its logic for previews, but add validation/timezone handling and make database writes authoritative.
- Existing slot tests cover closed days, overlaps and cancellation; routing test checks that `/` matches a page. Retain them, but they do not validate auth, rescheduling, persistence, concurrency, SSR deployment or accessibility.
- Keep demo mode and its banner as an explicitly separate demonstration if desired. The local store, fake login, synthetic delays and random identifiers are not reusable production persistence/security.

## Recommended order of changes — short sessions

Each session should end with one reviewable change and its targeted check. Estimates are scope guides; split further when a check fails.

| Session | Size | Outcome / completion check |
| --- | --- | --- |
| 1. Confirm intended use and baseline | 20–30 min | Record personal-demo versus real-clinic scope; preserve existing work; run current checks and record failures. A commercial scope requires revisiting the Vercel Hobby constraint |
| 2. Standardize installation | 30–45 min | Choose npm/Node, inspect existing lockfile, pin versions, settle one lockfile and verify clean install/tests without framework upgrades |
| 3. Prove Vercel adapter | 30–45 min | Explicit Nitro Vercel target if desired; build and preview-deploy the unchanged demo. Verify direct `/`, `/book`, nested admin and 404 routes; inspect server logs |
| 4. Define data invariants | 30–45 min | Agree clinic timezone, duration/price snapshots, status transitions, deletion rules and overlap prevention; document schema before wiring screens |
| 5. Add Neon/Drizzle foundation | 45–60 min | Free Neon project, server-only HTTP client, protected environment files, initial migration and explicit sample seed; read-back check |
| 6. Enforce booking concurrency | 45–60 min | Database constraints/atomic write design; verify two simultaneous overlapping bookings cannot both succeed |
| 7. Staff authentication | 45–60 min | Server-validated session and protected staff reads/mutations; unauthenticated requests fail, independent of UI visibility |
| 8. Customer access and booking functions | 45–60 min | Validated create/read/cancel/reschedule with secure booking capability; test invalid IDs/tokens, stale slots and disallowed transitions |
| 9. Connect public screens | 45–60 min | Replace local persistence with reads/mutations, honest loading/error messages and cache invalidation. Confirm a booking survives another browser/device |
| 10. Connect staff screens | 45–60 min | Dashboard/calendar/manage/detail use protected server functions; prevent orphan records; preserve historical values |
| 11. Accessibility and phone pass | Two 30–45 min sessions | First labels/keyboard/focus/status; then 320–390 px, tablet, zoom, contrast, safe areas and long content |
| 12. Remove demo claims and final-check deployment | 30–45 min | Remove fake email/reviews/busy blocks where appropriate; test all routes and server functions on Vercel with Neon HTTP; confirm free-plan settings and no runtime WebSockets/AI. Keep real patient data out until security and applicable handling requirements are addressed |

Optional later session: replace the Lovable wrapper with explicit Vite plugins and remove unused editor hooks/dependencies after the deployment baseline is proven. Preserve published history throughout.
