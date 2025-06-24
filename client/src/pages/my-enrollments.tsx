import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  Calendar,
  Target,
  TrendingUp,
  Award,
  Users,
  Laptop
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";

interface EnrollmentData {
  courses: CourseEnrollment[];
  roadmaps: RoadmapEnrollment[];
  labs: LabEnrollment[];
  assignments: UserAssignment[];
}

interface CourseEnrollment {
  id: number;
  courseId: number;
  progress: number;
  status: string;
  enrollmentDate: string;
  lastAccessDate: string;
  course: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    duration: number;
    tags: string[];
    coverImageUrl: string;
  };
}

interface RoadmapEnrollment {
  id: number;
  roadmapId: number;
  progress: any;
  startedAt: string;
  lastAccessedAt: string;
  roadmap: {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    type: string;
    estimatedTime: string;
  };
}

interface LabEnrollment {
  id: number;
  environmentId: number;
  state: string;
  startTime: string;
  lastActiveTime: string;
  environment: {
    id: number;
    name: string;
    description: string;
    difficulty: string;
    estimatedTime: number;
    tags: string[];
  };
}

interface UserAssignment {
  id: number;
  assignmentId: number;
  status: string;
  dueDate?: string;
  priority: string;
  startedAt?: string;
  progress: number;
  assignment: {
    id: number;
    title: string;
    description: string;
    type: string;
    isRequired: boolean;
  };
}

