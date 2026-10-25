# AGENTS.md

storejs is a minimal Node.js CRUD demo for a single `Puppy` entity (Express +
EJS, in-memory store). It exists to demo SuperPlane deploys/previews, not as
a real product — keep changes small and in scope. Full functional spec: see
`spec.md`. Deploy/ops details (droplet, systemd, SuperPlane canvases): see
`.superplane/deploy.md` — don't duplicate that here.

## Setup & commands

```bash
npm install
npm test          # vitest run — fast, no server needed
npm run dev        # node --watch src/server.js (no OpenTelemetry)
npm start          # node --require ./src/instrumentation.js src/server.js (prod entry, boots OTel)
```

The app listens on `process.env.PORT` (default `3000`); `GET /` redirects to
`/puppies`.

## Project layout

This is a one-file-does-everything app — there are no controllers/models to
hunt for.

- `src/app.js` — every route, the in-memory `puppies` array + `nextId`, the
  flash-notice pattern (`app.locals.notice`), the 404 fallback, and
  `app.resetStore()` (test-only helper to clear state between tests).
- `src/server.js` — just calls `app.listen`.
- `src/instrumentation.js` — OpenTelemetry `NodeSDK` setup (traces + metrics
  exported to Dash0 via OTLP). Loaded only via `--require` in `npm start`;
  not loaded by `npm run dev` or the test suite.
- `src/metrics.js` — three custom OTel counters (`puppiesCreated`,
  `puppiesDeleted`, `puppiesTotal`) used from `app.js`.
- `src/views/puppies/{index,new,show,edit}.ejs` and `src/views/about.ejs` —
  no shared layout or partials; each view repeats the same large inline
  `<style>` block independently.
- `test/app.test.js` — one test file covering every route from spec.md's
  "Testing Requirements" section.
- `scripts/` — ops scripts (`deploy.sh`, `preview-setup.sh`,
  `daytona-prepare-sandbox.sh`) used by SuperPlane canvases, not by the app
  at runtime. See `.superplane/deploy.md` for how/when they run.

## Conventions & gotchas

- **CommonJS only.** `package.json` sets `"type": "commonjs"`; use
  `require`/`module.exports`, not ESM `import`/`export`.
- **In-memory store is intentional, not a bug.** `puppies` resets on every
  process restart/redeploy (see spec.md). Don't add persistence unless the
  task explicitly asks for it.
- **`app.resetStore()` is for tests.** Use it (as `test/app.test.js` does in
  `beforeEach`) instead of restarting the process to isolate test state.
- **Production dependency rule:** anything `src/instrumentation.js`
  requires (any `@opentelemetry/*` package) must stay in `dependencies`, not
  `devDependencies`. The deploy script runs `npm install --production`, so a
  misplaced dep causes a `MODULE_NOT_FOUND` crash loop in prod. This has bit
  the team before — see the gotchas section in `.superplane/deploy.md`.
- **No linter/formatter is configured.** There's no ESLint or Prettier
  config in this repo — don't invent style rules or assume `npm run lint`
  exists.
- **Views have no shared layout/CSS.** Changing the shared look (colors,
  spacing, fonts) means editing the inline `<style>` block in all five
  `.ejs` files under `src/views/`; missing one causes visual drift. This is
  a known gotcha, not something to refactor as part of an unrelated change.
- **Scope is deliberately minimal.** Per spec.md's "Out of Scope": no auth,
  no background jobs, no caching/search, no external integrations. Don't
  add these unless the task explicitly asks.

## Testing

Run `npm test` after any change under `src/`. Tests use `vitest` (globals
enabled via `vitest.config.cjs`, so no `import { describe, it }` needed) and
`supertest` against the exported `app` object directly — there's no listening
server or port involved.

## Deployment / ops

Deploy targets, the SuperPlane canvases, and their known gotchas are fully
documented in `.superplane/deploy.md` — read that before touching deploy
scripts or canvas YAML instead of duplicating it here.
