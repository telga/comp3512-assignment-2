#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

pkill -f "live-server" 2>/dev/null

nohup live-server --host=0.0.0.0 --port=3000 --no-browser \
  >/dev/null 2>&1 &

echo "Live-server RUNNING"
echo "Serving from: $PROJECT_ROOT"
