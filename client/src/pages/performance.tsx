import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { PerformanceStats } from "@/components/performance/PerformanceStats";

const Performance = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t("performance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceStats />
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
