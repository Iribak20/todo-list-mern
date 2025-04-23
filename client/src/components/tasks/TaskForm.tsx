import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { insertTaskSchema } from "@shared/schema";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { t } from "@/lib/i18n";
import { Task } from "@shared/schema";

const formSchema = insertTaskSchema.extend({
  dueDate: z.string().min(1, "La date d'échéance est requise"),
});

type FormValues = z.infer<typeof formSchema>;

type TaskFormProps = {
  task?: Task;
  onSuccess?: () => void;
};

const TaskForm = ({ task, onSuccess }: TaskFormProps) => {
  const { toast } = useToast();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const defaultValues: Partial<FormValues> = task
    ? {
        title: task.title,
        description: task.description || "",
        assignee: task.assignee,
        priority: task.priority,
        status: task.status,
        dueDate: formatDate(new Date(task.dueDate)),
      }
    : {
        title: "",
        description: "",
        assignee: "",
        priority: "medium",
        status: "todo",
        dueDate: formatDate(new Date()),
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Soumission des données du formulaire:", data);
      
      if (task) {
        console.log("Mise à jour de tâche:", task._id);
        const updatedTask = {
          ...data,
          dueDate: new Date(data.dueDate), // Convertir la chaîne de date en objet Date
          completed: data.status === "done",
          updatedAt: new Date()
        };
        
        console.log("Données de mise à jour:", updatedTask);
        
        await updateTask.mutateAsync({
          id: task._id,
          task: updatedTask,
        });
        
        toast({
          title: "Tâche mise à jour",
          description: "La tâche a été mise à jour avec succès.",
        });
      } else {
        console.log("Création d'une nouvelle tâche");
        const newTask = {
          ...data,
          dueDate: new Date(data.dueDate), // Convertir la chaîne de date en objet Date
          completed: data.status === "done",
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log("Données de nouvelle tâche:", newTask);
        
        const result = await createTask.mutateAsync(newTask);
        console.log("Résultat de la création:", result);
        
        toast({
          title: "Tâche créée",
          description: "La tâche a été créée avec succès.",
        });
      }
      
      if (onSuccess) onSuccess();
      form.reset();
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la sauvegarde. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("taskTitle")}</FormLabel>
              <FormControl>
                <Input placeholder="Titre de la tâche" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea placeholder="Description de la tâche" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dueDate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("priority")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une priorité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">{t("low")}</SelectItem>
                    <SelectItem value="medium">{t("medium")}</SelectItem>
                    <SelectItem value="high">{t("high")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assignee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("assignedTo")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Assigner à" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Zayad Kabiri">Zayad Kabiri</SelectItem>
                    <SelectItem value="Laura Martin">Laura Martin</SelectItem>
                    <SelectItem value="Thomas Dubois">Thomas Dubois</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("status")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">{t("todo")}</SelectItem>
                    <SelectItem value="inprogress">{t("inprogress")}</SelectItem>
                    <SelectItem value="done">{t("done")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => onSuccess && onSuccess()}
          >
            {t("cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={createTask.isPending || updateTask.isPending}
          >
            {task ? "Mettre à jour" : t("save")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
