import { 
  users, type User, type InsertUser,
  roadmaps, type Roadmap, type InsertRoadmap,
  userProgress, type UserProgress, type InsertUserProgress,
  userAssignments, type UserAssignment, type InsertUserAssignment,
  contentResources, type ContentResource, type InsertContentResource,
  bookmarks, type Bookmark, type InsertBookmark
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, count, ilike } from "drizzle-orm";

export interface IEnhancedStorage {
  // User Management
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | null>;
  createUser(userData: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserPermissions(id: number, permissions: any): Promise<User | null>;
  
  // User Authentication
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateLastLogin(userId: number): Promise<void>;

  // Roadmap Management
  getRoadmaps(): Promise<Roadmap[]>;
  getRoadmapById(id: number): Promise<Roadmap | null>;
  createRoadmap(roadmapData: InsertRoadmap): Promise<Roadmap>;
  updateRoadmap(id: number, roadmapData: Partial<InsertRoadmap>): Promise<Roadmap | null>;
  deleteRoadmap(id: number): Promise<boolean>;
  searchRoadmaps(query: string): Promise<Roadmap[]>;
  getRoadmapsByType(type: string): Promise<Roadmap[]>;

  // Content Resources Management
  getContentResources(roadmapId?: number): Promise<ContentResource[]>;
  getContentResourceById(id: number): Promise<ContentResource | null>;
  createContentResource(resourceData: InsertContentResource): Promise<ContentResource>;
  updateContentResource(id: number, resourceData: Partial<InsertContentResource>): Promise<ContentResource | null>;
  deleteContentResource(id: number): Promise<boolean>;
  getResourcesByRoadmapSection(roadmapId: number, sectionTitle: string): Promise<ContentResource[]>;
  getResourcesByNode(roadmapId: number, nodeId: string): Promise<ContentResource[]>;

  // User Assignments
  getUserAssignments(userId?: number): Promise<UserAssignment[]>;
  createUserAssignment(assignmentData: InsertUserAssignment): Promise<UserAssignment>;
  updateUserAssignment(id: number, assignmentData: Partial<InsertUserAssignment>): Promise<UserAssignment | null>;
  deleteUserAssignment(id: number): Promise<boolean>;
  getAssignmentsByUser(userId: number): Promise<UserAssignment[]>;
  getAssignmentsByAssigner(assignerId: number): Promise<UserAssignment[]>;
  bulkAssignRoadmaps(userIds: number[], roadmapIds: number[], assignedBy: number, options?: { dueDate?: Date; priority?: string; notes?: string }): Promise<UserAssignment[]>;

  // Progress tracking
  getUserProgress(userId: number, roadmapId: number): Promise<UserProgress | null>;
  updateUserProgress(userId: number, roadmapId: number, progress: any): Promise<UserProgress>;
  getAllUserProgress(userId: number): Promise<UserProgress[]>;

  // Bookmarks
  getUserBookmarks(userId: number): Promise<Bookmark[]>;
  addBookmark(userId: number, roadmapId: number): Promise<Bookmark>;
  removeBookmark(userId: number, roadmapId: number): Promise<boolean>;

  // Admin Dashboard Stats
  getDashboardStats(): Promise<{
    totalUsers: number;
    totalRoadmaps: number;
    totalAssignments: number;
    activeUsers: number;
    completedRoadmaps: number;
  }>;
}

export class EnhancedStorage implements IEnhancedStorage {
  
