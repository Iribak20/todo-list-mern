import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Task } from "@shared/schema";
import StatusBadge from "@/components/ui/status-badge";

type TaskCardProps = {
  task: Task;
};

const TaskCard = ({ task }: TaskCardProps) => {
  return (
    <Card className="bg-white p-4 rounded-lg shadow-sm mb-3">
      <CardContent className="p-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-neutral-800">{task.title}</h3>
            <p className="text-sm text-neutral-600 flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {new Date(task.dueDate).toLocaleDateString("fr-FR")}
              </span>
            </p>
          </div>
          <StatusBadge status={task.status} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
