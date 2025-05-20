import React, { useState } from "react";
import { useParams } from "wouter";
import { Header } from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";

const RoadmapDetailPage = () => {
  const { id } = useParams();
  const [sectionIndex, setSectionIndex] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  // Fetch roadmap data
  const { data: roadmap, isLoading } = useQuery({
    queryKey: [`/api/roadmaps/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/roadmaps/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch roadmap');
      }
      return await response.json();
    },
  });
  
  // Loading state
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
  
  // Error state
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
  
  // Get current section and selected node
  const currentSection = roadmap.content.sections[sectionIndex];
  const selectedNode = selectedTopic 
    ? currentSection.nodes.find((node: any) => node.title === selectedTopic) 
    : null;
  
  // Handle clicking on a topic
  const handleTopicClick = (topicTitle: string) => {
    console.log("Clicked topic:", topicTitle);
    
    // Find the node
    const node = currentSection.nodes.find((n: any) => n.title === topicTitle);
    if (!node) return;
    
    // First, set the selected topic for UI highlighting
    setSelectedTopic(topicTitle);
    
    // Create a deep copy of the roadmap data to avoid mutation issues
    const newSections = JSON.parse(JSON.stringify(roadmap.content.sections));
    const sectionToUpdate = newSections[sectionIndex];
    
    // Find the node to update
    const nodeIndex = sectionToUpdate.nodes.findIndex((n: any) => n.title === topicTitle);
    if (nodeIndex === -1) return;
    
    // Get the current node
    const currentNode = sectionToUpdate.nodes[nodeIndex];
    
    // Determine the next state and API action based on cycling through states:
    // Not Started → In Progress → Completed → Not Started
    let nextState;
    let action;
    
    if (currentNode.completed) {
      // From completed → not started
      nextState = { completed: false, inProgress: false };
      action = 'reset'; // Custom action to reset the node
    } else if (currentNode.inProgress) {
      // From in progress → completed
      nextState = { completed: true, inProgress: false };
      action = 'complete';
    } else {
      // From not started → in progress
      nextState = { completed: false, inProgress: true };
      action = 'incomplete'; // The API uses 'incomplete' to mark in-progress
    }
    
    // Update UI immediately for a responsive experience
    sectionToUpdate.nodes[nodeIndex] = { ...currentNode, ...nextState };
    
    // Update the roadmap data in our component
    const updatedRoadmap = { ...roadmap };
    updatedRoadmap.content.sections = newSections;
    
    // Calculate new progress for progress bar
    const totalNodes = updatedRoadmap.content.sections.reduce(
      (total: number, s: any) => total + s.nodes.length, 0
    );
    
    const completedNodes = updatedRoadmap.content.sections.reduce(
      (total: number, s: any) => total + s.nodes.reduce(
        (t: number, n: any) => t + (n.completed ? 1 : 0), 0
      ), 0
    );
    
    // Make the API call to update the server
    fetch(`/api/roadmaps/${id}/progress/${encodeURIComponent(topicTitle)}/${action}`, {
      method: 'POST'
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update status on server');
      
      // Now update the progress on the server to match our local state
      return fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          roadmapId: parseInt(id || '1'),
          progress: {
            sections: updatedRoadmap.content.sections
          }
        })
      });
    })
    .then(() => {
      // Force a re-render with the updated data
      (roadmap as any).content = updatedRoadmap.content;
      setSelectedTopic(topicTitle); // This will trigger a re-render
    })
    .catch(err => {
      console.error("Error updating progress:", err);
      alert("There was an error updating your progress. Please try again.");
    });
  };
  
  // Calculate overall progress
  const totalNodes = roadmap.content.sections.reduce(
    (total: number, section: any) => total + section.nodes.length,
    0
  );
  
  const completedNodes = roadmap.content.sections.reduce(
    (total: number, section: any) => total + section.nodes.reduce(
      (total: number, node: any) => total + (node.completed ? 1 : 0),
      0
    ),
    0
  );
  
  const progressPercentage = Math.round((completedNodes / totalNodes) * 100) || 0;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{roadmap.title}</h1>
              <p className="text-muted-foreground mb-4">{roadmap.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{roadmap.type}</Badge>
                <Badge variant="outline">{roadmap.difficulty}</Badge>
                <Badge variant="outline">{roadmap.estimatedTime}</Badge>
              </div>
            </div>
            <div className="text-left md:text-right mt-4 md:mt-0">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <div className="flex items-center mt-1 mb-1 gap-2">
                <Progress value={progressPercentage} className="w-32" />
                <span className="text-sm font-medium">{progressPercentage}%</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {completedNodes} of {totalNodes} topics completed
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6">
            <div className="mb-3 sm:mb-0">
              <select 
                className="bg-background border rounded px-2 py-1"
                value={sectionIndex}
                onChange={(e) => {
                  setSectionIndex(Number(e.target.value));
                  setSelectedTopic(null);
                }}
              >
                {roadmap.content.sections.map((section: any, index: number) => (
                  <option key={index} value={index}>
                    {section.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (sectionIndex > 0) {
                    setSectionIndex(sectionIndex - 1);
                    setSelectedTopic(null);
                  }
                }}
                disabled={sectionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (sectionIndex < roadmap.content.sections.length - 1) {
                    setSectionIndex(sectionIndex + 1);
                    setSelectedTopic(null);
                  }
                }}
                disabled={sectionIndex >= roadmap.content.sections.length - 1}
              >
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Topics */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">{currentSection.title}</h2>
              {currentSection.description && (
                <p className="text-muted-foreground mb-4">{currentSection.description}</p>
              )}
              
              <div className="space-y-3 mt-6">
                {currentSection.nodes.map((node: any, index: number) => {
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
            </Card>
          </div>
          
          {/* Right column - Topic details */}
          <div>
            <Card className="p-6 h-full">
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
                  
                  {selectedNode.description && (
                    <div className="mt-4 mb-4">
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground">{selectedNode.description}</p>
                    </div>
                  )}
                  
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium mb-3">Resources</h3>
                    <p className="text-muted-foreground">
                      Learning resources will appear here when available.
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
      </main>
    </div>
  );
};

export default RoadmapDetailPage;