#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "======================================"
echo "Starting TurfX Build Process on Render"
echo "======================================"

python -m pip install --upgrade pip
pip install -r requirements.txt

# If MONGODB_URI is provided during build, attempt database initialization
if [ -n "$MONGODB_URI" ]; then
    echo "Running MongoDB initialization..."
    python init_db.py || true
fi

echo "Build process completed successfully!"
