#!/bin/bash

# Docker-based Ludus Workshop Environment Startup Script
set -e

echo "🚀 Starting Ludus Workshop Environment (Docker)..."

# Check if Docker is installed and install if missing
if ! command -v docker &> /dev/null; then
    echo "📦 Docker not found. Installing Docker manually..."
    
    # Download Docker binaries directly
    DOCKER_VERSION="25.0.3"
    ARCH=$(uname -m)
    case $ARCH in
        x86_64) DOCKER_ARCH="x86_64" ;;
        aarch64|arm64) DOCKER_ARCH="aarch64" ;;
        *) echo "❌ Unsupported architecture: $ARCH"; exit 1 ;;
    esac
    
    echo "🔧 Downloading Docker ${DOCKER_VERSION} for ${DOCKER_ARCH}..."
    cd /tmp
    curl -fsSLO "https://download.docker.com/linux/static/stable/${DOCKER_ARCH}/docker-${DOCKER_VERSION}.tgz"
    
    echo "📦 Installing Docker binaries..."
    tar -xzf "docker-${DOCKER_VERSION}.tgz"
    sudo cp docker/* /usr/local/bin/
    sudo chmod +x /usr/local/bin/docker*
    
    echo "🔧 Setting up Docker daemon..."
    # Create docker group and add user
    sudo groupadd docker 2>/dev/null || true
    sudo usermod -aG docker $USER
    
    # Create systemd service for Docker daemon
    sudo tee /etc/systemd/system/docker.service > /dev/null << 'EOF'
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target firewalld.service containerd.service
Wants=network-online.target
Requires=docker.socket containerd.service

[Service]
Type=notify
ExecStart=/usr/local/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutSec=0
RestartSec=2
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    # Create socket file
    sudo tee /etc/systemd/system/docker.socket > /dev/null << 'EOF'
[Unit]
Description=Docker Socket for the API

[Socket]
ListenStream=/var/run/docker.sock
SocketMode=0660
SocketUser=root
SocketGroup=docker

[Install]
WantedBy=sockets.target
EOF

    # Install containerd (required)
    echo "📦 Installing containerd..."
    CONTAINERD_VERSION="1.7.13"
    curl -fsSLO "https://github.com/containerd/containerd/releases/download/v${CONTAINERD_VERSION}/containerd-${CONTAINERD_VERSION}-linux-${DOCKER_ARCH/x86_64/amd64}.tar.gz"
    sudo tar -C /usr/local -xzf "containerd-${CONTAINERD_VERSION}-linux-${DOCKER_ARCH/x86_64/amd64}.tar.gz"
    
    # Create containerd service
    sudo curl -fsSL "https://raw.githubusercontent.com/containerd/containerd/main/containerd.service" -o /etc/systemd/system/containerd.service
    
    echo "🔄 Starting Docker services..."
    sudo systemctl daemon-reload
    sudo systemctl enable containerd docker.socket docker.service
    sudo systemctl start containerd docker.socket docker.service
    
    # Clean up
    rm -f docker-*.tgz containerd-*.tar.gz
    rm -rf docker/
    cd - > /dev/null
    
    echo "✅ Docker installed successfully!"
    echo "⚠️  You may need to log out and back in for Docker group permissions to take effect."
    echo "    If you get permission errors, run: newgrp docker"
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "📦 Docker Compose not found. Installing..."
    
    # Try to install docker-compose plugin (preferred method)
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y docker-compose-plugin
    elif command -v yum &> /dev/null; then
        sudo yum install -y docker-compose-plugin
    else
        # Fallback to standalone docker-compose
        echo "📦 Installing standalone docker-compose..."
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d '"' -f 4)
        sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    echo "✅ Docker Compose installed successfully!"
fi

# Test Docker is working
echo "🔍 Testing Docker installation..."
if ! docker --version &> /dev/null; then
    echo "❌ Docker installation failed or permissions issue."
    echo "    Try: sudo docker --version"
    echo "    Or: newgrp docker"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Ludus API configuration"
fi

# Install ttyd on host system for Kali CLI access
echo "🖥️  Checking ttyd installation on host..."
if ! command -v ttyd &> /dev/null; then
    echo "📦 Installing ttyd..."
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y ttyd
    elif command -v yum &> /dev/null; then
        sudo yum install -y ttyd
    elif command -v brew &> /dev/null; then
        brew install ttyd
    else
        echo "❌ No supported package manager found. Please install ttyd manually."
        exit 1
    fi
    echo "✅ ttyd installed successfully!"
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Start ttyd on host system
echo "🚀 Starting ttyd on host system..."
# Kill any existing ttyd processes more thoroughly
echo "🧹 Cleaning up existing ttyd processes..."
pkill -f "ttyd.*7681" || true
# Also check for processes using port 7681
lsof -ti:7681 | xargs kill -9 2>/dev/null || true
sleep 2

# Start ttyd in background
nohup ttyd -p 7681 -t fontSize=18 -t 'theme={"background": "#1e1e1e"}' -W /bin/bash > logs/ttyd.log 2>&1 &
TTYD_PID=$!
sleep 2

if kill -0 "$TTYD_PID" 2>/dev/null; then
    echo "✅ ttyd started successfully on host (PID: $TTYD_PID)"
else
    echo "❌ Failed to start ttyd. Check logs/ttyd.log"
    exit 1
fi

# Stop any existing containers
echo "🧹 Stopping existing containers..."
docker-compose -f docker-compose-simple.yml down 2>/dev/null || true

# Build and start services
echo "🔨 Building Docker images..."
docker-compose -f docker-compose-simple.yml build

echo "🏁 Starting services..."
docker-compose -f docker-compose-simple.yml up -d

# Wait a moment for services to start
sleep 5

# Check service status
echo ""
echo "🔍 Checking service status..."
docker-compose -f docker-compose-simple.yml ps

echo ""
echo "🎉 Ludus Workshop Environment is ready!"
echo ""
echo "📍 Access URLs:"
echo "   • Ludus GUI:     http://localhost:3000"
echo "   • Slideshow:     http://localhost:8000"  
echo "   • Terminal:      http://localhost:7681"
echo ""
echo "🔄 Integration:"
echo "   Ludus GUI and slides run in Docker containers"
echo "   Terminal runs on HOST system for Kali CLI access"
echo ""
echo "📋 Management Commands:"
echo "   • View logs:     docker-compose -f docker-compose-simple.yml logs -f [service-name]"
echo "   • Stop:          docker-compose -f docker-compose-simple.yml down"
echo "   • Restart:       docker-compose -f docker-compose-simple.yml restart [service-name]"  
echo "   • Rebuild:       docker-compose -f docker-compose-simple.yml build --no-cache"
echo ""
echo "🔧 Troubleshooting:"
echo "   • Check status:  docker-compose -f docker-compose-simple.yml ps"
echo "   • View logs:     docker-compose -f docker-compose-simple.yml logs [service-name]"
echo "   • Enter container: docker-compose -f docker-compose-simple.yml exec [service-name] sh"
echo "   • Kill ttyd:     pkill -f 'ttyd.*7681'"
echo ""
echo "🛑 To stop everything:"
echo "   docker-compose -f docker-compose-simple.yml down && pkill -f 'ttyd.*7681'"
echo ""