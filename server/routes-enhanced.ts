import express from "express";
import { enhancedStorage } from "./storage-enhanced";
import { insertUserSchema, insertRoadmapSchema, insertContentResourceSchema, insertUserAssignmentSchema } from "@shared/schema";
import { z } from "zod";
// Using bcrypt for development, would use proper hashing in production
import bcrypt from "bcryptjs";

const router = express.Router();

// Middleware to check admin privileges
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Admin privileges required" });
  }
  next();
};

// User Management Routes (Admin only)
router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await enhancedStorage.getUsers();
    const usersWithStats = users.map(user => ({
      ...user,
      password: undefined // Don't send passwords
    }));
    res.json(usersWithStats);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/admin/users", requireAdmin, async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    const userData = {
      ...validatedData,
      password: hashedPassword,
      role: validatedData.isAdmin ? "admin" : "learner"
    };

    const newUser = await enhancedStorage.createUser(userData);
    res.json({ ...newUser, password: undefined });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const updates = req.body;
    
    // Hash password if provided
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    // Update role based on isAdmin
    if (typeof updates.isAdmin === "boolean") {
      updates.role = updates.isAdmin ? "admin" : "learner";
    }

    const updatedUser = await enhancedStorage.updateUser(userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ ...updatedUser, password: undefined });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const success = await enhancedStorage.deleteUser(userId);
    
    if (!success) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Roadmap Management Routes
router.get("/admin/roadmaps", requireAdmin, async (req, res) => {
  try {
    const roadmaps = await enhancedStorage.getRoadmaps();
    res.json(roadmaps);
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    res.status(500).json({ error: "Failed to fetch roadmaps" });
  }
});

router.post("/admin/roadmaps", requireAdmin, async (req, res) => {
  try {
    const validatedData = insertRoadmapSchema.parse(req.body);
    const newRoadmap = await enhancedStorage.createRoadmap(validatedData);
    res.json(newRoadmap);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating roadmap:", error);
    res.status(500).json({ error: "Failed to create roadmap" });
  }
});

router.put("/admin/roadmaps/:id", requireAdmin, async (req, res) => {
  try {
    const roadmapId = parseInt(req.params.id);
    const updates = req.body;
    
    const updatedRoadmap = await enhancedStorage.updateRoadmap(roadmapId, updates);
    if (!updatedRoadmap) {
      return res.status(404).json({ error: "Roadmap not found" });
    }
    
    res.json(updatedRoadmap);
  } catch (error) {
    console.error("Error updating roadmap:", error);
    res.status(500).json({ error: "Failed to update roadmap" });
  }
});

router.delete("/admin/roadmaps/:id", requireAdmin, async (req, res) => {
  try {
    const roadmapId = parseInt(req.params.id);
    const success = await enhancedStorage.deleteRoadmap(roadmapId);
    
    if (!success) {
      return res.status(404).json({ error: "Roadmap not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    res.status(500).json({ error: "Failed to delete roadmap" });
  }
});

// Content Resources Management
router.get("/admin/resources", requireAdmin, async (req, res) => {
  try {
    const roadmapId = req.query.roadmapId ? parseInt(req.query.roadmapId as string) : undefined;
    const resources = await enhancedStorage.getContentResources(roadmapId);
    res.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

router.post("/admin/resources", requireAdmin, async (req, res) => {
  try {
    const validatedData = insertContentResourceSchema.parse({
      ...req.body,
      createdBy: req.user.id
    });
    
    const newResource = await enhancedStorage.createContentResource(validatedData);
    res.json(newResource);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating resource:", error);
    res.status(500).json({ error: "Failed to create resource" });
  }
});

router.put("/admin/resources/:id", requireAdmin, async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id);
    const updates = req.body;
    
    const updatedResource = await enhancedStorage.updateContentResource(resourceId, updates);
    if (!updatedResource) {
      return res.status(404).json({ error: "Resource not found" });
    }
    
    res.json(updatedResource);
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ error: "Failed to update resource" });
  }
});

router.delete("/admin/resources/:id", requireAdmin, async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id);
    const success = await enhancedStorage.deleteContentResource(resourceId);
    
    if (!success) {
      return res.status(404).json({ error: "Resource not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ error: "Failed to delete resource" });
  }
});

// User Assignment Management
router.get("/admin/assignments", requireAdmin, async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const assignments = await enhancedStorage.getUserAssignments(userId);
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

router.post("/admin/assignments", requireAdmin, async (req, res) => {
  try {
    const validatedData = insertUserAssignmentSchema.parse({
      ...req.body,
      assignedBy: req.user.id
    });
    
    const newAssignment = await enhancedStorage.createUserAssignment(validatedData);
    res.json(newAssignment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating assignment:", error);
    res.status(500).json({ error: "Failed to create assignment" });
  }
});

router.post("/admin/assignments/bulk", requireAdmin, async (req, res) => {
  try {
    const { userIds, roadmapIds, options } = req.body;
    
    if (!Array.isArray(userIds) || !Array.isArray(roadmapIds)) {
      return res.status(400).json({ error: "userIds and roadmapIds must be arrays" });
    }
    
    const assignments = await enhancedStorage.bulkAssignRoadmaps(
      userIds, 
      roadmapIds, 
      req.user.id, 
      options
    );
    
    res.json(assignments);
  } catch (error) {
    console.error("Error creating bulk assignments:", error);
    res.status(500).json({ error: "Failed to create bulk assignments" });
  }
});

router.put("/admin/assignments/:id", requireAdmin, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const updates = req.body;
    
    const updatedAssignment = await enhancedStorage.updateUserAssignment(assignmentId, updates);
    if (!updatedAssignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    
    res.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ error: "Failed to update assignment" });
  }
});

