import { useState } from "react";
import { usePerformanceStats } from "@/hooks/usePerformance";
import { t } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket";
import AvatarWithStatus from "@/components/ui/avatar-with-status";
import { TrophyIcon, ClockIcon, AlertTriangleIcon, AwardIcon } from "lucide-react";

export function PerformanceStats() {
  const { stats, isLoading, getTopPerformers, getCompletionRate } = usePerformanceStats();
  const { isConnected } = useWebSocket();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t("performanceMetrics")}</h2>
        <Badge variant={isConnected ? "outline" : "secondary"} className="font-mono text-xs">
          {isConnected ? "LIVE" : "OFFLINE"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 text-amber-500" />
              {t("topPerformers")}
            </CardTitle>
            <CardDescription>
              Les utilisateurs les plus productifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getTopPerformers().slice(0, 3).map((performer, idx) => (
                <div key={performer.username} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{idx + 1}.</span>
                    <AvatarWithStatus user={performer.username} />
                  </div>
                  <div className="text-sm font-medium">
                    {performer.score} pts
                  </div>
                </div>
              ))}
              {getTopPerformers().length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Aucun utilisateur n'a encore complété de tâches
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-green-500" />
              {t("completionRate")}
            </CardTitle>
            <CardDescription>
              Pourcentage des tâches complétées à temps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("onTimeCompletion")}</span>
                <span className="font-medium">{getCompletionRate().toFixed(0)}%</span>
              </div>
              <Progress value={getCompletionRate()} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {getCompletionRate() > 80 
                  ? "Excellent travail! La majorité des tâches sont complétées à temps."
                  : getCompletionRate() > 50
                  ? "Bon travail. Continuez à améliorer votre taux de complétion."
                  : "Il y a place à l'amélioration. Essayez de compléter plus de tâches avant leur échéance."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
              {t("overdueTasks")}
            </CardTitle>
            <CardDescription>
              Tâches en retard nécessitant une attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-24">
              <div className="text-4xl font-bold mb-2">
                {stats ? (stats.totalTasksCreated || 0) - (stats.totalTasksCompleted || 0) : 0}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {stats && (stats.totalTasksCreated || 0) - (stats.totalTasksCompleted || 0) <= 0 
                  ? "Aucune tâche en retard. Excellent!"
                  : stats && (stats.totalTasksCreated || 0) - (stats.totalTasksCompleted || 0) === 1
                  ? "1 tâche nécessite votre attention"
                  : `${stats ? (stats.totalTasksCreated || 0) - (stats.totalTasksCompleted || 0) : 0} tâches nécessitent votre attention`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AwardIcon className="h-5 w-5 text-indigo-500" />
            {t("userPerformance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("user")}</TableHead>
                <TableHead className="text-right">{t("tasksCompleted")}</TableHead>
                <TableHead className="text-right">{t("tasksCreated")}</TableHead>
                <TableHead className="text-right">{t("weeklyScore")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats && stats.performanceByUser && Object.entries(stats.performanceByUser).map(([username, data]) => (
                <TableRow key={username}>
                  <TableCell>
                    <AvatarWithStatus user={username} />
                  </TableCell>
                  <TableCell className="text-right">{data.tasksCompleted}</TableCell>
                  <TableCell className="text-right">{data.tasksCreated}</TableCell>
                  <TableCell className="text-right font-medium">{data.score} pts</TableCell>
                </TableRow>
              ))}
              {(!stats || !stats.performanceByUser || Object.keys(stats.performanceByUser).length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Aucune donnée de performance disponible
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}