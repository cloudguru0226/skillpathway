import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, XCircle, Book, Award } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Fetch resources for this node
  const { data: resources = [] } = useQuery<any[]>({
    queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/resources`],
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
        `/api/users/current/experience`, 
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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold">{node.title}</h3>
          <p className="text-sm text-muted-foreground">Section: {sectionTitle}</p>
        </div>
        <Badge variant={node.completed ? "success" : node.inProgress ? "warning" : "secondary"}>
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
    </div>
  );
}