import { MongoClient, Db, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { 
  InsertTask, Task, TaskStatus, 
  InsertTeam, Team, 
  InsertTeamMember, TeamMember,
  InsertDiscussion, Discussion, DiscussionCategory,
  InsertComment, Comment,
  InsertPerformance, Performance,
  InsertUser, User
} from '@shared/schema';

// Load environment variables
dotenv.config();

export interface IStorage {
  // Connection
  connect(): Promise<void>;
  
  // Tasks
  getAllTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
  getTasksByStatus(status: TaskStatus): Promise<Task[]>;
  getTasksByAssignee(assignee: string): Promise<Task[]>;
  getTasksByTeam(teamId: number): Promise<Task[]>;
  getTaskStatistics(): Promise<TaskStatistics>;
  
  // Teams
  getAllTeams(): Promise<Team[]>;
  getTeamById(id: string): Promise<Team | null>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, team: Partial<Team>): Promise<Team | null>;
  deleteTeam(id: string): Promise<boolean>;
  
  // Team Members
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(id: string): Promise<boolean>;
  
  // Discussions
  getAllDiscussions(): Promise<Discussion[]>;
  getDiscussionById(id: string): Promise<Discussion | null>;
  getDiscussionsByCategory(category: DiscussionCategory): Promise<Discussion[]>;
  getDiscussionsByTeam(teamId: number): Promise<Discussion[]>;
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  updateDiscussion(id: string, discussion: Partial<Discussion>): Promise<Discussion | null>;
  deleteDiscussion(id: string): Promise<boolean>;
  
  // Comments
  getCommentsByDiscussion(discussionId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;
  
  // Performance
  getAllPerformanceRecords(): Promise<Performance[]>;
  getUserPerformance(username: string): Promise<Performance[]>;
  getCurrentPerformanceStats(): Promise<PerformanceStatistics>;
  updatePerformanceOnTaskComplete(username: string, onTime: boolean): Promise<void>;
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
  recentlyCompletedTasks: Task[];
  upcomingDeadlines: Task[];
}

export interface PerformanceStatistics {
  topPerformers: {
    username: string;
    score: number;
    tasksCompleted: number;
  }[];
  averageCompletionTime: number;
  totalTasksCompleted: number;
  totalTasksCreated: number;
  onTimeCompletionRate: number;
  performanceByUser: Record<string, {
    tasksCompleted: number;
    tasksCreated: number;
    score: number;
  }>;
}

export class MongoStorage implements IStorage {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly dbName = 'todo_app';
  private readonly uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      
      // Initialize collections
      await this.initializeCollections();
      console.log('Connected to MongoDB Atlas and initialized collections');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  private async initializeCollections(): Promise<void> {
    if (!this.db) throw new Error('Database not connected');

    const collections = [
      'tasks',
      'teams',
      'discussions',
      'comments',
      'performance'
    ];

    for (const collectionName of collections) {
      if (!(await this.db.listCollections({ name: collectionName }).hasNext())) {
        await this.db.createCollection(collectionName);
        console.log(`Collection ${collectionName} created successfully`);
      }
    }
  }

  // Helper function to format MongoDB documents
  private formatDocument<T>(doc: any): T {
    if (!doc) return doc;
    return {
      ...doc,
      _id: doc._id.toString()
    } as T;
  }

  // Helper function to format MongoDB document arrays
  private formatDocuments<T>(docs: any[]): T[] {
    return docs.map(doc => this.formatDocument<T>(doc));
  }

  // ========== TASKS ==========

  async getAllTasks(): Promise<Task[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const tasks = await this.db.collection('tasks').find().toArray();
      return this.formatDocuments<Task>(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const task = await this.db.collection('tasks').findOne({ _id: new ObjectId(id) });
      return this.formatDocument<Task>(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  async createTask(task: InsertTask): Promise<Task> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      // Ensure tasks collection exists
      if (!await this.db.listCollections({name: 'tasks'}).hasNext()) {
        await this.db.createCollection('tasks');
        console.log('Tasks collection created successfully');
      }

      const result = await this.db.collection('tasks').insertOne({
        ...task,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const createdTask = await this.getTaskById(result.insertedId.toString());
      if (!createdTask) throw new Error('Failed to retrieve created task');
      
      // Update user's tasksCreated count
      await this.db.collection('users').updateOne(
        { username: task.assignee },
        { $inc: { tasksCreated: 1 } },
        { upsert: true }
      );
      
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
      const existingTask = await this.getTaskById(id);
      
      if (!existingTask) {
        return null;
      }
      
      // Track task completion for performance stats
      if (updateData.status === 'done' && existingTask.status !== 'done') {
        const onTime = new Date(existingTask.dueDate) >= new Date();
        await this.updatePerformanceOnTaskComplete(existingTask.assignee, onTime);
      }
      
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
      return this.formatDocuments<Task>(tasks);
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      throw error;
    }
  }

  async getTasksByAssignee(assignee: string): Promise<Task[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const tasks = await this.db.collection('tasks').find({ assignee }).toArray();
      return this.formatDocuments<Task>(tasks);
    } catch (error) {
      console.error('Error fetching tasks by assignee:', error);
      throw error;
    }
  }

  async getTasksByTeam(teamId: number): Promise<Task[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const tasks = await this.db.collection('tasks').find({ teamId }).toArray();
      return this.formatDocuments<Task>(tasks);
    } catch (error) {
      console.error('Error fetching tasks by team:', error);
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
      
      // Recently completed
      const recentlyCompletedTasks = tasks
        .filter(task => task.status === 'done')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);
      
      // Upcoming deadlines
      const upcomingDeadlines = tasks
        .filter(task => task.status !== 'done')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
      
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
        tasksByAssignee: assignees,
        recentlyCompletedTasks,
        upcomingDeadlines
      };
    } catch (error) {
      console.error('Error calculating task statistics:', error);
      throw error;
    }
  }

  // ========== TEAMS ==========

  async getAllTeams(): Promise<Team[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const teams = await this.db.collection('teams').find().toArray();
      return this.formatDocuments<Team>(teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  async getTeamById(id: string): Promise<Team | null> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const team = await this.db.collection('teams').findOne({ _id: new ObjectId(id) });
      return this.formatDocument<Team>(team);
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const result = await this.db.collection('teams').insertOne({
        ...team,
        createdAt: new Date(),
        completedTasks: 0,
        totalTasks: 0
      });
      
      // Add the team leader as the first member
      await this.db.collection('team_members').insertOne({
        teamId: parseInt(result.insertedId.toString()),
        userId: 1, // Temporary ID
        username: team.leader,
        role: 'leader',
        joinedAt: new Date()
      });
      
      const createdTeam = await this.getTeamById(result.insertedId.toString());
      if (!createdTeam) throw new Error('Failed to retrieve created team');
      
      return createdTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  async updateTeam(id: string, teamUpdate: Partial<Team>): Promise<Team | null> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const { _id, ...updateData } = teamUpdate;
      
      await this.db.collection('teams').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      return this.getTeamById(id);
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  }

  async deleteTeam(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      // Delete the team
      const teamResult = await this.db.collection('teams').deleteOne({ _id: new ObjectId(id) });
      
      // Delete all team members
      await this.db.collection('team_members').deleteMany({ teamId: parseInt(id) });
      
      return teamResult.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }
  
  // ========== TEAM MEMBERS ==========

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const members = await this.db.collection('team_members')
        .find({ teamId: parseInt(teamId) })
        .toArray();
      
      return this.formatDocuments<TeamMember>(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  async addTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const result = await this.db.collection('team_members').insertOne({
        ...member,
        joinedAt: new Date()
      });
      
      const createdMember = await this.db.collection('team_members')
        .findOne({ _id: result.insertedId });
      
      return this.formatDocument<TeamMember>(createdMember);
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  }

  async removeTeamMember(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const result = await this.db.collection('team_members')
        .deleteOne({ _id: new ObjectId(id) });
      
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  // ========== DISCUSSIONS ==========

  async getAllDiscussions(): Promise<Discussion[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const discussions = await this.db.collection('discussions').find().toArray();
      return this.formatDocuments<Discussion>(discussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      throw error;
    }
  }

  async getDiscussionById(id: string): Promise<Discussion | null> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const discussion = await this.db.collection('discussions')
        .findOne({ _id: new ObjectId(id) });
      
      // Increment view counter
      if (discussion) {
        await this.db.collection('discussions').updateOne(
          { _id: new ObjectId(id) },
          { $inc: { views: 1 } }
        );
      }
      
      return this.formatDocument<Discussion>(discussion);
    } catch (error) {
      console.error('Error fetching discussion:', error);
      throw error;
    }
  }

  async getDiscussionsByCategory(category: DiscussionCategory): Promise<Discussion[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const discussions = await this.db.collection('discussions')
        .find({ category })
        .toArray();
      
      return this.formatDocuments<Discussion>(discussions);
    } catch (error) {
      console.error('Error fetching discussions by category:', error);
      throw error;
    }
  }

  async getDiscussionsByTeam(teamId: number): Promise<Discussion[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const discussions = await this.db.collection('discussions')
        .find({ teamId })
        .toArray();
      
      return this.formatDocuments<Discussion>(discussions);
    } catch (error) {
      console.error('Error fetching discussions by team:', error);
      throw error;
    }
  }

  async createDiscussion(discussion: InsertDiscussion): Promise<Discussion> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const result = await this.db.collection('discussions').insertOne({
        ...discussion,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        views: 0
      });
      
      const createdDiscussion = await this.getDiscussionById(result.insertedId.toString());
      if (!createdDiscussion) throw new Error('Failed to retrieve created discussion');
      
      return createdDiscussion;
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }
  }

  async updateDiscussion(id: string, discussionUpdate: Partial<Discussion>): Promise<Discussion | null> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const { _id, ...updateData } = discussionUpdate;
      
      await this.db.collection('discussions').updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          } 
        }
      );
      
      return this.getDiscussionById(id);
    } catch (error) {
      console.error('Error updating discussion:', error);
      throw error;
    }
  }

  async deleteDiscussion(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      // Delete the discussion
      const discussionResult = await this.db.collection('discussions')
        .deleteOne({ _id: new ObjectId(id) });
      
      // Delete all comments for this discussion
      await this.db.collection('comments')
        .deleteMany({ discussionId: parseInt(id) });
      
      return discussionResult.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting discussion:', error);
      throw error;
    }
  }

  // ========== COMMENTS ==========

  async getCommentsByDiscussion(discussionId: number): Promise<Comment[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const comments = await this.db.collection('comments')
        .find({ discussionId })
        .sort({ createdAt: 1 })
        .toArray();
      
      return this.formatDocuments<Comment>(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const result = await this.db.collection('comments').insertOne({
        ...comment,
        createdAt: new Date()
      });
      
      const createdComment = await this.db.collection('comments')
        .findOne({ _id: result.insertedId });
      
      return this.formatDocument<Comment>(createdComment);
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async deleteComment(id: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const result = await this.db.collection('comments')
        .deleteOne({ _id: new ObjectId(id) });
      
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // ========== PERFORMANCE ==========

  async getAllPerformanceRecords(): Promise<Performance[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const records = await this.db.collection('performance').find().toArray();
      return this.formatDocuments<Performance>(records);
    } catch (error) {
      console.error('Error fetching performance records:', error);
      throw error;
    }
  }

  async getUserPerformance(username: string): Promise<Performance[]> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      const records = await this.db.collection('performance')
        .find({ username })
        .sort({ createdAt: -1 })
        .toArray();
      
      return this.formatDocuments<Performance>(records);
    } catch (error) {
      console.error('Error fetching user performance:', error);
      throw error;
    }
  }

  async getCurrentPerformanceStats(): Promise<PerformanceStatistics> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      // Get all users with performance data
      const userPerformances = await this.db.collection('users')
        .find({})
        .sort({ performanceScore: -1 })
        .toArray();
      
      // Calculate top performers
      const topPerformers = userPerformances
        .slice(0, 5)
        .map(user => ({
          username: user.username,
          score: user.performanceScore || 0,
          tasksCompleted: user.tasksCompleted || 0
        }));
      
      // Calculate performance by user
      const performanceByUser: Record<string, { tasksCompleted: number; tasksCreated: number; score: number }> = {};
      
      userPerformances.forEach(user => {
        performanceByUser[user.username] = {
          tasksCompleted: user.tasksCompleted || 0,
          tasksCreated: user.tasksCreated || 0,
          score: user.performanceScore || 0
        };
      });
      
      // Get performance metrics
      const performanceRecords = await this.db.collection('performance').find().toArray();
      
      const totalOnTime = performanceRecords.reduce((sum, record) => sum + (record.onTimeCompletion || 0), 0);
      const totalLate = performanceRecords.reduce((sum, record) => sum + (record.lateCompletion || 0), 0);
      const onTimeCompletionRate = totalOnTime + totalLate > 0 
        ? (totalOnTime / (totalOnTime + totalLate)) * 100 
        : 0;
      
      const totalTasksCompleted = userPerformances.reduce((sum, user) => sum + (user.tasksCompleted || 0), 0);
      const totalTasksCreated = userPerformances.reduce((sum, user) => sum + (user.tasksCreated || 0), 0);
      
      // Average time is a placeholder value since we don't track actual completion time
      const averageCompletionTime = 2.5; // in days
      
      return {
        topPerformers,
        averageCompletionTime,
        totalTasksCompleted,
        totalTasksCreated,
        onTimeCompletionRate,
        performanceByUser
      };
    } catch (error) {
      console.error('Error calculating performance statistics:', error);
      throw error;
    }
  }

  async updatePerformanceOnTaskComplete(username: string, onTime: boolean): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    
    try {
      // Update user stats
      await this.db.collection('users').updateOne(
        { username },
        { 
          $inc: { 
            tasksCompleted: 1,
            performanceScore: onTime ? 10 : 5 // Award more points for on-time completion
          },
          $set: {
            lastActive: new Date()
          }
        },
        { upsert: true }
      );
      
      // Get current week and month periods
      const now = new Date();
      const weekPeriod = `${now.getFullYear()}-W${Math.ceil((now.getDate() + now.getDay()) / 7)}`;
      const monthPeriod = `${now.getFullYear()}-${now.getMonth() + 1}`;
      
      // Update weekly performance
      await this.db.collection('performance').updateOne(
        { username, period: weekPeriod },
        {
          $inc: {
            tasksCompleted: 1,
            weeklyScore: onTime ? 10 : 5,
            onTimeCompletion: onTime ? 1 : 0,
            lateCompletion: onTime ? 0 : 1
          },
          $setOnInsert: {
            userId: 1, // Placeholder
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
      
      // Update monthly performance
      await this.db.collection('performance').updateOne(
        { username, period: monthPeriod },
        {
          $inc: {
            tasksCompleted: 1,
            monthlyScore: onTime ? 10 : 5,
            onTimeCompletion: onTime ? 1 : 0,
            lateCompletion: onTime ? 0 : 1
          },
          $setOnInsert: {
            userId: 1, // Placeholder
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
      
    } catch (error) {
      console.error('Error updating performance stats:', error);
      throw error;
    }
  }
}

export const storage = new MongoStorage();
