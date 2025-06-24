import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Code, LayoutDashboard, LogOut, Map, User, Target, Search } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Function to determine if a link is active
  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Map className="h-6 w-6" />
              <span className="font-bold text-xl">TechRoadmap</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex flex-1 items-center space-x-1 md:space-x-2">
          <Link href="/">
            <Button 
              variant={isActive("/") ? "default" : "ghost"} 
              size="sm" 
              className="text-sm"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/courses">
            <Button 
              variant={isActive("/courses") ? "default" : "ghost"}
              size="sm"
              className="text-sm"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </Button>
          </Link>
          <Link href="/labs">
            <Button 
              variant={isActive("/labs") ? "default" : "ghost"}
              size="sm"
              className="text-sm"
            >
              <Code className="mr-2 h-4 w-4" />
              Labs
            </Button>
          </Link>
          <Link href="/my-enrollments">
            <Button 
              variant={isActive("/my-enrollments") ? "default" : "ghost"}
              size="sm"
              className="text-sm"
            >
              <Target className="mr-2 h-4 w-4" />
              My Learning
            </Button>
          </Link>
          <Link href="/search">
            <Button 
              variant={isActive("/search") ? "default" : "ghost"}
              size="sm"
              className="text-sm"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </Link>
        </nav>
        
        <div className="flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt={user.username} />
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                {user.isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}