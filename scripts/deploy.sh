#!/bin/bash
set -e

# Optional target commit/ref to deploy. Defaults to the tip of main.
TARGET_REF="${1:-origin/main}"

cd /opt/storejs

echo "Fetching latest changes..."
git fetch origin main

echo "Checking out $TARGET_REF..."
git reset --hard "$TARGET_REF"

echo "Installing dependencies..."
npm install --production

echo "Restarting service..."
systemctl restart storejs

echo "Waiting for startup..."
# Poll the health endpoint until the freshly restarted service responds.
HTTP_STATUS=000
for i in $(seq 1 30); do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/cats || true)
  [ "$HTTP_STATUS" = "200" ] && break
  sleep 2
done

if [ "$HTTP_STATUS" = "200" ]; then
  echo "Deploy successful - storejs is healthy (HTTP $HTTP_STATUS)"
  exit 0
else
  echo "Deploy FAILED - health check returned HTTP $HTTP_STATUS"
  echo "--- systemctl cat storejs ---"
  systemctl cat storejs --no-pager || true
  echo "--- systemctl status storejs ---"
  systemctl status storejs --no-pager -l || true
  echo "--- journalctl -u storejs (last 40) ---"
  journalctl -u storejs -n 40 --no-pager || true
  exit 1
fi
