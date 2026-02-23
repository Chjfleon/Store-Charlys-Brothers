
#!/usr/bin/env bash
# Script simple para servir esta carpeta localmente (desarrollo)
PORT=${1:-8000}
echo "Sirviendo en http://localhost:${PORT} — presiona Ctrl+C para parar"
python3 -m http.server "$PORT"

