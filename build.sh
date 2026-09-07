#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "======================================"
echo "Starting TurfX Build Process on Render"
echo "======================================"

python -m pip install --upgrade pip
pip install -r requirements.txt

# If DATABASE_URL is provided during build, attempt table initialization
if [ -n "$DATABASE_URL" ]; then
    echo "Running database initialization..."
    python init_db.py || true
fi

echo "Build process completed successfully!"
