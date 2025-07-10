# Multi-stage build for LMS
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including dev dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install system dependencies
RUN apk add --no-cache curl postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary files for runtime
COPY shared ./shared
COPY server/vite.ts ./server/vite.ts
COPY drizzle.config.ts ./drizzle.config.ts

# Copy entrypoint script and make it executable
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

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