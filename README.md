# Learning Management System (LMS)

A comprehensive online learning platform with structured roadmaps for different technical roles.

## Features

- **Role-based Learning Paths**: Frontend, Backend, DevOps roadmaps
- **Interactive Labs**: Terraform-based infrastructure labs  
- **Course Management**: Comprehensive course creation and enrollment
- **Advanced Admin Dashboard**: User management and analytics
- **Real-time Progress Tracking**: WebSocket-based synchronization
- **Dark Theme UI**: Modern design with Tailwind CSS

## Quick Start

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd learning-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL database**
```bash
# Make sure PostgreSQL is running
createdb lms_database

# Set environment variables
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

The application will be available at `http://localhost:5000`

### Docker Deployment

1. **Quick deployment with Docker Compose**
```bash
docker-compose up -d
```

2. **Manual build and test (optional)**
```bash
# Test the build process
./scripts/test-docker-build.sh

# Or build manually
docker build -t lms-app:latest .
```

This will start:
- PostgreSQL database on port 5432
- LMS application on port 5000

**Note**: The first build may take 3-5 minutes as it installs all dependencies and builds the application.

### Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to 'production' for production deployment

## Default Credentials

**Admin Login:**
- Username: `admin` 
- Password: `admin123`

**Demo Users:**
- `sarah_developer` / `password123`
- `john_learner` / `password123`
- `emma_student` / `password123` 
- `alex_engineer` / `password123`

## Database Schema

The application includes comprehensive schemas for:
- Users and authentication
- Roadmaps with progress tracking
- Courses and enrollments
- Labs and Terraform environments
- Admin analytics and reporting

## API Endpoints

### Health Check
- `GET /api/health` - Application health status

### Authentication  
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Admin Routes (require admin role)
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - System analytics
- `POST /api/admin/roadmaps` - Create roadmaps

### User Routes
- `GET /api/roadmaps` - List available roadmaps
- `GET /api/courses` - List available courses
- `POST /api/progress` - Update learning progress

## Technology Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS + Shadcn/ui components
- TanStack Query for state management
- Wouter for routing

**Backend:**
- Node.js with Express
- TypeScript
- Drizzle ORM with PostgreSQL
- Passport.js authentication
- WebSocket for real-time updates

**Deployment:**
- Docker & Docker Compose
- PostgreSQL database
- Health checks and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

MIT License