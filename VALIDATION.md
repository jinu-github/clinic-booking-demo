# Migration validation

## 1. Baseline — 24 October 2026

Environment: Windows, Node v24.20.0, npm 11.19.0; existing installed dependencies.

| Command | Result |
| --- | --- |
| `npm run build` | Passed; existing Nitro configuration produced Cloudflare output and Wrangler configuration |
| `npm run lint` | Failed: 6,094 findings (6,082 errors, 12 warnings). Prettier reports include widespread CRLF (`Delete ␍`) violations. All errors were reported as potentially auto-fixable; no fixes applied |
| `npm test` | Initial sandbox run failed before collecting tests with `EPERM` renaming a temporary transform-cache file. Rerun outside the sandbox passed: 2 files, 4 tests |

Existing unrelated work: untracked `AUDIT.md`, untracked `package-lock.json`, and a route-tree working-copy status entry with no substantive Git diff. Application source was not edited. Build-generated files remain outside these commits.

Baseline failures are recorded rather than repaired as part of this tooling-only migration.

## 2. npm and Node 22

- Compared both root dependency maps in `package-lock.json` against `package.json`: exact matches. Kept the existing npm dependency graph; only added root engine metadata to the lockfile. No framework versions or dependency declarations were upgraded.
- Pinned `engines.node` to `22.23.4`. Verification used the official Windows x64 archive, SHA-256 `cbc74b5e0982c9dbb41525fd8fb5dcd32fbee237863f7829072f4639a1ce5f20`, and its npm 10.9.9. System Node was not changed.
- Two initial `npm ci --no-audit --no-fund` attempts encountered Windows `EBUSY` unlink errors in the old node_modules. Moved the partially removed directory to ignored `.tanstack/node_modules-before-npm`, then installed into an empty node_modules successfully: 523 packages.
- Clean-install `npm run build`: passed (existing Cloudflare target). `npm test`: 2 files / 4 tests passed. Commands ran outside the sandbox because of the baseline temporary-cache permission failure.
- Removed `bun.lock` and `bunfig.toml` only after installation, build and tests passed. npm's lockfile is now authoritative. The old Bun release-age guard is not reproduced by npm 10; documented in README.
- npm reported existing dependency deprecations (whatwg-encoding, abab, domexception, tsconfck, Recharts and ESLint); no unrelated upgrades applied. Baseline lint failures remain unfixed.

## 3. Secret-file exclusions

- Added environment, credential/key and local Vercel-directory ignore patterns; retained the existing `.dev.vars` exclusion.
- Added `.env.example` with only an empty `DATABASE_URL` entry, reserved for future work. No environment variable or database is required by the current app.
- `git check-ignore` verified `.env`, environment variants, `.dev.vars` variants, secret directories, key/certificate files and `.vercel` are ignored; `.env.example` remains trackable.
- `git ls-files` found no currently tracked `.env` variants or matching key/certificate files before adding the example. This is not a historical secret scan.

## 4. Explicit Vercel target

- Added only `nitro: { preset: "vercel" }` to the existing Vite wrapper; preserved the custom server entry and all framework versions.
- Documented exact Vercel project settings in README: TanStack Start, repository root, `npm ci`, `npm run build`, default output directory and Node 22.x. No environment variables are required yet.
- `npm run build` under Node 22.23.4 completed with exit 0 after an initially quiet startup. The build reported `preset: vercel`.
- Inspected `.vercel/output/config.json`: Build Output API version 3, asset handling and catch-all routing to `/__server`. Inspected `functions/__server.func/.vc-config.json`: handler `index.mjs`, runtime `nodejs22.x`, response streaming enabled. Generated output is ignored, not committed.
- `git diff --check` passed. Application source was not edited; the pre-existing route-tree status entry and untracked AUDIT.md remain outside the migration commits.
- Not verified: an actual Vercel deployment, hosted patch version, preview URL/deep-link behavior, browser/mobile behavior or account settings. No database was added. Baseline lint errors remain; no unrelated fixes or upgrades were made.
