import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { RoadmapDetail } from "./roadmap-detail";
import { Roadmap } from "@shared/schema";

interface RoadmapTransitionProps {
  roadmapId: number | null;
  roadmapData: Roadmap | null;
  isLoading: boolean;
  userId: number;
}

export function RoadmapTransition({
  roadmapId,
  roadmapData,
  isLoading,
  userId,
}: RoadmapTransitionProps) {
  const [previousRoadmap, setPreviousRoadmap] = useState<{
    id: number | null;
    data: Roadmap | null;
  }>({ id: null, data: null });
  const [direction, setDirection] = useState<"left" | "right">("right");

  // Track the previous roadmap for animation purposes
  useEffect(() => {
    if (roadmapData && roadmapId !== previousRoadmap.id) {
      // Determine animation direction based on roadmap ID comparison
      if (roadmapId && previousRoadmap.id) {
        setDirection(roadmapId > previousRoadmap.id ? "right" : "left");
      }
      setPreviousRoadmap({ id: roadmapId, data: roadmapData });
    }
  }, [roadmapId, roadmapData]);

  // Animation variants
  const variants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "right" ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "right" ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No roadmap selected state
  if (!roadmapId || !roadmapData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <h3 className="text-2xl font-semibold mb-4">Select a Roadmap</h3>
        <p className="text-muted-foreground max-w-md">
          Choose a roadmap from the sidebar to start your learning journey
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <AnimatePresence
        custom={direction}
        mode="wait"
        initial={false}
      >
        <motion.div
          key={roadmapId}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="w-full"
        >
          <RoadmapDetail roadmap={roadmapData} userId={userId} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}