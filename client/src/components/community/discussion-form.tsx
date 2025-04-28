import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from '@tanstack/react-query';
import { MessageSquarePlus } from 'lucide-react';

interface DiscussionFormProps {
  roadmapId: number;
  nodeId: string;
  trigger?: React.ReactNode;
}

export function DiscussionForm({
  roadmapId,
  nodeId,
  trigger
}: DiscussionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const { toast } = useToast();
  
  const discussionMutation = useMutation({
    mutationFn: async (data: { 
      title: string; 
      content: string; 
      tags: string[] 
    }) => {
      return await apiRequest("POST", "/api/discussions", {
        roadmapId,
        nodeId,
        title: data.title,
        content: data.content,
        tags: data.tags
      });
    },
    onSuccess: () => {
      setTitle('');
      setContent('');
      setTags('');
      setIsOpen(false);
      queryClient.invalidateQueries({ 
        queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/discussions`] 
      });
      toast({
        title: "Discussion created",
        description: "Your discussion topic has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create discussion: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    // Split tags by comma and trim whitespace
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    
    discussionMutation.mutate({
      title,
      content,
      tags: tagArray
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <MessageSquarePlus className="h-4 w-4" />
            Start Discussion
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Discussion</DialogTitle>
          <DialogDescription>
            Start a new discussion thread about this topic. Be specific and provide details to encourage meaningful conversations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your discussion"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your question or topic in detail"
              className="min-h-[150px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. beginners, tutorial, help"
            />
            <p className="text-xs text-muted-foreground">Optional. Add tags to categorize your discussion.</p>
          </div>
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || !content.trim() || discussionMutation.isPending}
            >
              {discussionMutation.isPending ? 'Creating...' : 'Create Discussion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}