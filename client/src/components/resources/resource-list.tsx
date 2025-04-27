import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlusCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ResourceItem } from "./resource-item";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ResourceListProps {
  roadmapId: number;
  nodeId: string;
  userId: number;
  isAdmin: boolean;
}

export function ResourceList({ roadmapId, nodeId, userId, isAdmin }: ResourceListProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "article",
    url: "",
    thumbnailUrl: "",
  });

  // Fetch resources for this node
  const {
    data: resources = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/roadmaps", roadmapId, "nodes", nodeId, "resources"],
    queryFn: () => 
      fetch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}/resources`).then((res) => 
        res.json()
      ),
    enabled: !!roadmapId && !!nodeId,
  });

  // Add resource mutation
  const addResourceMutation = useMutation({
    mutationFn: async (resourceData: any) => {
      // First create the resource
      const resourceRes = await apiRequest("POST", "/api/resources", resourceData);
      const resource = await resourceRes.json();
      
      // Then link it to the roadmap node
      const linkRes = await apiRequest("POST", `/api/roadmaps/${roadmapId}/nodes/${nodeId}/resources`, {
        resourceId: resource.id,
        order: resources.length,
      });
      
      return linkRes.json();
    },
    onSuccess: () => {
      // Invalidate the resource query to refetch
      queryClient.invalidateQueries({
        queryKey: ["/api/roadmaps", roadmapId, "nodes", nodeId, "resources"],
      });
      setIsAddDialogOpen(false);
      
      // Reset form
      setNewResource({
        title: "",
        description: "",
        type: "article",
        url: "",
        thumbnailUrl: "",
      });
      
      toast({
        title: "Resource added",
        description: "The resource has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    addResourceMutation.mutate(newResource);
  };

  if (isLoading) {
    return (
      <div className="py-4 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Failed to load resources. Please try again.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Learning Resources</h3>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Add Resource</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Learning Resource</DialogTitle>
                <DialogDescription>
                  Add a resource to help users master this skill or concept.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddResource}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newResource.description}
                      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="type">Resource Type</Label>
                    <Select
                      value={newResource.type}
                      onValueChange={(value) => setNewResource({ ...newResource, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={newResource.url}
                      onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
                    <Input
                      id="thumbnailUrl"
                      type="url"
                      value={newResource.thumbnailUrl}
                      onChange={(e) => setNewResource({ ...newResource, thumbnailUrl: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={addResourceMutation.isPending}
                  >
                    {addResourceMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Resource
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <AnimatePresence>
        {resources.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No resources have been added for this topic yet.
            {isAdmin && " Use the 'Add Resource' button to add learning materials."}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-3"
          >
            {resources.map((resource: any, index: number) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ResourceItem resource={resource.resource} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}