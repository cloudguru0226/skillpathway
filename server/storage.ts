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
  blogPosts, type BlogPost, type InsertBlogPost,
  roles, type Role, type InsertRole,
  userRoles, type UserRole, type InsertUserRole,
  labEnvironments, type LabEnvironment, type InsertLabEnvironment,
  labInstances, type LabInstance, type InsertLabInstance,
  labTasks, type LabTask, type InsertLabTask,
  userLabTaskProgress, type UserLabTaskProgress, type InsertUserLabTaskProgress,
  labResources, type LabResource, type InsertLabResource,
  courses, type Course, type InsertCourse,
  courseModules, type CourseModule, type InsertCourseModule,
  courseContentItems, type CourseContentItem, type InsertCourseContentItem,
  courseEnrollments, type CourseEnrollment, type InsertCourseEnrollment,
  contentProgress, type ContentProgress, type InsertContentProgress,
  certificates, type Certificate, type InsertCertificate
} from "@shared/schema";
import session from "express-session";
import { db, pool } from "./db";
import { eq, and, desc, isNull, sql, not, gte, lt, asc, inArray, like, gt, lte, or, count, ilike } from "drizzle-orm";
import { comparePasswords } from './util';       // if util.ts
import { comparePasswords } from './utils/index'; // if utils/index.ts
import { comparePasswords } from '../utils';      // if in parent dir
import connectPg from "connect-pg-simple";


const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Analytics & Admin methods
  getPlatformStats(): Promise<{
    totalUsers: number;
    totalRoadmaps: number;
    activeUsers: number;
    totalComments: number;
    totalDiscussions: number;
    averageCompletionRate: number;
    totalCourses?: number;
    totalLabEnvironments?: number;
    activeLabInstances?: number;
  }>;
  
  getUserEngagement(days: number): Promise<{
    dates: string[];
    logins: number[];
    comments: number[];
    discussions: number[];
    progress: number[];
    labAccess?: number[];
    courseInteractions?: number[];
  }>;
  
  getLearningVelocity(): Promise<{
    users: {userId: number; username: string; avgNodesPerWeek: number; lastActive: Date}[];
    overall: {period: string; average: number}[];
  }>;
  
  getRoadmapPopularity(): Promise<{
    roadmapId: number;
    title: string;
    userCount: number;
    completionRate: number;
    averageTimeSpent: number;
  }[]>;
  
  getExperienceProgression(): Promise<{
    levels: {level: number; userCount: number}[];
    xpSources: {source: string; percentage: number}[];
    avgDaysToLevel: {level: number; days: number}[];
  }>;
  
  getActiveUsers(period: string): Promise<{
    count: number;
    trend: number;
    byDay: {day: string; count: number}[];
  }>;
  
  getLaboratoryUsage(): Promise<{
    totalProvisionedLabs: number;
    activeInstances: number;
    provisioningFailures: number;
    resourceCost: number;
    completionRate: number;
    labPopularity: {
      id: number;
      name: string;
      instances: number;
      averageCompletionRate: number;
    }[];
  }>;
  
  getCourseAnalytics(): Promise<{
    totalEnrollments: number;
    activeCourses: number;
    completionRate: number;
    popularCourses: {
      id: number;
      title: string;
      enrollments: number;
      completionRate: number;
    }[];
    userProgression: {
      date: string;
      newEnrollments: number;
      completions: number;
    }[];
  }>;

  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // RBAC methods
  getRoles(): Promise<Role[]>;
  getRole(id: number): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<Role>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  
  getUserRoles(userId: number): Promise<(Role & { assignedAt: Date })[]>;
  assignRoleToUser(userRole: InsertUserRole): Promise<UserRole>;
  removeRoleFromUser(userId: number, roleId: number): Promise<boolean>;
  hasPermission(userId: number, permission: string): Promise<boolean>;
  
  // Terraform Lab Integration methods
  getLabEnvironments(filters?: { difficulty?: string; tags?: string[]; isActive?: boolean }): Promise<LabEnvironment[]>;
  getLabEnvironment(id: number): Promise<LabEnvironment | undefined>;
  createLabEnvironment(environment: InsertLabEnvironment): Promise<LabEnvironment>;
  updateLabEnvironment(id: number, updates: Partial<LabEnvironment>): Promise<LabEnvironment | undefined>;
  deleteLabEnvironment(id: number): Promise<boolean>;
  
  getLabInstance(id: number): Promise<LabInstance | undefined>;
  getUserLabInstances(userId: number): Promise<LabInstance[]>;
  createLabInstance(instance: InsertLabInstance): Promise<LabInstance>;
  updateLabInstanceState(id: number, state: string, details?: any): Promise<LabInstance | undefined>;
  terminateLabInstance(id: number): Promise<boolean>;
  
  getLabTasks(environmentId: number): Promise<LabTask[]>;
  getLabTask(id: number): Promise<LabTask | undefined>;
  createLabTask(task: InsertLabTask): Promise<LabTask>;
  updateLabTask(id: number, updates: Partial<LabTask>): Promise<LabTask | undefined>;
  deleteLabTask(id: number): Promise<boolean>;
  
  getLabTaskProgress(userId: number, instanceId: number): Promise<UserLabTaskProgress[]>;
  updateLabTaskProgress(progress: InsertUserLabTaskProgress): Promise<UserLabTaskProgress>;
  verifyLabTask(userId: number, instanceId: number, taskId: number, solution: string): Promise<{ 
    success: boolean; 
    message: string; 
    points: number;
    completedTask?: UserLabTaskProgress;
  }>;
  
  getLabResources(environmentId: number): Promise<LabResource[]>;
  createLabResource(resource: InsertLabResource): Promise<LabResource>;
  updateLabResource(id: number, updates: Partial<LabResource>): Promise<LabResource | undefined>;
  deleteLabResource(id: number): Promise<boolean>;
  
  // LMS Enhancement methods
  getCourses(filters?: { difficulty?: string; tags?: string[]; status?: string }): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  
  getCourseModules(courseId: number): Promise<CourseModule[]>;
  getCourseModule(id: number): Promise<CourseModule | undefined>;
  createCourseModule(module: InsertCourseModule): Promise<CourseModule>;
  updateCourseModule(id: number, updates: Partial<CourseModule>): Promise<CourseModule | undefined>;
  deleteCourseModule(id: number): Promise<boolean>;
  
  getCourseContentItems(moduleId: number): Promise<CourseContentItem[]>;
  getCourseContentItem(id: number): Promise<CourseContentItem | undefined>;
  createCourseContentItem(item: InsertCourseContentItem): Promise<CourseContentItem>;
  updateCourseContentItem(id: number, updates: Partial<CourseContentItem>): Promise<CourseContentItem | undefined>;
  deleteCourseContentItem(id: number): Promise<boolean>;
  
  enrollUserInCourse(enrollment: InsertCourseEnrollment): Promise<CourseEnrollment>;
  getUserEnrollments(userId: number): Promise<CourseEnrollment[]>;
  getCourseEnrollments(courseId: number): Promise<CourseEnrollment[]>;
  updateEnrollmentProgress(userId: number, courseId: number, updates: Partial<CourseEnrollment>): Promise<CourseEnrollment | undefined>;
  
  getUserContentProgress(userId: number, contentItemId: number): Promise<ContentProgress | undefined>;
  updateContentProgress(progress: InsertContentProgress): Promise<ContentProgress>;
  
  issueCertificate(certificate: InsertCertificate): Promise<Certificate>;
  getUserCertificates(userId: number): Promise<Certificate[]>;
  verifyCertificate(verificationCode: string): Promise<Certificate | undefined>;

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

