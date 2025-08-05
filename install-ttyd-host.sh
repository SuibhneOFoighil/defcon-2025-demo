#!/bin/bash

# Install and configure ttyd on host system (Kali/Ubuntu)
echo "🖥️  Installing ttyd on host system..."

# Detect OS
if command -v apt &> /dev/null; then
    # Debian/Ubuntu/Kali
    echo "📦 Installing ttyd via apt..."
    sudo apt update
    sudo apt install -y ttyd
elif command -v yum &> /dev/null; then
    # RHEL/CentOS
    echo "📦 Installing ttyd via yum..."
    sudo yum install -y ttyd
elif command -v pacman &> /dev/null; then
    # Arch Linux
    echo "📦 Installing ttyd via pacman..."
    sudo pacman -S ttyd
else
    echo "❌ Unsupported package manager. Installing from source..."
    
    # Install build dependencies
    sudo apt update
    sudo apt install -y build-essential cmake git libjson-c-dev libwebsockets-dev libssl-dev
    
    # Build ttyd from source
    git clone https://github.com/tsl0922/ttyd.git /tmp/ttyd
    cd /tmp/ttyd
    mkdir build && cd build
    cmake ..
    make
    sudo make install
    sudo ldconfig
    rm -rf /tmp/ttyd
fi

echo "✅ ttyd installed successfully!"

# Create ttyd service
echo "🔧 Creating ttyd systemd service..."
sudo tee /etc/systemd/system/ttyd.service > /dev/null <<EOF
[Unit]
Description=ttyd - Terminal sharing daemon
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/ttyd -p 7681 -t fontSize=18 -t 'theme={"background": "#1e1e1e"}' -W /bin/bash
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
echo "🚀 Starting ttyd service..."
sudo systemctl daemon-reload
sudo systemctl enable ttyd
sudo systemctl start ttyd

# Check status
echo "📊 Service status:"
sudo systemctl status ttyd --no-pager -l

echo ""
echo "🎉 ttyd is now running on the host system!"
echo "📍 Access at: http://localhost:7681"
echo "🔧 Manage with: sudo systemctl {start|stop|restart|status} ttyd"
echo ""