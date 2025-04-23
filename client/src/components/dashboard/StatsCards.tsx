import { CheckSquare, Clock, Loader, CheckCheck } from "lucide-react";
import { t } from "@/lib/i18n";
import { useTasks } from "@/hooks/useTasks";

const StatsCards = () => {
  const { totalTasks, getTaskCountByStatus } = useTasks();
  
  const todoCount = getTaskCountByStatus("todo");
  const inProgressCount = getTaskCountByStatus("inprogress");
  const completedCount = getTaskCountByStatus("done");
  
  const completedPercentage = totalTasks > 0 
    ? Math.round((completedCount / totalTasks) * 100) 
    : 0;
  
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Tasks Card */}
      <div className="bg-neutral-200 p-5 rounded-lg shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm text-neutral-600 font-medium mb-1">{t("totalTasks")}</h3>
            <p className="text-3xl font-semibold flex items-center">
              <CheckSquare className="h-6 w-6 text-primary mr-2" />
              <span>{totalTasks}</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">{t("allActiveTasks")}</p>
          </div>
        </div>
      </div>
      
      {/* To Do Card */}
      <div className="bg-neutral-200 p-5 rounded-lg shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm text-neutral-600 font-medium mb-1">{t("toDo")}</h3>
            <p className="text-3xl font-semibold flex items-center">
              <Clock className="h-6 w-6 text-primary mr-2" />
              <span>{todoCount}</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">{t("tasksToStart")}</p>
          </div>
        </div>
      </div>
      
      {/* In Progress Card */}
      <div className="bg-neutral-200 p-5 rounded-lg shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm text-neutral-600 font-medium mb-1">{t("inProgress")}</h3>
            <p className="text-3xl font-semibold flex items-center">
              <Loader className="h-6 w-6 text-secondary mr-2" />
              <span>{inProgressCount}</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">{t("tasksInProgress")}</p>
          </div>
        </div>
      </div>
      
      {/* Completed Card */}
      <div className="bg-neutral-200 p-5 rounded-lg shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm text-neutral-600 font-medium mb-1">{t("completed")}</h3>
            <p className="text-3xl font-semibold flex items-center">
              <CheckCheck className="h-6 w-6 text-success mr-2" />
              <span>{completedCount}</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">{completedPercentage}% {t("tasksCompleted")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsCards;
