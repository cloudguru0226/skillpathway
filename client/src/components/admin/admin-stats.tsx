import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Activity, BookOpen, Clock, Users, Award } from "lucide-react";

export default function AdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    staleTime: 60 * 1000, // 1 minute
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading stats...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active learners, instructors, and admins
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Tracks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRoadmaps || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available roadmaps and learning paths
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Users active in the last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageCompletionRate || 0}%</div>
            <div className="mt-2">
              <Progress value={stats?.averageCompletionRate || 0} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average completion rate across all tracks
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="engagement">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="learning-velocity">Learning Velocity</TabsTrigger>
          <TabsTrigger value="track-popularity">Track Popularity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="engagement" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Metrics</CardTitle>
              <CardDescription>
                Platform engagement over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Interactive engagement chart showing logins, activity, and session duration data will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="learning-velocity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Velocity</CardTitle>
              <CardDescription>
                Average time spent on modules and completion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Learning velocity metrics showing how quickly users progress through learning tracks
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="track-popularity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Track Popularity</CardTitle>
              <CardDescription>
                Most popular learning tracks by enrollment and completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                Bar chart showing popularity of different learning tracks will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}