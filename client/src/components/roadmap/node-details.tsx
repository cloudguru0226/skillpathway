import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Loader2, BookOpen, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface NodeDetailsProps {
  node: {
    title: string;
    completed?: boolean;
    inProgress?: boolean;
  };
  sectionTitle: string;
  roadmapId: number;
  roadmapTitle: string;
  nodeId: string;
}

export function NodeDetails({ node, sectionTitle, roadmapId, roadmapTitle, nodeId }: NodeDetailsProps) {
  const { toast } = useToast();
  
  // Get learning resources for this node
  const { data: resources = [], isLoading: isLoadingResources } = useQuery<any[]>({
    queryKey: [`/api/roadmaps/${roadmapId}/nodes/${nodeId}/resources`],
    enabled: !!nodeId,
  });

  // Mark a resource as completed
  const markResourceCompleted = async (resourceId: number) => {
    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}/resources/${resourceId}/complete`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "Resource marked as completed",
          description: "Your progress has been updated",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to update progress",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Badge variant={node.completed ? "default" : node.inProgress ? "secondary" : "outline"}>
          {node.completed ? "Completed" : node.inProgress ? "In Progress" : "Not Started"}
        </Badge>
        <h3 className="text-lg font-bold mt-2">{node.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          From section: {sectionTitle}
        </p>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Learning Resources
        </h4>
        
        {isLoadingResources ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : resources.length > 0 ? (
          <div className="space-y-3">
            {resources.map((resource: any) => (
              <div 
                key={resource.id} 
                className="bg-card p-3 rounded-lg border border-border"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium text-sm">{resource.title}</h5>
                    {resource.description && (
                      <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs py-0">
                        {resource.type}
                      </Badge>
                      {resource.completed && (
                        <Badge className="text-xs py-0">Completed</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!resource.completed && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => markResourceCompleted(resource.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      asChild
                    >
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">No learning resources available for this topic yet.</p>
          </div>
        )}
        
        {/* Additional learning resources section */}
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            asChild
          >
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(`${roadmapTitle} ${node.title} tutorial`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Find more resources</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}