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

export async function seedDemoData() {
  console.log("Starting to seed demo data...");
  
  // Make sure admin user exists
  await createAdminUserIfNotExists();
  
  // Check if we already have users
  const existingUsers = await storage.getUsers();
  if (existingUsers.length > 2) {
    console.log("Demo data already exists. Skipping seed.");
    return;
  }
  
  // Create demo users
  const demoUsers = [
    {
      username: "sarah_developer",
      email: "sarah@example.com",
      password: "password123",
      isAdmin: false
    },
    {
      username: "john_learner",
      email: "john@example.com",
      password: "password123",
      isAdmin: false
    },
    {
      username: "emma_student",
      email: "emma@example.com",
      password: "password123",
      isAdmin: false
    },
    {
      username: "alex_engineer",
      email: "alex@example.com",
      password: "password123",
      isAdmin: false
    }
  ];
  
  const createdUsers = [];
  
  for (const user of demoUsers) {
    const hashedPassword = await hashPassword(user.password);
    const existingUser = await storage.getUserByUsername(user.username);
    
    if (existingUser) {
      console.log(`User ${user.username} already exists.`);
      createdUsers.push(existingUser);
      continue;
    }
    
    const createdUser = await storage.createUser({
      ...user,
      password: hashedPassword
    });
    
    console.log(`Created user: ${createdUser.username}`);
    createdUsers.push(createdUser);
  }
  
  // Get all roadmaps
  const roadmaps = await storage.getRoadmaps();
  if (roadmaps.length === 0) {
    console.log("No roadmaps found. Please seed roadmaps first.");
    return;
  }
  
  // Assign roadmaps to users with different progress levels
  for (const user of createdUsers) {
    // Assign 2-3 random roadmaps to each user
    const userRoadmaps = getRandomItems(roadmaps, 2 + Math.floor(Math.random() * 2));
    
    for (const roadmap of userRoadmaps) {
      // Check if user already has this roadmap
      const existingProgress = await storage.getUserProgress(user.id, roadmap.id);
      if (existingProgress.length > 0) {
        console.log(`User ${user.username} already has roadmap ${roadmap.title}.`);
        continue;
      }
      
      // Initialize progress structure
      let sections = [];
      if (roadmap.content && roadmap.content.sections) {
        sections = roadmap.content.sections.map((section: any) => {
          const completionRate = Math.random(); // Random completion rate between 0 and 1
          
          return {
            title: section.title,
            nodes: section.nodes.map((node: any, index: number) => {
              // Make some nodes completed based on the random completion rate
              // Earlier nodes are more likely to be completed
              const nodePosition = index / section.nodes.length;
              const isCompleted = nodePosition < completionRate;
              const isInProgress = !isCompleted && Math.random() > 0.7;
              
              return {
                id: node.id,
                completed: isCompleted,
                inProgress: isInProgress
              };
            })
          };
        });
      }
      
      // Create progress record
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Started 0-30 days ago
      
      const lastAccessDate = new Date();
      lastAccessDate.setDate(lastAccessDate.getDate() - Math.floor(Math.random() * 7)); // Last accessed 0-7 days ago
      
      await storage.createUserProgress({
        userId: user.id,
        roadmapId: roadmap.id,
        progress: { sections },
        startedAt: startDate.toISOString(),
        lastAccessedAt: lastAccessDate.toISOString()
      });
      
      console.log(`Assigned roadmap ${roadmap.title} to user ${user.username}.`);
      
      // Create some activity logs
      const activityTypes = ['start_roadmap', 'complete_node', 'view_roadmap'];
      const activityCount = 5 + Math.floor(Math.random() * 15); // 5-20 activities
      
      for (let i = 0; i < activityCount; i++) {
        const activityDate = new Date();
        activityDate.setDate(activityDate.getDate() - Math.floor(Math.random() * 14)); // Activity in last 14 days
        
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const duration = Math.floor(Math.random() * 30) * 60; // 0-30 minutes in seconds
        
        await storage.createActivityLog({
          userId: user.id,
          roadmapId: roadmap.id,
          action: activityType,
          timestamp: activityDate,
          duration
        });
      }
    }
    
    // Create user experience
    const userExperience = await storage.getUserExperience(user.id);
    if (!userExperience) {
      await storage.createUserExperience({
        userId: user.id,
        totalXp: 100 + Math.floor(Math.random() * 900), // 100-1000 XP
        level: 1 + Math.floor(Math.random() * 5), // Level 1-5
        currentLevelXp: Math.floor(Math.random() * 200), // 0-200 XP in current level
        nextLevelXp: 500,
        lastUpdated: new Date().toISOString()
      });
    }
  }
  
  console.log("Demo data seeding completed.");
}

// Helper function to get random items from an array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}