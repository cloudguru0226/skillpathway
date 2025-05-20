import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, Filter, FileDown } from "lucide-react";

// Simulated report data
const mockProgressData = [
  { username: "sarah_developer", roadmap: "Frontend Developer", progress: 78, lastActive: "2025-05-15T14:32:00Z" },
  { username: "john_learner", roadmap: "AWS", progress: 45, lastActive: "2025-05-18T09:45:00Z" },
  { username: "emma_student", roadmap: "DevOps Engineer", progress: 62, lastActive: "2025-05-19T16:20:00Z" },
  { username: "alex_engineer", roadmap: "Backend Developer", progress: 31, lastActive: "2025-05-17T11:15:00Z" },
  { username: "sarah_developer", roadmap: "Full Stack", progress: 57, lastActive: "2025-05-16T18:30:00Z" },
  { username: "john_learner", roadmap: "Engineering Manager", progress: 23, lastActive: "2025-05-14T10:22:00Z" },
  { username: "emma_student", roadmap: "MLOps Engineer", progress: 19, lastActive: "2025-05-13T13:45:00Z" },
  { username: "alex_engineer", roadmap: "Game Developer", progress: 41, lastActive: "2025-05-12T15:17:00Z" }
];

const mockLearningVelocityData = [
  { name: 'Sarah', velocity: 87, avgTimePerModule: 45 },
  { name: 'John', velocity: 52, avgTimePerModule: 78 },
  { name: 'Emma', velocity: 63, avgTimePerModule: 62 },
  { name: 'Alex', velocity: 39, avgTimePerModule: 95 }
];

const mockEngagementData = [
  { name: 'Week 1', completed: 12, started: 32, dropped: 8 },
  { name: 'Week 2', completed: 18, started: 28, dropped: 4 },
  { name: 'Week 3', completed: 21, started: 30, dropped: 3 },
  { name: 'Week 4', completed: 25, started: 25, dropped: 2 }
];

