import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsItem, TabsList } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Book, 
  Search, 
  Clock, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Layers,
  ArrowRight,
  Award
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Course type
type Course = {
  id: number;
  title: string;
  description: string;
  longDescription?: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  instructor: string;
  status: "draft" | "published" | "archived";
  difficulty: string;
  enrollmentCount: number;
  totalRating: number;
  estimatedHours: number;
  contentItemsCount: number;
  tags: string[];
  hasCertificate: boolean;
};

// Enrollment type
type Enrollment = {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  status: "active" | "completed" | "paused";
  enrollmentDate: string;
};

export default function CoursesPage() {
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch courses
  const { data: courses, isLoading: isCoursesLoading, error: coursesError } = useQuery({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      // During development with fallback, return mock data
      if (process.env.NODE_ENV === "development") {
        return mockCourses;
      }
      
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to fetch courses');
        return await res.json() as Course[];
      } catch (err) {
        console.error("Error fetching courses:", err);
        throw err;
      }
    }
  });
  
  // Fetch user enrollments
  const { data: enrollments, isLoading: isEnrollmentsLoading, error: enrollmentsError } = useQuery({
    queryKey: ["/api/enrollments"],
    queryFn: async () => {
      // During development with fallback, return mock data
      if (process.env.NODE_ENV === "development") {
        return mockEnrollments;
      }
      
      try {
        const res = await fetch('/api/enrollments');
        if (!res.ok) throw new Error('Failed to fetch enrollments');
        return await res.json() as Enrollment[];
      } catch (err) {
        console.error("Error fetching enrollments:", err);
        throw err;
      }
    }
  });
  
  // Filter courses by difficulty, search term, and active tab
  const filteredCourses = courses?.filter(course => {
    const difficultyMatches = difficulty === "all" || course.difficulty === difficulty;
    const searchMatches = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by tab (enrolled vs. all courses)
    const tabMatches = 
      activeTab === "all" || 
      (activeTab === "enrolled" && enrollments?.some(e => e.courseId === course.id));
      
    return difficultyMatches && searchMatches && tabMatches;
  });
  
  // Handle difficulty change
  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Loading state
  if (isCoursesLoading || isEnrollmentsLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Courses</h1>
        <div className="flex justify-between mb-6">
          <div className="w-64">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="w-64">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (coursesError || enrollmentsError) {
    const error = coursesError || enrollmentsError;
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Error Loading Courses</h2>
          <p>{error instanceof Error ? error.message : "An unknown error occurred"}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Helper function to get course progress from enrollments
  const getCourseProgress = (courseId: number) => {
    const enrollment = enrollments?.find(e => e.courseId === courseId);
    return enrollment?.progress || 0;
  };
  
  // Helper function to check if a course is enrolled
  const isEnrolled = (courseId: number) => {
    return enrollments?.some(e => e.courseId === courseId) || false;
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Tabs 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full sm:w-auto"
          >
            <TabsList className="w-full sm:w-auto">
              <TabsItem value="all">All Courses</TabsItem>
              <TabsItem value="enrolled">My Courses</TabsItem>
            </TabsList>
          </Tabs>
          
          <Select value={difficulty} onValueChange={handleDifficultyChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
      </div>
      
      {/* Course Cards */}
      {filteredCourses?.length === 0 ? (
        <div className="text-center py-12">
          <Book className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No courses found</h3>
          <p className="text-muted-foreground">
            {activeTab === "enrolled" 
              ? "You haven't enrolled in any courses yet" 
              : "Try adjusting your filters or search term"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses?.map(course => (
            <Card key={course.id} className="overflow-hidden flex flex-col h-full">
              <div 
                className="h-48 bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url(${course.imageUrl || '/placeholder-course.jpg'})`,
                  backgroundColor: '#1e293b'
                }}
              />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle>{course.title}</CardTitle>
                  {course.hasCertificate && (
                    <Badge variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      Certificate
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 flex-grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span>{course.estimatedHours} hours</span>
                  </div>
                  <div className="flex items-center">
                    <Layers className="h-4 w-4 mr-1.5" />
                    <span>{course.contentItemsCount} lessons</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1.5" />
                    <span>{course.enrollmentCount} enrolled</span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className={
                      course.difficulty === 'beginner' ? 'border-green-500 text-green-500' : 
                      course.difficulty === 'intermediate' ? 'border-blue-500 text-blue-500' : 
                      'border-red-500 text-red-500'
                    }>
                      {course.difficulty}
                    </Badge>
                  </div>
                </div>
                
                {isEnrolled(course.id) && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span>Progress</span>
                      <span>{getCourseProgress(course.id)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${getCourseProgress(course.id)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-1 text-sm">
                  <GraduationCap className="h-4 w-4" />
                  <span>{course.instructor}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/courses/${course.id}`} className="w-full">
                  <Button className="w-full">
                    {isEnrolled(course.id) ? "Continue Learning" : "View Course"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Mock data for development/fallback
const mockCourses: Course[] = [
  {
    id: 1,
    title: "AWS Cloud Fundamentals",
    description: "Introduction to core AWS services and cloud concepts",
    longDescription: "This comprehensive course provides a solid foundation in AWS cloud computing. You'll learn about the core services, security practices, and architectural principles that make AWS the leading cloud platform for businesses of all sizes.",
    createdAt: "2023-01-10T00:00:00Z",
    updatedAt: "2023-01-10T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    instructor: "Sarah Johnson",
    status: "published",
    difficulty: "beginner",
    enrollmentCount: 1247,
    totalRating: 4.8,
    estimatedHours: 12,
    contentItemsCount: 24,
    tags: ["AWS", "Cloud Computing", "Fundamentals"],
    hasCertificate: true
  },
  {
    id: 2,
    title: "Advanced Terraform Infrastructure as Code",
    description: "Master Terraform for managing complex, multi-environment infrastructure",
    longDescription: "Take your Terraform skills to the expert level with this advanced course. Learn how to manage complex infrastructure across multiple cloud providers, implement advanced state management, and apply DevOps best practices to your infrastructure code.",
    createdAt: "2023-02-15T00:00:00Z",
    updatedAt: "2023-02-15T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1607743386760-88f10d53d247?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    instructor: "Michael Chen",
    status: "published",
    difficulty: "advanced",
    enrollmentCount: 876,
    totalRating: 4.9,
    estimatedHours: 18,
    contentItemsCount: 32,
    tags: ["Terraform", "Infrastructure as Code", "DevOps"],
    hasCertificate: true
  },
  {
    id: 3,
    title: "Kubernetes for Application Deployment",
    description: "Effective containerization and orchestration with Kubernetes",
    longDescription: "Learn how to effectively deploy, manage, and scale containerized applications using Kubernetes. This course covers everything from basic concepts to advanced deployment strategies, helping you become proficient in the leading container orchestration platform.",
    createdAt: "2023-03-20T00:00:00Z",
    updatedAt: "2023-03-20T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    instructor: "David Rodriguez",
    status: "published",
    difficulty: "intermediate",
    enrollmentCount: 943,
    totalRating: 4.7,
    estimatedHours: 15,
    contentItemsCount: 28,
    tags: ["Kubernetes", "Docker", "Container Orchestration"],
    hasCertificate: true
  },
  {
    id: 4,
    title: "CI/CD Pipeline Automation",
    description: "Build robust continuous integration and delivery pipelines",
    longDescription: "Master the art of automating software delivery with this comprehensive CI/CD course. Learn how to implement pipelines using popular tools like GitHub Actions, Jenkins, and GitLab CI, ensuring your applications are delivered efficiently and with high quality.",
    createdAt: "2023-04-10T00:00:00Z",
    updatedAt: "2023-04-10T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    instructor: "Emma Wilson",
    status: "published",
    difficulty: "intermediate",
    enrollmentCount: 752,
    totalRating: 4.6,
    estimatedHours: 14,
    contentItemsCount: 26,
    tags: ["CI/CD", "DevOps", "Automation"],
    hasCertificate: false
  },
  {
    id: 5,
    title: "Azure DevOps Fundamentals",
    description: "Comprehensive introduction to the Azure DevOps platform",
    longDescription: "Get started with Azure DevOps and learn how to use this powerful platform to manage your software development lifecycle. This course covers Azure Boards, Repos, Pipelines, Test Plans, and Artifacts to help you collaborate effectively and deliver software faster.",
    createdAt: "2023-05-05T00:00:00Z",
    updatedAt: "2023-05-05T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1602576666092-bf6447a729fc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    instructor: "Julia Park",
    status: "published",
    difficulty: "beginner",
    enrollmentCount: 891,
    totalRating: 4.5,
    estimatedHours: 10,
    contentItemsCount: 20,
    tags: ["Azure", "DevOps", "Microsoft"],
    hasCertificate: true
  },
  {
    id: 6,
    title: "Infrastructure Security Best Practices",
    description: "Secure your cloud infrastructure and applications",
    longDescription: "Learn essential security practices for protecting your cloud infrastructure and applications from threats. This course covers identity management, network security, encryption, compliance, and monitoring across major cloud platforms including AWS, Azure, and GCP.",
    createdAt: "2023-06-15T00:00:00Z",
    updatedAt: "2023-06-15T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    instructor: "Robert Thompson",
    status: "published",
    difficulty: "advanced",
    enrollmentCount: 635,
    totalRating: 4.8,
    estimatedHours: 16,
    contentItemsCount: 30,
    tags: ["Security", "Cloud", "Compliance"],
    hasCertificate: true
  }
];

const mockEnrollments: Enrollment[] = [
  {
    id: 1,
    userId: 1, // current user
    courseId: 1,
    progress: 75,
    status: "active",
    enrollmentDate: "2023-04-15T00:00:00Z"
  },
  {
    id: 2,
    userId: 1, // current user
    courseId: 3,
    progress: 30,
    status: "active",
    enrollmentDate: "2023-05-20T00:00:00Z"
  }
];