import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { TeamList } from "@/components/teams/TeamList";

const Teams = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t("teams")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamList />
        </CardContent>
      </Card>
    </div>
  );
};

export default Teams;