export default function MyEnrollmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch user enrollments
  const { data: enrollments, isLoading, error } = useQuery<EnrollmentData>({
    queryKey: ["/api/my-enrollments"],
    queryFn: async () => {
      const res = await fetch("/api/my-enrollments");
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      return await res.json();
    },
    enabled: !!user,
  });

  // Continue learning mutation
  const continueLearningMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      const res = await fetch(`/api/continue-learning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      if (!res.ok) throw new Error("Failed to continue learning");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Redirecting to content",
        description: "Taking you to where you left off.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mock data for demo purposes when API is not available
  const mockEnrollments: EnrollmentData = {
    courses: [
      {
        id: 1,
        courseId: 1,
        progress: 75,
        status: "active",
        enrollmentDate: "2024-05-01",
        lastAccessDate: "2024-06-20",
        course: {
          id: 1,
          title: "React Fundamentals",
          description: "Learn the basics of React development",
          difficulty: "beginner",
          duration: 20,
          tags: ["react", "javascript", "frontend"],
          coverImageUrl: ""
        }
      },
      {
        id: 2,
        courseId: 2,
        progress: 45,
        status: "active",
        enrollmentDate: "2024-05-15",
        lastAccessDate: "2024-06-18",
        course: {
          id: 2,
          title: "Advanced TypeScript",
          description: "Master advanced TypeScript concepts",
          difficulty: "advanced",
          duration: 30,
          tags: ["typescript", "programming"],
          coverImageUrl: ""
        }
      }
    ],
    roadmaps: [
      {
        id: 1,
        roadmapId: 1,
        progress: { completed: 8, total: 15 },
        startedAt: "2024-04-20",
        lastAccessedAt: "2024-06-19",
        roadmap: {
          id: 1,
          title: "Frontend Developer",
          description: "Complete frontend development roadmap",
          difficulty: "intermediate",
          type: "role",
          estimatedTime: "3-6 months"
        }
      }
    ],
    labs: [
      {
        id: 1,
        environmentId: 1,
        state: "running",
        startTime: "2024-06-24T10:00:00Z",
        lastActiveTime: "2024-06-24T12:30:00Z",
        environment: {
          id: 1,
          name: "AWS EC2 Setup",
          description: "Learn to set up and configure AWS EC2 instances",
          difficulty: "intermediate",
          estimatedTime: 120,
          tags: ["aws", "cloud", "devops"]
        }
      },
      {
        id: 2,
        environmentId: 2,
        state: "stopped",
        startTime: "2024-06-20T14:00:00Z",
        lastActiveTime: "2024-06-20T16:45:00Z",
        environment: {
          id: 2,
          name: "Docker Containers",
          description: "Hands-on experience with Docker containerization",
          difficulty: "beginner",
          estimatedTime: 90,
          tags: ["docker", "containers", "devops"]
        }
      }
    ],
    assignments: [
      {
        id: 1,
        assignmentId: 1,
        status: "in_progress",
        dueDate: "2024-06-30",
        priority: "high",
        startedAt: "2024-06-22",
        progress: 60,
        assignment: {
          id: 1,
          title: "Build a React Dashboard",
          description: "Create a responsive dashboard using React and TypeScript",
          type: "project",
          isRequired: true
        }
      },
      {
        id: 2,
        assignmentId: 2,
        status: "assigned",
        dueDate: "2024-07-05",
        priority: "medium",
        progress: 0,
        assignment: {
          id: 2,
          title: "DevOps Pipeline Setup",
          description: "Set up CI/CD pipeline using GitHub Actions",
          type: "lab",
          isRequired: false
        }
      }
    ]
  };

  const displayData = enrollments || mockEnrollments;

  const handleContinueLearning = (type: string, id: number) => {
    continueLearningMutation.mutate({ type, id });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "active": case "in_progress": return "default";
      case "assigned": return "secondary";
      case "overdue": return "destructive";
      default: return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": case "urgent": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Learning Journey</h1>
        <p className="text-muted-foreground">
          Track your progress across courses, roadmaps, labs, and assignments
        </p>
      </div>

      {/* Learning Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.courses.filter(c => c.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">
              {displayData.courses.length} total enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roadmaps</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.roadmaps.length}</div>
            <p className="text-xs text-muted-foreground">learning paths</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Labs</CardTitle>
            <Laptop className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.labs.filter(l => l.state === "running").length}</div>
            <p className="text-xs text-muted-foreground">
              {displayData.labs.length} total labs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.assignments.filter(a => a.status !== "completed").length}</div>
            <p className="text-xs text-muted-foreground">pending tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="roadmaps">Roadmaps</TabsTrigger>
          <TabsTrigger value="labs">Labs</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Continue Learning</h2>
            <div className="grid gap-4">
              {displayData.courses.slice(0, 2).map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                        <CardDescription>{enrollment.course.description}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(enrollment.status)}>
                        {enrollment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {enrollment.course.duration}h
                          </div>
                          <Badge variant="outline">{enrollment.course.difficulty}</Badge>
                        </div>
                        <Button 
                          onClick={() => handleContinueLearning("course", enrollment.courseId)}
                          disabled={continueLearningMutation.isPending}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Urgent Assignments */}
          {displayData.assignments.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Urgent Assignments</h2>
              <div className="grid gap-4">
                {displayData.assignments.filter(a => a.priority === "high" || a.priority === "urgent").map((assignment) => (
                  <Card key={assignment.id} className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{assignment.assignment.title}</CardTitle>
                          <CardDescription>{assignment.assignment.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getPriorityColor(assignment.priority)}>
                            {assignment.priority}
                          </Badge>
                          <Badge variant={getStatusColor(assignment.status)}>
                            {assignment.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {assignment.dueDate && (
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        <Button variant="outline">
                          <Target className="h-4 w-4 mr-2" />
                          Start Assignment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-4">
            {displayData.courses.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{enrollment.course.title}</CardTitle>
                      <CardDescription>{enrollment.course.description}</CardDescription>
                    </div>
                    <Badge variant={getStatusColor(enrollment.status)}>
                      {enrollment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {enrollment.course.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link href={`/courses/${enrollment.courseId}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button onClick={() => handleContinueLearning("course", enrollment.courseId)}>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmaps" className="space-y-6">
          <div className="grid gap-4">
            {displayData.roadmaps.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{enrollment.roadmap.title}</CardTitle>
                      <CardDescription>{enrollment.roadmap.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{enrollment.roadmap.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{enrollment.progress.completed}/{enrollment.progress.total} completed</span>
                      </div>
                      <Progress 
                        value={(enrollment.progress.completed / enrollment.progress.total) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {enrollment.roadmap.estimatedTime}
                        </div>
                        <Badge variant="outline">{enrollment.roadmap.difficulty}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link href={`/roadmaps/${enrollment.roadmapId}`}>
                            View Roadmap
                          </Link>
                        </Button>
                        <Button onClick={() => handleContinueLearning("roadmap", enrollment.roadmapId)}>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="labs" className="space-y-6">
          <div className="grid gap-4">
            {displayData.labs.map((lab) => (
              <Card key={lab.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{lab.environment.name}</CardTitle>
                      <CardDescription>{lab.environment.description}</CardDescription>
                    </div>
                    <Badge variant={lab.state === "running" ? "default" : "secondary"}>
                      {lab.state}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {lab.environment.estimatedTime} min
                        </div>
                        <Badge variant="outline">{lab.environment.difficulty}</Badge>
                      </div>
                      <div>
                        Last active: {getDaysSince(lab.lastActiveTime)} days ago
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {lab.environment.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/labs/${lab.environmentId}`}>
                          View Lab
                        </Link>
                      </Button>
                      {lab.state === "running" ? (
                        <Button>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Access Lab
                        </Button>
                      ) : (
                        <Button>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Lab
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <div className="grid gap-4">
            {displayData.assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{assignment.assignment.title}</CardTitle>
                      <CardDescription>{assignment.assignment.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(assignment.priority)}>
                        {assignment.priority}
                      </Badge>
                      <Badge variant={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignment.progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{assignment.progress}%</span>
                        </div>
                        <Progress value={assignment.progress} className="h-2" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {assignment.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          View Details
                        </Button>
                        <Button>
                          <Target className="h-4 w-4 mr-2" />
                          {assignment.status === "assigned" ? "Start" : "Continue"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}