import { users, type User, type InsertUser, roadmaps, type Roadmap, type InsertRoadmap, userProgress, type UserProgress, type InsertUserProgress, bookmarks, type Bookmark, type InsertBookmark, activityLogs, type ActivityLog, type InsertActivityLog } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Roadmap methods
  getRoadmap(id: number): Promise<Roadmap | undefined>;
  getRoadmaps(type?: string): Promise<Roadmap[]>;
  createRoadmap(roadmap: InsertRoadmap): Promise<Roadmap>;
  updateRoadmap(id: number, roadmap: Partial<Roadmap>): Promise<Roadmap | undefined>;
  deleteRoadmap(id: number): Promise<boolean>;

  // User Progress methods
  getUserProgress(userId: number, roadmapId?: number): Promise<UserProgress[]>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: number, roadmapId: number, progress: Partial<UserProgress>): Promise<UserProgress | undefined>;

  // Bookmark methods
  getBookmarks(userId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: number, roadmapId: number): Promise<boolean>;
  getBookmark(userId: number, roadmapId: number): Promise<Bookmark | undefined>;

  // Activity Log methods
  getActivityLogs(userId: number, days?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private roadmaps: Map<number, Roadmap>;
  private userProgress: Map<string, UserProgress>;
  private bookmarks: Map<string, Bookmark>;
  private activityLogs: ActivityLog[];
  
  // IDs for records
  private userCounter: number;
  private roadmapCounter: number;
  private progressCounter: number;
  private bookmarkCounter: number;
  private activityCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.roadmaps = new Map();
    this.userProgress = new Map();
    this.bookmarks = new Map();
    this.activityLogs = [];
    
    this.userCounter = 1;
    this.roadmapCounter = 1;
    this.progressCounter = 1;
    this.bookmarkCounter = 1;
    this.activityCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Roadmap methods
  async getRoadmap(id: number): Promise<Roadmap | undefined> {
    return this.roadmaps.get(id);
  }

  async getRoadmaps(type?: string): Promise<Roadmap[]> {
    const allRoadmaps = Array.from(this.roadmaps.values());
    if (type) {
      return allRoadmaps.filter(roadmap => roadmap.type === type);
    }
    return allRoadmaps;
  }

  async createRoadmap(insertRoadmap: InsertRoadmap): Promise<Roadmap> {
    const id = this.roadmapCounter++;
    const now = new Date();
    const roadmap: Roadmap = {
      ...insertRoadmap,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.roadmaps.set(id, roadmap);
    return roadmap;
  }

  async updateRoadmap(id: number, roadmapData: Partial<Roadmap>): Promise<Roadmap | undefined> {
    const roadmap = this.roadmaps.get(id);
    if (!roadmap) return undefined;
    
    const updatedRoadmap = { 
      ...roadmap, 
      ...roadmapData,
      updatedAt: new Date()
    };
    this.roadmaps.set(id, updatedRoadmap);
    return updatedRoadmap;
  }

  async deleteRoadmap(id: number): Promise<boolean> {
    return this.roadmaps.delete(id);
  }

  // User Progress methods
  async getUserProgress(userId: number, roadmapId?: number): Promise<UserProgress[]> {
    const allProgress = Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
    
    if (roadmapId) {
      return allProgress.filter(progress => progress.roadmapId === roadmapId);
    }
    return allProgress;
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.progressCounter++;
    const now = new Date();
    const progressKey = `${insertProgress.userId}-${insertProgress.roadmapId}`;
    
    const progress: UserProgress = {
      ...insertProgress,
      id,
      lastAccessedAt: now,
      startedAt: now,
      updatedAt: now
    };
    
    this.userProgress.set(progressKey, progress);
    return progress;
  }

  async updateUserProgress(userId: number, roadmapId: number, progressData: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const progressKey = `${userId}-${roadmapId}`;
    const progress = this.userProgress.get(progressKey);
    if (!progress) return undefined;
    
    const updatedProgress = { 
      ...progress, 
      ...progressData,
      lastAccessedAt: new Date(),
      updatedAt: new Date()
    };
    
    this.userProgress.set(progressKey, updatedProgress);
    return updatedProgress;
  }

  // Bookmark methods
  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values())
      .filter(bookmark => bookmark.userId === userId);
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkCounter++;
    const now = new Date();
    const bookmarkKey = `${insertBookmark.userId}-${insertBookmark.roadmapId}`;
    
    const bookmark: Bookmark = {
      ...insertBookmark,
      id,
      createdAt: now
    };
    
    this.bookmarks.set(bookmarkKey, bookmark);
    return bookmark;
  }

  async deleteBookmark(userId: number, roadmapId: number): Promise<boolean> {
    const bookmarkKey = `${userId}-${roadmapId}`;
    return this.bookmarks.delete(bookmarkKey);
  }

  async getBookmark(userId: number, roadmapId: number): Promise<Bookmark | undefined> {
    const bookmarkKey = `${userId}-${roadmapId}`;
    return this.bookmarks.get(bookmarkKey);
  }

  // Activity Log methods
  async getActivityLogs(userId: number, days?: number): Promise<ActivityLog[]> {
    let logs = this.activityLogs.filter(log => log.userId === userId);
    
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      logs = logs.filter(log => log.date >= cutoffDate);
    }
    
    return logs;
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityCounter++;
    const log: ActivityLog = {
      ...insertLog,
      id,
      date: new Date()
    };
    
    this.activityLogs.push(log);
    return log;
  }
}

export const storage = new MemStorage();
