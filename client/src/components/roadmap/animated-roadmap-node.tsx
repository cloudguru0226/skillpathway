import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, MessageSquare, FileText, HelpCircle } from "lucide-react";
import { NodeDetails } from "./node-details";
import { Roadmap } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AnimatedRoadmapNodeProps {
  id: string;
  title: string;
  description?: string;
  category?: string;
  roadmap: Roadmap;
  userId: number;
  isAdmin: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
  hasComments: boolean;
  hasResources: boolean;
  hasDiscussions: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedRoadmapNode({
  id,
  title,
  description,
  category,
  roadmap,
  userId,
  isAdmin,
  isUnlocked,
  isCompleted,
  hasComments,
  hasResources,
  hasDiscussions,
  className,
  style,
}: AnimatedRoadmapNodeProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get node status styling
  const getNodeStatus = () => {
    if (!isUnlocked) {
      return {
        border: "border-gray-500",
        bg: "bg-muted/70",
        text: "text-muted-foreground",
        icon: <Lock className="h-3.5 w-3.5" />,
        iconColor: "text-gray-500",
      };
    }
    
    if (isCompleted) {
      return {
        border: "border-green-500",
        bg: "bg-green-500/20 dark:bg-green-500/10",
        text: "text-foreground",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        iconColor: "text-green-500",
      };
    }
    
    return {
      border: "border-primary",
      bg: "bg-background",
      text: "text-foreground",
      icon: null,
      iconColor: "",
    };
  };
  
  const status = getNodeStatus();
  
  // Calculate basic height based on title length
  const calculateMinHeight = () => {
    const titleLength = title.length;
    if (titleLength < 20) return 80; // short titles
    if (titleLength < 40) return 100; // medium titles
    return 120; // long titles
  };
  
  const minHeight = calculateMinHeight();
  
  // Animation variants
  const variants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1,
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.1
      }
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
      transition: { 
        type: "spring",
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: {
      scale: 0.98,
      transition: { 
        type: "spring",
        stiffness: 400, 
        damping: 10 
      }
    }
  };
  
  return (
    <>
      <motion.div
        initial="initial"
        animate="animate"
        whileHover={isUnlocked ? "hover" : {}}
        whileTap={isUnlocked ? "tap" : {}}
        variants={variants}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => isUnlocked && setIsDetailsOpen(true)}
        className={cn(
          "relative p-4 rounded-lg border transition-colors cursor-pointer min-w-[200px]",
          status.border,
          status.bg,
          status.text,
          !isUnlocked && "cursor-not-allowed",
          className
        )}
        style={{ 
          minHeight: `${minHeight}px`,
          ...style 
        }}
      >
        {category && (
          <div className="absolute top-2 right-2 bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
            {category}
          </div>
        )}
        
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-sm">{title}</h3>
            {status.icon && (
              <span className={cn("mt-1", status.iconColor)}>
                {status.icon}
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
              {description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-auto pt-3">
            {hasComments && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
              </div>
            )}
            
            {hasResources && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
              </div>
            )}
            
            {hasDiscussions && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <HelpCircle className="h-3 w-3" />
              </div>
            )}
          </div>
          
          {isHovered && isUnlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg"
            >
              <span className="text-xs font-medium">Click to View Details</span>
            </motion.div>
          )}
          
          {!isUnlocked && (
            <motion.div 
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0.8 }}
              className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg"
            >
              <div className="flex flex-col items-center">
                <Lock className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Complete previous steps first</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {isDetailsOpen && (
        <NodeDetails
          roadmap={roadmap}
          nodeId={id}
          nodeName={title}
          nodeDescription={description || ""}
          userId={userId}
          isAdmin={isAdmin}
          isCompleted={isCompleted}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </>
  );
}