router.delete("/admin/assignments/:id", requireAdmin, async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const success = await enhancedStorage.deleteUserAssignment(assignmentId);
    
    if (!success) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ error: "Failed to delete assignment" });
  }
});

// Dashboard Stats
router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await enhancedStorage.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// User-facing routes (for learners)
router.get("/roadmaps", async (req, res) => {
  try {
    const type = req.query.type as string;
    const search = req.query.search as string;
    
    let roadmaps;
    if (search) {
      roadmaps = await enhancedStorage.searchRoadmaps(search);
    } else if (type) {
      roadmaps = await enhancedStorage.getRoadmapsByType(type);
    } else {
      roadmaps = await enhancedStorage.getRoadmaps();
    }
    
    res.json(roadmaps);
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    res.status(500).json({ error: "Failed to fetch roadmaps" });
  }
});

router.get("/roadmaps/:id", async (req, res) => {
  try {
    const roadmapId = parseInt(req.params.id);
    const roadmap = await enhancedStorage.getRoadmapById(roadmapId);
    
    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found" });
    }
    
    res.json(roadmap);
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

router.get("/roadmaps/:id/resources", async (req, res) => {
  try {
    const roadmapId = parseInt(req.params.id);
    const sectionTitle = req.query.section as string;
    const nodeId = req.query.node as string;
    
    let resources;
    if (nodeId) {
      resources = await enhancedStorage.getResourcesByNode(roadmapId, nodeId);
    } else if (sectionTitle) {
      resources = await enhancedStorage.getResourcesByRoadmapSection(roadmapId, sectionTitle);
    } else {
      resources = await enhancedStorage.getContentResources(roadmapId);
    }
    
    res.json(resources);
  } catch (error) {
    console.error("Error fetching roadmap resources:", error);
    res.status(500).json({ error: "Failed to fetch roadmap resources" });
  }
});

// User progress and bookmarks
router.get("/progress", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const progress = await enhancedStorage.getAllUserProgress(req.user.id);
    res.json(progress);
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ error: "Failed to fetch user progress" });
  }
});

router.post("/progress/:roadmapId", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const roadmapId = parseInt(req.params.roadmapId);
    const { progress } = req.body;
    
    const updatedProgress = await enhancedStorage.updateUserProgress(req.user.id, roadmapId, progress);
    res.json(updatedProgress);
  } catch (error) {
    console.error("Error updating user progress:", error);
    res.status(500).json({ error: "Failed to update user progress" });
  }
});

router.get("/bookmarks", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const bookmarks = await enhancedStorage.getUserBookmarks(req.user.id);
    res.json(bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

router.post("/bookmarks/:roadmapId", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const roadmapId = parseInt(req.params.roadmapId);
    const bookmark = await enhancedStorage.addBookmark(req.user.id, roadmapId);
    res.json(bookmark);
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res.status(500).json({ error: "Failed to add bookmark" });
  }
});

router.delete("/bookmarks/:roadmapId", async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const roadmapId = parseInt(req.params.roadmapId);
    const success = await enhancedStorage.removeBookmark(req.user.id, roadmapId);
    
    if (!success) {
      return res.status(404).json({ error: "Bookmark not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

export default router;