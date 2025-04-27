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
        <div className="flex justify-between items-center mb-6">
          <RoadmapTypeSwitch 
            onChange={setRoadmapType} 
            initialType={roadmapType}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualSeed}
            className="flex items-center gap-2 bg-card text-foreground hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Seed Roadmaps
          </Button>
        </div>
        
        {/* Role-Based Roadmaps */}
        {roadmapType === "role" && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Role-Based Roadmaps</h2>
              <Button 
                variant="link" 
                className="text-primary hover:text-primary/80"
              >
                View All
              </Button>
            </div>
            <RoadmapGrid 
              title="" 
              type="role"
              showViewAll={false}
            />
          </div>
        )}
        
        {/* Skill-Based Roadmaps */}
        {roadmapType === "skill" && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Skill-Based Roadmaps</h2>
              <Button 
                variant="link" 
                className="text-primary hover:text-primary/80"
              >
                View All
              </Button>
            </div>
            <RoadmapGrid 
              title="" 
              type="skill"
              showViewAll={false}
            />
          </div>
        )}
        
        {/* Continue Learning Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Continue Learning</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Last active roadmap */}
            <CurrentLearning />
            
            {/* Learning stats */}
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-5">
                <h3 className="text-lg font-bold mb-4">Your Learning Stats</h3>
                <ProgressStats />
              </div>
              <div className="bg-card rounded-lg p-5">
                <h3 className="text-lg font-bold mb-4">Weekly Activity</h3>
                <ActivityChart />
              </div>
            </div>
          </div>
        </div>
        
        {/* Popular Skill-Based Roadmaps */}
        {roadmapType === "role" && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Popular Skill-Based Roadmaps</h2>
              <Button 
                variant="link" 
                className="text-primary hover:text-primary/80"
              >
                View All
              </Button>
            </div>
            <RoadmapGrid 
              title="" 
              type="skill"
              limit={4}
              showViewAll={false}
            />
          </div>
        )}
        
        {/* Popular Role-Based Roadmaps */}
        {roadmapType === "skill" && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Popular Role-Based Roadmaps</h2>
              <Button 
                variant="link" 
                className="text-primary hover:text-primary/80"
              >
                View All
              </Button>
            </div>
            <RoadmapGrid 
              title="" 
              type="role"
              limit={3}
              showViewAll={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}
