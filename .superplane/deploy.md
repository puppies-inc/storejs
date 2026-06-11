# Deployment

## How it works

StoreJS runs on a DigitalOcean droplet as a systemd service.

- **Host:** `storejs-prod` droplet (DigitalOcean droplet id `575470632`, IP may change on recreation)
- **Service:** `storejs.service` (auto-restarts on crash, starts on boot)
- **App directory:** `/opt/storejs`
- **Service command:** `node --require ./src/instrumentation.js src/server.js` (OpenTelemetry enabled; `DASH0_TOKEN`, `PORT=3000`, `NODE_ENV=production` are set in the unit)
- **Deploy script:** `scripts/deploy.sh` — fetches, hard-resets to a target commit, `npm install --production`, restarts the service, then polls the health endpoint

## Deploying manually

SSH into the droplet and run the deploy script (optionally pin a commit):

```bash
ssh -i <key> root@<droplet-ip> "bash /opt/storejs/scripts/deploy.sh <optional-sha>"
```

Exit code 0 = success (health check passed), non-zero = failure (the script dumps `systemctl` status + journal logs on health-check failure).

## Auto-deploy SuperPlane Canvas

There is a SuperPlane canvas that redeploys on every push to `main`:

- **App name:** `storejs-deploy-on-main`
- **App id:** `a6d6f81d-1fdf-4cea-adfc-345ce2cbf1c5`
- **Flow:** `github.onPush (main)` → `digitalocean.getDroplet` (resolve public IP) → `ssh` (run `scripts/deploy.sh` pinned to the pushed commit)

## PR preview SuperPlane Canvas

When a PR is opened against `storejs`, SuperPlane spins up a preview droplet and comments the URL on the PR:

- **App name:** `storejs-preview-on-pr`
- **App id:** `1b1c1566-ed6a-40fe-a210-1323e69d1bfd`
- **Flow:** `github.onPullRequest (opened)` → `digitalocean.createDroplet` → `wait` → `ssh` (run `scripts/preview-setup.sh`) → `github.createIssueComment` (preview URL)
- **Canvas YAML:** [.superplane/preview-on-pr.yaml](preview-on-pr.yaml)
- **Setup script:** `scripts/preview-setup.sh` (cloned from `main` on the droplet; checks out the PR branch via `PR_NUMBER`)

Preview URL format: `http://<droplet-ip>/cats`

Recreate with:

```bash
superplane apps create --canvas-file .superplane/preview-on-pr.yaml --canvas-auto-layout horizontal
```

Monitor a run:

```bash
superplane events list --app-id 1b1c1566-ed6a-40fe-a210-1323e69d1bfd
superplane executions list --app-id 1b1c1566-ed6a-40fe-a210-1323e69d1bfd --node-id setup-preview -o yaml
```

### Recreating the canvas (CLI recipe for an agent)

The SuperPlane CLI is the source of truth — discover exact names/IDs/schemas with it before writing YAML. Skills: `superplane-canvas-builder`, `superplane-cli`, `superplane-monitor`.

1. **Verify session:** `superplane whoami`
2. **Confirm integrations exist** (`superplane integrations list`) and grab their IDs:
   - GitHub: `github-puppies` → `51a76317-1481-467b-b761-3bb11af1851e` (repo resource name: `storejs`)
   - DigitalOcean: `digitalocean` → `505ed7fc-cc70-4226-8ff6-50e3ef601b8d`
3. **Confirm the secret** holding the droplet SSH key (`superplane secrets list`):
   - `STOREJS_SSH_DO`, key `private_key`
4. **Find the prod droplet id:** `superplane integrations list-resources --id 505ed7fc-cc70-4226-8ff6-50e3ef601b8d --type droplet` → `storejs-prod` = `575470632`
5. **Apply the canvas YAML** in [.superplane/deploy-prod-on-main.yaml](deploy-prod-on-main.yaml), then create + lay out:
   ```bash
   superplane apps create --canvas-file .superplane/deploy-prod-on-main.yaml --canvas-auto-layout horizontal
   # later edits (file must include metadata.id; change management is disabled so no --draft needed):
   superplane apps canvas update --file .superplane/deploy-prod-on-main.yaml
   ```
