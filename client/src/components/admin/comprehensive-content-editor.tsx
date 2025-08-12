import { useState, useRef, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
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
  ChevronDown,
  ChevronRight,
  DragHandleDots2Icon,
  GripVertical,
  X,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface ContentSection {
  id: string;
  title: string;
  description?: string;
  type: "text" | "video" | "quiz" | "assignment" | "resource" | "interactive";
  content: {
    text?: string;
    html?: string;
    videoUrl?: string;
    resources?: ContentResource[];
    quiz?: QuizContent;
    assignment?: AssignmentContent;
    interactive?: InteractiveContent;
  };
  metadata?: {
    duration?: number;
    difficulty?: string;
    prerequisites?: string[];
    objectives?: string[];
  };
  order: number;
  isPublished: boolean;
}

interface ContentResource {
  id: string;
  title: string;
  type: "pdf" | "link" | "video" | "image" | "document" | "code";
  url: string;
  description?: string;
  size?: string;
  duration?: number;
}

interface QuizContent {
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore?: number;
  allowRetries?: boolean;
  showAnswers?: boolean;
}

interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  points: number;
}

interface AssignmentContent {
  title: string;
  instructions: string;
  dueDate?: string;
  submissionType: "text" | "file" | "url" | "code";
  maxPoints: number;
  rubric?: RubricCriteria[];
  allowLateSubmission?: boolean;
}

interface RubricCriteria {
  id: string;
  criterion: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

interface RubricLevel {
  name: string;
  description: string;
  points: number;
}

interface InteractiveContent {
  type: "simulation" | "coding" | "lab" | "sandbox";
  config: {
    environment?: string;
    startingCode?: string;
    instructions?: string;
    expectedOutput?: string;
    testCases?: TestCase[];
  };
}

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export default function ComprehensiveContentEditor({ contentId, contentType }: { contentId?: number; contentType: string }) {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<ContentSection | null>(null);
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [newSectionDialog, setNewSectionDialog] = useState(false);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const { toast } = useToast();

  // Auto-save functionality
  const autoSaveTimer = useRef<NodeJS.Timeout>();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch content sections
  const { data: contentData, isLoading } = useQuery({
    queryKey: ["/api/admin/content", contentId],
    queryFn: async () => {
      if (!contentId) return null;
      const res = await fetch(`/api/admin/content/${contentId}/sections`);
      if (!res.ok) throw new Error("Failed to fetch content");
      return await res.json();
    },
    enabled: !!contentId
  });

  // Save sections mutation
  const saveSectionsMutation = useMutation({
    mutationFn: async (sectionsData: ContentSection[]) => {
      const res = await fetch(`/api/admin/content/${contentId}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: sectionsData })
      });
      if (!res.ok) throw new Error("Failed to save sections");
      return await res.json();
    },
    onSuccess: () => {
      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Content sections saved successfully"
      });
    },
    onError: (error: any) => {
      setSaveStatus("unsaved");
      toast({
        title: "Error",
        description: `Failed to save sections: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && sections.length > 0) {
      setSaveStatus("saving");
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        saveSectionsMutation.mutate(sections);
      }, 2000);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [sections, hasUnsavedChanges]);

  // Load sections from API data
  useEffect(() => {
    if (contentData?.sections) {
      setSections(contentData.sections);
    }
  }, [contentData]);

  const createNewSection = (type: ContentSection["type"]) => {
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      type,
      content: getDefaultContent(type),
      order: sections.length,
      isPublished: false
    };

    setSections(prev => [...prev, newSection]);
    setSelectedSection(newSection);
    setIsEditingSection(true);
    setHasUnsavedChanges(true);
  };

  const getDefaultContent = (type: ContentSection["type"]) => {
    switch (type) {
      case "text":
        return { text: "", html: "" };
      case "video":
        return { videoUrl: "", text: "" };
      case "quiz":
        return { 
          quiz: {
            questions: [],
            timeLimit: 30,
            passingScore: 70,
            allowRetries: true,
            showAnswers: true
          }
        };
      case "assignment":
        return {
          assignment: {
            title: "",
            instructions: "",
            submissionType: "text" as const,
            maxPoints: 100,
            allowLateSubmission: false,
            rubric: []
          }
        };
      case "interactive":
        return {
          interactive: {
            type: "coding" as const,
            config: {
              environment: "javascript",
              startingCode: "// Write your code here\n",
              instructions: "",
              expectedOutput: "",
              testCases: []
            }
          }
        };
      default:
        return { resources: [] };
    }
  };

  const updateSection = (updatedSection: ContentSection) => {
    setSections(prev => prev.map(section => 
      section.id === updatedSection.id ? updatedSection : section
    ));
    setHasUnsavedChanges(true);
  };

  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
    setHasUnsavedChanges(true);
  };

