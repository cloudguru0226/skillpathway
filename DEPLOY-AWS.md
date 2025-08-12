# AWS Deployment Guide - Fix Crash Looping

## Quick Deploy to AWS VM (54.93.42.60)

### Step 1: SSH to Your VM
```bash
ssh -i your-key.pem ubuntu@54.93.42.60
```

### Step 2: Install Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login to apply docker group
exit
# SSH back in
ssh -i your-key.pem ubuntu@54.93.42.60
```

### Step 3: Clone and Deploy
```bash
# Clone your repository (replace with your actual repo URL)
git clone your-lms-repo.git
cd your-lms-repo

# Set environment variables
export DATABASE_URL="postgresql://username:password@your-db-host:5432/lms_production"
export SESSION_SECRET="your-super-secure-session-secret-at-least-32-chars"

# Deploy with the simplified script
chmod +x scripts/deploy-simple.sh
./scripts/deploy-simple.sh
```

### Step 4: Configure Firewall
```bash
# Allow HTTP traffic
sudo ufw allow 5000
sudo ufw enable
```

### Step 5: Verify Deployment
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs -f app

# Test health endpoint
curl http://localhost:5000/api/health
```

## Environment Variables Required

Create a `.env` file in your project root:
```bash
# Required Environment Variables
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:5432/database
SESSION_SECRET=your-secure-session-secret-here

# Optional
LOG_LEVEL=info
```

## Troubleshooting Crash Loops

### 1. Check Container Logs
```bash
docker-compose logs app
```

### 2. Common Issues and Fixes

**Database Connection Failed:**
```bash
# Test database connection
docker run --rm postgres:15-alpine psql "$DATABASE_URL" -c "SELECT 1;"
```

**Permission Errors:**
```bash
# Fix ownership
sudo chown -R $USER:$USER .
```

**Port Already in Use:**
```bash
# Kill processes on port 5000
sudo lsof -ti:5000 | xargs sudo kill -9
```

**Out of Memory:**
```bash
# Check memory usage
free -h
docker stats
```

### 3. Manual Container Run (for debugging)
```bash
# Stop docker-compose
docker-compose down

# Run manually with logs
docker run -it --rm \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SESSION_SECRET="$SESSION_SECRET" \
  lms:latest
```

## Production Security Checklist

- [ ] Database credentials secured
- [ ] Session secret is strong (32+ characters)
- [ ] Firewall configured (only port 5000 open)
- [ ] SSL certificate configured (optional)
- [ ] Regular backups scheduled
- [ ] Monitoring enabled

## Access Your LMS

Once deployed successfully:
- **URL**: http://54.93.42.60:5000
- **Admin Login**: admin / admin123
- **Health Check**: http://54.93.42.60:5000/api/health

## Maintenance Commands

```bash
# View logs
docker-compose logs -f app

# Restart application
docker-compose restart app

# Update application
git pull
./scripts/deploy-simple.sh

# Backup database
./scripts/backup-restore.sh backup

# Clean up old images
docker image prune -f
```