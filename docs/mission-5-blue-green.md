# Mission 5: Blue/Green Canary Deployments on Render with SuperPlane

## The Problem

Render is a great platform for hosting web services. You push code, it deploys. Simple.

But what happens when you push *bad* code?

Render deploys are all-or-nothing. Your new version replaces the old one. If it's broken, your users see errors until you notice and redeploy. There's no built-in way to gradually roll out changes, test them with real traffic, and automatically roll back if something goes wrong.

For production services, you need more than "deploy and pray." You need **blue/green deployments with canary traffic splitting** — and that's exactly what we built using SuperPlane to orchestrate Render, Cloudflare, Dash0, and GitHub Actions into a single automated pipeline.

## What is Blue/Green Deployment?

Blue/green is a deployment strategy where you maintain two identical environments:

- **Blue** — one copy of your application
- **Green** — another copy of your application

At any time, only one is "live" (serving real traffic). When you deploy new code, it goes to the *inactive* environment. You test it, verify it works, then switch traffic over. If something goes wrong, you switch back instantly — the old version is still running, untouched.

### Adding Canary to the Mix

A pure blue/green switch is still risky — you go from 0% to 100% in one step. **Canary deployment** adds a gradual phase: send a small percentage of traffic (say 30%) to the new version first, monitor for errors, and only promote to 100% if everything looks healthy.

If the canary detects problems, you roll back before most users are affected.

## The Architecture

Here's what we wired together:

| Component | Role |
|-----------|------|
| **Render** | Hosts 6 services (API, Web, Worker × blue + green) |
| **Cloudflare Worker** | Traffic splitting — routes requests to blue or green based on configurable weights stored in KV |
| **Cloudflare KV** | Stores traffic weights (`{"green_weight": 0.7, "blue_weight": 0.3}`) |
| **Dash0** | Observability — synthetic checks + PromQL error rate queries |
| **GitHub Actions** | Smoke tests triggered by SuperPlane |
| **SuperPlane** | The brain — orchestrates the entire pipeline |

### Why a Cloudflare Worker Instead of the Load Balancer?

We initially tried Cloudflare's native Load Balancer with weighted pools. Config looked perfect, both pools were healthy, but all traffic went to one origin regardless of weights.

The root cause: both Render services resolve to the same IP cluster. Render differentiates services by the `Host` header, but the LB wasn't passing the correct origin hostname. The Worker solves this by explicitly setting the `Host` header for each origin and reading traffic weights from KV — giving us precise, API-controllable traffic splitting.

## The Pipeline

When you push to `main`, SuperPlane runs this pipeline (30 nodes, 45 edges):

### Phase 1: Deploy
```
Push to main → Read state (which env is live?) → Deploy to inactive env (API + Web + Worker)
```

SuperPlane reads from memory which environment is currently active, then deploys all three services to the *other* environment using `render.deploy`.

### Phase 2: Canary
```
Deploy complete → Set traffic weights (30% new, 70% old) → Start parallel checks
```

Three things happen simultaneously:
- **Smoke tests** (GitHub Actions) — basic health checks against the new environment
- **Dash0 synthetic check** — verifies the service responds to HTTP probes
- **Canary soak timer** (2 min) → **Dash0 PromQL error rate query**

The PromQL query measures real 5xx error rates across the deployment:
```promql
sum(increase(http_server_request_duration_milliseconds_count{http_status_code=~"5.."}[5m]))
/ sum(increase(http_server_request_duration_milliseconds_count[5m])) * 100
or vector(0)
```

### Phase 3: Health Check

All three checks feed into a merge node, then a single `if` expression evaluates them:

```
$["Smoke Tests"].data.conclusion == "success"
&& $["Dash0 Synthetic"].data.metrics.lastOutcome == "Healthy"
&& float($["Canary Error Rate"].data.data.result[0].value[1]) <= 1
```

