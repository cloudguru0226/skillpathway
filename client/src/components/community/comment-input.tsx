import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(3, { message: "Comment must be at least 3 characters" }).max(500, { message: "Comment cannot exceed 500 characters" }),
  roadmapId: z.number().nullable(),
  nodeId: z.string().nullable(),
  parentId: z.number().nullable(),
});

type CommentInputProps = {
  roadmapId: number;
  nodeId: string;
  parentId?: number;
  onSuccess?: () => void;
  placeholder?: string;
  buttonText?: string;
  className?: string;
};

export function CommentInput({
  roadmapId,
  nodeId,
  parentId = null,
  onSuccess,
  placeholder = "Add a comment...",
  buttonText = "Post",
  className = "",
}: CommentInputProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const createComment = useMutation({
    mutationFn: async (content: string) => {
      const commentData = commentSchema.parse({
        content,
        roadmapId,
        nodeId,
        parentId,
      });

      return await apiRequest("POST", "/api/comments", commentData);
    },
    onSuccess: () => {
      setContent("");
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
      
      // Invalidate relevant queries to refetch comments
      if (parentId) {
        // If it's a reply, invalidate replies to parent comment
        queryClient.invalidateQueries({ queryKey: [`/api/comments/${parentId}/replies`] });
      } else {
        // If it's a top-level comment, invalidate comments for this node
        queryClient.invalidateQueries({ 
          queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/comments`] 
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to post comment",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to post a comment",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter some content for your comment",
        variant: "destructive",
      });
      return;
    }
    
    createComment.mutate(content);
  };

  return (
    <div className={`flex gap-3 ${className}`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {user?.username?.substring(0, 2).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      
      <form onSubmit={handleSubmit} className="flex-1 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="min-h-[60px] w-full resize-none"
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              if (!content) setIsFocused(false);
            }
          }}
        />
        
        {(isFocused || content) && (
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setContent("");
                setIsFocused(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              disabled={createComment.isPending || !content.trim()}
            >
              {createComment.isPending ? "Posting..." : buttonText}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}