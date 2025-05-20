import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/navigation/back-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Layers,
  ArrowRight,
  Award,
  Check,
  Play,
  File,
  FileText,
  PanelRight,
  Video,
  Lock
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

// Module type
type CourseModule = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
};

// Content item type
type ContentItem = {
  id: number;
  moduleId: number;
  title: string;
  type: "video" | "article" | "quiz" | "assignment" | "resource";
  duration: number; // in minutes
  order: number;
  isLocked: boolean;
  completionPoints: number;
};

// Content progress type
type ContentProgress = {
  contentItemId: number;
  progress: number; // 0-100
  completed: boolean;
  lastAccessedAt: string;
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

export default function CourseDetailPage() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const courseId = parseInt(params.id);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  const [openItems, setOpenItems] = useState<string[]>([]);
  
  // Fetch course details
  const { 
    data: course, 
    isLoading: isCourseLoading, 
    error: courseError 
  } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    queryFn: async () => {
      // During development, return mock data
      if (process.env.NODE_ENV === "development") {
        return mockCourse;
      }
      
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (!res.ok) throw new Error('Failed to fetch course');
        return await res.json() as Course;
      } catch (err) {
        console.error("Error fetching course:", err);
        throw err;
      }
    }
  });
  
  // Fetch course modules
  const { 
    data: modules, 
    isLoading: isModulesLoading, 
    error: modulesError 
  } = useQuery({
    queryKey: [`/api/courses/${courseId}/modules`],
    queryFn: async () => {
      // During development, return mock data
      if (process.env.NODE_ENV === "development") {
        return mockModules;
      }
      
      try {
        const res = await fetch(`/api/courses/${courseId}/modules`);
        if (!res.ok) throw new Error('Failed to fetch course modules');
        return await res.json() as CourseModule[];
      } catch (err) {
        console.error("Error fetching course modules:", err);
        throw err;
      }
    }
  });
  
  // Fetch course content
  const { 
    data: contentMap, 
    isLoading: isContentLoading, 
    error: contentError 
  } = useQuery({
    queryKey: [`/api/courses/${courseId}/content`],
    queryFn: async () => {
      // During development, return mock data
      if (process.env.NODE_ENV === "development") {
        return mockContentMap;
      }
      
      try {
        const res = await fetch(`/api/courses/${courseId}/content`);
        if (!res.ok) throw new Error('Failed to fetch course content');
        return await res.json() as Record<number, ContentItem[]>;
      } catch (err) {
        console.error("Error fetching course content:", err);
        throw err;
      }
    },
    enabled: !!modules && modules.length > 0
  });
  
  // Fetch enrollment
  const { 
    data: enrollment, 
    isLoading: isEnrollmentLoading, 
    error: enrollmentError 
  } = useQuery({
    queryKey: [`/api/courses/${courseId}/enrollment`],
    queryFn: async () => {
      // During development, return mock data
      if (process.env.NODE_ENV === "development") {
        return mockEnrollment;
      }
      
      try {
        const res = await fetch(`/api/courses/${courseId}/enrollment`);
        if (!res.ok) {
          if (res.status === 404) {
            return null; // Not enrolled
          }
          throw new Error('Failed to fetch enrollment');
        }
        return await res.json() as Enrollment;
      } catch (err) {
        console.error("Error fetching enrollment:", err);
        throw err;
      }
    }
  });
  
  // Fetch content progress
  const { 
    data: contentProgress, 
    isLoading: isProgressLoading, 
    error: progressError 
  } = useQuery({
    queryKey: [`/api/courses/${courseId}/progress`],
    queryFn: async () => {
      // During development, return mock data
      if (process.env.NODE_ENV === "development") {
        return mockContentProgress;
      }
      
      try {
        const res = await fetch(`/api/courses/${courseId}/progress`);
        if (!res.ok) {
          if (res.status === 404) {
            return []; // No progress yet
          }
          throw new Error('Failed to fetch content progress');
        }
        return await res.json() as ContentProgress[];
      } catch (err) {
        console.error("Error fetching content progress:", err);
        throw err;
      }
    },
    enabled: !!enrollment
  });
  
  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/enroll`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/enrollment`] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      
      toast({
        title: "Enrolled Successfully",
        description: "You are now enrolled in this course. Start learning!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Enroll",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });
  
  // Helper function to get content progress
  const getContentProgress = (contentId: number) => {
    if (!contentProgress) return 0;
    const progress = contentProgress.find(p => p.contentItemId === contentId);
    return progress ? progress.progress : 0;
  };
  
  // Helper function to check if content is completed
  const isContentCompleted = (contentId: number) => {
    if (!contentProgress) return false;
    const progress = contentProgress.find(p => p.contentItemId === contentId);
    return progress ? progress.completed : false;
  };
  
  // Handle enroll
  const handleEnroll = () => {
    enrollMutation.mutate();
  };
  
  // Helper function to get total content items
  const getTotalContentItems = () => {
    if (!contentMap) return 0;
    
    return Object.values(contentMap).reduce((total, items) => total + items.length, 0);
  };
  
  // Helper function to get completed content items count
  const getCompletedContentItemsCount = () => {
    if (!contentProgress) return 0;
    
    return contentProgress.filter(p => p.completed).length;
  };
  
  // Calculate overall progress percentage
  const overallProgress = isEnrollmentLoading || !enrollment 
    ? 0 
    : enrollment.progress;
  
  // Loading state
  if (isCourseLoading || isModulesLoading || isContentLoading || isEnrollmentLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-8 w-1/3" />
          
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="col-span-2">
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="mt-6">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (courseError || !course) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Error Loading Course</h2>
          <p>{courseError instanceof Error ? courseError.message : "An unknown error occurred"}</p>
          <div className="flex space-x-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Link href="/courses">
              <Button variant="secondary">
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-2 mb-8">
        <div className="flex items-center mb-2">
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Courses
            </Button>
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">{course.title}</span>
        </div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant={
            course.difficulty === 'beginner' ? 'default' : 
            course.difficulty === 'intermediate' ? 'secondary' : 
            'destructive'
          }>
            {course.difficulty}
          </Badge>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{course.estimatedHours} hours</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>{course.contentItemsCount} lessons</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>By {course.instructor}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Image */}
          <div 
            className="w-full rounded-lg bg-cover bg-center h-64 mb-8" 
            style={{ 
              backgroundImage: `url(${course.imageUrl || '/placeholder-course.jpg'})`,
              backgroundColor: '#1e293b'
            }}
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="content">Course Content</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              {course.hasCertificate && (
                <TabsTrigger value="certificate">Certificate</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="content" className="space-y-6">
              {modulesError ? (
                <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                  <p>{modulesError instanceof Error ? modulesError.message : "Error loading modules"}</p>
                </div>
              ) : !modules || modules.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No content available</h3>
                  <p className="text-muted-foreground">This course doesn't have any content yet.</p>
                </div>
              ) : (
                <>
                  {/* Enrollment Progress (if enrolled) */}
                  {enrollment && (
                    <Card className="mb-6">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Your Progress</CardTitle>
                        <CardDescription>
                          {getCompletedContentItemsCount()}/{getTotalContentItems()} lessons completed
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Overall Progress</span>
                            <span>{overallProgress}%</span>
                          </div>
                          <Progress value={overallProgress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                
                  {/* Modules Accordion */}
                  <Accordion 
                    type="multiple" 
                    defaultValue={modules.map(m => m.id.toString())} 
                    className="space-y-4"
                  >
                    {modules.map(module => (
                      <AccordionItem 
                        key={module.id} 
                        value={module.id.toString()}
                        className="border rounded-md"
                        id={`module-${module.id}`}
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex flex-col items-start text-left">
                            <h3 className="font-medium">{module.title}</h3>
                            {contentMap && contentMap[module.id] && (
                              <span className="text-sm text-muted-foreground mt-1">
                                {contentMap[module.id].length} lessons
                                {enrollment && (
                                  <> · {contentMap[module.id].filter(item => 
                                    isContentCompleted(item.id)
                                  ).length} completed</>
                                )}
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          {contentError ? (
                            <p className="text-destructive">Failed to load content</p>
                          ) : !contentMap || !contentMap[module.id] ? (
                            <p className="text-muted-foreground">No content items available</p>
                          ) : (
                            <div className="space-y-2">
                              {contentMap[module.id].map(content => (
                                <div 
                                  key={content.id} 
                                  className={`flex items-center justify-between p-3 rounded-md ${
                                    isContentCompleted(content.id) 
                                      ? "bg-primary/5 border border-primary/20" 
                                      : "bg-card border border-border"
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <div className="mr-3">
                                      {content.isLocked && !enrollment ? (
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                      ) : isContentCompleted(content.id) ? (
                                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                          <Check className="h-3 w-3 text-primary-foreground" />
                                        </div>
                                      ) : (
                                        <ContentTypeIcon type={content.type} />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium">{content.title}</div>
                                      <div className="text-sm text-muted-foreground flex items-center mt-0.5">
                                        {content.duration > 0 && (
                                          <>
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span>{content.duration} min</span>
                                          </>
                                        )}
                                        {content.completionPoints > 0 && (
                                          <>
                                            {content.duration > 0 && <span className="mx-2">•</span>}
                                            <Award className="h-3 w-3 mr-1" />
                                            <span>{content.completionPoints} points</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {enrollment ? (
                                    <div className="flex items-center">
                                      {!isContentCompleted(content.id) && getContentProgress(content.id) > 0 && (
                                        <div className="mr-3 text-xs text-muted-foreground">
                                          {getContentProgress(content.id)}%
                                        </div>
                                      )}
                                      <Button 
                                        size="sm" 
                                        variant={isContentCompleted(content.id) ? "secondary" : "default"}
                                      >
                                        {isContentCompleted(content.id) ? "Review" : "Continue"}
                                      </Button>
                                    </div>
                                  ) : content.isLocked ? (
                                    <Badge variant="secondary">Locked</Badge>
                                  ) : (
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      onClick={handleEnroll}
                                    >
                                      Preview
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="overview" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>{course.longDescription || course.description}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Core concepts and fundamentals of {course.title}</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Hands-on practical skills through guided exercises</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Real-world scenarios and best practices</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                    <span>Advanced techniques for production environments</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Course Information</h2>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Instructor</TableCell>
                      <TableCell>{course.instructor}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Duration</TableCell>
                      <TableCell>{course.estimatedHours} hours</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Lessons</TableCell>
                      <TableCell>{course.contentItemsCount} lessons across {modules?.length || 0} modules</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Difficulty</TableCell>
                      <TableCell>
                        <Badge variant={
                          course.difficulty === 'beginner' ? 'default' : 
                          course.difficulty === 'intermediate' ? 'secondary' : 
                          'destructive'
                        }>
                          {course.difficulty}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Certificate</TableCell>
                      <TableCell>
                        {course.hasCertificate ? (
                          <span className="flex items-center">
                            <Award className="h-4 w-4 mr-2 text-primary" />
                            Included
                          </span>
                        ) : (
                          "Not included"
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tags</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {course.tags.map(tag => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Course Materials
                    </CardTitle>
                    <CardDescription>
                      Supplemental resources for this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between p-3 rounded-md border">
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-3 text-primary" />
                          <span>Course Cheat Sheet</span>
                        </div>
                        <Button variant="outline" size="sm">Download</Button>
                      </li>
                      <li className="flex items-center justify-between p-3 rounded-md border">
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-3 text-primary" />
                          <span>Practice Examples</span>
                        </div>
                        <Button variant="outline" size="sm">Download</Button>
                      </li>
                      <li className="flex items-center justify-between p-3 rounded-md border">
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-3 text-primary" />
                          <span>Reference Guide</span>
                        </div>
                        <Button variant="outline" size="sm">Download</Button>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Additional Resources
                    </CardTitle>
                    <CardDescription>
                      External resources to enhance your learning
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center p-3 rounded-md border">
                        <div className="flex-1">
                          <div className="font-medium">Official Documentation</div>
                          <div className="text-sm text-muted-foreground">Comprehensive reference material</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <PanelRight className="h-4 w-4" />
                        </Button>
                      </li>
                      <li className="flex items-center p-3 rounded-md border">
                        <div className="flex-1">
                          <div className="font-medium">Community Forum</div>
                          <div className="text-sm text-muted-foreground">Discuss with other learners</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <PanelRight className="h-4 w-4" />
                        </Button>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {course.hasCertificate && (
              <TabsContent value="certificate" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Course Certificate
                    </CardTitle>
                    <CardDescription>
                      Complete this course to earn a certificate of accomplishment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border border-border rounded-md p-6 bg-muted/30">
                        <div className="flex justify-center">
                          <div className="relative w-3/4">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-md"></div>
                            <div className="p-8 border border-primary/30 rounded-md bg-card">
                              <div className="text-center space-y-4">
                                <div className="text-xl font-bold uppercase tracking-wide">Certificate of Completion</div>
                                <Award className="h-12 w-12 mx-auto text-primary" />
                                <div className="text-lg">For Completing</div>
                                <div className="text-xl font-bold">{course.title}</div>
                                <div className="italic text-muted-foreground mt-4">Awarded upon successful completion</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                          <li>Complete all course modules and lessons</li>
                          <li>Achieve a passing score on all quizzes and assignments</li>
                          <li>Submit the final project (if applicable)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Certificate Benefits</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                          <li>Verifiable proof of your accomplishment</li>
                          <li>Shareable on LinkedIn and other social platforms</li>
                          <li>Demonstrates your expertise in the subject</li>
                        </ul>
                      </div>
                      
                      {enrollment && overallProgress === 100 ? (
                        <Button className="w-full">
                          <Award className="h-4 w-4 mr-2" />
                          View Your Certificate
                        </Button>
                      ) : (
                        <div className="text-center text-muted-foreground p-3 border border-border rounded-md">
                          {enrollment ? (
                            <>
                              <div className="mb-2">Your current progress: {overallProgress}%</div>
                              <Progress value={overallProgress} className="h-2 mb-3" />
                              <div>Complete the course to earn your certificate</div>
                            </>
                          ) : (
                            <div>Enroll in the course to earn a certificate</div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>
                {enrollment ? "You're enrolled in this course" : "Start learning today"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {enrollment && (
                  <>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span>Course Progress</span>
                      <span>{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </>
                )}
                
                <div className="font-medium">This course includes:</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <Video className="h-4 w-4 mr-2" />
                    {getTotalContentItems()} lessons
                  </li>
                  <li className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {course.estimatedHours} hours of content
                  </li>
                  <li className="flex items-center">
                    <File className="h-4 w-4 mr-2" />
                    Downloadable resources
                  </li>
                  {course.hasCertificate && (
                    <li className="flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Completion certificate
                    </li>
                  )}
                  <li className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {course.enrollmentCount.toLocaleString()} students enrolled
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              {enrollment ? (
                <Button 
                  className="w-full"
                  onClick={() => {
                    // Find the first incomplete module and navigate to it
                    const firstModule = modules?.[0];
                    if (firstModule) {
                      // Scroll to the module content
                      document.getElementById(`module-${firstModule.id}`)?.scrollIntoView({ behavior: 'smooth' });
                      // Open the accordion for this module
                      setOpenItems(prev => [...prev, firstModule.id.toString()]);
                    }
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? (
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 rounded-full animate-spin mr-2" />
                      Enrolling...
                    </div>
                  ) : (
                    <>
                      Enroll Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Related Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Courses</CardTitle>
              <CardDescription>
                Expand your knowledge with these related courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mock related courses - in production these would be fetched from the API */}
              <div className="space-y-4">
                {course.tags.slice(0, 3).map((tag, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div 
                      className="h-16 w-16 rounded-md bg-cover bg-center flex-shrink-0" 
                      style={{ 
                        backgroundImage: `url(https://images.unsplash.com/photo-${1651187580459 + index * 10000}-43490279c0fa?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3)`,
                        backgroundColor: '#1e293b' 
                      }}
                    />
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {tag.charAt(0).toUpperCase() + tag.slice(1)} Mastery Course
                      </h4>
                      <div className="flex text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(Math.random() * 20) + 5} hours
                        </span>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                          <Layers className="h-3 w-3 mr-1" />
                          {Math.floor(Math.random() * 30) + 10} lessons
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs mt-1">
                        View Course
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                Browse All Courses
              </Button>
            </CardContent>
          </Card>

          {/* Course Reviews Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Student Reviews</CardTitle>
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className={`w-4 h-4 ${star <= Math.floor(course.totalRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-lg font-bold">{course.totalRating}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ({Math.floor(Math.random() * 500) + 50} reviews)
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              {/* Rating breakdown */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const percentage = rating === 5 ? 75 : 
                                     rating === 4 ? 18 : 
                                     rating === 3 ? 5 : 
                                     rating === 2 ? 1.5 : 0.5;
                  return (
                    <div key={rating} className="flex items-center text-sm">
                      <div className="w-8">{rating} ★</div>
                      <div className="w-full mx-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-10 text-right text-muted-foreground">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-2">
                See All Reviews
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Content type icon component
function ContentTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'video':
      return <Video className="h-5 w-5 text-blue-500" />;
    case 'article':
      return <FileText className="h-5 w-5 text-green-500" />;
    case 'quiz':
      return <FileText className="h-5 w-5 text-yellow-500" />;
    case 'assignment':
      return <FileText className="h-5 w-5 text-purple-500" />;
    case 'resource':
      return <File className="h-5 w-5 text-gray-500" />;
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
}

// Mock data for development/fallback
const mockCourse: Course = {
  id: 1,
  title: "AWS Cloud Fundamentals",
  description: "Introduction to core AWS services and cloud concepts",
  longDescription: "This comprehensive course provides a solid foundation in AWS cloud computing. You'll learn about the core services, security practices, and architectural principles that make AWS the leading cloud platform for businesses of all sizes. By the end of this course, you'll have a deep understanding of key AWS services including EC2, S3, RDS, Lambda, and more. You'll also learn about AWS security best practices, cost management, and how to design scalable and resilient architectures.",
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
  tags: ["AWS", "Cloud Computing", "Fundamentals", "EC2", "S3", "Lambda"],
  hasCertificate: true
};

const mockModules: CourseModule[] = [
  {
    id: 1,
    courseId: 1,
    title: "Introduction to AWS",
    description: "Overview of AWS and cloud computing concepts",
    order: 1
  },
  {
    id: 2,
    courseId: 1,
    title: "Core AWS Services",
    description: "Deep dive into foundational AWS services",
    order: 2
  },
  {
    id: 3,
    courseId: 1,
    title: "AWS Security and Compliance",
    description: "Understanding AWS security best practices",
    order: 3
  },
  {
    id: 4,
    courseId: 1,
    title: "Building Scalable Architectures",
    description: "Design principles for scalable AWS architectures",
    order: 4
  }
];

const mockContentMap: Record<number, ContentItem[]> = {
  1: [
    {
      id: 101,
      moduleId: 1,
      title: "What is Cloud Computing?",
      type: "video",
      duration: 15,
      order: 1,
      isLocked: false,
      completionPoints: 10
    },
    {
      id: 102,
      moduleId: 1,
      title: "AWS Global Infrastructure",
      type: "video",
      duration: 20,
      order: 2,
      isLocked: false,
      completionPoints: 10
    },
    {
      id: 103,
      moduleId: 1,
      title: "Setting Up Your AWS Account",
      type: "article",
      duration: 10,
      order: 3,
      isLocked: false,
      completionPoints: 5
    },
    {
      id: 104,
      moduleId: 1,
      title: "AWS Console Overview",
      type: "video",
      duration: 25,
      order: 4,
      isLocked: false,
      completionPoints: 10
    },
    {
      id: 105,
      moduleId: 1,
      title: "Module 1 Quiz",
      type: "quiz",
      duration: 15,
      order: 5,
      isLocked: false,
      completionPoints: 20
    }
  ],
  2: [
    {
      id: 201,
      moduleId: 2,
      title: "Amazon EC2 Basics",
      type: "video",
      duration: 30,
      order: 1,
      isLocked: false,
      completionPoints: 15
    },
    {
      id: 202,
      moduleId: 2,
      title: "S3 Storage Solutions",
      type: "video",
      duration: 25,
      order: 2,
      isLocked: false,
      completionPoints: 15
    },
    {
      id: 203,
      moduleId: 2,
      title: "RDS and Database Services",
      type: "video",
      duration: 35,
      order: 3,
      isLocked: false,
      completionPoints: 15
    },
    {
      id: 204,
      moduleId: 2,
      title: "Hands-on: EC2 Instance Setup",
      type: "assignment",
      duration: 45,
      order: 4,
      isLocked: true,
      completionPoints: 30
    },
    {
      id: 205,
      moduleId: 2,
      title: "Module 2 Quiz",
      type: "quiz",
      duration: 20,
      order: 5,
      isLocked: true,
      completionPoints: 25
    }
  ],
  3: [
    {
      id: 301,
      moduleId: 3,
      title: "IAM Introduction",
      type: "video",
      duration: 20,
      order: 1,
      isLocked: true,
      completionPoints: 15
    },
    {
      id: 302,
      moduleId: 3,
      title: "Security Groups and NACLs",
      type: "video",
      duration: 25,
      order: 2,
      isLocked: true,
      completionPoints: 15
    },
    {
      id: 303,
      moduleId: 3,
      title: "Encryption and Key Management",
      type: "article",
      duration: 30,
      order: 3,
      isLocked: true,
      completionPoints: 20
    },
    {
      id: 304,
      moduleId: 3,
      title: "Hands-on: Securing Your AWS Resources",
      type: "assignment",
      duration: 60,
      order: 4,
      isLocked: true,
      completionPoints: 35
    }
  ],
  4: [
    {
      id: 401,
      moduleId: 4,
      title: "High Availability Principles",
      type: "video",
      duration: 25,
      order: 1,
      isLocked: true,
      completionPoints: 15
    },
    {
      id: 402,
      moduleId: 4,
      title: "Auto Scaling Groups",
      type: "video",
      duration: 30,
      order: 2,
      isLocked: true,
      completionPoints: 15
    },
    {
      id: 403,
      moduleId: 4,
      title: "Load Balancing in AWS",
      type: "video",
      duration: 25,
      order: 3,
      isLocked: true,
      completionPoints: 15
    },
    {
      id: 404,
      moduleId: 4,
      title: "Final Project: Designing a Scalable Web Application",
      type: "assignment",
      duration: 120,
      order: 4,
      isLocked: true,
      completionPoints: 50
    },
    {
      id: 405,
      moduleId: 4,
      title: "Course Final Exam",
      type: "quiz",
      duration: 60,
      order: 5,
      isLocked: true,
      completionPoints: 100
    }
  ]
};

const mockEnrollment: Enrollment = {
  id: 1,
  userId: 1,
  courseId: 1,
  progress: 35,
  status: "active",
  enrollmentDate: "2023-04-15T00:00:00Z"
};

const mockContentProgress: ContentProgress[] = [
  {
    contentItemId: 101,
    progress: 100,
    completed: true,
    lastAccessedAt: "2023-04-15T12:30:00Z"
  },
  {
    contentItemId: 102,
    progress: 100,
    completed: true,
    lastAccessedAt: "2023-04-16T14:20:00Z"
  },
  {
    contentItemId: 103,
    progress: 100,
    completed: true,
    lastAccessedAt: "2023-04-17T09:15:00Z"
  },
  {
    contentItemId: 104,
    progress: 100,
    completed: true,
    lastAccessedAt: "2023-04-18T16:45:00Z"
  },
  {
    contentItemId: 105,
    progress: 100,
    completed: true,
    lastAccessedAt: "2023-04-19T11:30:00Z"
  },
  {
    contentItemId: 201,
    progress: 100,
    completed: true,
    lastAccessedAt: "2023-04-20T13:10:00Z"
  },
  {
    contentItemId: 202,
    progress: 75,
    completed: false,
    lastAccessedAt: "2023-04-21T10:20:00Z"
  }
];