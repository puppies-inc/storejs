#!/usr/bin/env bash
#
# Prepares a blank Daytona sandbox by:
#   1. Installing @openai/codex
#   2. Cloning this repo using GITHUB_TOKEN
#   3. Changing workdir to the repo
#   4. Running the test suite
#
# Required env vars (set when creating/executing in sandbox):
#   DAYTONA_SANDBOX_ID  - Confirms Daytona context
#   DAYTONA_API_KEY     - Daytona API key
#   GITHUB_TOKEN        - GitHub PAT for cloning
#
# Optional env vars:
#   REPO_URL            - Git URL (default: https://github.com/puppies-inc/storejs.git)
#   REPO_DIR           - Clone directory (default: storejs)
#   WORK_DIR            - Base directory (default: /home/daytona)
#
# One-liner to run from a sandbox (nothing preconfigured):
#   curl -sL https://raw.githubusercontent.com/puppies-inc/storejs/main/scripts/daytona-prepare-sandbox.sh | bash
#

set -euo pipefail

for key in DAYTONA_SANDBOX_ID DAYTONA_API_KEY GITHUB_TOKEN; do
  if [[ -z "${!key:-}" ]]; then
    echo "Missing required env: $key. Skipping."
    exit 0
  fi
done

REPO_URL="${REPO_URL:-https://github.com/puppies-inc/storejs.git}"
REPO_DIR="${REPO_DIR:-storejs}"
WORK_DIR="${WORK_DIR:-/home/daytona}"

# Inject token for HTTPS clone
CLONE_URL="${REPO_URL/https:\/\//https://x-access-token:${GITHUB_TOKEN}@}"

mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

echo "Installing @openai/codex..."
npm install -g @openai/codex

echo "Cloning $REPO_URL into $WORK_DIR/$REPO_DIR ..."
git clone "$CLONE_URL" "$REPO_DIR"
cd "$REPO_DIR"

echo "Installing dependencies and running tests..."
npm install && npm test

echo "Done."
