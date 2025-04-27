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
      <Link href="/" className={`font-medium hover:text-primary transition-colors ${location === '/' ? 'text-primary' : 'text-foreground'}`}>
        Home
      </Link>
      <Link href="/roadmaps" className={`font-medium hover:text-primary transition-colors ${location.startsWith('/roadmap') ? 'text-primary' : 'text-foreground'}`}>
        Roadmaps
      </Link>
      <Link href="/guides" className="font-medium hover:text-primary transition-colors text-foreground">
        Guides
      </Link>
      <Link href="/community" className="font-medium hover:text-primary transition-colors text-foreground">
        Community
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">DevPathways</h1>
        </div>
        
        {!isMobile && (
          <div className="hidden md:flex items-center gap-8">
            <NavLinks />
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Input 
              type="text" 
              placeholder="Search roadmaps..." 
              className="bg-background rounded-md border-border px-4 py-2 w-64 focus-visible:ring-primary text-sm" 
            />
            <Search className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />
          </div>
          
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-foreground hover:bg-muted"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-1 hover:bg-muted">
                  <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="hidden md:inline-block text-foreground">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 py-2 mt-2 bg-card border-border">
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer hover:bg-muted focus:bg-muted">
                    <UserIcon className="mr-2 h-4 w-4 text-primary" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/bookmarks">
                  <DropdownMenuItem className="cursor-pointer hover:bg-muted focus:bg-muted">
                    <BookMarked className="mr-2 h-4 w-4 text-primary" />
                    <span>My Roadmaps</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer hover:bg-muted focus:bg-muted">
                    <Settings className="mr-2 h-4 w-4 text-primary" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-border" />
                {user.isAdmin && (
                  <>
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer hover:bg-muted focus:bg-muted text-primary">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="bg-border" />
                  </>
                )}
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive" 
                  onClick={handleLogout}
                >
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
        <div className="md:hidden bg-card border-b border-border p-5">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search roadmaps..." 
                className="bg-background w-full rounded-md border-border px-4 py-2 text-sm" 
              />
              <Search className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />
            </div>
            
            <div className="py-2 flex flex-col space-y-5">
              <NavLinks />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
