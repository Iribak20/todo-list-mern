import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Task, TaskStatus, InsertTask } from "@shared/schema";

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
      .slice(0, 2)
  };
};

export const useCreateTask = () => {
  return useMutation({
    mutationFn: (task: InsertTask) => apiRequest("POST", "/api/tasks", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    }
  });
};

export const useUpdateTask = () => {
  return useMutation({
    mutationFn: ({ id, task }: { id: string, task: Partial<Task> }) => 
      apiRequest("PATCH", `/api/tasks/${id}`, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    }
  });
};

export const useDeleteTask = () => {
  return useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    }
  });
};
