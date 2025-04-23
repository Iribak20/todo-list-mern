import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InsertTeam } from "@shared/schema";
import { useCreateTeam } from "@/hooks/useTeams";
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

const teamFormSchema = z.object({
  name: z.string().min(3, {
    message: "Le nom de l'équipe doit contenir au moins 3 caractères",
  }),
  description: z.string().optional(),
  leader: z.string().min(3, {
    message: "Le nom du chef d'équipe doit contenir au moins 3 caractères",
  }),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

type TeamFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function TeamForm({ open, onOpenChange, onSuccess }: TeamFormProps) {
  const { toast } = useToast();
  const { mutate: createTeam, isPending } = useCreateTeam();

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
      leader: "zayad kabiri", // Default leader
    },
  });

  function onSubmit(data: TeamFormValues) {
    const team: InsertTeam = {
      name: data.name,
      description: data.description || "",
      leader: data.leader,
      createdAt: new Date(),
      completedTasks: 0,
      totalTasks: 0
    };

    createTeam(team, {
      onSuccess: () => {
        toast({
          title: t("success"),
          description: t("successTeamCreate"),
        });
        form.reset();
        onOpenChange(false);
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        toast({
          title: t("error"),
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("createNewTeam")}</DialogTitle>
          <DialogDescription>
            {t("teamDescription")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teamName")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Innovation Team" {...field} />
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
                    <Textarea
                      placeholder="Description de l'équipe et de ses objectifs..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="leader"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teamLeader")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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