  // User Management
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | null> {
    const result = await db.update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async updateUserPermissions(id: number, permissions: any): Promise<User | null> {
    const result = await db.update(users)
      .set({ permissions, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  // User Authentication
  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0] || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Roadmap Management
  async getRoadmaps(): Promise<Roadmap[]> {
    return await db.select().from(roadmaps).orderBy(roadmaps.title);
  }

  async getRoadmapById(id: number): Promise<Roadmap | null> {
    const result = await db.select().from(roadmaps).where(eq(roadmaps.id, id)).limit(1);
    return result[0] || null;
  }

  async createRoadmap(roadmapData: InsertRoadmap): Promise<Roadmap> {
    const result = await db.insert(roadmaps).values(roadmapData).returning();
    return result[0];
  }

  async updateRoadmap(id: number, roadmapData: Partial<InsertRoadmap>): Promise<Roadmap | null> {
    const result = await db.update(roadmaps)
      .set({ ...roadmapData, updatedAt: new Date() })
      .where(eq(roadmaps.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteRoadmap(id: number): Promise<boolean> {
    const result = await db.delete(roadmaps).where(eq(roadmaps.id, id));
    return result.rowCount > 0;
  }

  async searchRoadmaps(query: string): Promise<Roadmap[]> {
    return await db.select().from(roadmaps)
      .where(ilike(roadmaps.title, `%${query}%`))
      .orderBy(roadmaps.title);
  }

  async getRoadmapsByType(type: string): Promise<Roadmap[]> {
    return await db.select().from(roadmaps)
      .where(eq(roadmaps.type, type))
      .orderBy(roadmaps.title);
  }

  // Content Resources Management
  async getContentResources(roadmapId?: number): Promise<ContentResource[]> {
    if (roadmapId) {
      return await db.select().from(contentResources)
        .where(eq(contentResources.roadmapId, roadmapId))
        .orderBy(contentResources.createdAt);
    }
    return await db.select().from(contentResources).orderBy(contentResources.createdAt);
  }

  async getContentResourceById(id: number): Promise<ContentResource | null> {
    const result = await db.select().from(contentResources).where(eq(contentResources.id, id)).limit(1);
    return result[0] || null;
  }

  async createContentResource(resourceData: InsertContentResource): Promise<ContentResource> {
    const result = await db.insert(contentResources).values(resourceData).returning();
    return result[0];
  }

  async updateContentResource(id: number, resourceData: Partial<InsertContentResource>): Promise<ContentResource | null> {
    const result = await db.update(contentResources)
      .set({ ...resourceData, updatedAt: new Date() })
      .where(eq(contentResources.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteContentResource(id: number): Promise<boolean> {
    const result = await db.delete(contentResources).where(eq(contentResources.id, id));
    return result.rowCount > 0;
  }

  async getResourcesByRoadmapSection(roadmapId: number, sectionTitle: string): Promise<ContentResource[]> {
    return await db.select().from(contentResources)
      .where(and(
        eq(contentResources.roadmapId, roadmapId),
        eq(contentResources.sectionTitle, sectionTitle)
      ))
      .orderBy(contentResources.createdAt);
  }

  async getResourcesByNode(roadmapId: number, nodeId: string): Promise<ContentResource[]> {
    return await db.select().from(contentResources)
      .where(and(
        eq(contentResources.roadmapId, roadmapId),
        eq(contentResources.nodeId, nodeId)
      ))
      .orderBy(contentResources.createdAt);
  }

  // User Assignments
  async getUserAssignments(userId?: number): Promise<UserAssignment[]> {
    if (userId) {
      return await db.select().from(userAssignments)
        .where(eq(userAssignments.userId, userId))
        .orderBy(desc(userAssignments.assignedAt));
    }
    return await db.select().from(userAssignments).orderBy(desc(userAssignments.assignedAt));
  }

  // Alias for compatibility
  async getAssignments(): Promise<UserAssignment[]> {
    return this.getUserAssignments();
  }

  async createUserAssignment(assignmentData: InsertUserAssignment): Promise<UserAssignment> {
    const result = await db.insert(userAssignments).values(assignmentData).returning();
    return result[0];
  }

  async updateUserAssignment(id: number, assignmentData: Partial<InsertUserAssignment>): Promise<UserAssignment | null> {
    const result = await db.update(userAssignments)
      .set(assignmentData)
      .where(eq(userAssignments.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteUserAssignment(id: number): Promise<boolean> {
    const result = await db.delete(userAssignments).where(eq(userAssignments.id, id));
    return result.rowCount > 0;
  }

  async getAssignmentsByUser(userId: number): Promise<UserAssignment[]> {
    return await db.select().from(userAssignments)
      .where(eq(userAssignments.userId, userId))
      .orderBy(desc(userAssignments.assignedAt));
  }

  async getAssignmentsByAssigner(assignerId: number): Promise<UserAssignment[]> {
    return await db.select().from(userAssignments)
      .where(eq(userAssignments.assignedBy, assignerId))
      .orderBy(desc(userAssignments.assignedAt));
  }

  async bulkAssignRoadmaps(
    userIds: number[], 
    roadmapIds: number[], 
    assignedBy: number, 
    options?: { dueDate?: Date; priority?: string; notes?: string }
  ): Promise<UserAssignment[]> {
    const assignments: InsertUserAssignment[] = [];
    
    for (const userId of userIds) {
      for (const roadmapId of roadmapIds) {
        assignments.push({
          userId,
          roadmapId,
          assignedBy,
          dueDate: options?.dueDate,
          priority: options?.priority || "medium",
          notes: options?.notes
        });
      }
    }

    const result = await db.insert(userAssignments).values(assignments).returning();
    return result;
  }

  // Progress tracking
  async getUserProgress(userId: number, roadmapId: number): Promise<UserProgress | null> {
    const result = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.roadmapId, roadmapId)))
      .limit(1);
    return result[0] || null;
  }

  async updateUserProgress(userId: number, roadmapId: number, progress: any): Promise<UserProgress> {
    const existing = await this.getUserProgress(userId, roadmapId);
    
    if (existing) {
      const result = await db.update(userProgress)
        .set({ 
          progress, 
          lastAccessedAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(eq(userProgress.userId, userId), eq(userProgress.roadmapId, roadmapId)))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userProgress)
        .values({ userId, roadmapId, progress })
        .returning();
      return result[0];
    }
  }

  async getAllUserProgress(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.lastAccessedAt));
  }

  // Bookmarks
  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    return await db.select().from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async addBookmark(userId: number, roadmapId: number): Promise<Bookmark> {
    const result = await db.insert(bookmarks)
      .values({ userId, roadmapId })
      .returning();
    return result[0];
  }

  async removeBookmark(userId: number, roadmapId: number): Promise<boolean> {
    const result = await db.delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.roadmapId, roadmapId)));
    return result.rowCount > 0;
  }

  // Admin Dashboard Stats
  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalRoadmaps: number;
    totalAssignments: number;
    activeUsers: number;
    completedRoadmaps: number;
  }> {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [totalRoadmapsResult] = await db.select({ count: count() }).from(roadmaps);
    const [totalAssignmentsResult] = await db.select({ count: count() }).from(userAssignments);
    
    // Active users (logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [activeUsersResult] = await db.select({ count: count() }).from(users)
      .where(and(
        eq(users.isActive, true)
      ));

    const [completedAssignmentsResult] = await db.select({ count: count() }).from(userAssignments)
      .where(eq(userAssignments.status, "completed"));

    return {
      totalUsers: totalUsersResult.count,
      totalRoadmaps: totalRoadmapsResult.count,
      totalAssignments: totalAssignmentsResult.count,
      activeUsers: activeUsersResult.count,
      completedRoadmaps: completedAssignmentsResult.count
    };
  }
}

export const enhancedStorage = new EnhancedStorage();