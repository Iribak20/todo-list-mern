import { useState } from "react";
import { useDiscussions } from "@/hooks/useDiscussions";
import { t } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { PlusCircle, MessageSquare, Eye, ThumbsUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscussionForm } from "@/components/discussions/DiscussionForm";
import AvatarWithStatus from "@/components/ui/avatar-with-status";
import { DiscussionCategory } from "@shared/schema";

export function DiscussionList() {
  const { discussions, isLoading } = useDiscussions();
  const [discussionFormOpen, setDiscussionFormOpen] = useState(false);

  const getCategoryClass = (category: DiscussionCategory) => {
    switch (category) {
      case "general":
        return "bg-blue-100 text-blue-800";
      case "technical":
        return "bg-indigo-100 text-indigo-800";
      case "help":
        return "bg-amber-100 text-amber-800";
      case "announcement":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getCategoryText = (category: DiscussionCategory) => {
    switch (category) {
      case "general":
        return t("general");
      case "technical":
        return t("technical");
      case "help":
        return t("help");
      case "announcement":
        return t("announcement");
      default:
        return category;
    }
  };

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
        <h2 className="text-2xl font-semibold">{t("allDiscussions")}</h2>
        <Button onClick={() => setDiscussionFormOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          {t("createDiscussion")}
        </Button>
      </div>

      {discussions.length === 0 ? (
        <Card className="bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucune discussion trouvée</p>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre première discussion pour commencer à collaborer
            </p>
            <Button onClick={() => setDiscussionFormOpen(true)}>
              {t("createDiscussion")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <Card key={discussion._id} className="transition-all hover:shadow-md overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{discussion.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`px-2 py-0.5 text-xs rounded-full ${getCategoryClass(discussion.category as DiscussionCategory)}`}
                      >
                        {getCategoryText(discussion.category as DiscussionCategory)}
                      </Badge>
                      <CardDescription>
                        {formatDistanceToNow(new Date(discussion.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  <AvatarWithStatus user={discussion.author} />
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm line-clamp-3">{discussion.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {discussion.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {discussion.likes}
                  </span>
                </div>
                <Button variant="ghost" size="sm">
                  {t("view")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <DiscussionForm
        open={discussionFormOpen}
        onOpenChange={setDiscussionFormOpen}
      />
    </div>
  );
}