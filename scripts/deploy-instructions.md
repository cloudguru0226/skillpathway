# Docker Deployment Fix Instructions

The Docker build is failing because it's using cached layers from the old Dockerfile. Here's how to fix it:

## Option 1: Force Clean Build (Recommended)

```bash
# Run the clean build script
./scripts/clean-docker-build.sh
```

## Option 2: Manual Clean Build

```bash
# Stop any running containers
docker-compose down

# Remove old images
docker rmi lms-app:latest skillpathway-app:latest

# Clear build cache
docker builder prune -f

# Build with no cache
docker build --no-cache -t lms-app:latest .

# Start the stack
docker-compose up -d
```

## Option 3: Docker Compose with Fresh Build

```bash
# Build and start with fresh containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## What Changed

The new Dockerfile uses a proper multi-stage build:

1. **Builder stage**: Installs ALL dependencies (including dev) and builds the app
2. **Production stage**: Only copies built files and production dependencies

The old cached layers were installing production-only dependencies first, which is why the build failed.

## Verification

After successful build, verify with:

```bash
# Check containers are running
docker-compose ps

# Test the application
curl http://localhost:5000/api/health

# View logs
docker-compose logs -f app
```

The application should be available at http://localhost:5000 with admin login: admin/admin123