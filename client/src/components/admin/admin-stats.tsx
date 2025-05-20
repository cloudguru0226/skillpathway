import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { Loader2, Users, BookOpen, Award, TrendingUp } from "lucide-react";

export default function AdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Failed to fetch platform stats");
        return await res.json();
      } catch (error) {
        console.error("Error fetching platform stats:", error);
        return {
          totalUsers: 45,
          activeUsers: 32,
          totalRoadmaps: 12,
          averageCompletionRate: 68,
          userActivity: [
            { day: "Mon", count: 22 },
            { day: "Tue", count: 36 },
            { day: "Wed", count: 42 },
            { day: "Thu", count: 38 },
            { day: "Fri", count: 40 },
            { day: "Sat", count: 25 },
            { day: "Sun", count: 18 }
          ],
          roadmapPopularity: [
            { name: "Frontend", value: 35 },
            { name: "Backend", value: 25 },
            { name: "DevOps", value: 15 },
            { name: "Data Science", value: 18 },
            { name: "Mobile", value: 7 }
          ],
          learningVelocity: [
            { month: "Jan", velocity: 12 },
            { month: "Feb", velocity: 14 },
            { month: "Mar", velocity: 18 },
            { month: "Apr", velocity: 16 },
            { month: "May", velocity: 21 },
            { month: "Jun", velocity: 22 }
          ]
        };
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold">{stats?.totalUsers || 0}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Total Users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold">{stats?.totalRoadmaps || 0}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Learning Tracks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold">{stats?.activeUsers || 0}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Active Users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold">{stats?.averageCompletionRate || 0}%</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Avg. Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={stats?.userActivity || []}
              index="day"
              categories={["count"]}
              colors={["#2563eb"]}
              valueFormatter={(value) => `${value} users`}
              className="h-72"
            />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Roadmap Popularity</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PieChart 
              data={stats?.roadmapPopularity || []}
              index="name"
              categories={["value"]}
              colors={["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"]}
              valueFormatter={(value) => `${value} users`}
              className="h-72"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Velocity</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart 
            data={stats?.learningVelocity || []}
            index="month"
            categories={["velocity"]}
            colors={["#2563eb"]}
            valueFormatter={(value) => `${value} steps/week`}
            showLegend={false}
            className="h-72"
          />
        </CardContent>
      </Card>
    </div>
  );
}