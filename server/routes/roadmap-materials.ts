import type { Express } from "express";
import { enhancedStorage } from "../storage-enhanced";

export function registerRoadmapMaterialRoutes(app: Express) {
  
  // Get all materials for a roadmap
  app.get("/api/admin/roadmaps/:id/materials", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const roadmapId = parseInt(req.params.id);
      const materials = await enhancedStorage.getContentResources(roadmapId);
      res.json(materials);
    } catch (error) {
      console.error("Error fetching roadmap materials:", error);
      res.status(500).json({ error: "Failed to fetch roadmap materials" });
    }
  });

  // Create new material for a roadmap
  app.post("/api/admin/roadmaps/:id/materials", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const roadmapId = parseInt(req.params.id);
      const materialData = {
        ...req.body,
        roadmapId,
        createdBy: req.user!.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const material = await enhancedStorage.createContentResource(materialData);
      res.json(material);
    } catch (error) {
      console.error("Error creating roadmap material:", error);
      res.status(500).json({ error: "Failed to create roadmap material" });
    }
  });

  // Update existing material
  app.put("/api/admin/roadmaps/:roadmapId/materials/:materialId", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const materialId = parseInt(req.params.materialId);
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const material = await enhancedStorage.updateContentResource(materialId, updateData);
      res.json(material);
    } catch (error) {
      console.error("Error updating roadmap material:", error);
      res.status(500).json({ error: "Failed to update roadmap material" });
    }
  });

  // Delete material
  app.delete("/api/admin/roadmaps/:roadmapId/materials/:materialId", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const materialId = parseInt(req.params.materialId);
      const success = await enhancedStorage.deleteContentResource(materialId);
      
      if (success) {
        res.json({ success: true, message: "Material deleted successfully" });
      } else {
        res.status(404).json({ error: "Material not found" });
      }
    } catch (error) {
      console.error("Error deleting roadmap material:", error);
      res.status(500).json({ error: "Failed to delete roadmap material" });
    }
  });

  // Get materials for a specific section
  app.get("/api/admin/roadmaps/:id/sections/:sectionTitle/materials", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const roadmapId = parseInt(req.params.id);
      const sectionTitle = decodeURIComponent(req.params.sectionTitle);
      
      const materials = await enhancedStorage.getResourcesByRoadmapSection(roadmapId, sectionTitle);
      res.json(materials);
    } catch (error) {
      console.error("Error fetching section materials:", error);
      res.status(500).json({ error: "Failed to fetch section materials" });
    }
  });

  // Get materials for a specific node
  app.get("/api/admin/roadmaps/:id/nodes/:nodeId/materials", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const roadmapId = parseInt(req.params.id);
      const nodeId = req.params.nodeId;
      
      const materials = await enhancedStorage.getResourcesByNode(roadmapId, nodeId);
      res.json(materials);
    } catch (error) {
      console.error("Error fetching node materials:", error);
      res.status(500).json({ error: "Failed to fetch node materials" });
    }
  });

  // Bulk operations for materials
  app.post("/api/admin/roadmaps/:id/materials/bulk", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const roadmapId = parseInt(req.params.id);
      const { operation, materialIds, data } = req.body;
      
      switch (operation) {
        case 'delete':
          for (const materialId of materialIds) {
            await enhancedStorage.deleteContentResource(parseInt(materialId));
          }
          res.json({ 
            success: true, 
            message: `Successfully deleted ${materialIds.length} materials` 
          });
          break;
          
        case 'update':
          const results = [];
          for (const materialId of materialIds) {
            const updated = await enhancedStorage.updateContentResource(parseInt(materialId), data);
            results.push(updated);
          }
          res.json({ 
            success: true, 
            message: `Successfully updated ${materialIds.length} materials`,
            materials: results
          });
          break;
          
        default:
          res.status(400).json({ error: "Invalid bulk operation" });
      }
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      res.status(500).json({ error: "Failed to perform bulk operation" });
    }
  });

  // Get material analytics
  app.get("/api/admin/roadmaps/:id/materials/analytics", async (req, res) => {
    if (!req.isAuthenticated() || !req.user!.isAdmin) return res.sendStatus(403);
    
    try {
      const roadmapId = parseInt(req.params.id);
      
      // Mock analytics data - in real implementation this would come from database
      const analytics = {
        totalMaterials: 24,
        materialsByType: {
          text: 8,
          url: 6,
          video: 4,
          document: 3,
          quiz: 2,
          exercise: 1
        },
        materialsBySection: {
          "Introduction": 4,
          "Core Concepts": 8,
          "Advanced Topics": 7,
          "Practice": 5
        },
        engagementMetrics: {
          mostAccessedMaterials: [
            { id: 1, title: "Getting Started Guide", accesses: 234 },
            { id: 2, title: "Core Architecture Video", accesses: 198 },
            { id: 3, title: "Hands-on Exercise", accesses: 167 }
          ],
          averageTimeSpent: 420, // seconds
          completionRate: 73.5
        }
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching material analytics:", error);
      res.status(500).json({ error: "Failed to fetch material analytics" });
    }
  });
}