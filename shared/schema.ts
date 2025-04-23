import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type TaskStatus = "todo" | "inprogress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type DiscussionCategory = "general" | "technical" | "help" | "announcement";

// Creating a custom schema for handling dates correctly
const dateTransformer = z.preprocess(
  (val) => (typeof val === 'string' ? new Date(val) : val),
  z.date()
);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  assignee: text("assignee").notNull(),
  status: text("status").notNull().$type<TaskStatus>().default("todo"),
  priority: text("priority").notNull().$type<TaskPriority>().default("medium"),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  teamId: integer("team_id"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),
  avatar: text("avatar"),
  tasksCompleted: integer("tasks_completed").default(0),
  tasksCreated: integer("tasks_created").default(0),
  performanceScore: integer("performance_score").default(0),
  lastActive: timestamp("last_active"),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  leader: text("leader").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedTasks: integer("completed_tasks").default(0),
  totalTasks: integer("total_tasks").default(0),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: serial("team_id").notNull(),
  userId: serial("user_id").notNull(),
  username: text("username").notNull(),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  category: text("category").$type<DiscussionCategory>().default("general"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  teamId: integer("team_id"),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const performance = pgTable("performance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  username: text("username").notNull(),
  tasksCompleted: integer("tasks_completed").default(0),
  tasksCreated: integer("tasks_created").default(0),
  onTimeCompletion: integer("on_time_completion").default(0),
  lateCompletion: integer("late_completion").default(0),
  weeklyScore: integer("weekly_score").default(0),
  monthlyScore: integer("monthly_score").default(0),
  period: text("period").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Create insert schemas with date transformation
export const insertTaskSchema = createInsertSchema(tasks, {
  dueDate: dateTransformer,
  createdAt: dateTransformer,
  updatedAt: dateTransformer
}).omit({ id: true });

export const insertUserSchema = createInsertSchema(users, {
  lastActive: dateTransformer
}).omit({ id: true });

export const insertTeamSchema = createInsertSchema(teams, {
  createdAt: dateTransformer
}).omit({ id: true });

export const insertTeamMemberSchema = createInsertSchema(teamMembers, {
  joinedAt: dateTransformer
}).omit({ id: true });

export const insertDiscussionSchema = createInsertSchema(discussions, {
  createdAt: dateTransformer,
  updatedAt: dateTransformer
}).omit({ id: true });

export const insertCommentSchema = createInsertSchema(comments, {
  createdAt: dateTransformer
}).omit({ id: true });

export const insertPerformanceSchema = createInsertSchema(performance, {
  createdAt: dateTransformer
}).omit({ id: true });

// Types
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = { _id: string } & InsertTask;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect & { _id: string };

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect & { _id: string };

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect & { _id: string };

export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type Discussion = typeof discussions.$inferSelect & { _id: string };

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect & { _id: string };

export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;
export type Performance = typeof performance.$inferSelect & { _id: string };
