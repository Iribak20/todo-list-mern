import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InsertDiscussion, DiscussionCategory } from "@shared/schema";
import { useCreateDiscussion } from "@/hooks/useDiscussions";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const discussionFormSchema = z.object({
  title: z.string().min(5, {
    message: "Le titre doit contenir au moins 5 caractères",
  }),
  content: z.string().min(10, {
    message: "Le contenu doit contenir au moins 10 caractères",
  }),
  category: z.enum(["general", "technical", "help", "announcement"] as const),
  author: z.string().min(3, {
    message: "Le nom de l'auteur doit contenir au moins 3 caractères",
  }),
});

type DiscussionFormValues = z.infer<typeof discussionFormSchema>;

type DiscussionFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: number;
  onSuccess?: () => void;
};

export function DiscussionForm({ open, onOpenChange, teamId, onSuccess }: DiscussionFormProps) {
  const { toast } = useToast();
  const { mutate: createDiscussion, isPending } = useCreateDiscussion();

  const form = useForm<DiscussionFormValues>({
    resolver: zodResolver(discussionFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      author: "zayad kabiri", // Default author
    },
  });

  async function onSubmit(data: DiscussionFormValues) {
    try {
      const discussion: InsertDiscussion = {
        title: data.title,
        content: data.content,
        author: data.author,
        category: data.category as DiscussionCategory,
        createdAt: new Date(),
        updatedAt: new Date(),
        teamId: teamId,
        likes: 0,
        views: 0
      };

      console.log("Submitting discussion:", discussion);
  
      // Utiliser la fonction mutate au lieu de mutateAsync
      await createDiscussion.mutate(discussion, {
        onSuccess: () => {
          toast({
            title: t("success"),
            description: t("successDiscussionCreate"),
          });
          form.reset();
          onOpenChange(false);
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          console.error("Error creating discussion:", error);
          toast({
            title: t("error"),
            description: error.message || "Une erreur s'est produite lors de la création de la discussion",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error("Exception creating discussion:", error);
      toast({
        title: t("error"),
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("createDiscussion")}</DialogTitle>
          <DialogDescription>
            Créez une nouvelle discussion ou posez une question
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("discussionTitle")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de la discussion..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("author")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("category")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">{t("general")}</SelectItem>
                        <SelectItem value="technical">{t("technical")}</SelectItem>
                        <SelectItem value="help">{t("help")}</SelectItem>
                        <SelectItem value="announcement">{t("announcement")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("discussionContent")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contenu de la discussion..."
                      className="resize-none min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("loading") : t("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}