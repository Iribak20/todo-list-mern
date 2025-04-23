import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PerformanceUser {
  username: string;
  score: number;
  tasksCompleted: number;
}

interface PerformanceUserStats {
  tasksCompleted: number;
  tasksCreated: number;
  score: number;
}

interface PerformanceStatsData {
  topPerformers: PerformanceUser[];
  averageCompletionTime: number;
  totalTasksCompleted: number;
  totalTasksCreated: number;
  onTimeCompletionRate: number;
  performanceByUser: Record<string, PerformanceUserStats>;
}

interface PerformanceRecord {
  _id: string;
  userId: number;
  username: string;
  tasksCompleted: number;
  tasksCreated: number;
  onTimeCompletion: number;
  lateCompletion: number;
  weeklyScore: number;
  monthlyScore: number;
  period: string;
  createdAt: string;
}

export const usePerformanceStats = () => {
  const { data: stats, isLoading, error } = useQuery<PerformanceStatsData>({
    queryKey: ["/api/stats/performance"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getTopPerformers = () => {
    if (!stats) return [];
    return stats.topPerformers || [];
  };

  const getCompletionRate = () => {
    if (!stats) return 0;
    return stats.onTimeCompletionRate || 0;
  };

  const getPendingTasks = () => {
    if (!stats) return 0;
    return Math.max(0, (stats.totalTasksCreated || 0) - (stats.totalTasksCompleted || 0));
  };

  return {
    stats,
    isLoading,
    error,
    getTopPerformers,
    getCompletionRate,
    getPendingTasks
  };
};

export const useUserPerformance = (username: string) => {
  return useQuery<PerformanceRecord[]>({
    queryKey: ["/api/performance", username],
    enabled: !!username,
  });
};