const mockRoadmapCompletionData = [
  { name: 'Frontend', value: 32 },
  { name: 'Backend', value: 27 },
  { name: 'DevOps', value: 18 },
  { name: 'AWS', value: 15 },
  { name: 'Data Science', value: 8 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ReportsSection() {
  const [timePeriod, setTimePeriod] = useState("30days");
  const [reportType, setReportType] = useState("progress");
  
  const { data: progressData, isLoading } = useQuery({
    queryKey: ["/api/admin/reports/progress"],
    // Set a higher staleTime for admin reports to avoid too many refetches
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // This would be real data from the API in a production environment
  const reportData = progressData || mockProgressData;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Progress and Analytics</CardTitle>
              <CardDescription>
                Track learner progress and platform usage analytics
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="progress" onValueChange={setReportType} className="space-y-4">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
              <TabsTrigger value="velocity">Learning Velocity</TabsTrigger>
              <TabsTrigger value="engagement">Engagement Metrics</TabsTrigger>
              <TabsTrigger value="performance">Performance Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Progress Overview</CardTitle>
                  <CardDescription>
                    Progress completion rates by user and learning track
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Learning Track</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Last Active</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.map((item: any, index: number) => (
                          <TableRow key={`${item.username}-${item.roadmap}-${index}`}>
                            <TableCell className="font-medium">{item.username}</TableCell>
                            <TableCell>{item.roadmap}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-full max-w-[100px]">
                                  <Progress value={item.progress} className="h-2" />
                                </div>
                                <span className="text-xs">{item.progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(item.lastActive)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Learner Distribution</CardTitle>
                    <CardDescription>
                      Learners grouped by completion percentage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockRoadmapCompletionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {mockRoadmapCompletionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Completion Summary</CardTitle>
                    <CardDescription>
                      Track completion rates for modules and labs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Frontend Developer</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>DevOps Engineer</span>
                        <span className="font-medium">62%</span>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Full Stack</span>
                        <span className="font-medium">57%</span>
                      </div>
                      <Progress value={57} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>AWS</span>
                        <span className="font-medium">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Backend Developer</span>
                        <span className="font-medium">31%</span>
                      </div>
                      <Progress value={31} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="velocity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Velocity</CardTitle>
                  <CardDescription>
                    Average time spent on modules and completion rates
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockLearningVelocityData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="velocity" name="Velocity Score" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="avgTimePerModule" name="Avg. Minutes per Module" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Time Between Sessions</CardTitle>
                    <CardDescription>
                      Average time between learning sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Sarah Developer</span>
                          <span className="text-sm font-medium">1.2 days</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>John Learner</span>
                          <span className="text-sm font-medium">2.8 days</span>
                        </div>
                        <Progress value={47} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Emma Student</span>
                          <span className="text-sm font-medium">1.5 days</span>
                        </div>
                        <Progress value={25} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Alex Engineer</span>
                          <span className="text-sm font-medium">4.3 days</span>
                        </div>
                        <Progress value={72} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Time-on-Task</CardTitle>
                    <CardDescription>
                      Average time spent on modules and labs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Frontend Modules</span>
                        <span className="font-medium">45 mins</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>DevOps Labs</span>
                        <span className="font-medium">85 mins</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>AWS Terraform Labs</span>
                        <span className="font-medium">105 mins</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Backend Modules</span>
                        <span className="font-medium">38 mins</span>
                      </div>
                      <Progress value={38} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Full Stack Projects</span>
                        <span className="font-medium">120 mins</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="engagement" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>
                    Tracking user drop-off rates and session completion
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockEngagementData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" name="Completed" fill="#10b981" />
                      <Bar dataKey="started" name="Started" fill="#3b82f6" />
                      <Bar dataKey="dropped" name="Dropped" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Completion Rate</CardTitle>
                    <CardDescription>
                      Percentage of started sessions that were completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Frontend Track</span>
                          <span className="text-sm font-medium">76%</span>
                        </div>
                        <Progress value={76} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>AWS Track</span>
                          <span className="text-sm font-medium">82%</span>
                        </div>
                        <Progress value={82} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>DevOps Track</span>
                          <span className="text-sm font-medium">68%</span>
                        </div>
                        <Progress value={68} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span>Backend Track</span>
                          <span className="text-sm font-medium">59%</span>
                        </div>
                        <Progress value={59} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Drop-off Rates</CardTitle>
                    <CardDescription>
                      Points where users abandon learning tracks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Introduction Modules</span>
                        <span className="font-medium">5%</span>
                      </div>
                      <Progress value={5} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Basic Concepts</span>
                        <span className="font-medium">12%</span>
                      </div>
                      <Progress value={12} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Advanced Topics</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Practical Labs</span>
                        <span className="font-medium">18%</span>
                      </div>
                      <Progress value={18} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Final Projects</span>
                        <span className="font-medium">30%</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    User performance comparison and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Performance analytics chart (Team vs Team comparison) will appear here
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Most Completed Courses</CardTitle>
                    <CardDescription>
                      Highest completion rate courses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <div className="rounded-md bg-primary/10 p-2 text-primary">
                            1
                          </div>
                          <div>
                            <div className="font-semibold">Frontend Basics</div>
                            <div className="text-sm text-muted-foreground">
                              HTML, CSS, JavaScript Foundations
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">92%</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <div className="rounded-md bg-primary/10 p-2 text-primary">
                            2
                          </div>
                          <div>
                            <div className="font-semibold">React Fundamentals</div>
                            <div className="text-sm text-muted-foreground">
                              Component-based UI Development
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">87%</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <div className="rounded-md bg-primary/10 p-2 text-primary">
                            3
                          </div>
                          <div>
                            <div className="font-semibold">Git Essentials</div>
                            <div className="text-sm text-muted-foreground">
                              Version Control Basics
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">84%</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <div className="rounded-md bg-primary/10 p-2 text-primary">
                            4
                          </div>
                          <div>
                            <div className="font-semibold">AWS Basics</div>
                            <div className="text-sm text-muted-foreground">
                              Cloud Fundamentals
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">81%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Least Completed Courses</CardTitle>
                    <CardDescription>
                      Courses with lowest completion rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <div className="rounded-md bg-destructive/10 p-2 text-destructive">
                            1
                          </div>
                          <div>
                            <div className="font-semibold">Advanced Kubernetes</div>
                            <div className="text-sm text-muted-foreground">
                              Container Orchestration at Scale
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">34%</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <div className="rounded-md bg-destructive/10 p-2 text-destructive">
                            2
                          </div>
                          <div>
                            <div className="font-semibold">Machine Learning</div>
                            <div className="text-sm text-muted-foreground">
                              Advanced Algorithms & Models
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">38%</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <div className="rounded-md bg-destructive/10 p-2 text-destructive">
                            3
                          </div>
                          <div>
                            <div className="font-semibold">System Design</div>
                            <div className="text-sm text-muted-foreground">
                              Scalable Architecture Patterns
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">42%</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <div className="rounded-md bg-destructive/10 p-2 text-destructive">
                            4
                          </div>
                          <div>
                            <div className="font-semibold">Security Practices</div>
                            <div className="text-sm text-muted-foreground">
                              Cloud & Application Security
                            </div>
                          </div>
                        </div>
                        <div className="font-medium">45%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}