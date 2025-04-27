import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Book, 
  BookMarked, 
  Settings, 
  BarChart, 
  Users, 
  PlusCircle,
  UserCircle,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isAdmin = user?.isAdmin;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { 
      href: "/", 
      label: "Dashboard", 
      icon: <Home className="h-5 w-5 mr-2" />,
      active: location === "/" 
    },
    { 
      href: "/roadmaps", 
      label: "All Roadmaps", 
      icon: <Book className="h-5 w-5 mr-2" />,
      active: location === "/roadmaps" 
    },
    { 
      href: "/bookmarks", 
      label: "My Roadmaps", 
      icon: <BookMarked className="h-5 w-5 mr-2" />,
      active: location === "/bookmarks" 
    },
  ];

  const adminItems = [
    { 
      href: "/admin", 
      label: "Admin Dashboard", 
      icon: <BarChart className="h-5 w-5 mr-2" />,
      active: location === "/admin" 
    },
    { 
      href: "/admin/create-roadmap", 
      label: "Create Roadmap", 
      icon: <PlusCircle className="h-5 w-5 mr-2" />,
      active: location === "/admin/create-roadmap" 
    },
    { 
      href: "/admin/users", 
      label: "Manage Users", 
      icon: <Users className="h-5 w-5 mr-2" />,
      active: location === "/admin/users" 
    },
  ];

  return (
    <div className={cn("pb-12 w-64 min-w-64 bg-card border-r border-border", className)}>
      <div className="py-6 px-5 flex items-center border-b border-border">
        <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground mr-3">
          {user?.username.substring(0, 2).toUpperCase()}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">{user?.username}</p>
          <p className="text-xs text-muted-foreground">
            {isAdmin ? "Administrator" : "Learner"}
          </p>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-100px)]">
        <div className="px-3 py-4">
          <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main Navigation
          </h3>
          <div className="space-y-1 py-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-normal",
                    item.active ? 
                      "bg-primary/10 text-primary hover:bg-primary/20" : 
                      "text-foreground hover:bg-muted"
                  )}
                  size="sm"
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
          
          <h3 className="mt-6 mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            User
          </h3>
          <div className="space-y-1 py-2">
            <Link href="/profile">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal",
                  location === "/profile" ? 
                    "bg-primary/10 text-primary hover:bg-primary/20" : 
                    "text-foreground hover:bg-muted"
                )}
                size="sm"
              >
                <UserCircle className="h-5 w-5 mr-2" />
                Profile
              </Button>
            </Link>
            <Link href="/settings">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal",
                  location === "/settings" ? 
                    "bg-primary/10 text-primary hover:bg-primary/20" : 
                    "text-foreground hover:bg-muted"
                )}
                size="sm"
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
          
          {isAdmin && (
            <>
              <h3 className="mt-6 mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administration
              </h3>
              <div className="space-y-1 py-2">
                {adminItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start font-normal",
                        item.active ? 
                          "bg-primary/10 text-primary hover:bg-primary/20" : 
                          "text-foreground hover:bg-muted"
                      )}
                      size="sm"
                    >
                      {item.icon}
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </>
          )}
          
          <div className="mt-8 pt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start font-normal text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
