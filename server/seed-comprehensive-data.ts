import { storage } from "./storage";
import { createAdminUserIfNotExists } from "./admin-seed";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedComprehensiveData() {
  console.log("Starting comprehensive data seeding...");
  
  // Make sure admin user exists
  await createAdminUserIfNotExists();
  
  // Seed roadmaps
  const roadmapsData = [
    {
      title: "Frontend Developer Roadmap",
      description: "Complete path to becoming a skilled frontend developer with modern frameworks and tools",
      type: "role",
      difficulty: "intermediate", 
      estimatedTime: "6-8 months",
      content: {
        sections: [
          {
            title: "Fundamentals",
            nodes: [
              { id: "html-basics", title: "HTML Fundamentals", type: "concept", completed: false },
              { id: "css-basics", title: "CSS Fundamentals", type: "concept", completed: false },
              { id: "js-basics", title: "JavaScript Fundamentals", type: "concept", completed: false },
              { id: "dom-manipulation", title: "DOM Manipulation", type: "practice", completed: false }
            ]
          },
          {
            title: "Modern JavaScript",
            nodes: [
              { id: "es6-features", title: "ES6+ Features", type: "concept", completed: false },
              { id: "async-programming", title: "Async Programming", type: "concept", completed: false },
              { id: "modules", title: "JavaScript Modules", type: "concept", completed: false },
              { id: "build-tools", title: "Build Tools & Bundlers", type: "tool", completed: false }
            ]
          },
          {
            title: "React Development",
            nodes: [
              { id: "react-basics", title: "React Fundamentals", type: "framework", completed: false },
              { id: "react-hooks", title: "React Hooks", type: "concept", completed: false },
              { id: "state-management", title: "State Management", type: "concept", completed: false },
              { id: "react-router", title: "React Router", type: "library", completed: false }
            ]
          }
        ]
      }
    },
    {
      title: "Backend Developer Roadmap",
      description: "Comprehensive guide to server-side development with Node.js and databases",
      type: "role",
      difficulty: "intermediate",
      estimatedTime: "8-10 months",
      content: {
        sections: [
          {
            title: "Server Fundamentals",
            nodes: [
              { id: "http-basics", title: "HTTP Protocol", type: "concept", completed: false },
              { id: "node-basics", title: "Node.js Fundamentals", type: "runtime", completed: false },
              { id: "express-framework", title: "Express.js Framework", type: "framework", completed: false },
              { id: "middleware", title: "Middleware Concepts", type: "concept", completed: false }
            ]
          },
          {
            title: "Database Management",
            nodes: [
              { id: "sql-basics", title: "SQL Fundamentals", type: "database", completed: false },
              { id: "postgresql", title: "PostgreSQL", type: "database", completed: false },
              { id: "orm-usage", title: "ORM & Query Builders", type: "tool", completed: false },
              { id: "database-design", title: "Database Design", type: "concept", completed: false }
            ]
          },
          {
            title: "Authentication & Security",
            nodes: [
              { id: "auth-basics", title: "Authentication Basics", type: "concept", completed: false },
              { id: "jwt-tokens", title: "JWT Tokens", type: "concept", completed: false },
              { id: "security-practices", title: "Security Best Practices", type: "concept", completed: false },
              { id: "api-security", title: "API Security", type: "concept", completed: false }
            ]
          }
        ]
      }
    },
    {
      title: "DevOps Engineer Roadmap",
      description: "Infrastructure, automation, and deployment practices for modern applications",
      type: "role",
      difficulty: "advanced",
      estimatedTime: "10-12 months",
      content: {
        sections: [
          {
            title: "Infrastructure Basics",
            nodes: [
              { id: "linux-basics", title: "Linux Administration", type: "os", completed: false },
              { id: "networking", title: "Networking Fundamentals", type: "concept", completed: false },
              { id: "cloud-basics", title: "Cloud Computing Basics", type: "concept", completed: false },
              { id: "virtualization", title: "Virtualization", type: "concept", completed: false }
            ]
          },
          {
            title: "Containerization",
            nodes: [
              { id: "docker-basics", title: "Docker Fundamentals", type: "tool", completed: false },
              { id: "docker-compose", title: "Docker Compose", type: "tool", completed: false },
              { id: "kubernetes", title: "Kubernetes", type: "orchestration", completed: false },
              { id: "container-security", title: "Container Security", type: "concept", completed: false }
            ]
          },
          {
            title: "CI/CD & Automation",
            nodes: [
              { id: "git-workflows", title: "Git Workflows", type: "tool", completed: false },
              { id: "ci-cd-pipelines", title: "CI/CD Pipelines", type: "concept", completed: false },
              { id: "infrastructure-code", title: "Infrastructure as Code", type: "concept", completed: false },
              { id: "monitoring", title: "Monitoring & Logging", type: "concept", completed: false }
            ]
          }
        ]
      }
    },
    {
      title: "TypeScript Mastery",
      description: "Advanced TypeScript concepts and practical applications",
      type: "skill",
      difficulty: "intermediate",
      estimatedTime: "3-4 months",
      content: {
        sections: [
          {
            title: "TypeScript Fundamentals",
            nodes: [
              { id: "ts-basics", title: "TypeScript Basics", type: "language", completed: false },
              { id: "type-system", title: "Type System", type: "concept", completed: false },
              { id: "interfaces", title: "Interfaces & Types", type: "concept", completed: false },
              { id: "generics", title: "Generics", type: "concept", completed: false }
            ]
          },
          {
            title: "Advanced Features",
            nodes: [
              { id: "utility-types", title: "Utility Types", type: "concept", completed: false },
              { id: "decorators", title: "Decorators", type: "feature", completed: false },
              { id: "modules", title: "Module System", type: "concept", completed: false },
              { id: "configuration", title: "TypeScript Configuration", type: "tool", completed: false }
            ]
          }
        ]
      }
    },
    {
      title: "React Advanced Patterns",
      description: "Advanced React concepts, patterns, and performance optimization",
      type: "skill", 
      difficulty: "advanced",
      estimatedTime: "4-5 months",
      content: {
        sections: [
          {
            title: "Advanced Hooks",
            nodes: [
              { id: "custom-hooks", title: "Custom Hooks", type: "pattern", completed: false },
              { id: "context-api", title: "Context API", type: "concept", completed: false },
              { id: "reducer-pattern", title: "useReducer Pattern", type: "pattern", completed: false },
              { id: "performance-hooks", title: "Performance Hooks", type: "optimization", completed: false }
            ]
          },
          {
            title: "Performance Optimization",
            nodes: [
              { id: "memo-optimization", title: "React.memo & useMemo", type: "optimization", completed: false },
              { id: "code-splitting", title: "Code Splitting", type: "optimization", completed: false },
              { id: "lazy-loading", title: "Lazy Loading", type: "optimization", completed: false },
              { id: "bundle-analysis", title: "Bundle Analysis", type: "tool", completed: false }
            ]
          }
        ]
      }
    }
  ];

  // Seed courses data
  const coursesData = [
    {
      title: "JavaScript Fundamentals",
      description: "Master the basics of JavaScript programming language",
      duration: 40,
      difficulty: "beginner",
      estimatedDuration: "40 hours",
      imageUrl: "/api/placeholder/course-js.jpg",
      tags: ["javascript", "programming", "web-development"],
      status: "published",
      isPublic: true,
      content: {
        modules: [
          {
            title: "Introduction to JavaScript",
            lessons: [
              { title: "What is JavaScript?", duration: "30 min", type: "video" },
              { title: "Setting up Development Environment", duration: "45 min", type: "tutorial" },
              { title: "Your First JavaScript Program", duration: "60 min", type: "hands-on" }
            ]
          },
          {
            title: "Variables and Data Types",
            lessons: [
              { title: "Understanding Variables", duration: "40 min", type: "video" },
              { title: "Primitive Data Types", duration: "50 min", type: "tutorial" },
              { title: "Working with Strings", duration: "45 min", type: "hands-on" }
            ]
          }
        ]
      }
    },
    {
      title: "React Development Bootcamp",
      description: "Build modern web applications with React",
      duration: 80,
      difficulty: "intermediate",
      estimatedDuration: "80 hours",
      imageUrl: "/api/placeholder/course-react.jpg",
      tags: ["react", "frontend", "web-development", "javascript"],
      status: "published",
      isPublic: true,
      content: {
        modules: [
          {
            title: "React Fundamentals",
            lessons: [
              { title: "Introduction to React", duration: "60 min", type: "video" },
              { title: "JSX and Components", duration: "90 min", type: "tutorial" },
              { title: "Props and State", duration: "120 min", type: "hands-on" }
            ]
          },
          {
            title: "Hooks and State Management",
            lessons: [
              { title: "useState and useEffect", duration: "90 min", type: "video" },
              { title: "Context API", duration: "75 min", type: "tutorial" },
              { title: "Building a Todo App", duration: "180 min", type: "project" }
            ]
          }
        ]
      }
    },
    {
      title: "Node.js Backend Development",
      description: "Server-side development with Node.js and Express",
      duration: 60,
      difficulty: "intermediate",
      estimatedDuration: "60 hours",
      imageUrl: "/api/placeholder/course-node.jpg",
      tags: ["nodejs", "backend", "api", "database"],
      status: "published",
      isPublic: true,
      content: {
        modules: [
          {
            title: "Node.js Basics",
            lessons: [
              { title: "Introduction to Node.js", duration: "45 min", type: "video" },
              { title: "NPM and Package Management", duration: "60 min", type: "tutorial" },
              { title: "File System Operations", duration: "75 min", type: "hands-on" }
            ]
          },
          {
            title: "Express Framework",
            lessons: [
              { title: "Setting up Express Server", duration: "90 min", type: "tutorial" },
              { title: "Routing and Middleware", duration: "120 min", type: "hands-on" },
              { title: "Building REST APIs", duration: "150 min", type: "project" }
            ]
          }
        ]
      }
    }
  ];

  // Check if roadmaps already exist
  const existingRoadmaps = await storage.getRoadmaps();
  if (existingRoadmaps.length === 0) {
    console.log("Seeding roadmaps...");
    for (const roadmapData of roadmapsData) {
      await storage.createRoadmap(roadmapData);
      console.log(`Created roadmap: ${roadmapData.title}`);
    }
  } else {
    console.log("Roadmaps already exist, skipping roadmap seeding.");
  }

  // Get admin user for course creation
  const adminUser = await storage.getUserByUsername('admin');
  if (!adminUser) {
    console.log("Admin user not found, skipping course seeding.");
    return;
  }

  // Check if courses already exist
  try {
    const existingCourses = await storage.getCourses();
    if (existingCourses.length === 0) {
      console.log("Seeding courses...");
      for (const courseData of coursesData) {
        const courseWithCreator = {
          ...courseData,
          creatorId: adminUser.id
        };
        await storage.createCourse(courseWithCreator);
        console.log(`Created course: ${courseData.title}`);
      }
    } else {
      console.log("Courses already exist, skipping course seeding.");
    }
  } catch (error) {
    console.log("Courses table might not exist yet, creating courses...");
    for (const courseData of coursesData) {
      try {
        const courseWithCreator = {
          ...courseData,
          creatorId: adminUser.id
        };
        await storage.createCourse(courseWithCreator);
        console.log(`Created course: ${courseData.title}`);
      } catch (e) {
        console.log(`Error creating course ${courseData.title}:`, e);
      }
    }
  }

  console.log("Comprehensive data seeding completed!");
}