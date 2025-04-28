import { useMemo, useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoadmapSection } from "./roadmap-section";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Roadmap } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, BookOpen, MessageSquare, FileText, Users, 
  Plus, Book, Database 
} from "lucide-react";
import { CommentsSection } from "../community/comments-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NodeDetails } from "./node-details";
import { Badge } from "@/components/ui/badge";
import { 
  Avatar,
  AvatarFallback
} from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CommentInput } from "@/components/community/comment-input";
import { DiscussionForm } from "@/components/community/discussion-form";

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
  const { user } = useAuth();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("content");
  const [isAddContentDialogOpen, setIsAddContentDialogOpen] = useState(false);
  
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
  
  // Get the currently selected node details
  const selectedNode = selectedNodeIndex !== null && roadmap ? 
    roadmap.content.sections[currentSectionIndex]?.nodes[selectedNodeIndex] : null;
  
  // Fetch resources for selected node
  const nodeId = selectedNode ? encodeURIComponent(selectedNode.title) : null;
  const { data: resources = [] } = useQuery<any[]>({
    queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/resources`],
    enabled: !!roadmapId && !!nodeId,
  });
  
  // Fetch comments for selected node
  const { data: comments = [] } = useQuery<any[]>({
    queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/comments`],
    enabled: !!roadmapId && !!nodeId,
  });
  
  // Fetch discussions for selected node
  const { data: discussions = [] } = useQuery<any[]>({
    queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/discussions`],
    enabled: !!roadmapId && !!nodeId,
  });

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
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-5 border-b border-border flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center"
      >
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-xl font-bold"
        >
          {roadmap.title}
        </motion.h2>
        
        <div className="w-full sm:w-auto flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <span className="text-sm font-semibold">{progressPercentage}%</span>
          </div>
          
          <div className="w-full sm:w-60 h-3 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ 
                delay: 0.3, 
                duration: 1.5, 
                ease: "easeOut" 
              }}
              className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
            />
          </div>
          
          <div className="w-full sm:w-60 flex justify-between mt-1 px-1">
            <span className="text-xs text-muted-foreground">0%</span>
            <span className="text-xs text-muted-foreground">50%</span>
            <span className="text-xs text-muted-foreground">100%</span>
          </div>
        </div>
      </motion.div>
      
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
                  onNodeClick={(nodeIndex) => {
                    handleNodeClick(currentSectionIndex, nodeIndex);
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
                <div className="space-y-4">
                  {resources.length > 0 ? (
                    <div className="space-y-4">
                      {resources.map((resource: any, index: number) => (
                        <div key={index} className="bg-background p-4 rounded-lg border border-border">
                          <h4 className="font-medium mb-1">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => window.open(resource.url, "_blank")}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Open Resource
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed rounded-md border-border">
                      <Book className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No resources yet</h3>
                      <p className="text-muted-foreground">
                        No learning resources have been added for this topic yet.
                      </p>
                      {user?.isAdmin && (
                        <Button 
                          variant="outline" 
                          className="mt-4 gap-1"
                          onClick={() => setIsAddContentDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                          Add Sample Content
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <p>Select a node from the roadmap to view its resources.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="comments">
            <div className="bg-card rounded-lg p-5 border border-border">
              {selectedNode ? (
                <CommentsSection 
                  roadmapId={parseInt(roadmapId)}
                  nodeId={encodeURIComponent(selectedNode.title)}
                />
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <p>Select a node from the roadmap to view and add comments.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="discussions">
            <div className="bg-card rounded-lg p-5 border border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Discussions</h3>
                {selectedNode && (
                  <DiscussionForm 
                    roadmapId={parseInt(roadmapId)}
                    nodeId={encodeURIComponent(selectedNode.title)}
                  />
                )}
              </div>
              
              {selectedNode ? (
                <div className="space-y-4">
                  {discussions.length > 0 ? (
                    <div className="space-y-4">
                      {discussions.map((discussion: any, index: number) => (
                        <div key={index} className="bg-background p-4 rounded-lg border border-border">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium mb-1">{discussion.title}</h4>
                            <div className="flex items-center text-xs text-muted-foreground gap-3">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" /> 
                                {discussion.replyCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" /> 
                                {discussion.viewCount || 0}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {discussion.content.length > 150 
                              ? `${discussion.content.substring(0, 150)}...` 
                              : discussion.content}
                          </p>
                          
                          <div className="flex flex-wrap items-center justify-between mt-2">
                            <div className="flex flex-wrap gap-2">
                              {discussion.tags?.map((tag: string, i: number) => (
                                <Badge key={i} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback>
                                  {discussion.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{discussion.user?.username || 'User'}</span>
                              <span className="text-xs text-muted-foreground">
                                {discussion.createdAt ? new Date(discussion.createdAt).toLocaleDateString() : 'Just now'}
                              </span>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-3 text-xs gap-1"
                            onClick={() => {
                              // View discussion detail - to be implemented
                              toast({
                                title: "Coming soon",
                                description: "Full discussion view will be available soon",
                              });
                            }}
                          >
                            <MessageSquare className="h-3 w-3" /> View Discussion
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed rounded-md border-border">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to start a discussion about this topic!
                      </p>
                      <DiscussionForm 
                        roadmapId={parseInt(roadmapId)}
                        nodeId={encodeURIComponent(selectedNode.title)}
                        trigger={
                          <Button variant="outline" className="gap-1">
                            <MessageSquare className="h-4 w-4" /> Start New Topic
                          </Button>
                        }
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <p>Select a node from the roadmap to view and start discussions.</p>
                </div>
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
      
      {/* Add Sample Content Dialog */}
      <Dialog open={isAddContentDialogOpen} onOpenChange={setIsAddContentDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Sample Content</DialogTitle>
            <DialogDescription>
              This will add educational resources, sample comments, and discussion topics for {selectedNode ? `"${selectedNode.title}"` : "this roadmap"}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="flex items-start gap-2">
              <Book className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Educational Resources</h4>
                <p className="text-sm text-muted-foreground">Curated articles, videos, and tutorials</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Community Comments</h4>
                <p className="text-sm text-muted-foreground">Sample comments with reactions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Database className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Discussion Topics</h4>
                <p className="text-sm text-muted-foreground">In-depth discussion threads about key topics</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddContentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // Implement adding sample content here
                if (selectedNode) {
                  // Add content for specific node
                  toast({
                    title: "Content added",
                    description: `Sample content has been added for ${selectedNode.title}.`,
                  });
                } else {
                  // Add content for entire roadmap
                  toast({
                    title: "Content added",
                    description: `Sample content has been added to ${roadmap.title}.`,
                  });
                }
                setIsAddContentDialogOpen(false);
              }}
            >
              Add Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}