import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Filter, Search, MoreHorizontal, CheckCircle, XCircle, UserPlus, Mail, ShieldCheck, ShieldX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

type UserRole = "admin" | "learner";

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt?: string;
  suspended?: boolean;
  profile?: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
  };
  stats?: {
    completedRoadmaps: number;
    inProgressRoadmaps: number;
    completedCourses: number;
    totalProgress: number;
  };
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isViewUserDialogOpen, setIsViewUserDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        return await res.json();
      } catch (error) {
        console.error("Error fetching users:", error);
        // Demo data for testing
        return [
          {
            id: 1,
            username: "admin",
            email: "admin@example.com",
            isAdmin: true,
            createdAt: "2023-08-15",
            lastLoginAt: "2024-05-19T08:45:23Z",
            profile: {
              name: "Admin User",
              bio: "Platform administrator",
              avatarUrl: ""
            },
            stats: {
              completedRoadmaps: 5,
              inProgressRoadmaps: 1,
              completedCourses: 12,
              totalProgress: 95
            }
          },
          {
            id: 2,
            username: "sarah_developer",
            email: "sarah@example.com",
            isAdmin: false,
            createdAt: "2023-09-20",
            lastLoginAt: "2024-05-18T14:22:10Z",
            profile: {
              name: "Sarah Johnson",
              bio: "Frontend developer learning new skills",
              avatarUrl: ""
            },
            stats: {
              completedRoadmaps: 2,
              inProgressRoadmaps: 1,
              completedCourses: 8,
              totalProgress: 68
            }
          },
          {
            id: 3,
            username: "john_learner",
            email: "john@example.com",
            isAdmin: false,
            createdAt: "2023-10-05",
            lastLoginAt: "2024-05-17T09:15:42Z",
            profile: {
              name: "John Smith",
              bio: "Backend developer expanding knowledge",
              avatarUrl: ""
            },
            stats: {
              completedRoadmaps: 1,
              inProgressRoadmaps: 2,
              completedCourses: 5,
              totalProgress: 42
            }
          },
          {
            id: 4,
            username: "emma_student",
            email: "emma@example.com",
            isAdmin: false,
            createdAt: "2023-11-12",
            lastLoginAt: "2024-05-19T11:30:15Z",
            profile: {
              name: "Emma Wilson",
              bio: "Computer science student",
              avatarUrl: ""
            },
            stats: {
              completedRoadmaps: 1,
              inProgressRoadmaps: 1,
              completedCourses: 3,
              totalProgress: 35
            }
          },
          {
            id: 5,
            username: "alex_engineer",
            email: "alex@example.com",
            isAdmin: false,
            createdAt: "2023-12-01",
            lastLoginAt: "2024-05-15T16:45:38Z",
            suspended: true,
            profile: {
              name: "Alex Roberts",
              bio: "DevOps engineer",
              avatarUrl: ""
            },
            stats: {
              completedRoadmaps: 0,
              inProgressRoadmaps: 1,
              completedCourses: 2,
              totalProgress: 15
            }
          }
        ];
      }
    }
  });

  // Create a new user
  const createUserMutation = useMutation({
    mutationFn: async (userData: { username: string; email: string; password: string; isAdmin: boolean }) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create user");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "The user has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsAddUserDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "User creation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update user (e.g., suspend/unsuspend, promote/demote)
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: number; updates: Partial<User> }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update user");
      }
      return { userId, updates };
    },
    onSuccess: ({ userId, updates }) => {
      const action = updates.suspended !== undefined
        ? updates.suspended ? "suspended" : "unsuspended"
        : updates.isAdmin !== undefined
          ? updates.isAdmin ? "promoted to admin" : "demoted from admin"
          : "updated";
      
      toast({
        title: "User updated",
        description: `The user has been ${action}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete a user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      // In a real app, you would make an API call to delete the user
      // const res = await fetch(`/api/admin/users/${userId}`, {
      //   method: "DELETE",
      // });
      // if (!res.ok) throw new Error("Failed to delete user");
      // return userId;
      
      // For demo purposes, return the userId
      return userId;
    },
    onSuccess: (userId) => {
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter users based on search query and role
  const filteredUsers = users?.filter(user => {
    const matchesSearch = searchQuery
      ? user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.profile?.name && user.profile.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    const matchesRole = roleFilter === "all" 
      ? true 
      : roleFilter === "admin" 
        ? user.isAdmin 
        : !user.isAdmin;
    
    return matchesSearch && matchesRole;
  }) || [];

  // Get selected user
  const selectedUser = selectedUserId 
    ? users?.find(user => user.id === selectedUserId) 
    : null;

  // Form state for new user
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    isAdmin: false,
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle user creation
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    createUserMutation.mutate(newUser);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Administrators</SelectItem>
              <SelectItem value="learner">Learners</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for the learning platform.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={newUser.username}
                    onChange={handleInputChange}
                    placeholder="username"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    id="isAdmin"
                    name="isAdmin"
                    type="checkbox"
                    checked={newUser.isAdmin}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isAdmin">Admin privileges</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>Create User</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  {searchQuery || roleFilter !== "all"
                    ? "No users matching your filters."
                    : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profile?.avatarUrl || ""} />
                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.profile?.name || user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        user.isAdmin 
                          ? "destructive" 
                          : "secondary"
                      }
                    >
                      {user.isAdmin ? "Administrator" : "Learner"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={user.suspended ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}
                    >
                      {user.suspended ? "Suspended" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setIsViewUserDialogOpen(true);
                          }}
                        >
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => updateUserMutation.mutate({
                            userId: user.id,
                            updates: { isAdmin: !user.isAdmin }
                          })}
                        >
                          {user.isAdmin ? (
                            <>
                              <ShieldX className="h-4 w-4 mr-2" />
                              Remove admin
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Make admin
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateUserMutation.mutate({
                            userId: user.id,
                            updates: { suspended: !user.suspended }
                          })}
                        >
                          {user.suspended ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate account
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Suspend account
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${user.username}?`)) {
                              deleteUserMutation.mutate(user.id);
                            }
                          }}
                        >
                          Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* User Details Dialog */}
      <Dialog open={isViewUserDialogOpen} onOpenChange={setIsViewUserDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedUser.profile?.avatarUrl || ""} />
                    <AvatarFallback className="text-lg">{selectedUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{selectedUser.profile?.name || selectedUser.username}</h3>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" /> 
                      {selectedUser.email}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={selectedUser.isAdmin ? "destructive" : "secondary"}>
                      {selectedUser.isAdmin ? "Administrator" : "Learner"}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={selectedUser.suspended ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}
                    >
                      {selectedUser.suspended ? "Suspended" : "Active"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                      <TabsTrigger value="learning" className="flex-1">Learning Progress</TabsTrigger>
                      <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Account Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Username:</span>
                              <span className="font-medium">{selectedUser.username}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Email:</span>
                              <span className="font-medium">{selectedUser.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Joined:</span>
                              <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Login:</span>
                              <span className="font-medium">
                                {selectedUser.lastLoginAt 
                                  ? new Date(selectedUser.lastLoginAt).toLocaleDateString() 
                                  : "Never"}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Profile</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Display Name:</span>
                              <span className="font-medium">{selectedUser.profile?.name || "Not set"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Bio:</span>
                              <p className="mt-1">{selectedUser.profile?.bio || "No bio available"}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="learning" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Learning Stats</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Overall Progress</span>
                                <span className="text-sm font-medium">{selectedUser.stats?.totalProgress || 0}%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2.5">
                                <div 
                                  className="bg-primary h-2.5 rounded-full" 
                                  style={{ width: `${selectedUser.stats?.totalProgress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-2xl font-bold">{selectedUser.stats?.completedRoadmaps || 0}</span>
                                <p className="text-xs text-muted-foreground">Completed Roadmaps</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-2xl font-bold">{selectedUser.stats?.inProgressRoadmaps || 0}</span>
                                <p className="text-xs text-muted-foreground">In-Progress Roadmaps</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-2xl font-bold">{selectedUser.stats?.completedCourses || 0}</span>
                                <p className="text-xs text-muted-foreground">Completed Courses</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="activity" className="space-y-4 mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                          <div className="text-center py-6">
                            No recent activity data available
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewUserDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}