#!/bin/bash

# Learning Management System Setup Script

set -e

echo "🚀 Setting up Learning Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker found"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker not found - local PostgreSQL required"
    DOCKER_AVAILABLE=false
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/lms_db

# Application Settings
NODE_ENV=development
PORT=5000

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
EOF
    echo "⚠️  Created .env file - please update DATABASE_URL for your setup"
fi

# Database setup
echo "🗄️  Setting up database..."

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "Would you like to use Docker for PostgreSQL? (y/n)"
    read -r use_docker
    
    if [ "$use_docker" = "y" ] || [ "$use_docker" = "Y" ]; then
        echo "🐳 Starting PostgreSQL with Docker..."
        docker run -d \
            --name lms-postgres \
            -e POSTGRES_DB=lms_db \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=password \
            -p 5432:5432 \
            postgres:15-alpine
            
        echo "⏳ Waiting for database to start..."
        sleep 5
    fi
fi

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:push

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start the development server: npm run dev"
echo "   2. Open http://localhost:5000 in your browser"
echo "   3. Login with admin/admin123"
echo ""
echo "🐳 For Docker deployment:"
echo "   docker-compose up -d"
echo ""
echo "📚 Check README.md for more information"