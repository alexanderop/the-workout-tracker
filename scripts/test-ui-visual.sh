#!/usr/bin/env bash
set -euo pipefail

mode="${1:-check}"
if [[ "$mode" != "check" && "$mode" != "update" ]]; then
  echo "Usage: scripts/test-ui-visual.sh [check|update]" >&2
  exit 2
fi

root="$(cd "$(dirname "$0")/.." && pwd)"
image="mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27"
evidence="$root/packages/ui/test-results/visual"
mkdir -p "$evidence"
run_evidence="$(mktemp -d "$evidence/run.XXXXXX")"
echo "Visual test evidence: $run_evidence"

docker run --rm --platform linux/amd64 --ipc=host \
  -e "VISUAL_MODE=$mode" \
  -v "$root:/source:ro" \
  -v "$run_evidence:/evidence" \
  "$image" bash -euc '
    mkdir /work
    tar -C /source --exclude=node_modules --exclude=.git --exclude=dist \
      --exclude=.audit --exclude=test-results --exclude=.vitest \
      --exclude=.test-generated --exclude=playwright-report -cf - . | tar -C /work -xf -
    cd /work
    corepack enable
    pnpm install --frozen-lockfile
    result=0
    if [ "$VISUAL_MODE" = update ]; then
      pnpm --filter @form/ui test:visual:update || result=$?
    else
      CI=true pnpm --filter @form/ui test:visual || result=$?
    fi
    if [ -d packages/ui/test/__screenshots__ ]; then
      cp -R packages/ui/test/__screenshots__ /evidence/
    fi
    if [ -d packages/ui/.vitest ]; then cp -R packages/ui/.vitest /evidence/; fi
    if [ -d packages/ui/test-results ]; then cp -R packages/ui/test-results /evidence/run; fi
    exit "$result"
  '

if [[ "$mode" == "update" ]]; then
  mkdir -p "$root/packages/ui/test/__screenshots__"
  cp -R "$run_evidence/__screenshots__/." "$root/packages/ui/test/__screenshots__/"
  echo "Review the updated screenshots before you commit them."
fi