export class DatabaseStorage implements IStorage {
  // Analytics & Admin methods
  async getUsers(): Promise<User[]> {
    try {
      const allUsers = await db.select().from(users).orderBy(asc(users.id));
      return allUsers;
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }
  
  async getPlatformStats(): Promise<{
    totalUsers: number;
    totalRoadmaps: number;
    activeUsers: number;
    totalComments: number;
    totalDiscussions: number;
    averageCompletionRate: number;
  }> {
    try {
      // Get total users count
      const users = await db.select({ count: count() }).from(schema.users);
      const totalUsers = Number(users[0].count) || 0;
      
      // Get total roadmaps count
      const roadmapsCount = await db.select({ count: count() }).from(schema.roadmaps);
      const totalRoadmaps = Number(roadmapsCount[0].count) || 0;
      
      // For now, estimate active users as 70% of total users for demo purposes
      const activeUsers = Math.ceil(totalUsers * 0.7);
      
      // Get total comments
      const commentsCount = await db.select({ count: count() }).from(schema.comments);
      const totalComments = Number(commentsCount[0].count) || 0;
      
      // Get total discussions
      const discussionsCount = await db.select({ count: count() }).from(schema.discussionTopics);
      const totalDiscussions = Number(discussionsCount[0].count) || 0;
      
      // For demo purposes, assign a reasonable average completion rate
      const averageCompletionRate = 47.5;
      
      return {
        totalUsers,
        totalRoadmaps,
        activeUsers,
        totalComments,
        totalDiscussions,
        averageCompletionRate
      };
    } catch (error) {
      console.error("Error in getPlatformStats:", error);
      // Return default values if there's an error
      return {
        totalUsers: 0,
        totalRoadmaps: 0, 
        activeUsers: 0,
        totalComments: 0,
        totalDiscussions: 0,
        averageCompletionRate: 0
      };
    }
  }
  
  async getUserEngagement(days: number): Promise<{
    dates: string[];
    logins: number[];
    comments: number[];
    discussions: number[];
    progress: number[];
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Generate array of dates for the last n days
    const dates: string[] = [];
    const logins: number[] = Array(days).fill(0);
    const comments: number[] = Array(days).fill(0);
    const discussions: number[] = Array(days).fill(0);
    const progress: number[] = Array(days).fill(0);
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Format as YYYY-MM-DD
      dates.unshift(date.toISOString().split('T')[0]);
    }
    
    // Get login activity (from activity logs)
    const loginActivities = await db.select({
      timestamp: schema.activityLogs.timestamp,
      type: schema.activityLogs.activityType
    })
    .from(schema.activityLogs)
    .where(and(
      eq(schema.activityLogs.activityType, 'login'),
      gt(schema.activityLogs.timestamp, startDate)
    ));
    
    // Count login activities by day
    for (const activity of loginActivities) {
      const activityDate = activity.timestamp.toISOString().split('T')[0];
      const dateIndex = dates.indexOf(activityDate);
      if (dateIndex !== -1) {
        logins[dateIndex]++;
      }
    }
    
    // Get comment activities
    const commentActivities = await db.select({
      createdAt: schema.comments.createdAt
    })
    .from(schema.comments)
    .where(gt(schema.comments.createdAt, startDate));
    
    // Count comment activities by day
    for (const activity of commentActivities) {
      const activityDate = activity.createdAt.toISOString().split('T')[0];
      const dateIndex = dates.indexOf(activityDate);
      if (dateIndex !== -1) {
        comments[dateIndex]++;
      }
    }
    
    // Get discussion activities
    const discussionActivities = await db.select({
      createdAt: schema.discussionTopics.createdAt
    })
    .from(schema.discussionTopics)
    .where(gt(schema.discussionTopics.createdAt, startDate));
    
    // Count discussion activities by day
    for (const activity of discussionActivities) {
      const activityDate = activity.createdAt.toISOString().split('T')[0];
      const dateIndex = dates.indexOf(activityDate);
      if (dateIndex !== -1) {
        discussions[dateIndex]++;
      }
    }
    
    // Get progress update activities
    const progressActivities = await db.select({
      updatedAt: schema.userProgress.updatedAt
    })
    .from(schema.userProgress)
    .where(gt(schema.userProgress.updatedAt, startDate));
    
    // Count progress update activities by day
    for (const activity of progressActivities) {
      const activityDate = activity.updatedAt.toISOString().split('T')[0];
      const dateIndex = dates.indexOf(activityDate);
      if (dateIndex !== -1) {
        progress[dateIndex]++;
      }
    }
    
    return {
      dates,
      logins,
      comments,
      discussions,
      progress
    };
  }
  
