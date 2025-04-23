import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { Menu, LayoutDashboard, CheckSquare, Users, MessageSquare, BarChartHorizontal, Calendar } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { 
    href: "/", 
    label: t("dashboard"), 
    icon: <LayoutDashboard className="h-5 w-5 text-primary" />
  },
  { 
    href: "/tasks", 
    label: t("taskList"), 
    icon: <CheckSquare className="h-5 w-5 text-primary" />
  },
  { 
    href: "/teams", 
    label: t("teams"), 
    icon: <Users className="h-5 w-5 text-primary" />
  },
  { 
    href: "/discussions", 
    label: t("discussions"), 
    icon: <MessageSquare className="h-5 w-5 text-primary" />
  },
  { 
    href: "/performance", 
    label: t("performance"), 
    icon: <BarChartHorizontal className="h-5 w-5 text-primary" />
  },
  { 
    href: "/calendar", 
    label: t("calendar"), 
    icon: <Calendar className="h-5 w-5 text-primary" />
  }
];

type SidebarProps = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const Sidebar = ({ mobileOpen, setMobileOpen }: SidebarProps) => {
  const [location] = useLocation();

  return (
    <aside 
      className={cn(
        "w-64 bg-white shadow-lg fixed h-full z-10 transition-all duration-300 ease-in-out",
        mobileOpen ? "left-0" : "-left-64 lg:left-0"
      )}
    >
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold font-poppins">Todo List App</h1>
          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-neutral-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      <nav className="p-2">
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className="mb-1">
              <Link href={item.href}>
                <a
                  className={cn(
                    "flex items-center p-3 rounded-lg hover:bg-neutral-200 transition-colors",
                    location === item.href 
                      ? "bg-neutral-200 text-primary" 
                      : "text-neutral-800"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
