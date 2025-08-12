import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, unique, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Roadmap schema
export const roadmaps = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'role' or 'skill'
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  estimatedTime: text("estimated_time").notNull(),
  content: jsonb("content").notNull(), // JSON structure for roadmap content
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRoadmapSchema = createInsertSchema(roadmaps).pick({
  title: true,
  description: true,
  type: true,
  difficulty: true,
  estimatedTime: true,
  content: true,
});

export type InsertRoadmap = z.infer<typeof insertRoadmapSchema>;
export type Roadmap = typeof roadmaps.$inferSelect;

// User Progress schema
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roadmapId: integer("roadmap_id").notNull().references(() => roadmaps.id),
  progress: jsonb("progress").notNull(), // JSON structure for tracking progress
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  roadmapId: true,
  progress: true,
});

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

// Bookmarks schema
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roadmapId: integer("roadmap_id").notNull().references(() => roadmaps.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).pick({
  userId: true,
  roadmapId: true,
});

export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;

// Activity Log schema
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roadmapId: integer("roadmap_id").notNull().references(() => roadmaps.id),
  duration: integer("duration").notNull(), // in minutes
  date: timestamp("date").defaultNow().notNull(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  userId: true,
  roadmapId: true,
  duration: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// User Levels schema
export const userLevels = pgTable("user_levels", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull(),
  experienceRequired: integer("experience_required").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  benefits: text("benefits"),
});

export const insertUserLevelSchema = createInsertSchema(userLevels).pick({
  level: true,
  experienceRequired: true,
  title: true,
  description: true,
  benefits: true,
});

export type InsertUserLevel = z.infer<typeof insertUserLevelSchema>;
export type UserLevel = typeof userLevels.$inferSelect;

// User Experience and Levels schema
export const userExperience = pgTable("user_experience", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  currentLevel: integer("current_level").notNull().default(1),
  totalExperience: integer("total_experience").notNull().default(0),
  skillPoints: integer("skill_points").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserExperienceSchema = createInsertSchema(userExperience).pick({
  userId: true,
  currentLevel: true,
  totalExperience: true,
  skillPoints: true,
});

export type InsertUserExperience = z.infer<typeof insertUserExperienceSchema>;
export type UserExperience = typeof userExperience.$inferSelect;

// Badge Categories schema
export const badgeCategories = pgTable("badge_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
});

export const insertBadgeCategorySchema = createInsertSchema(badgeCategories).pick({
  name: true,
  description: true,
});

export type InsertBadgeCategory = z.infer<typeof insertBadgeCategorySchema>;
export type BadgeCategory = typeof badgeCategories.$inferSelect;

// Badges schema
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => badgeCategories.id),
  iconUrl: text("icon_url").notNull(),
  requirementType: varchar("requirement_type", { length: 50 }).notNull(), // 'completion', 'streak', 'skill_points', etc.
  requirementValue: integer("requirement_value").notNull(),
  experienceAwarded: integer("experience_awarded").notNull().default(0),
  skillPointsAwarded: integer("skill_points_awarded").notNull().default(0),
});

export const insertBadgeSchema = createInsertSchema(badges).pick({
  name: true,
  description: true,
  categoryId: true,
  iconUrl: true,
  requirementType: true,
  requirementValue: true,
  experienceAwarded: true,
  skillPointsAwarded: true,
});

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

// User Badges schema
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.userId, table.badgeId)
  }
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  badgeId: true,
});

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// User Skills schema
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  skillName: varchar("skill_name", { length: 100 }).notNull(),
  skillLevel: integer("skill_level").notNull().default(1),
  pointsInvested: integer("points_invested").notNull().default(0),
}, (table) => {
  return {
    unq: unique().on(table.userId, table.skillName)
  }
});

export const insertUserSkillSchema = createInsertSchema(userSkills).pick({
  userId: true,
  skillName: true,
  skillLevel: true,
  pointsInvested: true,
});

export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;
export type UserSkill = typeof userSkills.$inferSelect;

// Experience Transaction schema (for logging XP gains)
export const experienceTransactions = pgTable("experience_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  roadmapId: integer("roadmap_id").references(() => roadmaps.id),
  nodeId: text("node_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExperienceTransactionSchema = createInsertSchema(experienceTransactions).pick({
  userId: true,
  amount: true,
  reason: true,
  roadmapId: true,
  nodeId: true,
});

export type InsertExperienceTransaction = z.infer<typeof insertExperienceTransactionSchema>;
export type ExperienceTransaction = typeof experienceTransactions.$inferSelect;

