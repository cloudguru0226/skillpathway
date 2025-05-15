import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
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
  insertCommentReactionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to verify admin status
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    next();
  };

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

  // Create HTTP server and return it for setup in index.ts
  const httpServer = createServer(app);
  return httpServer;
}
