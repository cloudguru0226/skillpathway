# Deployment Guide - Learning Management System

## Quick Deployment with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git repository access

### 1. Clone and Deploy
```bash
# Clone your repository
git clone <your-repo-url>
cd learning-management-system

# Start with Docker Compose
docker-compose up -d

# Check deployment status
docker-compose ps
docker-compose logs app
```

The application will be available at: `http://localhost:5000`

### 2. Default Access
- **Admin Login**: `admin` / `admin123`
- **Demo Users**: `sarah_developer`, `john_learner`, `emma_student`, `alex_engineer` / `password123`

## Production Deployment

### Environment Variables
Create a `.env` file with production values:
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
SESSION_SECRET=your-super-secure-session-secret-here
```

### Docker Production Build
```bash
# Build production image
docker build -t lms-app:latest .

# Run with production database
docker run -d \
  --name lms-production \
  -p 5000:5000 \
  -e DATABASE_URL="your-production-db-url" \
  -e NODE_ENV=production \
  lms-app:latest
```

## Cloud Deployment Options

### AWS ECS / Azure Container Instances
1. Push image to container registry
2. Create container service with environment variables
3. Configure load balancer and SSL certificate
4. Set up managed PostgreSQL database

### Docker Swarm / Kubernetes
Use the provided `docker-compose.yml` as a starting point for orchestration configs.

## Database Setup

### Automatic Migration
The application automatically runs database migrations on startup.

### Manual Migration
```bash
# Connect to container
docker exec -it lms-app sh

# Run migrations manually
npm run db:push
```

## Health Monitoring

### Health Check Endpoints
- `GET /api/health` - Application health status
- Database connectivity verified automatically

### Container Health
Docker containers include built-in health checks that monitor:
- Application responsiveness
- Database connectivity
- Critical service availability

## Troubleshooting

### Common Issues

**Container won't start:**
```bash
docker-compose logs app
```

**Database connection errors:**
- Verify DATABASE_URL format
- Check database server accessibility
- Ensure credentials are correct

**Build failures:**
- Clear Docker cache: `docker system prune -a`
- Rebuild: `docker-compose build --no-cache`

### Performance Optimization

**For production:**
- Use managed PostgreSQL service
- Enable container orchestration
- Configure horizontal scaling
- Set up CDN for static assets
- Monitor with APM tools

## Security Checklist

- [ ] Change default admin password
- [ ] Set secure SESSION_SECRET
- [ ] Use managed database with SSL
- [ ] Configure reverse proxy with SSL
- [ ] Enable container security scanning
- [ ] Set up log monitoring
- [ ] Configure backup strategy

## Scaling Considerations

- **Database**: Use read replicas for heavy read workloads
- **Application**: Scale horizontally with load balancer
- **Sessions**: Consider Redis for session storage in multi-instance setup
- **Files**: Use cloud storage for user uploads and static assets