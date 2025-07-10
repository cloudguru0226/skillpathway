#!/bin/sh

# Docker entrypoint script for LMS application

set -e

echo "🚀 Starting Learning Management System..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
while ! pg_isready -h $PGHOST -p $PGPORT -U $PGUSER; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "✅ Database is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:push

# Start the application
echo "🎯 Starting application..."
exec npm start