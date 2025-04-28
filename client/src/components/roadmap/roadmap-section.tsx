import React from 'react';
import { CheckIcon, Clock3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Card entry animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 } 
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 } 
    }
  };

  // Progress animation
  const progressVariants = {
    initial: { width: '0%' },
    animate: { 
      width: `${progressPercentage}%`,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={cardVariants}
      className="bg-card rounded-lg p-5 border border-border"
    >
      <div className="mb-4">
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg font-semibold mb-2"
        >
          {title}
        </motion.h3>
        
        {description && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm"
          >
            {description}
          </motion.p>
        )}
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 flex items-center gap-3"
        >
          <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={progressVariants}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium"
          >
            {progressPercentage}%
          </motion.span>
        </motion.div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {nodes.map((node, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => onNodeClick(index)}
              whileHover={{ 
                scale: 1.01, 
                transition: { duration: 0.2 } 
              }}
              whileTap={{ scale: 0.98 }}
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
                  <CheckIcon className="h-3.5 w-3.5" />
                ) : node.inProgress ? (
                  <Clock3 className="h-3.5 w-3.5" />
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
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};