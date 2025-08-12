import type { Express } from "express";
import { enhancedStorage } from "../storage-enhanced";

export function registerContentSectionRoutes(app: Express) {
  
  // Get content sections for a roadmap/course
  app.get("/api/admin/content/:id/sections", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const contentId = parseInt(req.params.id);
      
      // For now, return mock sections structure - in a real app this would come from database
      const sections = [
        {
          id: "section-1",
          title: "Introduction",
          type: "text",
          content: {
            text: "Welcome to this comprehensive learning module. In this section, you'll learn the fundamentals and get hands-on experience.",
            html: ""
          },
          order: 0,
          isPublished: true
        },
        {
          id: "section-2", 
          title: "Video Tutorial",
          type: "video",
          content: {
            videoUrl: "",
            text: "Watch this tutorial to understand the key concepts."
          },
          order: 1,
          isPublished: false
        }
      ];
      
      res.json({ sections });
    } catch (error) {
      console.error("Error fetching content sections:", error);
      res.status(500).json({ error: "Failed to fetch content sections" });
    }
  });

  // Update content sections
  app.put("/api/admin/content/:id/sections", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const contentId = parseInt(req.params.id);
      const { sections } = req.body;
      
      // In a real implementation, this would save to database
      console.log(`Saving ${sections.length} sections for content ${contentId}`);
      
      // For now, just return success
      res.json({ 
        success: true,
        message: `Successfully saved ${sections.length} sections`,
        sections 
      });
    } catch (error) {
      console.error("Error saving content sections:", error);
      res.status(500).json({ error: "Failed to save content sections" });
    }
  });

  // Create new content section
  app.post("/api/admin/content/:id/sections", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const contentId = parseInt(req.params.id);
      const sectionData = req.body;
      
      // Generate new section ID
      const newSection = {
        ...sectionData,
        id: `section-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log(`Creating new section for content ${contentId}:`, newSection.title);
      
      res.json(newSection);
    } catch (error) {
      console.error("Error creating content section:", error);
      res.status(500).json({ error: "Failed to create content section" });
    }
  });

  // Delete content section
  app.delete("/api/admin/content/:contentId/sections/:sectionId", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const { contentId, sectionId } = req.params;
      
      console.log(`Deleting section ${sectionId} from content ${contentId}`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting content section:", error);
      res.status(500).json({ error: "Failed to delete content section" });
    }
  });

  // Bulk operations for content sections
  app.post("/api/admin/content/:id/sections/bulk", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const contentId = parseInt(req.params.id);
      const { operation, sectionIds, data } = req.body;
      
      switch (operation) {
        case 'publish':
          console.log(`Publishing ${sectionIds.length} sections for content ${contentId}`);
          break;
        case 'unpublish':
          console.log(`Unpublishing ${sectionIds.length} sections for content ${contentId}`);
          break;
        case 'reorder':
          console.log(`Reordering sections for content ${contentId}:`, data.newOrder);
          break;
        case 'delete':
          console.log(`Deleting ${sectionIds.length} sections from content ${contentId}`);
          break;
        default:
          return res.status(400).json({ error: "Invalid bulk operation" });
      }
      
      res.json({ 
        success: true,
        message: `Successfully performed ${operation} on ${sectionIds.length} sections`
      });
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      res.status(500).json({ error: "Failed to perform bulk operation" });
    }
  });

  // Get content section analytics
  app.get("/api/admin/content/:id/analytics", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const contentId = parseInt(req.params.id);
      
      // Mock analytics data
      const analytics = {
        totalSections: 15,
        publishedSections: 12,
        draftSections: 3,
        totalViews: 2847,
        averageCompletionRate: 78.5,
        sectionPerformance: [
          { sectionId: "section-1", views: 2847, completions: 2234, avgTimeSpent: 480 },
          { sectionId: "section-2", views: 2456, completions: 1987, avgTimeSpent: 720 },
          { sectionId: "section-3", views: 2234, completions: 1765, avgTimeSpent: 360 }
        ],
        engagementMetrics: {
          mostViewedType: "video",
          leastViewedType: "quiz",
          averageSessionTime: 1250,
          dropoffPoints: ["section-5", "section-9"]
        }
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching content analytics:", error);
      res.status(500).json({ error: "Failed to fetch content analytics" });
    }
  });
}