  async getLearningVelocity(): Promise<{
    users: { userId: number; username: string; avgNodesPerWeek: number; lastActive: Date }[];
    overall: { period: string; average: number }[];
  }> {
    // Get all user progress data
    const progressData = await db.select({
      userId: schema.userProgress.userId,
      progress: schema.userProgress.progress,
      startedAt: schema.userProgress.startedAt,
      updatedAt: schema.userProgress.updatedAt
    })
    .from(schema.userProgress);
    
    // Process to calculate learning velocity
    const userVelocities: Map<number, {
      userId: number;
      completedNodes: number;
      startedAt: Date;
      lastActive: Date;
      daysSinceStart: number;
    }> = new Map();
    
    // Calculate velocity for each user
    for (const entry of progressData) {
      const progress = entry.progress as any;
      if (!progress || !progress.completedNodes) continue;
      
      const userId = entry.userId;
      const completedNodes = progress.completedNodes || 0;
      const startedAt = entry.startedAt;
      const updatedAt = entry.updatedAt;
      
      const today = new Date();
      const daysSinceStart = Math.max(1, Math.ceil((today.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24)));
      
      if (userVelocities.has(userId)) {
        const existing = userVelocities.get(userId)!;
        userVelocities.set(userId, {
          userId,
          completedNodes: existing.completedNodes + completedNodes,
          startedAt: new Date(Math.min(existing.startedAt.getTime(), startedAt.getTime())),
          lastActive: new Date(Math.max(existing.lastActive.getTime(), updatedAt.getTime())),
          daysSinceStart: Math.max(existing.daysSinceStart, daysSinceStart)
        });
      } else {
        userVelocities.set(userId, {
          userId,
          completedNodes,
          startedAt,
          lastActive: updatedAt,
          daysSinceStart
        });
      }
    }
    
    // Calculate average nodes per week for each user
    const userResults: { userId: number; username: string; avgNodesPerWeek: number; lastActive: Date }[] = [];
    
    // Fetch usernames for all users with velocity data
    const userIds = Array.from(userVelocities.keys());
    const usernames = await db.select({
      id: schema.users.id,
      username: schema.users.username
    })
    .from(schema.users)
    .where(inArray(schema.users.id, userIds));
    
    // Create a map of user IDs to usernames
    const usernameMap = new Map(usernames.map(u => [u.id, u.username]));
    
    // Calculate velocity for each user
    for (const [userId, data] of userVelocities.entries()) {
      const weeksActive = Math.max(1, data.daysSinceStart / 7);
      const avgNodesPerWeek = Number((data.completedNodes / weeksActive).toFixed(2));
      
      userResults.push({
        userId,
        username: usernameMap.get(userId) || `User ${userId}`,
        avgNodesPerWeek,
        lastActive: data.lastActive
      });
    }
    
    // Sort by velocity (highest first)
    userResults.sort((a, b) => b.avgNodesPerWeek - a.avgNodesPerWeek);
    
    // Calculate overall averages for different time periods
    let totalNodesCompleted = 0;
    let totalDays = 0;
    
    for (const data of userVelocities.values()) {
      totalNodesCompleted += data.completedNodes;
      totalDays += data.daysSinceStart;
    }
    
    const avgNodesPerDay = totalDays > 0 ? totalNodesCompleted / totalDays : 0;
    
    return {
      users: userResults,
      overall: [
        { period: "Daily", average: Number(avgNodesPerDay.toFixed(2)) },
        { period: "Weekly", average: Number((avgNodesPerDay * 7).toFixed(2)) },
        { period: "Monthly", average: Number((avgNodesPerDay * 30).toFixed(2)) }
      ]
    };
  }
  
  async getRoadmapPopularity(): Promise<{
    roadmapId: number;
    title: string;
    userCount: number;
    completionRate: number;
    averageTimeSpent: number;
  }[]> {
    // Get all roadmaps
    const roadmaps = await db.select({
      id: schema.roadmaps.id,
      title: schema.roadmaps.title
    }).from(schema.roadmaps);
    
    const results: {
      roadmapId: number;
      title: string;
      userCount: number;
      completionRate: number;
      averageTimeSpent: number;
    }[] = [];
    
    // For each roadmap, get popularity metrics
    for (const roadmap of roadmaps) {
      // Get user progress for this roadmap
      const progressEntries = await db.select({
        userId: schema.userProgress.userId,
        progress: schema.userProgress.progress,
        startedAt: schema.userProgress.startedAt,
        updatedAt: schema.userProgress.updatedAt
      })
      .from(schema.userProgress)
      .where(eq(schema.userProgress.roadmapId, roadmap.id));
      
      const userCount = progressEntries.length;
      
      // Calculate completion rate
      let totalCompletionRate = 0;
      let totalTimeSpent = 0;
      
      for (const entry of progressEntries) {
        const progress = entry.progress as any;
        if (progress && progress.completedNodes && progress.totalNodes) {
          totalCompletionRate += (progress.completedNodes / progress.totalNodes) * 100;
          
          // Calculate time spent (in hours)
          const startTime = entry.startedAt.getTime();
          const latestTime = entry.updatedAt.getTime();
          const diffHours = (latestTime - startTime) / (1000 * 60 * 60);
          
          // Cap time spent at a reasonable maximum per roadmap (48 hours)
          totalTimeSpent += Math.min(diffHours, 48);
        }
      }
      
      const completionRate = userCount > 0 ? Number((totalCompletionRate / userCount).toFixed(2)) : 0;
      const averageTimeSpent = userCount > 0 ? Number((totalTimeSpent / userCount).toFixed(2)) : 0;
      
      results.push({
        roadmapId: roadmap.id,
        title: roadmap.title,
        userCount,
        completionRate,
        averageTimeSpent
      });
    }
    
    // Sort by user count (descending)
    return results.sort((a, b) => b.userCount - a.userCount);
  }
  
