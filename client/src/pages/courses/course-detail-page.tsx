import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Course, CourseModule, CourseContentItem, CourseEnrollment } from "@shared/schema";
import { useLocation, Link } from "wouter";
import {
  BookOpen,
  ChevronLeft,
  Clock,
  FileText,
  PlayCircle,
  Video,
  Award,
  CheckCircle,
  Lock,
  Loader2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CourseDetailPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const courseId = parseInt(location.split("/").pop() || "0");

  // Get course details
  const { data: course, isLoading: isCourseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
    onError: (error: Error) => {
      toast({
        title: "Error loading course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get course modules
  const { data: modules, isLoading: isModulesLoading } = useQuery<CourseModule[]>({
    queryKey: [`/api/courses/${courseId}/modules`],
    enabled: !!courseId,
    onError: (error: Error) => {
      toast({
        title: "Error loading course modules",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get user enrollment if logged in
  const { data: enrollment, isLoading: isEnrollmentLoading } = useQuery<CourseEnrollment>({
    queryKey: [`/api/courses/${courseId}/enrollment`],
    enabled: !!courseId && !!user,
    onError: (error: Error) => {
      toast({
        title: "Error loading enrollment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Content items for each module
  const { data: contentItemsMap, isLoading: isContentLoading } = useQuery<Record<number, CourseContentItem[]>>({
    queryKey: [`/api/courses/${courseId}/content`],
    enabled: !!courseId && !!modules,
    onError: (error: Error) => {
      toast({
        title: "Error loading course content",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/enroll`, {
        userId: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrolled successfully!",
        description: "You are now enrolled in this course.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/enrollment`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to enroll",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEnroll = () => {
    enrollMutation.mutate();
  };

  const isLoading = isCourseLoading || isModulesLoading || isEnrollmentLoading || isContentLoading;
  const isEnrolled = !!enrollment;
  const isPending = enrollMutation.isPending;

  // Calculate progress
  const progressPercentage = enrollment?.progressPercentage || 0;

  // Check if a content item is completed
  const isContentCompleted = (contentId: number) => {
    return enrollment?.completedContentIds?.includes(contentId) || false;
  };

  // Content type icon mapping
  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5 text-primary" />;
      case "document":
        return <FileText className="h-5 w-5 text-primary" />;
      case "quiz":
        return <FileText className="h-5 w-5 text-primary" />;
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Course not found</h2>
          <p className="text-muted-foreground mt-2">
            The course you're looking for doesn't exist.
          </p>
          <Button asChild className="mt-4">
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          asChild
          className="mb-4 pl-0 hover:pl-2 transition-all"
        >
          <Link to="/courses">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </Button>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {course.title}
              </h1>
              <Badge className="ml-2">{course.difficulty}</Badge>
            </div>
            <p className="text-muted-foreground mt-2">{course.description}</p>
          </div>

          {!isEnrolled ? (
            <Button
              className="mt-4 md:mt-0"
              onClick={handleEnroll}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>Enroll Now</>
              )}
            </Button>
          ) : (
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Progress: {progressPercentage}%
              </div>
              <Button asChild>
                <Link to={`/courses/${courseId}/content/1`}>
                  Continue Learning
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Overview</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: course.longDescription || ""
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {modules?.length || 0} modules • {course.estimatedHours} hours •{" "}
                {course.contentItemsCount} lessons
              </CardDescription>

              {isEnrolled && (
                <Progress value={progressPercentage} className="h-2 mt-2" />
              )}
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {modules?.map((module, index) => (
                  <AccordionItem key={module.id} value={`module-${module.id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-start">
                        <div className="mr-3 text-lg font-medium">
                          {index + 1}.
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">{module.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {contentItemsMap?.[module.id]?.length || 0} lessons •{" "}
                            {module.estimatedHours} hours
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-8 space-y-3 pt-2">
                        {contentItemsMap?.[module.id]?.map((content) => (
                          <div
                            key={content.id}
                            className="flex items-center justify-between border-b border-border pb-3"
                          >
                            <div className="flex items-center gap-3">
                              {getContentIcon(content.contentType)}
                              <div>
                                <div className="font-medium">
                                  {content.title}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {content.contentType} •{" "}
                                  {content.estimatedMinutes} min
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center">
                              {isContentCompleted(content.id) ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : isEnrolled ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-1"
                                  asChild
                                >
                                  <Link
                                    to={`/courses/${courseId}/content/${content.id}`}
                                  >
                                    <PlayCircle className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:ml-1">
                                      Start
                                    </span>
                                  </Link>
                                </Button>
                              ) : (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6 sticky top-8">
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Duration
                  </dt>
                  <dd className="text-sm flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {course.estimatedHours} hours
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Modules
                  </dt>
                  <dd className="text-sm flex items-center gap-1">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    {modules?.length || 0} modules
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Difficulty
                  </dt>
                  <dd className="text-sm">
                    <Badge variant="outline">{course.difficulty}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Certificate
                  </dt>
                  <dd className="text-sm flex items-center gap-1">
                    {course.hasCertificate ? (
                      <>
                        <Award className="h-4 w-4 text-primary" />
                        Certificate upon completion
                      </>
                    ) : (
                      "No certificate"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Tags
                  </dt>
                  <dd className="text-sm flex flex-wrap gap-1 mt-1">
                    {course.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter>
              {!isEnrolled ? (
                <Button
                  className="w-full"
                  onClick={handleEnroll}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>Enroll Now</>
                  )}
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link to={`/courses/${courseId}/content/1`}>
                    Continue Learning
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}