import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssignRoadmap } from "@/hooks/use-admin";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface AssignRoadmapsProps {
  users?: User[];
  isLoading?: boolean;
}

export default function AssignRoadmaps({ users, isLoading }: AssignRoadmapsProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>("");
  
  const { mutate: assignRoadmap, isPending: isAssigning } = useAssignRoadmap();
  
  const { data: roadmaps, isLoading: isLoadingRoadmaps } = useQuery({
    queryKey: ["/api/roadmaps"],
    enabled: true, // Auto-fetch when component mounts
  });
  
  const handleAssignRoadmap = () => {
    if (selectedUserId && selectedRoadmapId) {
      assignRoadmap({
        userId: parseInt(selectedUserId),
        roadmapId: parseInt(selectedRoadmapId)
      });
      setSelectedRoadmapId("");
    }
  };
  
  if (isLoading || isLoadingRoadmaps) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!users || users.length === 0) {
    return (
      <div className="text-center p-6">
        <p>No users available to assign roadmaps to.</p>
      </div>
    );
  }
  
  if (!roadmaps || roadmaps.length === 0) {
    return (
      <div className="text-center p-6">
        <p>No roadmaps available to assign to users.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Roadmap to User</CardTitle>
          <CardDescription>
            Select a user and a roadmap to assign them a learning path.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="user-select" className="text-sm font-medium">
              Select User
            </label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.username} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="roadmap-select" className="text-sm font-medium">
              Select Roadmap
            </label>
            <Select 
              value={selectedRoadmapId} 
              onValueChange={setSelectedRoadmapId}
              disabled={!selectedUserId}
            >
              <SelectTrigger id="roadmap-select">
                <SelectValue placeholder="Select roadmap" />
              </SelectTrigger>
              <SelectContent>
                {roadmaps.map((roadmap: any) => (
                  <SelectItem key={roadmap.id} value={roadmap.id.toString()}>
                    {roadmap.title} ({roadmap.difficulty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleAssignRoadmap} 
            disabled={!selectedUserId || !selectedRoadmapId || isAssigning}
            className="w-full"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Roadmap"
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {selectedUserId && (
        <Card>
          <CardHeader>
            <CardTitle>User Learning Paths</CardTitle>
            <CardDescription>
              Roadmaps currently assigned to the selected user.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserRoadmaps userId={parseInt(selectedUserId)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UserRoadmaps({ userId }: { userId: number }) {
  const { data: progress, isLoading } = useQuery({
    queryKey: ["/api/progress", { userId }],
    enabled: !!userId,
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!progress || progress.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No roadmaps assigned yet.</p>;
  }
  
  return (
    <div className="space-y-2">
      {progress.map((item: any) => {
        // Calculate completion percentage
        const progressData = item.progress;
        let totalNodes = 0;
        let completedNodes = 0;
        
        if (progressData.sections) {
          progressData.sections.forEach((section: any) => {
            if (section.nodes) {
              totalNodes += section.nodes.length;
              completedNodes += section.nodes.filter((n: any) => n.completed).length;
            }
          });
        }
        
        const completionPercentage = totalNodes > 0 
          ? Math.round((completedNodes / totalNodes) * 100) 
          : 0;
        
        return (
          <div key={item.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">Roadmap #{item.roadmapId}</h4>
                <p className="text-sm text-muted-foreground">
                  Started: {new Date(item.startedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                  {completionPercentage}% Complete
                </span>
              </div>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {completedNodes} of {totalNodes} topics completed
            </div>
          </div>
        );
      })}
    </div>
  );
}