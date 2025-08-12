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
  Download
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

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

export default function EnhancedContentManager() {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<string>("");
  const [isCreateResourceDialogOpen, setIsCreateResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ContentResource | null>(null);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "link" as ContentResource["type"],
    url: "",
    content: "",
    metadata: {},
    isPublic: true
  });
  const { toast } = useToast();

  // Fetch roadmaps
  const { data: roadmaps, isLoading: isLoadingRoadmaps } = useQuery({
    queryKey: ["/api/admin/roadmaps"],
    queryFn: async () => {
      const res = await fetch("/api/admin/roadmaps");
      if (!res.ok) throw new Error("Failed to fetch roadmaps");
      return await res.json();
    }
  });

  // Fetch resources
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

  // Create resource mutation
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

  // Update resource mutation
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
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update resource: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete resource mutation
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
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete resource: ${error.message}`,
        variant: "destructive"
      });
    }
  });

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

  const handleCreateResource = () => {
    const resourceData = {
      ...newResource,
      roadmapId: selectedRoadmapId,
      sectionTitle: selectedSection || undefined,
      nodeId: selectedNode || undefined
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

  const selectedRoadmap = roadmaps?.find((r: Roadmap) => r.id === selectedRoadmapId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Content Management</h2>
          <p className="text-muted-foreground">
            Manage resources, attachments, and content for roadmaps
          </p>
        </div>
        <Dialog open={isCreateResourceDialogOpen} onOpenChange={setIsCreateResourceDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Roadmap</Label>
                  <Select value={selectedRoadmapId?.toString() || ""} onValueChange={(value) => setSelectedRoadmapId(value ? parseInt(value) : null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All roadmaps" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All roadmaps</SelectItem>
                      {roadmaps?.map((roadmap: Roadmap) => (
                        <SelectItem key={roadmap.id} value={roadmap.id.toString()}>
                          {roadmap.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRoadmap && (
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="All sections" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All sections</SelectItem>
                        {selectedRoadmap.content.sections.map((section: any) => (
                          <SelectItem key={section.title} value={section.title}>
                            {section.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedSection && selectedRoadmap && (
                  <div className="space-y-2">
                    <Label>Node</Label>
                    <Select value={selectedNode} onValueChange={setSelectedNode}>
                      <SelectTrigger>
                        <SelectValue placeholder="All nodes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All nodes</SelectItem>
                        {selectedRoadmap.content.sections
                          .find((s: any) => s.title === selectedSection)?.nodes
                          .map((node: any) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resources Table */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingResources ? (
                <div className="text-center py-8">Loading resources...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources?.map((resource: ContentResource) => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getResourceIcon(resource.type)}
                            <span className="capitalize">{resource.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{resource.title}</div>
                            {resource.description && (
                              <div className="text-sm text-muted-foreground">
                                {resource.description.slice(0, 50)}...
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {resource.sectionTitle && (
                              <div>{resource.sectionTitle}</div>
                            )}
                            {resource.nodeId && (
                              <div className="text-muted-foreground">{resource.nodeId}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={resource.isPublic ? "default" : "secondary"}>
                            {resource.isPublic ? "Public" : "Private"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingResource(resource)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteResourceMutation.mutate(resource.id)}
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

        <TabsContent value="bulk-upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Resources</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload multiple resources at once or import from external sources
              </p>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium">Drop files here or click to upload</p>
                <p className="text-sm text-muted-foreground">
                  Supports images, videos, documents, and presentations
                </p>
                <Button className="mt-4">Choose Files</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Assignments</CardTitle>
              <p className="text-sm text-muted-foreground">
                Assign specific content and resources to users
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Assignment management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Resource Dialog */}
      <Dialog open={isCreateResourceDialogOpen} onOpenChange={setIsCreateResourceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription>
              Create a new resource to attach to roadmap content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newResource.title}
                  onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Resource title"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newResource.type} onValueChange={(value) => setNewResource(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newResource.description}
                onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Resource description"
              />
            </div>

            {newResource.type === "link" ? (
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={newResource.url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            ) : newResource.type === "code" ? (
              <div className="space-y-2">
                <Label>Code Content</Label>
                <Textarea
                  value={newResource.content}
                  onChange={(e) => setNewResource(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Paste your code here..."
                  className="font-mono"
                  rows={6}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>File URL or Content</Label>
                <Input
                  value={newResource.url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="File URL or upload reference"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateResourceDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateResource}
              disabled={createResourceMutation.isPending}
            >
              {createResourceMutation.isPending ? "Creating..." : "Create Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      {editingResource && (
        <Dialog open={!!editingResource} onOpenChange={() => setEditingResource(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editingResource.title}
                    onChange={(e) => setEditingResource(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={editingResource.type} onValueChange={(value) => setEditingResource(prev => prev ? ({ ...prev, type: value as any }) : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingResource.description || ""}
                  onChange={(e) => setEditingResource(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                />
              </div>

              {editingResource.type === "link" ? (
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={editingResource.url || ""}
                    onChange={(e) => setEditingResource(prev => prev ? ({ ...prev, url: e.target.value }) : null)}
                  />
                </div>
              ) : editingResource.type === "code" ? (
                <div className="space-y-2">
                  <Label>Code Content</Label>
                  <Textarea
                    value={editingResource.content || ""}
                    onChange={(e) => setEditingResource(prev => prev ? ({ ...prev, content: e.target.value }) : null)}
                    className="font-mono"
                    rows={6}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>File URL</Label>
                  <Input
                    value={editingResource.url || ""}
                    onChange={(e) => setEditingResource(prev => prev ? ({ ...prev, url: e.target.value }) : null)}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingResource(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateResource}
                disabled={updateResourceMutation.isPending}
              >
                {updateResourceMutation.isPending ? "Updating..." : "Update Resource"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}