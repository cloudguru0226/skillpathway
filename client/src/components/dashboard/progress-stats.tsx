import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Award, Clock, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function ProgressStats() {
  // Fetch progress data
  const { data: progress = [], isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/progress"],
  });

  // Fetch activity data
  const { data: activity = [], isLoading: isLoadingActivity } = useQuery({
    queryKey: ["/api/activity?days=7"],
  });

  // Calculate stats
  const calculateStats = () => {
    if (!progress.length && !activity.length) {
      return {
        streak: 0,
        completedTopics: 0,
        hoursThisWeek: 0,
        roadmapsStarted: 0
      };
    }

    // Calculate completed topics
    const completedTopics = progress.reduce((total: number, p: any) => {
      if (p.progress && p.progress.completed) {
        return total + p.progress.completed;
      }
      return total;
    }, 0);

    // Calculate hours this week
    const hoursThisWeek = activity.reduce((total: number, a: any) => {
      return total + (a.duration / 60); // Convert minutes to hours
    }, 0).toFixed(1);

    // Calculate roadmaps started
    const roadmapsStarted = progress.length;

    // TODO: Calculate streak (simplified version)
    const streak = 7; // Placeholder

    return {
      streak,
      completedTopics,
      hoursThisWeek,
      roadmapsStarted
    };
  };

  const stats = calculateStats();
  const isLoading = isLoadingProgress || isLoadingActivity;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Learning Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
            <div className="flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <Flame className="h-5 w-5 text-green-500 mr-1" />
                  <span className="text-2xl font-bold">{stats.streak} days</span>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Completed Topics</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mx-auto" />
            ) : (
              <div className="flex items-center justify-center">
                <Award className="h-5 w-5 text-primary mr-1" />
                <span className="text-2xl font-bold">{stats.completedTopics}</span>
              </div>
            )}
          </div>
          
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Hours This Week</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mx-auto" />
            ) : (
              <div className="flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500 mr-1" />
                <span className="text-2xl font-bold">{stats.hoursThisWeek}</span>
              </div>
            )}
          </div>
          
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Roadmaps Started</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mx-auto" />
            ) : (
              <div className="flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-500 mr-1" />
                <span className="text-2xl font-bold">{stats.roadmapsStarted}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
