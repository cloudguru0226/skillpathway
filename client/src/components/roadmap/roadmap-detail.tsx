import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoadmapSection } from "./roadmap-section";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Roadmap } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, MessageSquare, FileText, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceList } from "@/components/resources/resource-list";
import { NodeDetails } from "./node-details";
import { CommentSection } from "@/components/community/comment-section";
import { DiscussionForum } from "@/components/community/discussion-forum";

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
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("content");
  
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

  // Record node completion action (will also trigger experience rewards)
  const recordNodeActionMutation = useMutation({
    mutationFn: async ({ nodeId, action }: { nodeId: string, action: 'complete' | 'incomplete' }) => {
      return await apiRequest(
        "POST", 
        `/api/roadmaps/${roadmapId}/progress/${nodeId}/${action}`, 
        {}
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress?roadmapId=${roadmapId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      toast({
        title: "Progress updated",
        description: "Your learning progress has been updated.",
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
    
    // Select the node for detailed view
    setSelectedNodeIndex(nodeIndex);
    
    // Deep clone the roadmap content
    const updatedContent = JSON.parse(JSON.stringify(roadmap.content));
    const node = updatedContent.sections[sectionIndex].nodes[nodeIndex];
    const nodeId = encodeURIComponent(node.title); // Use title as node ID
    
    // Toggle node status
    let action: 'complete' | 'incomplete';
    if (node.completed) {
      node.completed = false;
      node.inProgress = false;
      action = 'incomplete';
    } else if (node.inProgress) {
      node.completed = true;
      node.inProgress = false;
      action = 'complete';
    } else {
      node.inProgress = true;
      action = 'incomplete';
    }
    
    // Record the action for XP rewards and progress tracking
    recordNodeActionMutation.mutate({
      nodeId,
      action: node.completed ? 'complete' : 'incomplete'
    });
    
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
      setSelectedNodeIndex(null);
      window.scrollTo(0, 0);
    }
  };

  // Navigate to previous section
  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setSelectedNodeIndex(null);
      window.scrollTo(0, 0);
    }
  };

  // Get the currently selected node details
  const selectedNode = selectedNodeIndex !== null && roadmap ? 
    roadmap.content.sections[currentSectionIndex]?.nodes[selectedNodeIndex] : null;

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
    <div className="bg-background rounded-lg w-full overflow-hidden flex flex-col mx-auto">
      <div className="p-5 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-bold">{roadmap.title}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Progress:</span>
          <div className="w-48 flex items-center gap-2">
            <Progress value={progressPercentage} className="h-2 bg-muted" />
            <span className="text-sm font-semibold">{progressPercentage}%</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 overflow-y-auto flex-grow">
        <div className="mb-6">
          <p className="text-muted-foreground">{roadmap.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="bg-card p-4 rounded-lg">
            <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Difficulty</h4>
            <p className="text-foreground capitalize">{roadmap.difficulty}</p>
          </div>
          <div className="bg-card p-4 rounded-lg">
            <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Estimated Time</h4>
            <p className="text-foreground">{roadmap.estimatedTime}</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Resources</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Comments</span>
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Discussions</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold mb-2">Current Section: {roadmap.content.sections[currentSectionIndex]?.title}</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <div className="w-40">
                  <Progress value={progressPercentage} className="h-2 bg-muted" />
                </div>
                <span className="text-sm font-semibold">{progressPercentage}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RoadmapSection
                  key={roadmap.content.sections[currentSectionIndex]?.title}
                  title={roadmap.content.sections[currentSectionIndex]?.title}
                  description={roadmap.content.sections[currentSectionIndex]?.description}
                  nodes={roadmap.content.sections[currentSectionIndex]?.nodes}
                  completed={roadmap.content.sections[currentSectionIndex]?.completed}
                  inProgress={roadmap.content.sections[currentSectionIndex]?.inProgress}
                  onNodeClick={(nodeTitle) => {
                    const nodeIndex = roadmap.content.sections[currentSectionIndex]?.nodes.findIndex(
                      (n: any) => n.title === nodeTitle
                    );
                    if (nodeIndex !== -1) {
                      handleNodeClick(currentSectionIndex, nodeIndex);
                    }
                  }}
                  selectedNodeIndex={selectedNodeIndex}
                />
              </div>
              
              {selectedNode && (
                <div className="bg-card rounded-lg p-4 border border-border">
                  <NodeDetails 
                    node={selectedNode} 
                    sectionTitle={roadmap.content.sections[currentSectionIndex]?.title || ''} 
                    roadmapId={parseInt(roadmapId)}
                    roadmapTitle={roadmap.title}
                    nodeId={encodeURIComponent(selectedNode.title)}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="resources">
            <div className="bg-card rounded-lg p-5 border border-border">
              <h3 className="text-lg font-bold mb-4">Learning Resources</h3>
              {selectedNode ? (
                <ResourceList 
                  roadmapId={parseInt(roadmapId)} 
                  nodeId={encodeURIComponent(selectedNode.title)}
                  nodeTitle={selectedNode.title}
                />
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <p>Select a node from the roadmap to view its resources.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="comments">
            <div className="bg-card rounded-lg p-5 border border-border">
              <h3 className="text-lg font-bold mb-4">Comments</h3>
              {selectedNode ? (
                <CommentSection 
                  roadmapId={parseInt(roadmapId)} 
                  nodeId={encodeURIComponent(selectedNode.title)}
                  nodeTitle={selectedNode.title}
                />
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <p>Select a node from the roadmap to view comments.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="discussions">
            <div className="bg-card rounded-lg p-5 border border-border">
              <h3 className="text-lg font-bold mb-4">Discussions</h3>
              {selectedNode ? (
                <DiscussionForum 
                  roadmapId={parseInt(roadmapId)} 
                  nodeId={encodeURIComponent(selectedNode.title)}
                  nodeTitle={selectedNode.title}
                />
              ) : (
                <DiscussionForum 
                  roadmapId={parseInt(roadmapId)}
                  roadmapTitle={roadmap.title} 
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="p-5 border-t border-border">
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="bg-secondary text-secondary-foreground"
          >
            Back to Roadmaps
          </Button>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={handlePrevSection}
              disabled={currentSectionIndex === 0}
              className="bg-secondary text-secondary-foreground"
            >
              Previous Section
            </Button>
            <Button
              onClick={handleNextSection}
              disabled={currentSectionIndex === roadmap.content.sections.length - 1}
              className="bg-primary text-primary-foreground"
            >
              Next Section
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
