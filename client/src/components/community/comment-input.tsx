import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from '@tanstack/react-query';
import { Send } from 'lucide-react';

interface CommentInputProps {
  roadmapId: number;
  nodeId: string;
  parentId?: number;
  onSuccess?: () => void;
  placeholder?: string;
  buttonText?: string;
}

export function CommentInput({
  roadmapId,
  nodeId,
  parentId,
  onSuccess,
  placeholder = "Add a comment...",
  buttonText = "Comment"
}: CommentInputProps) {
  const [comment, setComment] = useState('');
  const { toast } = useToast();
  
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/comments", {
        roadmapId,
        nodeId,
        content,
        parentId
      });
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ 
        queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/comments`] 
      });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to post comment: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate(comment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder={placeholder}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[80px] resize-none"
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="sm" 
          disabled={!comment.trim() || commentMutation.isPending}
          className="gap-1"
        >
          {commentMutation.isPending ? (
            <span className="animate-pulse">Posting...</span>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              {buttonText}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}