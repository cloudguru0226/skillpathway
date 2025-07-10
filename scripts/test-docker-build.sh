#!/bin/bash

# Test Docker build script

set -e

echo "Testing Docker build process..."

# Clean any existing images
echo "Cleaning existing images..."
docker rmi lms-app:latest 2>/dev/null || true

# Build the image
echo "Building Docker image..."
docker build -t lms-app:latest .

# Test the build was successful
if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    echo ""
    echo "Image details:"
    docker images lms-app:latest
    echo ""
    echo "To run the complete stack:"
    echo "  docker-compose up -d"
else
    echo "❌ Docker build failed!"
    exit 1
fi