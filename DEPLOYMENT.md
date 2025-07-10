# Deployment Guide

This document provides comprehensive instructions for deploying the Learning Management System.

## Quick Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Git repository cloned

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/cloudguru0226/skillpathway.git
cd skillpathway
```

2. **Deploy with Docker Compose**
```bash
docker-compose up -d
```

This will:
- Build the application image
- Start PostgreSQL database
- Run database migrations automatically
- Start the LMS application

3. **Access the application**
- URL: `http://localhost:5000`
- Admin Login: `admin` / `admin123`

### Verification Commands

```bash
# Check container status
docker-compose ps

# View application logs
docker-compose logs -f app

# Check database logs
docker-compose logs -f db

# Test health endpoint
curl http://localhost:5000/api/health
```

## Manual Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+

### Setup Steps

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database configuration
```

3. **Set up PostgreSQL database**
```bash
createdb lms_database
export DATABASE_URL="postgresql://username:password@localhost:5432/lms_database"
```

4. **Run database migrations**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

## Production Deployment

### Environment Variables

Required for production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
PGHOST=your-db-host
PGPORT=5432
PGUSER=your-db-user
PGPASSWORD=your-db-password
PGDATABASE=your-db-name
```

### Build and Start

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Database Schema

The application automatically creates 38 tables including:
- Users and authentication
- Roadmaps with progress tracking
- Courses and enrollments
- Labs and Terraform environments
- Admin analytics and reporting

## Default Data

The system seeds the following on first startup:
- **Admin user**: admin/admin123
- **Demo users**: sarah_developer, john_learner, emma_student, alex_engineer
- **5 Roadmaps**: Frontend, Backend, DevOps, TypeScript, React Advanced
- **3 Courses**: JavaScript Fundamentals, React Bootcamp, Node.js Backend

## Troubleshooting

### Docker Issues

```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# View detailed logs
docker-compose logs -f

# Reset database
docker-compose down -v
docker-compose up -d
```

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check DATABASE_URL format
3. Ensure database exists
4. Run `npm run db:push` to create tables

### Build Issues

1. Clear node modules: `rm -rf node_modules && npm install`
2. Clear build cache: `rm -rf dist && npm run build`
3. Verify all dependencies are installed

## Health Monitoring

The application provides a health endpoint at `/api/health` that returns:
- Application status
- Database connection status
- Timestamp
- Service information

Use this for monitoring and load balancer health checks.

## Security Notes

- Default admin credentials should be changed in production
- Use strong database passwords
- Consider SSL/TLS termination at load balancer
- Regular security updates recommended
- Container runs as non-root user for security