// Comments schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roadmapId: integer("roadmap_id").references(() => roadmaps.id),
  nodeId: text("node_id"),
  parentId: integer("parent_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  userId: true,
  roadmapId: true,
  nodeId: true,
  parentId: true,
  content: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Comment Reactions schema
export const commentReactions = pgTable("comment_reactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  commentId: integer("comment_id").notNull().references(() => comments.id),
  reaction: text("reaction").notNull(), // 'like', 'love', 'helpful', etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.userId, table.commentId, table.reaction)
  }
});

export const insertCommentReactionSchema = createInsertSchema(commentReactions).pick({
  userId: true,
  commentId: true,
  reaction: true,
});

export type InsertCommentReaction = z.infer<typeof insertCommentReactionSchema>;
export type CommentReaction = typeof commentReactions.$inferSelect;

// Resources schema
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'article', 'video', 'book', 'tutorial', etc.
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  title: true,
  description: true,
  type: true,
  url: true,
  thumbnailUrl: true,
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Roadmap Node Resources schema (for linking resources to specific nodes in a roadmap)
export const roadmapNodeResources = pgTable("roadmap_node_resources", {
  id: serial("id").primaryKey(),
  roadmapId: integer("roadmap_id").notNull().references(() => roadmaps.id),
  nodeId: text("node_id").notNull(),
  resourceId: integer("resource_id").notNull().references(() => resources.id),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.roadmapId, table.nodeId, table.resourceId)
  }
});

export const insertRoadmapNodeResourceSchema = createInsertSchema(roadmapNodeResources).pick({
  roadmapId: true,
  nodeId: true,
  resourceId: true,
  order: true,
});

export type InsertRoadmapNodeResource = z.infer<typeof insertRoadmapNodeResourceSchema>;
export type RoadmapNodeResource = typeof roadmapNodeResources.$inferSelect;

// Discussion Topics schema
export const discussionTopics = pgTable("discussion_topics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roadmapId: integer("roadmap_id").references(() => roadmaps.id),
  nodeId: text("node_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  viewCount: integer("view_count").default(0).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isClosed: boolean("is_closed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDiscussionTopicSchema = createInsertSchema(discussionTopics).pick({
  userId: true,
  roadmapId: true,
  nodeId: true,
  title: true,
  content: true,
  tags: true,
  isPinned: true,
  isClosed: true,
});

export type InsertDiscussionTopic = z.infer<typeof insertDiscussionTopicSchema>;
export type DiscussionTopic = typeof discussionTopics.$inferSelect;

// Discussion Replies schema
export const discussionReplies = pgTable("discussion_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => discussionTopics.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isAcceptedAnswer: boolean("is_accepted_answer").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDiscussionReplySchema = createInsertSchema(discussionReplies).pick({
  topicId: true,
  userId: true,
  content: true,
  isAcceptedAnswer: true,
});

export type InsertDiscussionReply = z.infer<typeof insertDiscussionReplySchema>;
export type DiscussionReply = typeof discussionReplies.$inferSelect;

// Blog Posts schema
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImageUrl: text("cover_image_url"),
  tags: text("tags").array(),
  status: text("status").notNull().default("draft"), // 'draft', 'published', 'archived'
  viewCount: integer("view_count").default(0).notNull(),
  isPromoted: boolean("is_promoted").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  userId: true,
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  coverImageUrl: true,
  tags: true,
  status: true,
  isPromoted: true,
  publishedAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// ============================================================================
// Role-Based Access Control (RBAC) Schema
// ============================================================================

// Roles schema - Extended beyond simple admin/user
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions").notNull(), // JSON array of permission strings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  description: true,
  permissions: true,
});

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// User Roles schema - Many-to-many relationship
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roleId: integer("role_id").notNull().references(() => roles.id),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.userId, table.roleId)
  }
});

export const insertUserRoleSchema = createInsertSchema(userRoles).pick({
  userId: true,
  roleId: true,
});

export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

// ============================================================================
// Terraform Labs Integration Schema
// ============================================================================

