import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarWithStatusProps {
  user: string;
}

const AvatarWithStatus = ({ user }: AvatarWithStatusProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Generate a deterministic color based on the name
  const getColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <div className="flex items-center">
      <Avatar className="h-8 w-8 rounded-full mr-2">
        <AvatarFallback 
          style={{ 
            backgroundColor: getColor(user),
            color: 'white'
          }}
        >
          {getInitials(user)}
        </AvatarFallback>
      </Avatar>
      <span>{user}</span>
    </div>
  );
};

export default AvatarWithStatus;
