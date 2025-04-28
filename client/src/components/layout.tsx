import React, { ReactNode } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  BookOpen,
  Users,
  FileText,
  LayoutDashboard,
  UserCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isMobileOpen?: boolean;
}

function NavLink({ href, icon, label, isMobileOpen }: NavLinkProps) {
  const [location] = useLocation();
  const isActive = location === href || (href !== '/' && location.startsWith(href));
  
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive 
          ? "bg-secondary text-secondary-foreground" 
          : "text-muted-foreground hover:bg-secondary/50"
      )}>
        {icon}
        <span className={isMobileOpen ? "" : "hidden md:inline-block"}>{label}</span>
      </a>
    </Link>
  );
}

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logoutMutation } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navLinks = [
    { href: '/', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { href: '/roadmaps', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Roadmaps' },
    { href: '/guides', icon: <BookOpen className="h-5 w-5" />, label: 'Guides' },
    { href: '/community', icon: <Users className="h-5 w-5" />, label: 'Community' },
  ];
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-14 lg:w-64 border-r flex-col fixed h-full">
        <div className="py-4 px-2 lg:px-4 flex items-center h-16">
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl px-2">
              <BookOpen className="h-6 w-6" />
              <span className="hidden lg:inline">Learning Path</span>
            </a>
          </Link>
        </div>
        
        <nav className="flex-1 py-4 px-2">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <NavLink 
                key={link.href} 
                href={link.href} 
                icon={link.icon} 
                label={link.label} 
              />
            ))}
          </div>
          
          {user?.isAdmin && (
            <>
              <div className="my-4 px-3">
                <div className="h-px bg-border" />
              </div>
              <div className="space-y-1">
                <NavLink 
                  href="/admin" 
                  icon={<FileText className="h-5 w-5" />} 
                  label="Admin Panel" 
                />
              </div>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>
                    {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline truncate">{user?.username || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      
      {/* Mobile Navigation */}
      <div className="flex md:hidden items-center justify-between p-4 h-16 border-b w-full fixed top-0 z-10 bg-background">
        <Link href="/">
          <a className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6" />
            <span>Learning Path</span>
          </a>
        </Link>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 pt-10">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3"
            >
              <X className="h-6 w-6" />
            </Button>
            
            <nav className="space-y-1 mt-8">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.href} 
                  href={link.href} 
                  icon={link.icon} 
                  label={link.label} 
                  isMobileOpen={true}
                />
              ))}
              
              {user?.isAdmin && (
                <>
                  <div className="my-4 px-3">
                    <div className="h-px bg-border" />
                  </div>
                  <NavLink 
                    href="/admin" 
                    icon={<FileText className="h-5 w-5" />} 
                    label="Admin Panel" 
                    isMobileOpen={true}
                  />
                </>
              )}
            </nav>
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="border-t pt-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>
                          {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{user?.username || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 md:ml-14 lg:ml-64 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}