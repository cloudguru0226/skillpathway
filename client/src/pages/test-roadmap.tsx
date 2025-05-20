import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, Clock } from "lucide-react";

export default function TestRoadmap() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
  
  // Fetch roadmap data
  const { data: roadmap, isLoading } = useQuery({
    queryKey: ['/api/roadmaps/1'],
    queryFn: async () => {
      const response = await fetch('/api/roadmaps/1');
      if (!response.ok) {
        throw new Error('Failed to fetch roadmap');
      }
      return response.json();
    }
  });
  
  // Fetch progress data
  const { data: progressData = [] } = useQuery({
    queryKey: ['/api/progress?roadmapId=1'],
    queryFn: async () => {
      const response = await fetch('/api/progress?roadmapId=1');
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      return response.json();
    }
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-[600px] w-full rounded-lg" />
            </div>
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }
  
  if (!roadmap || !roadmap.content || !roadmap.content.sections) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 text-center">
          <h2 className="text-xl font-bold mb-4">Error loading roadmap data</h2>
          <Button onClick={() => window.location.href = '/'}>Go Home</Button>
        </main>
      </div>
    );
  }
  
  const currentSection = roadmap.content.sections[selectedSectionIndex];
  
  // Function to handle node click
  const handleNodeClick = (nodeTitle: string) => {
    console.log("Node clicked:", nodeTitle);
    
    // Set the selected node ID
    setSelectedNodeId(nodeTitle);
    
    // Find the node in the current section
    const node = currentSection.nodes.find(n => n.title === nodeTitle);
    if (!node) return;
    
    // Determine action based on current state
    let action = 'incomplete';
    if (node.completed) {
      action = 'incomplete';  // Already completed, toggle to incomplete
    } else if (node.inProgress) {
      action = 'complete';    // In progress, mark as complete
    }
    
    // Make API call to update progress
    fetch(`/api/roadmaps/1/progress/${encodeURIComponent(nodeTitle)}/${action}`, {
      method: 'POST'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
      return response.json();
    })
    .then(() => {
      // After success, update progress data
      return fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          roadmapId: 1,
          progress: {
            sections: roadmap.content.sections.map((section, sIdx) => {
              if (sIdx === selectedSectionIndex) {
                return {
                  ...section,
                  nodes: section.nodes.map(n => {
                    if (n.title === nodeTitle) {
                      if (n.completed) {
                        return { ...n, completed: false, inProgress: true };
                      } else if (n.inProgress) {
                        return { ...n, completed: true, inProgress: false };
                      } else {
                        return { ...n, inProgress: true };
                      }
                    }
                    return n;
                  })
                };
              }
              return section;
            })
          }
        })
      });
    })
    .catch(err => {
      console.error("Error updating progress:", err);
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{roadmap.title}</h1>
          <p className="text-muted-foreground mb-4">{roadmap.description}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{roadmap.type}</Badge>
            <Badge variant="outline">{roadmap.difficulty}</Badge>
            <Badge variant="outline">{roadmap.estimatedTime}</Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left section */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Section: {currentSection.title}
              </h2>
              {currentSection.description && (
                <p className="text-muted-foreground mb-6">{currentSection.description}</p>
              )}
              
              <div className="space-y-4">
                {currentSection.nodes.map((node, index) => (
                  <div 
                    key={index} 
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      node.completed 
                        ? 'bg-primary/10 border-primary' 
                        : node.inProgress 
                          ? 'bg-blue-500/10 border-blue-500' 
                          : 'bg-card border-border hover:bg-muted'
                    } ${selectedNodeId === node.title ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleNodeClick(node.title)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        node.completed 
                          ? 'bg-primary text-primary-foreground' 
                          : node.inProgress 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {node.completed ? (
                          <Check className="h-4 w-4" />
                        ) : node.inProgress ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{node.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {node.completed ? 'Completed' : node.inProgress ? 'In Progress' : 'Not Started'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (selectedSectionIndex > 0) {
                      setSelectedSectionIndex(selectedSectionIndex - 1);
                      setSelectedNodeId(null);
                    }
                  }}
                  disabled={selectedSectionIndex === 0}
                >
                  Previous Section
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (selectedSectionIndex < roadmap.content.sections.length - 1) {
                      setSelectedSectionIndex(selectedSectionIndex + 1);
                      setSelectedNodeId(null);
                    }
                  }}
                  disabled={selectedSectionIndex >= roadmap.content.sections.length - 1}
                >
                  Next Section
                </Button>
              </div>
            </Card>
          </div>
          
          {/* Right section - Node details */}
          <div>
            <Card className="p-6">
              {selectedNodeId ? (
                <>
                  <h2 className="text-xl font-bold mb-2">
                    {currentSection.nodes.find(n => n.title === selectedNodeId)?.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    From section: {currentSection.title}
                  </p>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium mb-3">Learning Resources</h3>
                    <p className="text-muted-foreground text-sm">
                      Resources for this topic will appear here when available.
                    </p>
                    <Button className="w-full mt-4" variant="outline" size="sm">
                      Find resources online
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">Select a Topic</h3>
                  <p className="text-muted-foreground text-sm">
                    Click on any topic from the roadmap to view its details and track your progress.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}