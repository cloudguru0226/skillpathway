import { useState } from "react";
import { Link } from "wouter";
import { BookMarked, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Roadmap } from "@shared/schema";

interface RoadmapCardProps {
  roadmap: Roadmap;
  progress?: number;
}

export function RoadmapCard({ roadmap, progress = 0 }: RoadmapCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isHovering, setIsHovering] = useState(false);

  // Check if the roadmap is bookmarked
  const { data: bookmarks = [] } = useQuery({
    queryKey: ["/api/bookmarks"],
    enabled: !!user,
  });

  const isBookmarked = bookmarks.some((bookmark: any) => bookmark.roadmapId === roadmap.id);

  // Toggle bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        // Remove bookmark
        await apiRequest("DELETE", `/api/bookmarks/${roadmap.id}`);
      } else {
        // Add bookmark
        await apiRequest("POST", "/api/bookmarks", { roadmapId: roadmap.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: isBookmarked ? "Bookmark removed" : "Bookmark added",
        description: isBookmarked ? "Roadmap removed from your bookmarks" : "Roadmap added to your bookmarks",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${isBookmarked ? "remove" : "add"} bookmark: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    bookmarkMutation.mutate();
  };

  return (
    <div 
      className="bg-card rounded-lg overflow-hidden border border-border transition-all duration-200 hover:shadow-lg hover:border-primary hover:translate-y-[-4px]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold">{roadmap.title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${isBookmarked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`} 
            onClick={handleBookmarkToggle}
          >
            <BookMarked className="h-5 w-5" />
          </Button>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4">{roadmap.description}</p>
        
        <div className="flex items-center gap-4 text-sm mb-5">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-muted-foreground">{roadmap.estimatedTime}</span>
          </div>
          
          <div className="flex items-center">
            <Zap className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-muted-foreground">{roadmap.difficulty}</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-5">
          <div className="text-xs text-muted-foreground flex justify-between mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <Link href={`/roadmap/${roadmap.id}`}>
          <Button 
            variant={isHovering ? "default" : "secondary"} 
            className="w-full py-2 text-sm"
          >
            {progress > 0 ? "Continue Learning" : "Start Learning"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
