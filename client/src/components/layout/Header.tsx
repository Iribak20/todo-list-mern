import { useState } from "react";
import { Menu, Moon, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { RealTimeNotifications } from "@/components/ui/real-time-notifications";

type HeaderProps = {
  setMobileOpen: (open: boolean) => void;
};

const Header = ({ setMobileOpen }: HeaderProps) => {
  const { setTheme, theme } = useTheme();
  const [hasNotifications] = useState(true);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-white shadow-sm fixed w-full lg:w-[calc(100%-16rem)] z-10">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => setMobileOpen(true)}
            className="lg:hidden mr-4 text-neutral-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-neutral-200 transition-colors"
          >
            <Moon className="h-5 w-5" />
          </button>
          <div className="p-2 rounded-full hover:bg-neutral-200 transition-colors relative">
            <RealTimeNotifications />
          </div>
          <button className="p-2 rounded-full hover:bg-neutral-200 transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
