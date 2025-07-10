#!/bin/bash

# Clean Docker build script - forces complete rebuild

set -e

echo "Cleaning Docker cache and rebuilding..."

# Stop and remove any running containers
docker-compose down 2>/dev/null || true

# Remove existing images
docker rmi lms-app:latest 2>/dev/null || true
docker rmi skillpathway-app:latest 2>/dev/null || true

# Prune build cache to force fresh build
docker builder prune -f

# Build with no cache
echo "Building fresh Docker image..."
docker build --no-cache -t lms-app:latest .

if [ $? -eq 0 ]; then
    echo "✅ Fresh Docker build successful!"
    echo ""
    echo "To run the complete stack:"
    echo "  docker-compose up -d"
else
    echo "❌ Docker build failed!"
    exit 1
fi