# Production-ready Dockerfile for LMS deployment
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies including PostgreSQL client
RUN apk add --no-cache \
    postgresql-client \
    curl \
    dumb-init \
    && addgroup -g 1001 -S lms \
    && adduser -S lms -u 1001 -G lms

# Copy package files
COPY package*.json ./

# Install ALL dependencies first (needed for build)
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build the application (as root to avoid permission issues)
RUN NODE_ENV=production npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Clean npm cache
RUN npm cache clean --force

# Set proper ownership
RUN chown -R lms:lms /app

# Switch to non-root user
USER lms

# Expose port
EXPOSE 5000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Use dumb-init as PID 1 to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "run", "start"]