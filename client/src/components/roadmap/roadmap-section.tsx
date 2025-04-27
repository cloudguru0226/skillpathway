import { RoadmapNode } from "./roadmap-node";
import { Badge } from "@/components/ui/badge";

interface Node {
  title: string;
  completed?: boolean;
  inProgress?: boolean;
}

interface RoadmapSectionProps {
  title: string;
  description?: string;
  nodes: Node[];
  completed?: boolean;
  inProgress?: boolean;
  onNodeClick?: (nodeTitle: string) => void;
  selectedNodeIndex?: number | null;
}

export function RoadmapSection({
  title,
  description,
  nodes,
  completed = false,
  inProgress = false,
  onNodeClick,
  selectedNodeIndex
}: RoadmapSectionProps) {
  let status;

  if (completed) {
    status = <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs">Completed</span>;
  } else if (inProgress) {
    status = <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs">In Progress</span>;
  } else {
    status = <span className="bg-muted/50 text-muted-foreground px-2 py-1 rounded text-xs">Not Started</span>;
  }

  return (
    <div className="bg-card rounded-lg p-4 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold">{title}</h3>
        {status}
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      
      <div className="space-y-3 ml-1">
        {nodes.map((node, index) => (
          <RoadmapNode
            key={node.title}
            title={node.title}
            completed={node.completed}
            inProgress={node.inProgress}
            hasConnector={index < nodes.length - 1}
            onClick={() => onNodeClick && onNodeClick(node.title)}
            isSelected={selectedNodeIndex === index}
          />
        ))}
      </div>
    </div>
  );
}
