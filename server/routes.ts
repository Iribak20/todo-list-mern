import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB connection
  await storage.connect();

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

  // Get task statistics
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getTaskStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching task statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
