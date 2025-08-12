import { Roadmap } from "@shared/schema";

// Comprehensive collection of technology roadmaps
export const comprehensiveRoadmaps: Partial<Roadmap>[] = [
  // Mobile Development
  {
    title: "Android Developer",
    description: "Complete guide to native Android app development with Kotlin and Java",
    type: "role",
    difficulty: "intermediate", 
    estimatedTime: "6-8 months",
    content: {
      sections: [
        {
          title: "Fundamentals",
          nodes: [
            { id: "java-kotlin", title: "Java/Kotlin Basics", type: "concept", completed: false },
            { id: "android-studio", title: "Android Studio Setup", type: "tool", completed: false },
            { id: "app-components", title: "App Components", type: "concept", completed: false },
            { id: "activities-fragments", title: "Activities & Fragments", type: "concept", completed: false }
          ]
        },
        {
          title: "UI Development", 
          nodes: [
            { id: "xml-layouts", title: "XML Layouts", type: "concept", completed: false },
            { id: "material-design", title: "Material Design", type: "framework", completed: false },
            { id: "recyclerview", title: "RecyclerView", type: "concept", completed: false },
            { id: "navigation", title: "Navigation Component", type: "library", completed: false }
          ]
        }
      ]
    }
  },
  {
    title: "iOS Developer", 
    description: "Master iOS app development with Swift and SwiftUI",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "6-8 months",
    content: {
      sections: [
        {
          title: "Swift Fundamentals",
          nodes: [
            { id: "swift-basics", title: "Swift Language Basics", type: "concept", completed: false },
            { id: "optionals", title: "Optionals & Error Handling", type: "concept", completed: false },
            { id: "protocols", title: "Protocols & Generics", type: "concept", completed: false }
          ]
        },
        {
          title: "iOS Development",
          nodes: [
            { id: "uikit", title: "UIKit Framework", type: "framework", completed: false },
            { id: "swiftui", title: "SwiftUI", type: "framework", completed: false },
            { id: "core-data", title: "Core Data", type: "framework", completed: false }
          ]
        }
      ]
    }
  },
  
  // Data Science & AI
  {
    title: "Data Scientist",
    description: "Complete data science roadmap covering statistics, machine learning, and visualization",
    type: "role", 
    difficulty: "advanced",
    estimatedTime: "8-12 months",
    content: {
      sections: [
        {
          title: "Mathematics & Statistics",
          nodes: [
            { id: "statistics", title: "Statistics & Probability", type: "concept", completed: false },
            { id: "linear-algebra", title: "Linear Algebra", type: "concept", completed: false },
            { id: "calculus", title: "Calculus", type: "concept", completed: false }
          ]
        },
        {
          title: "Python for Data Science",
          nodes: [
            { id: "pandas", title: "Pandas", type: "library", completed: false },
            { id: "numpy", title: "NumPy", type: "library", completed: false },
            { id: "matplotlib", title: "Matplotlib", type: "library", completed: false },
            { id: "seaborn", title: "Seaborn", type: "library", completed: false }
          ]
        },
        {
          title: "Machine Learning",
          nodes: [
            { id: "sklearn", title: "Scikit-learn", type: "library", completed: false },
            { id: "tensorflow", title: "TensorFlow", type: "framework", completed: false },
            { id: "pytorch", title: "PyTorch", type: "framework", completed: false }
          ]
        }
      ]
    }
  },
  
  // Backend Technologies
  {
    title: "Go Developer",
    description: "Master Go programming for backend and system development",
    type: "skill",
    difficulty: "intermediate",
    estimatedTime: "4-6 months",
    content: {
      sections: [
        {
          title: "Go Fundamentals", 
          nodes: [
            { id: "syntax", title: "Go Syntax & Types", type: "concept", completed: false },
            { id: "goroutines", title: "Goroutines & Channels", type: "concept", completed: false },
            { id: "interfaces", title: "Interfaces", type: "concept", completed: false }
          ]
        },
        {
          title: "Web Development",
          nodes: [
            { id: "gin", title: "Gin Framework", type: "framework", completed: false },
            { id: "gorm", title: "GORM", type: "library", completed: false },
            { id: "testing", title: "Testing in Go", type: "practice", completed: false }
          ]
        }
      ]
    }
  },
  
  {
    title: "Rust Developer",
    description: "Learn Rust for systems programming and web backend development",
    type: "skill",
    difficulty: "advanced", 
    estimatedTime: "6-8 months",
    content: {
      sections: [
        {
          title: "Rust Fundamentals",
          nodes: [
            { id: "ownership", title: "Ownership & Borrowing", type: "concept", completed: false },
            { id: "structs-enums", title: "Structs & Enums", type: "concept", completed: false },
            { id: "traits", title: "Traits", type: "concept", completed: false }
          ]
        },
        {
          title: "Web Development",
          nodes: [
            { id: "actix", title: "Actix Web", type: "framework", completed: false },
            { id: "diesel", title: "Diesel ORM", type: "library", completed: false },
            { id: "tokio", title: "Tokio Async Runtime", type: "runtime", completed: false }
          ]
        }
      ]
    }
  },

  // Frontend Frameworks
  {
    title: "Vue.js Developer",
    description: "Master Vue.js ecosystem for modern frontend development",
    type: "skill",
    difficulty: "intermediate",
    estimatedTime: "4-6 months", 
    content: {
      sections: [
        {
          title: "Vue Fundamentals",
          nodes: [
            { id: "vue-basics", title: "Vue 3 Basics", type: "framework", completed: false },
            { id: "composition-api", title: "Composition API", type: "concept", completed: false },
            { id: "vue-router", title: "Vue Router", type: "library", completed: false }
          ]
        },
        {
          title: "Vue Ecosystem",
          nodes: [
            { id: "vuex", title: "Vuex/Pinia", type: "library", completed: false },
            { id: "nuxt", title: "Nuxt.js", type: "framework", completed: false },
            { id: "vue-testing", title: "Vue Testing", type: "practice", completed: false }
          ]
        }
      ]
    }
  },

  {
    title: "Angular Developer", 
    description: "Complete Angular framework for enterprise web applications",
    type: "skill",
    difficulty: "advanced",
    estimatedTime: "6-8 months",
    content: {
      sections: [
        {
          title: "Angular Fundamentals",
          nodes: [
            { id: "components", title: "Components & Templates", type: "concept", completed: false },
            { id: "services", title: "Services & Dependency Injection", type: "concept", completed: false },
            { id: "routing", title: "Angular Router", type: "library", completed: false }
          ]
        },
        {
          title: "Advanced Angular",
          nodes: [
            { id: "rxjs", title: "RxJS Observables", type: "library", completed: false },
            { id: "forms", title: "Reactive Forms", type: "concept", completed: false },
            { id: "testing", title: "Angular Testing", type: "practice", completed: false }
          ]
        }
      ]
    }
  },

  // DevOps & Cloud
  {
    title: "Kubernetes Administrator",
    description: "Master container orchestration with Kubernetes",
    type: "skill", 
    difficulty: "advanced",
    estimatedTime: "6-8 months",
    content: {
      sections: [
        {
          title: "Container Fundamentals",
          nodes: [
            { id: "docker-advanced", title: "Advanced Docker", type: "tool", completed: false },
            { id: "k8s-architecture", title: "Kubernetes Architecture", type: "concept", completed: false },
            { id: "pods", title: "Pods & Services", type: "concept", completed: false }
          ]
        },
        {
          title: "Cluster Management",
          nodes: [
            { id: "deployments", title: "Deployments", type: "concept", completed: false },
            { id: "networking", title: "Kubernetes Networking", type: "concept", completed: false },
            { id: "security", title: "Kubernetes Security", type: "concept", completed: false }
          ]
        }
      ]
    }
  },

  {
    title: "Azure Cloud Engineer",
    description: "Master Microsoft Azure cloud services and architecture",
    type: "skill",
    difficulty: "advanced", 
    estimatedTime: "6-8 months",
    content: {
      sections: [
        {
          title: "Azure Fundamentals",
          nodes: [
            { id: "azure-portal", title: "Azure Portal & CLI", type: "tool", completed: false },
            { id: "resource-groups", title: "Resource Groups", type: "concept", completed: false },
            { id: "virtual-machines", title: "Virtual Machines", type: "concept", completed: false }
          ]
        },
        {
          title: "Azure Services",
          nodes: [
            { id: "app-service", title: "App Service", type: "concept", completed: false },
            { id: "azure-sql", title: "Azure SQL Database", type: "database", completed: false },
            { id: "azure-storage", title: "Azure Storage", type: "concept", completed: false }
          ]
        }
      ]
    }
  },

  // Database Technologies
  {
    title: "Database Administrator",
    description: "Master database design, administration, and optimization",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "6-8 months",
    content: {
      sections: [
        {
          title: "SQL Mastery",
          nodes: [
            { id: "advanced-sql", title: "Advanced SQL", type: "concept", completed: false },
            { id: "query-optimization", title: "Query Optimization", type: "practice", completed: false },
            { id: "indexing", title: "Database Indexing", type: "concept", completed: false }
          ]
        },
        {
          title: "Database Systems",
          nodes: [
            { id: "postgresql", title: "PostgreSQL", type: "database", completed: false },
            { id: "mongodb", title: "MongoDB", type: "database", completed: false },
            { id: "redis", title: "Redis", type: "database", completed: false }
          ]
        }
      ]
    }
  },

  // Security
  {
    title: "Cybersecurity Specialist",
    description: "Comprehensive cybersecurity and ethical hacking roadmap",
    type: "role",
    difficulty: "advanced",
    estimatedTime: "8-12 months",
    content: {
      sections: [
        {
          title: "Security Fundamentals",
          nodes: [
            { id: "networking-security", title: "Network Security", type: "concept", completed: false },
            { id: "cryptography", title: "Cryptography", type: "concept", completed: false },
            { id: "risk-assessment", title: "Risk Assessment", type: "practice", completed: false }
          ]
        },
        {
          title: "Penetration Testing",
          nodes: [
            { id: "kali-linux", title: "Kali Linux", type: "os", completed: false },
            { id: "metasploit", title: "Metasploit", type: "tool", completed: false },
            { id: "web-app-security", title: "Web Application Security", type: "practice", completed: false }
          ]
        }
      ]
    }
  },

  // Game Development
  {
    title: "Game Developer",
    description: "Learn game development with modern engines and programming",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "8-10 months",
    content: {
      sections: [
        {
          title: "Game Programming",
          nodes: [
            { id: "csharp", title: "C# Programming", type: "concept", completed: false },
            { id: "game-physics", title: "Game Physics", type: "concept", completed: false },
            { id: "algorithms", title: "Game Algorithms", type: "concept", completed: false }
          ]
        },
        {
          title: "Game Engines",
          nodes: [
            { id: "unity", title: "Unity Engine", type: "framework", completed: false },
            { id: "unreal", title: "Unreal Engine", type: "framework", completed: false },
            { id: "godot", title: "Godot Engine", type: "framework", completed: false }
          ]
        }
      ]
    }
  },

  // Product Management
  {
    title: "Product Manager",
    description: "Strategic product management and user experience design",
    type: "role",
    difficulty: "intermediate",
    estimatedTime: "4-6 months",
    content: {
      sections: [
        {
          title: "Product Strategy",
          nodes: [
            { id: "market-research", title: "Market Research", type: "practice", completed: false },
            { id: "user-personas", title: "User Personas", type: "practice", completed: false },
            { id: "roadmap-planning", title: "Roadmap Planning", type: "practice", completed: false }
          ]
        },
        {
          title: "Analytics & Metrics",
          nodes: [
            { id: "analytics", title: "Product Analytics", type: "practice", completed: false },
            { id: "ab-testing", title: "A/B Testing", type: "practice", completed: false },
            { id: "kpis", title: "KPIs & Metrics", type: "practice", completed: false }
          ]
        }
      ]
    }
  }
];