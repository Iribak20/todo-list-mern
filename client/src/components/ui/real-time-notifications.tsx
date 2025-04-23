import { useState, useEffect } from "react";
import { useWebSocket, WebSocketMessage } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function RealTimeNotifications() {
  const { isConnected, lastMessage, error } = useWebSocket();
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Process incoming messages
  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'task-created' || 
                        lastMessage.type === 'task-updated' ||
                        lastMessage.type === 'discussion-created' ||
                        lastMessage.type === 'team-created')) {
      
      // Add to notifications list
      setNotifications(prev => {
        const newNotifications = [lastMessage, ...prev].slice(0, 10); // Keep only 10 most recent
        return newNotifications;
      });
      
      // Increase unread count
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast({
        title: getNotificationTitle(lastMessage),
        description: getNotificationDescription(lastMessage),
        duration: 5000,
      });
    }
  }, [lastMessage, toast]);

  // Helper functions to format notifications
  const getNotificationTitle = (message: WebSocketMessage): string => {
    switch (message.type) {
      case 'task-created': return 'Nouvelle tâche';
      case 'task-updated': return 'Tâche mise à jour';
      case 'discussion-created': return 'Nouvelle discussion';
      case 'team-created': return 'Nouvelle équipe';
      default: return 'Notification';
    }
  };

  const getNotificationDescription = (message: WebSocketMessage): string => {
    if (!message.payload) return 'Notification reçue';
    
    switch (message.type) {
      case 'task-created': 
        return `"${message.payload.title}" créée par ${message.payload.assignee || 'un utilisateur'}`;
      case 'task-updated': 
        return `"${message.payload.title}" mise à jour (${message.payload.status})`;
      case 'discussion-created': 
        return `"${message.payload.title}" démarrée par ${message.payload.author || 'un utilisateur'}`;
      case 'team-created': 
        return `"${message.payload.name}" créée par ${message.payload.leader || 'un utilisateur'}`;
      default: 
        return message.message || 'Notification reçue';
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative">
        <Bell className="h-5 w-5" />
        {isConnected && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" onClick={markAsRead}>
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h4 className="font-medium">Notifications</h4>
          <Badge variant={isConnected ? "outline" : "secondary"} className="text-xs">
            {isConnected ? "Connecté" : "Déconnecté"}
          </Badge>
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Aucune notification récente
          </div>
        ) : (
          <div className="max-h-80 overflow-auto">
            {notifications.map((notification, index) => (
              <DropdownMenuItem key={index} className="flex flex-col items-start p-3 focus:bg-accent cursor-default">
                <div className="flex items-start justify-between w-full">
                  <span className="font-medium">{getNotificationTitle(notification)}</span>
                  {notification.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: fr })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 w-full">
                  {getNotificationDescription(notification)}
                </p>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        {error && (
          <div className="px-4 py-2 text-sm text-destructive border-t">
            {error}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}