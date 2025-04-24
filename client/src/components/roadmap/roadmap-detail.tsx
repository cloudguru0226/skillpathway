import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoadmapSection } from "./roadmap-section";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Roadmap } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Define the structure of the roadmap content
interface RoadmapNode {
  title: string;
  completed?: boolean;
  inProgress?: boolean;
}

interface RoadmapSectionType {
  title: string;
  description?: string;
  nodes: RoadmapNode[];
  completed?: boolean;
  inProgress?: boolean;
}

interface RoadmapContent {
  sections: RoadmapSectionType[];
}

// Extended type for the roadmap with properly typed content
interface RoadmapWithContent {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  estimatedTime: string;
  content: RoadmapContent;
  createdAt: Date;
  updatedAt: Date;
}

interface RoadmapDetailProps {
  roadmapId: string;
}

export function RoadmapDetail({ roadmapId }: RoadmapDetailProps) {
  const { toast } = useToast();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  // Fetch roadmap details
  const { data: roadmap, isLoading: isLoadingRoadmap } = useQuery<RoadmapWithContent>({
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
  const { data: progressArray = [], isLoading: isLoadingProgress } = useQuery<any[]>({
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
    <div className="bg-card rounded-lg w-full overflow-hidden flex flex-col mx-auto">
      <div className="p-5 border-b border-border flex justify-between items-center bg-primary/5">
        <h2 className="text-2xl font-bold text-primary">{roadmap.title}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Progress:</span>
          <div className="w-48 flex items-center gap-2">
            <Progress value={progressPercentage} className="h-2" />
            <span className="text-sm font-semibold">{progressPercentage}%</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 overflow-y-auto flex-grow">
        {/* Related Roadmaps and Header Area - similar to PDF */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Related Roadmaps</h3>
              <ul className="space-y-2">
                {roadmap.title === "Frontend Developer" && (
                  <>
                    <li className="text-primary hover:underline cursor-pointer">Backend Roadmap</li>
                    <li className="text-primary hover:underline cursor-pointer">Full Stack Roadmap</li>
                    <li className="text-primary hover:underline cursor-pointer">React</li>
                  </>
                )}
                {roadmap.title === "Backend Developer" && (
                  <>
                    <li className="text-primary hover:underline cursor-pointer">Frontend Roadmap</li>
                    <li className="text-primary hover:underline cursor-pointer">DevOps Roadmap</li>
                    <li className="text-primary hover:underline cursor-pointer">PostgreSQL</li>
                  </>
                )}
                {roadmap.title === "AWS" && (
                  <>
                    <li className="text-primary hover:underline cursor-pointer">Backend Roadmap</li>
                    <li className="text-primary hover:underline cursor-pointer">DevOps Roadmap</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-yellow-600">Note</h3>
              <p className="text-muted-foreground text-sm">
                This roadmap provides an opinionated list of topics to help you get started. 
                You don't need to learn everything at once. Focus on what's relevant to your goals.
              </p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Introduction</h3>
              <p className="text-muted-foreground">{roadmap.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-semibold mb-1">Difficulty</h4>
                <p className="text-muted-foreground capitalize">{roadmap.difficulty}</p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg">
                <h4 className="font-semibold mb-1">Estimated Time</h4>
                <p className="text-muted-foreground">{roadmap.estimatedTime}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Roadmap Content in PDF-like format */}
        <div className="space-y-6">
          {/* Group sections into steps */}
          {roadmap.content.sections.map((section: any, sectionIndex: number) => (
            <div key={section.title} className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">{section.title}</h3>
                {section.completed ? (
                  <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded text-xs">Completed</span>
                ) : section.inProgress ? (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded text-xs">In Progress</span>
                ) : null}
              </div>
              
              {section.description && (
                <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {section.nodes.map((node: any, nodeIndex: number) => (
                  <div 
                    key={node.title}
                    onClick={() => handleNodeClick(sectionIndex, nodeIndex)}
                    className={`border p-3 rounded-lg cursor-pointer transition-all hover:shadow-md
                      ${node.completed ? 'bg-green-500/10 border-green-500/30' : 
                        node.inProgress ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-card border-border'}`}
                  >
                    <span className={`text-sm font-medium 
                      ${node.completed ? 'text-green-600' : 
                        node.inProgress ? 'text-yellow-600' : 'text-foreground'}`}
                    >
                      {node.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Best practices box at the bottom - similar to PDF */}
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mt-6">
            <h3 className="text-lg font-semibold text-primary mb-2">Best way to learn?</h3>
            <p className="text-muted-foreground">
              Make a simple project and apply the concepts as you learn them. 
              Practical experience is the best way to reinforce your knowledge.
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-5 border-t border-border">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Back to Roadmaps
          </Button>
          <Button
            onClick={() => {}} // This could be a link to start learning resources
            variant="default"
          >
            Start Learning
          </Button>
        </div>
      </div>
    </div>
  );
}
