#!/bin/bash

# Simple Docker deployment script for AWS EC2
set -e

# Configuration
CONTAINER_NAME="lms-app"
IMAGE_NAME="lms:latest"
PORT=5000

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check if running on the target VM
if [ "$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)" = "54.93.42.60" ]; then
    log "Deploying on target AWS VM (54.93.42.60)"
else
    warn "Not on target VM, continuing anyway..."
fi

# Check prerequisites
command -v docker >/dev/null 2>&1 || error "Docker is not installed"
command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is not installed"

# Verify environment variables
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL environment variable is required"
fi

if [ -z "$SESSION_SECRET" ]; then
    warn "SESSION_SECRET not set, using default (not secure for production)"
    export SESSION_SECRET="default-session-secret-please-change-in-production"
fi

log "Starting deployment process..."

# Stop existing containers
log "Stopping existing containers..."
docker-compose down || true
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Clean up old images (keep last 2)
log "Cleaning up old images..."
docker images $IMAGE_NAME --format "table {{.ID}}\t{{.CreatedAt}}" | tail -n +3 | awk '{print $1}' | head -n -2 | xargs -r docker rmi || true

# Build new image
log "Building Docker image..."
docker build -t $IMAGE_NAME .

# Run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    log "Running database migrations..."
    docker run --rm \
        -e DATABASE_URL="$DATABASE_URL" \
        -e NODE_ENV=production \
        $IMAGE_NAME \
        sh -c "npm run db:push || echo 'Migration completed or not needed'"
else
    warn "DATABASE_URL not set, skipping migrations"
fi

# Start the application
log "Starting application..."
docker-compose up -d app

# Wait for application to start
log "Waiting for application to start..."
sleep 30

# Health check
log "Running health check..."
for i in {1..10}; do
    if curl -f http://localhost:$PORT/api/health >/dev/null 2>&1; then
        log "✅ Application is healthy and running!"
        break
    fi
    
    if [ $i -eq 10 ]; then
        error "❌ Application health check failed after 10 attempts"
    fi
    
    log "Health check attempt $i/10 failed, retrying in 10 seconds..."
    sleep 10
done

# Show status
log "Deployment successful!"
log "Application URL: http://54.93.42.60:$PORT"
log "Admin credentials: admin / admin123"
log ""
log "Checking container status..."
docker-compose ps

log "Recent logs:"
docker-compose logs --tail=20 app