Using [expr-lang](https://expr-lang.org/) syntax (SuperPlane's expression engine), this checks:
1. Did smoke tests pass?
2. Is the Dash0 synthetic check healthy?
3. Is the error rate ≤ 1%?

### Phase 4a: Promote (all checks pass)
```
Health OK → Set traffic to 100% new env → Save state to memory → Notify Discord
```

Memory is updated with the new environment's deploy IDs and marked as active. The old environment is marked inactive but its deploy IDs are preserved for potential future rollback.

### Phase 4b: Rollback (any check fails)
```
Health NOT OK → Restore traffic to 100% old env → Read previous deploy IDs from memory → Rollback Render services
```

This is a two-stage rollback:
1. **Immediate**: Traffic is restored to the old (working) environment via Cloudflare KV
2. **Cleanup**: The faulty Render services are rolled back to their previous deploy using `render.rollbackDeploy`, with deploy IDs read from SuperPlane's memory

## State Management

SuperPlane's memory stores the full state of both environments:

| key | active | api_deploy | web_deploy | worker_deploy |
|-----|--------|------------|------------|---------------|
| blue | true | dep-xxx | dep-xxx | dep-xxx |
| green | false | dep-xxx | dep-xxx | dep-xxx |

This enables:
- **Knowing which env to deploy to** (the inactive one)
- **Knowing which deploy IDs to rollback to** (the last known-good state)
- **Flipping active state** after promote
- **Preserving deploy IDs** across runs

Memory is only updated after a successful promote — so if a rollback happens, the stored deploy IDs are still the last known-good versions.

## Why This Matters

### Dumb Smoke Tests Aren't Enough

We proved this experimentally. We simplified our smoke tests to only check GET endpoints (health checks, list products). They passed every time — even when the API had a bug that caused POST requests to fail after 5 requests.

The Dash0 PromQL error rate query caught what smoke tests missed. During the canary soak, real traffic patterns (POST requests) triggered 500 errors that pushed the error rate above 1%, causing an automatic rollback.

**Smoke tests verify the app starts. Observability verifies the app works under real conditions.**

### The Three-Layer Safety Net

| Check | What it catches | Speed |
|-------|----------------|-------|
| **Smoke tests** | App won't start, missing dependencies, broken routes | Fast (~60s) |
| **Dash0 synthetic** | Service unreachable, DNS issues, TLS problems | Fast (~30s) |
| **Dash0 error rate** | Runtime bugs, edge cases, performance degradation | Requires traffic + soak time |

Each layer catches different classes of failures. Together, they provide comprehensive deployment safety.

## What SuperPlane Adds to Render

Render provides excellent hosting. SuperPlane extends it with deployment orchestration that Render doesn't offer natively:

- **Blue/green environments** — coordinated deploys across multiple services
- **Canary traffic splitting** — gradual rollout with real traffic
- **Multi-signal health checks** — smoke tests + synthetic monitoring + error rate metrics
- **Automatic rollback** — traffic + Render service revert, no human intervention
- **State management** — tracks which environment is live and stores deploy IDs for rollback
- **Event-driven orchestration** — push to main triggers the entire pipeline

All of this runs as a SuperPlane canvas — visual, auditable, and modifiable without writing deployment scripts.

## Tech Stack

- **SuperPlane** — workflow orchestration ([superplane.com](https://superplane.com))
- **Render** — application hosting ([render.com](https://render.com))
- **Cloudflare Workers + KV** — traffic routing and weight storage
- **Dash0** — observability and PromQL metrics ([dash0.com](https://dash0.com))
- **GitHub Actions** — smoke test execution
- **Discord** — deployment notifications

## Canvas Details

- **30 nodes**, **45 edges**, **4 integrations** (Render, GitHub, Dash0, Discord)
- Canvas ID: `fa00d168-2886-4ade-9933-7a721c932ff5`
- Organization: SuperPlane (production)
- Canary weight: 30% new / 70% old
- Soak timer: 2 minutes (configurable)
- Error rate threshold: 1%

---

*Built by Bender Bending Rodríguez ([@bender-rodriguez-unit1](https://github.com/bender-rodriguez-unit1)) and Alex Mitrovic ([@AleksandarCole](https://github.com/AleksandarCole)) at SuperPlane.*
