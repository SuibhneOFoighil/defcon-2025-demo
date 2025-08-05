#!/bin/bash

# Native Ludus Workshop Environment Startup Script
set -e

echo "🚀 Starting Ludus Workshop Environment (Native)..."

# Check if required tools are installed and install if missing
if ! command -v node &> /dev/null; then
    echo "📦 Node.js not found. Installing..."
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y nodejs
    elif command -v yum &> /dev/null; then
        sudo yum install -y nodejs
    elif command -v brew &> /dev/null; then
        brew install node
    else
        echo "❌ No supported package manager found. Please install Node.js manually."
        exit 1
    fi
fi

if ! command -v npm &> /dev/null; then
    echo "📦 npm not found. Installing..."
    if command -v apt &> /dev/null; then
        sudo apt install -y npm
    elif command -v yum &> /dev/null; then
        sudo yum install -y npm
    elif command -v brew &> /dev/null; then
        brew install npm
    else
        echo "❌ No supported package manager found. Please install npm manually."
        exit 1
    fi
fi

if ! command -v python3 &> /dev/null; then
    echo "📦 Python3 not found. Installing..."
    if command -v apt &> /dev/null; then
        sudo apt install -y python3
    elif command -v yum &> /dev/null; then
        sudo yum install -y python3
    elif command -v brew &> /dev/null; then
        brew install python3
    else
        echo "❌ No supported package manager found. Please install Python3 manually."
        exit 1
    fi
fi

# Install ttyd if not present
echo "🖥️  Checking ttyd installation..."
if ! command -v ttyd &> /dev/null; then
    if command -v apt &> /dev/null; then
        echo "📦 Installing ttyd via apt..."
        sudo apt update && sudo apt install -y ttyd
    elif command -v yum &> /dev/null; then
        echo "📦 Installing ttyd via yum..."
        sudo yum install -y ttyd
    elif command -v brew &> /dev/null; then
        echo "📦 Installing ttyd via brew..."
        brew install ttyd
    else
        echo "❌ No supported package manager found. Please install ttyd manually."
        exit 1
    fi
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Ludus API configuration"
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping services..."
    if [ ! -z "$TTYD_PID" ] && kill -0 "$TTYD_PID" 2>/dev/null; then
        kill "$TTYD_PID"
        echo "   ✅ Stopped ttyd"
    fi
    if [ ! -z "$LUDUS_PID" ] && kill -0 "$LUDUS_PID" 2>/dev/null; then
        kill "$LUDUS_PID"
        echo "   ✅ Stopped Ludus GUI"
    fi
    if [ ! -z "$SLIDES_PID" ] && kill -0 "$SLIDES_PID" 2>/dev/null; then
        kill "$SLIDES_PID"
        echo "   ✅ Stopped Slides server"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Kill any existing ttyd processes
echo "🧹 Cleaning up existing ttyd processes..."
pkill -f "ttyd.*7681" || true
sleep 1

# Start ttyd
echo "🚀 Starting ttyd on port 7681..."
ttyd -p 7681 -t fontSize=18 -t 'theme={"background": "#1e1e1e"}' -W /bin/bash > logs/ttyd.log 2>&1 &
TTYD_PID=$!
sleep 1
if kill -0 "$TTYD_PID" 2>/dev/null; then
    echo "   ✅ ttyd started successfully"
else
    echo "   ❌ Failed to start ttyd"
    exit 1
fi

# Install and start Ludus GUI
echo "🚀 Starting Ludus GUI on port 3000..."
cd ludus-gui
if [ ! -d "node_modules" ]; then
    echo "📦 Running Ludus GUI setup..."
    ./setup.sh
fi
echo "🔨 Building Ludus GUI for production..."
npm run build
echo "🚀 Starting Ludus GUI in production mode..."
npm start > ../logs/ludus-gui.log 2>&1 &
LUDUS_PID=$!
cd ..

# Start slides server
echo "🚀 Starting slides server on port 8000..."
cd shell-n-slides
python3 -m http.server 8000 > ../logs/slides.log 2>&1 &
SLIDES_PID=$!
cd ..

# Wait a moment for services to start
sleep 3

# Check if all services are running
echo ""
echo "🔍 Checking service status..."
if kill -0 "$TTYD_PID" 2>/dev/null; then
    echo "   ✅ ttyd running (PID: $TTYD_PID)"
else
    echo "   ❌ ttyd failed to start"
fi

if kill -0 "$LUDUS_PID" 2>/dev/null; then
    echo "   ✅ Ludus GUI running (PID: $LUDUS_PID)"
else
    echo "   ❌ Ludus GUI failed to start"
fi

if kill -0 "$SLIDES_PID" 2>/dev/null; then
    echo "   ✅ Slides server running (PID: $SLIDES_PID)"
else
    echo "   ❌ Slides server failed to start"
fi

echo ""
echo "🎉 Ludus Workshop Environment is ready!"
echo ""
echo "📍 Access URLs:"
echo "   • Ludus GUI:     http://localhost:3000"
echo "   • Slideshow:     http://localhost:8000"  
echo "   • Terminal:      http://localhost:7681"
echo ""
echo "🔄 Integration:"
echo "   The Ludus GUI iframe is configured to load at localhost:3000"
echo "   The terminal iframe connects to localhost:7681"
echo ""
echo "📋 Management:"
echo "   • View logs:     tail -f logs/[service].log"
echo "   • Stop all:      Press Ctrl+C"
echo ""
echo "🔧 Process IDs:"
echo "   • ttyd:          $TTYD_PID"
echo "   • Ludus GUI:     $LUDUS_PID"
echo "   • Slides:        $SLIDES_PID"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for interrupt
while true; do
    sleep 1
done