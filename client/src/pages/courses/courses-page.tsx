import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Course } from "@shared/schema";
import { Link } from "wouter";
import { Loader2, Search, BookOpen, Tag, Clock, Award } from "lucide-react";
import { useState } from "react";

export default function CoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    onError: (error: Error) => {
      toast({
        title: "Error loading courses",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter courses based on search query, difficulty, and tags
  const filteredCourses = courses?.filter((course) => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === "all" || course.difficulty === difficultyFilter;
    
    const matchesTags = tagFilter.length === 0 || 
      (course.tags && tagFilter.every(tag => course.tags.includes(tag)));
    
    return matchesSearch && matchesDifficulty && matchesTags;
  });

  // Get unique tags from all courses
  const allTags = [...new Set(courses?.flatMap(course => course.tags || []))];

  // User enrollments
  const { data: enrollments } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });

  // Check if user is enrolled in a course
  const isEnrolled = (courseId: number) => {
    return enrollments?.some((enrollment: any) => enrollment.courseId === courseId);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-2">
            Structured learning paths with interactive content, assessments, and certificates.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="sm:ml-auto">
            <Tag className="mr-2 h-4 w-4" />
            Filter by Tags
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={setDifficultyFilter}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Levels</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-0">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full mt-2"></div>
                    </CardHeader>
                    <CardContent className="py-4">
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/50 px-6 py-4">
                      <div className="h-10 bg-muted rounded w-full"></div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                filteredCourses?.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge className="mb-2">{course.difficulty}</Badge>
                        {course.isFeatured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <BookOpen className="mr-1 h-4 w-4" />
                          <span>{course.modulesCount} modules</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>{course.estimatedHours} hours</span>
                        </div>
                        {course.hasCertificate && (
                          <div className="flex items-center">
                            <Award className="mr-1 h-4 w-4" />
                            <span>Certificate</span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="border-t bg-muted/50 px-6 py-4">
                      <Button 
                        asChild 
                        className="w-full"
                        variant={isEnrolled(course.id) ? "secondary" : "default"}
                      >
                        <Link to={`/courses/${course.id}`}>
                          {isEnrolled(course.id) ? "Continue Learning" : "Enroll Now"}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}

              {!isLoading && filteredCourses?.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-xl font-medium">No courses found</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}