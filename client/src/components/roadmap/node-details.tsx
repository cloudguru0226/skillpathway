import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, XCircle, Book, Award, Database, MessageSquare, PlusCircle, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface RoadmapNode {
  title: string;
  completed?: boolean;
  inProgress?: boolean;
}

interface NodeDetailsProps {
  node: RoadmapNode;
  sectionTitle: string;
  roadmapId: number;
  roadmapTitle: string;
  nodeId: string;
}

export function NodeDetails({ node, sectionTitle, roadmapId, roadmapTitle, nodeId }: NodeDetailsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAddContentDialogOpen, setIsAddContentDialogOpen] = useState(false);
  
  // Fetch resources for this node
  const { data: resources = [] } = useQuery<any[]>({
    queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/resources`],
    enabled: !!roadmapId && !!nodeId,
  });
  
  // Fetch comments for this node
  const { data: comments = [] } = useQuery<any[]>({
    queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/comments`],
    enabled: !!roadmapId && !!nodeId,
  });
  
  // Fetch discussions for this node
  const { data: discussions = [] } = useQuery<any[]>({
    queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/discussions`],
    enabled: !!roadmapId && !!nodeId,
  });
  
  // Handle node completion
  const toggleCompletionMutation = useMutation({
    mutationFn: async (action: 'complete' | 'incomplete') => {
      return await apiRequest(
        "POST", 
        `/api/roadmaps/${roadmapId}/progress/${nodeId}/${action}`, 
        {}
      );
    },
    onMutate: () => {
      setIsCompleting(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress?roadmapId=${roadmapId}`] });
      
      toast({
        title: node.completed ? "Node marked as incomplete" : "Node completed!",
        description: node.completed 
          ? "Your progress has been updated." 
          : "Great job! You've completed this topic. Keep going!",
      });
      
      setIsCompleting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update progress: ${error.message}`,
        variant: "destructive",
      });
      setIsCompleting(false);
    },
  });
  
  // Award extra XP for completing a node
  const awardExperienceMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(
        "POST", 
        `/api/users/${user?.id}/experience`, 
        {
          amount: 10,
          reason: `Extra effort on ${node.title}`,
          roadmapId,
          nodeId
        }
      );
    },
    onSuccess: (data) => {
      // Check if user leveled up
      if (data.levelUp) {
        toast({
          title: "Level Up!",
          description: "You've gained a level from your studying efforts!",
          variant: "default",
        });
      } else {
        toast({
          title: "Experience Gained",
          description: "You've earned extra XP for your studying efforts!",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to award experience: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleToggleCompletion = () => {
    const action = node.completed ? 'incomplete' : 'complete';
    toggleCompletionMutation.mutate(action);
  };
  
  const handleAwardExperience = () => {
    awardExperienceMutation.mutate();
  };
  
  // Add sample content to the node
  const addSampleContentMutation = useMutation({
    mutationFn: async () => {
      // Add sample resources for this node
      const sampleResources = [
        {
          title: "Getting Started with " + node.title,
          description: "A comprehensive introduction to " + node.title,
          url: "https://example.com/resource1",
          type: "article",
          level: "beginner"
        },
        {
          title: "Advanced " + node.title + " Techniques",
          description: "Take your knowledge of " + node.title + " to the next level",
          url: "https://example.com/resource2",
          type: "tutorial",
          level: "intermediate"
        },
        {
          title: node.title + " in Practice",
          description: "Real-world applications of " + node.title,
          url: "https://example.com/resource3",
          type: "video",
          level: "advanced"
        }
      ];
      
      for (const resource of sampleResources) {
        // Create the resource
        const resourceResponse = await apiRequest("POST", "/api/resources", resource);
        
        if (!resourceResponse.ok) continue;
        
        const resourceData = await resourceResponse.json();
        
        // Link it to the roadmap node
        await apiRequest("POST", `/api/roadmaps/${roadmapId}/nodes/${nodeId}/resources`, {
          resourceId: resourceData.id,
          order: 0
        });
      }
      
      // Add sample comments
      const sampleComments = [
        {
          content: "This topic is really interesting. I'm finding " + node.title + " to be quite useful in my work.",
          roadmapId,
          nodeId
        },
        {
          content: "Does anyone have additional resources for learning " + node.title + " beyond what's listed here?",
          roadmapId,
          nodeId
        }
      ];
      
      for (const comment of sampleComments) {
        await apiRequest("POST", "/api/comments", comment);
      }
      
      // Add sample discussions
      const sampleDiscussions = [
        {
          title: "Best practices for " + node.title,
          content: "I'd like to know what everyone's experience has been with implementing " + node.title + ". What are some best practices you've discovered?",
          roadmapId,
          nodeId,
          tags: ["best-practices", "discussion"]
        },
        {
          title: "Common challenges with " + node.title,
          content: "What are the most common challenges people face when working with " + node.title + "? I'm trying to prepare for my upcoming project.",
          roadmapId,
          nodeId,
          tags: ["challenges", "help"]
        }
      ];
      
      for (const discussion of sampleDiscussions) {
        await apiRequest("POST", "/api/discussions", discussion);
      }
      
      // Return success
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/resources`] });
      queryClient.invalidateQueries({ queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/discussions`] });
      
      toast({
        title: "Content added",
        description: `Sample content has been added for ${node.title}.`,
      });
      
      setIsAddContentDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add sample content: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const handleAddSampleContent = () => {
    addSampleContentMutation.mutate();
  };
  
  const hasContent = resources.length > 0 || comments.length > 0 || discussions.length > 0;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold">{node.title}</h3>
          <p className="text-sm text-muted-foreground">Section: {sectionTitle}</p>
        </div>
        <Badge variant={node.completed ? "default" : node.inProgress ? "outline" : "secondary"}>
          {node.completed ? "Completed" : node.inProgress ? "In Progress" : "Not Started"}
        </Badge>
      </div>

      <div className="border-t border-border pt-4 mt-4">
        <div className="flex flex-col space-y-2">
          <Button 
            variant={node.completed ? "outline" : "default"}
            className="w-full justify-start"
            onClick={handleToggleCompletion}
            disabled={isCompleting}
          >
            {node.completed ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Mark as Incomplete
              </>
            ) : node.inProgress ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Complete
              </>
            ) : (
              <>
                <Circle className="mr-2 h-4 w-4" />
                Start Learning
              </>
            )}
          </Button>
          
          {resources.length > 0 && (
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => document.querySelector('[data-value="resources"]')?.dispatchEvent(new Event('click'))}
            >
              <Book className="mr-2 h-4 w-4" />
              View Resources ({resources.length})
            </Button>
          )}
          
          {comments.length > 0 && (
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => document.querySelector('[data-value="comments"]')?.dispatchEvent(new Event('click'))}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              View Comments ({comments.length})
            </Button>
          )}
          
          {discussions.length > 0 && (
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => document.querySelector('[data-value="discussions"]')?.dispatchEvent(new Event('click'))}
            >
              <Database className="mr-2 h-4 w-4" />
              View Discussions ({discussions.length})
            </Button>
          )}
          
          {node.completed && (
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleAwardExperience}
            >
              <Award className="mr-2 h-4 w-4" />
              Record Extra Studying (+10 XP)
            </Button>
          )}
          
          {user?.isAdmin && !hasContent && (
            <Button
              variant="outline"
              className="w-full justify-start text-primary"
              onClick={() => setIsAddContentDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Sample Content
            </Button>
          )}
        </div>
      </div>
      
      <div className="border-t border-border pt-4 mt-4">
        <p className="text-sm">
          Part of the <span className="font-semibold">{roadmapTitle}</span> roadmap.
        </p>
        
        <div className="mt-2 text-xs text-muted-foreground">
          <p>Complete this topic to earn experience points and track your progress.</p>
        </div>
      </div>
      
      {/* Add Sample Content Dialog */}
      <Dialog open={isAddContentDialogOpen} onOpenChange={setIsAddContentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sample Content</DialogTitle>
            <DialogDescription>
              This will add educational resources, sample comments, and discussion topics for the "{node.title}" node.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-2">
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
            <Button onClick={handleAddSampleContent}>
              Add Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}