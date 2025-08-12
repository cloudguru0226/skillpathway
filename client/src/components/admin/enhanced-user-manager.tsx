import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  UserPlus,
  ShieldCheck,
  ShieldX,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  CheckCircle,
  XCircle,
  Settings,
  BookOpen,
  Target,
  Calendar
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  role: string;
  profile?: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
  };
  permissions?: any;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Roadmap {
  id: number;
  title: string;
  type: string;
  difficulty: string;
}

interface Assignment {
  id: number;
  userId: number;
  roadmapId: number;
  assignedBy: number;
  priority: string;
  status: string;
  dueDate?: string;
  notes?: string;
  assignedAt: string;
}

export default function EnhancedUserManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isAssignRoadmapDialogOpen, setIsAssignRoadmapDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    isAdmin: false,
    role: "learner",
    profile: {
      name: "",
      bio: ""
    }
  });
  const [bulkAssignment, setBulkAssignment] = useState({
    roadmapIds: [] as number[],
    priority: "medium",
    dueDate: "",
    notes: ""
  });
  const { toast } = useToast();

  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    }
  });

  // Fetch roadmaps for assignment
  const { data: roadmaps } = useQuery({
    queryKey: ["/api/admin/roadmaps"],
    queryFn: async () => {
      const res = await fetch("/api/admin/roadmaps");
      if (!res.ok) throw new Error("Failed to fetch roadmaps");
      return await res.json();
    }
  });

  // Fetch assignments
  const { data: assignments } = useQuery({
    queryKey: ["/api/admin/assignments"],
    queryFn: async () => {
      const res = await fetch("/api/admin/assignments");
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return await res.json();
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsCreateUserDialogOpen(false);
      resetNewUser();
      toast({
        title: "Success",
        description: "User created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create user: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update user");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
      toast({
        title: "Success",
        description: "User updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: `Failed to update user: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Bulk assign roadmaps mutation
  const bulkAssignMutation = useMutation({
    mutationFn: async (assignmentData: any) => {
      const res = await fetch("/api/admin/assignments/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignmentData)
      });
      if (!res.ok) throw new Error("Failed to create assignments");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assignments"] });
      setIsAssignRoadmapDialogOpen(false);
      setSelectedUsers([]);
      setBulkAssignment({
        roadmapIds: [],
        priority: "medium",
        dueDate: "",
        notes: ""
      });
      toast({
        title: "Success",
        description: "Roadmaps assigned successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to assign roadmaps: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const resetNewUser = () => {
    setNewUser({
      username: "",
      email: "",
      password: "",
      isAdmin: false,
      role: "learner",
      profile: {
        name: "",
        bio: ""
      }
    });
  };

  const handleCreateUser = () => {
    createUserMutation.mutate(newUser);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      data: editingUser
    });
  };

  const handleBulkAssignment = () => {
    bulkAssignMutation.mutate({
      userIds: selectedUsers,
      roadmapIds: bulkAssignment.roadmapIds,
      options: {
        priority: bulkAssignment.priority,
        dueDate: bulkAssignment.dueDate ? new Date(bulkAssignment.dueDate) : undefined,
        notes: bulkAssignment.notes
      }
    });
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users?.filter((user: User) => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users, permissions, and content assignments
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAssignRoadmapDialogOpen} onOpenChange={setIsAssignRoadmapDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={selectedUsers.length === 0}>
                <Target className="h-4 w-4 mr-2" />
                Assign Roadmaps ({selectedUsers.length})
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="learner">Learners</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(filteredUsers.map((u: User) => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.profile?.name && (
                              <div className="text-sm text-muted-foreground">{user.profile.name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {user.isAdmin ? (
                              <ShieldCheck className="h-4 w-4 text-red-500" />
                            ) : (
                              <ShieldX className="h-4 w-4 text-gray-400" />
                            )}
                            <Badge variant={user.isAdmin ? "destructive" : "secondary"}>
                              {user.role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {user.isActive ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>{user.isActive ? "Active" : "Inactive"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : "Never"
                          }
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteUserMutation.mutate(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Assignments</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and manage roadmap assignments for users
              </p>
            </CardHeader>
            <CardContent>
              {assignments && assignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Roadmap</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Assigned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment: Assignment) => {
                      const user = users?.find((u: User) => u.id === assignment.userId);
                      const roadmap = roadmaps?.find((r: Roadmap) => r.id === assignment.roadmapId);
                      return (
                        <TableRow key={assignment.id}>
                          <TableCell>{user?.username || "Unknown"}</TableCell>
                          <TableCell>{roadmap?.title || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant={
                              assignment.priority === "high" ? "destructive" :
                              assignment.priority === "medium" ? "default" : "secondary"
                            }>
                              {assignment.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              assignment.status === "completed" ? "default" :
                              assignment.status === "in_progress" ? "secondary" : "outline"
                            }>
                              {assignment.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {assignment.dueDate 
                              ? new Date(assignment.dueDate).toLocaleDateString()
                              : "No due date"
                            }
                          </TableCell>
                          <TableCell>
                            {new Date(assignment.assignedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No assignments found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure granular permissions for different user roles
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Permission management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the learning platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={newUser.profile.name}
                  onChange={(e) => setNewUser(prev => ({ 
                    ...prev, 
                    profile: { ...prev.profile, name: e.target.value }
                  }))}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser(prev => ({ 
                    ...prev, 
                    role: value,
                    isAdmin: value === "admin"
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learner">Learner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={newUser.profile.bio}
                onChange={(e) => setNewUser(prev => ({ 
                  ...prev, 
                  profile: { ...prev.profile, bio: e.target.value }
                }))}
                placeholder="Enter bio (optional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assignment Dialog */}
      <Dialog open={isAssignRoadmapDialogOpen} onOpenChange={setIsAssignRoadmapDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Roadmaps</DialogTitle>
            <DialogDescription>
              Assign roadmaps to {selectedUsers.length} selected user(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Roadmaps</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {roadmaps?.map((roadmap: Roadmap) => (
                  <div key={roadmap.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      checked={bulkAssignment.roadmapIds.includes(roadmap.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkAssignment(prev => ({
                            ...prev,
                            roadmapIds: [...prev.roadmapIds, roadmap.id]
                          }));
                        } else {
                          setBulkAssignment(prev => ({
                            ...prev,
                            roadmapIds: prev.roadmapIds.filter(id => id !== roadmap.id)
                          }));
                        }
                      }}
                    />
                    <Label className="text-sm">{roadmap.title}</Label>
                    <Badge variant="outline" className="text-xs">
                      {roadmap.difficulty}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={bulkAssignment.priority} 
                  onValueChange={(value) => setBulkAssignment(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date (Optional)</Label>
                <Input
                  type="date"
                  value={bulkAssignment.dueDate}
                  onChange={(e) => setBulkAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={bulkAssignment.notes}
                onChange={(e) => setBulkAssignment(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Assignment notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignRoadmapDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAssignment}
              disabled={bulkAssignMutation.isPending || bulkAssignment.roadmapIds.length === 0}
            >
              {bulkAssignMutation.isPending ? "Assigning..." : "Assign Roadmaps"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={editingUser.username}
                    onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, username: e.target.value }) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={editingUser.email}
                    onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, email: e.target.value }) : null)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Inactive users cannot access the platform
                  </p>
                </div>
                <Switch
                  checked={editingUser.isActive}
                  onCheckedChange={(checked) => setEditingUser(prev => prev ? ({ ...prev, isActive: checked }) : null)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Admin Privileges</Label>
                  <p className="text-sm text-muted-foreground">
                    Admins can manage content and users
                  </p>
                </div>
                <Switch
                  checked={editingUser.isAdmin}
                  onCheckedChange={(checked) => setEditingUser(prev => prev ? ({ 
                    ...prev, 
                    isAdmin: checked,
                    role: checked ? "admin" : "learner"
                  }) : null)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateUser}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}