6. **Verify clean:** `superplane apps canvas get storejs-deploy-on-main -o yaml` shows empty `errorMessage`/`warningMessage` on every node.
7. **Validate a run** after a push to `main`:
   ```bash
   superplane events list --app-id <app-id>
   superplane events list-executions --app-id <app-id> --event-id <event-id>
   superplane executions list --app-id <app-id> --node-id deploy-over-ssh -o yaml   # inspect stdout/stderr/exitCode
   ```

### Working canvas YAML

```yaml
apiVersion: v1
kind: Canvas
metadata:
  name: storejs-deploy-on-main
  description: Auto-deploys storejs to the DigitalOcean prod droplet whenever main changes.
spec:
  nodes:
    - id: trigger-main-push
      name: GitHub Push (main)
      type: TYPE_TRIGGER
      component: github.onPush
      integration: { id: 51a76317-1481-467b-b761-3bb11af1851e, name: "" }
      configuration:
        repository: storejs
        refs:
          - { type: equals, value: refs/heads/main }
      position: { x: 120, y: 100 }

    - id: get-prod-droplet
      name: Get Prod Droplet
      type: TYPE_ACTION
      component: digitalocean.getDroplet
      integration: { id: 505ed7fc-cc70-4226-8ff6-50e3ef601b8d, name: "" }
      configuration:
        droplet: "575470632"     # getDroplet uses the droplet ID, not the name
      position: { x: 720, y: 100 }

    - id: deploy-over-ssh
      name: Deploy to Prod Droplet
      type: TYPE_ACTION
      component: ssh
      configuration:
        # Public IP is resolved dynamically from the getDroplet output.
        host: '{{ filter($["Get Prod Droplet"].data.networks.v4, .type == "public")[0].ip_address }}'
        port: 22
        username: root
        authentication:
          authMethod: ssh_key
          privateKey: { secret: STOREJS_SSH_DO, key: private_key }
        # Pin the deploy to the exact pushed commit.
        environment:
          - { name: DEPLOY_SHA, value: '{{ root().data.after }}' }
        commands: |
          cd /opt/storejs
          git fetch origin main
          git checkout "$DEPLOY_SHA" -- scripts/deploy.sh
          bash scripts/deploy.sh "$DEPLOY_SHA"
        timeout: 300
        connectionRetry: { enabled: true, retries: 5, intervalSeconds: 15 }
      position: { x: 1320, y: 100 }

  edges:
    - { sourceId: trigger-main-push, targetId: get-prod-droplet, channel: default }
    - { sourceId: get-prod-droplet, targetId: deploy-over-ssh, channel: default }
```

### Output channels

The `ssh` node emits `success` (remote command exit 0) and `failed` (non-zero). It can show `result: RESULT_PASSED` (SSH ran fine) while still routing to `failed` — always check the node's `outputs` channel and the remote `exitCode`, not just `result`.

## Gotchas (learned the hard way — heed these)

- **The `ssh` node joins multi-line `commands` with `&&` and runs them under `sh` (dash).** Multi-line shell blocks (`for … do … done`, `if … then … fi`) break with `Syntax error: "&&" unexpected`. Keep the canvas command to simple one-per-line statements and put any real logic inside `scripts/deploy.sh` (which runs in real `bash`).
- **`secret-key` reference shape** is `{ secret: <name>, key: <key> }` (not `secretName`).
- **`github.onPush` payload:** `root().data.after` is the pushed head SHA; `root().data.ref` is the branch ref. Use one `.data` (the webhook body has no extra `data` wrapper).
- **`digitalocean.getDroplet`** takes the droplet **ID** (`useNameAsValue: false`) and returns `data.networks.v4[]` with `{ ip_address, type }`; filter for `type == "public"`.
- **Health check must poll**, not `sleep N` once — the freshly restarted service needs a few seconds; a single curl will hit connection-refused and (under `set -e`) abort with curl's exit code.
- **Production deps:** the service runs with `--require ./src/instrumentation.js`, so every package that `src/instrumentation.js` requires (incl. `@opentelemetry/sdk-metrics`, `@opentelemetry/resources`, `@opentelemetry/semantic-conventions`) must be in `dependencies`, or `npm install --production` will omit it and the service crash-loops with `MODULE_NOT_FOUND`. Use the `resources` 2.x API (`resourceFromAttributes()`), not `new Resource()`.

### Secrets needed

| Secret name | Key | Description |
|---|---|---|
| `STOREJS_SSH_DO` | `private_key` | SSH private key for the `storejs-prod` droplet (`root@`) |
