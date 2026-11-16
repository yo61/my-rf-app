#!/usr/bin/env bash

# Enable xtrace if the DEBUG environment variable is set
if [[ ${DEBUG-} =~ ^(1|yes|true)$ ]]; then
  set -o xtrace # Trace the execution of the script (debug)
fi

set -o errexit  # Exit on most errors (see the manual)
set -o nounset  # Disallow expansion of unset variables
set -o pipefail # Use last non-zero exit code in a pipeline

readonly WEB=apps/web
readonly RUNNER=migrate.mjs

usage() {
  echo "usage: build-artefact.sh <empty output directory>  (run from the repository root)" >&2
  exit 2
}

build_worker() {
  pnpm --filter @my-app/web build:ui
  pnpm --filter @my-app/web exec wrangler deploy --dry-run --outdir dist/deploy
}

bundle_runner() {
  local out=$1
  pnpm --filter @my-app/web exec esbuild scripts/poc-migrate.ts --bundle --platform=node \
    --format=esm --target=node26 --outfile="$out/$RUNNER" --log-level=warning \
    --external:bufferutil --external:utf-8-validate \
    "--banner:js=import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"
}

app_role() {
  pnpm --silent --filter @my-app/web exec tsx --eval \
    "import { APP_ROLE } from './src/db/schema/rls'; console.log(APP_ROLE)"
}

main() {
  [[ $# -eq 1 ]] || usage
  [[ -f pnpm-workspace.yaml ]] || usage
  mkdir -p "$1"
  [[ -z $(ls -A "$1") ]] || usage
  local out role
  out=$(cd "$1" && pwd)

  build_worker
  mkdir -p "$out/dist" "$out/migrations"
  cp -R "$WEB/dist/deploy" "$WEB/dist/ui" "$out/dist/"
  node "$WEB/scripts/poc-worker-config.mjs" "$WEB/wrangler.toml" "$out/worker-config.json"

  cp -R "$WEB/migrations/." "$out/migrations/"
  bundle_runner "$out/migrations"
  role=$(app_role)
  jq --null-input --arg runner "$RUNNER" --arg role "$role" '{runner: $runner, appRole: $role}' \
    > "$out/migrations/manifest.json"
  echo "Artefact in $out (app role $role)"
}

# Invoke main with args if not sourced (https://stackoverflow.com/a/28776166/8787985)
if ! (return 0 2> /dev/null); then
  main "$@"
fi
