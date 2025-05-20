import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Filter, Search, Plus, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export default function AssignRoadmaps() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoadmap, setSelectedRoadmap] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all roadmaps
  const { data: roadmaps, isLoading: isLoadingRoadmaps } = useQuery({
    queryKey: ["/api/roadmaps"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/roadmaps");
        if (!res.ok) throw new Error("Failed to fetch roadmaps");
        return await res.json();
      } catch (error) {
        console.error("Error fetching roadmaps:", error);
        return [];
      }
    }
  });

  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        return await res.json();
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    }
  });

  // Fetch all roadmap assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["/api/admin/assignments"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/assignments");
        if (!res.ok) throw new Error("Failed to fetch assignments");
        return await res.json();
      } catch (error) {
        console.error("Error fetching assignments:", error);
        // Demo data for mock assignments
        return [
          { 
            id: 1, 
            userId: 1, 
            user: { username: "sarah_developer", email: "sarah@example.com" },
            roadmapId: 1, 
            roadmap: { title: "Frontend Developer" },
            assignedAt: "2023-10-15",
            progress: 65
          },
          { 
            id: 2, 
            userId: 2, 
            user: { username: "john_learner", email: "john@example.com" },
            roadmapId: 2, 
            roadmap: { title: "AWS Cloud Architect" },
            assignedAt: "2023-11-05", 
            progress: 28
          },
          { 
            id: 3, 
            userId: 3, 
            user: { username: "emma_student", email: "emma@example.com" },
            roadmapId: 3, 
            roadmap: { title: "DevOps Engineer" },
            assignedAt: "2023-12-20", 
            progress: 42
          },
          { 
            id: 4, 
            userId: 4, 
            user: { username: "alex_engineer", email: "alex@example.com" },
            roadmapId: 1, 
            roadmap: { title: "Frontend Developer" },
            assignedAt: "2024-01-10", 
            progress: 18
          }
        ];
      }
    }
  });

  // Assign a roadmap to a user
  const assignMutation = useMutation({
    mutationFn: async ({ userId, roadmapId }: { userId: number; roadmapId: number }) => {
      // In a real app, you would make an API call to assign the roadmap
      // const res = await fetch("/api/admin/assignments", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ userId, roadmapId }),
      // });
      // if (!res.ok) throw new Error("Failed to assign roadmap");
      // return await res.json();
      
      // For demo purposes, return a mock result
      return {
        id: Math.floor(Math.random() * 1000),
        userId,
        roadmapId,
        assignedAt: new Date().toISOString().split('T')[0],
        progress: 0
      };
    },
    onSuccess: () => {
      toast({
        title: "Roadmap assigned",
        description: "The roadmap has been successfully assigned to the user.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assignments"] });
      setIsDialogOpen(false);
      setSelectedRoadmap("");
      setSelectedUser("");
    },
    onError: (error) => {
      toast({
        title: "Assignment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Remove a roadmap assignment
  const removeMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      // In a real app, you would make an API call to remove the assignment
      // const res = await fetch(`/api/admin/assignments/${assignmentId}`, {
      //   method: "DELETE",
      // });
      // if (!res.ok) throw new Error("Failed to remove assignment");
      // return assignmentId;
      
      // For demo purposes, return the assignmentId
      return assignmentId;
    },
    onSuccess: (assignmentId) => {
      toast({
        title: "Assignment removed",
        description: "The roadmap assignment has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assignments"] });
    },
    onError: (error) => {
      toast({
        title: "Removal failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle assignment creation
  const handleAssign = () => {
    if (!selectedUser || !selectedRoadmap) {
      toast({
        title: "Selection required",
        description: "Please select both a user and a roadmap.",
        variant: "destructive",
      });
      return;
    }

    assignMutation.mutate({
      userId: parseInt(selectedUser),
      roadmapId: parseInt(selectedRoadmap)
    });
  };

  // Filter assignments by search query
  const filteredAssignments = assignments?.filter(assignment => {
    const searchLower = searchQuery.toLowerCase();
    return (
      assignment.user.username.toLowerCase().includes(searchLower) ||
      assignment.user.email.toLowerCase().includes(searchLower) ||
      assignment.roadmap.title.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (isLoadingAssignments) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Assign Roadmap
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign a Roadmap to a User</DialogTitle>
              <DialogDescription>
                Select a user and a roadmap to create an assignment.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user">Select User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users && users.length > 0 ? (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username} ({user.email})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="placeholder" disabled>
                        {isLoadingUsers ? "Loading users..." : "No users available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="roadmap">Select Roadmap</Label>
                <Select value={selectedRoadmap} onValueChange={setSelectedRoadmap}>
                  <SelectTrigger id="roadmap">
                    <SelectValue placeholder="Select a roadmap" />
                  </SelectTrigger>
                  <SelectContent>
                    {roadmaps && roadmaps.length > 0 ? (
                      roadmaps.map((roadmap) => (
                        <SelectItem key={roadmap.id} value={roadmap.id.toString()}>
                          {roadmap.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="placeholder" disabled>
                        {isLoadingRoadmaps ? "Loading roadmaps..." : "No roadmaps available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={!selectedUser || !selectedRoadmap || assignMutation.isPending}>
                {assignMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>Assign Roadmap</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Roadmap Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {searchQuery ? "No assignments matching your search." : "No roadmap assignments found."}
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roadmap</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="font-medium">{assignment.user.username}</div>
                        <div className="text-sm text-muted-foreground">{assignment.user.email}</div>
                      </TableCell>
                      <TableCell>{assignment.roadmap.title}</TableCell>
                      <TableCell>{assignment.assignedAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-[100px] bg-secondary rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${assignment.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{assignment.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMutation.mutate(assignment.id)}
                          disabled={removeMutation.isPending}
                        >
                          {removeMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="sr-only">Remove</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}