#!/bin/bash

# Ludus GUI Development Setup Script
# This script helps new developers quickly set up the development environment

set -e

echo "🚀 Setting up Ludus GUI development environment..."

# Check if yarn is installed, fallback to npm
if command -v yarn &> /dev/null; then
    echo "✅ yarn found"
    PACKAGE_MANAGER="yarn"
    INSTALL_CMD="yarn install"
elif command -v npm &> /dev/null; then
    echo "✅ npm found"
    PACKAGE_MANAGER="npm"
    INSTALL_CMD="npm install --legacy-peer-deps --ignore-scripts"
else
    echo "❌ Neither yarn nor npm is installed. Please install Node.js and a package manager first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies with $PACKAGE_MANAGER..."
$INSTALL_CMD

echo "✅ Dependencies installed"

# Check for environment variables
if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local file found. Creating template..."
    cat > .env.local << 'EOF'
# Ludus API Configuration
LUDUS_API_BASE_URL=https://your-address:your-port
LUDUS_API_BASE_URL_ADMIN=https://127.0.0.1:8081
LUDUS_API_KEY=your-api-key

# SSH Tunnel Configuration
LUDUS_SSH_HOST=your-ssh-host
LUDUS_SSH_USER=root

# Logging Configuration
LOG_LEVEL=debug

# Authentication (optional - set to true to disable auth for testing)
# NEXT_PUBLIC_DISABLE_AUTH=true
EOF
    echo "📝 Created .env.local template."
else
    echo "✅ Environment file exists"
fi

# Type check
echo "🔍 Running type check..."
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    TYPE_CHECK_CMD="yarn typecheck:app"
else
    TYPE_CHECK_CMD="npm run typecheck:app"
fi

if $TYPE_CHECK_CMD; then
    echo "✅ Type check passed"
else
    echo "⚠️  Type check failed. You may need to fix type errors before running."
fi

echo ""
echo "🎉 Setup complete! Here are your next steps:"
echo "1. Update .env.local with your Ludus server configuration:"
echo "   - LUDUS_API_BASE_URL (your Ludus server URL with port)"
echo "   - LUDUS_API_KEY (your Ludus API key)"
echo "   - LUDUS_SSH_HOST (your Ludus server hostname for SSH tunnel)"
echo "   - LUDUS_SSH_USER (SSH username for tunnel access)"
echo ""
echo "2. Start development:"
if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    echo "   For basic features: yarn dev"
    echo "   For admin features: yarn dev:with-tunnel"
else
    echo "   For basic features: npm run dev"
    echo "   For admin features: npm run dev:with-tunnel"
fi