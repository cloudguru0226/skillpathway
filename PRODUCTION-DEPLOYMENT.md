# Production Deployment Guide

## Complete LMS Production Deployment on AWS

This guide provides comprehensive instructions for deploying the Learning Management System to production on AWS with full persistence, monitoring, and reliability.

## 📋 Prerequisites

### Required Tools
- AWS CLI v2 configured with appropriate permissions
- Docker and Docker Compose
- Node.js 18+ and npm
- PostgreSQL client tools (optional, for debugging)

### AWS Permissions Required
- ECR: Full access for container registry
- ECS: Full access for container orchestration
- RDS: Full access for managed PostgreSQL
- VPC: Create/manage VPC, subnets, security groups
- Application Load Balancer: Create and manage ALBs
- CloudWatch: Logs and monitoring
- Secrets Manager: Store sensitive configuration
- IAM: Create service roles

## 🏗️ Infrastructure Setup

### Step 1: Create AWS Infrastructure

```bash
# Set environment variables
export AWS_REGION=us-east-1
export STACK_NAME=lms-production
export ENVIRONMENT=production

# Run infrastructure setup script
./scripts/setup-aws-infrastructure.sh
```

This creates:
- ✅ VPC with public/private subnets across 2 AZs
- ✅ RDS PostgreSQL instance with automated backups
- ✅ Application Load Balancer with health checks
- ✅ ECS Fargate cluster for container orchestration
- ✅ Security groups with proper network isolation
- ✅ CloudWatch log groups for monitoring
- ✅ Secrets Manager for sensitive configuration

### Step 2: Configure Environment Variables

Create production environment file:
```bash
cp .env.example .env.production
```

Update `.env.production` with your values:
```env
# Database (from CloudFormation outputs)
DATABASE_URL=postgresql://postgres:password@your-rds-endpoint:5432/lms_production

# Application
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-secure-64-character-session-secret-here

# AWS Configuration
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1
ECR_REPOSITORY_NAME=lms-production
ECS_CLUSTER_NAME=production-lms-cluster
ECS_SERVICE_NAME=production-lms-service

# Optional: Custom domain
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

## 🚀 Deployment Process

### Step 3: Deploy Application

```bash
# Set environment variables from your .env.production file
source .env.production

# Deploy to AWS
./scripts/deploy-aws.sh
```

The deployment script:
1. ✅ Builds optimized production Docker image
2. ✅ Pushes to AWS ECR
3. ✅ Runs database migrations
4. ✅ Updates ECS task definition
5. ✅ Deploys new version with zero-downtime
6. ✅ Waits for deployment completion

### Step 4: Initialize Production Data

```bash
# Connect to the deployed service and seed initial data
docker run --rm \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NODE_ENV=production \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/lms-production:latest \
  npm run seed
```

## 🔒 SSL/HTTPS Configuration

### Option 1: AWS Certificate Manager (Recommended)

1. Request SSL certificate in ACM
2. Update ALB listener to use HTTPS
3. Configure domain in Route 53

### Option 2: Let's Encrypt with Nginx

Update `nginx/default.conf` to enable HTTPS configuration block and obtain certificates.

## 📊 Monitoring and Logging

### Health Checks
- Application: `https://your-domain.com/api/health`
- ECS Service: Automatic health checks every 30 seconds
- ALB Target Group: Health check on `/api/health`

### Logging
- Application logs: CloudWatch `/ecs/production-lms`
- Access logs: ALB access logging (optional)
- Database logs: RDS Enhanced Monitoring

### Monitoring Dashboard
```bash
# Access CloudWatch dashboards
aws cloudwatch list-dashboards --region $AWS_REGION
```

## 🔧 Production Configuration

### Database Configuration
- **Instance**: db.t3.micro (upgrade for high load)
- **Storage**: 20GB with auto-scaling to 100GB
- **Backups**: 7-day retention
- **Multi-AZ**: Disabled (enable for HA)
- **Encryption**: Enabled at rest

