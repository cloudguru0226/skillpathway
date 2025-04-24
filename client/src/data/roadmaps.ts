import { Roadmap } from "@shared/schema";

// Sample data structure for roadmaps derived from PDF files
export const sampleRoadmaps: Partial<Roadmap>[] = [
  {
    title: "Frontend Developer",
    description: "Learn modern frontend development from scratch. Covers HTML, CSS, JavaScript and modern frameworks.",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "9-12 months",
    content: {
      sections: [
        {
          title: "Internet",
          description: "Learn the basics of how the internet works",
          completed: true,
          nodes: [
            { title: "How does the internet work?", completed: true },
            { title: "What is HTTP?", completed: true },
            { title: "Browsers and how they work?", completed: true },
            { title: "DNS and how it works?", completed: true },
            { title: "What is Domain Name?", completed: true },
            { title: "What is hosting?", completed: true }
          ]
        },
        {
          title: "HTML",
          description: "Learn the basics of HTML",
          completed: true,
          nodes: [
            { title: "Learn the basics", completed: true },
            { title: "Writing Semantic HTML", completed: true },
            { title: "Forms and Validations", completed: true },
            { title: "Accessibility", completed: true },
            { title: "SEO Basics", completed: true }
          ]
        },
        {
          title: "CSS",
          description: "Learn the basics of CSS",
          completed: true,
          nodes: [
            { title: "Learn the Basics", completed: true },
            { title: "Making Layouts", completed: true },
            { title: "Responsive Design", completed: true }
          ]
        },
        {
          title: "JavaScript",
          description: "Learn the basics of JavaScript",
          completed: false,
          inProgress: true,
          nodes: [
            { title: "Basic Syntax and Variables", completed: true },
            { title: "Functions and Scope", completed: false, inProgress: true },
            { title: "Arrays and Objects", completed: false },
            { title: "DOM Manipulation", completed: false },
            { title: "Fetch API / Ajax (XHR)", completed: false }
          ]
        },
        {
          title: "Version Control Systems",
          description: "Learn about version control systems",
          completed: false,
          nodes: [
            { title: "Git", completed: false }
          ]
        },
        {
          title: "Package Managers",
          description: "Learn about package managers",
          completed: false,
          nodes: [
            { title: "npm", completed: false },
            { title: "yarn", completed: false },
            { title: "pnpm", completed: false }
          ]
        },
        {
          title: "Pick a Framework",
          description: "Choose a modern JavaScript framework",
          completed: false,
          nodes: [
            { title: "React", completed: false },
            { title: "Vue.js", completed: false },
            { title: "Angular", completed: false },
            { title: "Svelte", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Backend Developer",
    description: "Master server-side development with databases, APIs, and server frameworks.",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "8-12 months",
    content: {
      sections: [
        {
          title: "Internet",
          description: "Learn the basics of how the internet works",
          completed: true,
          nodes: [
            { title: "How does the internet work?", completed: true },
            { title: "What is HTTP?", completed: true },
            { title: "What is an API?", completed: true },
            { title: "REST", completed: true }
          ]
        },
        {
          title: "Learn a Language",
          description: "Pick a backend language to learn",
          completed: false,
          inProgress: true,
          nodes: [
            { title: "JavaScript (Node.js)", completed: true },
            { title: "Python", completed: false, inProgress: true },
            { title: "Java", completed: false },
            { title: "Go", completed: false },
            { title: "Ruby", completed: false },
            { title: "PHP", completed: false },
            { title: "C#", completed: false }
          ]
        },
        {
          title: "Databases",
          description: "Learn about databases",
          completed: false,
          nodes: [
            { title: "Relational Databases", completed: false },
            { title: "NoSQL Databases", completed: false },
            { title: "ORMs", completed: false },
            { title: "Database Design", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "DevOps Engineer",
    description: "Learn to automate, configure and maintain infrastructure and deployment pipelines.",
    type: "role",
    difficulty: "advanced",
    estimatedTime: "10-14 months",
    content: {
      sections: [
        {
          title: "Learn a Language",
          description: "Pick a programming language to learn",
          completed: false,
          nodes: [
            { title: "Python", completed: false },
            { title: "Go", completed: false },
            { title: "Ruby", completed: false },
            { title: "Bash", completed: false }
          ]
        },
        {
          title: "Operating Systems",
          description: "Learn about operating systems",
          completed: false,
          nodes: [
            { title: "Linux", completed: false },
            { title: "Unix", completed: false },
            { title: "Windows", completed: false }
          ]
        },
        {
          title: "Containerization",
          description: "Learn about containerization",
          completed: false,
          nodes: [
            { title: "Docker", completed: false },
            { title: "Kubernetes", completed: false }
          ]
        },
        {
          title: "Infrastructure as Code",
          description: "Learn about IaC",
          completed: false,
          nodes: [
            { title: "Terraform", completed: false },
            { title: "CloudFormation", completed: false },
            { title: "Ansible", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "React",
    description: "Learn React from scratch, the most popular JavaScript library for building user interfaces.",
    type: "skill",
    difficulty: "intermediate",
    estimatedTime: "4-6 months",
    content: {
      sections: [
        {
          title: "Fundamentals",
          description: "Learn the basics of React",
          completed: false,
          nodes: [
            { title: "JSX", completed: false },
            { title: "Components", completed: false },
            { title: "Props", completed: false },
            { title: "State", completed: false },
            { title: "Lifecycle Methods", completed: false }
          ]
        },
        {
          title: "Advanced Concepts",
          description: "Learn advanced React concepts",
          completed: false,
          nodes: [
            { title: "Hooks", completed: false },
            { title: "Context API", completed: false },
            { title: "Refs", completed: false },
            { title: "Error Boundaries", completed: false },
            { title: "Higher Order Components", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "AWS",
    description: "Master Amazon Web Services, the leading cloud platform for hosting web applications.",
    type: "skill",
    difficulty: "advanced",
    estimatedTime: "5-8 months",
    content: {
      sections: [
        {
          title: "Step 1 - Essentials",
          description: "Learn the essential AWS services",
          completed: false,
          nodes: [
            { title: "IAM - Access Control for all services", completed: false },
            { title: "VPC - Networking Layer", completed: false },
            { title: "EC2 - Compute", completed: false }
          ]
        },
        {
          title: "Step 2 - Learn these next",
          description: "Next set of important AWS services",
          completed: false,
          nodes: [
            { title: "S3 - Storage", completed: false },
            { title: "SES - Emails", completed: false },
            { title: "Route53 - DNS", completed: false },
            { title: "Cloudwatch - Metrics, Alarms, Logs etc", completed: false },
            { title: "Cloudfront - CDN", completed: false }
          ]
        },
        {
          title: "Step 3 - Pick these after",
          description: "More advanced AWS services",
          completed: false,
          nodes: [
            { title: "RDS - Managed Databases", completed: false },
            { title: "DynamoDB - NoSQL Storage", completed: false },
            { title: "ElastiCache - Redis/Memcached", completed: false },
            { title: "ECS - Containers", completed: false },
            { title: "EKS - Kubernetes", completed: false }
          ]
        },
        {
          title: "Step 4 - Serverless",
          description: "Learn about serverless options",
          completed: false,
          nodes: [
            { title: "Lambda", completed: false },
            { title: "ECS Fargate", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "JavaScript",
    description: "Learn JavaScript, the most popular language for web development.",
    type: "skill",
    difficulty: "beginner",
    estimatedTime: "3-5 months",
    content: {
      sections: [
        {
          title: "Basics",
          description: "Learn the basics of JavaScript",
          completed: false,
          nodes: [
            { title: "Variables", completed: false },
            { title: "Data Types", completed: false },
            { title: "Operators", completed: false },
            { title: "Control Flow", completed: false },
            { title: "Functions", completed: false },
            { title: "Scope", completed: false }
          ]
        },
        {
          title: "Advanced Concepts",
          description: "Learn advanced JavaScript concepts",
          completed: false,
          nodes: [
            { title: "Objects", completed: false },
            { title: "Prototypes", completed: false },
            { title: "Classes", completed: false },
            { title: "Async/Await", completed: false },
            { title: "Promises", completed: false },
            { title: "Error Handling", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Python",
    description: "Learn Python, one of the most versatile and popular programming languages.",
    type: "skill",
    difficulty: "beginner",
    estimatedTime: "3-5 months",
    content: {
      sections: [
        {
          title: "Basics",
          description: "Learn the basics of Python",
          completed: false,
          nodes: [
            { title: "Variables", completed: false },
            { title: "Data Types", completed: false },
            { title: "Operators", completed: false },
            { title: "Control Flow", completed: false },
            { title: "Functions", completed: false },
            { title: "Modules", completed: false }
          ]
        },
        {
          title: "Advanced Concepts",
          description: "Learn advanced Python concepts",
          completed: false,
          nodes: [
            { title: "Object-Oriented Programming", completed: false },
            { title: "Decorators", completed: false },
            { title: "Generators", completed: false },
            { title: "Error Handling", completed: false },
            { title: "File I/O", completed: false },
            { title: "Virtual Environments", completed: false }
          ]
        }
      ]
    }
  }
];