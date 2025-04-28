import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, ThumbsUp, MessageSquare, Flag, Pencil, Trash2 } from "lucide-react";
import { CommentInput } from "./comment-input";

type CommentProps = {
  comment: {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
    user?: {
      id: number;
      username: string;
      isAdmin?: boolean;
    };
    reactions?: {
      reaction: string;
      count: number;
    }[];
    repliesCount?: number;
  };
  roadmapId: number;
  nodeId: string;
  showReplies?: boolean;
  isReply?: boolean;
  onDelete?: () => void;
};

export function Comment({
  comment,
  roadmapId,
  nodeId,
  showReplies = true,
  isReply = false,
  onDelete,
}: CommentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  // Format the date
  const timeAgo = comment.createdAt 
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : "recently";
  
  // Check if the comment was updated
  const wasEdited = comment.updatedAt && new Date(comment.updatedAt) > new Date(comment.createdAt);
  
  // Check if the current user can edit/delete the comment
  const isAuthor = user?.id === comment.userId;
  const canModify = isAuthor || user?.isAdmin;
  
  // Get replies if showing them
  const {
    data: replies = [],
    isLoading: repliesLoading,
    refetch: refetchReplies
  } = useQuery({
    queryKey: [`/api/comments/${comment.id}/replies`],
    queryFn: async () => {
      if (!showReplies) return [];
      try {
        const res = await fetch(`/api/comments/${comment.id}/replies`);
        if (!res.ok) throw new Error("Failed to fetch replies");
        return await res.json();
      } catch (error) {
        console.error("Error fetching replies:", error);
        return [];
      }
    },
    enabled: showReplies && (comment.repliesCount || 0) > 0
  });
  
  // Handle updating a comment
  const updateComment = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("PUT", `/api/comments/${comment.id}`, { content });
    },
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully",
      });
      
      // Invalidate the comments query to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/comments`] 
      });
      
      if (isReply) {
        queryClient.invalidateQueries({
          queryKey: [`/api/comments/${comment.id}/replies`]
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update comment",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Handle deleting a comment
  const deleteComment = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/comments/${comment.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully",
      });
      
      // Invalidate the comments query to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/comments`] 
      });
      
      if (isReply && onDelete) {
        onDelete();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to delete comment",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  // Handle comment reactions
  const reactToComment = useMutation({
    mutationFn: async (reaction: string) => {
      return await apiRequest("POST", `/api/comments/${comment.id}/reactions`, { reaction });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/comments/${comment.id}/reactions`] 
      });
      
      // Also refresh the main comment list to update reaction counts
      queryClient.invalidateQueries({ 
        queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/comments`] 
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to react",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    },
  });
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(comment.content);
  };
  
  const handleSaveEdit = () => {
    if (editedContent.trim() === "") {
      toast({
        title: "Empty comment",
        description: "Comment content cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (editedContent.trim() === comment.content.trim()) {
      setIsEditing(false);
      return;
    }
    
    updateComment.mutate(editedContent);
  };
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment.mutate();
    }
  };
  
  // Get the like count
  const likeCount = comment.reactions?.find(r => r.reaction === "like")?.count || 0;
  
  return (
    <div className={`flex gap-3 ${isReply ? "ml-8 mt-3" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback>
          {comment.user?.username?.substring(0, 2).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="bg-muted p-3 rounded-md">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {comment.user?.username || "User"}
              </span>
              {comment.user?.isAdmin && (
                <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                  Admin
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {timeAgo} {wasEdited && "(edited)"}
              </span>
            </div>
            
            {canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAuthor && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Flag className="mr-2 h-4 w-4" /> Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[60px] w-full"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={updateComment.isPending}
                >
                  {updateComment.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4 pl-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs gap-1"
            onClick={() => user && reactToComment.mutate("like")}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            {likeCount > 0 && <span>{likeCount}</span>}
          </Button>
          
          {showReplies && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs gap-1"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Reply
            </Button>
          )}
        </div>
        
        {showReplyForm && (
          <div className="mt-2">
            <CommentInput
              roadmapId={roadmapId}
              nodeId={nodeId}
              parentId={comment.id}
              placeholder="Write a reply..."
              buttonText="Reply"
              onSuccess={() => {
                setShowReplyForm(false);
                refetchReplies();
              }}
            />
          </div>
        )}
        
        {showReplies && replies.length > 0 && (
          <div className="mt-2 space-y-3">
            {replies.map((reply: any) => (
              <Comment
                key={reply.id}
                comment={reply}
                roadmapId={roadmapId}
                nodeId={nodeId}
                showReplies={false}
                isReply={true}
                onDelete={() => refetchReplies()}
              />
            ))}
          </div>
        )}
        
        {showReplies && repliesLoading && replies.length === 0 && (
          <div className="text-xs text-muted-foreground mt-2">
            Loading replies...
          </div>
        )}
        
        {showReplies && !repliesLoading && comment.repliesCount > 0 && replies.length === 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => refetchReplies()}
          >
            Show {comment.repliesCount} {comment.repliesCount === 1 ? "reply" : "replies"}
          </Button>
        )}
      </div>
    </div>
  );
}