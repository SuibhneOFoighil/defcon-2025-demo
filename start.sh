#!/bin/bash

# Native Ludus Workshop Environment Startup Script
set -e

echo "🚀 Starting Ludus Workshop Environment (Native)..."

# Check if required tools are installed and install if missing
if ! command -v node &> /dev/null; then
    echo "📦 Node.js not found. Installing via direct download..."
    
    # Detect architecture
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) NODE_ARCH="x64" ;;
        aarch64|arm64) NODE_ARCH="arm64" ;;
        armv7l) NODE_ARCH="armv7l" ;;
        *) echo "❌ Unsupported architecture: $ARCH"; exit 1 ;;
    esac
    
    NODE_VERSION="v20.18.1"
    NODE_TARBALL="node-${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"
    NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_TARBALL}"
    
    echo "🔧 Downloading Node.js ${NODE_VERSION} for ${NODE_ARCH}..."
    cd /tmp
    curl -fsSLO "$NODE_URL"
    
    echo "📦 Installing Node.js to /opt/nodejs..."
    sudo mkdir -p /opt/nodejs
    sudo tar -xJf "$NODE_TARBALL" -C /opt/nodejs --strip-components=1
    
    echo "🔗 Creating symlinks..."
    sudo ln -sf /opt/nodejs/bin/node /usr/local/bin/node
    sudo ln -sf /opt/nodejs/bin/npm /usr/local/bin/npm
    sudo ln -sf /opt/nodejs/bin/npx /usr/local/bin/npx
    
    # Clean up
    rm -f "$NODE_TARBALL"
    cd - > /dev/null
    
    echo "✅ Node.js installed successfully"
fi

# Verify npm is available (should be included with Node.js)
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found after Node.js installation. Something went wrong."
    exit 1
fi

# Install Python3 manually if needed (usually pre-installed on Kali)
if ! command -v python3 &> /dev/null; then
    echo "📦 Python3 not found. Installing manually..."
    cd /tmp
    curl -fsSL https://www.python.org/ftp/python/3.11.8/Python-3.11.8.tgz -o python.tgz
    tar -xzf python.tgz
    cd Python-3.11.8
    ./configure --prefix=/usr/local
    make && sudo make install
    sudo ln -sf /usr/local/bin/python3 /usr/local/bin/python3
    cd - > /dev/null
    rm -rf python.tgz Python-3.11.8
    echo "✅ Python3 installed successfully"
else
    echo "✅ Python3 found"
fi

# Install ttyd if not present
echo "🖥️  Checking ttyd installation..."
if ! command -v ttyd &> /dev/null; then
    echo "📦 Installing ttyd manually (bypassing repository issues)..."
    
    # Detect architecture
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) TTYD_ARCH="x86_64" ;;
        aarch64|arm64) TTYD_ARCH="aarch64" ;;
        armv7l) TTYD_ARCH="armv7" ;;
        *) echo "❌ Unsupported architecture for ttyd: $ARCH"; exit 1 ;;
    esac
    
    echo "🔧 Downloading ttyd for ${TTYD_ARCH}..."
    cd /tmp
    curl -fsSL "https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.${TTYD_ARCH}" -o ttyd
    
    echo "📦 Installing ttyd to /usr/local/bin..."
    sudo mv ttyd /usr/local/bin/ttyd
    sudo chmod +x /usr/local/bin/ttyd
    
    cd - > /dev/null
    echo "✅ ttyd installed successfully"
else
    echo "✅ ttyd found"
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
ttyd -p 7681 -i 0.0.0.0 -t fontSize=18 -t 'theme={"background": "#1e1e1e"}' -W /bin/bash > logs/ttyd.log 2>&1 &
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
./setup.sh
fi
echo "🔨 Building Ludus GUI for production..."
npm run build
echo "🚀 Starting Ludus GUI in production mode..."
npx next start -H 0.0.0.0 > ../logs/ludus-gui.log 2>&1 &
LUDUS_PID=$!
cd ..

# Start slides server
echo "🚀 Starting slides server on port 8000..."
cd shell-n-slides
python3 -m http.server 8000 --bind 0.0.0.0 > ../logs/slides.log 2>&1 &
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
# Get network IP - prioritize WireGuard interface
NETWORK_IP=$(ip addr show wg0 2>/dev/null | grep -oP 'inet \K[^/]+' | head -1)
if [ -z "$NETWORK_IP" ]; then
    NETWORK_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K[^ ]+' | head -1)
fi
if [ -z "$NETWORK_IP" ]; then
    NETWORK_IP=$(hostname -I | awk '{print $1}')
fi

echo "📍 Access URLs:"
echo "   • Ludus GUI:     http://localhost:3000 or http://${NETWORK_IP}:3000"
echo "   • Slideshow:     http://localhost:8000 or http://${NETWORK_IP}:8000"  
echo "   • Terminal:      http://localhost:7681 or http://${NETWORK_IP}:7681"
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