  async getExperienceProgression(): Promise<{
    levels: { level: number; userCount: number }[];
    xpSources: { source: string; percentage: number }[];
    avgDaysToLevel: { level: number; days: number }[];
  }> {
    // Get all user experience levels
    const userExperienceData = await db.select({
      userId: schema.userExperience.userId,
      currentLevel: schema.userExperience.currentLevel,
      totalExperience: schema.userExperience.totalExperience,
      updatedAt: schema.userExperience.updatedAt
    }).from(schema.userExperience);
    
    // Count users at each level
    const levelCounts = new Map<number, number>();
    
    for (const data of userExperienceData) {
      const level = data.currentLevel;
      levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
    }
    
    // Convert to array of {level, userCount}
    const levels = Array.from(levelCounts.entries()).map(([level, userCount]) => ({
      level,
      userCount
    })).sort((a, b) => a.level - b.level);
    
    // Get experience transaction sources
    const xpTransactions = await db.select({
      amount: schema.experienceTransactions.amount,
      reason: schema.experienceTransactions.reason
    }).from(schema.experienceTransactions);
    
    // Group by reason and calculate percentages
    const xpBySource = new Map<string, number>();
    let totalXP = 0;
    
    for (const tx of xpTransactions) {
      const source = tx.reason;
      const amount = tx.amount;
      totalXP += amount;
      xpBySource.set(source, (xpBySource.get(source) || 0) + amount);
    }
    
    // Calculate percentages
    const xpSources = Array.from(xpBySource.entries())
      .map(([source, amount]) => ({
        source,
        percentage: Number(((amount / totalXP) * 100).toFixed(2))
      }))
      .sort((a, b) => b.percentage - a.percentage);
    
    // Get average days to reach each level
    // This requires level-up events from experience transactions
    const levelUpEvents = await db.select({
      userId: schema.experienceTransactions.userId,
      createdAt: schema.experienceTransactions.createdAt,
      reason: schema.experienceTransactions.reason,
      amount: schema.experienceTransactions.amount
    })
    .from(schema.experienceTransactions)
    .where(like(schema.experienceTransactions.reason, 'Level up to%'));
    
    // Group level-up events by user and calculate days between levels
    const userLevelUps = new Map<number, Map<number, Date>>();
    
    for (const event of levelUpEvents) {
      const userId = event.userId;
      const levelMatch = event.reason.match(/Level up to (\d+)/);
      if (!levelMatch) continue;
      
      const level = parseInt(levelMatch[1]);
      const date = event.createdAt;
      
      if (!userLevelUps.has(userId)) {
        userLevelUps.set(userId, new Map());
      }
      
      userLevelUps.get(userId)!.set(level, date);
    }
    
    // Calculate average days to reach each level
    const levelDaysSum = new Map<number, { total: number, count: number }>();
    
    for (const [userId, levelDates] of userLevelUps.entries()) {
      const levels = Array.from(levelDates.keys()).sort((a, b) => a - b);
      
      for (let i = 1; i < levels.length; i++) {
        const previousLevel = levels[i - 1];
        const currentLevel = levels[i];
        const previousDate = levelDates.get(previousLevel)!;
        const currentDate = levelDates.get(currentLevel)!;
        
        const daysDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (!levelDaysSum.has(currentLevel)) {
          levelDaysSum.set(currentLevel, { total: 0, count: 0 });
        }
        
        const data = levelDaysSum.get(currentLevel)!;
        data.total += daysDiff;
        data.count += 1;
      }
    }
    
    // Convert to array of {level, days}
    const avgDaysToLevel = Array.from(levelDaysSum.entries())
      .map(([level, data]) => ({
        level,
        days: Number((data.total / data.count).toFixed(2))
      }))
      .sort((a, b) => a.level - b.level);
    
    return {
      levels,
      xpSources,
      avgDaysToLevel
    };
  }
  
  async getActiveUsers(period: string): Promise<{
    count: number;
    trend: number;
    byDay: { day: string; count: number }[];
  }> {
    let daysToLookBack = 7;
    
    // Set time period based on input
    switch (period) {
      case 'day':
        daysToLookBack = 1;
        break;
      case 'week':
        daysToLookBack = 7;
        break;
      case 'month':
        daysToLookBack = 30;
        break;
      default:
        daysToLookBack = 7;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToLookBack);
    
    // Previous period for trend calculation
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysToLookBack);
    
    // Query active users in current period
    const activeUsersQuery = await db.select({ userId: schema.activityLogs.userId })
      .from(schema.activityLogs)
      .where(gt(schema.activityLogs.timestamp, startDate))
      .groupBy(schema.activityLogs.userId);
    
    const activeUsersCount = activeUsersQuery.length;
    
    // Query active users in previous period for trend
    const previousActiveUsersQuery = await db.select({ userId: schema.activityLogs.userId })
      .from(schema.activityLogs)
      .where(and(
        gt(schema.activityLogs.timestamp, previousStartDate),
        lt(schema.activityLogs.timestamp, startDate)
      ))
      .groupBy(schema.activityLogs.userId);
    
    const previousActiveUsersCount = previousActiveUsersQuery.length;
    
    // Calculate trend (percentage change)
    let trend = 0;
    if (previousActiveUsersCount > 0) {
      trend = Number((((activeUsersCount - previousActiveUsersCount) / previousActiveUsersCount) * 100).toFixed(2));
    }
    
    // Get daily active users
    const byDay: { day: string; count: number }[] = [];
    
    for (let i = 0; i < daysToLookBack; i++) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dailyActiveUsersQuery = await db.select({ userId: schema.activityLogs.userId })
        .from(schema.activityLogs)
        .where(and(
          gte(schema.activityLogs.timestamp, dayStart),
          lte(schema.activityLogs.timestamp, dayEnd)
        ))
        .groupBy(schema.activityLogs.userId);
      
