import { useQuery } from "@tanstack/react-query";

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

// Performance statistics
export const usePerformanceStats = () => {
  const { data: stats, isLoading, error } = useQuery<PerformanceStatsData>({
    queryKey: ['/api/stats/performance'],
    refetchOnWindowFocus: false
  });

  return {
    stats,
    isLoading,
    error,
    getTopPerformers: () => stats?.topPerformers || [],
    getCompletionRate: () => stats?.onTimeCompletionRate || 0,
    getTotalTasksCompleted: () => stats?.totalTasksCompleted || 0,
    getPerformanceByUser: (username: string) => 
      stats?.performanceByUser?.[username] || {
        tasksCompleted: 0,
        tasksCreated: 0,
        score: 0
      }
  };
};

// User performance
export const useUserPerformance = (username: string) => {
  const { data: performance, isLoading, error } = useQuery<PerformanceRecord[]>({
    queryKey: ['/api/performance', username],
    enabled: !!username
  });

  return {
    performance,
    isLoading,
    error,
    weeklyScore: () => {
      if (!performance || !performance.length) return 0;
      const latestWeekRecord = performance.find(p => p.period.startsWith(new Date().getFullYear() + '-W'));
      return latestWeekRecord?.weeklyScore || 0;
    },
    monthlyScore: () => {
      if (!performance || !performance.length) return 0;
      const latestMonthRecord = performance.find(p => 
        p.period.startsWith(new Date().getFullYear() + '-' + (new Date().getMonth() + 1))
      );
      return latestMonthRecord?.monthlyScore || 0;
    }
  };
};