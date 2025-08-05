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
    echo "📦 Docker Compose not found. Installing manually..."
    
    # Install standalone docker-compose directly
    echo "📦 Downloading docker-compose..."
    DOCKER_COMPOSE_VERSION="v2.24.5"
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    echo "✅ Docker Compose installed successfully!"
fi

# Install iptables if missing (required for Docker networking)
echo "🔧 Checking iptables installation..."
if ! command -v iptables &> /dev/null; then
    echo "📦 Installing iptables manually (repository issues)..."
    # Download iptables directly
    cd /tmp
    curl -fsSLO "http://archive.ubuntu.com/ubuntu/pool/main/i/iptables/iptables_1.8.7-1ubuntu5_amd64.deb"
    sudo dpkg -i iptables_*.deb 2>/dev/null || true
    # Alternative: create symlink if iptables exists elsewhere
    if [ -f /usr/sbin/iptables ]; then
        sudo ln -sf /usr/sbin/iptables /usr/local/bin/iptables
    elif [ -f /sbin/iptables ]; then
        sudo ln -sf /sbin/iptables /usr/local/bin/iptables
    fi
    rm -f iptables_*.deb
    cd - > /dev/null
    echo "✅ iptables installed successfully!"
fi

# Test Docker is working and fix permissions
echo "🔍 Testing Docker installation..."
if ! docker --version &> /dev/null; then
    echo "❌ Docker installation failed or permissions issue."
    echo "    Try: sudo docker --version"
    echo "    Or: newgrp docker"
    exit 1
fi

# Ensure Docker daemon is running
echo "🔄 Starting Docker daemon..."
sudo systemctl start docker.service 2>/dev/null || true
sleep 2

# Test Docker permissions with timeout
echo "🔐 Checking Docker permissions..."
DOCKER_TEST_TIMEOUT=10
if timeout $DOCKER_TEST_TIMEOUT docker ps &> /dev/null; then
    echo "✅ Docker permissions OK!"
    export DOCKER_SUDO=""
else
    echo "🔧 Docker permissions issue detected. Using sudo for Docker commands..."
    # Don't try to fix permissions as it's complex - just use sudo
    export DOCKER_SUDO="sudo"
    
    # Quick test that sudo works
    if ! sudo docker ps &> /dev/null; then
        echo "❌ Docker daemon may not be running properly. Trying to start..."
        sudo systemctl restart docker.service
        sleep 5
        if ! sudo docker ps &> /dev/null; then
            echo "❌ Docker is not working. Please check: sudo systemctl status docker.service"
            exit 1
        fi
    fi
    echo "✅ Docker working with sudo!"
fi

# Pre-pull Docker images to avoid build-time authentication issues
echo "📦 Pre-pulling Docker base images..."
echo "   This ensures images are available for building..."
if ! ${DOCKER_SUDO} docker pull node:20-alpine &> /dev/null; then
    echo "⚠️  Failed to pull node:20-alpine image. You may need to:"
    echo "    1. Create a free Docker Hub account at https://hub.docker.com"
    echo "    2. Run: docker login"
    echo "    3. Try the script again"
    echo ""
    read -p "Would you like to continue anyway? (y/N): " continue_without_images
    if [[ ! "$continue_without_images" =~ ^[Yy]$ ]]; then
        echo "Exiting. Please set up Docker authentication and try again."
        exit 1
    fi
else
    echo "✅ node:20-alpine pulled successfully"
fi

if ! ${DOCKER_SUDO} docker pull python:3.11-alpine &> /dev/null; then
    echo "⚠️  Failed to pull python:3.11-alpine image"
else
    echo "✅ python:3.11-alpine pulled successfully"
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
    echo "📦 Installing ttyd manually (repository issues)..."
    # Download ttyd binary directly
    cd /tmp
    curl -fsSL https://github.com/tsl0922/ttyd/releases/download/1.7.7/ttyd.x86_64 -o ttyd
    sudo mv ttyd /usr/local/bin/ttyd
    sudo chmod +x /usr/local/bin/ttyd
    cd - > /dev/null
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
${DOCKER_SUDO} docker-compose -f docker-compose-simple.yml down 2>/dev/null || true

# Build and start services
echo "🔨 Building Docker images..."
${DOCKER_SUDO} docker-compose -f docker-compose-simple.yml build

echo "🏁 Starting services..."
${DOCKER_SUDO} docker-compose -f docker-compose-simple.yml up -d

# Wait a moment for services to start
sleep 5

# Check service status
echo ""
echo "🔍 Checking service status..."
${DOCKER_SUDO} docker-compose -f docker-compose-simple.yml ps

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
if [ "$DOCKER_SUDO" = "sudo" ]; then
    echo "   • View logs:     sudo docker-compose -f docker-compose-simple.yml logs -f [service-name]"
    echo "   • Stop:          sudo docker-compose -f docker-compose-simple.yml down"
    echo "   • Restart:       sudo docker-compose -f docker-compose-simple.yml restart [service-name]"  
    echo "   • Rebuild:       sudo docker-compose -f docker-compose-simple.yml build --no-cache"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   • Check status:  sudo docker-compose -f docker-compose-simple.yml ps"
    echo "   • View logs:     sudo docker-compose -f docker-compose-simple.yml logs [service-name]"
    echo "   • Enter container: sudo docker-compose -f docker-compose-simple.yml exec [service-name] sh"
    echo "   • Kill ttyd:     pkill -f 'ttyd.*7681'"
    echo ""
    echo "🛑 To stop everything:"
    echo "   sudo docker-compose -f docker-compose-simple.yml down && pkill -f 'ttyd.*7681'"
else
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
fi
echo ""