import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useTasks } from "@/hooks/useTasks";
import TaskCard from "@/components/tasks/TaskCard";
import { useLocation } from "wouter";

const UpcomingTasks = () => {
  const { upcomingTasks } = useTasks();
  const [_, setLocation] = useLocation();

  return (
    <Card className="bg-neutral-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{t("upcomingTasks")}</CardTitle>
        <CardDescription>{t("nextTasksToProcess")}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {upcomingTasks.length > 0 ? (
          upcomingTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))
        ) : (
          <div className="text-center py-8 text-neutral-500">
            Aucune tâche à venir
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full border-primary text-primary hover:bg-primary hover:text-white"
          onClick={() => setLocation("/tasks")}
        >
          {t("viewAllTasks")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingTasks;
