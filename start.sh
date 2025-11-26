#!/bin/bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"
BACKEND_DIR="$ROOT_DIR/backend"
SECRETS_FILE="$BACKEND_DIR/.secrets.enc"

resolve_backend_path() {
    local value="$1"
    if [[ "$value" = /* ]]; then
        echo "$value"
    else
        echo "$BACKEND_DIR/$value"
    fi
}

ensure_secrets_present() {
    if [ -n "${SECRET_KEY:-}" ] && [ -n "${ENCRYPTION_KEY:-}" ]; then
        return
    fi

    if ! command -v openssl >/dev/null 2>&1; then
        echo "❌ openssl is required to manage encrypted secrets. Please install it and rerun."
        exit 1
    fi

    local passphrase passphrase_confirm tmp_file
    tmp_file="$(mktemp)"

    if [ ! -f "$SECRETS_FILE" ]; then
        echo "🔐 No encrypted secrets found. Initializing secure store..."
        read -s -p "Create secrets passphrase: " passphrase
        echo ""
        read -s -p "Confirm secrets passphrase: " passphrase_confirm
        echo ""
        if [ "$passphrase" != "$passphrase_confirm" ]; then
            echo "❌ Passphrases do not match. Aborting."
            rm -f "$tmp_file"
            exit 1
        fi

        python3 - <<'PY' > "$tmp_file"
import base64
import os
import secrets

secret_key = secrets.token_urlsafe(32)
encryption_key = base64.urlsafe_b64encode(os.urandom(32)).decode()
print(f'SECRET_KEY="{secret_key}"')
print(f'ENCRYPTION_KEY="{encryption_key}"')
PY

        if ! openssl enc -aes-256-cbc -pbkdf2 -salt -in "$tmp_file" -out "$SECRETS_FILE" -pass pass:"$passphrase" >/dev/null 2>&1; then
            echo "❌ Failed to encrypt secrets."
            rm -f "$tmp_file"
            exit 1
        fi
        echo "✅ Encrypted secrets stored at $SECRETS_FILE"
    else
        read -s -p "Enter secrets passphrase: " passphrase
        echo ""
        if ! openssl enc -d -aes-256-cbc -pbkdf2 -in "$SECRETS_FILE" -out "$tmp_file" -pass pass:"$passphrase" >/dev/null 2>&1; then
            echo "❌ Failed to decrypt secrets. Check your passphrase."
            rm -f "$tmp_file"
            exit 1
        fi
    fi

    set -a
    # shellcheck disable=SC1090
    source "$tmp_file"
    set +a

    rm -f "$tmp_file"
    unset passphrase passphrase_confirm tmp_file
}

# Startup script for Image Sharing Application

echo "🚀 Starting Image Sharing Application..."
echo ""

# Check if backend virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd backend
    cp .env.example .env
    python3 -m venv venv
    source venv/bin/activate
    echo "📥 Installing Python dependencies..."
    pip install -r requirements.txt
    cd ..
else
    echo "✅ Backend virtual environment found"
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
else
    echo "✅ Frontend dependencies found"
fi

ENV_FILE="$BACKEND_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Missing backend/.env file. Please create it before starting the app."
    exit 1
fi

set -a
# shellcheck disable=SC1091
source "$ENV_FILE"
set +a

ensure_secrets_present

if [ -z "${SSL_BACKEND_CERT_PATH:-}" ] || [ -z "${SSL_BACKEND_KEY_PATH:-}" ]; then
    echo "❌ SSL_BACKEND_CERT_PATH and SSL_BACKEND_KEY_PATH must be set in backend/.env"
    exit 1
fi

BACKEND_CERT_PATH="$(realpath "$(resolve_backend_path "$SSL_BACKEND_CERT_PATH")")"
BACKEND_KEY_PATH="$(realpath "$(resolve_backend_path "$SSL_BACKEND_KEY_PATH")")"

if [ ! -f "$BACKEND_CERT_PATH" ] || [ ! -f "$BACKEND_KEY_PATH" ]; then
    echo "❌ SSL certificates not found at $BACKEND_CERT_PATH or $BACKEND_KEY_PATH"
    exit 1
fi

echo ""
echo "🎯 Starting services..."
echo ""

# Start backend in background
echo "🔧 Starting FastAPI backend on https://localhost:8000..."
cd backend
source venv/bin/activate
UVICORN_ARGS=(app.main:app --host 0.0.0.0 --port 8000 --ssl-certfile "$BACKEND_CERT_PATH" --ssl-keyfile "$BACKEND_KEY_PATH")
if [ -n "${SSL_KEY_PASSPHRASE:-}" ]; then
    UVICORN_ARGS+=(--ssl-keyfile-password "$SSL_KEY_PASSPHRASE")
fi
uvicorn "${UVICORN_ARGS[@]}" > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting React frontend on https://localhost:3000..."
cd frontend
npm run dev -- --host > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Application started successfully!"
echo ""
echo "📍 Frontend: https://localhost:3000"
echo "📍 Backend API: https://localhost:8000"
echo "📍 API Docs: https://localhost:8000/docs"
echo ""
echo "📋 Backend PID: $BACKEND_PID (logs in backend.log)"
echo "📋 Frontend PID: $FRONTEND_PID (logs in frontend.log)"
echo ""
echo "To stop the application, run: ./stop.sh"
echo "Or manually: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Save PIDs to file for stop script
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid
