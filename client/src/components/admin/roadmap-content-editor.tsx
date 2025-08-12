import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Move3D, 
  GripVertical, 
  Check, 
  Clock, 
  BookOpen,
  Target,
  Code,
  Settings,
  Save,
  X
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface RoadmapNode {
  id: string;
  title: string;
  type: "concept" | "practice" | "tool" | "framework" | "library" | "runtime" | "database" | "os" | "orchestration";
  completed: boolean;
  inProgress?: boolean;
  description?: string;
  resources?: string[];
  estimatedTime?: string;
}

interface RoadmapSection {
  title: string;
  description?: string;
  nodes: RoadmapNode[];
}

interface RoadmapContent {
  sections: RoadmapSection[];
}

interface RoadmapContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: number;
  roadmapTitle: string;
  content: RoadmapContent;
}

export default function RoadmapContentEditor({ 
  isOpen, 
  onClose, 
  roadmapId, 
  roadmapTitle, 
  content 
}: RoadmapContentEditorProps) {
  const { toast } = useToast();
  const [editingContent, setEditingContent] = useState<RoadmapContent>(content);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editingNode, setEditingNode] = useState<{ sectionIndex: number; nodeIndex: number } | null>(null);
  
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [newNodeType, setNewNodeType] = useState<RoadmapNode["type"]>("concept");
  const [newNodeDescription, setNewNodeDescription] = useState("");

  // Save roadmap content mutation
  const saveContentMutation = useMutation({
    mutationFn: async (newContent: RoadmapContent) => {
      const res = await fetch(`/api/admin/content/${roadmapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "roadmap",
          content: newContent 
        }),
      });
      if (!res.ok) throw new Error("Failed to save roadmap content");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Roadmap saved",
        description: "The roadmap content has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/roadmaps"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    
    const newSection: RoadmapSection = {
      title: newSectionTitle.trim(),
      description: newSectionDescription.trim(),
      nodes: []
    };
    
    setEditingContent(prev => ({
      sections: [...prev.sections, newSection]
    }));
    
    setNewSectionTitle("");
    setNewSectionDescription("");
  };

  const addNode = (sectionIndex: number) => {
    if (!newNodeTitle.trim()) return;
    
    const newNode: RoadmapNode = {
      id: `node-${Date.now()}-${Math.random()}`,
      title: newNodeTitle.trim(),
      type: newNodeType,
      description: newNodeDescription.trim(),
      completed: false,
      inProgress: false
    };
    
    setEditingContent(prev => ({
      sections: prev.sections.map((section, index) => 
        index === sectionIndex 
          ? { ...section, nodes: [...section.nodes, newNode] }
          : section
      )
    }));
    
    setNewNodeTitle("");
    setNewNodeType("concept");
    setNewNodeDescription("");
  };

  const deleteSection = (sectionIndex: number) => {
    if (window.confirm("Are you sure you want to delete this section? All nodes within it will be lost.")) {
      setEditingContent(prev => ({
        sections: prev.sections.filter((_, index) => index !== sectionIndex)
      }));
    }
  };

  const deleteNode = (sectionIndex: number, nodeIndex: number) => {
    setEditingContent(prev => ({
      sections: prev.sections.map((section, sIndex) => 
        sIndex === sectionIndex 
          ? { ...section, nodes: section.nodes.filter((_, nIndex) => nIndex !== nodeIndex) }
          : section
      )
    }));
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= editingContent.sections.length) return;
    
    setEditingContent(prev => {
      const newSections = [...prev.sections];
      const [movedSection] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedSection);
      return { sections: newSections };
    });
  };

  const getNodeTypeIcon = (type: RoadmapNode["type"]) => {
    switch (type) {
      case "concept": return <BookOpen className="h-4 w-4" />;
      case "practice": return <Target className="h-4 w-4" />;
      case "tool": return <Settings className="h-4 w-4" />;
      case "framework": return <Code className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getNodeTypeColor = (type: RoadmapNode["type"]) => {
    switch (type) {
      case "concept": return "bg-blue-100 text-blue-800";
      case "practice": return "bg-green-100 text-green-800";
      case "tool": return "bg-purple-100 text-purple-800";
      case "framework": return "bg-orange-100 text-orange-800";
      case "library": return "bg-pink-100 text-pink-800";
      case "runtime": return "bg-yellow-100 text-yellow-800";
      case "database": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Roadmap Content: {roadmapTitle}</DialogTitle>
          <DialogDescription>
            Manage sections and learning nodes for this roadmap. Changes will be saved when you click "Save Roadmap".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="e.g., Fundamentals, Advanced Topics"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={newSectionDescription}
                    onChange={(e) => setNewSectionDescription(e.target.value)}
                    placeholder="Brief description of this section"
                  />
                </div>
              </div>
              <Button onClick={addSection} disabled={!newSectionTitle.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </CardContent>
          </Card>

          {/* Existing Sections */}
          <div className="space-y-4">
            {editingContent.sections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        {section.description && (
                          <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveSection(sectionIndex, sectionIndex - 1)}
                        disabled={sectionIndex === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveSection(sectionIndex, sectionIndex + 1)}
                        disabled={sectionIndex === editingContent.sections.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSection(sectionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Nodes in this section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {section.nodes.map((node, nodeIndex) => (
                      <div
                        key={nodeIndex}
                        className="p-3 border rounded-lg space-y-2 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getNodeTypeIcon(node.type)}
                            <span className="font-medium text-sm">{node.title}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNode(sectionIndex, nodeIndex)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge className={`text-xs ${getNodeTypeColor(node.type)}`}>
                          {node.type}
                        </Badge>
                        {node.description && (
                          <p className="text-xs text-muted-foreground">{node.description}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Node Form */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">Node Title</Label>
                        <Input
                          size="sm"
                          value={newNodeTitle}
                          onChange={(e) => setNewNodeTitle(e.target.value)}
                          placeholder="e.g., HTML Fundamentals"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Type</Label>
                        <Select value={newNodeType} onValueChange={(value: RoadmapNode["type"]) => setNewNodeType(value)}>
                          <SelectTrigger size="sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concept">Concept</SelectItem>
                            <SelectItem value="practice">Practice</SelectItem>
                            <SelectItem value="tool">Tool</SelectItem>
                            <SelectItem value="framework">Framework</SelectItem>
                            <SelectItem value="library">Library</SelectItem>
                            <SelectItem value="runtime">Runtime</SelectItem>
                            <SelectItem value="database">Database</SelectItem>
                            <SelectItem value="os">Operating System</SelectItem>
                            <SelectItem value="orchestration">Orchestration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Description (Optional)</Label>
                        <Input
                          size="sm"
                          value={newNodeDescription}
                          onChange={(e) => setNewNodeDescription(e.target.value)}
                          placeholder="Brief description"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => addNode(sectionIndex)}
                      disabled={!newNodeTitle.trim()}
                    >
                      <Plus className="h-3 w-3 mr-2" />
                      Add Node
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => saveContentMutation.mutate(editingContent)}
            disabled={saveContentMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveContentMutation.isPending ? "Saving..." : "Save Roadmap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}