import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  BookOpen, 
  MessageSquare, 
  ListTodo,
  ChevronDown,
  XCircle,
  Award,
  ExternalLink
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Roadmap } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceList } from "@/components/resources/resource-list";
import { CommentSection } from "@/components/community/comment-section";
import { DiscussionForum } from "@/components/community/discussion-forum";

interface NodeDetailsProps {
  roadmap: Roadmap;
  nodeId: string;
  nodeName: string;
  nodeDescription: string;
  userId: number;
  isAdmin: boolean;
  isCompleted: boolean;
  onClose: () => void;
}

export function NodeDetails({
  roadmap,
  nodeId,
  nodeName,
  nodeDescription,
  userId,
  isAdmin,
  isCompleted,
  onClose,
}: NodeDetailsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  
  // Toggle node completion mutation
  const toggleCompletionMutation = useMutation({
    mutationFn: async () => {
      const action = isCompleted ? "incomplete" : "complete";
      const res = await apiRequest(
        "POST",
        `/api/roadmaps/${roadmap.id}/progress/${nodeId}/${action}`,
        { userId }
      );
      return res.json();
    },
    onSuccess: () => {
      // Invalidate the roadmap progress query
      queryClient.invalidateQueries({
        queryKey: ["/api/roadmaps", roadmap.id, "progress"],
      });
      
      // Show a toast
      toast({
        title: isCompleted ? "Marked as incomplete" : "Marked as complete",
        description: isCompleted 
          ? "You can always mark it as complete once you've finished it."
          : "Great job! You've completed this step.",
      });
      
      // Award experience points if completing a node
      if (!isCompleted) {
        awardExperienceMutation.mutate();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Award experience mutation
  const awardExperienceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/users/${userId}/experience`,
        {
          amount: 10,
          reason: `Completed ${nodeName} in ${roadmap.title}`,
          roadmapId: roadmap.id,
          nodeId
        }
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (data.levelUp) {
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached level ${data.currentLevel}!`,
          variant: "default",
        });
      }
      
      queryClient.invalidateQueries({
        queryKey: ["/api/users", userId, "experience"],
      });
    },
  });
  
  const handleToggleCompletion = () => {
    toggleCompletionMutation.mutate();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">{nodeName}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion
              </TabsTrigger>
              <TabsTrigger
                value="forum"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
              >
                <ListTodo className="h-4 w-4 mr-2" />
                Q&A
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            <TabsContent value="details" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {nodeDescription || "No description provided for this item."}
                  </p>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button
                    variant={isCompleted ? "outline" : "default"}
                    className="gap-2"
                    onClick={handleToggleCompletion}
                    disabled={toggleCompletionMutation.isPending}
                  >
                    {isCompleted ? (
                      <>
                        <XCircle className="h-4 w-4" />
                        Mark as Incomplete
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                </div>
                
                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm">
                        You've completed this item! Continue exploring other topics or check out the resources.
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="mt-0">
              <ResourceList
                roadmapId={roadmap.id}
                nodeId={nodeId}
                userId={userId}
                isAdmin={isAdmin}
              />
            </TabsContent>
            
            <TabsContent value="comments" className="mt-0">
              <CommentSection
                roadmapId={roadmap.id}
                nodeId={nodeId}
                userId={userId}
                isAdmin={isAdmin}
              />
            </TabsContent>
            
            <TabsContent value="forum" className="mt-0">
              <DiscussionForum
                roadmapId={roadmap.id}
                nodeId={nodeId}
                userId={userId}
                isAdmin={isAdmin}
              />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}