import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import RoadmapDetailPage from "@/pages/roadmap-detail-page";
import AdminPage from "@/pages/admin-page";
import UserProfile from "@/pages/user-profile";
import CommunityPage from "@/pages/community-page";
import GuidesPage from "@/pages/guides-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/roadmaps" component={HomePage} />
      <ProtectedRoute path="/roadmap/:id" component={RoadmapDetailPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <ProtectedRoute path="/profile" component={UserProfile} />
      <ProtectedRoute path="/community" component={CommunityPage} />
      <ProtectedRoute path="/guides" component={GuidesPage} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
