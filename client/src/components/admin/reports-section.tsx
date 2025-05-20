import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart } from "@/components/ui/charts";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function ReportsSection() {
  const [timeRange, setTimeRange] = useState("week");
  const [activeTab, setActiveTab] = useState("progress");
  
  // Simulated data - would be fetched from API in production
  const progressData = {
    week: [
      { day: "Mon", completed: 12, attempted: 18 },
      { day: "Tue", completed: 15, attempted: 22 },
      { day: "Wed", completed: 10, attempted: 15 },
      { day: "Thu", completed: 18, attempted: 24 },
      { day: "Fri", completed: 14, attempted: 19 },
      { day: "Sat", completed: 8, attempted: 10 },
      { day: "Sun", completed: 5, attempted: 8 }
    ],
    month: [
      { week: "Week 1", completed: 45, attempted: 68 },
      { week: "Week 2", completed: 52, attempted: 75 },
      { week: "Week 3", completed: 48, attempted: 70 },
      { week: "Week 4", completed: 62, attempted: 80 }
    ],
    quarter: [
      { month: "Jan", completed: 180, attempted: 240 },
      { month: "Feb", completed: 210, attempted: 270 },
      { month: "Mar", completed: 195, attempted: 250 }
    ]
  };
  
  const velocityData = {
    week: [
      { day: "Mon", velocity: 4.2 },
      { day: "Tue", velocity: 5.1 },
      { day: "Wed", velocity: 3.8 },
      { day: "Thu", velocity: 6.3 },
      { day: "Fri", velocity: 4.9 },
      { day: "Sat", velocity: 3.2 },
      { day: "Sun", velocity: 2.1 }
    ],
    month: [
      { week: "Week 1", velocity: 25 },
      { week: "Week 2", velocity: 31 },
      { week: "Week 3", velocity: 28 },
      { week: "Week 4", velocity: 35 }
    ],
    quarter: [
      { month: "Jan", velocity: 98 },
      { month: "Feb", velocity: 112 },
      { month: "Mar", velocity: 105 }
    ]
  };
  
  const engagementData = {
    week: [
      { day: "Mon", active: 28, completed: 15 },
      { day: "Tue", active: 35, completed: 20 },
      { day: "Wed", active: 30, completed: 18 },
      { day: "Thu", active: 42, completed: 25 },
      { day: "Fri", active: 32, completed: 19 },
      { day: "Sat", active: 25, completed: 12 },
      { day: "Sun", active: 20, completed: 8 }
    ],
    month: [
      { week: "Week 1", active: 120, completed: 75 },
      { week: "Week 2", active: 150, completed: 90 },
      { week: "Week 3", active: 135, completed: 82 },
      { week: "Week 4", active: 160, completed: 95 }
    ],
    quarter: [
      { month: "Jan", active: 580, completed: 320 },
      { month: "Feb", active: 620, completed: 380 },
      { month: "Mar", active: 590, completed: 350 }
    ]
  };
  
  const trendsData = {
    week: [
      { day: "Mon", performance: 72 },
      { day: "Tue", performance: 78 },
      { day: "Wed", performance: 75 },
      { day: "Thu", performance: 82 },
      { day: "Fri", performance: 80 },
      { day: "Sat", performance: 76 },
      { day: "Sun", performance: 74 }
    ],
    month: [
      { week: "Week 1", performance: 74 },
      { week: "Week 2", performance: 76 },
      { week: "Week 3", performance: 79 },
      { week: "Week 4", performance: 81 }
    ],
    quarter: [
      { month: "Jan", performance: 76 },
      { month: "Feb", performance: 78 },
      { month: "Mar", performance: 80 }
    ]
  };
  
  const popularCourses = [
    { name: "Frontend Development", completion: 82 },
    { name: "DevOps Fundamentals", completion: 78 },
    { name: "AWS Cloud Architect", completion: 75 },
    { name: "Database Design", completion: 68 },
    { name: "UI/UX Principles", completion: 65 }
  ];
  
  const challengingCourses = [
    { name: "Advanced Algorithms", completion: 42 },
    { name: "Machine Learning", completion: 45 },
    { name: "Blockchain Development", completion: 48 },
    { name: "System Architecture", completion: 52 },
    { name: "Security Fundamentals", completion: 55 }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full gap-2">
            <TabsTrigger value="progress">Progress Reports</TabsTrigger>
            <TabsTrigger value="velocity">Learning Velocity</TabsTrigger>
            <TabsTrigger value="engagement">Engagement Analytics</TabsTrigger>
            <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          </TabsList>
          
          <div className="my-4 flex justify-end">
            <div className="flex items-center gap-2">
              <Label htmlFor="time-range">Time Range:</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger id="time-range" className="w-[140px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Roadmap Progress Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={progressData[timeRange as keyof typeof progressData] || []}
                  index={timeRange === "week" ? "day" : timeRange === "month" ? "week" : "month"}
                  categories={["completed", "attempted"]}
                  colors={["#2563eb", "#93c5fd"]}
                  stack={false}
                  valueFormatter={(value) => `${value} steps`}
                  className="h-72"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="velocity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Velocity (Completion Rate)</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={velocityData[timeRange as keyof typeof velocityData] || []}
                  index={timeRange === "week" ? "day" : timeRange === "month" ? "week" : "month"}
                  categories={["velocity"]}
                  colors={["#2563eb"]}
                  valueFormatter={(value) => `${value} steps/day`}
                  showLegend={false}
                  className="h-72"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={engagementData[timeRange as keyof typeof engagementData] || []}
                  index={timeRange === "week" ? "day" : timeRange === "month" ? "week" : "month"}
                  categories={["active", "completed"]}
                  colors={["#2563eb", "#16a34a"]}
                  stack={false}
                  valueFormatter={(value) => `${value} users`}
                  className="h-72"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={trendsData[timeRange as keyof typeof trendsData] || []}
                  index={timeRange === "week" ? "day" : timeRange === "month" ? "week" : "month"}
                  categories={["performance"]}
                  colors={["#2563eb"]}
                  valueFormatter={(value) => `${value}%`}
                  showLegend={false}
                  className="h-72"
                />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Most Completed Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={popularCourses}
                    index="name"
                    categories={["completion"]}
                    colors={["#16a34a"]}
                    layout="vertical"
                    valueFormatter={(value) => `${value}%`}
                    showLegend={false}
                    className="h-72"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Least Completed Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={challengingCourses}
                    index="name"
                    categories={["completion"]}
                    colors={["#dc2626"]}
                    layout="vertical"
                    valueFormatter={(value) => `${value}%`}
                    showLegend={false}
                    className="h-72"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}