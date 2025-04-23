import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";

const Discussions = () => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{t("discussions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Fonctionnalité des discussions à venir bientôt...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Discussions;
