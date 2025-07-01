import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { registerEnhancedFeatures } from "./routes/enhanced-features";
import { z } from "zod";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { 
  insertRoadmapSchema, 
  insertBookmarkSchema, 
  insertUserProgressSchema, 
  insertActivityLogSchema,
  insertCommentSchema,
  insertDiscussionTopicSchema,
  insertDiscussionReplySchema,
  insertResourceSchema,
  insertRoadmapNodeResourceSchema,
  insertCommentReactionSchema,
  // New schemas for Terraform lab integration
  insertLabEnvironmentSchema,
  insertLabInstanceSchema,
  insertLabTaskSchema,
  insertUserLabTaskProgressSchema,
  insertLabResourceSchema,
  // New schemas for LMS enhancements
  insertCourseSchema,
  insertCourseModuleSchema,
  insertCourseContentItemSchema,
  insertCourseEnrollmentSchema,
  insertContentProgressSchema,
  insertCertificateSchema,
  // RBAC schemas
  insertRoleSchema,
  insertUserRoleSchema,
  // User schema
  insertUserSchema
} from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  
  // Health check endpoint for Docker
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "Learning Management System",
      database: "connected"
    });
  });
  
  // Register enhanced learner and admin features
  registerEnhancedFeatures(app);

  // Middleware to verify authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Middleware to verify admin status
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Not authorized - admin access required" });
    }
    next();
  };

  // ============================================================================
  // ADMIN API ROUTES
  // ============================================================================

  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      return res.status(200).json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      return res.status(500).json({ message: "Failed to get users" });
    }
  });

  // Get user details (admin only)
  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get additional user information
      const progress = await storage.getUserProgress(userId);
      const roles = await storage.getUserRoles(userId);
      const experience = await storage.getUserExperience(userId);
      const badges = await storage.getUserBadges(userId);
      
      return res.status(200).json({
        user,
        progress,
        roles,
        experience,
        badges
      });
    } catch (error) {
      console.error("Error getting user details:", error);
      return res.status(500).json({ message: "Failed to get user details" });
    }
  });

  // Create a new user (admin only)
  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user (admin only)
  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const updates = req.body;
      
      // If password is being updated, hash it
      if (updates.password) {
        updates.password = await hashPassword(updates.password);
      }

      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // ============================================================================
  // ADMIN CONTENT MANAGEMENT ROUTES
  // ============================================================================

  // Get all content for admin management
  app.get("/api/admin/content", requireAdmin, async (req, res) => {
    try {
      const { search, status, type } = req.query;
      
      // Get all content types
      const roadmaps = await storage.getRoadmaps();
      const courses = await storage.getCourses();
      const labEnvironments = await storage.getLabEnvironments();
      
      // Format as content items with unique IDs per type
      const contentItems = [
        ...roadmaps.map(r => ({
          id: `roadmap-${r.id}`,
          contentId: r.id,
          title: r.title,
          description: r.description,
          type: "roadmap" as const,
          difficulty: r.difficulty,
          status: "published",
          tags: [],
          categories: [],
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          creatorId: 1,
          enrollmentCount: 0,
          completionRate: 0
        })),
        ...courses.map(c => ({
          id: `course-${c.id}`,
          contentId: c.id,
          title: c.title,
          description: c.description,
          type: "course" as const,
          difficulty: c.difficulty || "beginner",
          status: c.status || "published",
          tags: c.tags || [],
          categories: [],
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          creatorId: c.creatorId || 1,
          enrollmentCount: 0,
          completionRate: 0
        })),
        ...labEnvironments.map(l => ({
          id: `lab-${l.id}`,
          contentId: l.id,
          title: l.name,
          description: l.description,
          type: "lab" as const,
          difficulty: l.difficulty || "beginner",
          status: l.isActive ? "published" : "draft",
          tags: l.tags || [],
          categories: [],
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
          creatorId: 1,
          enrollmentCount: 0,
          completionRate: 0
        }))
      ];

      // Apply filters
      let filteredItems = contentItems;
      
      if (search) {
        filteredItems = filteredItems.filter(item => 
          item.title.toLowerCase().includes((search as string).toLowerCase()) ||
          item.description.toLowerCase().includes((search as string).toLowerCase())
        );
      }
      
      if (type && type !== "all") {
        filteredItems = filteredItems.filter(item => item.type === type);
      }
      
      return res.status(200).json(filteredItems);
    } catch (error) {
      console.error("Error fetching admin content:", error);
      return res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Create new content (admin only)
  app.post("/api/admin/content", requireAdmin, async (req, res) => {
    try {
      const { type, ...contentData } = req.body;
      
      let newContent;
      
      switch (type) {
        case "roadmap":
          const roadmapData = insertRoadmapSchema.parse(contentData);
          newContent = await storage.createRoadmap(roadmapData);
          break;
        case "course":
          newContent = await storage.createCourse({
            title: contentData.title,
            description: contentData.description,
            objectives: [],
            prerequisites: [],
            coverImageUrl: null,
            duration: contentData.duration || 60,
            difficulty: contentData.difficulty || "beginner",
            status: "published",
            enrollmentType: "open",
            price: 0,
            creatorId: 1,
            tags: []
          });
          break;
        case "lab":
          newContent = await storage.createLabEnvironment({
            name: contentData.title,
            description: contentData.description,
            difficulty: contentData.difficulty || "beginner",
            estimatedTime: contentData.duration || 60,
            terraformConfigUrl: "https://github.com/example/terraform-config",
            terraformVersion: "1.0.0",
            providerConfig: {},
            variables: {},
            tags: [],
            isActive: true
          });
          break;
        default:
          return res.status(400).json({ message: "Invalid content type" });
      }
      
      return res.status(201).json(newContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid content data", errors: error.errors });
      }
      console.error("Error creating content:", error);
      return res.status(500).json({ message: "Failed to create content" });
    }
  });

  // Update content (admin only)
  app.patch("/api/admin/content/:id", requireAdmin, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const { type, ...updates } = req.body;
      
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      let updatedContent;
      
      switch (type) {
        case "roadmap":
          updatedContent = await storage.updateRoadmap(contentId, updates);
          break;
        case "course":
          updatedContent = await storage.updateCourse(contentId, updates);
          break;
        case "lab":
          updatedContent = await storage.updateLabEnvironment(contentId, updates);
          break;
        default:
          return res.status(400).json({ message: "Invalid content type" });
      }
      
      if (!updatedContent) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      return res.status(200).json(updatedContent);
    } catch (error) {
      console.error("Error updating content:", error);
      return res.status(500).json({ message: "Failed to update content" });
    }
  });

  // Delete content (admin only)
  app.delete("/api/admin/content/:id", requireAdmin, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const { type } = req.query;
      
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      let deleted;
      
      switch (type) {
        case "roadmap":
          deleted = await storage.deleteRoadmap(contentId);
          break;
        case "course":
          deleted = await storage.deleteCourse(contentId);
          break;
        case "lab":
          deleted = await storage.deleteLabEnvironment(contentId);
          break;
        default:
          return res.status(400).json({ message: "Invalid content type" });
      }
      
      if (!deleted) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      return res.status(200).json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Error deleting content:", error);
      return res.status(500).json({ message: "Failed to delete content" });
    }
  });

  // Update user (admin only)
  app.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const userData = req.body;
      
      // If password is provided, hash it
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Assign roadmap to user (admin only)
  app.post("/api/admin/users/:id/roadmaps", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const roadmapId = parseInt(req.body.roadmapId);
      
      if (isNaN(userId) || isNaN(roadmapId)) {
        return res.status(400).json({ message: "Invalid user ID or roadmap ID" });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if roadmap exists
      const roadmap = await storage.getRoadmap(roadmapId);
      if (!roadmap) {
        return res.status(404).json({ message: "Roadmap not found" });
      }
      
      // Check if user already has this roadmap
      const existingProgress = await storage.getUserProgress(userId, roadmapId);
      if (existingProgress.length > 0) {
        return res.status(409).json({ message: "User already has this roadmap assigned" });
      }
      
      // Create initial progress entry
      const progress = await storage.createUserProgress({
        userId,
        roadmapId,
        progress: {
          sections: roadmap.content.sections.map((section: any) => ({
            ...section,
            nodes: section.nodes.map((node: any) => ({
              ...node,
              completed: false,
              inProgress: false
            }))
          }))
        }
      });
      
      // Log activity
      await storage.createActivityLog({
        userId,
        roadmapId,
        action: 'roadmap_assigned',
        details: { assignedBy: req.user.id },
        timestamp: new Date(),
        duration: 0
      });
      
      return res.status(201).json({ message: "Roadmap assigned successfully", progress });
    } catch (error) {
      console.error("Error assigning roadmap:", error);
      return res.status(500).json({ message: "Failed to assign roadmap" });
    }
  });

  // Generate user progress report (admin only)
  app.get("/api/admin/reports/user-progress", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      const roadmaps = await storage.getRoadmaps();
      
      const report = await Promise.all(
        users.map(async (user) => {
          const progress = await storage.getUserProgress(user.id);
          
          // Calculate completion percentages for each roadmap
          const roadmapProgress = progress.map((p) => {
            const roadmap = roadmaps.find(r => r.id === p.roadmapId);
            if (!roadmap) return null;
            
            const progressData = p.progress;
            
            // Count total and completed nodes
            let totalNodes = 0;
            let completedNodes = 0;
            
            if (progressData.sections) {
              progressData.sections.forEach((section: any) => {
                if (section.nodes) {
                  totalNodes += section.nodes.length;
                  completedNodes += section.nodes.filter((n: any) => n.completed).length;
                }
              });
            }
            
            const completionPercentage = totalNodes > 0 
              ? Math.round((completedNodes / totalNodes) * 100) 
              : 0;
              
            return {
              roadmapId: p.roadmapId,
              roadmapTitle: roadmap.title,
              completionPercentage,
              completedNodes,
              totalNodes,
              lastAccessedAt: p.lastAccessedAt
            };
          }).filter(Boolean);
          
          return {
            userId: user.id,
            username: user.username,
            email: user.email,
            roadmapProgress
          };
        })
      );
      
      return res.status(200).json(report);
    } catch (error) {
      console.error("Error generating user progress report:", error);
      return res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Get learning velocity report - measures how quickly users are progressing (admin only)
  app.get("/api/admin/reports/learning-velocity", requireAdmin, async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      
      // Get user progress data
      const velocityData = await storage.getLearningVelocity();
      
      return res.status(200).json(velocityData);
    } catch (error) {
      console.error("Error generating learning velocity report:", error);
      return res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Get platform statistics (admin only)
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error getting platform stats:", error);
      return res.status(500).json({ message: "Failed to get platform statistics" });
    }
  });

  // Special endpoint for seeding roadmaps (for development purposes)
  app.post("/api/seed-roadmaps", async (req, res) => {
    try {
      const roadmaps = await storage.getRoadmaps();
      if (roadmaps.length === 0) {
        const { sampleRoadmaps } = req.body;
        
        if (!Array.isArray(sampleRoadmaps)) {
          return res.status(400).json({ message: "Invalid roadmap data" });
        }
        
        for (const roadmap of sampleRoadmaps) {
          await storage.createRoadmap(roadmap);
        }
        
        return res.status(201).json({ message: "Roadmaps seeded successfully" });
      } else {
        return res.status(200).json({ message: "Roadmaps already exist, no seeding needed" });
      }
    } catch (error) {
      console.error("Error seeding roadmaps:", error);
      return res.status(500).json({ message: "Failed to seed roadmaps" });
    }
  });

  // Get all roadmaps
  app.get("/api/roadmaps", async (req, res) => {
    const type = req.query.type as string | undefined;
    const roadmaps = await storage.getRoadmaps(type);
    return res.json(roadmaps);
  });

  // Get single roadmap
  app.get("/api/roadmaps/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid roadmap ID" });
    }

    const roadmap = await storage.getRoadmap(id);
    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    return res.json(roadmap);
  });

  // Create new roadmap (admin only)
  app.post("/api/roadmaps", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    try {
      const roadmapData = insertRoadmapSchema.parse(req.body);
      const roadmap = await storage.createRoadmap(roadmapData);
      return res.status(201).json(roadmap);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid roadmap data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create roadmap" });
    }
  });

  // Update roadmap (admin only)
  app.put("/api/roadmaps/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid roadmap ID" });
    }

    try {
      const roadmapData = req.body;
      const updatedRoadmap = await storage.updateRoadmap(id, roadmapData);
      
      if (!updatedRoadmap) {
        return res.status(404).json({ message: "Roadmap not found" });
      }
      
      return res.json(updatedRoadmap);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update roadmap" });
    }
  });

  // Delete roadmap (admin only)
  app.delete("/api/roadmaps/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid roadmap ID" });
    }

    const success = await storage.deleteRoadmap(id);
    if (!success) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    return res.status(204).send();
  });

  // Get user's bookmarks
  app.get("/api/bookmarks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const bookmarks = await storage.getBookmarks(req.user.id);
    return res.json(bookmarks);
  });

  // Add bookmark
  app.post("/api/bookmarks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const bookmarkData = insertBookmarkSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check if roadmap exists
      const roadmap = await storage.getRoadmap(bookmarkData.roadmapId);
      if (!roadmap) {
        return res.status(404).json({ message: "Roadmap not found" });
      }

      // Check if bookmark already exists
      const existingBookmark = await storage.getBookmark(req.user.id, bookmarkData.roadmapId);
      if (existingBookmark) {
        return res.status(409).json({ message: "Bookmark already exists" });
      }

      const bookmark = await storage.createBookmark(bookmarkData);
      return res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bookmark data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  // Remove bookmark
  app.delete("/api/bookmarks/:roadmapId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roadmapId = parseInt(req.params.roadmapId);
    if (isNaN(roadmapId)) {
      return res.status(400).json({ message: "Invalid roadmap ID" });
    }

    const success = await storage.deleteBookmark(req.user.id, roadmapId);
    if (!success) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    return res.status(204).send();
  });

  // Get user progress
  app.get("/api/progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roadmapId = req.query.roadmapId ? parseInt(req.query.roadmapId as string) : undefined;
    const progress = await storage.getUserProgress(req.user.id, roadmapId);
    return res.json(progress);
  });

  // Create or update user progress
  app.post("/api/progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check if roadmap exists
      const roadmap = await storage.getRoadmap(progressData.roadmapId);
      if (!roadmap) {
        return res.status(404).json({ message: "Roadmap not found" });
      }

      // Check if progress already exists
      const existingProgress = await storage.getUserProgress(req.user.id, progressData.roadmapId);
      
      if (existingProgress.length > 0) {
        // Update existing progress
        const updatedProgress = await storage.updateUserProgress(
          req.user.id, 
          progressData.roadmapId, 
          { progress: progressData.progress }
        );
        return res.json(updatedProgress);
      } else {
        // Create new progress entry
        const progress = await storage.createUserProgress(progressData);
        
        // Broadcast progress update for new progress entries
        if (app.locals.broadcastProgressUpdate) {
          app.locals.broadcastProgressUpdate(req.user.id, {
            type: 'progress_created',
            roadmapId: progressData.roadmapId,
            progress: progressData.progress,
            progressRecord: progress
          });
        }
        
        return res.status(201).json(progress);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to save progress" });
    }
  });

  // Record activity log
  app.post("/api/activity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const activityData = insertActivityLogSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check if roadmap exists
      const roadmap = await storage.getRoadmap(activityData.roadmapId);
      if (!roadmap) {
        return res.status(404).json({ message: "Roadmap not found" });
      }

      const activity = await storage.createActivityLog(activityData);
      return res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to record activity" });
    }
  });

  // Get user activity logs
  app.get("/api/activity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const days = req.query.days ? parseInt(req.query.days as string) : undefined;
    const activities = await storage.getActivityLogs(req.user.id, days);
    return res.json(activities);
  });

  // ===========================================================================
  // COMMENTS API ROUTES
  // ===========================================================================

  // Get comments for a specific roadmap node
  app.get("/api/roadmaps/:roadmapId/nodes/:nodeId/comments", async (req, res) => {
    const roadmapId = parseInt(req.params.roadmapId);
    const nodeId = req.params.nodeId;
    
    if (isNaN(roadmapId)) {
      return res.status(400).json({ message: "Invalid roadmap ID" });
    }

    try {
      const comments = await storage.getComments(roadmapId, nodeId);
      return res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create a new comment
  app.post("/api/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // If roadmapId is provided, check if roadmap exists
      if (commentData.roadmapId) {
        const roadmap = await storage.getRoadmap(commentData.roadmapId);
        if (!roadmap) {
          return res.status(404).json({ message: "Roadmap not found" });
        }
      }

      // If parentId is provided, check if parent comment exists
      if (commentData.parentId) {
        const parentComment = await storage.getCommentById(commentData.parentId);
        if (!parentComment) {
          return res.status(404).json({ message: "Parent comment not found" });
        }
      }

      const comment = await storage.createComment(commentData);
      return res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Update a comment
  app.put("/api/comments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    // Check if comment exists and belongs to the user
    const comment = await storage.getCommentById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own comments" });
    }

    try {
      const content = req.body.content;
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      const updatedComment = await storage.updateComment(id, content);
      return res.json(updatedComment);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update comment" });
    }
  });

  // Delete a comment
  app.delete("/api/comments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    // Check if comment exists and belongs to the user
    const comment = await storage.getCommentById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own comments" });
    }

    const success = await storage.deleteComment(id);
    if (!success) {
      return res.status(500).json({ message: "Failed to delete comment" });
    }

    return res.status(204).send();
  });

  // Get replies to a comment
  app.get("/api/comments/:id/replies", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    try {
      const replies = await storage.getCommentReplies(id);
      return res.json(replies);
    } catch (error) {
      console.error("Error fetching comment replies:", error);
      return res.status(500).json({ message: "Failed to fetch comment replies" });
    }
  });

  // Add a reaction to a comment
  app.post("/api/comments/:id/reactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    try {
      const reactionData = insertCommentReactionSchema.parse({
        userId: req.user.id,
        commentId,
        reaction: req.body.reaction
      });

      // Check if comment exists
      const comment = await storage.getCommentById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      const reaction = await storage.addCommentReaction(reactionData);
      return res.status(201).json(reaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reaction data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  // Remove a reaction from a comment
  app.delete("/api/comments/:id/reactions/:reaction", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const reaction = req.params.reaction;
    const success = await storage.removeCommentReaction(req.user.id, commentId, reaction);
    
    if (!success) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    return res.status(204).send();
  });

  // Get reactions for a comment
  app.get("/api/comments/:id/reactions", async (req, res) => {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    try {
      const reactions = await storage.getCommentReactions(commentId);
      return res.json(reactions);
    } catch (error) {
      console.error("Error fetching comment reactions:", error);
      return res.status(500).json({ message: "Failed to fetch comment reactions" });
    }
  });

  // ===========================================================================
  // DISCUSSIONS API ROUTES
  // ===========================================================================

  // Get discussions for a specific roadmap node
  app.get("/api/roadmaps/:roadmapId/nodes/:nodeId/discussions", async (req, res) => {
    const roadmapId = parseInt(req.params.roadmapId);
    const nodeId = req.params.nodeId;
    
    if (isNaN(roadmapId)) {
      return res.status(400).json({ message: "Invalid roadmap ID" });
    }

    try {
      const discussions = await storage.getDiscussionTopics(roadmapId, nodeId);
      return res.json(discussions);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      return res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });

  // Create a new discussion topic
  app.post("/api/discussions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const topicData = insertDiscussionTopicSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // If roadmapId is provided, check if roadmap exists
      if (topicData.roadmapId) {
        const roadmap = await storage.getRoadmap(topicData.roadmapId);
        if (!roadmap) {
          return res.status(404).json({ message: "Roadmap not found" });
        }
      }

      const topic = await storage.createDiscussionTopic(topicData);
      return res.status(201).json(topic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid discussion data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create discussion topic" });
    }
  });

  // Get a specific discussion topic
  app.get("/api/discussions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid discussion ID" });
    }

    try {
      const topic = await storage.getDiscussionTopicById(id);
      if (!topic) {
        return res.status(404).json({ message: "Discussion topic not found" });
      }

      // Increment view count
      await storage.incrementTopicViewCount(id);
      
      return res.json(topic);
    } catch (error) {
      console.error("Error fetching discussion topic:", error);
      return res.status(500).json({ message: "Failed to fetch discussion topic" });
    }
  });

  // Update a discussion topic
  app.put("/api/discussions/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid discussion ID" });
    }

    // Check if topic exists and belongs to the user
    const topic = await storage.getDiscussionTopicById(id);
    if (!topic) {
      return res.status(404).json({ message: "Discussion topic not found" });
    }

    if (topic.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own discussions" });
    }

    try {
      const topicData = req.body;
      const updatedTopic = await storage.updateDiscussionTopic(id, topicData);
      return res.json(updatedTopic);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update discussion topic" });
    }
  });

  // Delete a discussion topic
  app.delete("/api/discussions/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid discussion ID" });
    }

    // Check if topic exists and belongs to the user
    const topic = await storage.getDiscussionTopicById(id);
    if (!topic) {
      return res.status(404).json({ message: "Discussion topic not found" });
    }

    if (topic.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own discussions" });
    }

    const success = await storage.deleteDiscussionTopic(id);
    if (!success) {
      return res.status(500).json({ message: "Failed to delete discussion topic" });
    }

    return res.status(204).send();
  });

  // Get replies to a discussion topic
  app.get("/api/discussions/:id/replies", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid discussion ID" });
    }

    try {
      const replies = await storage.getDiscussionReplies(id);
      return res.json(replies);
    } catch (error) {
      console.error("Error fetching discussion replies:", error);
      return res.status(500).json({ message: "Failed to fetch discussion replies" });
    }
  });

  // Create a reply to a discussion topic
  app.post("/api/discussions/:id/replies", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const topicId = parseInt(req.params.id);
    if (isNaN(topicId)) {
      return res.status(400).json({ message: "Invalid discussion ID" });
    }

    try {
      const replyData = insertDiscussionReplySchema.parse({
        topicId,
        userId: req.user.id,
        content: req.body.content
      });

      // Check if topic exists
      const topic = await storage.getDiscussionTopicById(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Discussion topic not found" });
      }

      const reply = await storage.createDiscussionReply(replyData);
      return res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reply data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create reply" });
    }
  });

  // Update a discussion reply
  app.put("/api/discussions/replies/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid reply ID" });
    }

    // Check if reply exists and belongs to the user
    const reply = await storage.getDiscussionReplyById(id);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (reply.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own replies" });
    }

    try {
      const content = req.body.content;
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: "Reply content is required" });
      }

      const updatedReply = await storage.updateDiscussionReply(id, content);
      return res.json(updatedReply);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update reply" });
    }
  });

  // Delete a discussion reply
  app.delete("/api/discussions/replies/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid reply ID" });
    }

    // Check if reply exists and belongs to the user
    const reply = await storage.getDiscussionReplyById(id);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (reply.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own replies" });
    }

    const success = await storage.deleteDiscussionReply(id);
    if (!success) {
      return res.status(500).json({ message: "Failed to delete reply" });
    }

    return res.status(204).send();
  });

  // Mark a reply as accepted answer
  app.put("/api/discussions/replies/:id/accept", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid reply ID" });
    }

    // Get reply to find the topic
    const reply = await storage.getDiscussionReplyById(id);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Get topic to check if user is the topic creator (only topic creator can accept answers)
    const topic = await storage.getDiscussionTopicById(reply.topicId);
    if (!topic) {
      return res.status(404).json({ message: "Discussion topic not found" });
    }

    if (topic.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Only the topic creator can accept answers" });
    }

    try {
      const updatedReply = await storage.markReplyAsAccepted(id);
      return res.json(updatedReply);
    } catch (error) {
      return res.status(500).json({ message: "Failed to mark reply as accepted" });
    }
  });

  // ===========================================================================
  // RESOURCES API ROUTES
  // ===========================================================================

  // Get resources for a specific roadmap node
  app.get("/api/roadmaps/:roadmapId/nodes/:nodeId/resources", async (req, res) => {
    const roadmapId = parseInt(req.params.roadmapId);
    const nodeId = req.params.nodeId;
    
    if (isNaN(roadmapId)) {
      return res.status(400).json({ message: "Invalid roadmap ID" });
    }

    try {
      const resources = await storage.getRoadmapNodeResources(roadmapId, nodeId);
      return res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      return res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  // Create a new resource
  app.post("/api/resources", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only admins can create global resources
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    try {
      const resourceData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(resourceData);
      return res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create resource" });
    }
  });

  // Add a resource to a roadmap node
  app.post("/api/roadmaps/:roadmapId/nodes/:nodeId/resources", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roadmapId = parseInt(req.params.roadmapId);
    const nodeId = req.params.nodeId;
    const resourceId = req.body.resourceId;
    const order = req.body.order || 0;
    
    if (isNaN(roadmapId) || isNaN(resourceId)) {
      return res.status(400).json({ message: "Invalid roadmap or resource ID" });
    }

    try {
      // Check if roadmap exists
      const roadmap = await storage.getRoadmap(roadmapId);
      if (!roadmap) {
        return res.status(404).json({ message: "Roadmap not found" });
      }

      // Check if resource exists
      const resource = await storage.getResourceById(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      const nodeResourceData = insertRoadmapNodeResourceSchema.parse({
        roadmapId,
        nodeId,
        resourceId,
        order
      });

      const nodeResource = await storage.addResourceToNode(nodeResourceData);
      return res.status(201).json(nodeResource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to add resource to node" });
    }
  });

  // Remove a resource from a roadmap node
  app.delete("/api/roadmaps/:roadmapId/nodes/:nodeId/resources/:resourceId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roadmapId = parseInt(req.params.roadmapId);
    const nodeId = req.params.nodeId;
    const resourceId = parseInt(req.params.resourceId);
    
    if (isNaN(roadmapId) || isNaN(resourceId)) {
      return res.status(400).json({ message: "Invalid roadmap or resource ID" });
    }

    // Only admins can remove resources from nodes
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    const success = await storage.removeResourceFromNode(roadmapId, nodeId, resourceId);
    if (!success) {
      return res.status(404).json({ message: "Resource not found on this node" });
    }

    return res.status(204).send();
  });

  // Get all resources (filtered by type)
  app.get("/api/resources", async (req, res) => {
    const type = req.query.type as string | undefined;
    const resources = await storage.getResources(type);
    return res.json(resources);
  });

  // ======== ADMIN ANALYTICS ENDPOINTS ========

  // Get platform statistics - requires admin authentication
  app.get("/api/admin/statistics", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error getting platform statistics:", error);
      return res.status(500).json({ message: "Failed to get platform statistics" });
    }
  });

  // Get user engagement metrics over time - requires admin authentication
  app.get("/api/admin/engagement", requireAdmin, async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const engagement = await storage.getUserEngagement(days);
      return res.status(200).json(engagement);
    } catch (error) {
      console.error("Error getting user engagement:", error);
      return res.status(500).json({ message: "Failed to get user engagement" });
    }
  });

  // Get learning velocity metrics - requires admin authentication
  app.get("/api/admin/learning-velocity", requireAdmin, async (req, res) => {
    try {
      const velocity = await storage.getLearningVelocity();
      return res.status(200).json(velocity);
    } catch (error) {
      console.error("Error getting learning velocity:", error);
      return res.status(500).json({ message: "Failed to get learning velocity" });
    }
  });

  // Get roadmap popularity metrics - requires admin authentication
  app.get("/api/admin/roadmap-popularity", requireAdmin, async (req, res) => {
    try {
      const popularity = await storage.getRoadmapPopularity();
      return res.status(200).json(popularity);
    } catch (error) {
      console.error("Error getting roadmap popularity:", error);
      return res.status(500).json({ message: "Failed to get roadmap popularity" });
    }
  });
  
  // Get experience breakdown and progression metrics - requires admin authentication
  app.get("/api/admin/experience-progression", requireAdmin, async (req, res) => {
    try {
      const progression = await storage.getExperienceProgression();
      return res.status(200).json(progression);
    } catch (error) {
      console.error("Error getting experience progression:", error);
      return res.status(500).json({ message: "Failed to get experience progression" });
    }
  });

  // Get active users data - requires admin authentication
  app.get("/api/admin/active-users", requireAdmin, async (req, res) => {
    try {
      const period = req.query.period as string || "week"; // day, week, month
      const activeUsers = await storage.getActiveUsers(period);
      return res.status(200).json(activeUsers);
    } catch (error) {
      console.error("Error getting active users:", error);
      return res.status(500).json({ message: "Failed to get active users" });
    }
  });

  // Create HTTP server and return it for setup in index.ts
  const httpServer = createServer(app);
  return httpServer;
}
