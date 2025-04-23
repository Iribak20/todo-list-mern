import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { DiscussionList } from "@/components/discussions/DiscussionList";

const Discussions = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t("discussions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DiscussionList />
        </CardContent>
      </Card>
    </div>
  );
};

export default Discussions;
