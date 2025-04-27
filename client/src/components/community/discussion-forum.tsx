import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  MessageCircle, 
  Send, 
  PlusCircle, 
  MessageSquare,
  ChevronRight,
  Eye,
  Tag,
  Loader2,
  AlertTriangle,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { DiscussionTopic, DiscussionReply } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface DiscussionForumProps {
  roadmapId: number;
  nodeId: string;
  userId: number;
  isAdmin: boolean;
}

export function DiscussionForum({ roadmapId, nodeId, userId, isAdmin }: DiscussionForumProps) {
  const { toast } = useToast();
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    content: "",
    tags: [] as string[],
  });
  const [newTagInput, setNewTagInput] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Fetch discussion topics
  const {
    data: topics = [],
    isLoading: isLoadingTopics,
    isError: isErrorTopics,
  } = useQuery({
    queryKey: ["/api/roadmaps", roadmapId, "nodes", nodeId, "discussions"],
    queryFn: () => 
      fetch(`/api/roadmaps/${roadmapId}/nodes/${nodeId}/discussions`).then((res) => 
        res.json()
      ),
    enabled: !!roadmapId && !!nodeId,
  });

  // Fetch replies for selected topic
  const {
    data: replies = [],
    isLoading: isLoadingReplies,
    isError: isErrorReplies,
  } = useQuery({
    queryKey: ["/api/discussions", selectedTopic, "replies"],
    queryFn: () => 
      fetch(`/api/discussions/${selectedTopic}/replies`).then((res) => 
        res.json()
      ),
    enabled: !!selectedTopic,
  });

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: {
      userId: number;
      roadmapId: number;
      nodeId: string;
      title: string;
      content: string;
      tags: string[];
    }) => {
      const res = await apiRequest("POST", "/api/discussions", topicData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/roadmaps", roadmapId, "nodes", nodeId, "discussions"],
      });
      setIsCreateTopicOpen(false);
      setNewTopic({
        title: "",
        content: "",
        tags: [],
      });
      setSelectedTopic(data.id);
      
      toast({
        title: "Topic created",
        description: "Your discussion topic has been created successfully.",
      });

      // Increment view count for the new topic
      incrementViewCountMutation.mutate(data.id);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create topic",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (replyData: {
      topicId: number;
      userId: number;
      content: string;
    }) => {
      const res = await apiRequest("POST", "/api/discussions/replies", replyData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/discussions", selectedTopic, "replies"],
      });
      setReplyContent("");
      
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post reply",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Increment view count mutation
  const incrementViewCountMutation = useMutation({
    mutationFn: async (topicId: number) => {
      const res = await apiRequest("POST", `/api/discussions/${topicId}/view`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/roadmaps", roadmapId, "nodes", nodeId, "discussions"],
      });
    },
  });

  // Mark as accepted answer mutation
  const markAsAcceptedMutation = useMutation({
    mutationFn: async (replyId: number) => {
      const res = await apiRequest("PATCH", `/api/discussions/replies/${replyId}/accept`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/discussions", selectedTopic, "replies"],
      });
      
      toast({
        title: "Answer accepted",
        description: "The reply has been marked as the accepted answer.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to accept answer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddTag = () => {
    if (newTagInput.trim() && !newTopic.tags.includes(newTagInput.trim())) {
      setNewTopic({
        ...newTopic,
        tags: [...newTopic.tags, newTagInput.trim()],
      });
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewTopic({
      ...newTopic,
      tags: newTopic.tags.filter((t) => t !== tag),
    });
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;
    
    createTopicMutation.mutate({
      userId,
      roadmapId,
      nodeId,
      title: newTopic.title,
      content: newTopic.content,
      tags: newTopic.tags,
    });
  };

  const handleTopicClick = (topicId: number) => {
    setSelectedTopic(topicId);
    incrementViewCountMutation.mutate(topicId);
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedTopic) return;
    
    createReplyMutation.mutate({
      topicId: selectedTopic,
      userId,
      content: replyContent,
    });
  };

  const handleMarkAsAccepted = (replyId: number) => {
    markAsAcceptedMutation.mutate(replyId);
  };

  if (isLoadingTopics) {
    return (
      <div className="py-4 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isErrorTopics) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        <p>Failed to load discussions. Please try again later.</p>
      </div>
    );
  }

  // If a topic is selected, show the topic and its replies
  if (selectedTopic) {
    const topic = topics.find((t: DiscussionTopic) => t.id === selectedTopic);
    
    if (!topic) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
          <p>Topic not found. It may have been deleted.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSelectedTopic(null)}
          >
            Back to Topics
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="hover:bg-muted"
            onClick={() => setSelectedTopic(null)}
          >
            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Topics
          </Button>
        </div>

        <div className="p-6 border rounded-lg space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold">{topic.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Eye className="h-4 w-4 mr-1" />
              <span>{topic.viewCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={topic.user?.avatarUrl} alt={topic.user?.username} />
              <AvatarFallback>
                {topic.user?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{topic.user?.username || "Anonymous"}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="mt-4 pb-4 border-b">
            <p className="whitespace-pre-wrap">{topic.content}</p>
            
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {topic.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <h4 className="font-medium text-lg mt-6">
            {replies.length === 0 ? "No Answers Yet" : `${replies.length} Answers`}
          </h4>

          {isLoadingReplies ? (
            <div className="py-4 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : isErrorReplies ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Failed to load replies. Please try again.
            </div>
          ) : (
            <AnimatePresence>
              {replies.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Be the first to answer this question.
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {replies.map((reply: DiscussionReply) => (
                    <motion.div
                      key={reply.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg ${reply.isAcceptedAnswer ? "border-green-500 bg-green-50 dark:bg-green-900/10" : ""}`}
                    >
                      {reply.isAcceptedAnswer && (
                        <div className="flex items-center gap-1 text-green-600 mb-2">
                          <Check className="h-4 w-4" />
                          <span className="text-sm font-medium">Accepted Answer</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.user?.avatarUrl} alt={reply.user?.username} />
                          <AvatarFallback>
                            {reply.user?.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{reply.user?.username || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      <p className="whitespace-pre-wrap text-sm">{reply.content}</p>
                      
                      {(isAdmin || topic.userId === userId) && !reply.isAcceptedAnswer && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            onClick={() => handleMarkAsAccepted(reply.id)}
                            disabled={markAsAcceptedMutation.isPending}
                          >
                            {markAsAcceptedMutation.isPending && (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            )}
                            Mark as Answer
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}

          <form onSubmit={handleSubmitReply} className="mt-6">
            <h4 className="font-medium mb-2">Your Answer</h4>
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your answer here..."
              className="min-h-[150px]"
            />
            <div className="flex justify-end mt-3">
              <Button
                type="submit"
                className="gap-1.5"
                disabled={!replyContent.trim() || createReplyMutation.isPending}
              >
                {createReplyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Post Answer
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Q&A Forum</h3>
        </div>
        
        <Dialog open={isCreateTopicOpen} onOpenChange={setIsCreateTopicOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              New Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create a New Discussion Topic</DialogTitle>
              <DialogDescription>
                Ask a question or start a discussion about this topic.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTopic}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="What's your question or topic?"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="content" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="content"
                    placeholder="Provide details about your question or topic..."
                    value={newTopic.content}
                    onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                    className="min-h-[150px]"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {newTopic.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          &times;
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={!newTopic.title.trim() || !newTopic.content.trim() || createTopicMutation.isPending}
                >
                  {createTopicMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Topic
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        {topics.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-60" />
            <p>No discussions yet for this topic.</p>
            <p className="text-sm mt-1">Be the first to start a conversation!</p>
            <Button
              onClick={() => setIsCreateTopicOpen(true)}
              className="mt-4 gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              New Topic
            </Button>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {topics.map((topic: DiscussionTopic) => (
              <AccordionItem key={topic.id} value={`topic-${topic.id}`}>
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium">{topic.title}</div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
                      </span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{topic.replyCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{topic.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {topic.content}
                  </p>
                  
                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {topic.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handleTopicClick(topic.id)}
                    className="mt-2"
                    variant="outline"
                  >
                    View Full Discussion
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}