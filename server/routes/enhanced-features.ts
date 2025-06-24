import type { Express } from "express";
import { storage } from "../storage";

export function registerEnhancedFeatures(app: Express) {
  
  // My Enrollments API - Get user's enrolled content
  app.get("/api/my-enrollments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      
      // Get course enrollments
      const courseEnrollments = await storage.getCourseEnrollments(userId);
      
      // Get roadmap progress (acts as enrollment)
      const roadmapProgress = await storage.getUserProgress(userId);
      
      // Get lab instances
      const labInstances = await storage.getUserLabInstances(userId);
      
      // Get user assignments
      const assignments = await storage.getUserAssignments(userId);
      
      res.json({
        courses: courseEnrollments,
        roadmaps: roadmapProgress,
        labs: labInstances,
        assignments: assignments
      });
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  });

  // Global Search API
  app.get("/api/search", async (req, res) => {
    try {
      const { q, type, difficulty, tags, categories, duration, status } = req.query;
      
      const searchFilters = {
        query: q as string,
        type: typeof type === 'string' ? [type] : (type as string[]) || [],
        difficulty: typeof difficulty === 'string' ? [difficulty] : (difficulty as string[]) || [],
        tags: typeof tags === 'string' ? [tags] : (tags as string[]) || [],
        categories: typeof categories === 'string' ? [categories] : (categories as string[]) || [],
        duration: duration as string,
        status: status as string
      };
      
      // Search across multiple content types
      const results = await storage.searchContent(searchFilters);
      
      res.json(results);
    } catch (error) {
      console.error("Error searching content:", error);
      res.status(500).json({ error: "Failed to search content" });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Self-enrollment API
  app.post("/api/enroll", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const { contentType, contentId } = req.body;
      
      let enrollment;
      
      switch (contentType) {
        case 'course':
          enrollment = await storage.enrollInCourse(userId, contentId);
          break;
        case 'roadmap':
          enrollment = await storage.startRoadmap(userId, contentId);
          break;
        case 'lab':
          enrollment = await storage.createLabInstance({
            userId,
            environmentId: contentId,
            state: 'provisioning'
          });
          break;
        default:
          return res.status(400).json({ error: "Invalid content type" });
      }
      
      res.json(enrollment);
    } catch (error) {
      console.error("Error enrolling user:", error);
      res.status(500).json({ error: "Failed to enroll" });
    }
  });

  // Continue learning API
  app.post("/api/continue-learning", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { type, id } = req.body;
      
      // Return appropriate redirect URL
      let redirectUrl;
      switch (type) {
        case 'course':
          redirectUrl = `/courses/${id}`;
          break;
        case 'roadmap':
          redirectUrl = `/roadmaps/${id}`;
          break;
        case 'lab':
          redirectUrl = `/labs/${id}`;
          break;
        default:
          return res.status(400).json({ error: "Invalid content type" });
      }
      
      res.json({ redirectUrl });
    } catch (error) {
      console.error("Error continuing learning:", error);
      res.status(500).json({ error: "Failed to continue learning" });
    }
  });

  // Admin Content Management APIs
  app.get("/api/admin/content", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const { search, status, type } = req.query;
      
      const filters = {
        search: search as string,
        status: status as string,
        type: type as string
      };
      
      const content = await storage.getContentForAdmin(filters);
      res.json(content);
    } catch (error) {
      console.error("Error fetching admin content:", error);
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.post("/api/admin/content", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const contentData = { ...req.body, creatorId: req.user!.id };
      
      let content;
      switch (req.body.type) {
        case 'course':
          content = await storage.createCourse(contentData);
          break;
        case 'roadmap':
          content = await storage.createRoadmap(contentData);
          break;
        case 'lab':
          content = await storage.createLabEnvironment(contentData);
          break;
        case 'training':
          // Training content can be handled as a special type of course
          content = await storage.createCourse({ ...contentData, type: 'training' });
          break;
        default:
          return res.status(400).json({ error: "Invalid content type" });
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(500).json({ error: "Failed to create content" });
    }
  });

  app.patch("/api/admin/content/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Update content based on type
      const content = await storage.updateContent(id, updates);
      res.json(content);
    } catch (error) {
      console.error("Error updating content:", error);
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  app.delete("/api/admin/content/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const id = parseInt(req.params.id);
      
      const deleted = await storage.deleteContent(id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // Enhanced Assignment Management APIs
  app.get("/api/admin/assignments", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const { search } = req.query;
      const assignments = await storage.getAssignments({ search: search as string });
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  app.post("/api/admin/assignments", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const assignmentData = { ...req.body, assignerUserId: req.user!.id };
      const assignment = await storage.createAssignment(assignmentData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ error: "Failed to create assignment" });
    }
  });

  app.post("/api/admin/assignments/bulk-assign", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const { assignmentId, userIds } = req.body;
      
      const userAssignments = [];
      for (const userId of userIds) {
        const userAssignment = await storage.createUserAssignment({
          assignmentId,
          userId,
          status: 'assigned'
        });
        userAssignments.push(userAssignment);
      }
      
      res.json(userAssignments);
    } catch (error) {
      console.error("Error bulk assigning:", error);
      res.status(500).json({ error: "Failed to bulk assign" });
    }
  });

  app.get("/api/admin/user-assignments", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const { status } = req.query;
      const filters = { status: status as string };
      const userAssignments = await storage.getUserAssignmentsForAdmin(filters);
      res.json(userAssignments);
    } catch (error) {
      console.error("Error fetching user assignments:", error);
      res.status(500).json({ error: "Failed to fetch user assignments" });
    }
  });

  app.patch("/api/admin/user-assignments/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const userAssignment = await storage.updateUserAssignment(id, updates);
      res.json(userAssignment);
    } catch (error) {
      console.error("Error updating user assignment:", error);
      res.status(500).json({ error: "Failed to update assignment" });
    }
  });

  // Lab Management APIs
  app.post("/api/labs/:id/start", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const environmentId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if user already has a running instance
      const existingInstances = await storage.getUserLabInstances(userId);
      const runningInstance = existingInstances.find(instance => 
        instance.environmentId === environmentId && instance.state === 'running'
      );
      
      if (runningInstance) {
        return res.json(runningInstance);
      }
      
      // Create new lab instance
      const instance = await storage.createLabInstance({
        userId,
        environmentId,
        state: 'provisioning'
      });
      
      // Simulate lab provisioning (in real implementation, this would trigger actual infrastructure)
      setTimeout(async () => {
        await storage.updateLabInstanceState(instance.id, 'running');
      }, 3000);
      
      res.json(instance);
    } catch (error) {
      console.error("Error starting lab:", error);
      res.status(500).json({ error: "Failed to start lab" });
    }
  });

  app.post("/api/labs/:id/stop", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const instanceId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify user owns this instance
      const instance = await storage.getLabInstance(instanceId);
      if (!instance || instance.userId !== userId) {
        return res.sendStatus(403);
      }
      
      // Stop the lab instance
      const updatedInstance = await storage.updateLabInstanceState(instanceId, 'stopped');
      res.json(updatedInstance);
    } catch (error) {
      console.error("Error stopping lab:", error);
      res.status(500).json({ error: "Failed to stop lab" });
    }
  });

  // Enhanced reporting APIs
  app.get("/api/admin/reports/active-users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const { days = 7 } = req.query;
      const report = await storage.getActiveUsersReport(parseInt(days as string));
      res.json(report);
    } catch (error) {
      console.error("Error generating active users report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  app.get("/api/admin/reports/completions", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const { startDate, endDate, contentType } = req.query;
      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        contentType: contentType as string
      };
      
      const report = await storage.getCompletionsReport(filters);
      res.json(report);
    } catch (error) {
      console.error("Error generating completions report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  app.get("/api/admin/reports/velocity", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const report = await storage.getVelocityReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating velocity report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  app.get("/api/admin/reports/lab-usage", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const report = await storage.getLabUsageReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating lab usage report:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });
}