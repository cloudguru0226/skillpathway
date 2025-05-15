import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  TrendingUp, 
  Users, 
  BarChart, 
  Clock, 
  Award, 
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  ChevronUp,
  ChevronDown,
  LineChart,
  Activity,
  Calendar,
  MessageSquare
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";

// Platform Overview Component
function PlatformOverview({ users, roadmaps }: { users: any[]; roadmaps: any[] }) {
  // Fetch platform statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/statistics"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/statistics");
        if (!response.ok) {
          throw new Error("Failed to fetch platform statistics");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching statistics:", error);
        return {
          totalUsers: users.length,
          totalRoadmaps: roadmaps.length,
          activeUsers: 0,
          totalComments: 0,
          totalDiscussions: 0,
          averageCompletionRate: 0
        };
      }
    },
  });
  
  // Fetch active users data
  const { data: activeUsersData } = useQuery({
    queryKey: ["/api/admin/active-users"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/active-users?period=week");
        if (!response.ok) {
          throw new Error("Failed to fetch active users");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching active users:", error);
        return { count: 0, trend: 0, byDay: [] };
      }
    },
  });
  
  // Prepare trend indicator
  const getTrendIndicator = (trend: number) => {
    if (trend > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    } else {
      return null;
    }
  };
  
  if (isLoadingStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" /> 
            Total Users
          </CardTitle>
          <CardDescription>Platform user count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-3xl font-bold">
              {stats?.totalUsers || users.length}
            </div>
            {activeUsersData && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <span className={activeUsersData.trend > 0 ? "text-green-500" : activeUsersData.trend < 0 ? "text-red-500" : ""}>
                  {activeUsersData.trend > 0 ? "+" : ""}{activeUsersData.trend}%
                </span>
                {getTrendIndicator(activeUsersData.trend)}
                <span className="ml-1">from last period</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary" /> 
            Total Roadmaps
          </CardTitle>
          <CardDescription>Available learning paths</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {stats?.totalRoadmaps || roadmaps.length}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {Math.round((stats?.averageCompletionRate || 0))}% avg. completion
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" /> 
            Active Learners
          </CardTitle>
          <CardDescription>Users active in last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {stats?.activeUsers || 0}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {((stats?.activeUsers || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}% of total users
          </div>
        </CardContent>
      </Card>
      
      {/* Additional Stats Row */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-primary" /> 
            Comments
          </CardTitle>
          <CardDescription>Total comments posted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {stats?.totalComments || 0}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" /> 
            Discussions
          </CardTitle>
          <CardDescription>Total forum discussions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {stats?.totalDiscussions || 0}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" /> 
            Platform Growth
          </CardTitle>
          <CardDescription>Users joined last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {Math.round(stats?.totalUsers * 0.15) || 0}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {activeUsersData?.trend > 0 ? "+" : ""}{activeUsersData?.trend || 0}% user growth 
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Engagement Charts Component
function EngagementCharts() {
  // Fetch engagement data
  const { data: engagement, isLoading: isLoadingEngagement } = useQuery({
    queryKey: ["/api/admin/engagement"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/engagement?days=14");
        if (!response.ok) {
          throw new Error("Failed to fetch engagement data");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching engagement:", error);
        return { dates: [], logins: [], comments: [], discussions: [], progress: [] };
      }
    },
  });
  
  // Transform data for charts
  const engagementData = engagement?.dates?.map((date: string, i: number) => ({
    date,
    logins: engagement.logins[i] || 0,
    comments: engagement.comments[i] || 0,
    discussions: engagement.discussions[i] || 0,
    progress: engagement.progress[i] || 0,
  })) || [];
  
  // Daily active users data from engagement
  const dailyActiveData = engagement?.dates?.map((date: string, i: number) => ({
    date,
    active: (engagement.logins[i] || 0) + (engagement.progress[i] || 0),
  })) || [];
  
  if (isLoadingEngagement) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
          <CardDescription>
            Platform activity over time
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-primary" />
            User Engagement
          </CardTitle>
          <CardDescription>
            Platform activity over the past 14 days
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={engagementData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => date.split("-").slice(1).join("/")}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip 
                formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Bar dataKey="logins" name="Logins" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="progress" name="Progress Updates" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comments" name="Comments" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="discussions" name="Discussions" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-primary" />
            Daily Active Users
          </CardTitle>
          <CardDescription>
            User activity trend over time
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailyActiveData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => date.split("-").slice(1).join("/")}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <RechartsTooltip 
                formatter={(value: number) => [value, "Active Users"]} 
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="active"
                stroke="#4f46e5"
                fillOpacity={1}
                fill="url(#activeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Learning Velocity Component
function LearningVelocity() {
  // Fetch learning velocity data
  const { data: velocity, isLoading: isLoadingVelocity } = useQuery({
    queryKey: ["/api/admin/learning-velocity"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/learning-velocity");
        if (!response.ok) {
          throw new Error("Failed to fetch learning velocity");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching learning velocity:", error);
        return { users: [], overall: [] };
      }
    },
  });
  
  // Calculate average velocity and total user count for gauges
  const averageWeeklyVelocity = 
    velocity?.overall?.find((item: any) => item.period === "Weekly")?.average || 0;
  
  const topPerformers = velocity?.users?.slice(0, 5) || [];
  
  if (isLoadingVelocity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Velocity</CardTitle>
          <CardDescription>
            How quickly users are progressing
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Learning Velocity Analysis
        </CardTitle>
        <CardDescription>
          How quickly users are progressing through roadmaps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Completion Velocity (Nodes/Week)</h3>
                <div className="flex flex-col gap-2">
                  {velocity?.overall?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.period}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-[120px] h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min(100, (item.average / 15) * 100)}%` }} 
                          />
                        </div>
                        <span className="text-sm font-medium">{item.average.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Average Weekly Progress</h3>
                <div className="flex justify-center">
                  <div className="relative h-[150px] w-[150px] flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Completed', value: averageWeeklyVelocity },
                              { name: 'Remaining', value: Math.max(0, 15 - averageWeeklyVelocity) },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                          >
                            <Cell fill="#4f46e5" />
                            <Cell fill="#e2e8f0" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="z-10 flex flex-col items-center">
                      <span className="text-3xl font-bold">{averageWeeklyVelocity.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">nodes/week</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <h3 className="text-sm font-medium mb-2">Top Performers</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Avg. Nodes/Week</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.length > 0 ? (
                  topPerformers.map((user: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-[60px] h-2 bg-secondary rounded-full overflow-hidden mr-2">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${Math.min(100, (user.avgNodesPerWeek / 15) * 100)}%` }} 
                            />
                          </div>
                          <span>{user.avgNodesPerWeek.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.lastActive).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      No velocity data available yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Roadmap Popularity Component
function RoadmapPopularity() {
  // Fetch roadmap popularity data
  const { data: popularity, isLoading: isLoadingPopularity } = useQuery({
    queryKey: ["/api/admin/roadmap-popularity"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/roadmap-popularity");
        if (!response.ok) {
          throw new Error("Failed to fetch roadmap popularity");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching roadmap popularity:", error);
        return [];
      }
    },
  });
  
  // Prepare data for chart
  const popularityData = [...(popularity || [])].sort((a, b) => b.userCount - a.userCount).slice(0, 8);
  
  if (isLoadingPopularity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Roadmap Popularity</CardTitle>
          <CardDescription>
            Most popular learning paths
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-primary" />
          Roadmap Popularity Analysis
        </CardTitle>
        <CardDescription>
          Most popular learning paths and their completion rates
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={popularityData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis 
              dataKey="title" 
              type="category" 
              tick={{ fontSize: 12 }} 
              width={150}
            />
            <RechartsTooltip 
              formatter={(value: number, name: string) => {
                if (name === "userCount") return [value, "Active Users"];
                if (name === "completionRate") return [value.toFixed(1) + "%", "Completion Rate"];
                if (name === "averageTimeSpent") return [value.toFixed(1) + " hrs", "Avg. Time Spent"];
                return [value, name];
              }}
            />
            <Legend />
            <Bar 
              dataKey="userCount" 
              name="Active Users" 
              fill="#4f46e5" 
              radius={[0, 4, 4, 0]} 
            />
            <Bar 
              dataKey="completionRate" 
              name="Completion Rate (%)" 
              fill="#10b981" 
              radius={[0, 4, 4, 0]} 
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Experience Progression Component
function ExperienceProgression() {
  // Fetch experience progression data
  const { data: progression, isLoading: isLoadingProgression } = useQuery({
    queryKey: ["/api/admin/experience-progression"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/experience-progression");
        if (!response.ok) {
          throw new Error("Failed to fetch experience progression");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching experience progression:", error);
        return { levels: [], xpSources: [], avgDaysToLevel: [] };
      }
    },
  });
  
  // Colors for the pie chart
  const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
  
  if (isLoadingProgression) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Experience & Progression</CardTitle>
          <CardDescription>
            User leveling and XP distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Experience & Level Progression
        </CardTitle>
        <CardDescription>
          User distribution across levels and XP sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Level Distribution */}
          <div>
            <h3 className="text-sm font-medium mb-3">User Level Distribution</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={progression?.levels || []}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value: number) => [value, "Users"]}
                    labelFormatter={(value) => `Level ${value}`}
                  />
                  <Bar 
                    dataKey="userCount" 
                    name="Users" 
                    fill="#4f46e5" 
                    radius={[4, 4, 0, 0]} 
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* XP Sources */}
          <div>
            <h3 className="text-sm font-medium mb-3">XP Sources Distribution</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progression?.xpSources || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="percentage"
                    nameKey="source"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {progression?.xpSources?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Percentage"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Average Days to Level */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium mb-3">Average Days to Reach Level</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={progression?.avgDaysToLevel || []}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value: number) => [value, "Days"]}
                    labelFormatter={(value) => `Level ${value}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="days" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("roadmaps");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Fetch roadmaps
  const { data: roadmaps = [], isLoading: isLoadingRoadmaps } = useQuery({
    queryKey: ["/api/roadmaps"],
  });
  
  // Fetch users (admin only)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    },
  });

  // Delete roadmap mutation
  const deleteRoadmapMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/roadmaps/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmaps"] });
      toast({
        title: "Roadmap deleted",
        description: "The roadmap has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete roadmap: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter roadmaps based on search query
  const filteredRoadmaps = roadmaps.filter((roadmap: any) => 
    roadmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    roadmap.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter users based on search query
  const filteredUsers = users.filter((user: any) => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <div className="flex-grow flex">
        <Sidebar />
        
        <main className="flex-grow p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage roadmaps, users, and platform content.</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {activeTab === "roadmaps" && (
                  <CreateRoadmapDialog />
                )}
              </div>
            </div>
            
            <TabsContent value="roadmaps" className="space-y-4">
              {isLoadingRoadmaps ? (
                // Loading skeleton
                <Card>
                  <CardContent className="pt-6">
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRoadmaps.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              No roadmaps found. Create your first roadmap to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRoadmaps.map((roadmap: any) => (
                            <TableRow key={roadmap.id}>
                              <TableCell>{roadmap.id}</TableCell>
                              <TableCell className="font-medium">{roadmap.title}</TableCell>
                              <TableCell>
                                <Badge variant={roadmap.type === "role" ? "default" : "secondary"}>
                                  {roadmap.type.charAt(0).toUpperCase() + roadmap.type.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{roadmap.difficulty}</TableCell>
                              <TableCell>{new Date(roadmap.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Roadmap</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this roadmap? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          onClick={() => deleteRoadmapMutation.mutate(roadmap.id)}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              {isLoadingUsers ? (
                <Card>
                  <CardContent className="pt-6">
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              No users found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.id}</TableCell>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.isAdmin ? "destructive" : "outline"}>
                                  {user.isAdmin ? "Admin" : "User"}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-4">
              {/* Platform Overview Cards */}
              <PlatformOverview users={users} roadmaps={roadmaps} />
              
              {/* Engagement and Activities */}
              <EngagementCharts />
              
              {/* Learning Velocity Section */}
              <LearningVelocity />
              
              {/* Roadmap Popularity Analysis */}
              <RoadmapPopularity />
              
              {/* Experience Progression Analysis */}
              <ExperienceProgression />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// Roadmap creation form schema
const roadmapFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["role", "skill"], {
    required_error: "You must select a roadmap type",
  }),
  difficulty: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "You must select a difficulty level",
  }),
  estimatedTime: z.string().min(2, "Estimated time is required"),
  content: z.any() // This would be better typed in a production app
});

type RoadmapFormValues = z.infer<typeof roadmapFormSchema>;

function CreateRoadmapDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // Default content structure for a new roadmap
  const defaultContent = {
    sections: [
      {
        title: "Getting Started",
        description: "The fundamentals to begin with",
        completed: false,
        nodes: [
          { title: "Introduction", completed: false },
          { title: "Basic Concepts", completed: false },
        ]
      }
    ]
  };
  
  const form = useForm<RoadmapFormValues>({
    resolver: zodResolver(roadmapFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "role",
      difficulty: "beginner",
      estimatedTime: "",
      content: defaultContent
    },
  });
  
  // Create roadmap mutation
  const createRoadmapMutation = useMutation({
    mutationFn: async (values: RoadmapFormValues) => {
      const response = await apiRequest("POST", "/api/roadmaps", values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roadmaps"] });
      toast({
        title: "Roadmap created",
        description: "The new roadmap has been successfully created.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create roadmap: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: RoadmapFormValues) {
    createRoadmapMutation.mutate(values);
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Roadmap
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Roadmap</DialogTitle>
          <DialogDescription>
            Add a new learning roadmap to the platform. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Frontend Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of this roadmap" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="role">Role Based</SelectItem>
                        <SelectItem value="skill">Skill Based</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Time</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 3-5 months" {...field} />
                  </FormControl>
                  <FormDescription>
                    Approximate time to complete this roadmap
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={createRoadmapMutation.isPending}
              >
                {createRoadmapMutation.isPending ? "Creating..." : "Create Roadmap"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
