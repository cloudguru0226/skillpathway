#!/usr/bin/env tsx

import { db, pool } from '../server/db';
import { users, roadmaps, courses, categories } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seedProduction() {
  console.log('🌱 Starting production data seeding...');

  try {
    // 1. Create admin user if not exists
    console.log('👤 Setting up admin user...');
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@learning-platform.com',
        password: hashedPassword,
        isAdmin: true
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // 2. Create essential categories
    console.log('📂 Setting up categories...');
    const essentialCategories = [
      { name: 'Frontend Development', description: 'Client-side web development technologies' },
      { name: 'Backend Development', description: 'Server-side application development' },
      { name: 'DevOps & Infrastructure', description: 'Deployment, monitoring, and infrastructure management' },
      { name: 'Data Science & Analytics', description: 'Data analysis, machine learning, and statistics' },
      { name: 'Mobile Development', description: 'iOS, Android, and cross-platform mobile apps' },
      { name: 'Cloud Computing', description: 'Cloud platforms and distributed systems' }
    ];

    for (const category of essentialCategories) {
      const existing = await db.select().from(categories).where(eq(categories.name, category.name)).limit(1);
      if (existing.length === 0) {
        await db.insert(categories).values(category);
        console.log(`✅ Created category: ${category.name}`);
      }
    }

    // 3. Create essential roadmaps if they don't exist
    console.log('🛣️ Setting up core roadmaps...');
    const coreRoadmaps = [
      {
        title: 'Frontend Developer',
        description: 'Complete path to becoming a modern frontend developer',
        type: 'role',
        difficulty: 'beginner',
        estimatedTime: '200 hours',
        content: {
          sections: [
            {
              title: 'Fundamentals',
              description: 'Core web technologies',
              topics: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Responsive Design']
            },
            {
              title: 'Modern Frameworks',
              description: 'Popular frontend frameworks',
              topics: ['React.js', 'Vue.js', 'Angular', 'TypeScript']
            }
          ]
        }
      },
      {
        title: 'Backend Developer', 
        description: 'Server-side development fundamentals',
        type: 'role',
        difficulty: 'intermediate',
        estimatedTime: '250 hours',
        content: {
          sections: [
            {
              title: 'Server Fundamentals',
              description: 'Backend development basics',
              topics: ['Node.js', 'Express.js', 'RESTful APIs', 'Authentication']
            },
            {
              title: 'Database Management',
              description: 'Data storage and retrieval',
              topics: ['PostgreSQL', 'MongoDB', 'Redis', 'Query Optimization']
            }
          ]
        }
      },
      {
        title: 'DevOps Engineer',
        description: 'Infrastructure and deployment automation',
        type: 'role',
        difficulty: 'advanced',
        estimatedTime: '300 hours',
        content: {
          sections: [
            {
              title: 'Infrastructure Basics',
              description: 'Core infrastructure concepts',
              topics: ['Linux Administration', 'Docker', 'Container Orchestration', 'CI/CD']
            },
            {
              title: 'Cloud Platforms',
              description: 'Cloud service providers',
              topics: ['AWS Services', 'Azure Fundamentals', 'GCP Basics', 'Terraform']
            }
          ]
        }
      }
    ];

    for (const roadmap of coreRoadmaps) {
      const existing = await db.select().from(roadmaps).where(eq(roadmaps.title, roadmap.title)).limit(1);
      if (existing.length === 0) {
        await db.insert(roadmaps).values(roadmap);
        console.log(`✅ Created roadmap: ${roadmap.title}`);
      }
    }

    // 4. Create sample courses
    console.log('📚 Setting up sample courses...');
    const sampleCourses = [
      {
        title: 'JavaScript Fundamentals',
        description: 'Master the building blocks of modern web development',
        type: 'course',
        difficulty: 'beginner',
        estimatedTime: '40 hours',
        content: { modules: ['Variables & Data Types', 'Functions & Scope', 'DOM Manipulation', 'Async Programming'] }
      },
      {
        title: 'Database Design Patterns',
        description: 'Learn efficient database design and optimization',
        type: 'course',
        difficulty: 'intermediate', 
        estimatedTime: '30 hours',
        content: { modules: ['Normalization', 'Indexing Strategies', 'Query Optimization', 'Performance Monitoring'] }
      }
    ];

    for (const course of sampleCourses) {
      const existing = await db.select().from(courses).where(eq(courses.title, course.title)).limit(1);
      if (existing.length === 0) {
        await db.insert(courses).values(course);
        console.log(`✅ Created course: ${course.title}`);
      }
    }

    console.log('🎉 Production seeding completed successfully!');
    console.log('');
    console.log('📊 System Status:');
    console.log('✅ Admin credentials: admin / admin123');
    console.log('✅ Core roadmaps, courses, and labs ready');
    console.log('✅ System ready for production deployment');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedProduction();
}