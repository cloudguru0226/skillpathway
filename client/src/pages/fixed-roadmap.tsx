import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock } from "lucide-react";

// A much simpler roadmap implementation focused on reliability
export default function FixedRoadmap() {
  // Track which topic is selected
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  // Track which section we're viewing
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  // Load the roadmap data (Frontend Developer roadmap)
  const { data: roadmap, isLoading } = useQuery({
    queryKey: ['/api/roadmaps/1'],
    queryFn: async () => {
      const res = await fetch('/api/roadmaps/1');
      return res.json();
    }
  });
  
  // If still loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full max-w-md mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-[600px] w-full" />
            </div>
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (!roadmap || !roadmap.content || !roadmap.content.sections) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8 text-center">
          <h2 className="text-xl font-bold mb-4">Error loading roadmap data</h2>
          <Button onClick={() => window.location.href = '/'}>Return Home</Button>
        </div>
      </div>
    );
  }
  
  // Get the current section we're viewing
  const currentSection = roadmap.content.sections[currentSectionIndex];
  
  // Find the selected topic object
  const selectedNode = selectedTopic 
    ? currentSection.nodes.find(node => node.title === selectedTopic) 
    : null;
  
  // Handle clicking on a topic
  const handleTopicClick = (topicTitle: string) => {
    console.log("Clicked topic:", topicTitle);
    setSelectedTopic(topicTitle);
    
    // Find the node
    const node = currentSection.nodes.find(n => n.title === topicTitle);
    if (!node) return;
    
    // Determine what action to take based on current state
    let action = 'incomplete';
    if (node.completed) {
      action = 'incomplete';
    } else if (node.inProgress) {
      action = 'complete';
    }
    
    // Make the API call to update node status
    fetch(`/api/roadmaps/1/progress/${encodeURIComponent(topicTitle)}/${action}`, {
      method: 'POST'
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update progress');
      return res.json();
    })
    .then(() => {
      // Update local progress data
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          roadmapId: 1,
          progress: {
            sections: roadmap.content.sections.map((section, sIdx) => {
              if (sIdx === currentSectionIndex) {
                return {
                  ...section,
                  nodes: section.nodes.map(n => {
                    if (n.title === topicTitle) {
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
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{roadmap.title}</h1>
            <p className="text-muted-foreground">{roadmap.description}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-2">
            <span className="text-sm font-medium">Current Section:</span>
            <select 
              className="bg-background border rounded px-2 py-1"
              value={currentSectionIndex}
              onChange={(e) => {
                setCurrentSectionIndex(Number(e.target.value));
                setSelectedTopic(null);
              }}
            >
              {roadmap.content.sections.map((section, index) => (
                <option key={index} value={index}>
                  {section.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side - Topic list */}
          <div className="md:col-span-2">
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-4">{currentSection.title}</h2>
              {currentSection.description && (
                <p className="text-muted-foreground mb-4">{currentSection.description}</p>
              )}
              
              <div className="space-y-3 mt-6">
                {currentSection.nodes.map((node, index) => {
                  // Determine styles based on node status
                  const statusClass = node.completed 
                    ? 'bg-primary/10 border-primary'
                    : node.inProgress 
                      ? 'bg-blue-500/10 border-blue-500'
                      : 'bg-card border-border hover:bg-muted';
                  
                  const iconClass = node.completed
                    ? 'bg-primary text-primary-foreground'
                    : node.inProgress
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-muted-foreground';
                  
                  const isSelected = selectedTopic === node.title;
                    
                  return (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${statusClass} ${isSelected ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleTopicClick(node.title)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconClass}`}>
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
                  );
                })}
              </div>
              
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (currentSectionIndex > 0) {
                      setCurrentSectionIndex(currentSectionIndex - 1);
                      setSelectedTopic(null);
                    }
                  }}
                  disabled={currentSectionIndex === 0}
                >
                  Previous Section
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentSectionIndex < roadmap.content.sections.length - 1) {
                      setCurrentSectionIndex(currentSectionIndex + 1);
                      setSelectedTopic(null);
                    }
                  }}
                  disabled={currentSectionIndex >= roadmap.content.sections.length - 1}
                >
                  Next Section
                </Button>
              </div>
            </Card>
          </div>
          
          {/* Right side - Topic details */}
          <div>
            <Card className="p-4 h-full">
              {selectedNode ? (
                <div>
                  <Badge 
                    variant={selectedNode.completed ? 'default' : selectedNode.inProgress ? 'secondary' : 'outline'}
                    className="mb-2"
                  >
                    {selectedNode.completed ? 'Completed' : selectedNode.inProgress ? 'In Progress' : 'Not Started'}
                  </Badge>
                  
                  <h2 className="text-xl font-bold mb-2">{selectedNode.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    From section: {currentSection.title}
                  </p>
                  
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium mb-3">Resources</h3>
                    <p className="text-muted-foreground">
                      No learning resources available for this topic yet.
                    </p>
                    
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(`${roadmap.title} ${selectedNode.title} tutorial`)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Find resources online
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <h3 className="text-lg font-medium mb-2">Select a Topic</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Click on any topic from the roadmap to view its details and track your progress.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}