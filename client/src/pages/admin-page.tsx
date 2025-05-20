import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useAdminUsers, usePlatformStats } from "@/hooks/use-admin";
import UserManagement from "@/components/admin/user-management";
import AssignRoadmaps from "@/components/admin/assign-roadmaps";
import ReportsSection from "@/components/admin/reports-section";
import AdminStats from "@/components/admin/admin-stats";
import { Loader2, Users, FileText, BarChart2, BookOpen } from "lucide-react";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [, navigate] = useLocation();
  
  const {
    data: users,
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useAdminUsers();
  
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats
  } = usePlatformStats();
  
  // Redirect if not admin
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user?.isAdmin) {
    navigate("/");
    return null;
  }
  
  // Fetch data when component mounts
  if (activeTab === "overview" && !stats && !isLoadingStats) {
    refetchStats();
  }
  
  if (activeTab === "users" && !users && !isLoadingUsers) {
    refetchUsers();
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
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 w-full gap-2">
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
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>
                Key metrics and statistics about your learning platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <AdminStats stats={stats} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View, create, and manage user accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <UserManagement users={users} isLoading={isLoadingUsers} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roadmaps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assign Roadmaps</CardTitle>
              <CardDescription>
                Assign learning roadmaps to users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssignRoadmaps users={users} isLoading={isLoadingUsers} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate reports for user progress, learning velocity, and platform usage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}