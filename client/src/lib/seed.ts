import { sampleRoadmaps } from "../data/roadmaps";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

// Function to seed roadmaps on the client side
export async function seedRoadmaps() {
  try {
    // Check if roadmaps exist
    const response = await fetch("/api/roadmaps");
    const existingRoadmaps = await response.json();
    
    // Only seed if no roadmaps exist
    if (existingRoadmaps.length === 0) {
      // Create each roadmap
      for (const roadmap of sampleRoadmaps) {
        await apiRequest("POST", "/api/roadmaps", roadmap);
      }
      
      console.log('Roadmaps seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding roadmaps:', error);
  }
}

// Hook for using the seed functionality with toast notifications
export function useSeedRoadmaps() {
  const { toast } = useToast();
  
  const seedWithToast = async () => {
    try {
      toast({
        title: "Seeding roadmaps",
        description: "Adding sample roadmaps to the database...",
      });
      
      await seedRoadmaps();
      
      toast({
        title: "Seeding complete",
        description: "Sample roadmaps have been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Seeding failed",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };
  
  return seedWithToast;
}
