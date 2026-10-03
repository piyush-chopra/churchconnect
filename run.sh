#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -x .venv/bin/python ]; then python3 -m venv .venv; fi
.venv/bin/python -m pip install -r backend/requirements.txt
(cd frontend && npm ci --no-fund --no-audit && npm run build)
.venv/bin/python backend/manage.py migrate
.venv/bin/python backend/manage.py seed_demo
.venv/bin/python backend/manage.py runserver "${BIND_ADDRESS:-127.0.0.1:8000}"
