import { useState } from "react";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTasks, useDeleteTask } from "@/hooks/useTasks";
import { t } from "@/lib/i18n";
import TaskForm from "./TaskForm";
import { Task } from "@shared/schema";

const TaskList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { tasks, isLoading } = useTasks();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading tasks...</div>;
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

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task._id} className="border p-4 rounded-lg">
            <h3 className="font-semibold">{task.title}</h3>
            <p className="text-sm text-gray-600">{task.description}</p>
            <div className="flex justify-between mt-2">
              <span className="text-sm">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-neutral-600">
          {t("showing")} 1-{filteredTasks.length} {t("of")} {filteredTasks.length} {t("tasks")}
        </p>
        <div className="flex space-x-1">
          <Button variant="outline" size="icon" disabled={true}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button className="px-3 py-1">1</Button>
          <Button variant="outline" size="icon" disabled={true}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TaskList;