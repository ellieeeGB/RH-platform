#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -d .venv ]; then
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi
.venv/bin/python -m aplicacion.cli preparar
set -a
source .env
set +a
if ! .venv/bin/python -c 'from aplicacion.modelos import conectar,Usuario; from sqlalchemy import select; _,S=conectar(); s=S(); raise SystemExit(0 if s.scalar(select(Usuario.id).limit(1)) else 1)'; then
  echo 'Primera ejecución: crea la contraseña local del usuario administrador.'
  .venv/bin/python -m aplicacion.cli usuario administrador
fi
exec .venv/bin/uvicorn aplicacion.main:crear_app --factory --host 127.0.0.1 --port 8000
