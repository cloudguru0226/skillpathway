import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoadmapSection } from "./roadmap-section";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Roadmap } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RoadmapDetailProps {
  roadmapId: string;
}

export function RoadmapDetail({ roadmapId }: RoadmapDetailProps) {
  const { toast } = useToast();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  // Fetch roadmap details
  const { data: roadmap, isLoading: isLoadingRoadmap } = useQuery<Roadmap>({
    queryKey: [`/api/roadmaps/${roadmapId}`],
    queryFn: async () => {
      const response = await fetch(`/api/roadmaps/${roadmapId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch roadmap details");
      }
      return response.json();
    },
  });

  // Fetch user progress for this roadmap
  const { data: progressArray = [], isLoading: isLoadingProgress } = useQuery({
    queryKey: [`/api/progress?roadmapId=${roadmapId}`],
    enabled: !!roadmapId,
  });

  // Get the progress data for this specific roadmap
  const progress = useMemo(() => {
    if (!progressArray.length) return null;
    return progressArray[0];
  }, [progressArray]);

  const isLoading = isLoadingRoadmap || isLoadingProgress;

  // Calculate overall progress percentage
  const calculateProgress = () => {
    if (!roadmap || !progress) return 0;
    
    // This is a simplified calculation, adjust based on your actual data structure
    if (progress.progress && typeof progress.progress === 'object') {
      const completed = progress.progress.completed || 0;
      const total = progress.progress.total || 1;
      return Math.round((completed / total) * 100);
    }
    
    return 0;
  };

  const progressPercentage = calculateProgress();

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (updatedProgress: any) => {
      await apiRequest("POST", "/api/progress", {
        roadmapId: parseInt(roadmapId),
        progress: updatedProgress
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress?roadmapId=${roadmapId}`] });
      toast({
        title: "Progress updated",
        description: "Your learning progress has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update progress: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle node click to toggle completion status
  const handleNodeClick = (sectionIndex: number, nodeIndex: number) => {
    if (!roadmap || !roadmap.content) return;
    
    // Deep clone the roadmap content
    const updatedContent = JSON.parse(JSON.stringify(roadmap.content));
    const node = updatedContent.sections[sectionIndex].nodes[nodeIndex];
    
    // Toggle node status
    if (node.completed) {
      node.completed = false;
      node.inProgress = false;
    } else if (node.inProgress) {
      node.completed = true;
      node.inProgress = false;
    } else {
      node.inProgress = true;
    }
    
    // Update section status
    const section = updatedContent.sections[sectionIndex];
    const allNodesCompleted = section.nodes.every((n: any) => n.completed);
    const anyNodeInProgress = section.nodes.some((n: any) => n.inProgress);
    
    section.completed = allNodesCompleted;
    section.inProgress = !allNodesCompleted && anyNodeInProgress;
    
    // Calculate completed count for progress tracking
    const totalNodes = updatedContent.sections.reduce(
      (count: number, section: any) => count + section.nodes.length, 
      0
    );
    
    const completedNodes = updatedContent.sections.reduce(
      (count: number, section: any) => 
        count + section.nodes.filter((n: any) => n.completed).length, 
      0
    );
    
    // Update progress
    updateProgressMutation.mutate({
      content: updatedContent,
      completed: completedNodes,
      total: totalNodes
    });
  };

  // Navigate to next section
  const handleNextSection = () => {
    if (!roadmap || !roadmap.content) return;
    if (currentSectionIndex < roadmap.content.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  // Navigate to previous section
  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!roadmap || !roadmap.content) {
    return (
      <div className="p-5 text-center">
        <p>Roadmap content not available.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg max-w-4xl w-full overflow-hidden flex flex-col mx-auto">
      <div className="p-5 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-bold">{roadmap.title}</h2>
      </div>
      
      <div className="p-5 overflow-y-auto flex-grow">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">About this Roadmap</h3>
          <p className="text-muted-foreground">{roadmap.description}</p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Your Progress</h3>
            <span className="text-sm text-muted-foreground">{progressPercentage}% Complete</span>
          </div>
          
          <Progress value={progressPercentage} className="h-2 mb-4" />
        </div>
        
        {/* Roadmap Content */}
        <div className="space-y-4">
          {roadmap.content.sections.map((section: any, sectionIndex: number) => (
            sectionIndex === currentSectionIndex && (
              <RoadmapSection
                key={section.title}
                title={section.title}
                description={section.description}
                nodes={section.nodes}
                completed={section.completed}
                inProgress={section.inProgress}
                onNodeClick={(nodeTitle) => {
                  const nodeIndex = section.nodes.findIndex((n: any) => n.title === nodeTitle);
                  if (nodeIndex !== -1) {
                    handleNodeClick(sectionIndex, nodeIndex);
                  }
                }}
              />
            )
          ))}
        </div>
      </div>
      
      <div className="p-5 border-t border-border">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevSection}
            disabled={currentSectionIndex === 0}
          >
            Previous Section
          </Button>
          <Button
            onClick={handleNextSection}
            disabled={currentSectionIndex === roadmap.content.sections.length - 1}
          >
            Next Section
          </Button>
        </div>
      </div>
    </div>
  );
}
