#!/bin/bash
REPO="rodolphe-o/omenai_turbo_v1"

while IFS= read -r line; do
  [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  key=$(echo "$key" | xargs)
  [[ -z "$key" || -z "$value" ]] && continue
  echo "Setting: $key"
  printf '%s' "$value" | gh secret set "$key" --repo "$REPO" --body -
done < .env.local
