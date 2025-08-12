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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Upload, 
  Link,
  FileText,
  Video,
  Image,
  BookOpen,
  Code,
  PlayCircle,
  FileUp,
  Download,
  Eye,
  Settings,
  ExternalLink,
  Folder,
  File,
  Clock,
  User,
  X
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface LearningMaterial {
  id: string;
  title: string;
  description?: string;
  type: "text" | "url" | "document" | "video" | "image" | "quiz" | "exercise";
  content: {
    text?: string;
    url?: string;
    fileUrl?: string;
    videoUrl?: string;
    htmlContent?: string;
  };
  metadata?: {
    duration?: number;
    difficulty?: string;
    fileSize?: string;
    author?: string;
  };
  nodeId?: string;
  sectionTitle?: string;
  order: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoadmapNode {
  id: string;
  title: string;
  description?: string;
  materials?: LearningMaterial[];
}

interface RoadmapSection {
  title: string;
  nodes: RoadmapNode[];
  materials?: LearningMaterial[];
}

interface RoadmapContentEditorProps {
  roadmapId: number;
  roadmapData: any;
  onUpdate?: () => void;
}

export default function RoadmapContentEditor({ roadmapId, roadmapData, onUpdate }: RoadmapContentEditorProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null);
  const { toast } = useToast();

  // Fetch existing materials for the roadmap
  const { data: existingMaterials, isLoading: loadingMaterials } = useQuery({
    queryKey: ["/api/admin/roadmap-materials", roadmapId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/roadmaps/${roadmapId}/materials`);
      if (!res.ok) throw new Error("Failed to fetch materials");
      return await res.json();
    }
  });

  // Save material mutation
  const saveMaterialMutation = useMutation({
    mutationFn: async (materialData: Partial<LearningMaterial>) => {
      const url = editingMaterial 
        ? `/api/admin/roadmaps/${roadmapId}/materials/${editingMaterial.id}`
        : `/api/admin/roadmaps/${roadmapId}/materials`;
      const method = editingMaterial ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...materialData,
          roadmapId,
          nodeId: selectedNode,
          sectionTitle: selectedSection
        })
      });
      if (!res.ok) throw new Error("Failed to save material");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roadmap-materials", roadmapId] });
      setIsAddingMaterial(false);
      setEditingMaterial(null);
      onUpdate?.();
      toast({
        title: "Success",
        description: editingMaterial ? "Material updated successfully" : "Material added successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to save material: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete material mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const res = await fetch(`/api/admin/roadmaps/${roadmapId}/materials/${materialId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete material");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roadmap-materials", roadmapId] });
      onUpdate?.();
      toast({
        title: "Success",
        description: "Material deleted successfully"
      });
    }
  });

  useEffect(() => {
    if (existingMaterials) {
      setMaterials(existingMaterials);
    }
  }, [existingMaterials]);

  const getNodeMaterials = (nodeId: string) => {
    return materials.filter(m => m.nodeId === nodeId);
  };

  const getSectionMaterials = (sectionTitle: string) => {
    return materials.filter(m => m.sectionTitle === sectionTitle && !m.nodeId);
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="h-4 w-4" />;
      case "url": return <Link className="h-4 w-4" />;
      case "document": return <File className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "image": return <Image className="h-4 w-4" />;
      case "quiz": return <BookOpen className="h-4 w-4" />;
      case "exercise": return <Code className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderRoadmapStructure = () => {
    if (!roadmapData?.sections) return null;

    return (
      <div className="space-y-6">
        {roadmapData.sections.map((section: RoadmapSection, sectionIndex: number) => (
          <Card key={sectionIndex} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Folder className="h-5 w-5" />
                  <span>{section.title}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {getSectionMaterials(section.title).length} materials
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedSection(section.title);
                      setSelectedNode(null);
                      setIsAddingMaterial(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Material
                  </Button>
                </div>
              </div>
              
              {/* Section-level materials */}
              {getSectionMaterials(section.title).length > 0 && (
                <div className="mt-3 space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Section Materials:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getSectionMaterials(section.title).map((material) => (
                      <MaterialCard
                        key={material.id}
                        material={material}
                        onEdit={() => {
                          setEditingMaterial(material);
                          setSelectedSection(section.title);
                          setSelectedNode(null);
                          setIsAddingMaterial(true);
                        }}
                        onDelete={() => deleteMaterialMutation.mutate(material.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.nodes.map((node: RoadmapNode, nodeIndex: number) => (
                  <Card key={nodeIndex} className="border border-border/50 hover:border-border transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{node.title}</h4>
                            {node.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {node.description}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedNode(node.id);
                              setSelectedSection(section.title);
                              setIsAddingMaterial(true);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Node materials */}
                        <div className="space-y-2">
                          {getNodeMaterials(node.id).map((material) => (
                            <MaterialCard
                              key={material.id}
                              material={material}
                              compact={true}
                              onEdit={() => {
                                setEditingMaterial(material);
                                setSelectedNode(node.id);
                                setSelectedSection(section.title);
                                setIsAddingMaterial(true);
                              }}
                              onDelete={() => deleteMaterialMutation.mutate(material.id)}
                            />
                          ))}
                          
                          {getNodeMaterials(node.id).length === 0 && (
                            <div className="text-center py-3 border border-dashed border-border/30 rounded text-xs text-muted-foreground">
                              No materials yet
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Editor: {roadmapData?.title}</h2>
          <p className="text-muted-foreground">Add learning materials to roadmap sections and topics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {materials.length} total materials
          </Badge>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedSection(null);
              setSelectedNode(null);
              setIsAddingMaterial(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add General Material
          </Button>
        </div>
      </div>

      {loadingMaterials ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        renderRoadmapStructure()
      )}

      {/* Add/Edit Material Dialog */}
      <MaterialDialog
        isOpen={isAddingMaterial}
        onOpenChange={setIsAddingMaterial}
        material={editingMaterial}
        selectedNode={selectedNode}
        selectedSection={selectedSection}
        onSave={(materialData) => saveMaterialMutation.mutate(materialData)}
        isLoading={saveMaterialMutation.isPending}
      />
    </div>
  );
}

// Material Card Component
function MaterialCard({ 
  material, 
  compact = false, 
  onEdit, 
  onDelete 
}: { 
  material: LearningMaterial; 
  compact?: boolean; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  return (
    <div className={`group border rounded-lg p-3 hover:bg-accent/50 transition-colors ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-start justify-between space-x-2">
        <div className="flex items-start space-x-2 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            {getMaterialIcon(material.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h5 className="font-medium truncate">{material.title}</h5>
              {material.isRequired && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
            {material.description && (
              <p className="text-muted-foreground mt-1 truncate">
                {material.description}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs capitalize">
                {material.type}
              </Badge>
              {material.metadata?.duration && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {material.metadata.duration}m
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {material.content.url && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => window.open(material.content.url, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={onEdit}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Material Dialog Component
function MaterialDialog({ 
  isOpen, 
  onOpenChange, 
  material, 
  selectedNode, 
  selectedSection, 
  onSave, 
  isLoading 
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  material: LearningMaterial | null;
  selectedNode: string | null;
  selectedSection: string | null;
  onSave: (material: Partial<LearningMaterial>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<LearningMaterial>>({
    title: "",
    description: "",
    type: "text",
    content: {},
    metadata: {},
    isRequired: false,
    order: 0
  });

  useEffect(() => {
    if (material) {
      setFormData(material);
    } else {
      setFormData({
        title: "",
        description: "",
        type: "text",
        content: {},
        metadata: {},
        isRequired: false,
        order: 0
      });
    }
  }, [material, isOpen]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateContent = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  const updateMetadata = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    if (!formData.title?.trim()) {
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {material ? "Edit Learning Material" : "Add Learning Material"}
          </DialogTitle>
          <DialogDescription>
            {selectedNode 
              ? `Adding to node: ${selectedNode}`
              : selectedSection 
                ? `Adding to section: ${selectedSection}`
                : "Adding general material"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Learning material title..."
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => updateField('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Content</SelectItem>
                  <SelectItem value="url">External URL</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief description of the learning material..."
              rows={3}
            />
          </div>

          {/* Content Fields based on Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content</CardTitle>
            </CardHeader>
            <CardContent>
              <MaterialContentEditor 
                type={formData.type!}
                content={formData.content || {}}
                onUpdate={updateContent}
              />
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.metadata?.duration || ""}
                    onChange={(e) => updateMetadata('duration', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select 
                    value={formData.metadata?.difficulty || ""} 
                    onValueChange={(value) => updateMetadata('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input
                    value={formData.metadata?.author || ""}
                    onChange={(e) => updateMetadata('author', e.target.value)}
                    placeholder="Author name..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="required"
              checked={formData.isRequired || false}
              onChange={(e) => updateField('isRequired', e.target.checked)}
            />
            <Label htmlFor="required">This material is required</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !formData.title?.trim()}>
            {isLoading ? "Saving..." : material ? "Update Material" : "Add Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Material Content Editor Component
function MaterialContentEditor({ 
  type, 
  content, 
  onUpdate 
}: { 
  type: string; 
  content: any; 
  onUpdate: (field: string, value: any) => void;
}) {
  switch (type) {
    case "text":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Text Content</Label>
            <Textarea
              value={content.text || ""}
              onChange={(e) => onUpdate('text', e.target.value)}
              placeholder="Enter text content..."
              rows={8}
            />
          </div>
          <div className="space-y-2">
            <Label>HTML Content (Optional)</Label>
            <Textarea
              value={content.htmlContent || ""}
              onChange={(e) => onUpdate('htmlContent', e.target.value)}
              placeholder="Enter HTML content for rich formatting..."
              className="font-mono text-xs"
              rows={6}
            />
          </div>
        </div>
      );

    case "url":
      return (
        <div className="space-y-2">
          <Label>URL</Label>
          <Input
            value={content.url || ""}
            onChange={(e) => onUpdate('url', e.target.value)}
            placeholder="https://example.com/resource"
            type="url"
          />
        </div>
      );

    case "document":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Document URL</Label>
            <Input
              value={content.fileUrl || ""}
              onChange={(e) => onUpdate('fileUrl', e.target.value)}
              placeholder="https://example.com/document.pdf"
            />
          </div>
          <div className="space-y-2">
            <Label>Alternative Download URL</Label>
            <Input
              value={content.url || ""}
              onChange={(e) => onUpdate('url', e.target.value)}
              placeholder="Direct download link..."
            />
          </div>
        </div>
      );

    case "video":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Video URL</Label>
            <Input
              value={content.videoUrl || ""}
              onChange={(e) => onUpdate('videoUrl', e.target.value)}
              placeholder="YouTube, Vimeo, or direct video URL"
            />
          </div>
          <div className="space-y-2">
            <Label>Video Notes/Transcript</Label>
            <Textarea
              value={content.text || ""}
              onChange={(e) => onUpdate('text', e.target.value)}
              placeholder="Video description, key points, or transcript..."
              rows={4}
            />
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input
            value={content.url || ""}
            onChange={(e) => onUpdate('url', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      );

    case "quiz":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quiz Instructions</Label>
            <Textarea
              value={content.text || ""}
              onChange={(e) => onUpdate('text', e.target.value)}
              placeholder="Instructions for completing the quiz..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Quiz URL (Optional)</Label>
            <Input
              value={content.url || ""}
              onChange={(e) => onUpdate('url', e.target.value)}
              placeholder="Link to external quiz platform"
            />
          </div>
        </div>
      );

    case "exercise":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Exercise Instructions</Label>
            <Textarea
              value={content.text || ""}
              onChange={(e) => onUpdate('text', e.target.value)}
              placeholder="Step-by-step exercise instructions..."
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label>Exercise URL (Optional)</Label>
            <Input
              value={content.url || ""}
              onChange={(e) => onUpdate('url', e.target.value)}
              placeholder="Link to coding environment or exercise platform"
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            value={content.text || ""}
            onChange={(e) => onUpdate('text', e.target.value)}
            placeholder="Enter content..."
            rows={6}
          />
        </div>
      );
  }
}

function getMaterialIcon(type: string) {
  switch (type) {
    case "text": return <FileText className="h-4 w-4" />;
    case "url": return <Link className="h-4 w-4" />;
    case "document": return <File className="h-4 w-4" />;
    case "video": return <Video className="h-4 w-4" />;
    case "image": return <Image className="h-4 w-4" />;
    case "quiz": return <BookOpen className="h-4 w-4" />;
    case "exercise": return <Code className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
}