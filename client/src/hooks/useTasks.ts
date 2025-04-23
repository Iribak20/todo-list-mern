import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Task, TaskStatus, InsertTask } from "@shared/schema";

export const useTaskStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats/tasks"],
    refetchOnWindowFocus: false
  });

  return {
    stats,
    isLoading,
    completionRate: stats?.completionRate || 0,
    overdueTasks: stats?.overdueTasks || 0,
    tasksByPriority: stats?.tasksByPriority || { high: 0, medium: 0, low: 0 },
    recentlyCompletedTasks: stats?.recentlyCompletedTasks || [],
    upcomingDeadlines: stats?.upcomingDeadlines || []
  };
};

export const useTasks = () => {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  return {
    tasks: tasks || [],
    isLoading,
    tasksByStatus: (status: TaskStatus) => (tasks || []).filter(task => task.status === status),
    getTaskCountByStatus: (status: TaskStatus) => (tasks || []).filter(task => task.status === status).length,
    totalTasks: (tasks || []).length,
    todoTasks: (tasks || []).filter(task => task.status === "todo"),
    inProgressTasks: (tasks || []).filter(task => task.status === "inprogress"),
    completedTasks: (tasks || []).filter(task => task.status === "done"),
    upcomingTasks: (tasks || [])
      .filter(task => task.status !== "done")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3),
    tasksByTeam: (teamId: number) => (tasks || []).filter(task => task.teamId === teamId),
    tasksByAssignee: (assignee: string) => (tasks || []).filter(task => task.assignee === assignee),
    highPriorityTasks: (tasks || []).filter(task => task.priority === "high"),
    overdueTasks: (tasks || []).filter(task => 
      task.status !== "done" && new Date(task.dueDate) < new Date()
    )
  };
};

export const useTask = (id: string) => {
  const { data: task, isLoading } = useQuery({
    queryKey: ['/api/tasks', id],
    enabled: !!id
  });

  return {
    task: task as Task | null,
    isLoading
  };
};

export const useCreateTask = () => {
  return useMutation({
    mutationFn: (task: InsertTask) => apiRequest("POST", "/api/tasks", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/tasks"] });
    }
  });
};

export const useUpdateTask = () => {
  return useMutation({
    mutationFn: ({ id, task }: { id: string, task: Partial<Task> }) => 
      apiRequest("PATCH", `/api/tasks/${id}`, task),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/performance"] });
    }
  });
};

export const useDeleteTask = () => {
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/tasks"] });
    }
  });
};
