import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, BookOpen, Check, ChevronLeft, ChevronRight, 
  MessageSquare, Users, Clock, Plus 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RoadmapDetailPageProps {
  params: {
    id: string;
  };
}

// Node component for each topic in a section
const RoadmapNode = ({ node, index, isSelected, onClick }) => {
  const getStatusClass = () => {
    if (node.completed) return "bg-primary/10 border-primary";
    if (node.inProgress) return "bg-blue-500/10 border-blue-500";
    return "bg-background border-border hover:bg-muted";
  };
  
  const getIconClass = () => {
    if (node.completed) return "bg-primary text-primary-foreground";
    if (node.inProgress) return "bg-blue-500 text-white";
    return "bg-muted text-muted-foreground";
  };
  
  const getStatusText = () => {
    if (node.completed) return "Completed";
    if (node.inProgress) return "In Progress";
    return "Not Started";
  };
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3 rounded-md border flex items-center gap-3 transition-all ${getStatusClass()} ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${getIconClass()}`}>
        {node.completed ? (
          <Check className="h-3.5 w-3.5" />
        ) : node.inProgress ? (
          <Clock className="h-3.5 w-3.5" />
        ) : (
          <span className="text-xs font-medium">{index + 1}</span>
        )}
      </div>
      <div className="flex flex-col">
        <span className={`font-medium text-sm ${node.completed ? 'text-primary' : node.inProgress ? 'text-blue-500' : ''}`}>
          {node.title}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">
          {getStatusText()}
        </span>
      </div>
    </button>
  );
};

// Section component that lists nodes
const RoadmapSection = ({ section, selectedNodeIndex, onNodeClick }) => {
  // Calculate progress
  const totalNodes = section.nodes.length;
  const completedNodes = section.nodes.filter(node => node.completed).length;
  const progressPercentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  
  return (
    <div className="bg-card rounded-lg p-5 border border-border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
        
        {section.description && (
          <p className="text-muted-foreground text-sm">{section.description}</p>
        )}
        
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
            <div 
              style={{ width: `${progressPercentage}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <span className="text-sm font-medium">{progressPercentage}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {section.nodes.map((node, index) => (
          <div key={index} className="w-full">
            <RoadmapNode 
              node={node}
              index={index}
              isSelected={selectedNodeIndex === index}
              onClick={() => onNodeClick(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Detail panel for selected node
const NodeDetail = ({ node, sectionTitle, roadmapId, roadmapTitle }) => {
  const nodeId = encodeURIComponent(node.title);
  
  // Fetch resources
  const { data: resources = [], isLoading } = useQuery({
    queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/resources`],
    enabled: !!nodeId,
  });
  
  return (
    <div className="space-y-4">
      <div>
        <Badge variant={node.completed ? "default" : node.inProgress ? "secondary" : "outline"}>
          {node.completed ? "Completed" : node.inProgress ? "In Progress" : "Not Started"}
        </Badge>
        <h3 className="text-lg font-bold mt-2">{node.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          From section: {sectionTitle}
        </p>
      </div>
      
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Learning Resources
        </h4>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : resources.length > 0 ? (
          <div className="space-y-3">
            {resources.map((resource) => (
              <div 
                key={resource.id} 
                className="bg-card p-3 rounded-lg border border-border"
              >
                <div className="flex justify-between">
                  <div>
                    <h5 className="font-medium text-sm">{resource.title}</h5>
                    {resource.description && (
                      <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    asChild
                  >
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">No learning resources available for this topic yet.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              asChild
            >
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(`${roadmapTitle} ${node.title} tutorial`)}`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                Find resources online
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RoadmapDetailPage({ params }: RoadmapDetailPageProps) {
  const { id } = params;
  const { toast } = useToast();
  const [sectionIndex, setSectionIndex] = useState(0);
  const [nodeIndex, setNodeIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  
  // Fetch roadmap details
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
  
  // Fetch progress data
  const { data: progressArray = [] } = useQuery({
    queryKey: [`/api/progress?roadmapId=${id}`],
    enabled: !!id,
  });
  
  // Update node status mutation
  const updateNodeStatusMutation = useMutation({
    mutationFn: async ({ nodeId, action }) => {
      const response = await fetch(`/api/roadmaps/${id}/progress/${nodeId}/${action}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress?roadmapId=${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/progress`] });
      
      toast({
        title: "Progress updated",
        description: "Your learning progress has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle node click
  const handleNodeClick = (index) => {
    setNodeIndex(index);
    
    if (!roadmap || !roadmap.content) return;
    
    const section = roadmap.content.sections[sectionIndex];
    const node = section.nodes[index];
    const nodeId = encodeURIComponent(node.title);
    
    // Update node status based on current state
    let action = 'incomplete';
    
    if (node.completed) {
      action = 'incomplete';
    } else if (node.inProgress) {
      action = 'complete';
    } else {
      action = 'incomplete';
    }
    
    // Call API to update status
    updateNodeStatusMutation.mutate({ nodeId, action });
    
    // Update progress via POST request
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        roadmapId: parseInt(id),
        progress: {
          sections: roadmap.content.sections.map((s, sIdx) => {
            if (sIdx === sectionIndex) {
              return {
                ...s,
                nodes: s.nodes.map((n, nIdx) => {
                  if (nIdx === index) {
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
            return s;
          })
        }
      })
    });
  };
  
  // Handle navigation
  const nextSection = () => {
    if (!roadmap || !roadmap.content) return;
    if (sectionIndex < roadmap.content.sections.length - 1) {
      setSectionIndex(sectionIndex + 1);
      setNodeIndex(null);
    }
  };
  
  const prevSection = () => {
    if (sectionIndex > 0) {
      setSectionIndex(sectionIndex - 1);
      setNodeIndex(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-[600px] w-full max-w-4xl mx-auto rounded-lg" />
          </div>
        </main>
      </div>
    );
  }
  
  if (!roadmap || !roadmap.content) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 text-center">
          <h2 className="text-xl font-bold mb-4">Roadmap not found or error loading data</h2>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </main>
      </div>
    );
  }
  
  // Calculate overall progress
  const totalNodes = roadmap.content.sections.reduce(
    (total, section) => total + section.nodes.length, 0
  );
  
  const completedNodes = roadmap.content.sections.reduce(
    (total, section) => total + section.nodes.filter(node => node.completed).length, 0
  );
  
  const progressPercentage = totalNodes > 0 
    ? Math.round((completedNodes / totalNodes) * 100) 
    : 0;
  
  // Get current section and selected node
  const currentSection = roadmap.content.sections[sectionIndex];
  const selectedNode = nodeIndex !== null ? currentSection.nodes[nodeIndex] : null;
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="container py-4 max-w-7xl">
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
              <Badge variant="outline" className="px-2 py-1">{roadmap.type}</Badge>
              <Badge variant="outline" className="px-2 py-1">{roadmap.difficulty}</Badge>
              <Badge variant="outline" className="px-2 py-1">{roadmap.estimatedTime}</Badge>
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
                <h3 className="text-lg font-bold mb-2">Current Section: {currentSection.title}</h3>
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
                  <RoadmapSection 
                    section={currentSection}
                    selectedNodeIndex={nodeIndex}
                    onNodeClick={handleNodeClick}
                  />
                </div>
                
                {/* Right Side - Node Details or Legend */}
                <div className="bg-card rounded-lg p-4 border border-border">
                  {selectedNode ? (
                    <NodeDetail 
                      node={selectedNode}
                      sectionTitle={currentSection.title}
                      roadmapId={parseInt(id)}
                      roadmapTitle={roadmap.title}
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
                  onClick={prevSection}
                  disabled={sectionIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous Section</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={nextSection}
                  disabled={!roadmap.content || !roadmap.content.sections || sectionIndex >= roadmap.content.sections.length - 1}
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
      </main>
    </div>
  );
}