import { Header } from "@/components/layout/header";
import { RoadmapDetail } from "@/components/roadmap/roadmap-detail";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface RoadmapDetailPageProps {
  params: {
    id: string;
  };
}

export default function RoadmapDetailPage({ params }: RoadmapDetailPageProps) {
  const { id } = params;
  
  // Fetch roadmap details for title
  const { data: roadmap, isLoading } = useQuery({
    queryKey: [`/api/roadmaps/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/roadmaps/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch roadmap details");
      }
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-[600px] w-full max-w-4xl mx-auto rounded-lg" />
          </div>
        ) : (
          <RoadmapDetail roadmapId={id} />
        )}
      </main>
    </div>
  );
}
