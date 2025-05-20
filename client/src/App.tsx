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
import { Navbar } from "@/components/layout/navbar";
import FixedRoadmap from "@/pages/fixed-roadmap";
import TestRoadmap from "@/pages/test-roadmap";

// Labs and Courses pages
import LabsPage from "@/pages/labs/labs-page";
import LabDetailPage from "@/pages/labs/lab-detail-page";
import LabInstancePage from "@/pages/labs/lab-instance-page";
import CoursesPage from "@/pages/courses/courses-page";
import CourseDetailPage from "@/pages/courses/course-detail-page";
import CertificatesPage from "@/pages/courses/certificates-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/roadmaps" component={HomePage} />
      <Route path="/fixed-roadmap" component={FixedRoadmap} />
      <Route path="/test-roadmap" component={TestRoadmap} />
      <ProtectedRoute path="/roadmap/:id" component={RoadmapDetailPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <ProtectedRoute path="/profile" component={UserProfile} />
      <ProtectedRoute path="/community" component={CommunityPage} />
      <ProtectedRoute path="/guides" component={GuidesPage} />
      
      {/* Labs Routes */}
      <ProtectedRoute path="/labs" component={LabsPage} />
      <ProtectedRoute path="/labs/:id" component={LabDetailPage} />
      <ProtectedRoute path="/labs/instance/:id" component={LabInstancePage} />
      
      {/* Courses Routes */}
      <ProtectedRoute path="/courses" component={CoursesPage} />
      <ProtectedRoute path="/courses/:id" component={CourseDetailPage} />
      <ProtectedRoute path="/certificates" component={CertificatesPage} />
      
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
            <div className="min-h-screen flex flex-col">
              {/* Include the Navbar component */}
              <Navbar />
              <main className="flex-1">
                <Router />
              </main>
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
