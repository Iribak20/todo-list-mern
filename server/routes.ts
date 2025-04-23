import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertTaskSchema, 
  insertTeamSchema, 
  insertTeamMemberSchema,
  insertDiscussionSchema,
  insertCommentSchema,
  DiscussionCategory
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB connection
  await storage.connect();

  // ========== TASKS API ==========
  
  // Get all tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get task by ID
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const task = await storage.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      
      // Notify connected clients about the new task
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'task-created',
            payload: task,
            timestamp: new Date().toISOString()
          }));
        }
      });
      
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update a task
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const task = await storage.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updatedTask = await storage.updateTask(req.params.id, req.body);
      
      // Notify connected clients about the task update
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'task-updated',
            payload: updatedTask,
            timestamp: new Date().toISOString()
          }));
        }
      });
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const task = await storage.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      await storage.deleteTask(req.params.id);
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Get tasks by status
  app.get("/api/tasks/status/:status", async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      if (!["todo", "inprogress", "done"].includes(status)) {
        return res.status(400).json({ message: "Invalid status parameter" });
      }
      
      const tasks = await storage.getTasksByStatus(status as any);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by status:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get tasks by assignee
  app.get("/api/tasks/assignee/:assignee", async (req: Request, res: Response) => {
    try {
      const { assignee } = req.params;
      const tasks = await storage.getTasksByAssignee(assignee);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by assignee:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get tasks by team
  app.get("/api/tasks/team/:teamId", async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.teamId);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const tasks = await storage.getTasksByTeam(teamId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by team:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get task statistics
  app.get("/api/stats/tasks", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getTaskStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching task statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // ========== TEAMS API ==========
  
  // Get all teams
  app.get("/api/teams", async (req: Request, res: Response) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Get team by ID
  app.get("/api/teams/:id", async (req: Request, res: Response) => {
    try {
      const team = await storage.getTeamById(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  // Create a new team
  app.post("/api/teams", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      
      // Notify connected clients about the new team
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'team-created',
            payload: team,
            timestamp: new Date().toISOString()
          }));
        }
      });
      
      res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  // Update a team
  app.patch("/api/teams/:id", async (req: Request, res: Response) => {
    try {
      const team = await storage.getTeamById(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const updatedTeam = await storage.updateTeam(req.params.id, req.body);
      res.json(updatedTeam);
    } catch (error) {
      console.error("Error updating team:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  // Delete a team
  app.delete("/api/teams/:id", async (req: Request, res: Response) => {
    try {
      const team = await storage.getTeamById(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      await storage.deleteTeam(req.params.id);
      res.json({ message: "Team deleted successfully" });
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  // Get team members
  app.get("/api/teams/:id/members", async (req: Request, res: Response) => {
    try {
      const members = await storage.getTeamMembers(req.params.id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Add team member
  app.post("/api/teams/:id/members", async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const validatedData = insertTeamMemberSchema.parse({
        ...req.body,
        teamId
      });
      
      const member = await storage.addTeamMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error adding team member:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to add team member" });
    }
  });

  // Remove team member
  app.delete("/api/team-members/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.removeTeamMember(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json({ message: "Team member removed successfully" });
    } catch (error) {
      console.error("Error removing team member:", error);
      res.status(500).json({ message: "Failed to remove team member" });
    }
  });

  // ========== DISCUSSIONS API ==========
  
  // Get all discussions
  app.get("/api/discussions", async (req: Request, res: Response) => {
    try {
      const discussions = await storage.getAllDiscussions();
      res.json(discussions);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });

  // Get discussion by ID
  app.get("/api/discussions/:id", async (req: Request, res: Response) => {
    try {
      const discussion = await storage.getDiscussionById(req.params.id);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json(discussion);
    } catch (error) {
      console.error("Error fetching discussion:", error);
      res.status(500).json({ message: "Failed to fetch discussion" });
    }
  });

  // Get discussions by category
  app.get("/api/discussions/category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      if (!["general", "technical", "help", "announcement"].includes(category)) {
        return res.status(400).json({ message: "Invalid category parameter" });
      }
      
      const discussions = await storage.getDiscussionsByCategory(category as DiscussionCategory);
      res.json(discussions);
    } catch (error) {
      console.error("Error fetching discussions by category:", error);
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });

  // Get discussions by team
  app.get("/api/discussions/team/:teamId", async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.teamId);
      if (isNaN(teamId)) {
        return res.status(400).json({ message: "Invalid team ID" });
      }
      
      const discussions = await storage.getDiscussionsByTeam(teamId);
      res.json(discussions);
    } catch (error) {
      console.error("Error fetching discussions by team:", error);
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });

  // Create a new discussion
  app.post("/api/discussions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDiscussionSchema.parse(req.body);
      const discussion = await storage.createDiscussion(validatedData);
      
      // Notify connected clients about the new discussion
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'discussion-created',
            payload: discussion,
            timestamp: new Date().toISOString()
          }));
        }
      });
      
      res.status(201).json(discussion);
    } catch (error) {
      console.error("Error creating discussion:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create discussion" });
    }
  });

  // Update a discussion
  app.patch("/api/discussions/:id", async (req: Request, res: Response) => {
    try {
      const discussion = await storage.getDiscussionById(req.params.id);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      
      const updatedDiscussion = await storage.updateDiscussion(req.params.id, req.body);
      res.json(updatedDiscussion);
    } catch (error) {
      console.error("Error updating discussion:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update discussion" });
    }
  });

  // Delete a discussion
  app.delete("/api/discussions/:id", async (req: Request, res: Response) => {
    try {
      const discussion = await storage.getDiscussionById(req.params.id);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      
      await storage.deleteDiscussion(req.params.id);
      res.json({ message: "Discussion deleted successfully" });
    } catch (error) {
      console.error("Error deleting discussion:", error);
      res.status(500).json({ message: "Failed to delete discussion" });
    }
  });

  // ========== COMMENTS API ==========
  
  // Get comments by discussion
  app.get("/api/discussions/:id/comments", async (req: Request, res: Response) => {
    try {
      const discussionId = parseInt(req.params.id);
      if (isNaN(discussionId)) {
        return res.status(400).json({ message: "Invalid discussion ID" });
      }
      
      const comments = await storage.getCommentsByDiscussion(discussionId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create a new comment
  app.post("/api/discussions/:id/comments", async (req: Request, res: Response) => {
    try {
      const discussionId = parseInt(req.params.id);
      if (isNaN(discussionId)) {
        return res.status(400).json({ message: "Invalid discussion ID" });
      }
      
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        discussionId
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Delete a comment
  app.delete("/api/comments/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteComment(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // ========== PERFORMANCE API ==========
  
  // Get performance statistics
  app.get("/api/stats/performance", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getCurrentPerformanceStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching performance statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  
  // Get user performance
  app.get("/api/performance/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const performance = await storage.getUserPerformance(username);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching user performance:", error);
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  // Setup WebSocket server for real-time updates
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Broadcast message to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({
              type: data.type || 'update',
              payload: data.payload || {},
              timestamp: new Date().toISOString()
            }));
          }
        });
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
    
    // Send initial welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to TodoApp WebSocket server',
      timestamp: new Date().toISOString()
    }));
  });
  
  return httpServer;
}
