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
          completed: false,
          nodes: [
            { title: "How does the internet work?", completed: false },
            { title: "What is HTTP?", completed: false },
            { title: "Browsers and how they work?", completed: false },
            { title: "DNS and how it works?", completed: false },
            { title: "What is Domain Name?", completed: false },
            { title: "What is hosting?", completed: false }
          ]
        },
        {
          title: "HTML",
          description: "Learn the basics of HTML",
          completed: false,
          nodes: [
            { title: "Learn the basics", completed: false },
            { title: "Writing Semantic HTML", completed: false },
            { title: "Forms and Validations", completed: false },
            { title: "Accessibility", completed: false },
            { title: "SEO Basics", completed: false }
          ]
        },
        {
          title: "CSS",
          description: "Learn the basics of CSS",
          completed: false,
          nodes: [
            { title: "Learn the Basics", completed: false },
            { title: "Making Layouts", completed: false },
            { title: "Responsive Design", completed: false }
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
          completed: false,
          nodes: [
            { title: "How does the internet work?", completed: false },
            { title: "What is HTTP?", completed: false },
            { title: "What is an API?", completed: false },
            { title: "REST", completed: false }
          ]
        },
        {
          title: "Learn a Language",
          description: "Pick a backend language to learn",
          completed: false,
          nodes: [
            { title: "JavaScript (Node.js)", completed: false },
            { title: "Python", completed: false },
            { title: "Java", completed: false },
            { title: "Go", completed: false }
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
        }
      ]
    }
  },
  {
    title: "Full Stack",
    description: "Master both frontend and backend development to become a versatile full-stack developer.",
    type: "role",
    difficulty: "advanced",
    estimatedTime: "12-18 months",
    content: {
      sections: [
        {
          title: "Frontend Basics",
          description: "Learn the essentials of frontend development",
          completed: false,
          nodes: [
            { title: "HTML & CSS", completed: false },
            { title: "JavaScript", completed: false },
            { title: "Frontend Framework (React/Vue/Angular)", completed: false }
          ]
        },
        {
          title: "Backend Basics",
          description: "Learn the essentials of backend development",
          completed: false,
          nodes: [
            { title: "Server-side Language", completed: false },
            { title: "Databases", completed: false },
            { title: "APIs", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "AI Engineer",
    description: "Learn to build, implement and deploy AI solutions for real-world problems.",
    type: "role",
    difficulty: "advanced",
    estimatedTime: "12-18 months",
    content: {
      sections: [
        {
          title: "Foundations",
          description: "Master the essential skills",
          completed: false,
          nodes: [
            { title: "Programming (Python)", completed: false },
            { title: "Mathematics for ML", completed: false },
            { title: "Data Structures & Algorithms", completed: false }
          ]
        },
        {
          title: "Machine Learning",
          description: "Learn core ML concepts",
          completed: false,
          nodes: [
            { title: "Supervised Learning", completed: false },
            { title: "Unsupervised Learning", completed: false },
            { title: "Deep Learning", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Data Analyst",
    description: "Learn to analyze data and extract meaningful insights to drive business decisions.",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "6-9 months",
    content: {
      sections: [
        {
          title: "Data Processing",
          description: "Learn to collect and process data",
          completed: false,
          nodes: [
            { title: "Excel/Google Sheets", completed: false },
            { title: "SQL", completed: false },
            { title: "Python for Data Analysis", completed: false }
          ]
        },
        {
          title: "Data Visualization",
          description: "Learn to create visual representations of data",
          completed: false,
          nodes: [
            { title: "Tableau", completed: false },
            { title: "Power BI", completed: false },
            { title: "Matplotlib/Seaborn", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "AI and Data Scientist",
    description: "Master the skills needed to analyze complex data and build AI/ML models.",
    type: "role",
    difficulty: "advanced",
    estimatedTime: "12-18 months",
    content: {
      sections: [
        {
          title: "Data Science Fundamentals",
          description: "Master the basics of data science",
          completed: false,
          nodes: [
            { title: "Statistics", completed: false },
            { title: "Data Wrangling", completed: false },
            { title: "Exploratory Data Analysis", completed: false }
          ]
        },
        {
          title: "Machine Learning",
          description: "Learn core ML techniques",
          completed: false,
          nodes: [
            { title: "ML Algorithms", completed: false },
            { title: "Feature Engineering", completed: false },
            { title: "Model Evaluation", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Android Developer",
    description: "Learn to build native mobile applications for Android devices.",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "8-12 months",
    content: {
      sections: [
        {
          title: "Android Basics",
          description: "Learn the fundamentals of Android development",
          completed: false,
          nodes: [
            { title: "Java/Kotlin", completed: false },
            { title: "Android Studio", completed: false },
            { title: "UI Components", completed: false }
          ]
        },
        {
          title: "Android Architecture",
          description: "Learn about Android app architecture",
          completed: false,
          nodes: [
            { title: "Activities & Fragments", completed: false },
            { title: "Intents", completed: false },
            { title: "MVVM Architecture", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "iOS Developer",
    description: "Learn to build native mobile applications for Apple's iOS platform.",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "8-12 months",
    content: {
      sections: [
        {
          title: "iOS Basics",
          description: "Learn the fundamentals of iOS development",
          completed: false,
          nodes: [
            { title: "Swift", completed: false },
            { title: "Xcode", completed: false },
            { title: "UIKit", completed: false }
          ]
        },
        {
          title: "iOS Architecture",
          description: "Learn about iOS app architecture",
          completed: false,
          nodes: [
            { title: "View Controllers", completed: false },
            { title: "Storyboards", completed: false },
            { title: "MVC/MVVM Architecture", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "PostgreSQL",
    description: "Master PostgreSQL, a powerful open-source object-relational database system.",
    type: "skill",
    difficulty: "intermediate",
    estimatedTime: "3-6 months",
    content: {
      sections: [
        {
          title: "PostgreSQL Basics",
          description: "Learn the fundamentals of PostgreSQL",
          completed: false,
          nodes: [
            { title: "Database Design", completed: false },
            { title: "SQL Fundamentals", completed: false },
            { title: "CRUD Operations", completed: false }
          ]
        },
        {
          title: "Advanced PostgreSQL",
          description: "Learn advanced PostgreSQL features",
          completed: false,
          nodes: [
            { title: "Advanced Queries", completed: false },
            { title: "Indexing", completed: false },
            { title: "Performance Tuning", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Blockchain Developer",
    description: "Learn to build decentralized applications and smart contracts on blockchain platforms.",
    type: "role",
    difficulty: "advanced",
    estimatedTime: "9-15 months",
    content: {
      sections: [
        {
          title: "Blockchain Basics",
          description: "Learn the fundamentals of blockchain technology",
          completed: false,
          nodes: [
            { title: "Distributed Ledger Technology", completed: false },
            { title: "Cryptography", completed: false },
            { title: "Consensus Mechanisms", completed: false }
          ]
        },
        {
          title: "Smart Contracts",
          description: "Learn to develop smart contracts",
          completed: false,
          nodes: [
            { title: "Solidity", completed: false },
            { title: "Ethereum", completed: false },
            { title: "Web3.js", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "QA Engineer",
    description: "Learn to ensure software quality through testing and quality assurance processes.",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "6-9 months",
    content: {
      sections: [
        {
          title: "QA Fundamentals",
          description: "Learn the basics of quality assurance",
          completed: false,
          nodes: [
            { title: "Testing Types", completed: false },
            { title: "Test Planning", completed: false },
            { title: "Bug Reporting", completed: false }
          ]
        },
        {
          title: "Automation Testing",
          description: "Learn to automate tests",
          completed: false,
          nodes: [
            { title: "Selenium", completed: false },
            { title: "Cypress", completed: false },
            { title: "CI/CD for Testing", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Software Architect",
    description: "Learn to design and architect software systems at scale.",
    type: "role",
    difficulty: "advanced",
    estimatedTime: "12-24 months",
    content: {
      sections: [
        {
          title: "Architecture Fundamentals",
          description: "Learn the basics of software architecture",
          completed: false,
          nodes: [
            { title: "Design Patterns", completed: false },
            { title: "System Design", completed: false },
            { title: "Architecture Styles", completed: false }
          ]
        },
        {
          title: "Advanced Architecture",
          description: "Learn advanced architecture concepts",
          completed: false,
          nodes: [
            { title: "Microservices", completed: false },
            { title: "Distributed Systems", completed: false },
            { title: "Scalability", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Cyber Security",
    description: "Learn to protect systems, networks, and data from digital attacks.",
    type: "role",
    difficulty: "advanced",
    estimatedTime: "9-15 months",
    content: {
      sections: [
        {
          title: "Security Fundamentals",
          description: "Learn the basics of cybersecurity",
          completed: false,
          nodes: [
            { title: "Security Concepts", completed: false },
            { title: "Network Security", completed: false },
            { title: "Cryptography", completed: false }
          ]
        },
        {
          title: "Offensive Security",
          description: "Learn offensive security techniques",
          completed: false,
          nodes: [
            { title: "Penetration Testing", completed: false },
            { title: "Vulnerability Assessment", completed: false },
            { title: "Exploit Development", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "UX Designer",
    description: "Learn to create intuitive, user-friendly interfaces and experiences.",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "6-12 months",
    content: {
      sections: [
        {
          title: "UX Fundamentals",
          description: "Learn the basics of user experience design",
          completed: false,
          nodes: [
            { title: "User Research", completed: false },
            { title: "Wireframing", completed: false },
            { title: "Prototyping", completed: false }
          ]
        },
        {
          title: "UI Design",
          description: "Learn user interface design",
          completed: false,
          nodes: [
            { title: "Visual Design", completed: false },
            { title: "Interaction Design", completed: false },
            { title: "Design Systems", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Game Developer",
    description: "Learn to create video games for various platforms and devices.",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "9-15 months",
    content: {
      sections: [
        {
          title: "Game Development Basics",
          description: "Learn the fundamentals of game development",
          completed: false,
          nodes: [
            { title: "Game Engines", completed: false },
            { title: "Game Design", completed: false },
            { title: "Programming for Games", completed: false }
          ]
        },
        {
          title: "Game Graphics & Audio",
          description: "Learn about game graphics and audio",
          completed: false,
          nodes: [
            { title: "2D/3D Graphics", completed: false },
            { title: "Animation", completed: false },
            { title: "Sound Design", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Technical Writer",
    description: "Learn to create clear, concise technical documentation for software and products.",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "4-8 months",
    content: {
      sections: [
        {
          title: "Technical Writing Basics",
          description: "Learn the fundamentals of technical writing",
          completed: false,
          nodes: [
            { title: "Writing Principles", completed: false },
            { title: "Documentation Types", completed: false },
            { title: "Style Guides", completed: false }
          ]
        },
        {
          title: "Advanced Technical Writing",
          description: "Learn advanced technical writing skills",
          completed: false,
          nodes: [
            { title: "API Documentation", completed: false },
            { title: "User Guides", completed: false },
            { title: "Technical Blog Posts", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "MLOps Engineer",
    description: "Learn to operationalize machine learning models and manage ML infrastructure.",
    type: "role",
    difficulty: "advanced",
    estimatedTime: "9-15 months",
    content: {
      sections: [
        {
          title: "MLOps Fundamentals",
          description: "Learn the basics of MLOps",
          completed: false,
          nodes: [
            { title: "ML Lifecycle", completed: false },
            { title: "Model Versioning", completed: false },
            { title: "CI/CD for ML", completed: false }
          ]
        },
        {
          title: "ML Deployment",
          description: "Learn to deploy ML models",
          completed: false,
          nodes: [
            { title: "Model Serving", completed: false },
            { title: "Monitoring", completed: false },
            { title: "Scaling ML Systems", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Product Manager",
    description: "Learn to lead the development of products from conception to launch.",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "6-12 months",
    content: {
      sections: [
        {
          title: "Product Management Basics",
          description: "Learn the fundamentals of product management",
          completed: false,
          nodes: [
            { title: "Product Discovery", completed: false },
            { title: "Roadmapping", completed: false },
            { title: "User Stories", completed: false }
          ]
        },
        {
          title: "Product Development",
          description: "Learn about product development",
          completed: false,
          nodes: [
            { title: "Agile Development", completed: false },
            { title: "Product Metrics", completed: false },
            { title: "Go-to-Market Strategy", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Engineering Manager",
    description: "Learn to lead and manage teams of software engineers.",
    type: "role",
    difficulty: "advanced",
    estimatedTime: "12-24 months",
    content: {
      sections: [
        {
          title: "Engineering Leadership",
          description: "Learn the basics of engineering leadership",
          completed: false,
          nodes: [
            { title: "Team Building", completed: false },
            { title: "Technical Leadership", completed: false },
            { title: "Performance Management", completed: false }
          ]
        },
        {
          title: "Project Management",
          description: "Learn project management for engineering",
          completed: false,
          nodes: [
            { title: "Agile Methodologies", completed: false },
            { title: "Resource Planning", completed: false },
            { title: "Risk Management", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "Developer Relations",
    description: "Learn to build relationships with developers and promote developer adoption.",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "6-12 months",
    content: {
      sections: [
        {
          title: "DevRel Basics",
          description: "Learn the fundamentals of developer relations",
          completed: false,
          nodes: [
            { title: "Developer Advocacy", completed: false },
            { title: "Community Building", completed: false },
            { title: "Technical Content Creation", completed: false }
          ]
        },
        {
          title: "DevRel Strategy",
          description: "Learn to create developer relations strategies",
          completed: false,
          nodes: [
            { title: "Developer Marketing", completed: false },
            { title: "Developer Experience", completed: false },
            { title: "Event Planning", completed: false }
          ]
        }
      ]
    }
  },
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