import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type AvatarWithStatusProps = {
  user: string;
  status?: "online" | "offline" | "away" | "busy";
  className?: string;
};

export default function AvatarWithStatus({
  user,
  status = "online",
  className,
}: AvatarWithStatusProps) {
  const initials = user
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const statusColorMap = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Avatar className={cn("h-8 w-8", className)}>
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
            statusColorMap[status]
          )}
        />
      </div>
      <span className="text-sm font-medium">{user}</span>
    </div>
  );
}