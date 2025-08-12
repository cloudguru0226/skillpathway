#!/bin/bash

# Health Check Script for Production LMS
# This script validates that all components are running correctly

set -e

echo "🏥 Starting LMS Health Check..."

# Configuration
HOST="${HOST:-localhost}"
PORT="${PORT:-5000}"
BASE_URL="http://$HOST:$PORT"
TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check HTTP endpoint
check_endpoint() {
    local endpoint=$1
    local expected_status=${2:-200}
    local description=$3

    echo -n "  Checking $description... "
    
    response=$(curl -s -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL$endpoint" || echo "000")
    status_code=${response: -3}
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} ($status_code)"
        return 0
    else
        echo -e "${RED}✗${NC} ($status_code)"
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    echo -n "  Checking database connectivity... "
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}SKIP${NC} (DATABASE_URL not set)"
        return 0
    fi
    
    # Extract connection details from DATABASE_URL
    # This is a simplified check - in production you might use a more robust tool
    timeout $TIMEOUT curl -s "$BASE_URL/api/health" | grep -q "database.*ok"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        return 1
    fi
}

# Main health checks
echo "🔍 Running health checks against $BASE_URL"
echo ""

FAILED_CHECKS=0

# Check main application
echo "📱 Application Checks:"
check_endpoint "/api/health" 200 "Health endpoint" || ((FAILED_CHECKS++))
check_endpoint "/" 200 "Frontend application" || ((FAILED_CHECKS++))

echo ""

# Check API endpoints
echo "🔌 API Checks:"
check_endpoint "/api/roadmaps" 401 "Roadmaps API (should require auth)" || ((FAILED_CHECKS++))
check_endpoint "/api/courses" 401 "Courses API (should require auth)" || ((FAILED_CHECKS++))

echo ""

# Check authentication
echo "🔐 Authentication Checks:"
check_endpoint "/api/auth/login" 200 "Login page" || ((FAILED_CHECKS++))

echo ""

# Check database
echo "🗄️  Database Checks:"
check_database || ((FAILED_CHECKS++))

echo ""

# Check static assets (if served by the app)
echo "📁 Static Assets:"
check_endpoint "/favicon.ico" 200 "Favicon" || echo "  Note: Favicon check failed (not critical)"

echo ""

# Summary
echo "📊 Health Check Summary:"
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo "🚀 LMS is healthy and ready for production traffic"
    exit 0
else
    echo -e "${RED}❌ $FAILED_CHECKS check(s) failed${NC}"
    echo "🚨 LMS may not be ready for production traffic"
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Verify the application is running: docker-compose ps"
    echo "2. Check application logs: docker-compose logs app"
    echo "3. Verify environment variables are set correctly"
    echo "4. Ensure database is accessible and migrations have run"
    exit 1
fi