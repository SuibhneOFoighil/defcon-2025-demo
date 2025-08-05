#!/bin/bash

# Ludus GUI Development Setup Script
# This script helps new developers quickly set up the development environment

set -e

echo "🚀 Setting up Ludus GUI development environment..."

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install it first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun found"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

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
if bun run typecheck:app; then
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
echo "   For basic features: bun run dev"
echo "   For admin features: bun run dev:with-tunnel"