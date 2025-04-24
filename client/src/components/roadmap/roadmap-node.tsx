import { CheckCircle, Clock, CirclePlus } from "lucide-react";

interface RoadmapNodeProps {
  title: string;
  completed?: boolean;
  inProgress?: boolean;
  hasConnector?: boolean;
  onClick?: () => void;
}

export function RoadmapNode({ 
  title, 
  completed = false, 
  inProgress = false,
  hasConnector = false,
  onClick
}: RoadmapNodeProps) {
  let borderClass = "border-l-4 ";
  let icon;

  if (completed) {
    borderClass += "border-green-500";
    icon = <CheckCircle className="h-5 w-5 text-green-500 mr-2" />;
  } else if (inProgress) {
    borderClass += "border-yellow-500";
    icon = <Clock className="h-5 w-5 text-yellow-500 mr-2" />;
  } else {
    borderClass += "border-muted-foreground";
    icon = <CirclePlus className="h-5 w-5 text-muted-foreground mr-2" />;
  }

  return (
    <div 
      className={`roadmap-node ${borderClass} relative p-3 rounded-md bg-card mb-2.5 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <span>{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {completed ? "Completed" : inProgress ? "In Progress" : "Not Started"}
        </span>
      </div>
      
      {hasConnector && (
        <div className="roadmap-node-connector absolute left-1/2 -ml-[1px] bottom-[-10px] w-[2px] h-[10px] bg-border z-0"></div>
      )}
    </div>
  );
}
