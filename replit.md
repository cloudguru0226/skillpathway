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
**June 24, 2025:**
- Enhanced schema with assignments, categories, permissions for granular content management
- Preparing to implement comprehensive learner self-enrollment and admin CRUD features
- Added support for training assignments with due dates and priorities

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