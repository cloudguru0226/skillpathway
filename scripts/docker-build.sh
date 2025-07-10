#!/bin/bash

# Docker build script for LMS

set -e

echo "Building Learning Management System Docker image..."

# Build the Docker image
docker build -t lms-app:latest .

echo "Docker image built successfully!"
echo ""
echo "To run the application:"
echo "  docker-compose up -d"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f app"
echo ""
echo "To stop the application:"
echo "  docker-compose down"