import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { Task } from "@shared/schema";

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
}

const FormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assignee: z.string().min(1, "Assignee is required"),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

type FormValues = z.infer<typeof FormSchema>;

export default function TaskForm({ task, onSuccess }: TaskFormProps) {
  const { toast } = useToast();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      assignee: task?.assignee || "",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const formattedData = {
        ...data,
        dueDate: new Date(data.dueDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (task) {
        const result = await updateTask.mutateAsync({
          id: task._id,
          data: formattedData,
        });

        if (result) {
          toast({
            title: "Success",
            description: "Task updated successfully",
          });
          if (onSuccess) onSuccess();
        }
      } else {
        const result = await createTask.mutateAsync(formattedData);

        if (result) {
          toast({
            title: "Success",
            description: "Task created successfully",
          });
          form.reset();
          if (onSuccess) onSuccess();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          placeholder="Task title"
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <Textarea
          placeholder="Description"
          {...form.register("description")}
        />
      </div>

      <div>
        <Input
          placeholder="Assignee"
          {...form.register("assignee")}
        />
        {form.formState.errors.assignee && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.assignee.message}</p>
        )}
      </div>

      <div>
        <Select
          onValueChange={(value) => form.setValue("status", value)}
          defaultValue={form.getValues("status")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="inprogress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Select
          onValueChange={(value) => form.setValue("priority", value)}
          defaultValue={form.getValues("priority")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Input
          type="date"
          {...form.register("dueDate")}
        />
        {form.formState.errors.dueDate && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.dueDate.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        {task ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
}