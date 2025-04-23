import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";
import { t } from "@/lib/i18n";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import TaskForm from "./TaskForm";
import StatusBadge from "@/components/ui/status-badge";
import AvatarWithStatus from "@/components/ui/avatar-with-status";

const TaskList = () => {
  const { tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (task: Task) => {
    try {
      const newStatus = task.status === "done" ? "todo" : task.status === "todo" ? "inprogress" : "done";
      await updateTask.mutateAsync({ 
        id: task._id, 
        task: { 
          status: newStatus,
          completed: newStatus === "done"
        } 
      });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la tâche a été mis à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du statut.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast({
        title: "Tâche supprimée",
        description: "La tâche a été supprimée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression de la tâche.",
        variant: "destructive",
      });
    }
  };

  const getPriorityBadge = (priority: string) => {
    const bgColor = 
      priority === "high" ? "bg-destructive/20 text-destructive" :
      priority === "medium" ? "bg-warning/20 text-warning" :
      "bg-success/20 text-success";
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${bgColor}`}>
        {priority === "high" ? t("high") : 
         priority === "medium" ? t("medium") : 
         t("low")}
      </span>
    );
  };

  if (isLoading) {
    return <div className="text-center py-10">Chargement...</div>;
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold font-poppins">{t("taskList")}</h2>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder={t("searchTasks")}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white w-full md:w-auto">
                <Plus className="h-4 w-4 mr-1" /> {t("newTask")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("createTask")}</DialogTitle>
              </DialogHeader>
              <TaskForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-100">
              <TableHead className="rounded-tl-lg">{t("task")}</TableHead>
              <TableHead>{t("assignedTo")}</TableHead>
              <TableHead>{t("deadline")}</TableHead>
              <TableHead>{t("priority")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="text-right rounded-tr-lg">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task._id} className="border-b border-neutral-200 hover:bg-neutral-100">
                <TableCell>
                  <div className="flex items-center">
                    <Checkbox 
                      className="mr-3 h-4 w-4"
                      checked={task.status === "done"}
                      onCheckedChange={() => handleStatusChange(task)}
                    />
                    <span className={task.status === "done" ? "line-through" : ""}>
                      {task.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <AvatarWithStatus user={task.assignee} />
                </TableCell>
                <TableCell>
                  {new Date(task.dueDate).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>
                  {getPriorityBadge(task.priority)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={task.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Modifier la tâche</DialogTitle>
                        </DialogHeader>
                        <TaskForm task={task} onSuccess={() => setIsDialogOpen(false)} />
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucune tâche trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-neutral-600">
          {t("showing")} 1-{filteredTasks.length} {t("of")} {filteredTasks.length} {t("tasks")}
        </p>
        <div className="flex space-x-1">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={true}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button className="px-3 py-1">
            1
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            disabled={true}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TaskList;
