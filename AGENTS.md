# AGENTS.md

Guidance for agents working in this repository. Keep changes small and
grounded in what's actually here — this is an intentionally minimal demo app,
not a large production system.

## What this is

A minimal Node.js CRUD demo (Express + EJS) for a single `Puppy` entity
(`id`, `name`, `created_at`, `updated_at`), stored in memory (data resets on
every restart). Product requirements live in `spec.md` — read that before
changing behavior, not just this file.

## Setup, build, test

```bash
npm install
npm test    # vitest run — test/app.test.js, supertest against the app object
npm start   # node --require ./src/instrumentation.js src/server.js (OpenTelemetry on)
npm run dev # node --watch src/server.js (no instrumentation, for local iteration)
```

- `npm test` talks to the Express `app` directly via supertest — no server or
  port is bound. Call `app.resetStore()` between tests for isolation (see
  `test/app.test.js`'s `beforeEach`).
- There is no lint/format script or config in this repo. Don't invent one
  (e.g. don't add `npm run lint` instructions or assume ESLint/Prettier are
  configured).
- There is no CI workflow (`.github/`) in the repo; the only automation is
  the SuperPlane deploy/preview canvases described below.

## Code layout

- `src/app.js` — the entire Express app: routes, the in-memory `puppies`
  array, the notice-flash helper (`setNotice` → `res.locals.notice`), and
  `app.resetStore()` used by tests. This is the file to touch for any
  behavior change.
- `src/server.js` — thin entrypoint, just `app.listen(port)`.
- `src/instrumentation.js` — OpenTelemetry SDK setup, loaded only via
  `--require` in `npm start` (not in tests or `npm run dev`).
- `src/metrics.js` — the three business counters
  (`store.puppies.created` / `.deleted` / `.total`).
- `src/views/puppies/{index,new,show,edit}.ejs`, `src/views/about.ejs` —
  EJS templates. Each page has its own inline `<style>` block; there is no
  shared layout, partial, or external CSS/JS asset.
- `test/app.test.js` — black-box HTTP tests (supertest + vitest) against the
  exported `app`.
- `scripts/` and `.superplane/` — deployment and preview-environment
  automation, not app runtime code (see Deployment below).

## Conventions

- Routes are the standard resourceful set, using plain `POST` + a path
  suffix instead of method override (no PUT/PATCH/DELETE verbs):
  `GET /puppies`, `GET /puppies/new`, `POST /puppies`, `GET /puppies/:id`,
  `GET /puppies/:id/edit`, `POST /puppies/:id` (update),
  `POST /puppies/:id/delete`. `GET /` redirects to `/puppies`, and
  `GET /about` renders a static info page.
- Flash notices: call `setNotice(req, message)` before a redirect; the
  message is read once as `notice` in the next rendered view and cleared
  automatically by the middleware in `app.js`. Don't reintroduce a
  session/cookie-based flash — this single-request pattern is intentional.
- Validation is intentionally minimal per `spec.md`: an empty `name` is
  valid and persisted as-is. Don't add stricter validation without checking
  `spec.md` first.
- `new.ejs` and `edit.ejs` render the same field set; keep them symmetric
  if you add or change fields.
- Any change to the create/delete flows must keep the `puppiesCreated`,
  `puppiesDeleted`, and `puppiesTotal` counter calls in `src/metrics.js`
  in sync with the actual state change.
- Dependency placement gotcha: `npm start` runs with
  `--require ./src/instrumentation.js`, and production deploys run
  `npm install --production`. Every package `src/instrumentation.js`
  requires — including transitive OpenTelemetry packages such as
  `@opentelemetry/sdk-metrics`, `@opentelemetry/resources`, and
  `@opentelemetry/semantic-conventions` — must stay in `dependencies`,
  never `devDependencies`, or the production service crash-loops with
  `MODULE_NOT_FOUND`.

## Deployment

Production deploys and PR preview environments are automated via SuperPlane
canvases against DigitalOcean droplets. Full details, gotchas, and the
canvas recreation recipe live in `.superplane/deploy.md` — read that before
touching `scripts/deploy.sh`, `scripts/preview-setup.sh`, or the canvas
YAMLs in `.superplane/`, rather than duplicating it here.
