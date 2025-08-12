import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Link,
  FileText,
  Video,
  Image,
  Presentation,
  Code,
  Settings,
  Save,
  X,
  Users,
  BookOpen,
  Target,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  Folder,
  File,
  Clock,
  User,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Calendar,
  Send
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import RoadmapContentEditor from "./roadmap-content-editor";

interface ContentResource {
  id: number;
  title: string;
  description?: string;
  type: "link" | "video" | "document" | "image" | "presentation" | "code";
  url?: string;
  content?: string;
  metadata?: any;
  roadmapId?: number;
  sectionTitle?: string;
  nodeId?: string;
  createdBy: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Roadmap {
  id: number;
  title: string;
  type: string;
  difficulty: string;
  content: {
    sections: Array<{
      title: string;
      nodes: Array<{
        id: string;
        title: string;
        type: string;
      }>;
    }>;
  };
}

interface Course {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  createdAt: string;
}

interface Lab {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  estimatedTime: string;
  createdAt: string;
}

interface Training {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  estimatedTime: string;
  createdAt: string;
}

interface UserAssignment {
  id: number;
  userId: number;
  contentType: string;
  contentId: number;
  assignedBy: number;
  assignedAt: string;
  dueDate?: string;
  status: string;
  priority: string;
  notes?: string;
}

export default function UnifiedContentManager() {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<string>("all");
  const [isCreateResourceDialogOpen, setIsCreateResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ContentResource | null>(null);
  const [showRoadmapEditor, setShowRoadmapEditor] = useState<number | null>(null);
  const [isCreateContentDialogOpen, setIsCreateContentDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [selectedContentType, setSelectedContentType] = useState<string>("roadmap");
  
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "link" as ContentResource["type"],
    url: "",
    content: "",
    metadata: {},
    isPublic: true
  });

  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    type: "roadmap",
    difficulty: "beginner",
    estimatedTime: "",
    content: ""
  });

  const { toast } = useToast();

  // Fetch all content types
  const { data: roadmaps, isLoading: isLoadingRoadmaps } = useQuery({
    queryKey: ["/api/admin/roadmaps"],
    queryFn: async () => {
      const res = await fetch("/api/admin/roadmaps");
      if (!res.ok) throw new Error("Failed to fetch roadmaps");
      return await res.json();
    }
  });

  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/admin/courses"],
    queryFn: async () => {
      const res = await fetch("/api/admin/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      return await res.json();
    }
  });

  const { data: labs, isLoading: isLoadingLabs } = useQuery({
    queryKey: ["/api/admin/labs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/labs");
      if (!res.ok) throw new Error("Failed to fetch labs");
      return await res.json();
    }
  });

  const { data: trainings, isLoading: isLoadingTrainings } = useQuery({
    queryKey: ["/api/admin/trainings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/trainings");
      if (!res.ok) throw new Error("Failed to fetch trainings");
      return await res.json();
    }
  });

  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ["/api/admin/resources", selectedRoadmapId],
    queryFn: async () => {
      const url = selectedRoadmapId 
        ? `/api/admin/resources?roadmapId=${selectedRoadmapId}`
        : "/api/admin/resources";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch resources");
      return await res.json();
    }
  });

  const { data: assignments, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["/api/admin/assignments"],
    queryFn: async () => {
      const res = await fetch("/api/admin/assignments");
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return await res.json();
    }
  });

  // Content creation mutations
  const createContentMutation = useMutation({
    mutationFn: async (contentData: any) => {
      const endpoint = `/api/admin/${contentData.type}s`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData)
      });
      if (!res.ok) throw new Error(`Failed to create ${contentData.type}`);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/${variables.type}s`] });
      setIsCreateContentDialogOpen(false);
      resetNewContent();
      toast({
        title: "Success",
        description: `${variables.type.charAt(0).toUpperCase() + variables.type.slice(1)} created successfully`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create content: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ type, id, data }: { type: string; id: number; data: any }) => {
      const res = await fetch(`/api/admin/${type}s/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`Failed to update ${type}`);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/${variables.type}s`] });
      setEditingContent(null);
      toast({
        title: "Success",
        description: `${variables.type.charAt(0).toUpperCase() + variables.type.slice(1)} updated successfully`
      });
    }
  });

  const deleteContentMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      const res = await fetch(`/api/admin/${type}s/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(`Failed to delete ${type}`);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/${variables.type}s`] });
      toast({
        title: "Success",
        description: `${variables.type.charAt(0).toUpperCase() + variables.type.slice(1)} deleted successfully`
      });
    }
  });

  // Resource management mutations
  const createResourceMutation = useMutation({
    mutationFn: async (resourceData: any) => {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceData)
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] });
      setIsCreateResourceDialogOpen(false);
      resetNewResource();
      toast({
        title: "Success",
        description: "Resource created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create resource: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update resource");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] });
      setEditingResource(null);
      toast({
        title: "Success",
        description: "Resource updated successfully"
      });
    }
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete resource");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] });
      toast({
        title: "Success",
        description: "Resource deleted successfully"
      });
    }
  });

  // Helper functions
  const resetNewResource = () => {
    setNewResource({
      title: "",
      description: "",
      type: "link",
      url: "",
      content: "",
      metadata: {},
      isPublic: true
    });
  };

  const resetNewContent = () => {
    setNewContent({
      title: "",
      description: "",
      type: "roadmap",
      difficulty: "beginner",
      estimatedTime: "",
      content: ""
    });
  };

  const handleCreateResource = () => {
    const resourceData = {
      ...newResource,
      roadmapId: selectedRoadmapId,
      sectionTitle: selectedSection !== "all" ? selectedSection : undefined,
      nodeId: selectedNode !== "all" ? selectedNode : undefined
    };
    createResourceMutation.mutate(resourceData);
  };

  const handleUpdateResource = () => {
    if (!editingResource) return;
    updateResourceMutation.mutate({
      id: editingResource.id,
      data: editingResource
    });
  };

  const handleCreateContent = () => {
    createContentMutation.mutate(newContent);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "link": return <Link className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "document": return <FileText className="h-4 w-4" />;
      case "image": return <Image className="h-4 w-4" />;
      case "presentation": return <Presentation className="h-4 w-4" />;
      case "code": return <Code className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "roadmap": return <BookOpen className="h-4 w-4" />;
      case "course": return <Video className="h-4 w-4" />;
      case "lab": return <Code className="h-4 w-4" />;
      case "training": return <Target className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getAllContent = () => {
    const allContent = [];
    
    if (roadmaps) {
      allContent.push(...roadmaps.map((item: any) => ({ ...item, contentType: 'roadmap' })));
    }
    if (courses) {
      allContent.push(...courses.map((item: any) => ({ ...item, contentType: 'course' })));
    }
    if (labs) {
      allContent.push(...labs.map((item: any) => ({ ...item, contentType: 'lab' })));
    }
    if (trainings) {
      allContent.push(...trainings.map((item: any) => ({ ...item, contentType: 'training' })));
    }
    
    return allContent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const selectedRoadmap = roadmaps?.find((r: Roadmap) => r.id === selectedRoadmapId);

  // If showing roadmap editor, render that instead
  if (showRoadmapEditor) {
    const selectedRoadmapForEditor = roadmaps?.find((r: Roadmap) => r.id === showRoadmapEditor);
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowRoadmapEditor(null)}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Back to Content Manager</span>
          </Button>
          <h2 className="text-xl font-semibold">Editing: {selectedRoadmapForEditor?.title}</h2>
        </div>
        <RoadmapContentEditor
          roadmapId={showRoadmapEditor}
          roadmapData={selectedRoadmapForEditor}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/roadmaps"] });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">
            Manage all learning content, resources, and materials in one unified interface
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsCreateContentDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Content</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsCreateResourceDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Add Resource</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Library</TabsTrigger>
          <TabsTrigger value="materials">Learning Materials</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Roadmaps</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roadmaps?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Learning paths available
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Video courses created
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Labs</CardTitle>
                <Code className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{labs?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Hands-on labs available
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resources</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resources?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Learning materials
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fast access to common content management tasks
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => {
                    setNewContent({ ...newContent, type: "roadmap" });
                    setIsCreateContentDialogOpen(true);
                  }}
                >
                  <BookOpen className="h-6 w-6" />
                  <span>Create Roadmap</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => {
                    if (roadmaps && roadmaps.length > 0) {
                      setShowRoadmapEditor(roadmaps[0].id);
                    }
                  }}
                >
                  <Edit className="h-6 w-6" />
                  <span>Edit Content</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => setIsCreateResourceDialogOpen(true)}
                >
                  <Upload className="h-6 w-6" />
                  <span>Upload Resource</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Library Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content Library</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="roadmap">Roadmaps</SelectItem>
                      <SelectItem value="course">Courses</SelectItem>
                      <SelectItem value="lab">Labs</SelectItem>
                      <SelectItem value="training">Trainings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getAllContent()
                  .filter(item => selectedContentType === "all" || item.contentType === selectedContentType)
                  .map((item: any) => (
                    <div key={`${item.contentType}-${item.id}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        {getContentTypeIcon(item.contentType)}
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.description || `${item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)} content`}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.contentType}
                            </Badge>
                            {item.difficulty && (
                              <Badge variant="secondary" className="text-xs">
                                {item.difficulty}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.contentType === "roadmap" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRoadmapEditor(item.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Materials
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingContent({ ...item, type: item.contentType });
                            setIsCreateContentDialogOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteContentMutation.mutate({ type: item.contentType, id: item.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Materials Tab */}
        <TabsContent value="materials" className="space-y-4">
          {/* Roadmap Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Roadmap Content Editor</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add learning materials directly to roadmap topics and sections
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Roadmap to Edit</Label>
                  <Select value={selectedRoadmapId?.toString() || ""} onValueChange={(value) => setSelectedRoadmapId(value ? parseInt(value) : null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose roadmap to edit" />
                    </SelectTrigger>
                    <SelectContent>
                      {roadmaps?.map((roadmap: Roadmap) => (
                        <SelectItem key={roadmap.id} value={roadmap.id.toString()}>
                          {roadmap.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      if (selectedRoadmapId) {
                        setShowRoadmapEditor(selectedRoadmapId);
                      }
                    }}
                    disabled={!selectedRoadmapId}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Open Content Editor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Resources */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Learning Resources</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={selectedRoadmapId?.toString() || "all"} onValueChange={(value) => setSelectedRoadmapId(value === "all" ? null : parseInt(value))}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by roadmap" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      {roadmaps?.map((roadmap: Roadmap) => (
                        <SelectItem key={roadmap.id} value={roadmap.id.toString()}>
                          {roadmap.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingResources ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : resources && resources.length > 0 ? (
                  resources.map((resource: ContentResource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        {getResourceIcon(resource.type)}
                        <div>
                          <h3 className="font-medium">{resource.title}</h3>
                          {resource.description && (
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {resource.type}
                            </Badge>
                            {resource.isPublic && (
                              <Badge variant="secondary" className="text-xs">
                                Public
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {resource.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingResource(resource);
                            setIsCreateResourceDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteResourceMutation.mutate(resource.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No resources found</p>
                    <p className="text-sm mt-1">Create your first learning resource</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Assignments</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage user assignments and track progress
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingAssignments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : assignments && assignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment: UserAssignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>User {assignment.userId}</TableCell>
                        <TableCell>{assignment.contentType} #{assignment.contentId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {assignment.contentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={assignment.priority === 'high' ? 'destructive' : assignment.priority === 'medium' ? 'default' : 'secondary'}>
                            {assignment.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No assignments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Roadmaps</span>
                    <Badge variant="secondary">85% completion</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Courses</span>
                    <Badge variant="secondary">72% completion</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Labs</span>
                    <Badge variant="secondary">91% completion</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm">Frontend Developer</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4" />
                    <span className="text-sm">React Fundamentals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">JavaScript Basics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>5 new roadmaps created this week</p>
                  <p>23 resources added</p>
                  <p>12 assignments completed</p>
                  <p>8 new user enrollments</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Content Dialog */}
      <Dialog open={isCreateContentDialogOpen} onOpenChange={setIsCreateContentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? `Edit ${editingContent.type}` : "Create New Content"}
            </DialogTitle>
            <DialogDescription>
              {editingContent ? "Update the content details" : "Choose the type of content to create"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select 
                value={editingContent?.type || newContent.type} 
                onValueChange={(value) => editingContent ? 
                  setEditingContent({ ...editingContent, type: value }) : 
                  setNewContent({ ...newContent, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roadmap">Roadmap</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingContent?.title || newContent.title}
                  onChange={(e) => editingContent ? 
                    setEditingContent({ ...editingContent, title: e.target.value }) :
                    setNewContent({ ...newContent, title: e.target.value })
                  }
                  placeholder="Content title..."
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select 
                  value={editingContent?.difficulty || newContent.difficulty}
                  onValueChange={(value) => editingContent ?
                    setEditingContent({ ...editingContent, difficulty: value }) :
                    setNewContent({ ...newContent, difficulty: value })
                  }
                >
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
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingContent?.description || newContent.description}
                onChange={(e) => editingContent ?
                  setEditingContent({ ...editingContent, description: e.target.value }) :
                  setNewContent({ ...newContent, description: e.target.value })
                }
                placeholder="Describe the content and what learners will gain..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Estimated Time</Label>
              <Input
                value={editingContent?.estimatedTime || newContent.estimatedTime}
                onChange={(e) => editingContent ?
                  setEditingContent({ ...editingContent, estimatedTime: e.target.value }) :
                  setNewContent({ ...newContent, estimatedTime: e.target.value })
                }
                placeholder="e.g., 2 hours, 3 days, 1 week"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateContentDialogOpen(false);
              setEditingContent(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingContent ? 
                () => updateContentMutation.mutate({ 
                  type: editingContent.type, 
                  id: editingContent.id, 
                  data: editingContent 
                }) : 
                handleCreateContent
              }
              disabled={createContentMutation.isPending || updateContentMutation.isPending}
            >
              {createContentMutation.isPending || updateContentMutation.isPending ? "Saving..." : 
               editingContent ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Resource Dialog */}
      <Dialog open={isCreateResourceDialogOpen} onOpenChange={setIsCreateResourceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? "Edit Resource" : "Add Learning Resource"}
            </DialogTitle>
            <DialogDescription>
              Add materials that support learning objectives
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingResource?.title || newResource.title}
                  onChange={(e) => editingResource ? 
                    setEditingResource({ ...editingResource, title: e.target.value }) :
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                  placeholder="Resource title..."
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={editingResource?.type || newResource.type}
                  onValueChange={(value: any) => editingResource ?
                    setEditingResource({ ...editingResource, type: value }) :
                    setNewResource({ ...newResource, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">External Link</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="code">Code Sample</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingResource?.description || newResource.description}
                onChange={(e) => editingResource ?
                  setEditingResource({ ...editingResource, description: e.target.value }) :
                  setNewResource({ ...newResource, description: e.target.value })
                }
                placeholder="Describe what this resource contains..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={editingResource?.url || newResource.url}
                onChange={(e) => editingResource ?
                  setEditingResource({ ...editingResource, url: e.target.value }) :
                  setNewResource({ ...newResource, url: e.target.value })
                }
                placeholder="https://example.com/resource"
                type="url"
              />
            </div>

            {(editingResource?.type === "code" || newResource.type === "code") && (
              <div className="space-y-2">
                <Label>Code Content</Label>
                <Textarea
                  value={editingResource?.content || newResource.content}
                  onChange={(e) => editingResource ?
                    setEditingResource({ ...editingResource, content: e.target.value }) :
                    setNewResource({ ...newResource, content: e.target.value })
                  }
                  placeholder="Paste code example here..."
                  className="font-mono"
                  rows={6}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateResourceDialogOpen(false);
              setEditingResource(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingResource ? handleUpdateResource : handleCreateResource}
              disabled={createResourceMutation.isPending || updateResourceMutation.isPending}
            >
              {createResourceMutation.isPending || updateResourceMutation.isPending ? "Saving..." : 
               editingResource ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}