      byDay.unshift({
        day: dayStart.toISOString().split('T')[0],
        count: dailyActiveUsersQuery.length
      });
    }
    
    return {
      count: activeUsersCount,
      trend,
      byDay
    };
  }
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
    
    // Initialize default user levels - but don't block construction if it fails
    this.initializeDefaultUserLevels().catch(err => {
      console.error("Failed to initialize default user levels, but continuing:", err);
    });
  }

  private async initializeDefaultUserLevels() {
    try {
      // Check if levels already exist
      const existingLevels = await db.select().from(userLevels);
      if (existingLevels.length > 0) return;

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
      { level: 9, experienceRequired: 3600, title: "Luminary", description: "Guiding light in the field", benefits: "+4 skill points" },
      { level: 10, experienceRequired: 5000, title: "Legend", description: "Legendary status achieved", benefits: "+5 skill points & all roadmaps" },
    ];

    for (const level of defaultLevels) {
      await this.createUserLevel(level);
    }
    } catch (error) {
      console.error("Error initializing default user levels:", error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Roadmap methods
  async getRoadmap(id: number): Promise<Roadmap | undefined> {
    const [roadmap] = await db.select().from(roadmaps).where(eq(roadmaps.id, id));
    return roadmap;
  }

  async getRoadmaps(type?: string): Promise<Roadmap[]> {
    if (type) {
      return db.select().from(roadmaps).where(eq(roadmaps.type, type));
    }
    return db.select().from(roadmaps);
  }

  async createRoadmap(insertRoadmap: InsertRoadmap): Promise<Roadmap> {
    const [roadmap] = await db.insert(roadmaps).values(insertRoadmap).returning();
    return roadmap;
  }

  async updateRoadmap(id: number, roadmapData: Partial<Roadmap>): Promise<Roadmap | undefined> {
    const [updatedRoadmap] = await db
      .update(roadmaps)
      .set(roadmapData)
      .where(eq(roadmaps.id, id))
      .returning();
    return updatedRoadmap;
  }

  async deleteRoadmap(id: number): Promise<boolean> {
    const result = await db.delete(roadmaps).where(eq(roadmaps.id, id));
    return true; // In PostgreSQL with Drizzle, a successful deletion will not throw an error
  }

  // User Progress methods
  async getUserProgress(userId: number, roadmapId?: number): Promise<UserProgress[]> {
    if (roadmapId) {
      return db
        .select()
        .from(userProgress)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.roadmapId, roadmapId)));
    }
    return db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values(insertProgress).returning();
    return progress;
  }

  async updateUserProgress(userId: number, roadmapId: number, progressData: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const [updatedProgress] = await db
      .update(userProgress)
      .set(progressData)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.roadmapId, roadmapId)))
      .returning();
    return updatedProgress;
  }

  // Bookmark methods
  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return db.select().from(bookmarks).where(eq(bookmarks.userId, userId));
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const [bookmark] = await db.insert(bookmarks).values(insertBookmark).returning();
    return bookmark;
  }

  async deleteBookmark(userId: number, roadmapId: number): Promise<boolean> {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.roadmapId, roadmapId)));
    return true;
  }

  async getBookmark(userId: number, roadmapId: number): Promise<Bookmark | undefined> {
    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.roadmapId, roadmapId)));
    return bookmark;
  }

  // Activity Log methods
  async getActivityLogs(userId: number, days?: number): Promise<ActivityLog[]> {
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - days);
      return db
        .select()
        .from(activityLogs)
        .where(and(eq(activityLogs.userId, userId), gte(activityLogs.date, date)))
        .orderBy(desc(activityLogs.date));
    }
    return db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.date));
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLogs).values(insertLog).returning();
    return log;
  }

  // User Level methods
  async getUserLevels(): Promise<UserLevel[]> {
    return db.select().from(userLevels).orderBy(asc(userLevels.level));
  }

  async getUserLevel(level: number): Promise<UserLevel | undefined> {
    const [userLevel] = await db.select().from(userLevels).where(eq(userLevels.level, level));
    return userLevel;
  }

  async createUserLevel(insertLevel: InsertUserLevel): Promise<UserLevel> {
    const [level] = await db.insert(userLevels).values(insertLevel).returning();
    return level;
  }

  async updateUserLevel(id: number, levelData: Partial<UserLevel>): Promise<UserLevel | undefined> {
    const [updatedLevel] = await db
      .update(userLevels)
      .set(levelData)
      .where(eq(userLevels.id, id))
      .returning();
    return updatedLevel;
  }

  // User Experience methods
  async getUserExperience(userId: number): Promise<UserExperience | undefined> {
    const [experience] = await db
      .select()
      .from(userExperience)
      .where(eq(userExperience.userId, userId));
    return experience;
  }

  async createUserExperience(insertExp: InsertUserExperience): Promise<UserExperience> {
    const [exp] = await db.insert(userExperience).values(insertExp).returning();
    return exp;
  }

  async updateUserExperience(userId: number, expData: Partial<UserExperience>): Promise<UserExperience | undefined> {
    const [updatedExp] = await db
      .update(userExperience)
      .set(expData)
      .where(eq(userExperience.userId, userId))
      .returning();
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
    
    // Create transaction record
    await this.createExperienceTransaction({
      userId,
      amount,
      reason,
      roadmapId,
      nodeId
    });
    
    // Calculate new experience and level
    const newTotalExp = userExp.totalExperience + amount;
    let newLevel = userExp.currentLevel;
    let newSkillPoints = userExp.skillPoints;
    
    // Check if user leveled up
    if (newLevel < 10) { // Max level is 10
      const nextLevel = await this.getNextLevel(userExp.currentLevel, newTotalExp);
      
      if (nextLevel > userExp.currentLevel) {
        // Award skill points for leveling up
        const skillPointsGain = await this.calculateSkillPointsGain(userExp.currentLevel, nextLevel);
        newSkillPoints += skillPointsGain;
        newLevel = nextLevel;
      }
    }
    
    // Update user experience
    return this.updateUserExperience(userId, {
      totalExperience: newTotalExp,
      currentLevel: newLevel,
      skillPoints: newSkillPoints
    }) as Promise<UserExperience>;
  }

  private async getNextLevel(currentLevel: number, totalExp: number): Promise<number> {
    // Get all levels
    const levels = await this.getUserLevels();
    let nextLevel = currentLevel;
    
    // Find the highest level the user qualifies for
    for (const level of levels) {
      if (totalExp >= level.experienceRequired && level.level > nextLevel) {
        nextLevel = level.level;
      }
    }
    
    return nextLevel;
  }

  private async calculateSkillPointsGain(oldLevel: number, newLevel: number): Promise<number> {
    let skillPoints = 0;
    const levels = await this.getUserLevels();
    
    // Map levels by level number for easier lookup
    const levelMap = new Map<number, UserLevel>();
    for (const level of levels) {
      levelMap.set(level.level, level);
    }
    
    // Calculate skill points based on level benefits
    for (let i = oldLevel + 1; i <= newLevel; i++) {
      const level = levelMap.get(i);
      if (level) {
        const benefits = level.benefits || "";
        
        if (benefits.includes("+1 skill point")) {
          skillPoints += 1;
        } else if (benefits.includes("+2 skill points")) {
          skillPoints += 2;
        } else if (benefits.includes("+3 skill points")) {
          skillPoints += 3;
        } else if (benefits.includes("+4 skill points")) {
          skillPoints += 4;
        } else if (benefits.includes("+5 skill points")) {
          skillPoints += 5;
        }
      }
    }
    
    return skillPoints;
  }

  // Badge Category methods
  async getBadgeCategories(): Promise<BadgeCategory[]> {
    return db.select().from(badgeCategories);
  }

  async getBadgeCategory(id: number): Promise<BadgeCategory | undefined> {
    const [category] = await db
      .select()
      .from(badgeCategories)
      .where(eq(badgeCategories.id, id));
    return category;
  }

  async createBadgeCategory(insertCategory: InsertBadgeCategory): Promise<BadgeCategory> {
    const [category] = await db.insert(badgeCategories).values(insertCategory).returning();
    return category;
  }

  // Badge methods
  async getBadges(categoryId?: number): Promise<Badge[]> {
    if (categoryId) {
      return db.select().from(badges).where(eq(badges.categoryId, categoryId));
    }
    return db.select().from(badges);
  }

  async getBadge(id: number): Promise<Badge | undefined> {
    const [badge] = await db.select().from(badges).where(eq(badges.id, id));
    return badge;
  }

  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const [badge] = await db.insert(badges).values(insertBadge).returning();
    return badge;
  }

  // User Badge methods
  async getUserBadges(userId: number): Promise<(UserBadge & { badge: Badge })[]> {
    const userBadgesWithBadgeInfo = await db
      .select({
        id: userBadges.id,
        userId: userBadges.userId,
        badgeId: userBadges.badgeId,
        awardedAt: userBadges.awardedAt,
        badge: badges
      })
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .innerJoin(badges, eq(userBadges.badgeId, badges.id));
    
    return userBadgesWithBadgeInfo;
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge | undefined> {
    // Check if user already has the badge
    const hasBadge = await this.hasBadge(userId, badgeId);
    if (hasBadge) return undefined;
    
    // Get badge to award experience
    const badge = await this.getBadge(badgeId);
    if (badge && badge.experienceAwarded > 0) {
      await this.awardExperience(userId, badge.experienceAwarded, `Earned badge: ${badge.name}`);
    }
    
    // Add badge to user
    const [userBadge] = await db
      .insert(userBadges)
      .values({ userId, badgeId })
      .returning();
    
    // Award skill points if any
    if (badge && badge.skillPointsAwarded > 0) {
      const userExp = await this.getUserExperience(userId);
      if (userExp) {
        await this.updateUserExperience(userId, {
          skillPoints: userExp.skillPoints + badge.skillPointsAwarded
        });
      }
    }
    
    // Get the full badge information
    const fullBadge = await this.getBadge(badgeId);
    
    return userBadge ? { ...userBadge, badge: fullBadge! } : undefined;
  }

  async hasBadge(userId: number, badgeId: number): Promise<boolean> {
    const [userBadge] = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
    return !!userBadge;
  }

  // User Skill methods
  async getUserSkills(userId: number): Promise<UserSkill[]> {
    return db.select().from(userSkills).where(eq(userSkills.userId, userId));
  }

  async getUserSkill(userId: number, skillName: string): Promise<UserSkill | undefined> {
    const [skill] = await db
      .select()
      .from(userSkills)
      .where(and(eq(userSkills.userId, userId), eq(userSkills.skillName, skillName)));
    return skill;
  }

  async createUserSkill(insertSkill: InsertUserSkill): Promise<UserSkill> {
    const [skill] = await db.insert(userSkills).values(insertSkill).returning();
    return skill;
  }

  async updateUserSkill(userId: number, skillName: string, points: number): Promise<UserSkill | undefined> {
    // Get existing skill
    const existingSkill = await this.getUserSkill(userId, skillName);
    
    if (!existingSkill) {
      // Create new skill if it doesn't exist
      return this.createUserSkill({
        userId,
        skillName,
        skillLevel: 1,
        pointsInvested: points
      });
    }
    
    // Calculate new skill level
    // Every 5 points = 1 level
    const totalPoints = existingSkill.pointsInvested + points;
    const newLevel = Math.floor(totalPoints / 5) + 1;
    
    // Update skill
    const [updatedSkill] = await db
      .update(userSkills)
      .set({
        pointsInvested: totalPoints,
        skillLevel: newLevel
      })
      .where(and(eq(userSkills.userId, userId), eq(userSkills.skillName, skillName)))
      .returning();
    
    return updatedSkill;
  }

  // Experience Transaction methods
  async getExperienceTransactions(userId: number, limit?: number): Promise<ExperienceTransaction[]> {
    let query = db
      .select()
      .from(experienceTransactions)
      .where(eq(experienceTransactions.userId, userId))
      .orderBy(desc(experienceTransactions.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return query;
  }

  async createExperienceTransaction(insertTransaction: InsertExperienceTransaction): Promise<ExperienceTransaction> {
    const [transaction] = await db
      .insert(experienceTransactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  // Comment methods
  async getComments(roadmapId?: number, nodeId?: string): Promise<Comment[]> {
    let query = db.select().from(comments);
    
    if (roadmapId && nodeId) {
      query = query.where(and(
        eq(comments.roadmapId, roadmapId),
        eq(comments.nodeId, nodeId),
        isNull(comments.parentId)
      ));
    } else if (roadmapId) {
      query = query.where(and(
        eq(comments.roadmapId, roadmapId),
        isNull(comments.parentId)
      ));
    } else {
      query = query.where(isNull(comments.parentId));
    }
    
    return query.orderBy(desc(comments.createdAt));
  }

  async getCommentById(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async updateComment(id: number, content: string): Promise<Comment | undefined> {
    const [updatedComment] = await db
      .update(comments)
      .set({ content, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    // First delete all reactions to this comment
    await db.delete(commentReactions).where(eq(commentReactions.commentId, id));
    
    // Then delete all replies to this comment
    await db.delete(comments).where(eq(comments.parentId, id));
    
    // Finally delete the comment itself
    await db.delete(comments).where(eq(comments.id, id));
    
    return true;
  }

  async getCommentReplies(parentId: number): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.parentId, parentId))
      .orderBy(asc(comments.createdAt));
  }

  // Comment Reaction methods
  async getCommentReactions(commentId: number): Promise<CommentReaction[]> {
    return db
      .select()
      .from(commentReactions)
      .where(eq(commentReactions.commentId, commentId));
  }

  async addCommentReaction(insertReaction: InsertCommentReaction): Promise<CommentReaction> {
    try {
      const [reaction] = await db
        .insert(commentReactions)
        .values(insertReaction)
        .returning();
      return reaction;
    } catch (error) {
      // If there's a unique constraint violation, user already reacted with this reaction
      // Just return the existing reaction
      const [existingReaction] = await db
        .select()
        .from(commentReactions)
        .where(and(
          eq(commentReactions.userId, insertReaction.userId),
          eq(commentReactions.commentId, insertReaction.commentId),
          eq(commentReactions.reaction, insertReaction.reaction)
        ));
      
      if (existingReaction) {
        return existingReaction;
      }
      
      throw error;
    }
  }

  async removeCommentReaction(userId: number, commentId: number, reaction: string): Promise<boolean> {
    await db
      .delete(commentReactions)
      .where(and(
        eq(commentReactions.userId, userId),
        eq(commentReactions.commentId, commentId),
        eq(commentReactions.reaction, reaction)
      ));
    
    return true;
  }

  // Resource methods
  async getResources(type?: string): Promise<Resource[]> {
    if (type) {
      return db.select().from(resources).where(eq(resources.type, type));
    }
    return db.select().from(resources);
  }

  async getResourceById(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db.insert(resources).values(insertResource).returning();
    return resource;
  }

  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined> {
    const [updatedResource] = await db
      .update(resources)
      .set(resourceData)
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }

  async deleteResource(id: number): Promise<boolean> {
    // First delete references in roadmapNodeResources
    await db.delete(roadmapNodeResources).where(eq(roadmapNodeResources.resourceId, id));
    
    // Then delete the resource
    await db.delete(resources).where(eq(resources.id, id));
    
    return true;
  }

  // Roadmap Node Resource methods
  async getRoadmapNodeResources(roadmapId: number, nodeId: string): Promise<(RoadmapNodeResource & { resource: Resource })[]> {
    return db
      .select({
        id: roadmapNodeResources.id,
        roadmapId: roadmapNodeResources.roadmapId,
        nodeId: roadmapNodeResources.nodeId,
        resourceId: roadmapNodeResources.resourceId,
        order: roadmapNodeResources.order,
        createdAt: roadmapNodeResources.createdAt,
        resource: resources
      })
      .from(roadmapNodeResources)
      .where(and(
        eq(roadmapNodeResources.roadmapId, roadmapId),
        eq(roadmapNodeResources.nodeId, nodeId)
      ))
      .innerJoin(resources, eq(roadmapNodeResources.resourceId, resources.id))
      .orderBy(asc(roadmapNodeResources.order));
  }

  async addResourceToNode(insertNodeResource: InsertRoadmapNodeResource): Promise<RoadmapNodeResource> {
    const [nodeResource] = await db
      .insert(roadmapNodeResources)
      .values(insertNodeResource)
      .returning();
    return nodeResource;
  }

  async removeResourceFromNode(roadmapId: number, nodeId: string, resourceId: number): Promise<boolean> {
    await db
      .delete(roadmapNodeResources)
      .where(and(
        eq(roadmapNodeResources.roadmapId, roadmapId),
        eq(roadmapNodeResources.nodeId, nodeId),
        eq(roadmapNodeResources.resourceId, resourceId)
      ));
    
    return true;
  }

  async reorderNodeResources(roadmapId: number, nodeId: string, resourceIds: number[]): Promise<RoadmapNodeResource[]> {
    const updates: Promise<RoadmapNodeResource>[] = [];
    
    // Update order for each resource
    for (let i = 0; i < resourceIds.length; i++) {
      const resourceId = resourceIds[i];
      const [updated] = await db
        .update(roadmapNodeResources)
        .set({ order: i })
        .where(and(
          eq(roadmapNodeResources.roadmapId, roadmapId),
          eq(roadmapNodeResources.nodeId, nodeId),
          eq(roadmapNodeResources.resourceId, resourceId)
        ))
        .returning();
      
      if (updated) {
        updates.push(updated);
      }
    }
    
    return updates;
  }

  // Discussion Topic methods
  async getDiscussionTopics(roadmapId?: number, nodeId?: string): Promise<DiscussionTopic[]> {
    let query = db.select().from(discussionTopics);
    
    if (roadmapId && nodeId) {
      query = query.where(and(
        eq(discussionTopics.roadmapId, roadmapId),
        eq(discussionTopics.nodeId, nodeId)
      ));
    } else if (roadmapId) {
      query = query.where(eq(discussionTopics.roadmapId, roadmapId));
    }
    
    return query.orderBy(desc(discussionTopics.createdAt));
  }

  async getDiscussionTopicById(id: number): Promise<DiscussionTopic | undefined> {
    const [topic] = await db.select().from(discussionTopics).where(eq(discussionTopics.id, id));
    return topic;
  }

  async createDiscussionTopic(insertTopic: InsertDiscussionTopic): Promise<DiscussionTopic> {
    const [topic] = await db.insert(discussionTopics).values(insertTopic).returning();
    return topic;
  }

  async updateDiscussionTopic(id: number, topicData: Partial<DiscussionTopic>): Promise<DiscussionTopic | undefined> {
    const [updatedTopic] = await db
      .update(discussionTopics)
      .set({ ...topicData, updatedAt: new Date() })
      .where(eq(discussionTopics.id, id))
      .returning();
    return updatedTopic;
  }

  async deleteDiscussionTopic(id: number): Promise<boolean> {
    // First delete all replies to this topic
    await db.delete(discussionReplies).where(eq(discussionReplies.topicId, id));
    
    // Then delete the topic itself
    await db.delete(discussionTopics).where(eq(discussionTopics.id, id));
    
    return true;
  }

  async incrementTopicViewCount(id: number): Promise<DiscussionTopic | undefined> {
    const [topic] = await db
      .select()
      .from(discussionTopics)
      .where(eq(discussionTopics.id, id));
    
    if (!topic) return undefined;
    
    const [updatedTopic] = await db
      .update(discussionTopics)
      .set({ viewCount: topic.viewCount + 1 })
      .where(eq(discussionTopics.id, id))
      .returning();
    
    return updatedTopic;
  }

  // Discussion Reply methods
  async getDiscussionReplies(topicId: number): Promise<DiscussionReply[]> {
    return db
      .select()
      .from(discussionReplies)
      .where(eq(discussionReplies.topicId, topicId))
      .orderBy(asc(discussionReplies.createdAt));
  }

  async getDiscussionReplyById(id: number): Promise<DiscussionReply | undefined> {
    const [reply] = await db.select().from(discussionReplies).where(eq(discussionReplies.id, id));
    return reply;
  }

  async createDiscussionReply(insertReply: InsertDiscussionReply): Promise<DiscussionReply> {
    const [reply] = await db.insert(discussionReplies).values(insertReply).returning();
    return reply;
  }

  async updateDiscussionReply(id: number, content: string): Promise<DiscussionReply | undefined> {
    const [updatedReply] = await db
      .update(discussionReplies)
      .set({ content, updatedAt: new Date() })
      .where(eq(discussionReplies.id, id))
      .returning();
    return updatedReply;
  }

  async deleteDiscussionReply(id: number): Promise<boolean> {
    await db.delete(discussionReplies).where(eq(discussionReplies.id, id));
    return true;
  }

  async markReplyAsAccepted(id: number): Promise<DiscussionReply | undefined> {
    // Get the reply to find its topic
    const [reply] = await db.select().from(discussionReplies).where(eq(discussionReplies.id, id));
    if (!reply) return undefined;
    
    // Reset isAcceptedAnswer for all replies in this topic
    await db
      .update(discussionReplies)
      .set({ isAcceptedAnswer: false })
      .where(eq(discussionReplies.topicId, reply.topicId));
    
    // Mark this reply as accepted
    const [updatedReply] = await db
      .update(discussionReplies)
      .set({ isAcceptedAnswer: true })
      .where(eq(discussionReplies.id, id))
      .returning();
    
    return updatedReply;
  }

  // Blog Post methods
  async getBlogPosts(status?: string, tag?: string): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    
    if (status) {
      query = query.where(eq(blogPosts.status, status));
    }
    
    if (tag) {
      // Query for posts that have the tag in their tags array
      query = query.where(sql`${tag} = ANY(${blogPosts.tags})`);
    }
    
    return query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    return post;
  }

  async updateBlogPost(id: number, postData: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return true;
  }

  async incrementBlogPostViewCount(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    if (!post) return undefined;
    
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ viewCount: post.viewCount + 1 })
      .where(eq(blogPosts.id, id))
      .returning();
    
    return updatedPost;
  }

  // Role management methods
  async getRoleByName(name: string): Promise<Role | undefined> {
    try {
      const [role] = await db.select().from(roles).where(eq(roles.name, name));
      return role;
    } catch (error) {
      console.error("Error getting role by name:", error);
      return undefined;
    }
  }

  async createRole(roleData: InsertRole): Promise<Role> {
    try {
      const [role] = await db.insert(roles).values(roleData).returning();
      return role;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      return await db.select().from(roles).orderBy(asc(roles.name));
    } catch (error) {
      console.error("Error getting roles:", error);
      return [];
    }
  }

  async getRole(id: number): Promise<Role | undefined> {
    try {
      const [role] = await db.select().from(roles).where(eq(roles.id, id));
      return role;
    } catch (error) {
      console.error("Error getting role by id:", error);
      return undefined;
    }
  }

  async updateRole(id: number, roleData: Partial<Role>): Promise<Role | undefined> {
    try {
      const [updatedRole] = await db
        .update(roles)
        .set({ ...roleData, updatedAt: new Date() })
        .where(eq(roles.id, id))
        .returning();
      return updatedRole;
    } catch (error) {
      console.error("Error updating role:", error);
      return undefined;
    }
  }

  async deleteRole(id: number): Promise<boolean> {
    try {
      await db.delete(roles).where(eq(roles.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting role:", error);
      return false;
    }
  }

  async assignRoleToUser(userRole: InsertUserRole): Promise<UserRole> {
    try {
      const [newUserRole] = await db.insert(userRoles).values(userRole).returning();
      return newUserRole;
    } catch (error) {
      console.error("Error assigning role to user:", error);
      throw error;
    }
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<boolean> {
    try {
      await db.delete(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
      return true;
    } catch (error) {
      console.error("Error removing role from user:", error);
      return false;
    }
  }

  async getUserRoles(userId: number): Promise<(Role & { assignedAt: Date })[]> {
    try {
      const result = await db
        .select({
          id: roles.id,
          name: roles.name,
          description: roles.description,
          permissions: roles.permissions,
          createdAt: roles.createdAt,
          updatedAt: roles.updatedAt,
          assignedAt: userRoles.assignedAt
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId));
      return result;
    } catch (error) {
      console.error("Error getting user roles:", error);
      return [];
    }
  }

  async hasPermission(userId: number, permission: string): Promise<boolean> {
    try {
      // Get user roles and check permissions
      const userRolesWithPermissions = await this.getUserRoles(userId);
      
      // Check if any role has the required permission
      return userRolesWithPermissions.some(role => 
        Array.isArray(role.permissions) && role.permissions.includes(permission)
      );
    } catch (error) {
      console.error("Error checking user permission:", error);
      return false;
    }
  }

  // Lab Environment Methods
  async getLabEnvironments(): Promise<LabEnvironment[]> {
    try {
      const environments = await db.select().from(labEnvironments).orderBy(asc(labEnvironments.id));
      return environments;
    } catch (error) {
      console.error("Error getting lab environments:", error);
      return [];
    }
  }

  async getLabEnvironment(id: number): Promise<LabEnvironment | undefined> {
    try {
      const [environment] = await db.select().from(labEnvironments).where(eq(labEnvironments.id, id));
      return environment;
    } catch (error) {
      console.error("Error getting lab environment:", error);
      return undefined;
    }
  }

  async createLabEnvironment(envData: InsertLabEnvironment): Promise<LabEnvironment> {
    try {
      const [newEnvironment] = await db.insert(labEnvironments).values(envData).returning();
      return newEnvironment;
    } catch (error) {
      console.error("Error creating lab environment:", error);
      throw error;
    }
  }

  async updateLabEnvironment(id: number, updates: Partial<LabEnvironment>): Promise<LabEnvironment | undefined> {
    try {
      const [updated] = await db
        .update(labEnvironments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(labEnvironments.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating lab environment:", error);
      return undefined;
    }
  }

  async deleteLabEnvironment(id: number): Promise<boolean> {
    try {
      await db.delete(labEnvironments).where(eq(labEnvironments.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting lab environment:", error);
      return false;
    }
  }

  // User management methods
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [updated] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  // Course Management Methods
  async getCourses(): Promise<Course[]> {
    try {
      const allCourses = await db.select().from(courses).orderBy(asc(courses.id));
      return allCourses;
    } catch (error) {
      console.error("Error getting courses:", error);
      return [];
    }
  }

  async getCourse(id: number): Promise<Course | undefined> {
    try {
      const [course] = await db.select().from(courses).where(eq(courses.id, id));
      return course;
    } catch (error) {
      console.error("Error getting course:", error);
      return undefined;
    }
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    try {
      const [newCourse] = await db.insert(courses).values(courseData).returning();
      return newCourse;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  }

  async updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined> {
    try {
      const [updated] = await db
        .update(courses)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(courses.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating course:", error);
      return undefined;
    }
  }

  async deleteCourse(id: number): Promise<boolean> {
    try {
      await db.delete(courses).where(eq(courses.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting course:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
