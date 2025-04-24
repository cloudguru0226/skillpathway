import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  Menu, 
  Search, 
  Code, 
  User as UserIcon,
  LogOut, 
  Settings, 
  BookMarked
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const NavLinks = () => (
    <>
      <Link href="/">
        <a className={`hover:text-primary transition-colors ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
          Home
        </a>
      </Link>
      <Link href="/roadmaps">
        <a className={`hover:text-primary transition-colors ${location.startsWith('/roadmap') ? 'text-primary' : 'text-muted-foreground'}`}>
          Roadmaps
        </a>
      </Link>
      <Link href="/guides">
        <a className="hover:text-primary transition-colors text-muted-foreground">
          Guides
        </a>
      </Link>
      <Link href="/community">
        <a className="hover:text-primary transition-colors text-muted-foreground">
          Community
        </a>
      </Link>
    </>
  );

  return (
    <header className="border-b border-border sticky top-0 z-20 bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">DevPathways</h1>
        </div>
        
        {!isMobile && (
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Input 
              type="text" 
              placeholder="Search roadmaps..." 
              className="bg-muted rounded-lg px-4 py-2 w-64 focus:outline-none text-sm" 
            />
            <Search className="h-5 w-5 absolute right-3 top-2.5 text-muted-foreground" />
          </div>
          
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-muted-foreground"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-0">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="hidden md:inline-block">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 py-2 mt-2">
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/bookmarks">
                  <DropdownMenuItem className="cursor-pointer">
                    <BookMarked className="mr-2 h-4 w-4" />
                    <span>My Roadmaps</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                {user.isAdmin && (
                  <>
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer text-green-500">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div className="md:hidden bg-muted p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search roadmaps..." 
                className="bg-background w-full rounded-lg px-4 py-2 text-sm" 
              />
              <Search className="h-5 w-5 absolute right-3 top-2.5 text-muted-foreground" />
            </div>
            
            <div className="py-2 space-y-4">
              <NavLinks />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
