import { CheckCircle, Circle, CircleEllipsis } from "lucide-react";

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
  let icon;
  let className = "relative p-3 rounded-md mb-2.5 transition-all duration-200 hover:shadow-md cursor-pointer ";

  if (completed) {
    className += "bg-green-500/10 border border-green-500/30";
    icon = <CheckCircle className="h-5 w-5 text-green-500 mr-2" />;
  } else if (inProgress) {
    className += "bg-yellow-500/10 border border-yellow-500/30";
    icon = <CircleEllipsis className="h-5 w-5 text-yellow-500 mr-2" />;
  } else {
    className += "bg-muted border border-border";
    icon = <Circle className="h-5 w-5 text-muted-foreground mr-2" />;
  }

  return (
    <div 
      className={className}
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      
      {hasConnector && (
        <div className="absolute left-1/2 -ml-[1px] bottom-[-10px] w-[2px] h-[10px] bg-border z-0"></div>
      )}
    </div>
  );
}
