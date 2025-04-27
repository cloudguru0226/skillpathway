import { 
  users, type User, type InsertUser, 
  roadmaps, type Roadmap, type InsertRoadmap, 
  userProgress, type UserProgress, type InsertUserProgress, 
  bookmarks, type Bookmark, type InsertBookmark, 
  activityLogs, type ActivityLog, type InsertActivityLog,
  userLevels, type UserLevel, type InsertUserLevel,
  userExperience, type UserExperience, type InsertUserExperience,
  badgeCategories, type BadgeCategory, type InsertBadgeCategory,
  badges, type Badge, type InsertBadge,
  userBadges, type UserBadge, type InsertUserBadge,
  userSkills, type UserSkill, type InsertUserSkill,
  experienceTransactions, type ExperienceTransaction, type InsertExperienceTransaction,
  comments, type Comment, type InsertComment,
  commentReactions, type CommentReaction, type InsertCommentReaction,
  resources, type Resource, type InsertResource,
  roadmapNodeResources, type RoadmapNodeResource, type InsertRoadmapNodeResource,
  discussionTopics, type DiscussionTopic, type InsertDiscussionTopic,
  discussionReplies, type DiscussionReply, type InsertDiscussionReply,
  blogPosts, type BlogPost, type InsertBlogPost
} from "@shared/schema";
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

  // User Level methods
  getUserLevels(): Promise<UserLevel[]>;
  getUserLevel(level: number): Promise<UserLevel | undefined>;
  createUserLevel(level: InsertUserLevel): Promise<UserLevel>;
  updateUserLevel(id: number, level: Partial<UserLevel>): Promise<UserLevel | undefined>;

  // User Experience methods
  getUserExperience(userId: number): Promise<UserExperience | undefined>;
  createUserExperience(exp: InsertUserExperience): Promise<UserExperience>;
  updateUserExperience(userId: number, exp: Partial<UserExperience>): Promise<UserExperience | undefined>;
  awardExperience(userId: number, amount: number, reason: string, roadmapId?: number, nodeId?: string): Promise<UserExperience>;

  // Badge Category methods
  getBadgeCategories(): Promise<BadgeCategory[]>;
  getBadgeCategory(id: number): Promise<BadgeCategory | undefined>;
  createBadgeCategory(category: InsertBadgeCategory): Promise<BadgeCategory>;

  // Badge methods
  getBadges(categoryId?: number): Promise<Badge[]>;
  getBadge(id: number): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;

  // User Badge methods
  getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: number, badgeId: number): Promise<UserBadge | undefined>;
  hasBadge(userId: number, badgeId: number): Promise<boolean>;

  // User Skill methods
  getUserSkills(userId: number): Promise<UserSkill[]>;
  getUserSkill(userId: number, skillName: string): Promise<UserSkill | undefined>;
  createUserSkill(skill: InsertUserSkill): Promise<UserSkill>;
  updateUserSkill(userId: number, skillName: string, points: number): Promise<UserSkill | undefined>;

  // Experience Transaction methods
  getExperienceTransactions(userId: number, limit?: number): Promise<ExperienceTransaction[]>;
  createExperienceTransaction(transaction: InsertExperienceTransaction): Promise<ExperienceTransaction>;

  // Comment methods
  getComments(roadmapId?: number, nodeId?: string): Promise<Comment[]>;
  getCommentById(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, content: string): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  getCommentReplies(parentId: number): Promise<Comment[]>;

  // Comment Reaction methods
  getCommentReactions(commentId: number): Promise<CommentReaction[]>;
  addCommentReaction(reaction: InsertCommentReaction): Promise<CommentReaction>;
  removeCommentReaction(userId: number, commentId: number, reaction: string): Promise<boolean>;

  // Resource methods
  getResources(type?: string): Promise<Resource[]>;
  getResourceById(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;

  // Roadmap Node Resource methods
  getRoadmapNodeResources(roadmapId: number, nodeId: string): Promise<(RoadmapNodeResource & { resource: Resource })[]>;
  addResourceToNode(nodeResource: InsertRoadmapNodeResource): Promise<RoadmapNodeResource>;
  removeResourceFromNode(roadmapId: number, nodeId: string, resourceId: number): Promise<boolean>;
  reorderNodeResources(roadmapId: number, nodeId: string, resourceIds: number[]): Promise<RoadmapNodeResource[]>;

  // Discussion Topic methods
  getDiscussionTopics(roadmapId?: number, nodeId?: string): Promise<DiscussionTopic[]>;
  getDiscussionTopicById(id: number): Promise<DiscussionTopic | undefined>;
  createDiscussionTopic(topic: InsertDiscussionTopic): Promise<DiscussionTopic>;
  updateDiscussionTopic(id: number, topic: Partial<DiscussionTopic>): Promise<DiscussionTopic | undefined>;
  deleteDiscussionTopic(id: number): Promise<boolean>;
  incrementTopicViewCount(id: number): Promise<DiscussionTopic | undefined>;

  // Discussion Reply methods
  getDiscussionReplies(topicId: number): Promise<DiscussionReply[]>;
  getDiscussionReplyById(id: number): Promise<DiscussionReply | undefined>;
  createDiscussionReply(reply: InsertDiscussionReply): Promise<DiscussionReply>;
  updateDiscussionReply(id: number, content: string): Promise<DiscussionReply | undefined>;
  deleteDiscussionReply(id: number): Promise<boolean>;
  markReplyAsAccepted(id: number): Promise<DiscussionReply | undefined>;

  // Blog Post methods
  getBlogPosts(status?: string, tag?: string): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  incrementBlogPostViewCount(id: number): Promise<BlogPost | undefined>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private roadmaps: Map<number, Roadmap>;
  private userProgress: Map<string, UserProgress>;
  private bookmarks: Map<string, Bookmark>;
  private activityLogs: ActivityLog[];
  private userLevels: Map<number, UserLevel>;
  private userExperiences: Map<number, UserExperience>;
  private badgeCategories: Map<number, BadgeCategory>;
  private badges: Map<number, Badge>;
  private userBadges: Map<string, UserBadge & { badge: Badge }>;
  private userSkills: Map<string, UserSkill>;
  private experienceTransactions: ExperienceTransaction[];
  private comments: Map<number, Comment>;
  private commentReactions: Map<string, CommentReaction>;
  private resources: Map<number, Resource>;
  private roadmapNodeResources: Map<string, RoadmapNodeResource>;
  private discussionTopics: Map<number, DiscussionTopic>;
  private discussionReplies: Map<number, DiscussionReply>;
  private blogPosts: Map<number, BlogPost>;
  private blogPostsBySlug: Map<string, number>;
  
  // IDs for records
  private userCounter: number;
  private roadmapCounter: number;
  private progressCounter: number;
  private bookmarkCounter: number;
  private activityCounter: number;
  private userLevelCounter: number;
  private userExperienceCounter: number;
  private badgeCategoryCounter: number;
  private badgeCounter: number;
  private userBadgeCounter: number;
  private userSkillCounter: number;
  private experienceTransactionCounter: number;
  private commentCounter: number;
  private commentReactionCounter: number;
  private resourceCounter: number;
  private roadmapNodeResourceCounter: number;
  private discussionTopicCounter: number;
  private discussionReplyCounter: number;
  private blogPostCounter: number;
  
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.roadmaps = new Map();
    this.userProgress = new Map();
    this.bookmarks = new Map();
    this.activityLogs = [];
    this.userLevels = new Map();
    this.userExperiences = new Map();
    this.badgeCategories = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    this.userSkills = new Map();
    this.experienceTransactions = [];
    this.comments = new Map();
    this.commentReactions = new Map();
    this.resources = new Map();
    this.roadmapNodeResources = new Map();
    this.discussionTopics = new Map();
    this.discussionReplies = new Map();
    this.blogPosts = new Map();
    this.blogPostsBySlug = new Map();
    
    this.userCounter = 1;
    this.roadmapCounter = 1;
    this.progressCounter = 1;
    this.bookmarkCounter = 1;
    this.activityCounter = 1;
    this.userLevelCounter = 1;
    this.userExperienceCounter = 1;
    this.badgeCategoryCounter = 1;
    this.badgeCounter = 1;
    this.userBadgeCounter = 1;
    this.userSkillCounter = 1;
    this.experienceTransactionCounter = 1;
    this.commentCounter = 1;
    this.commentReactionCounter = 1;
    this.resourceCounter = 1;
    this.roadmapNodeResourceCounter = 1;
    this.discussionTopicCounter = 1;
    this.discussionReplyCounter = 1;
    this.blogPostCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize default user levels
    this.initializeDefaultUserLevels();
  }
  
  private async initializeDefaultUserLevels() {
    // Create default user levels (1-10)
    const defaultLevels = [
      { level: 1, experienceRequired: 0, title: "Novice", description: "Just getting started", benefits: "Access to beginner roadmaps" },
      { level: 2, experienceRequired: 100, title: "Apprentice", description: "Learning the basics", benefits: "Unlock skill points" },
      { level: 3, experienceRequired: 300, title: "Journeyman", description: "Building your skills", benefits: "+1 skill point" },
      { level: 4, experienceRequired: 600, title: "Adept", description: "Gaining confidence", benefits: "+1 skill point" },
      { level: 5, experienceRequired: 1000, title: "Specialist", description: "Specializing in your field", benefits: "+2 skill points & intermediate roadmaps" },
      { level: 6, experienceRequired: 1500, title: "Expert", description: "Becoming an expert", benefits: "+2 skill points" },
      { level: 7, experienceRequired: 2100, title: "Master", description: "Mastering your craft", benefits: "+3 skill points" },
      { level: 8, experienceRequired: 2800, title: "Virtuoso", description: "Exceptional skill and knowledge", benefits: "+3 skill points & advanced roadmaps" },
      { level: 9, experienceRequired: 3600, title: "Authority", description: "Recognized authority", benefits: "+4 skill points" },
      { level: 10, experienceRequired: 4500, title: "Luminary", description: "Leading the field", benefits: "+5 skill points & all roadmaps" },
    ];
    
    for (const levelData of defaultLevels) {
      await this.createUserLevel(levelData);
    }
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
      createdAt: now,
      isAdmin: insertUser.isAdmin ?? false // Set to false if undefined
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

  // User Level methods
  async getUserLevels(): Promise<UserLevel[]> {
    return Array.from(this.userLevels.values()).sort((a, b) => a.level - b.level);
  }

  async getUserLevel(level: number): Promise<UserLevel | undefined> {
    return Array.from(this.userLevels.values()).find(l => l.level === level);
  }

  async createUserLevel(insertLevel: InsertUserLevel): Promise<UserLevel> {
    const id = this.userLevelCounter++;
    const userLevel: UserLevel = {
      ...insertLevel,
      id
    };
    this.userLevels.set(id, userLevel);
    return userLevel;
  }

  async updateUserLevel(id: number, levelData: Partial<UserLevel>): Promise<UserLevel | undefined> {
    const level = this.userLevels.get(id);
    if (!level) return undefined;
    
    const updatedLevel = { ...level, ...levelData };
    this.userLevels.set(id, updatedLevel);
    return updatedLevel;
  }

  // User Experience methods
  async getUserExperience(userId: number): Promise<UserExperience | undefined> {
    return Array.from(this.userExperiences.values()).find(exp => exp.userId === userId);
  }

  async createUserExperience(insertExp: InsertUserExperience): Promise<UserExperience> {
    const id = this.userExperienceCounter++;
    const now = new Date();
    const exp: UserExperience = {
      ...insertExp,
      id,
      updatedAt: now
    };
    this.userExperiences.set(id, exp);
    return exp;
  }

  async updateUserExperience(userId: number, expData: Partial<UserExperience>): Promise<UserExperience | undefined> {
    const exp = Array.from(this.userExperiences.values()).find(e => e.userId === userId);
    if (!exp) return undefined;
    
    const updatedExp = { 
      ...exp, 
      ...expData, 
      updatedAt: new Date() 
    };
    this.userExperiences.set(exp.id, updatedExp);
    return updatedExp;
  }

  async awardExperience(userId: number, amount: number, reason: string, roadmapId?: number, nodeId?: string): Promise<UserExperience> {
    // Get or create user experience record
    let userExp = await this.getUserExperience(userId);
    if (!userExp) {
      userExp = await this.createUserExperience({
        userId,
        currentLevel: 1,
        totalExperience: 0,
        skillPoints: 0
      });
    }

    // Log the transaction
    await this.createExperienceTransaction({
      userId,
      amount,
      reason,
      roadmapId,
      nodeId
    });

    // Add experience
    const newTotalExp = userExp.totalExperience + amount;

    // Check for level up
    const nextLevel = await this.getNextLevel(userExp.currentLevel, newTotalExp);
    const skillPointsGained = await this.calculateSkillPointsGain(userExp.currentLevel, nextLevel);

    // Update user experience
    return this.updateUserExperience(userId, {
      totalExperience: newTotalExp,
      currentLevel: nextLevel,
      skillPoints: userExp.skillPoints + skillPointsGained
    }) as Promise<UserExperience>;
  }

  // Helper method to get next level
  private async getNextLevel(currentLevel: number, totalExp: number): Promise<number> {
    const levels = await this.getUserLevels();
    let nextLevel = currentLevel;

    for (const level of levels) {
      if (level.level > currentLevel && totalExp >= level.experienceRequired) {
        nextLevel = level.level;
      }
    }

    return nextLevel;
  }

  // Helper method to calculate skill points gain based on level difference
  private async calculateSkillPointsGain(oldLevel: number, newLevel: number): Promise<number> {
    if (oldLevel >= newLevel) return 0;

    let skillPointsGain = 0;
    for (let level = oldLevel + 1; level <= newLevel; level++) {
      switch (level) {
        case 1:
        case 2:
          skillPointsGain += 0;
          break;
        case 3:
        case 4:
          skillPointsGain += 1;
          break;
        case 5:
        case 6:
          skillPointsGain += 2;
          break;
        case 7:
        case 8:
          skillPointsGain += 3;
          break;
        case 9:
          skillPointsGain += 4;
          break;
        case 10:
          skillPointsGain += 5;
          break;
        default:
          skillPointsGain += 1;
      }
    }

    return skillPointsGain;
  }

  // Badge Category methods
  async getBadgeCategories(): Promise<BadgeCategory[]> {
    return Array.from(this.badgeCategories.values());
  }

  async getBadgeCategory(id: number): Promise<BadgeCategory | undefined> {
    return this.badgeCategories.get(id);
  }

  async createBadgeCategory(insertCategory: InsertBadgeCategory): Promise<BadgeCategory> {
    const id = this.badgeCategoryCounter++;
    const category: BadgeCategory = {
      ...insertCategory,
      id
    };
    this.badgeCategories.set(id, category);
    return category;
  }

  // Badge methods
  async getBadges(categoryId?: number): Promise<Badge[]> {
    let badges = Array.from(this.badges.values());
    if (categoryId) {
      badges = badges.filter(badge => badge.categoryId === categoryId);
    }
    return badges;
  }

  async getBadge(id: number): Promise<Badge | undefined> {
    return this.badges.get(id);
  }

  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = this.badgeCounter++;
    const badge: Badge = {
      ...insertBadge,
      id
    };
    this.badges.set(id, badge);
    return badge;
  }

  // User Badge methods
  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    return Array.from(this.userBadges.values())
      .filter(userBadge => userBadge.userId === userId);
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge | undefined> {
    // Make sure badge exists
    const badge = await this.getBadge(badgeId);
    if (!badge) return undefined;

    // Check if user already has this badge
    const hasBadge = await this.hasBadge(userId, badgeId);
    if (hasBadge) return undefined;

    const id = this.userBadgeCounter++;
    const key = `${userId}-${badgeId}`;
    const now = new Date();
    
    const userBadge: UserBadge & { badge: Badge } = {
      id,
      userId,
      badgeId,
      awardedAt: now,
      badge
    };
    this.userBadges.set(key, userBadge);

    // Award experience for badge
    if (badge.experienceAwarded > 0) {
      await this.awardExperience(
        userId, 
        badge.experienceAwarded, 
        `Awarded for earning badge: ${badge.name}`
      );
    }

    // Award skill points for badge
    if (badge.skillPointsAwarded > 0) {
      const userExp = await this.getUserExperience(userId);
      if (userExp) {
        await this.updateUserExperience(userId, {
          skillPoints: userExp.skillPoints + badge.skillPointsAwarded
        });
      }
    }

    return userBadge;
  }

  async hasBadge(userId: number, badgeId: number): Promise<boolean> {
    const key = `${userId}-${badgeId}`;
    return this.userBadges.has(key);
  }

  // User Skill methods
  async getUserSkills(userId: number): Promise<UserSkill[]> {
    return Array.from(this.userSkills.values())
      .filter(skill => skill.userId === userId);
  }

  async getUserSkill(userId: number, skillName: string): Promise<UserSkill | undefined> {
    const key = `${userId}-${skillName}`;
    return this.userSkills.get(key);
  }

  async createUserSkill(insertSkill: InsertUserSkill): Promise<UserSkill> {
    const id = this.userSkillCounter++;
    const key = `${insertSkill.userId}-${insertSkill.skillName}`;
    
    const skill: UserSkill = {
      ...insertSkill,
      id
    };
    this.userSkills.set(key, skill);
    return skill;
  }

  async updateUserSkill(userId: number, skillName: string, points: number): Promise<UserSkill | undefined> {
    const key = `${userId}-${skillName}`;
    const skill = this.userSkills.get(key);
    
    if (!skill) {
      // Create skill if it doesn't exist
      return this.createUserSkill({
        userId,
        skillName,
        skillLevel: 1,
        pointsInvested: points
      });
    }
    
    // Calculate new skill level based on points
    const totalPoints = skill.pointsInvested + points;
    const newLevel = Math.floor(Math.sqrt(totalPoints / 10)) + 1;
    
    const updatedSkill: UserSkill = {
      ...skill,
      pointsInvested: totalPoints,
      skillLevel: newLevel
    };
    
    this.userSkills.set(key, updatedSkill);
    return updatedSkill;
  }

  // Experience Transaction methods
  async getExperienceTransactions(userId: number, limit?: number): Promise<ExperienceTransaction[]> {
    let transactions = this.experienceTransactions
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
    if (limit) {
      transactions = transactions.slice(0, limit);
    }
    
    return transactions;
  }

  async createExperienceTransaction(insertTransaction: InsertExperienceTransaction): Promise<ExperienceTransaction> {
    const id = this.experienceTransactionCounter++;
    const now = new Date();
    
    const transaction: ExperienceTransaction = {
      ...insertTransaction,
      id,
      createdAt: now
    };
    
    this.experienceTransactions.push(transaction);
    return transaction;
  }
}

export const storage = new MemStorage();
