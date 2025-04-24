import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertRoadmapSchema, insertBookmarkSchema, insertUserProgressSchema, insertActivityLogSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

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

  const httpServer = createServer(app);
  return httpServer;
}
