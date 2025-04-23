import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@shared/schema";
import { t } from "@/lib/i18n";

interface StatusBadgeProps {
  status: TaskStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "bg-primary/20 text-primary";
      case "inprogress":
        return "bg-secondary/20 text-secondary";
      case "done":
        return "bg-success/20 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return t("todo");
      case "inprogress":
        return t("inprogress");
      case "done":
        return t("done");
      default:
        return status;
    }
  };

  return (
    <Badge variant="outline" className={`px-3 py-1 text-xs rounded-full ${getStatusClass(status)}`}>
      {getStatusText(status)}
    </Badge>
  );
};

export default StatusBadge;
