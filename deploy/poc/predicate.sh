#!/usr/bin/env bash

# Enable xtrace if the DEBUG environment variable is set
if [[ ${DEBUG-} =~ ^(1|yes|true)$ ]]; then
  set -o xtrace # Trace the execution of the script (debug)
fi

set -o errexit  # Exit on most errors (see the manual)
set -o nounset  # Disallow expansion of unset variables
set -o pipefail # Use last non-zero exit code in a pipeline

readonly APP=my-app

usage() {
  echo "usage: predicate.sh <staging|production> <sha256:digest>" >&2
  echo "  env: CONTROL_PLANE_URL, ARTEFACT_REPOSITORY" >&2
  exit 2
}

# Prints the next link as {"sequence": n, "previous": "sha256:…" | null}.
next_link() {
  local control_plane=$1 environment=$2 body status
  body=$(mktemp)
  trap 'rm -f "$body"' RETURN
  status=$(curl --silent --show-error --output "$body" --write-out '%{http_code}' \
    "$control_plane/v1/apps/$APP/environments/$environment/head")
  case "$status" in
    200) jq --compact-output '{sequence: (.sequence + 1), previous: .payloadSha256}' "$body" ;;
    404)
      if [[ $(jq --raw-output '.code // empty' "$body") != no_documents ]]; then
        echo "Control plane head for $APP/$environment: unexpected 404: $(cat "$body")" >&2
        exit 1
      fi
      echo '{"sequence": 1, "previous": null}'
      ;;
    *)
      echo "Control plane head for $APP/$environment: HTTP $status: $(cat "$body")" >&2
      exit 1
      ;;
  esac
}

main() {
  [[ $# -eq 2 ]] || usage
  local environment=$1 digest=$2 config link
  [[ $environment =~ ^(staging|production)$ ]] || usage
  [[ $digest =~ ^sha256:[0-9a-f]{64}$ ]] || usage
  local control_plane=${CONTROL_PLANE_URL:?set CONTROL_PLANE_URL}
  local repository=${ARTEFACT_REPOSITORY:?set ARTEFACT_REPOSITORY}

  config="$(dirname "${BASH_SOURCE[0]}")/$environment.json"
  link=$(next_link "$control_plane" "$environment")
  jq --null-input --sort-keys \
    --arg app "$APP" --arg environment "$environment" \
    --arg repository "$repository" --arg digest "$digest" \
    --argjson link "$link" --slurpfile config "$config" \
    '{
      app: $app,
      environment: $environment,
      sequence: $link.sequence,
      previous: $link.previous,
      operation: "deploy",
      artefact: {repository: $repository, digest: $digest}
    } + $config[0]'
}

# Invoke main with args if not sourced (https://stackoverflow.com/a/28776166/8787985)
if ! (return 0 2> /dev/null); then
  main "$@"
fi
