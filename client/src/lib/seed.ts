import { sampleRoadmaps } from "../data/roadmaps";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

// Function to seed roadmaps on the client side
export async function seedRoadmaps() {
  try {
    // Using the new seed endpoint that doesn't require admin
    await apiRequest("POST", "/api/seed-roadmaps", { sampleRoadmaps });
    console.log('Roadmaps seeded successfully');
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
