# AGENTS.md

Guidance for coding agents working in this repo. It's a tiny demo app — keep
changes proportionally small.

## What this is

A minimal Node.js/Express + EJS CRUD demo for a single entity, `Puppy`
(`id`, `name`, `created_at`, `updated_at`). See `spec.md` for full product
scope and explicit **out-of-scope** items (auth, background jobs,
caching/search, external integrations, complex architecture layers) and
`README.md` for a quick user-facing overview. Don't expand scope beyond
`spec.md` unless the task explicitly asks for it.

## Setup & commands

```bash
npm install     # install deps
npm run dev     # local dev, node --watch, no telemetry
npm start       # "production" mode: node --require ./src/instrumentation.js src/server.js
npm test        # vitest run
```

There is no lint/typecheck/build script configured (no ESLint/Prettier,
no `.nvmrc`/engines field, no CI workflow) — don't invent one or assume
it exists.

## Architecture

Everything lives in `src/`:

- `src/app.js` — the whole app: Express routes, an in-memory `puppies`
  array + `nextId` counter as the "database", and the notice-flash pattern
  (`req.app.locals.notice` set on write, read once per request in
  middleware). Also exports `app.resetStore()`, used by tests to reset
  state between runs.
- `src/server.js` — thin entrypoint, just calls `app.listen`.
- `src/instrumentation.js` / `src/metrics.js` — OpenTelemetry (Dash0
  exporter) wiring and three custom counters (`puppiesCreated`,
  `puppiesDeleted`, `puppiesTotal`) called from `app.js`. This is
  best-effort telemetry, not app logic — don't let it drive design
  decisions in the CRUD routes.
- `src/views/puppies/{index,new,show,edit}.ejs` + `src/views/about.ejs` —
  server-rendered HTML, one view per route.

## Data model

In-memory only — resets on every process restart/redeploy. There is no
database, migration, or persistence layer. Don't add one unless a task
explicitly asks for it.

## View/style convention

Each `.ejs` page in `src/views/puppies/` is a full standalone HTML
document with an identical inline `<style>` block copy-pasted across all
four files (`index.ejs`, `new.ejs`, `edit.ejs`, `show.ejs`); `about.ejs`
has its own separate style block. There is no shared stylesheet or layout
template. If you change shared look-and-feel, update the `<style>` block
in all four `puppies/*.ejs` files consistently, or explicitly call out in
your change that you're consolidating them into a shared partial/asset.

## Testing

`test/app.test.js` uses vitest + supertest against the Express app
directly (no server/socket needed). `vitest.config.cjs` sets
`globals: true`, so `describe`/`it`/`expect` are available without
imports. Call `app.resetStore()` in `beforeEach` to reset the in-memory
store between tests. Assertions favor status codes, redirect
`Location` headers, and `response.text` substring checks over deep HTML
parsing — follow that style for new tests. Run with `npm test`.

## Production dependency gotcha

The prod service starts with `--require ./src/instrumentation.js`, and
prod installs run `npm install --production`. Any package that
`src/instrumentation.js` (or anything it pulls in, e.g. OpenTelemetry
SDK/exporters) requires **must** live in `dependencies`, not
`devDependencies`, or the service crash-loops with `MODULE_NOT_FOUND`.
See the "Gotchas" section of `.superplane/deploy.md` for the full story.

## Deployment & infra

The live deployment target is a DigitalOcean droplet running as a
systemd service, driven by SuperPlane canvases (auto-deploy on push to
`main`, plus PR preview droplets). Full details, gotchas, and canvas
YAML live in `.superplane/deploy.md` — read that before touching
deploy-related code instead of duplicating it here. `render.yaml` is a
secondary/legacy Blueprint deploy path (documented in `README.md`), not
the current production path.

`scripts/*.sh` are infra bootstrap/deploy scripts, not application code:

- `scripts/deploy.sh` — runs on the prod droplet to pull, install, and
  restart the systemd service.
- `scripts/preview-setup.sh` — bootstraps a PR preview droplet.
- `scripts/daytona-prepare-sandbox.sh` — bootstraps a Daytona sandbox for
  an agent (installs Codex CLI, clones the repo, runs tests).

Treat these as ops tooling: don't "refactor" them as if they were part of
the app's request/response flow.
