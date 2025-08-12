import { storage } from "./storage";
import { sampleRoadmaps } from "./data/roadmaps";

export async function seedAllRoadmaps() {
  console.log("Starting complete roadmap seeding...");
  
  try {
    // Check how many roadmaps are currently in the database
    const existingRoadmaps = await storage.getRoadmaps();
    console.log(`Found ${existingRoadmaps.length} existing roadmaps in database`);
    console.log(`Found ${sampleRoadmaps.length} roadmaps available to seed`);
    
    // Log the numbers for debugging
    console.log(`Comparing: existing=${existingRoadmaps.length}, available=${sampleRoadmaps.length}`);
    
    // Force seeding all available roadmaps
    console.log("Proceeding to seed all available roadmaps...");
    
    // Clear existing roadmaps if requested or seed additional ones
    let seededCount = 0;
    
    for (const roadmapData of sampleRoadmaps) {
      try {
        // Check if this roadmap already exists by title
        const exists = existingRoadmaps.some(r => r.title === roadmapData.title);
        
        if (!exists) {
          await storage.createRoadmap({
            title: roadmapData.title!,
            description: roadmapData.description!,
            type: roadmapData.type as 'role' | 'skill',
            difficulty: roadmapData.difficulty as 'beginner' | 'intermediate' | 'advanced',
            estimatedTime: roadmapData.estimatedTime!,
            content: roadmapData.content as any
          });
          seededCount++;
          console.log(`Seeded: ${roadmapData.title}`);
        }
      } catch (error) {
        console.error(`Failed to seed roadmap: ${roadmapData.title}`, error);
      }
    }
    
    console.log(`Seeded ${seededCount} new roadmaps`);
    
    // Get final count
    const finalRoadmaps = await storage.getRoadmaps();
    console.log(`Total roadmaps in database: ${finalRoadmaps.length}`);
    
    return { 
      message: `Successfully seeded ${seededCount} roadmaps`, 
      totalCount: finalRoadmaps.length,
      newlySeeded: seededCount 
    };
    
  } catch (error) {
    console.error("Error seeding roadmaps:", error);
    throw error;
  }
}