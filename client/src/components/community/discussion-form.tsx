import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Form schema
const discussionFormSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(150, { message: "Title cannot exceed 150 characters" }),
  content: z
    .string()
    .min(20, { message: "Content must be at least 20 characters" })
    .max(5000, { message: "Content cannot exceed 5000 characters" }),
  tags: z.string().optional(),
});

type DiscussionFormValues = z.infer<typeof discussionFormSchema>;

interface DiscussionFormProps {
  trigger: React.ReactNode;
  roadmapId: number;
  nodeId: string;
}

export function DiscussionForm({ trigger, roadmapId, nodeId }: DiscussionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<DiscussionFormValues>({
    resolver: zodResolver(discussionFormSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  const createDiscussion = useMutation({
    mutationFn: async (data: DiscussionFormValues) => {
      const tagsArray = data.tags
        ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

      const discussionData = {
        title: data.title,
        content: data.content,
        tags: tagsArray,
        roadmapId: roadmapId || null,
        nodeId: nodeId || null,
      };

      return await apiRequest("POST", "/api/discussions", discussionData);
    },
    onSuccess: () => {
      toast({
        title: "Discussion created",
        description: "Your discussion has been posted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/discussions"] });
      if (roadmapId && nodeId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/discussions`],
        });
      }
      form.reset();
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create discussion",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: DiscussionFormValues) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a discussion",
        variant: "destructive",
      });
      return;
    }
    createDiscussion.mutate(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Start a new discussion</DialogTitle>
          <DialogDescription>
            Share your thoughts, ask questions, or start a conversation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type a descriptive title for your discussion"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your discussion here..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can use markdown to format your content.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="frontend, react, beginners (comma separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add relevant tags to help others find your discussion.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDiscussion.isPending}
              >
                {createDiscussion.isPending ? "Posting..." : "Post Discussion"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}