#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/src/frontend"
PNPM_STORE_DIR="${PNPM_STORE_DIR:-$ROOT_DIR/.pnpm-store}"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' is not installed." >&2
    exit 1
  fi
}

need_cmd pnpm

mkdir -p "$PNPM_STORE_DIR"

export PNPM_STORE_DIR
export CANISTER_ID_BACKEND="${CANISTER_ID_BACKEND:-aaaaa-aa}"

echo "Using pnpm store: $PNPM_STORE_DIR"
echo "Using CANISTER_ID_BACKEND: $CANISTER_ID_BACKEND"

if ! command -v mops >/dev/null 2>&1; then
  echo "Note: 'mops' is not installed, so this script starts the frontend UI only."
  echo "The current backend at src/backend/main.mo is just an empty actor, so this is enough to view the app."
fi

if [ ! -x "$FRONTEND_DIR/node_modules/.bin/vite" ]; then
  echo "Installing frontend dependencies..."
  pnpm install --dir "$FRONTEND_DIR" --prefer-offline --store-dir "$PNPM_STORE_DIR"
fi

echo "Starting frontend dev server on http://127.0.0.1:5173"
exec pnpm --dir "$FRONTEND_DIR" dev --host 0.0.0.0
