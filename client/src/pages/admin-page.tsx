import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2, Users, FileText, BarChart2, BookOpen } from "lucide-react";
import UserManagement from "@/components/admin/user-management";
import AssignRoadmaps from "@/components/admin/assign-roadmaps";
import ReportsSection from "@/components/admin/reports-section";
import AdminStats from "@/components/admin/admin-stats";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [, navigate] = useLocation();
  
  // Redirect if not admin
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, assign roadmaps, and generate reports for your learning platform.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 w-full gap-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="roadmaps" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Assign Roadmaps</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Reports</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <AdminStats />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="roadmaps" className="space-y-6">
          <AssignRoadmaps />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <ReportsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}