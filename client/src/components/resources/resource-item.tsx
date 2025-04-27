import { ExternalLink, FileText, Video, Book, Link, HelpCircle } from "lucide-react";
import { Resource } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ResourceItemProps {
  resource: Resource;
  className?: string;
}

export function ResourceItem({ resource, className }: ResourceItemProps) {
  // Function to determine the resource icon based on type
  const getResourceIcon = () => {
    switch (resource.type.toLowerCase()) {
      case "article":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "book":
        return <Book className="h-4 w-4" />;
      case "link":
        return <Link className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  // Function to get resource type label
  const getResourceTypeLabel = () => {
    switch (resource.type.toLowerCase()) {
      case "article":
        return "Article";
      case "video":
        return "Video";
      case "book":
        return "Book";
      case "tutorial":
        return "Tutorial";
      case "documentation":
        return "Documentation";
      case "course":
        return "Course";
      default:
        return resource.type.charAt(0).toUpperCase() + resource.type.slice(1);
    }
  };

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-all group hover:bg-muted/50",
        className
      )}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-md bg-muted/80 flex items-center justify-center">
        {resource.thumbnailUrl ? (
          <img
            src={resource.thumbnailUrl}
            alt={resource.title}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          getResourceIcon()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
            {resource.title}
          </h4>
          <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors ml-2" />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {resource.description || "No description available"}
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground">
            {getResourceTypeLabel()}
          </span>
        </div>
      </div>
    </a>
  );
}