import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookMarked, Clock, Calendar, Award } from "lucide-react";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch user's bookmarks
  const { data: bookmarks = [] } = useQuery({
    queryKey: ["/api/bookmarks"],
    enabled: !!user,
  });
  
  // Fetch user's progress
  const { data: progress = [] } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });
  
  // Profile update schema
  const profileSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  }).refine(data => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      return false;
    }
    return true;
  }, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
  
  type ProfileFormValues = z.infer<typeof profileSchema>;
  
  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const response = await apiRequest("PUT", "/api/user", values);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      form.reset({
        username: data.username,
        email: data.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: ProfileFormValues) {
    updateProfileMutation.mutate(values);
  }
  
  if (!user) {
    return null;
  }
  
  // Calculate user stats
  const totalRoadmaps = progress.length;
  const completedRoadmaps = progress.filter((p: any) => 
    p.progress && p.progress.completed === p.progress.total
  ).length;
  const totalTopics = progress.reduce((sum: number, p: any) => 
    sum + (p.progress && p.progress.total ? p.progress.total : 0), 0
  );
  const completedTopics = progress.reduce((sum: number, p: any) => 
    sum + (p.progress && p.progress.completed ? p.progress.completed : 0), 0
  );
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <div className="flex-grow flex">
        <Sidebar />
        
        <main className="flex-grow p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and learning data</p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant={user.isAdmin ? "destructive" : "secondary"}>
                  {user.isAdmin ? "Administrator" : "Learner"}
                </Badge>
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form 
                        onSubmit={form.handleSubmit(onSubmit)} 
                        className="space-y-6"
                      >
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4">
                          <h3 className="text-sm font-medium mb-2">Account Information</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Member since: {format(new Date(user.createdAt), 'MMMM d, yyyy')}</p>
                            <p>Account Type: {user.isAdmin ? "Administrator" : "Learner"}</p>
                          </div>
                        </div>
                        
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <BookMarked className="mr-2 h-5 w-5 text-primary" />
                        Roadmaps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{totalRoadmaps}</div>
                      <p className="text-muted-foreground text-sm">
                        {completedRoadmaps} completed
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <Award className="mr-2 h-5 w-5 text-primary" />
                        Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{completedTopics}</div>
                      <p className="text-muted-foreground text-sm">
                        out of {totalTopics} total
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-primary" />
                        Joined
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {format(new Date(user.createdAt), 'MMM d')}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {format(new Date(user.createdAt), 'yyyy')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Bookmarked Roadmaps</CardTitle>
                    <CardDescription>
                      Roadmaps you've saved for later
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookmarks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        You haven't bookmarked any roadmaps yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {bookmarks.slice(0, 5).map((bookmark: any) => (
                          <div key={bookmark.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <BookMarked className="mr-2 h-5 w-5 text-primary" />
                              <span>{bookmark.roadmapTitle || `Roadmap #${bookmark.roadmapId}`}</span>
                            </div>
                            <Badge variant="outline">
                              {format(new Date(bookmark.createdAt), 'MMM d, yyyy')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form 
                        onSubmit={form.handleSubmit(onSubmit)} 
                        className="space-y-6"
                      >
                        <FormField
                          control={form.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Leave blank if you don't want to change your password
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Saving..." : "Update Password"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Delete Account</CardTitle>
                    <CardDescription>
                      Permanently delete your account and all associated data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-muted-foreground">
                      When you delete your account, all of your roadmaps, progress, and personal information will be permanently removed.
                    </p>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