// Lab Environments schema
export const labEnvironments = pgTable("lab_environments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  terraformConfigUrl: text("terraform_config_url").notNull(), // Git repository URL or S3 path
  terraformVersion: varchar("terraform_version", { length: 20 }).notNull(),
  providerConfig: jsonb("provider_config").notNull(), // AWS, Azure, GCP, etc. configuration
  variables: jsonb("variables").notNull(), // Default variables
  tags: text("tags").array(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // 'beginner', 'intermediate', 'advanced'
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLabEnvironmentSchema = createInsertSchema(labEnvironments).pick({
  name: true,
  description: true,
  terraformConfigUrl: true,
  terraformVersion: true,
  providerConfig: true,
  variables: true,
  tags: true,
  difficulty: true,
  estimatedTime: true,
  isActive: true,
});

export type InsertLabEnvironment = z.infer<typeof insertLabEnvironmentSchema>;
export type LabEnvironment = typeof labEnvironments.$inferSelect;

// Lab Instances schema (provisioned environments)
export const labInstances = pgTable("lab_instances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  environmentId: integer("environment_id").notNull().references(() => labEnvironments.id),
  state: varchar("state", { length: 30 }).notNull(), // 'provisioning', 'running', 'stopped', 'failed', 'destroyed'
  stateDetails: jsonb("state_details"), // More detailed state information
  tfState: jsonb("tf_state"), // Terraform state file (may be in external storage with reference here)
  outputs: jsonb("outputs"), // Terraform outputs (IP addresses, URLs, etc.)
  resourceIDs: jsonb("resource_ids"), // IDs of provisioned resources for tracking
  startTime: timestamp("start_time").defaultNow().notNull(),
  expiryTime: timestamp("expiry_time"), // When the lab auto-terminates
  lastActiveTime: timestamp("last_active_time").defaultNow().notNull(),
  variableOverrides: jsonb("variable_overrides"), // User-specific variable values
  logUrl: text("log_url"), // URL to access provisioning/operation logs
  cost: jsonb("cost"), // Track resource usage costs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLabInstanceSchema = createInsertSchema(labInstances).pick({
  userId: true,
  environmentId: true,
  state: true,
  stateDetails: true,
  outputs: true,
  resourceIDs: true,
  expiryTime: true,
  variableOverrides: true,
  logUrl: true,
});

export type InsertLabInstance = z.infer<typeof insertLabInstanceSchema>;
export type LabInstance = typeof labInstances.$inferSelect;

// Lab Tasks schema (challenges or exercises within a lab)
export const labTasks = pgTable("lab_tasks", {
  id: serial("id").primaryKey(),
  environmentId: integer("environment_id").notNull().references(() => labEnvironments.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  instructions: text("instructions").notNull(),
  hintContent: text("hint_content"),
  solutionContent: text("solution_content"),
  verificationScript: text("verification_script"), // Script to verify task completion
  order: integer("order").default(0).notNull(),
  points: integer("points").default(10).notNull(),
  isOptional: boolean("is_optional").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLabTaskSchema = createInsertSchema(labTasks).pick({
  environmentId: true,
  title: true,
  description: true,
  instructions: true,
  hintContent: true,
  solutionContent: true,
  verificationScript: true,
  order: true,
  points: true,
  isOptional: true,
});

export type InsertLabTask = z.infer<typeof insertLabTaskSchema>;
export type LabTask = typeof labTasks.$inferSelect;

// User Lab Task Progress schema
export const userLabTaskProgress = pgTable("user_lab_task_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  instanceId: integer("instance_id").notNull().references(() => labInstances.id),
  taskId: integer("task_id").notNull().references(() => labTasks.id),
  status: varchar("status", { length: 20 }).notNull(), // 'not_started', 'in_progress', 'completed', 'failed'
  attemptCount: integer("attempt_count").default(0).notNull(),
  lastAttemptTime: timestamp("last_attempt_time"),
  completionTime: timestamp("completion_time"),
  userSolution: text("user_solution"), // User's solution code or answer
  verificationResult: jsonb("verification_result"), // Result of verification script
  pointsAwarded: integer("points_awarded").default(0).notNull(),
  feedback: text("feedback"), // System or instructor feedback
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.userId, table.taskId, table.instanceId)
  }
});

export const insertUserLabTaskProgressSchema = createInsertSchema(userLabTaskProgress).pick({
  userId: true,
  instanceId: true,
  taskId: true,
  status: true,
  attemptCount: true,
  userSolution: true,
  verificationResult: true,
  pointsAwarded: true,
  feedback: true,
});

export type InsertUserLabTaskProgress = z.infer<typeof insertUserLabTaskProgressSchema>;
export type UserLabTaskProgress = typeof userLabTaskProgress.$inferSelect;

// Lab Resources schema (resources specific to labs)
export const labResources = pgTable("lab_resources", {
  id: serial("id").primaryKey(),
  environmentId: integer("environment_id").notNull().references(() => labEnvironments.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'document', 'video', 'code_snippet', 'diagram'
  content: text("content"), // For embedded content like code snippets
  fileUrl: text("file_url"), // For external files
  order: integer("order").default(0).notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLabResourceSchema = createInsertSchema(labResources).pick({
  environmentId: true,
  title: true,
  description: true,
  type: true,
  content: true,
  fileUrl: true,
  order: true,
  isRequired: true,
});

export type InsertLabResource = z.infer<typeof insertLabResourceSchema>;
export type LabResource = typeof labResources.$inferSelect;

// ============================================================================
// Learning Management System (LMS) Enhancements
// ============================================================================

// Courses schema (structured collections of roadmaps and materials)
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  objectives: text("objectives").array(),
  prerequisites: text("prerequisites").array(),
  coverImageUrl: text("cover_image_url"),
  duration: integer("duration").notNull(), // in hours
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // 'beginner', 'intermediate', 'advanced'
  status: varchar("status", { length: 20 }).default("draft").notNull(), // 'draft', 'published', 'archived'
  enrollmentType: varchar("enrollment_type", { length: 20 }).default("open").notNull(), // 'open', 'invite_only', 'paid'
  price: integer("price").default(0), // in cents, for paid courses
  creatorId: integer("creator_id").notNull().references(() => users.id),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  objectives: true,
  prerequisites: true,
  coverImageUrl: true,
  duration: true,
  difficulty: true,
  status: true,
  enrollmentType: true,
  price: true,
  creatorId: true,
  tags: true,
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Course Modules schema
export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  order: integer("order").default(0).notNull(),
  isOptional: boolean("is_optional").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseModuleSchema = createInsertSchema(courseModules).pick({
  courseId: true,
  title: true,
  description: true,
  order: true,
  isOptional: true,
});

export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;
export type CourseModule = typeof courseModules.$inferSelect;

// Course Content Items schema (lessons, quizzes, labs, etc. within modules)
export const courseContentItems = pgTable("course_content_items", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => courseModules.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 30 }).notNull(), // 'lesson', 'quiz', 'lab', 'assignment', 'discussion'
  content: jsonb("content").notNull(), // Structure depends on type
  duration: integer("duration"), // in minutes
  points: integer("points").default(0), // points awarded for completion
  order: integer("order").default(0).notNull(),
  isRequired: boolean("is_required").default(true).notNull(),
  dependsOnIds: integer("depends_on_ids").array(), // prerequisites within the course
  roadmapId: integer("roadmap_id").references(() => roadmaps.id),
  labEnvironmentId: integer("lab_environment_id").references(() => labEnvironments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseContentItemSchema = createInsertSchema(courseContentItems).pick({
  moduleId: true,
  title: true,
  description: true,
  type: true,
  content: true,
  duration: true,
  points: true,
  order: true,
  isRequired: true,
  dependsOnIds: true,
  roadmapId: true,
  labEnvironmentId: true,
});

export type InsertCourseContentItem = z.infer<typeof insertCourseContentItemSchema>;
export type CourseContentItem = typeof courseContentItems.$inferSelect;

// Course Enrollments schema
export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  userId: integer("user_id").notNull().references(() => users.id),
  enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active', 'completed', 'withdrawn'
  completionDate: timestamp("completion_date"),
  progress: integer("progress").default(0).notNull(), // percentage
  certificateIssued: boolean("certificate_issued").default(false).notNull(),
  certificateUrl: text("certificate_url"),
  lastAccessDate: timestamp("last_access_date").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.courseId, table.userId)
  }
});

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments).pick({
  courseId: true,
  userId: true,
  status: true,
  completionDate: true,
  progress: true,
  certificateIssued: true,
  certificateUrl: true,
});

