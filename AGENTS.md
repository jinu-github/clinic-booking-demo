# Project instructions

- Preserve published Git history; use new commits instead of force pushes or rewriting pushed commits.
- Preserve unrelated user changes. Keep changes scoped and commit working, reviewable steps.
- Use npm and the Node version in `package.json`; `package-lock.json` is authoritative.
- Keep TanStack Start's file-based routes in `src/routes` and do not hand-edit `src/routeTree.gen.ts`.
- Keep the `@/*` alias and `src/server.ts` server entry when changing build configuration.
- Run build, tests and relevant lint checks; record existing failures without unrelated repairs.
- Keep credentials out of tracked files and `VITE_*` variables. The current app uses browser-local sample data.
- Do not add a backend, paid services, AI features or production WebSockets without an explicit request.
