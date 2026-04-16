#!/bin/bash
set -e

echo "🦞 ClawChat Production Deploy"
echo "=============================="
echo ""

# Ensure .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env not found, copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env and set a secure JWT_SECRET before deploying publicly!"
    echo ""
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is required but not installed."
    exit 1
fi

COMPOSE_CMD="docker compose"
if ! $COMPOSE_CMD version &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

echo "🚀 Building and starting production services..."
$COMPOSE_CMD -f docker-compose.prod.yml up --build -d

echo ""
echo "✅ ClawChat is deploying..."
echo ""
echo "   🌐 Web UI:    http://localhost"
echo "   🔌 API:       http://localhost/api"
echo "   📊 Health:    http://localhost/health"
echo ""
echo "   View logs:    $COMPOSE_CMD -f docker-compose.prod.yml logs -f"
echo "   Stop:         $COMPOSE_CMD -f docker-compose.prod.yml down"
echo ""