export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;

// Content Progress schema (tracks progress through individual content items)
export const contentProgress = pgTable("content_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contentItemId: integer("content_item_id").notNull().references(() => courseContentItems.id),
  status: varchar("status", { length: 20 }).default("not_started").notNull(), // 'not_started', 'in_progress', 'completed'
  progress: integer("progress").default(0).notNull(), // percentage
  score: integer("score"), // for quizzes and assignments
  attemptCount: integer("attempt_count").default(0).notNull(),
  lastAttemptDate: timestamp("last_attempt_date"),
  completionDate: timestamp("completion_date"),
  timeSpent: integer("time_spent").default(0), // in seconds
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.userId, table.contentItemId)
  }
});

export const insertContentProgressSchema = createInsertSchema(contentProgress).pick({
  userId: true,
  contentItemId: true,
  status: true,
  progress: true,
  score: true,
  attemptCount: true,
  timeSpent: true,
  notes: true,
});

export type InsertContentProgress = z.infer<typeof insertContentProgressSchema>;
export type ContentProgress = typeof contentProgress.$inferSelect;

// Certificates schema
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  roadmapId: integer("roadmap_id").references(() => roadmaps.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  issuerName: varchar("issuer_name", { length: 100 }).notNull(),
  templateUrl: text("template_url"),
  certificateUrl: text("certificate_url"),
  verificationCode: varchar("verification_code", { length: 50 }).unique(),
  issuedDate: timestamp("issued_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date"),
  metadata: jsonb("metadata"), // Additional certificate data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCertificateSchema = createInsertSchema(certificates).pick({
  userId: true,
  courseId: true,
  roadmapId: true,
  title: true,
  description: true,
  issuerName: true,
  templateUrl: true,
  certificateUrl: true,
  verificationCode: true,
  expiryDate: true,
  metadata: true,
});

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

