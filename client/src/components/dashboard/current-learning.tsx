import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoadmapNode } from "@/components/roadmap/roadmap-node";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function CurrentLearning() {
  // Get user progress data
  const { data: progressData = [], isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/progress"],
  });

  // Find the most recently accessed roadmap
  const getMostRecentRoadmap = () => {
    if (!progressData.length) return null;
    
    // Sort by lastAccessedAt in descending order
    const sortedProgress = [...progressData].sort((a, b) => 
      new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    );
    
    return sortedProgress[0];
  };

  const recentProgress = getMostRecentRoadmap();

  // Fetch the roadmap details
  const { data: roadmap, isLoading: isLoadingRoadmap } = useQuery({
    queryKey: [`/api/roadmaps/${recentProgress?.roadmapId}`],
    enabled: !!recentProgress,
  });

  const isLoading = isLoadingProgress || (!!recentProgress && isLoadingRoadmap);

  // Calculate overall progress percentage
  const calculateProgress = () => {
    if (!recentProgress || !recentProgress.progress) return 0;
    
    // This is a simplified calculation, adjust based on your actual data structure
    if (typeof recentProgress.progress === 'object') {
      const completed = recentProgress.progress.completed || 0;
      const total = recentProgress.progress.total || 1;
      return Math.round((completed / total) * 100);
    }
    
    return 0;
  };

  // Find current section (the one that's in progress)
  const getCurrentSection = () => {
    if (!roadmap || !roadmap.content) return null;
    
    const sections = roadmap.content.sections;
    const inProgressSection = sections.find((section: any) => 
      section.inProgress && !section.completed
    );
    
    return inProgressSection || sections[0]; // Fallback to first section
  };

  const progressPercentage = calculateProgress();
  const currentSection = getCurrentSection();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-16 w-full mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recentProgress || !roadmap) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            You haven't started any roadmaps yet. Browse the available roadmaps to begin your learning journey.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div>
            <CardTitle>{roadmap.title}</CardTitle>
            <p className="text-muted-foreground text-sm">
              Last active: {new Date(recentProgress.lastAccessedAt).toLocaleString()}
            </p>
          </div>
          <Link href={`/roadmap/${roadmap.id}`}>
            <a className="text-primary text-sm hover:underline">View Roadmap</a>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="text-xs text-muted-foreground flex justify-between mb-1">
            <span>Overall Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {currentSection && (
          <>
            <h4 className="font-medium text-md mb-3">
              Current Section: {currentSection.title}
            </h4>
            
            {/* Current nodes in progress */}
            <div className="space-y-3">
              {currentSection.nodes.slice(0, 3).map((node: any) => (
                <RoadmapNode
                  key={node.title}
                  title={node.title}
                  completed={node.completed}
                  inProgress={node.inProgress}
                />
              ))}
              
              {currentSection.nodes.length > 3 && (
                <Link href={`/roadmap/${roadmap.id}`}>
                  <a className="text-primary text-sm hover:underline block text-center mt-2">
                    View all {currentSection.nodes.length} items in this section
                  </a>
                </Link>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
