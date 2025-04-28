import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, PanelTopOpen, History } from "lucide-react";
import { CommentInput } from "./comment-input";
import { Comment } from "./comment";
import { DiscussionForm } from "./discussion-form";

type CommentsSectionProps = {
  roadmapId: number;
  nodeId: string;
  className?: string;
}

export function CommentsSection({ roadmapId, nodeId, className = "" }: CommentsSectionProps) {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  // Fetch comments for the roadmap node
  const {
    data: comments = [],
    isLoading,
    refetch: refetchComments,
  } = useQuery({
    queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/comments`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}/comments`);
        if (!res.ok) throw new Error("Failed to fetch comments");
        return await res.json();
      } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
      }
    },
  });
  
  // Fetch discussions for the roadmap node
  const {
    data: discussions = [],
    isLoading: discussionsLoading,
  } = useQuery({
    queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/discussions`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}/discussions`);
        if (!res.ok) throw new Error("Failed to fetch discussions");
        return await res.json();
      } catch (error) {
        console.error("Error fetching discussions:", error);
        return [];
      }
    },
  });
  
  // Sort comments based on selected order
  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="comments" className="w-full">
        <TabsList>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Comments</span>
            {comments.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {comments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <PanelTopOpen className="h-4 w-4" />
            <span>Discussions</span>
            {discussions.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {discussions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments" className="space-y-6 mt-6">
          <CommentInput
            roadmapId={roadmapId}
            nodeId={nodeId}
            onSuccess={() => refetchComments()}
            className="mb-6"
          />
          
          {comments.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">
                {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
              </h3>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort by:</span>
                <Button
                  variant={sortOrder === "newest" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setSortOrder("newest")}
                >
                  <History className="h-3 w-3" />
                  Newest
                </Button>
                <Button
                  variant={sortOrder === "oldest" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setSortOrder("oldest")}
                >
                  <History className="h-3 w-3 transform rotate-180" />
                  Oldest
                </Button>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="h-8 w-8 bg-secondary rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-1/4" />
                    <div className="h-16 bg-secondary rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-md">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-1">No comments yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to share your thoughts on this topic.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedComments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  roadmapId={roadmapId}
                  nodeId={nodeId}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="discussions" className="space-y-6 mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium">
              {discussions.length} {discussions.length === 1 ? "Discussion" : "Discussions"}
            </h3>
            
            <DiscussionForm
              roadmapId={roadmapId}
              nodeId={nodeId}
              trigger={
                <Button size="sm" className="gap-2">
                  <PanelTopOpen className="h-4 w-4" />
                  New Discussion
                </Button>
              }
            />
          </div>
          
          {discussionsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-6 bg-secondary rounded w-3/4" />
                  <div className="h-16 bg-secondary rounded" />
                  <div className="h-4 bg-secondary rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-md">
              <PanelTopOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-1">No discussions yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start a new discussion to share insights or ask questions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussions.map((discussion: any) => (
                <div
                  key={discussion.id}
                  className="border rounded-md p-4 hover:bg-accent/50 transition-colors"
                  onClick={() => alert("View discussion details (to be implemented)")}
                >
                  <h4 className="font-medium mb-1">{discussion.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {discussion.content}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>
                      By {discussion.user?.username || "User"} • {new Date(discussion.createdAt).toLocaleDateString()}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{discussion.replyCount || 0} replies</span>
                    <span className="mx-2">•</span>
                    <span>{discussion.viewCount || 0} views</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}