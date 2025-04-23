import { useState } from "react";
import { useTeams } from "@/hooks/useTeams";
import { t } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { PlusCircle, Users, BarChart } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamForm } from "@/components/teams/TeamForm";
import AvatarWithStatus from "@/components/ui/avatar-with-status";

export function TeamList() {
  const { teams, isLoading } = useTeams();
  const [teamFormOpen, setTeamFormOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t("myTeams")}</h2>
        <Button onClick={() => setTeamFormOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {t("createTeam")}
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucune équipe trouvée</p>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre première équipe pour commencer à collaborer
            </p>
            <Button onClick={() => setTeamFormOpen(true)}>
              {t("createTeam")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team._id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {team.description || "Aucune description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("teamLeader")}</span>
                    <AvatarWithStatus user={team.leader} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("created")}</span>
                    <span>
                      {formatDistanceToNow(new Date(team.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("tasksCompletedByTeam")}</span>
                    <span className="font-medium">
                      {team.completedTasks}/{team.totalTasks || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-0">
                <Button variant="outline" className="w-full gap-2">
                  <Users className="h-4 w-4" />
                  {t("members")}
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <BarChart className="h-4 w-4" />
                  {t("teamPerformance")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <TeamForm
        open={teamFormOpen}
        onOpenChange={setTeamFormOpen}
      />
    </div>
  );
}