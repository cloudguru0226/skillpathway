import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { RoadmapTypeSwitch } from "@/components/roadmap/roadmap-type-switch";
import { RoadmapGrid } from "@/components/roadmap/roadmap-grid";
import { CurrentLearning } from "@/components/dashboard/current-learning";
import { ProgressStats } from "@/components/dashboard/progress-stats";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { seedRoadmaps, useSeedRoadmaps } from "@/lib/seed";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function HomePage() {
  const [roadmapType, setRoadmapType] = useState("role");
  const seedRoadmapsWithToast = useSeedRoadmaps();
  
  // Check if we need to seed roadmaps
  const { data: roadmaps = [], refetch } = useQuery<any[]>({
    queryKey: ["/api/roadmaps"],
  });

  // Seed roadmaps if none exist
  useEffect(() => {
    const checkAndSeedRoadmaps = async () => {
      if (Array.isArray(roadmaps) && roadmaps.length === 0) {
        await seedRoadmaps();
      }
    };
    checkAndSeedRoadmaps();
  }, [roadmaps]);

  const handleManualSeed = async () => {
    await seedRoadmapsWithToast();
    refetch();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <RoadmapTypeSwitch 
            onChange={setRoadmapType} 
            initialType={roadmapType}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualSeed}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Seed Roadmaps
          </Button>
        </div>
        
        {/* Role-Based Roadmaps */}
        {roadmapType === "role" && (
          <RoadmapGrid 
            title="Role-Based Roadmaps" 
            type="role"
          />
        )}
        
        {/* Skill-Based Roadmaps */}
        {roadmapType === "skill" && (
          <RoadmapGrid 
            title="Skill-Based Roadmaps" 
            type="skill"
          />
        )}
        
        {/* Continue Learning Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Continue Learning</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Last active roadmap */}
            <CurrentLearning />
            
            {/* Learning stats */}
            <div className="space-y-6">
              <ProgressStats />
              <ActivityChart />
            </div>
          </div>
        </div>
        
        {/* Popular Skill-Based Roadmaps */}
        {roadmapType === "role" && (
          <RoadmapGrid 
            title="Popular Skill-Based Roadmaps" 
            type="skill"
            limit={4}
          />
        )}
        
        {/* Popular Role-Based Roadmaps */}
        {roadmapType === "skill" && (
          <RoadmapGrid 
            title="Popular Role-Based Roadmaps" 
            type="role"
            limit={3}
          />
        )}
      </main>
    </div>
  );
}