  const reorderSections = (startIndex: number, endIndex: number) => {
    const result = Array.from(sections);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update order values
    const reorderedSections = result.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setSections(reorderedSections);
    setHasUnsavedChanges(true);
  };

  const duplicateSection = (section: ContentSection) => {
    const duplicated: ContentSection = {
      ...section,
      id: `section-${Date.now()}`,
      title: `${section.title} (Copy)`,
      order: sections.length,
      isPublished: false
    };
    
    setSections(prev => [...prev, duplicated]);
    setHasUnsavedChanges(true);
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "quiz": return <CheckCircle className="h-4 w-4" />;
      case "assignment": return <BookOpen className="h-4 w-4" />;
      case "resource": return <Link className="h-4 w-4" />;
      case "interactive": return <Code className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case "saved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "saving":
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
      case "unsaved":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Content Editor</h1>
          <div className="flex items-center space-x-2">
            {getSaveStatusIcon()}
            <span className="text-sm text-muted-foreground capitalize">
              {saveStatus}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          
          <Dialog open={newSectionDialog} onOpenChange={setNewSectionDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Section</DialogTitle>
                <DialogDescription>
                  Choose the type of content section to add
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: "text", label: "Text Content", icon: FileText },
                  { type: "video", label: "Video Lesson", icon: Video },
                  { type: "quiz", label: "Quiz/Assessment", icon: CheckCircle },
                  { type: "assignment", label: "Assignment", icon: BookOpen },
                  { type: "resource", label: "Resources", icon: Link },
                  { type: "interactive", label: "Interactive Lab", icon: Code }
                ].map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => {
                      createNewSection(type as ContentSection["type"]);
                      setNewSectionDialog(false);
                    }}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm">{label}</span>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Section List */}
        <div className="w-80 border-r bg-muted/30 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Content Sections ({sections.length})
            </h2>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {sections.sort((a, b) => a.order - b.order).map((section, index) => (
                <div
                  key={section.id}
                  className={`group relative p-3 rounded-lg border cursor-pointer transition-all hover:bg-background ${
                    selectedSection?.id === section.id ? "bg-background border-primary" : "bg-transparent"
                  }`}
                  onClick={() => setSelectedSection(section)}
                  draggable
                  onDragStart={() => setDraggedSection(section.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedSection && draggedSection !== section.id) {
                      const draggedIndex = sections.findIndex(s => s.id === draggedSection);
                      reorderSections(draggedIndex, index);
                      setDraggedSection(null);
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSectionIcon(section.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium truncate">
                          {section.title}
                        </h3>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateSection(section);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSection(section.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground capitalize">
                          {section.type}
                        </span>
                        <Badge 
                          variant={section.isPublished ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {section.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  </div>
                </div>
              ))}
              
              {sections.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No sections yet</p>
                  <p className="text-xs mt-1">Click "Add Section" to get started</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedSection ? (
            <ContentSectionEditor
              section={selectedSection}
              onUpdate={updateSection}
              previewMode={previewMode}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a section to edit</h3>
                <p className="text-sm">Choose a content section from the left sidebar to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Content Section Editor Component
function ContentSectionEditor({ 
  section, 
  onUpdate, 
  previewMode = false 
}: { 
  section: ContentSection; 
  onUpdate: (section: ContentSection) => void;
  previewMode?: boolean;
}) {
  const updateField = (field: string, value: any) => {
    const updatedSection = { ...section };
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedSection.content = {
        ...updatedSection.content,
        [parent]: {
          ...updatedSection.content[parent as keyof typeof updatedSection.content],
          [child]: value
        }
      };
    } else if (field === 'content') {
      updatedSection.content = { ...updatedSection.content, ...value };
    } else {
      (updatedSection as any)[field] = value;
    }
    onUpdate(updatedSection);
  };

  if (previewMode) {
    return <SectionPreview section={section} />;
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="p-6 border-b">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getSectionIcon(section.type)}
              <div>
                <Input
                  value={section.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="text-lg font-medium border-none p-0 h-auto bg-transparent"
                  placeholder="Section title..."
                />
                <Input
                  value={section.description || ""}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="text-sm text-muted-foreground border-none p-0 h-auto bg-transparent mt-1"
                  placeholder="Section description (optional)..."
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={section.isPublished}
                onCheckedChange={(checked) => updateField('isPublished', checked)}
              />
              <Label className="text-sm">Published</Label>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          <SectionContentEditor section={section} onUpdate={updateField} />
        </div>
      </ScrollArea>
    </div>
  );
}

// Section Content Editor based on type
function SectionContentEditor({ 
  section, 
  onUpdate 
}: { 
  section: ContentSection; 
  onUpdate: (field: string, value: any) => void;
}) {
  switch (section.type) {
    case "text":
      return <TextContentEditor content={section.content} onUpdate={onUpdate} />;
    case "video":
      return <VideoContentEditor content={section.content} onUpdate={onUpdate} />;
    case "quiz":
      return <QuizContentEditor content={section.content} onUpdate={onUpdate} />;
    case "assignment":
      return <AssignmentContentEditor content={section.content} onUpdate={onUpdate} />;
    case "resource":
      return <ResourceContentEditor content={section.content} onUpdate={onUpdate} />;
    case "interactive":
      return <InteractiveContentEditor content={section.content} onUpdate={onUpdate} />;
    default:
      return <div>Content editor for {section.type} coming soon...</div>;
  }
}

// Text Content Editor
function TextContentEditor({ 
  content, 
  onUpdate 
}: { 
  content: any; 
  onUpdate: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Rich Text Content</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Create rich text content with formatting, links, and media
        </p>
        <Textarea
          value={content.text || ""}
          onChange={(e) => onUpdate('content', { text: e.target.value })}
          placeholder="Enter your content here... You can use Markdown formatting."
          className="min-h-[400px] font-mono"
        />
      </div>
      
      <div>
        <Label className="text-sm font-medium">HTML Content (Advanced)</Label>
        <Textarea
          value={content.html || ""}
          onChange={(e) => onUpdate('content', { html: e.target.value })}
          placeholder="Enter HTML content for advanced formatting..."
          className="min-h-[200px] font-mono text-xs"
        />
      </div>
    </div>
  );
}

// Video Content Editor
function VideoContentEditor({ 
  content, 
  onUpdate 
}: { 
  content: any; 
  onUpdate: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Video URL</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Add YouTube, Vimeo, or direct video file URLs
        </p>
        <Input
          value={content.videoUrl || ""}
          onChange={(e) => onUpdate('content', { videoUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=... or video file URL"
        />
      </div>
      
      <div>
        <Label className="text-base font-medium">Video Transcript / Notes</Label>
        <Textarea
          value={content.text || ""}
          onChange={(e) => onUpdate('content', { text: e.target.value })}
          placeholder="Video transcript, key points, or additional notes..."
          className="min-h-[300px]"
        />
      </div>

      {content.videoUrl && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <Label className="text-sm font-medium">Preview</Label>
          <div className="mt-2 aspect-video bg-black rounded flex items-center justify-center">
            <PlayCircle className="h-16 w-16 text-white/50" />
          </div>
        </div>
      )}
    </div>
  );
}

// Quiz Content Editor
function QuizContentEditor({ 
  content, 
  onUpdate 
}: { 
  content: any; 
  onUpdate: (field: string, value: any) => void;
}) {
  const quiz = content.quiz || { questions: [], timeLimit: 30, passingScore: 70, allowRetries: true };
  
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      type: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 10
    };
    
    onUpdate('content', { 
      quiz: { 
        ...quiz, 
        questions: [...quiz.questions, newQuestion] 
      } 
    });
  };

  const updateQuestion = (index: number, updatedQuestion: QuizQuestion) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index] = updatedQuestion;
    onUpdate('content', { quiz: { ...quiz, questions: updatedQuestions } });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Time Limit (minutes)</Label>
          <Input
            type="number"
            value={quiz.timeLimit}
            onChange={(e) => onUpdate('content', { quiz: { ...quiz, timeLimit: parseInt(e.target.value) } })}
          />
        </div>
        <div>
          <Label>Passing Score (%)</Label>
          <Input
            type="number"
            value={quiz.passingScore}
            onChange={(e) => onUpdate('content', { quiz: { ...quiz, passingScore: parseInt(e.target.value) } })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={quiz.allowRetries}
            onCheckedChange={(checked) => onUpdate('content', { quiz: { ...quiz, allowRetries: checked } })}
          />
          <Label>Allow Retries</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={quiz.showAnswers}
            onCheckedChange={(checked) => onUpdate('content', { quiz: { ...quiz, showAnswers: checked } })}
          />
          <Label>Show Answers After Completion</Label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-base font-medium">Questions ({quiz.questions.length})</Label>
          <Button onClick={addQuestion} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((question: QuizQuestion, index: number) => (
            <Card key={question.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Label>Question {index + 1}</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(index, { ...question, question: e.target.value })}
                        placeholder="Enter your question..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedQuestions = quiz.questions.filter((_: any, i: number) => i !== index);
                        onUpdate('content', { quiz: { ...quiz, questions: updatedQuestions } });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {question.type === "multiple_choice" && (
                    <div className="space-y-2">
                      <Label>Answer Options</Label>
                      {question.options?.map((option: string, optionIndex: number) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(index, { ...question, correctAnswer: optionIndex })}
                          />
                          <Input
                            value={option}
                            onChange={(e) => {
                              const updatedOptions = [...(question.options || [])];
                              updatedOptions[optionIndex] = e.target.value;
                              updateQuestion(index, { ...question, options: updatedOptions });
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(index, { ...question, points: parseInt(e.target.value) })}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Assignment Content Editor
function AssignmentContentEditor({ 
  content, 
  onUpdate 
}: { 
  content: any; 
  onUpdate: (field: string, value: any) => void;
}) {
  const assignment = content.assignment || {
    title: "",
    instructions: "",
    submissionType: "text",
    maxPoints: 100,
    allowLateSubmission: false,
    rubric: []
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Assignment Title</Label>
        <Input
          value={assignment.title}
          onChange={(e) => onUpdate('content', { assignment: { ...assignment, title: e.target.value } })}
          placeholder="Assignment title..."
        />
      </div>

      <div>
        <Label className="text-base font-medium">Instructions</Label>
        <Textarea
          value={assignment.instructions}
          onChange={(e) => onUpdate('content', { assignment: { ...assignment, instructions: e.target.value } })}
          placeholder="Detailed assignment instructions..."
          className="min-h-[200px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Submission Type</Label>
          <Select 
            value={assignment.submissionType} 
            onValueChange={(value) => onUpdate('content', { assignment: { ...assignment, submissionType: value } })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Response</SelectItem>
              <SelectItem value="file">File Upload</SelectItem>
              <SelectItem value="url">URL Submission</SelectItem>
              <SelectItem value="code">Code Submission</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Maximum Points</Label>
          <Input
            type="number"
            value={assignment.maxPoints}
            onChange={(e) => onUpdate('content', { assignment: { ...assignment, maxPoints: parseInt(e.target.value) } })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={assignment.allowLateSubmission}
          onCheckedChange={(checked) => onUpdate('content', { assignment: { ...assignment, allowLateSubmission: checked } })}
        />
        <Label>Allow Late Submissions</Label>
      </div>

      <div>
        <Label>Due Date (Optional)</Label>
        <Input
          type="datetime-local"
          value={assignment.dueDate || ""}
          onChange={(e) => onUpdate('content', { assignment: { ...assignment, dueDate: e.target.value } })}
        />
      </div>
    </div>
  );
}

// Resource Content Editor
function ResourceContentEditor({ 
  content, 
  onUpdate 
}: { 
  content: any; 
  onUpdate: (field: string, value: any) => void;
}) {
  const resources = content.resources || [];

  const addResource = () => {
    const newResource: ContentResource = {
      id: `resource-${Date.now()}`,
      title: "",
      type: "link",
      url: "",
      description: ""
    };
    
    onUpdate('content', { resources: [...resources, newResource] });
  };

  const updateResource = (index: number, updatedResource: ContentResource) => {
    const updatedResources = [...resources];
    updatedResources[index] = updatedResource;
    onUpdate('content', { resources: updatedResources });
  };

  const deleteResource = (index: number) => {
    const updatedResources = resources.filter((_: any, i: number) => i !== index);
    onUpdate('content', { resources: updatedResources });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Learning Resources</Label>
        <Button onClick={addResource} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="space-y-4">
        {resources.map((resource: ContentResource, index: number) => (
          <Card key={resource.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={resource.title}
                          onChange={(e) => updateResource(index, { ...resource, title: e.target.value })}
                          placeholder="Resource title"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select 
                          value={resource.type} 
                          onValueChange={(value: any) => updateResource(index, { ...resource, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF Document</SelectItem>
                            <SelectItem value="link">External Link</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="code">Code Sample</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>URL / File Path</Label>
                      <Input
                        value={resource.url}
                        onChange={(e) => updateResource(index, { ...resource, url: e.target.value })}
                        placeholder="https://... or file path"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={resource.description || ""}
                        onChange={(e) => updateResource(index, { ...resource, description: e.target.value })}
                        placeholder="Brief description of the resource..."
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteResource(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {resources.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No resources added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Interactive Content Editor
function InteractiveContentEditor({ 
  content, 
  onUpdate 
}: { 
  content: any; 
  onUpdate: (field: string, value: any) => void;
}) {
  const interactive = content.interactive || {
    type: "coding",
    config: {
      environment: "javascript",
      startingCode: "",
      instructions: "",
      expectedOutput: "",
      testCases: []
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Interactive Type</Label>
        <Select 
          value={interactive.type} 
          onValueChange={(value) => onUpdate('content', { interactive: { ...interactive, type: value } })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="coding">Coding Exercise</SelectItem>
            <SelectItem value="simulation">Simulation</SelectItem>
            <SelectItem value="lab">Virtual Lab</SelectItem>
            <SelectItem value="sandbox">Sandbox Environment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Programming Language / Environment</Label>
        <Select 
          value={interactive.config.environment} 
          onValueChange={(value) => onUpdate('content', { 
            interactive: { 
              ...interactive, 
              config: { ...interactive.config, environment: value } 
            } 
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="html">HTML/CSS</SelectItem>
            <SelectItem value="sql">SQL</SelectItem>
            <SelectItem value="bash">Bash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Instructions</Label>
        <Textarea
          value={interactive.config.instructions || ""}
          onChange={(e) => onUpdate('content', { 
            interactive: { 
              ...interactive, 
              config: { ...interactive.config, instructions: e.target.value } 
            } 
          })}
          placeholder="Instructions for the interactive exercise..."
          className="min-h-[100px]"
        />
      </div>

      <div>
        <Label>Starting Code</Label>
        <Textarea
          value={interactive.config.startingCode || ""}
          onChange={(e) => onUpdate('content', { 
            interactive: { 
              ...interactive, 
              config: { ...interactive.config, startingCode: e.target.value } 
            } 
          })}
          placeholder="Initial code that students will see..."
          className="min-h-[200px] font-mono"
        />
      </div>

      <div>
        <Label>Expected Output</Label>
        <Textarea
          value={interactive.config.expectedOutput || ""}
          onChange={(e) => onUpdate('content', { 
            interactive: { 
              ...interactive, 
              config: { ...interactive.config, expectedOutput: e.target.value } 
            } 
          })}
          placeholder="Expected output or solution description..."
          className="min-h-[100px] font-mono"
        />
      </div>
    </div>
  );
}

// Section Preview Component
function SectionPreview({ section }: { section: ContentSection }) {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{section.title}</h1>
          {section.description && (
            <p className="text-muted-foreground">{section.description}</p>
          )}
        </div>

        <div className="prose prose-sm max-w-none">
          {section.type === "text" && (
            <div>
              {section.content.text && (
                <div className="whitespace-pre-wrap">{section.content.text}</div>
              )}
              {section.content.html && (
                <div dangerouslySetInnerHTML={{ __html: section.content.html }} />
              )}
            </div>
          )}

          {section.type === "video" && (
            <div>
              {section.content.videoUrl && (
                <div className="aspect-video bg-black rounded mb-4 flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-white/50" />
                </div>
              )}
              {section.content.text && (
                <div className="whitespace-pre-wrap">{section.content.text}</div>
              )}
            </div>
          )}

          {section.type === "quiz" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Quiz Preview</h3>
              {section.content.quiz?.questions?.map((question: QuizQuestion, index: number) => (
                <div key={question.id} className="mb-6 p-4 border rounded">
                  <h4 className="font-medium mb-2">Question {index + 1}</h4>
                  <p className="mb-3">{question.question}</p>
                  {question.options?.map((option: string, optionIndex: number) => (
                    <div key={optionIndex} className="flex items-center space-x-2 mb-2">
                      <input type="radio" name={`preview-${question.id}`} disabled />
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getSectionIcon(type: string) {
  switch (type) {
    case "text": return <FileText className="h-4 w-4" />;
    case "video": return <Video className="h-4 w-4" />;
    case "quiz": return <CheckCircle className="h-4 w-4" />;
    case "assignment": return <BookOpen className="h-4 w-4" />;
    case "resource": return <Link className="h-4 w-4" />;
    case "interactive": return <Code className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
}