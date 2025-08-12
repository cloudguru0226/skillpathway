#!/bin/bash

# Test deployment script to validate the LMS before production
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[TEST]${NC} $1"; }
success() { echo -e "${GREEN}✅${NC} $1"; }
warn() { echo -e "${YELLOW}⚠️${NC} $1"; }
error() { echo -e "${RED}❌${NC} $1"; }

FAILED_TESTS=0

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    LMS Deployment Test Suite                   ║"
echo "║           Testing AWS VM deployment configuration              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Test 1: Docker build
log "Testing Docker build process..."
if docker build -t lms:test-build . >/dev/null 2>&1; then
    success "Docker build successful"
    docker rmi lms:test-build >/dev/null 2>&1 || true
else
    error "Docker build failed"
    ((FAILED_TESTS++))
fi

# Test 2: Environment variables
log "Checking environment variable configuration..."
if [ -f ".env.example" ]; then
    success "Environment template exists"
    
    # Check for required variables
    required_vars=("DATABASE_URL" "SESSION_SECRET" "NODE_ENV")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.example; then
            success "Required variable template: $var"
        else
            error "Missing required variable template: $var"
            ((FAILED_TESTS++))
        fi
    done
else
    error "Missing .env.example file"
    ((FAILED_TESTS++))
fi

# Test 3: Package.json scripts
log "Validating npm scripts..."
if npm run --silent 2>&1 | grep -q "build"; then
    success "Build script available"
else
    error "Build script missing"
    ((FAILED_TESTS++))
fi

if npm run --silent 2>&1 | grep -q "start"; then
    success "Start script available"
else
    error "Start script missing"
    ((FAILED_TESTS++))
fi

# Test 4: Health endpoint configuration
log "Checking health endpoint..."
if grep -r "/api/health" server/ >/dev/null 2>&1; then
    success "Health endpoint configured"
else
    error "Health endpoint missing"
    ((FAILED_TESTS++))
fi

# Test 5: Security configuration
log "Validating security setup..."
if grep -r "helmet" server/ >/dev/null 2>&1; then
    success "Security headers configured"
else
    warn "Security headers not found"
fi

if grep -r "trust proxy" server/ >/dev/null 2>&1; then
    success "Proxy trust configured for AWS LB"
else
    warn "Proxy trust not configured"
fi

# Test 6: Database configuration
log "Checking database setup..."
if [ -f "server/db.ts" ]; then
    success "Database configuration exists"
    
    if grep -q "DATABASE_URL" server/db.ts; then
        success "Environment-based database URL"
    else
        warn "Database URL configuration unclear"
    fi
else
    error "Database configuration missing"
    ((FAILED_TESTS++))
fi

# Test 7: Deployment script
log "Validating deployment script..."
if [ -f "scripts/deploy-simple.sh" ] && [ -x "scripts/deploy-simple.sh" ]; then
    success "Deployment script ready"
else
    error "Deployment script missing or not executable"
    ((FAILED_TESTS++))
fi

# Test 8: Docker compose configuration
log "Checking Docker Compose setup..."
if [ -f "docker-compose.yml" ]; then
    success "Docker Compose configuration exists"
    
    if grep -q "restart: unless-stopped" docker-compose.yml; then
        success "Auto-restart configured"
    else
        warn "Auto-restart not configured"
    fi
    
    if grep -q "healthcheck:" docker-compose.yml; then
        success "Health checks configured"
    else
        warn "Health checks not configured"
    fi
else
    error "Docker Compose configuration missing"
    ((FAILED_TESTS++))
fi

# Test 9: Port configuration
log "Checking port configuration..."
if grep -r "5000" server/ docker-compose.yml Dockerfile >/dev/null 2>&1; then
    success "Port 5000 configured"
else
    error "Port configuration unclear"
    ((FAILED_TESTS++))
fi

# Test 10: Production readiness
log "Checking production configuration..."
if grep -r "NODE_ENV.*production" server/ >/dev/null 2>&1; then
    success "Production environment handling"
else
    warn "Production environment handling unclear"
fi

if grep -r "0.0.0.0" server/ >/dev/null 2>&1; then
    success "Bind to all interfaces configured"
else
    error "Interface binding not configured for containers"
    ((FAILED_TESTS++))
fi

# Test 11: Error handling
log "Checking error handling..."
if grep -r "process.on.*SIGTERM" server/ >/dev/null 2>&1; then
    success "Graceful shutdown configured"
else
    warn "Graceful shutdown not configured"
fi

if grep -r "uncaughtException" server/ >/dev/null 2>&1; then
    success "Exception handling configured"
else
    warn "Exception handling not configured"
fi

# Test 12: File permissions
log "Checking file structure..."
essential_files=("Dockerfile" "docker-compose.yml" "package.json" "server/index.ts")
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        success "Essential file exists: $file"
    else
        error "Essential file missing: $file"
        ((FAILED_TESTS++))
    fi
done

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                        TEST SUMMARY                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    success "🎉 All tests passed! Your LMS is ready for AWS deployment."
    echo ""
    log "Deployment instructions:"
    log "1. SSH to your AWS VM: ssh -i key.pem ubuntu@54.93.42.60"
    log "2. Clone this repository on the VM"
    log "3. Set environment variables (DATABASE_URL, SESSION_SECRET)"
    log "4. Run: ./scripts/deploy-simple.sh"
    log "5. Access at: http://54.93.42.60:5000"
    echo ""
    log "📖 See DEPLOY-AWS.md for complete instructions"
    exit 0
else
    echo ""
    error "🚨 $FAILED_TESTS test(s) failed. Please fix the issues above."
    echo ""
    log "Common fixes:"
    log "- Ensure all required files are present"
    log "- Check package.json scripts"
    log "- Verify Docker configuration"
    log "- Review security settings"
    exit 1
fi