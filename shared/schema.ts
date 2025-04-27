import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, unique } from "drizzle-orm/pg-core";
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
  parentId: integer("parent_id").references(() => comments.id),
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
