#!/bin/bash

# Production Deployment Validation Script
# This script validates that the LMS is ready for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

VALIDATION_FAILED=0

log() { echo -e "${BLUE}[VALIDATE]${NC} $1"; }
success() { echo -e "${GREEN}✅${NC} $1"; }
warning() { echo -e "${YELLOW}⚠️${NC} $1"; }
error() { echo -e "${RED}❌${NC} $1"; ((VALIDATION_FAILED++)); }
info() { echo -e "${CYAN}ℹ️${NC} $1"; }

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                LMS Production Validation                     ║"
echo "║          Checking readiness for AWS deployment              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check 1: Required Files
log "Checking required deployment files..."
required_files=(
    "Dockerfile.prod"
    "docker-compose.prod.yml" 
    "nginx/nginx.conf"
    "nginx/default.conf"
    "scripts/deploy-aws.sh"
    "scripts/setup-aws-infrastructure.sh"
    "scripts/health-check.sh"
    "scripts/backup-restore.sh"
    ".env.example"
    "PRODUCTION-DEPLOYMENT.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        success "Found: $file"
    else
        error "Missing: $file"
    fi
done

# Check 2: Script Permissions
log "Checking script permissions..."
scripts=(
    "scripts/deploy-aws.sh"
    "scripts/setup-aws-infrastructure.sh" 
    "scripts/health-check.sh"
    "scripts/backup-restore.sh"
)

for script in "${scripts[@]}"; do
    if [ -x "$script" ]; then
        success "Executable: $script"
    else
        error "Not executable: $script"
    fi
done

# Check 3: Docker Configuration
log "Validating Docker configuration..."

# Check Dockerfile
if grep -q "FROM node:18-alpine AS base" Dockerfile.prod; then
    success "Dockerfile uses multi-stage build"
else
    error "Dockerfile missing multi-stage configuration"
fi

if grep -q "USER lms" Dockerfile.prod; then
    success "Dockerfile runs as non-root user"
else
    error "Dockerfile missing non-root user configuration"
fi

if grep -q "HEALTHCHECK" Dockerfile.prod; then
    success "Dockerfile includes health check"
else
    warning "Dockerfile missing health check"
fi

# Check 4: Environment Configuration
log "Checking environment configuration..."

if [ -f ".env.example" ]; then
    success "Environment template available"
    
    # Check for required environment variables
    required_vars=(
        "DATABASE_URL"
        "NODE_ENV"
        "SESSION_SECRET"
        "AWS_REGION"
        "AWS_ACCOUNT_ID"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.example; then
            success "Environment variable template: $var"
        else
            warning "Missing environment variable template: $var"
        fi
    done
else
    error "Missing .env.example file"
fi

# Check 5: Package.json Scripts
log "Validating package.json scripts..."

required_scripts=(
    "build"
    "start"
    "db:push"
)

for script_name in "${required_scripts[@]}"; do
    if npm run --silent 2>/dev/null | grep -q "$script_name"; then
        success "NPM script available: $script_name"
    else
        warning "NPM script missing: $script_name"
    fi
done

# Check 6: Database Schema
log "Validating database schema..."

if [ -f "shared/schema.ts" ]; then
    success "Database schema file exists"
    
    # Check for essential tables
    essential_tables=(
        "users"
        "roadmaps"
        "courses"
        "userProgress"
    )
    
    for table in "${essential_tables[@]}"; do
        if grep -q "export const $table" shared/schema.ts; then
            success "Schema includes: $table"
        else
            error "Schema missing essential table: $table"
        fi
    done
else
    error "Missing database schema file"
fi

# Check 7: Health Endpoint
log "Checking health endpoint..."

if grep -q "/api/health" server/routes.ts; then
    success "Health endpoint configured"
else
    error "Health endpoint missing"
fi

# Check 8: Security Configuration
log "Validating security configuration..."

if [ -f "nginx/nginx.conf" ]; then
    if grep -q "add_header X-Frame-Options DENY" nginx/nginx.conf; then
        success "Security headers configured"
    else
        warning "Security headers may be missing"
    fi
    
    if grep -q "limit_req_zone" nginx/nginx.conf; then
        success "Rate limiting configured"
    else
        warning "Rate limiting not configured"
    fi
else
    error "Nginx configuration missing"
fi

# Check 9: AWS Deployment Scripts
log "Validating AWS deployment scripts..."

if [ -f "scripts/setup-aws-infrastructure.sh" ]; then
    if grep -q "CloudFormation" scripts/setup-aws-infrastructure.sh; then
        success "Infrastructure as Code configured"
    else
        warning "CloudFormation configuration may be incomplete"
    fi
fi

if [ -f "scripts/deploy-aws.sh" ]; then
    if grep -q "ECR" scripts/deploy-aws.sh; then
        success "Container registry deployment configured"
    else
        warning "ECR deployment may be incomplete"
    fi
    
    if grep -q "ECS" scripts/deploy-aws.sh; then
        success "Container orchestration configured"
    else
        warning "ECS deployment may be incomplete"
    fi
fi

# Check 10: Documentation
log "Checking documentation..."

if [ -f "PRODUCTION-DEPLOYMENT.md" ]; then
    success "Production deployment guide available"
    
    if grep -q "Prerequisites" PRODUCTION-DEPLOYMENT.md; then
        success "Prerequisites documented"
    fi
    
    if grep -q "Infrastructure Setup" PRODUCTION-DEPLOYMENT.md; then
        success "Infrastructure setup documented"
    fi
    
    if grep -q "Monitoring" PRODUCTION-DEPLOYMENT.md; then
        success "Monitoring documentation available"
    fi
else
    error "Production deployment guide missing"
fi

if [ -f "README.md" ]; then
    success "Project README available"
else
    warning "Project README missing"
fi

# Check 11: Build Validation
log "Testing Docker build..."

if command -v docker &> /dev/null; then
    if docker build -f Dockerfile.prod -t lms:validate-test . &> /tmp/docker-build.log; then
        success "Docker build successful"
        docker rmi lms:validate-test &> /dev/null || true
    else
        error "Docker build failed - check /tmp/docker-build.log"
    fi
else
    warning "Docker not available for build test"
fi

# Final Summary
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    VALIDATION SUMMARY                       ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"

if [ $VALIDATION_FAILED -eq 0 ]; then
    echo ""
    success "🎉 All validations passed! Your LMS is ready for production deployment."
    echo ""
    info "Next steps:"
    info "1. Configure your AWS credentials: aws configure"
    info "2. Set up infrastructure: ./scripts/setup-aws-infrastructure.sh"
    info "3. Deploy application: ./scripts/deploy-aws.sh"
    info "4. Run health checks: ./scripts/health-check.sh"
    echo ""
    info "📖 See PRODUCTION-DEPLOYMENT.md for detailed instructions"
    exit 0
else
    echo ""
    error "🚨 $VALIDATION_FAILED validation(s) failed. Please fix the issues above before deploying."
    echo ""
    info "Common fixes:"
    info "- Run: chmod +x scripts/*.sh"
    info "- Install missing dependencies"
    info "- Review configuration files"
    info "- Check PRODUCTION-DEPLOYMENT.md for requirements"
    exit 1
fi