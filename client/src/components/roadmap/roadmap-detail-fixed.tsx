import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, BookOpen, Check, ChevronLeft, ChevronRight, 
  MessageSquare, Users, Clock, Plus 
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RoadmapSection } from './roadmap-section';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { NodeDetails } from './node-details';

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
  const [activeTab, setActiveTab] = useState('content');
  
  // Fetch roadmap data
  const { data: roadmap, isLoading, error } = useQuery<RoadmapWithContent>({
    queryKey: [`/api/roadmaps/${roadmapId}`],
    enabled: !!roadmapId,
  });
  
  // Fetch user's progress for this roadmap
  const { data: progressArray = [] } = useQuery<any[]>({
    queryKey: [`/api/progress?roadmapId=${roadmapId}`],
    enabled: !!roadmapId,
  });
  
  // Get the progress data for this roadmap
  const progressData = React.useMemo(() => {
    if (!progressArray.length) return null;
    return progressArray[0];
  }, [progressArray]);
  
  // Calculate overall progress
  const totalNodes = React.useMemo(() => {
    if (!roadmap || !roadmap.content || !roadmap.content.sections) return 0;
    return roadmap.content.sections.reduce((acc, section) => acc + (section.nodes?.length || 0), 0);
  }, [roadmap]);
  
  const completedNodes = React.useMemo(() => {
    if (!roadmap || !roadmap.content || !roadmap.content.sections) return 0;
    
    return roadmap.content.sections.reduce((acc, section) => {
      const sectionCompletedNodes = section.nodes?.filter(node => node.completed)?.length || 0;
      return acc + sectionCompletedNodes;
    }, 0);
  }, [roadmap]);
  
  const progressPercentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  
  // Record node action mutation
  const recordNodeActionMutation = useMutation({
    mutationFn: async ({ nodeId, action }: { nodeId: string, action: 'complete' | 'incomplete' }) => {
      const response = await fetch(`/api/roadmaps/${roadmapId}/progress/${nodeId}/${action}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update progress: ${response.statusText}`);
      }
      return await response.json();
    },
    onSuccess: () => {
      // Refresh progress data
      queryClient.invalidateQueries({ queryKey: [`/api/progress?roadmapId=${roadmapId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/progress`] });
      
      // Record XP gain and show toast
      toast({
        title: "Progress updated!",
        description: "Your learning journey has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle node click
  const handleNodeClick = (sectionIndex: number, nodeIndex: number) => {
    if (!roadmap || !roadmap.content) return;
    
    console.log("Node clicked:", nodeIndex);
    setSelectedNodeIndex(nodeIndex);
    
    // Get node info
    const node = roadmap.content.sections[sectionIndex].nodes[nodeIndex];
    const nodeId = encodeURIComponent(node.title);
    
    // Update node status
    let action: 'complete' | 'incomplete' = 'incomplete';
    
    if (node.completed) {
      action = 'incomplete';
    } else if (node.inProgress) {
      action = 'complete';
    } else {
      action = 'incomplete';
    }
    
    // Update progress in API
    recordNodeActionMutation.mutate({
      nodeId,
      action
    });
    
    // Record progress
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        roadmapId: parseInt(roadmapId),
        progress: {
          sections: roadmap.content.sections.map((section, idx) => {
            if (idx === sectionIndex) {
              return {
                ...section,
                nodes: section.nodes.map((n, nIdx) => {
                  if (nIdx === nodeIndex) {
                    if (n.completed) {
                      return { ...n, completed: false, inProgress: true };
                    } else if (n.inProgress) {
                      return { ...n, completed: true, inProgress: false };
                    } else {
                      return { ...n, inProgress: true };
                    }
                  }
                  return n;
                })
              };
            }
            return section;
          }),
          completed: completedNodes + (action === 'complete' ? 1 : -1),
          total: totalNodes
        }
      })
    });
  };
  
  // Navigation
  const handleNextSection = () => {
    if (!roadmap || !roadmap.content) return;
    if (currentSectionIndex < roadmap.content.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setSelectedNodeIndex(null);
    }
  };
  
  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setSelectedNodeIndex(null);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Error state
  if (error || !roadmap) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-xl font-bold mb-2">Unable to load roadmap</h3>
        <p className="text-muted-foreground mb-4">We encountered an error while loading this roadmap.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }
  
  // Get selected node
  const selectedNode = selectedNodeIndex !== null && roadmap.content.sections[currentSectionIndex]?.nodes 
    ? roadmap.content.sections[currentSectionIndex].nodes[selectedNodeIndex]
    : null;
  
  return (
    <div className="container py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{roadmap.title}</h1>
            <p className="text-muted-foreground">{roadmap.description}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="px-2 py-1">
            {roadmap.type}
          </Badge>
          <Badge variant="outline" className="px-2 py-1">
            {roadmap.difficulty}
          </Badge>
          <Badge variant="outline" className="px-2 py-1">
            {roadmap.estimatedTime}
          </Badge>
        </div>
      </div>
      
      {/* Content Tabs */}
      <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Content</span>
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
        
        {/* Content Tab */}
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
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Roadmap Section */}
            <div className="lg:col-span-2">
              {roadmap.content.sections[currentSectionIndex] && (
                <RoadmapSection
                  key={roadmap.content.sections[currentSectionIndex].title}
                  title={roadmap.content.sections[currentSectionIndex].title}
                  description={roadmap.content.sections[currentSectionIndex].description}
                  nodes={roadmap.content.sections[currentSectionIndex].nodes || []}
                  onNodeClick={(nodeIndex) => handleNodeClick(currentSectionIndex, nodeIndex)}
                  selectedNodeIndex={selectedNodeIndex}
                />
              )}
            </div>
            
            {/* Right Side - Node Details or Legend */}
            <div className="bg-card rounded-lg p-4 border border-border">
              {selectedNode ? (
                <NodeDetails 
                  node={selectedNode} 
                  sectionTitle={roadmap.content.sections[currentSectionIndex]?.title || ''} 
                  roadmapId={parseInt(roadmapId)}
                  roadmapTitle={roadmap.title}
                  nodeId={encodeURIComponent(selectedNode.title)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <h3 className="text-xl font-bold mb-4">Start Your Learning Journey</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    Click on any topic in the roadmap to view more details, track your progress, and access learning resources.
                  </p>
                  <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                    <div className="bg-background p-3 rounded-lg border border-border">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                        <span className="text-xs font-medium">1</span>
                      </div>
                      <p className="text-xs text-center">Not Started</p>
                    </div>
                    <div className="bg-background p-3 rounded-lg border border-blue-500">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-2">
                        <Clock className="h-3.5 w-3.5 text-white" />
                      </div>
                      <p className="text-xs text-center">In Progress</p>
                    </div>
                    <div className="bg-background p-3 rounded-lg border border-primary">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center mx-auto mb-2">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                      <p className="text-xs text-center">Completed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevSection}
              disabled={currentSectionIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Section</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleNextSection}
              disabled={!roadmap.content || !roadmap.content.sections || currentSectionIndex >= roadmap.content.sections.length - 1}
              className="gap-2"
            >
              <span>Next Section</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-xl font-bold mb-4">Comments</h3>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Share your thoughts, questions, or feedback about this roadmap.
              </p>
              
              {/* Comment Form */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3">Add a Comment</h4>
                <textarea 
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[100px]" 
                  placeholder="Type your comment here..."
                />
                <div className="flex justify-end mt-3">
                  <Button>Submit</Button>
                </div>
              </div>
              
              {/* Sample Comments */}
              <div className="space-y-4 mt-6">
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-4">
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-xl font-bold mb-4">Discussions</h3>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Join discussions about topics, concepts, and challenges related to this roadmap.
              </p>
              
              {/* Discussion List */}
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm text-muted-foreground">No discussions started yet. Create a new discussion topic!</p>
                
                <Button variant="outline" className="mt-4 w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Start a Discussion
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}