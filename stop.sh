#!/bin/bash

# Stop script for Image Sharing Application

echo " Stopping Image Sharing Application..."

# Function to kill a process and all its children
kill_tree() {
    local pid=$1
    local children=$(pgrep -P $pid 2>/dev/null)
    for child in $children; do
        kill_tree $child
    done
    kill $pid 2>/dev/null
}

if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo " Stopping backend (PID: $BACKEND_PID)..."
        kill_tree $BACKEND_PID
    fi
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo " Stopping frontend (PID: $FRONTEND_PID) and child processes..."
        kill_tree $FRONTEND_PID
    fi
    rm .frontend.pid
fi

# Clean up any remaining node/esbuild processes from this project
# (in case some processes escaped the tree kill)
pkill -f "vite.*frontend" 2>/dev/null
pkill -f "esbuild.*frontend" 2>/dev/null

echo " Application stopped"
