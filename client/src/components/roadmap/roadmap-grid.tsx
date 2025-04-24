import { RoadmapCard } from "./roadmap-card";
import { useQuery } from "@tanstack/react-query";
import { Roadmap } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface RoadmapGridProps {
  title: string;
  type?: string;
  limit?: number;
  showViewAll?: boolean;
}

export function RoadmapGrid({ title, type, limit, showViewAll = true }: RoadmapGridProps) {
  // Fetch roadmaps based on type if provided
  const { data: roadmaps = [], isLoading } = useQuery<Roadmap[]>({
    queryKey: ["/api/roadmaps", type],
    queryFn: async () => {
      const url = type 
        ? `/api/roadmaps?type=${type}` 
        : "/api/roadmaps";
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch roadmaps");
      }
      return response.json();
    },
  });

  // Fetch user progress for all roadmaps
  const { data: progressData = [] } = useQuery({
    queryKey: ["/api/progress"],
    enabled: roadmaps.length > 0,
  });

  // Create a mapping of roadmap IDs to progress percentages
  const progressMap = progressData.reduce((acc: Record<number, number>, curr: any) => {
    if (curr.progress && typeof curr.progress === 'object') {
      // Calculate progress percentage from the progress object
      // This is a simplified calculation, adjust based on your actual data structure
      const completed = curr.progress.completed || 0;
      const total = curr.progress.total || 1;
      acc[curr.roadmapId] = Math.round((completed / total) * 100);
    }
    return acc;
  }, {});

  // Limit the number of roadmaps if specified
  const displayRoadmaps = limit ? roadmaps.slice(0, limit) : roadmaps;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showViewAll && (
          <a href="#" className="text-primary text-sm hover:underline">View All</a>
        )}
      </div>
      
      {isLoading ? (
        // Loading skeleton
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${type === 'skill' ? '4' : '3'} gap-6`}>
          {Array(type === 'skill' ? 4 : 3).fill(0).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-[250px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        // Actual roadmap grid
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${type === 'skill' ? '4' : '3'} gap-6`}>
          {displayRoadmaps.map((roadmap) => (
            <RoadmapCard 
              key={roadmap.id} 
              roadmap={roadmap} 
              progress={progressMap[roadmap.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
