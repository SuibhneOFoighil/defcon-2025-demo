#!/bin/bash

# Ludus Docker Compose Startup Script
set -e

echo "🚀 Starting Ludus Workshop Environment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Ludus API configuration"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs

# Install and start ttyd on host system
echo "🖥️  Installing ttyd on host system..."
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

# Start ttyd in background if not already running
if ! pgrep -f "ttyd.*7681" > /dev/null; then
    echo "🚀 Starting ttyd on host..."
    nohup ttyd -p 7681 -t fontSize=18 -t 'theme={"background": "#1e1e1e"}' -W /bin/bash > logs/ttyd.log 2>&1 &
    sleep 2
    if pgrep -f "ttyd.*7681" > /dev/null; then
        echo "✅ ttyd started successfully on port 7681"
    else
        echo "❌ Failed to start ttyd. Check logs/ttyd.log"
    fi
else
    echo "✅ ttyd is already running on port 7681"
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🏁 Starting services..."
docker-compose up -d

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
echo "📋 Management Commands:"
echo "   • View logs:     docker-compose logs -f [service-name]"
echo "   • Stop:          docker-compose down"
echo "   • Restart:       docker-compose restart [service-name]"  
echo "   • Rebuild:       docker-compose build --no-cache"
echo ""
echo "🔧 Troubleshooting:"
echo "   • Check status:  docker-compose ps"
echo "   • View logs:     docker-compose logs [service-name]"
echo "   • Enter container: docker-compose exec [service-name] sh"
echo ""