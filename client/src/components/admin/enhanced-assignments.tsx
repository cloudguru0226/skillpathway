import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Calendar as CalendarIcon,
  Users, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Send,
  UserPlus
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Assignment {
  id: number;
  title: string;
  description: string;
  type: "course" | "roadmap" | "lab" | "training";
  contentId: number;
  contentTitle: string;
  dueDate?: string;
  priority: "low" | "medium" | "high" | "urgent";
  isRequired: boolean;
  instructions?: string;
  assignerUserId: number;
  assignerName: string;
  createdAt: string;
  updatedAt: string;
}

interface UserAssignment {
  id: number;
  assignmentId: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: "assigned" | "in_progress" | "completed" | "overdue" | "graded";
  startedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  grade?: number;
  feedback?: string;
  progress: number;
}

interface AssignmentFormData {
  title: string;
  description: string;
  type: string;
  contentId: number;
  dueDate?: Date;
  priority: string;
  isRequired: boolean;
  instructions: string;
  maxAttempts: number;
  gradeWeight: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

export default function EnhancedAssignments() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("assignments");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkAssignDialogOpen, setIsBulkAssignDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form state
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: "",
    description: "",
    type: "",
    contentId: 0,
    dueDate: undefined,
    priority: "medium",
    isRequired: true,
    instructions: "",
    maxAttempts: 0,
    gradeWeight: 100,
  });

  // Fetch assignments
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/admin/assignments", { search: searchQuery }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        
        const res = await fetch(`/api/admin/assignments?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch assignments");
        return await res.json();
      } catch (error) {
        // Mock data for demo
        return mockAssignments.filter(assignment => 
          !searchQuery || 
          assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assignment.contentTitle.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }
  });

  // Fetch user assignments
  const { data: userAssignments, isLoading: userAssignmentsLoading } = useQuery({
    queryKey: ["/api/admin/user-assignments", { status: statusFilter }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        
        const res = await fetch(`/api/admin/user-assignments?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch user assignments");
        return await res.json();
      } catch (error) {
        // Mock data for demo
        return mockUserAssignments.filter(ua => 
          statusFilter === "all" || ua.status === statusFilter
        );
      }
    }
  });

  // Fetch users for bulk assignment
  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        return await res.json();
      } catch (error) {
        // Mock data
        return [
          { id: 2, username: "sarah_developer", email: "sarah@example.com", isAdmin: false },
          { id: 3, username: "john_learner", email: "john@example.com", isAdmin: false },
          { id: 4, username: "emma_student", email: "emma@example.com", isAdmin: false },
          { id: 5, username: "alex_engineer", email: "alex@example.com", isAdmin: false },
        ];
      }
    }
  });

  // Fetch available content for assignments
  const { data: availableContent } = useQuery({
    queryKey: ["/api/admin/content", { type: formData.type }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (formData.type) params.set("type", formData.type);
        
        const res = await fetch(`/api/admin/content?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch content");
        return await res.json();
      } catch (error) {
        // Mock content based on type
        const mockContent: any = {
          course: [
            { id: 1, title: "React Fundamentals" },
            { id: 2, title: "Advanced TypeScript" },
            { id: 3, title: "Node.js API Development" },
          ],
          roadmap: [
            { id: 1, title: "Frontend Developer Roadmap" },
            { id: 2, title: "Backend Developer Roadmap" },
            { id: 3, title: "DevOps Engineer Roadmap" },
          ],
          lab: [
            { id: 1, title: "AWS EC2 Setup Lab" },
            { id: 2, title: "Docker Fundamentals Lab" },
            { id: 3, title: "Kubernetes Basics Lab" },
          ],
          training: [
            { id: 1, title: "Security Best Practices" },
            { id: 2, title: "Git Workflow Training" },
          ]
        };
        return mockContent[formData.type] || [];
      }
    },
    enabled: !!formData.type
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (data: AssignmentFormData) => {
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create assignment");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Assignment created",
        description: "The assignment has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assignments"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Bulk assign mutation
  const bulkAssignMutation = useMutation({
    mutationFn: async ({ assignmentId, userIds }: { assignmentId: number; userIds: number[] }) => {
      const res = await fetch("/api/admin/assignments/bulk-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, userIds }),
      });
      if (!res.ok) throw new Error("Failed to assign to users");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Assignment sent",
        description: `Assignment sent to ${selectedUsers.length} users.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-assignments"] });
      setIsBulkAssignDialogOpen(false);
      setSelectedUsers([]);
      setSelectedAssignment(null);
    },
    onError: (error) => {
      toast({
        title: "Assignment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update user assignment mutation (for grading/feedback)
  const updateUserAssignmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<UserAssignment> }) => {
      const res = await fetch(`/api/admin/user-assignments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update assignment");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Assignment updated",
        description: "The assignment has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-assignments"] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "",
      contentId: 0,
      dueDate: undefined,
      priority: "medium",
      isRequired: true,
      instructions: "",
      maxAttempts: 0,
      gradeWeight: 100,
    });
  };

  const handleInputChange = (field: keyof AssignmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.contentId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createAssignmentMutation.mutate(formData);
  };

  const handleBulkAssign = () => {
    if (!selectedAssignment || selectedUsers.length === 0) {
      toast({
        title: "Selection required",
        description: "Please select an assignment and users.",
        variant: "destructive",
      });
      return;
    }
    bulkAssignMutation.mutate({ assignmentId: selectedAssignment.id, userIds: selectedUsers });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "default";
      case "assigned": return "secondary";
      case "overdue": return "destructive";
      case "graded": return "default";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "assigned": return <Clock className="h-4 w-4" />;
      case "overdue": return <AlertCircle className="h-4 w-4" />;
      case "graded": return <CheckCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  // Mock data
  const mockAssignments: Assignment[] = [
    {
      id: 1,
      title: "React Fundamentals Assessment",
      description: "Complete the React basics course and submit final project",
      type: "course",
      contentId: 1,
      contentTitle: "React Fundamentals",
      dueDate: "2024-07-15",
      priority: "high",
      isRequired: true,
      instructions: "Complete all modules and submit the final dashboard project",
      assignerUserId: 1,
      assignerName: "Admin",
      createdAt: "2024-06-20",
      updatedAt: "2024-06-20"
    },
    {
      id: 2,
      title: "DevOps Pipeline Lab",
      description: "Set up CI/CD pipeline using GitHub Actions",
      type: "lab",
      contentId: 2,
      contentTitle: "DevOps Pipeline Lab",
      dueDate: "2024-07-30",
      priority: "medium",
      isRequired: false,
      instructions: "Follow the lab guide and document your setup process",
      assignerUserId: 1,
      assignerName: "Admin",
      createdAt: "2024-06-22",
      updatedAt: "2024-06-22"
    }
  ];

  const mockUserAssignments: UserAssignment[] = [
    {
      id: 1,
      assignmentId: 1,
      userId: 2,
      userName: "sarah_developer",
      userEmail: "sarah@example.com",
      status: "in_progress",
      startedAt: "2024-06-22",
      progress: 65
    },
    {
      id: 2,
      assignmentId: 1,
      userId: 3,
      userName: "john_learner",
      userEmail: "john@example.com",
      status: "assigned",
      progress: 0
    },
    {
      id: 3,
      assignmentId: 2,
      userId: 4,
      userName: "emma_student",
      userEmail: "emma@example.com",
      status: "completed",
      startedAt: "2024-06-23",
      completedAt: "2024-06-24",
      progress: 100,
      grade: 92
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignment Management</h2>
          <p className="text-muted-foreground">Create assignments and track learner progress</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>
                  Create a new assignment for learners
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAssignment}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Assignment title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Content Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="course">Course</SelectItem>
                          <SelectItem value="roadmap">Roadmap</SelectItem>
                          <SelectItem value="lab">Lab</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.type && (
                    <div className="space-y-2">
                      <Label htmlFor="contentId">Select Content *</Label>
                      <Select 
                        value={formData.contentId.toString()} 
                        onValueChange={(value) => handleInputChange("contentId", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select content" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableContent?.map((content: any) => (
                            <SelectItem key={content.id} value={content.id.toString()}>
                              {content.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Assignment description"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.dueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.dueDate}
                            onSelect={(date) => handleInputChange("dueDate", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isRequired"
                      checked={formData.isRequired}
                      onCheckedChange={(checked) => handleInputChange("isRequired", checked)}
                    />
                    <Label htmlFor="isRequired">Required assignment</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => handleInputChange("instructions", e.target.value)}
                      placeholder="Detailed instructions for learners"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxAttempts">Max Attempts (0 = unlimited)</Label>
                      <Input
                        id="maxAttempts"
                        type="number"
                        value={formData.maxAttempts}
                        onChange={(e) => handleInputChange("maxAttempts", parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gradeWeight">Grade Weight (%)</Label>
                      <Input
                        id="gradeWeight"
                        type="number"
                        value={formData.gradeWeight}
                        onChange={(e) => handleInputChange("gradeWeight", parseInt(e.target.value) || 100)}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAssignmentMutation.isPending}>
                    {createAssignmentMutation.isPending ? "Creating..." : "Create Assignment"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkAssignDialogOpen} onOpenChange={setIsBulkAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Bulk Assign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Assignment</DialogTitle>
                <DialogDescription>
                  Assign content to multiple users at once
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Assignment</Label>
                  <Select 
                    value={selectedAssignment?.id.toString() || ""} 
                    onValueChange={(value) => {
                      const assignment = assignments?.find((a: Assignment) => a.id === parseInt(value));
                      setSelectedAssignment(assignment || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignments?.map((assignment: Assignment) => (
                        <SelectItem key={assignment.id} value={assignment.id.toString()}>
                          {assignment.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Users</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    {users?.filter((user: User) => !user.isAdmin).map((user: User) => (
                      <div key={user.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers(prev => [...prev, user.id]);
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <Label htmlFor={`user-${user.id}`} className="text-sm font-normal">
                          {user.username} ({user.email})
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedUsers.length} user{selectedUsers.length === 1 ? "" : "s"} selected
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsBulkAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkAssign} disabled={bulkAssignMutation.isPending}>
                  {bulkAssignMutation.isPending ? "Assigning..." : "Assign to Selected Users"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="assignments">Assignments ({assignments?.length || 0})</TabsTrigger>
          <TabsTrigger value="submissions">User Progress ({userAssignments?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {assignmentsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {assignments?.map((assignment: Assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <Badge variant={getPriorityColor(assignment.priority)} className="capitalize">
                            {assignment.priority}
                          </Badge>
                          {assignment.isRequired && (
                            <Badge variant="destructive">Required</Badge>
                          )}
                        </div>
                        <CardDescription>{assignment.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Content: {assignment.contentTitle}</span>
                          <span>Type: {assignment.type}</span>
                          {assignment.dueDate && (
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Assignment
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setIsBulkAssignDialogOpen(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign to Users
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {userAssignmentsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAssignments?.map((ua: UserAssignment) => (
                    <TableRow key={ua.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ua.userName}</div>
                          <div className="text-sm text-muted-foreground">{ua.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignments?.find((a: Assignment) => a.id === ua.assignmentId)?.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ua.status)}
                          <Badge variant={getStatusColor(ua.status)} className="capitalize">
                            {ua.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{ua.progress}%</div>
                          <div className="w-20 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all" 
                              style={{ width: `${ua.progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ua.grade ? `${ua.grade}%` : "-"}
                      </TableCell>
                      <TableCell>
                        {ua.submittedAt ? new Date(ua.submittedAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              View Submission
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Add Grade
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Send Feedback
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}