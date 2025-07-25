# Simple single-stage Dockerfile for LMS
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache curl postgresql-client

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including dev) for build
RUN npm install

# Copy source code
COPY . .

# Build the application (dev dependencies are available)
RUN npm run build

# Remove dev dependencies after build to save space
RUN npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy entrypoint script and make it executable
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["./docker-entrypoint.sh"]