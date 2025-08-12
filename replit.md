# Learning Management System (LMS)

## Project Overview
A comprehensive online learning platform with structured roadmaps for different technical roles. The platform features:
- Role-based learning paths (Frontend, Backend, DevOps, etc.)
- Interactive labs with Terraform-based infrastructure
- Course management and enrollment system
- Advanced admin dashboard with analytics
- Dark-themed UI with modern design

## Current Status
- **Working Admin Dashboard**: Comprehensive admin interface with user management, analytics, and roadmap assignment
- **Authentication System**: Fully functional with session-based auth (admin/admin123)
- **Database Schema**: Complete with courses, labs, roadmaps, enrollments, and progress tracking
- **Core Features**: Roadmap viewing, progress tracking, user profiles implemented

## Recent Changes
**August 12, 2025:**
- ✅ **Complete Migration**: Successfully migrated from Replit Agent to standard Replit environment
- ✅ **Database Setup**: PostgreSQL database created and configured with all environment variables
- ✅ **Schema Migration**: All database tables created and seeded with comprehensive demo data (12 roadmaps total)
- ✅ **Admin Content Management**: Enhanced admin dashboard with full CRUD operations for all content types
- ✅ **Roadmap Content Editor**: Specialized editor for managing roadmap sections and learning nodes with drag-and-drop
- ✅ **API Integration**: Fixed content management to work with real data instead of mock fallbacks
- ✅ **TypeScript Fixes**: Resolved all compilation errors and ensured type safety

**July 10, 2025:**
- ✅ **Migration Complete**: Successfully migrated from Replit Agent to standard Replit environment
- ✅ **Docker Support**: Added comprehensive Docker configuration with health checks and multi-stage builds
- ✅ **Database Seeding**: Created comprehensive seed data with 5 roadmaps, 3 courses, and demo users
- ✅ **Authentication Verified**: All login flows, admin/user roles, and API security working correctly
- ✅ **Production Ready**: Added README, setup scripts, environment configuration, and deployment docs
- ✅ **Git Ready**: Created .gitignore, structured for version control and team collaboration

**January 01, 2025:**
- ✅ **Migration to Replit**: Successfully migrated project from Replit Agent to standard Replit environment
- ✅ **PostgreSQL Setup**: Created and configured PostgreSQL database with all environment variables
- ✅ **Role Management**: Fixed missing role management methods in storage layer for proper admin/user separation
- ✅ **Docker Implementation**: Added complete Docker support with Dockerfile, docker-compose.yml, and health checks
- ✅ **Security Enhancements**: Implemented proper authentication middleware with clear admin/user role separation
- ✅ **Health Monitoring**: Added /api/health endpoint for container health checks and monitoring

**June 24, 2025:**
- ✅ Implemented comprehensive learner features: self-enrollment, global search, My Learning dashboard
- ✅ Added enhanced admin content management with full CRUD for roadmaps, courses, labs, and trainings
- ✅ Extended navigation with "My Learning" and "Search" options for better UX
- ✅ Enhanced backend storage methods to support all new learner and admin functionality
- ✅ Fixed schema conflicts and ensured all content types are available for admin management
- ✅ **MVP Readiness**: Enhanced roadmap components with smooth transitions, section progress tracking, optimistic updates, and improved UX for production use
- ✅ **Transition Fixes**: Added smooth animations, hover effects, optimistic UI updates, and visual feedback for all topic interactions
- ✅ **Real-time Sync**: Implemented WebSocket-based progress synchronization across multiple sessions and devices
- ✅ **Authentication Testing**: Verified all auth flows, role-based access control, and API security work correctly

## Project Architecture

### Frontend
- **Framework**: React with Vite
- **Routing**: Wouter for client-side routing
- **UI Library**: Shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Session Storage**: PostgreSQL-backed sessions
- **Real-time**: WebSocket server for progress synchronization

### Database Schema Highlights
- **Users**: Authentication with isAdmin flag (not role-based)
- **Content Types**: Courses, Roadmaps, Labs, Trainings
- **Progress Tracking**: User progress for all content types
- **Assignments**: Enhanced system with due dates, priorities, bulk assignment
- **Categories**: Hierarchical categorization for better content organization
- **Permissions**: Granular access control system

## User Preferences
- **UI Style**: Maintain existing dark theme and visual design
- **Admin Credentials**: Username: admin, Password: admin123
- **Demo Users**: sarah_developer, john_learner, emma_student, alex_engineer
- **Technical Approach**: Use existing schema and infrastructure, avoid UI changes

## Implementation Priorities

### For Learners
1. **Self-enrollment system** - Allow learners to enroll in courses, labs, roadmaps
2. **Global search and filtering** - Search across all content types with advanced filters
3. **Enhanced categorization** - Browse content by categories and tags
4. **Improved labs experience** - Lab state management, usage tracking, start/stop controls

### For Admins
1. **Full CRUD operations** - Create, edit, delete for all content types
2. **Assignment management** - Assign content with due dates, priorities, bulk operations
3. **Enhanced reporting** - User activity, completion rates, exportable reports
4. **Granular permissions** - Role-based access to different admin functions
5. **Labs management** - Admin controls for lab lifecycle and usage monitoring

## Technical Notes
- User authorization uses `isAdmin` property, not separate roles table
- Database connections use environment variables (DATABASE_URL, etc.)
- All schemas already exist, focus on API endpoints and UI components
- Maintain existing dark theme and component styling
- Use established patterns for forms, queries, and mutations