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
}

export function RoadmapSection({
  title,
  description,
  nodes,
  completed = false,
  inProgress = false,
  onNodeClick
}: RoadmapSectionProps) {
  let status;

  if (completed) {
    status = <Badge className="bg-green-500/20 text-green-500 px-2 py-1 rounded">Completed</Badge>;
  } else if (inProgress) {
    status = <Badge className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">In Progress</Badge>;
  } else {
    status = <Badge className="bg-muted/50 text-muted-foreground px-2 py-1 rounded">Not Started</Badge>;
  }

  return (
    <div className="bg-muted rounded-lg p-4 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold">{title}</h3>
        {status}
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      
      <div className="space-y-1 ml-1">
        {nodes.map((node, index) => (
          <RoadmapNode
            key={node.title}
            title={node.title}
            completed={node.completed}
            inProgress={node.inProgress}
            hasConnector={index < nodes.length - 1}
            onClick={() => onNodeClick && onNodeClick(node.title)}
          />
        ))}
      </div>
    </div>
  );
}