// ============================================================================
// Enhanced Assignment System
// ============================================================================

// Training assignments schema (for assigning content to users)
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  assignerUserId: integer("assigner_user_id").notNull().references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  roadmapId: integer("roadmap_id").references(() => roadmaps.id),
  labEnvironmentId: integer("lab_environment_id").references(() => labEnvironments.id),
  dueDate: timestamp("due_date"),
  priority: varchar("priority", { length: 20 }).default("medium").notNull(), // 'low', 'medium', 'high', 'urgent'
  isRequired: boolean("is_required").default(true).notNull(),
  instructions: text("instructions"),
  gradeWeight: integer("grade_weight").default(100), // percentage weight in overall grade
  maxAttempts: integer("max_attempts").default(0), // 0 = unlimited
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAssignmentSchema = createInsertSchema(assignments).pick({
  title: true,
  description: true,
  assignerUserId: true,
  courseId: true,
  roadmapId: true,
  labEnvironmentId: true,
  dueDate: true,
  priority: true,
  isRequired: true,
  instructions: true,
  gradeWeight: true,
  maxAttempts: true,
});

export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;

// User assignments schema (tracks individual user assignments)
export const userAssignments = pgTable("user_assignments", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => assignments.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).default("assigned").notNull(), // 'assigned', 'in_progress', 'completed', 'overdue', 'graded'
  startedAt: timestamp("started_at"),
  submittedAt: timestamp("submitted_at"),
  completedAt: timestamp("completed_at"),
  grade: integer("grade"), // percentage score
  feedback: text("feedback"),
  attemptCount: integer("attempt_count").default(0).notNull(),
  timeSpent: integer("time_spent").default(0), // in minutes
  submissionData: jsonb("submission_data"), // User's work/answers
  autoGraded: boolean("auto_graded").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.assignmentId, table.userId)
  }
});

export const insertUserAssignmentSchema = createInsertSchema(userAssignments).pick({
  assignmentId: true,
  userId: true,
  status: true,
  startedAt: true,
  submittedAt: true,
  completedAt: true,
  grade: true,
  feedback: true,
  attemptCount: true,
  timeSpent: true,
  submissionData: true,
  autoGraded: true,
});

export type InsertUserAssignment = z.infer<typeof insertUserAssignmentSchema>;
export type UserAssignment = typeof userAssignments.$inferSelect;

// ============================================================================
// Enhanced Categories and Tags System
// ============================================================================

// Categories schema for better content organization
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id"),
  iconName: varchar("icon_name", { length: 50 }), // Lucide icon name
  color: varchar("color", { length: 7 }), // hex color code
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  parentId: true,
  iconName: true,
  color: true,
  isActive: true,
  order: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Content categories relationship table
export const contentCategories = pgTable("content_categories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  courseId: integer("course_id").references(() => courses.id),
  roadmapId: integer("roadmap_id").references(() => roadmaps.id),
  labEnvironmentId: integer("lab_environment_id").references(() => labEnvironments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContentCategorySchema = createInsertSchema(contentCategories).pick({
  categoryId: true,
  courseId: true,
  roadmapId: true,
  labEnvironmentId: true,
});

export type InsertContentCategory = z.infer<typeof insertContentCategorySchema>;
export type ContentCategory = typeof contentCategories.$inferSelect;

// ============================================================================
// Enhanced Permissions and Roles
// ============================================================================

// Permissions schema for granular access control
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  resource: varchar("resource", { length: 50 }).notNull(), // 'users', 'courses', 'labs', 'reports', etc.
  action: varchar("action", { length: 20 }).notNull(), // 'create', 'read', 'update', 'delete', 'assign'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPermissionSchema = createInsertSchema(permissions).pick({
  name: true,
  description: true,
  resource: true,
  action: true,
});

export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;

// Role permissions relationship table  
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id),
  permissionId: integer("permission_id").notNull().references(() => permissions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    unq: unique().on(table.roleId, table.permissionId)
  }
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).pick({
  roleId: true,
  permissionId: true,
});

export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
