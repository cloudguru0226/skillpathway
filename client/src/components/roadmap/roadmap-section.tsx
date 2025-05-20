import React from 'react';
import { Check, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface RoadmapSectionProps {
  title: string;
  description?: string;
  nodes: Array<{
    title: string;
    completed?: boolean;
    inProgress?: boolean;
  }>;
  selectedNodeIndex?: number | null;
  onNodeClick: (nodeIndex: number) => void;
}

export const RoadmapSection: React.FC<RoadmapSectionProps> = ({
  title,
  description,
  nodes,
  selectedNodeIndex,
  onNodeClick,
}) => {
  // Calculate section progress
  const totalNodes = nodes.length;
  const completedNodes = nodes.filter(node => node.completed).length;
  const progressPercentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  // Get node status text 
  const getNodeStatusText = (node: { completed?: boolean; inProgress?: boolean }) => {
    if (node.completed) return "Completed";
    if (node.inProgress) return "In Progress";
    return "Not Started";
  };

  return (
    <div className="bg-card rounded-lg p-5 border border-border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
        
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
            <div 
              style={{ width: `${progressPercentage}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <span className="text-sm font-medium">{progressPercentage}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {nodes.map((node, index) => (
          <div key={index} className="w-full">
            <button
              type="button"
              onClick={() => onNodeClick(index)}
              className={cn(
                "w-full text-left p-3 rounded-md border flex items-center gap-3 transition-all",
                node.completed 
                  ? "bg-primary/10 border-primary hover:bg-primary/20" 
                  : node.inProgress 
                    ? "bg-blue-500/10 border-blue-500 hover:bg-blue-500/20" 
                    : "bg-background border-border hover:bg-muted",
                selectedNodeIndex === index && "ring-2 ring-primary"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                node.completed 
                  ? "bg-primary text-primary-foreground" 
                  : node.inProgress 
                    ? "bg-blue-500 text-white" 
                    : "bg-muted text-muted-foreground"
              )}>
                {node.completed ? (
                  <Check className="h-3.5 w-3.5" />
                ) : node.inProgress ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "font-medium text-sm",
                  node.completed && "text-primary",
                  node.inProgress && "text-blue-500"
                )}>
                  {node.title}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {getNodeStatusText(node)}
                </span>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};