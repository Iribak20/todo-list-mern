import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";

const Performance = () => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{t("performance")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Fonctionnalité des statistiques de performance à venir bientôt...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Performance;
