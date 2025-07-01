import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function createAdminUserIfNotExists() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (!existingAdmin) {
      // Create admin user
      const adminUser = await storage.createUser({
        username: "admin",
        password: await hashPassword("admin123"), // You can change this to a more secure password
        email: "admin@learningplatform.com",
        isAdmin: true
      });
      
      console.log("Admin user created successfully:", adminUser.username);
      
      // Create default roles if they don't exist yet
      try {
        const adminRole = await storage.getRoleByName("Administrator");
        if (!adminRole) {
          await storage.createRole({
            name: "Administrator",
            description: "Full access to all system features",
            permissions: [
              "users:manage", 
              "roadmaps:manage", 
              "courses:manage", 
              "reports:view",
              "labs:manage",
              "roles:manage"
            ]
          });
        }

        const instructorRole = await storage.getRoleByName("Instructor");
        if (!instructorRole) {
          await storage.createRole({
            name: "Instructor",
            description: "Can create and manage courses and monitor student progress",
            permissions: [
              "courses:manage", 
              "users:view", 
              "reports:view",
              "discussions:moderate"
            ]
          });
        }

        const moderatorRole = await storage.getRoleByName("Moderator");
        if (!moderatorRole) {
          await storage.createRole({
            name: "Moderator",
            description: "Can moderate user discussions and content",
            permissions: [
              "discussions:moderate", 
              "comments:moderate", 
              "resources:moderate"
            ]
          });
        }

        const learnerRole = await storage.getRoleByName("Learner");
        if (!learnerRole) {
          await storage.createRole({
            name: "Learner",
            description: "Standard user with learning capabilities",
            permissions: [
              "roadmaps:view", 
              "courses:view", 
              "labs:access", 
              "discussions:participate"
            ]
          });
        }
        
        console.log("Default roles created successfully");
      } catch (error) {
        console.error("Error creating default roles:", error);
      }
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}