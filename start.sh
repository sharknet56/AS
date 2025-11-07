#!/bin/bash

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

echo ""
echo "🎯 Starting services..."
echo ""

# Start backend in background
echo "🔧 Starting FastAPI backend on http://localhost:8000..."
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting React frontend on http://localhost:3000..."
cd frontend
npm run dev -- --host > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Application started successfully!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
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
