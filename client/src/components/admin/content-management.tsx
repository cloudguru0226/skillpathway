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
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  BookOpen, 
  Target, 
  Laptop, 
  Calendar,
  Search,
  Filter,
  Copy,
  Eye,
  EyeOff,
  Upload,
  Download
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";

interface ContentItem {
  id: number;
  title: string;
  description: string;
  type: "course" | "roadmap" | "lab" | "training";
  difficulty: string;
  status: string;
  tags: string[];
  categories: string[];
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  enrollmentCount?: number;
  completionRate?: number;
}

interface ContentFormData {
  title: string;
  description: string;
  type: string;
  difficulty: string;
  status: string;
  tags: string[];
  categories: string[];
  content?: any;
  duration?: number;
  estimatedTime?: string;
}

export default function ContentManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for creating/editing content
  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    description: "",
    type: "",
    difficulty: "beginner",
    status: "draft",
    tags: [],
    categories: [],
    duration: 0,
    estimatedTime: ""
  });

  // Fetch content items
  const { data: contentItems, isLoading } = useQuery({
    queryKey: ["/api/admin/content", { search: searchQuery, status: statusFilter, type: typeFilter }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (typeFilter !== "all") params.set("type", typeFilter);

        const res = await fetch(`/api/admin/content?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch content");
        return await res.json();
      } catch (error) {
        // Mock data for demo
        return mockContentItems.filter(item => {
          const matchesSearch = !searchQuery || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus = statusFilter === "all" || item.status === statusFilter;
          const matchesType = typeFilter === "all" || item.type === typeFilter;
          return matchesSearch && matchesStatus && matchesType;
        });
      }
    }
  });

  // Create content mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create content");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Content created",
        description: "The content has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
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

  // Update content mutation
  const updateContentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ContentFormData> }) => {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update content");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Content updated",
        description: "The content has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete content");
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Content deleted",
        description: "The content has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Bulk operations
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: number[]; updates: Partial<ContentFormData> }) => {
      const res = await fetch("/api/admin/content/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, updates }),
      });
      if (!res.ok) throw new Error("Failed to update content");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Content updated",
        description: "Selected content has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      setSelectedItems([]);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "",
      difficulty: "beginner",
      status: "draft",
      tags: [],
      categories: [],
      duration: 0,
      estimatedTime: ""
    });
  };

  const handleInputChange = (field: keyof ContentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.type) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createContentMutation.mutate(formData);
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      type: item.type,
      difficulty: item.difficulty,
      status: item.status,
      tags: item.tags,
      categories: item.categories,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateContentMutation.mutate({ id: editingItem.id, data: formData });
  };

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteContentMutation.mutate(id);
    }
  };

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedItems.length === 0) return;
    bulkUpdateMutation.mutate({ ids: selectedItems, updates: { status } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "draft": return "secondary";
      case "archived": return "outline";
      default: return "outline";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course": return <BookOpen className="h-4 w-4" />;
      case "roadmap": return <Target className="h-4 w-4" />;
      case "lab": return <Laptop className="h-4 w-4" />;
      case "training": return <Calendar className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const mockContentItems: ContentItem[] = [
    {
      id: 1,
      title: "React Fundamentals",
      description: "Learn the basics of React development",
      type: "course",
      difficulty: "beginner",
      status: "published",
      tags: ["react", "javascript", "frontend"],
      categories: ["Frontend Development"],
      createdAt: "2024-05-01",
      updatedAt: "2024-06-20",
      creatorId: 1,
      enrollmentCount: 1250,
      completionRate: 78
    },
    {
      id: 2,
      title: "Frontend Developer Roadmap",
      description: "Complete learning path for frontend development",
      type: "roadmap",
      difficulty: "intermediate",
      status: "published",
      tags: ["frontend", "html", "css", "javascript"],
      categories: ["Frontend Development"],
      createdAt: "2024-04-15",
      updatedAt: "2024-06-18",
      creatorId: 1,
      enrollmentCount: 850,
      completionRate: 65
    },
    {
      id: 3,
      title: "AWS EC2 Setup",
      description: "Hands-on AWS EC2 configuration lab",
      type: "lab",
      difficulty: "intermediate",
      status: "published",
      tags: ["aws", "cloud", "ec2"],
      categories: ["Cloud Computing"],
      createdAt: "2024-05-10",
      updatedAt: "2024-06-15",
      creatorId: 1,
      enrollmentCount: 420,
      completionRate: 85
    },
    {
      id: 4,
      title: "TypeScript Advanced",
      description: "Advanced TypeScript concepts and patterns",
      type: "course",
      difficulty: "advanced",
      status: "draft",
      tags: ["typescript", "javascript", "programming"],
      categories: ["Programming Languages"],
      createdAt: "2024-06-01",
      updatedAt: "2024-06-20",
      creatorId: 1
    }
  ];

  const filteredItems = contentItems?.filter(item => {
    if (activeTab !== "all" && item.type !== activeTab) return false;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">Create, edit, and manage learning content</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
              <DialogDescription>
                Add new learning content to the platform
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Content title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
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
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Content description"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(formData.type === "course" || formData.type === "lab") && (
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration || ""}
                      onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 0)}
                      placeholder="Content duration"
                    />
                  </div>
                )}

                {formData.type === "roadmap" && (
                  <div className="space-y-2">
                    <Label htmlFor="estimatedTime">Estimated Time</Label>
                    <Input
                      id="estimatedTime"
                      value={formData.estimatedTime || ""}
                      onChange={(e) => handleInputChange("estimatedTime", e.target.value)}
                      placeholder="e.g., 3-6 months"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContentMutation.isPending}>
                  {createContentMutation.isPending ? "Creating..." : "Create Content"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="course">Courses</SelectItem>
            <SelectItem value="roadmap">Roadmaps</SelectItem>
            <SelectItem value="lab">Labs</SelectItem>
            <SelectItem value="training">Trainings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedItems.length} item{selectedItems.length === 1 ? "" : "s"} selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("published")}>
                  <Eye className="h-4 w-4 mr-2" />
                  Publish
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("draft")}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Unpublish
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("archived")}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Content ({contentItems?.length || 0})</TabsTrigger>
          <TabsTrigger value="course">Courses ({contentItems?.filter(item => item.type === "course").length || 0})</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmaps ({contentItems?.filter(item => item.type === "roadmap").length || 0})</TabsTrigger>
          <TabsTrigger value="lab">Labs ({contentItems?.filter(item => item.type === "lab").length || 0})</TabsTrigger>
          <TabsTrigger value="training">Trainings ({contentItems?.filter(item => item.type === "training").length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems(filteredItems.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                      No content found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedItems(prev => [...prev, item.id]);
                            } else {
                              setSelectedItems(prev => prev.filter(id => id !== item.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                          <div className="flex gap-1">
                            {item.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.status)} className="capitalize">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{item.enrollmentCount || 0} enrolled</div>
                          {item.completionRate && (
                            <div className="text-muted-foreground">{item.completionRate}% completion</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDelete(item.id, item.title)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Update the content details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Content title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type *</Label>
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
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Content description"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateContentMutation.isPending}>
                {updateContentMutation.isPending ? "Updating..." : "Update Content"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}