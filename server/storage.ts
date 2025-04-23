import { MongoClient, Db, ObjectId } from 'mongodb';
import { InsertTask, Task, TaskStatus } from '@shared/schema';

export interface IStorage {
  connect(): Promise<void>;
  getAllTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
  getTasksByStatus(status: TaskStatus): Promise<Task[]>;
  getTasksByAssignee(assignee: string): Promise<Task[]>;
  getTaskStatistics(): Promise<TaskStatistics>;
}

export interface TaskStatistics {
  total: number;
  todoCount: number;
  inProgressCount: number;
  completedCount: number;
  completionRate: number;
  overdueTasks: number;
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  tasksByAssignee: Record<string, number>;
}

export class MongoStorage implements IStorage {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly dbName = 'todo_app';
  private readonly uri = process.env.MONGODB_URI || 'mongodb+srv://iribak:KQQwQ4QqZ4Fs1O9n@cluster0.6ripjfr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log('Connected to MongoDB Atlas');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async getAllTasks(): Promise<Task[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const tasks = await this.db.collection('tasks').find().toArray();
      return tasks.map(task => ({
        ...task,
        _id: task._id.toString()
      })) as Task[];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const task = await this.db.collection('tasks').findOne({ _id: new ObjectId(id) });
      if (!task) return null;
      
      return {
        ...task,
        _id: task._id.toString()
      } as Task;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  async createTask(task: InsertTask): Promise<Task> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const result = await this.db.collection('tasks').insertOne({
        ...task,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const createdTask = await this.getTaskById(result.insertedId.toString());
      if (!createdTask) throw new Error('Failed to retrieve created task');
      
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: string, taskUpdate: Partial<Task>): Promise<Task | null> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const { _id, ...updateData } = taskUpdate;
      
      await this.db.collection('tasks').updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          } 
        }
      );
      
      return this.getTaskById(id);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const result = await this.db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const tasks = await this.db.collection('tasks').find({ status }).toArray();
      return tasks.map(task => ({
        ...task,
        _id: task._id.toString()
      })) as Task[];
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      throw error;
    }
  }

  async getTasksByAssignee(assignee: string): Promise<Task[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const tasks = await this.db.collection('tasks').find({ assignee }).toArray();
      return tasks.map(task => ({
        ...task,
        _id: task._id.toString()
      })) as Task[];
    } catch (error) {
      console.error('Error fetching tasks by assignee:', error);
      throw error;
    }
  }

  async getTaskStatistics(): Promise<TaskStatistics> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const tasks = await this.getAllTasks();
      const total = tasks.length;
      const todoCount = tasks.filter(task => task.status === 'todo').length;
      const inProgressCount = tasks.filter(task => task.status === 'inprogress').length;
      const completedCount = tasks.filter(task => task.status === 'done').length;
      const completionRate = total > 0 ? (completedCount / total) * 100 : 0;
      
      const now = new Date();
      const overdueTasks = tasks.filter(
        task => task.status !== 'done' && new Date(task.dueDate) < now
      ).length;
      
      // Tasks by priority
      const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
      const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
      const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
      
      // Tasks by assignee
      const assignees = tasks.reduce<Record<string, number>>((acc, task) => {
        acc[task.assignee] = (acc[task.assignee] || 0) + 1;
        return acc;
      }, {});
      
      return {
        total,
        todoCount,
        inProgressCount,
        completedCount,
        completionRate,
        overdueTasks,
        tasksByPriority: {
          high: highPriorityTasks,
          medium: mediumPriorityTasks,
          low: lowPriorityTasks
        },
        tasksByAssignee: assignees
      };
    } catch (error) {
      console.error('Error calculating task statistics:', error);
      throw error;
    }
  }
}

export const storage = new MongoStorage();
