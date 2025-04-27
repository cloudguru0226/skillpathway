import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Loader2,
  Reply
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Comment } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentSectionProps {
  roadmapId: number;
  nodeId: string;
  userId: number;
  isAdmin: boolean;
}

export function CommentSection({ roadmapId, nodeId, userId, isAdmin }: CommentSectionProps) {
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch comments
  const {
    data: comments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/roadmaps", roadmapId, "nodes", nodeId, "comments"],
    queryFn: () => 
      fetch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}/comments`).then((res) => 
        res.json()
      ),
    enabled: !!roadmapId && !!nodeId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentData: {
      userId: number;
      roadmapId: number;
      nodeId: string;
      parentId?: number;
      content: string;
    }) => {
      const res = await apiRequest("POST", "/api/comments", commentData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/roadmaps", roadmapId, "nodes", nodeId, "comments"],
      });
      setCommentText("");
      setReplyText("");
      setReplyToCommentId(null);
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Edit comment mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const res = await apiRequest("PATCH", `/api/comments/${id}`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/roadmaps", roadmapId, "nodes", nodeId, "comments"],
      });
      setEditingCommentId(null);
      setEditText("");
      
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/comments/${id}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/roadmaps", roadmapId, "nodes", nodeId, "comments"],
      });
      
      toast({
        title: "Comment deleted",
        description: "The comment has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async ({ commentId, reaction }: { commentId: number; reaction: string }) => {
      const res = await apiRequest("POST", "/api/comments/reactions", {
        userId,
        commentId,
        reaction,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/roadmaps", roadmapId, "nodes", nodeId, "comments"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add reaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    addCommentMutation.mutate({
      userId,
      roadmapId,
      nodeId,
      content: commentText,
    });
  };

  const handleSubmitReply = (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    addCommentMutation.mutate({
      userId,
      roadmapId,
      nodeId,
      parentId,
      content: replyText,
    });
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim() || !editingCommentId) return;
    
    editCommentMutation.mutate({
      id: editingCommentId,
      content: editText,
    });
  };

  const handleDeleteComment = (id: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(id);
    }
  };

  const handleAddReaction = (commentId: number, reaction: string) => {
    addReactionMutation.mutate({ commentId, reaction });
  };

  const renderComment = (comment: any, isReply = false) => {
    const isAuthor = comment.userId === userId;
    const canModify = isAdmin || isAuthor;
    
    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 border rounded-lg ${isReply ? "ml-8 mt-2" : "mt-4"}`}
      >
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user?.avatarUrl} alt={comment.user?.username} />
            <AvatarFallback>
              {comment.user?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-sm">
                  {comment.user?.username || "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAuthor && (
                      <DropdownMenuItem onClick={() => handleStartEdit(comment)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {editingCommentId === comment.id ? (
              <form onSubmit={handleSubmitEdit} className="mt-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={editCommentMutation.isPending}
                  >
                    {editCommentMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-sm mt-1">{comment.content}</p>
                
                <div className="flex items-center gap-4 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleAddReaction(comment.id, "like")}
                  >
                    <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">{comment.reactions?.like || 0}</span>
                  </Button>
                  
                  {!isReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setReplyToCommentId(replyToCommentId === comment.id ? null : comment.id)}
                    >
                      <Reply className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Reply</span>
                    </Button>
                  )}
                </div>
              </>
            )}
            
            {/* Reply form */}
            {replyToCommentId === comment.id && (
              <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
                <div className="flex gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>
                      {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyToCommentId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!replyText.trim() || addCommentMutation.isPending}
                      >
                        {addCommentMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
            
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3">
                {comment.replies.map((reply: any) => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="py-4 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Discussion</h3>
      </div>

      <form onSubmit={handleSubmitComment} className="mt-4">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts or ask a question..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                className="gap-1.5"
                disabled={!commentText.trim() || addCommentMutation.isPending}
              >
                {addCommentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Comment
              </Button>
            </div>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {comments.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Be the first to share your thoughts or ask a question.
          </div>
        ) : (
          <div>
            {comments
              .filter((comment: any) => !comment.parentId)
              .map((comment: any) => renderComment(comment))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}