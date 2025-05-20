import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, UserPlus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AssignRoadmaps() {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<number | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [userFilter, setUserFilter] = useState("");

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: roadmaps, isLoading: roadmapsLoading } = useQuery({
    queryKey: ["/api/roadmaps"],
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/admin/assignments"],
  });

  const assignRoadmapMutation = useMutation({
    mutationFn: async ({ userId, roadmapId }: { userId: number; roadmapId: number }) => {
      await apiRequest("POST", "/api/admin/assignments", {
        userId,
        roadmapId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Roadmap Assigned",
        description: "The roadmap has been successfully assigned to the user",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assignments"] });
      setShowAssignDialog(false);
      setSelectedUser(null);
      setSelectedRoadmap(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign roadmap: " + error.message,
        variant: "destructive",
      });
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      await apiRequest("DELETE", `/api/admin/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Assignment Removed",
        description: "The roadmap assignment has been successfully removed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assignments"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove assignment: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleAssignRoadmap = () => {
    if (selectedUser && selectedRoadmap) {
      assignRoadmapMutation.mutate({
        userId: selectedUser,
        roadmapId: selectedRoadmap,
      });
    }
  };

  const handleRemoveAssignment = (assignmentId: number) => {
    removeAssignmentMutation.mutate(assignmentId);
  };

  // Filter users based on search term
  const filteredUsers = users?.filter((user: any) => 
    user.username.toLowerCase().includes(userFilter.toLowerCase()) ||
    user.email.toLowerCase().includes(userFilter.toLowerCase())
  ) || [];

  const isLoading = usersLoading || roadmapsLoading || assignmentsLoading;

  // Determine if a user already has a roadmap assigned to avoid duplicates
  const userHasRoadmap = (userId: number, roadmapId: number) => {
    return assignments?.some((assignment: any) => 
      assignment.userId === userId && assignment.roadmapId === roadmapId
    ) || false;
  };

  // Format date for better readability
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Get user name by ID
  const getUserName = (userId: number) => {
    const user = users?.find((u: any) => u.id === userId);
    return user ? user.username : "Unknown User";
  };

  // Get roadmap title by ID
  const getRoadmapTitle = (roadmapId: number) => {
    const roadmap = roadmaps?.find((r: any) => r.id === roadmapId);
    return roadmap ? roadmap.title : "Unknown Roadmap";
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Assign Roadmaps</CardTitle>
              <CardDescription>
                Assign learning tracks to users and manage existing assignments
              </CardDescription>
            </div>
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Assign Roadmap
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Roadmap to User</DialogTitle>
                  <DialogDescription>
                    Select a user and a roadmap to create an assignment
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Select User</h4>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        className="pl-8 mb-2"
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                      />
                    </div>
                    
                    <div className="h-[200px] overflow-y-auto border rounded-md">
                      {filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No users found
                        </div>
                      ) : (
                        <div className="p-1">
                          {filteredUsers.map((user: any) => (
                            <div
                              key={user.id}
                              className={`flex items-center p-2 rounded-md ${
                                selectedUser === user.id
                                  ? "bg-primary/10"
                                  : "hover:bg-secondary/50 cursor-pointer"
                              }`}
                              onClick={() => setSelectedUser(user.id)}
                            >
                              <div className="w-6 mr-2">
                                {selectedUser === user.id && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{user.username}</div>
                                <div className="text-xs text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                              <Badge variant="secondary">{user.role}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Select Roadmap</h4>
                    <Select onValueChange={(value) => setSelectedRoadmap(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a roadmap" />
                      </SelectTrigger>
                      <SelectContent>
                        {roadmaps?.map((roadmap: any) => (
                          <SelectItem
                            key={roadmap.id}
                            value={roadmap.id.toString()}
                            disabled={selectedUser ? userHasRoadmap(selectedUser, roadmap.id) : false}
                          >
                            {roadmap.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignRoadmap}
                    disabled={!selectedUser || !selectedRoadmap}
                  >
                    Assign Roadmap
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                {assignments?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No roadmap assignments found
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments?.map((assignment: any) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {getUserName(assignment.userId)}
                      </TableCell>
                      <TableCell>{getRoadmapTitle(assignment.roadmapId)}</TableCell>
                      <TableCell>{formatDate(assignment.assignedDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="bg-secondary h-2 w-24 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full"
                              style={{
                                width: `${assignment.progress || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs">
                            {assignment.progress || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}