### Container Configuration
- **CPU**: 1 vCPU (1024 units)
- **Memory**: 2GB (2048 MB)
- **Auto Scaling**: 1-10 instances based on CPU/memory
- **Health Check**: 30s interval, 3 retries

### Security Features
- ✅ Network isolation with VPC
- ✅ Security groups with minimal required access
- ✅ Secrets stored in AWS Secrets Manager
- ✅ Container running as non-root user
- ✅ SQL injection protection via Drizzle ORM
- ✅ Session-based authentication
- ✅ HTTPS termination at load balancer

## 🧪 Validation and Testing

### Pre-deployment Testing
```bash
# Build and test locally
npm run docker:build
npm run docker:run

# Run health checks
./scripts/health-check.sh
```

### Post-deployment Validation
```bash
# Set your production URL
PROD_URL="https://your-domain.com"

# Test critical endpoints
curl -f $PROD_URL/api/health
curl -f $PROD_URL/
curl -i $PROD_URL/api/roadmaps  # Should return 401 without auth
```

### Load Testing (Optional)
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run basic load test
ab -n 1000 -c 10 $PROD_URL/api/health
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SESSION_SECRET: ${{ secrets.SESSION_SECRET }}
        run: ./scripts/deploy-aws.sh
```

## 📈 Scaling and Optimization

### Horizontal Scaling
```bash
# Update ECS service desired count
aws ecs update-service \
  --cluster production-lms-cluster \
  --service production-lms-service \
  --desired-count 3
```

### Database Scaling
- Upgrade RDS instance class for vertical scaling
- Enable read replicas for read-heavy workloads
- Consider Aurora PostgreSQL for auto-scaling

### Caching Layer
- Add Redis/ElastiCache for session storage
- Implement application-level caching for frequent queries

## 🚨 Disaster Recovery

### Database Backups
- **Automated**: 7-day point-in-time recovery
- **Manual**: Create snapshots before major updates
- **Cross-region**: Enable for critical deployments

### Application Recovery
- Docker images stored in ECR with versioning
- Blue/green deployments for zero-downtime updates
- Quick rollback capability via ECS service updates

## 📞 Support and Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# Test database connectivity
psql -h your-rds-endpoint -U postgres -d lms_production
```

**Application Not Starting**
```bash
# Check ECS service events
aws ecs describe-services --cluster production-lms-cluster --services production-lms-service

# View container logs
aws logs get-log-events --log-group-name /ecs/production-lms --log-stream-name ecs/lms-app/task-id
```

**High Memory Usage**
```bash
# Scale up container resources
aws ecs update-service --cluster production-lms-cluster --service production-lms-service --task-definition production-lms-task:2
```

### Performance Monitoring
- Monitor ECS service metrics in CloudWatch
- Set up CloudWatch alarms for high CPU/memory usage
- Use AWS X-Ray for application tracing (optional)

## 🎯 Production Checklist

### Pre-deployment
- [ ] Infrastructure created and validated
- [ ] Environment variables configured
- [ ] SSL certificate obtained (optional)
- [ ] Domain configured in Route 53
- [ ] Database migrations tested
- [ ] Health checks working locally

### Post-deployment
- [ ] Application accessible via load balancer
- [ ] Database connectivity confirmed
- [ ] Admin user login working (admin/admin123)
- [ ] Core roadmaps and content available
- [ ] Health endpoint responding
- [ ] Logs flowing to CloudWatch
- [ ] SSL redirects working (if enabled)

### Ongoing Maintenance
- [ ] Monitor CloudWatch logs and metrics
- [ ] Regular database backups verification
- [ ] Security patches and updates
- [ ] Performance optimization based on usage
- [ ] User feedback and feature requests

---

## 📖 Additional Resources

- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/best-practices-general.html)
- [PostgreSQL on RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [Docker Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)

Your LMS is now production-ready with enterprise-grade reliability, security, and scalability! 🎉