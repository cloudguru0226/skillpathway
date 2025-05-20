import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Server, 
  Clock, 
  Tag, 
  Calendar, 
  ArrowRight, 
  Search, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Play,
  ArrowUpRight,
  RotateCcw
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";

// Lab environment type - should match the schema defined in shared/schema.ts
type LabEnvironment = {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  isActive: boolean;
  terraformVersion: string;
  providerName: string;
};

// Type for lab instance/history
type LabInstance = {
  id: number;
  userId: number;
  labId: number;
  status: 'active' | 'completed' | 'expired' | 'failed';
  createdAt: string;
  updatedAt: string;
  progress: number;
  completionDate?: string;
  notes?: string;
  lastAccessedAt: string;
  resources?: { type: string; url: string; }[];
  terraformState?: string;
};

export default function LabsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Fetch lab environments
  const { data: labs, isLoading, error } = useQuery({
    queryKey: ["/api/labs"],
    queryFn: async () => {
      // During development with fallback, return mock data
      return mockLabEnvironments;
    }
  });

  // Fetch user lab history
  const { data: labHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["/api/lab-instances"],
    queryFn: async () => {
      // Mock data for development
      return mockLabInstances;
    },
    enabled: !!user,
  });
  
  // Filter labs by difficulty and search term
  const filteredLabs = labs?.filter((lab: LabEnvironment) => {
    const difficultyMatches = difficulty === "all" || lab.difficulty === difficulty;
    const searchMatches = 
      lab.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lab.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return difficultyMatches && searchMatches;
  });
  
  // Handle filter change
  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
  };
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Terraform Labs</h1>
        <div className="flex justify-between mb-6">
          <div className="w-64">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="w-64">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Error Loading Labs</h2>
          <p>{error instanceof Error ? error.message : "An unknown error occurred"}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Get active lab instances (in progress)
  const activeLabs = labHistory?.filter((instance: LabInstance) => 
    instance.status === 'active'
  ) || [];
  
  // Get completed lab instances
  const completedLabs = labHistory?.filter((instance: LabInstance) => 
    instance.status === 'completed'
  ) || [];
  
  // Match lab instances with lab details
  const getLabDetails = (labId: number) => {
    return labs?.find((lab: LabEnvironment) => lab.id === labId) || null;
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Terraform Labs</h1>
      
      {/* Your Labs Section - Only show if user has lab history */}
      {user && labHistory && labHistory.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <History className="mr-2 h-5 w-5" />
            Your Labs
          </h2>
          
          {/* Active Labs */}
          {activeLabs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">In Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeLabs.map((instance: LabInstance) => {
                  const labDetails = getLabDetails(instance.labId);
                  if (!labDetails) return null;
                  
                  return (
                    <Card key={instance.id} className="overflow-hidden border-primary/20">
                      <div className="flex p-4">
                        <div 
                          className="h-16 w-16 rounded-md bg-cover bg-center flex-shrink-0 mr-4" 
                          style={{ 
                            backgroundImage: `url(${labDetails.imageUrl || '/placeholder-lab.jpg'})`,
                            backgroundColor: '#1e293b'
                          }}
                        />
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-base">{labDetails.name}</h4>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {Math.round(instance.progress)}% complete
                            </Badge>
                          </div>
                          <div className="mt-1 mb-2">
                            <Progress value={instance.progress} className="h-1.5" />
                          </div>
                          <div className="flex gap-x-4 mt-2">
                            <Button size="sm" variant="secondary" className="flex-1">
                              <Play className="h-3.5 w-3.5 mr-1" />
                              Continue
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              View Details
                              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Completed Labs */}
          {completedLabs.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Completed</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {completedLabs.slice(0, 3).map((instance: LabInstance) => {
                  const labDetails = getLabDetails(instance.labId);
                  if (!labDetails) return null;
                  
                  return (
                    <Card key={instance.id} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-center mb-2">
                          <div 
                            className="h-10 w-10 rounded-md bg-cover bg-center flex-shrink-0 mr-3" 
                            style={{ 
                              backgroundImage: `url(${labDetails.imageUrl || '/placeholder-lab.jpg'})`,
                              backgroundColor: '#1e293b'
                            }}
                          />
                          <div>
                            <h4 className="font-medium text-sm line-clamp-1">{labDetails.name}</h4>
                            <div className="flex items-center text-xs text-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed on {new Date(instance.completionDate || instance.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Retake
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                            View Report
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              
              {completedLabs.length > 3 && (
                <Button variant="link" className="mt-2">
                  View all {completedLabs.length} completed labs
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* All Labs Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Browse Labs</h2>
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <Select value={difficulty} onValueChange={handleDifficultyChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Labs</TabsTrigger>
                <TabsTrigger value="aws">AWS</TabsTrigger>
                <TabsTrigger value="azure">Azure</TabsTrigger>
                <TabsTrigger value="gcp">GCP</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search labs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
        </div>
        
        {/* Lab Cards */}
        {filteredLabs?.length === 0 ? (
          <div className="text-center py-12">
            <Server className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No labs found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabs?.map((lab: LabEnvironment) => {
              // Check if user has an instance of this lab
              const labInstance = labHistory?.find((instance: LabInstance) => instance.labId === lab.id);
              const isInProgress = labInstance?.status === 'active';
              const isCompleted = labInstance?.status === 'completed';
              
              return (
                <Card key={lab.id} className={`overflow-hidden flex flex-col h-full ${isInProgress ? 'border-primary/30' : ''}`}>
                  <div 
                    className="h-48 bg-cover bg-center relative" 
                    style={{ 
                      backgroundImage: `url(${lab.imageUrl || '/placeholder-lab.jpg'})`,
                      backgroundColor: '#1e293b'
                    }}
                  >
                    {isInProgress && (
                      <div className="absolute top-2 right-2 bg-primary/80 text-white text-xs py-1 px-2 rounded-full flex items-center">
                        <Play className="h-3 w-3 mr-1" /> In Progress
                      </div>
                    )}
                    {isCompleted && (
                      <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs py-1 px-2 rounded-full flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{lab.name}</CardTitle>
                      <Badge variant={
                        lab.difficulty === 'beginner' ? 'default' : 
                        lab.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                      }>
                        {lab.difficulty}
                      </Badge>
                    </div>
                    <CardDescription>{lab.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lab.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span>{lab.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Tag className="h-4 w-4" />
                      <span>{lab.providerName}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/labs/${lab.id}`}>
                      <Button className="w-full" variant={isInProgress ? "secondary" : "default"}>
                        {isInProgress ? (
                          <>
                            Continue Lab
                            <Play className="ml-2 h-4 w-4" />
                          </>
                        ) : isCompleted ? (
                          <>
                            Revisit Lab
                            <RotateCcw className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Start Lab
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data for development/fallback
const mockLabEnvironments: LabEnvironment[] = [
  {
    id: 1,
    name: "AWS S3 Static Website Hosting",
    description: "Learn how to deploy a static website using AWS S3 and CloudFront",
    difficulty: "beginner",
    estimatedTime: "30 minutes",
    tags: ["AWS", "S3", "CloudFront", "Static Website"],
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2023-01-15T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isActive: true,
    terraformVersion: "1.5.0",
    providerName: "AWS"
  },
  {
    id: 2,
    name: "Azure Kubernetes Service (AKS) Deployment",
    description: "Deploy a scalable application using Azure Kubernetes Service",
    difficulty: "intermediate",
    estimatedTime: "45 minutes",
    tags: ["Azure", "Kubernetes", "AKS", "Docker"],
    createdAt: "2023-02-20T00:00:00Z",
    updatedAt: "2023-02-20T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1646617747609-7cf323d708cc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isActive: true,
    terraformVersion: "1.5.0",
    providerName: "Azure"
  },
  {
    id: 3,
    name: "GCP Cloud Functions Event Processing",
    description: "Build a serverless event processing pipeline with GCP Cloud Functions",
    difficulty: "intermediate",
    estimatedTime: "40 minutes",
    tags: ["GCP", "Cloud Functions", "Pub/Sub", "Serverless"],
    createdAt: "2023-03-10T00:00:00Z",
    updatedAt: "2023-03-10T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1599134842279-fe807d23316e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isActive: true,
    terraformVersion: "1.5.0",
    providerName: "GCP"
  },
  {
    id: 4,
    name: "Multi-Region AWS VPC Setup",
    description: "Design and implement a multi-region VPC architecture with proper security controls",
    difficulty: "advanced",
    estimatedTime: "60 minutes",
    tags: ["AWS", "VPC", "Networking", "Security"],
    createdAt: "2023-04-05T00:00:00Z",
    updatedAt: "2023-04-05T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1639322537231-2f206e06af84?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isActive: true,
    terraformVersion: "1.5.0",
    providerName: "AWS"
  },
  {
    id: 5,
    name: "Azure App Service with Database",
    description: "Deploy a web application with Azure App Service and Azure Database for PostgreSQL",
    difficulty: "beginner",
    estimatedTime: "35 minutes",
    tags: ["Azure", "App Service", "PostgreSQL", "Web App"],
    createdAt: "2023-05-15T00:00:00Z",
    updatedAt: "2023-05-15T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isActive: true,
    terraformVersion: "1.5.0",
    providerName: "Azure"
  },
  {
    id: 6,
    name: "GCP Managed Kubernetes Engine (GKE)",
    description: "Set up a scalable and secure Kubernetes cluster on Google Cloud Platform",
    difficulty: "advanced",
    estimatedTime: "50 minutes",
    tags: ["GCP", "Kubernetes", "GKE", "DevOps"],
    createdAt: "2023-06-20T00:00:00Z",
    updatedAt: "2023-06-20T00:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    isActive: true,
    terraformVersion: "1.5.0",
    providerName: "GCP"
  }
];

// Mock lab instance data for development
const mockLabInstances: LabInstance[] = [
  {
    id: 1,
    userId: 1,
    labId: 1,
    status: 'active',
    createdAt: '2023-07-10T14:30:00Z',
    updatedAt: '2023-07-12T16:45:00Z',
    progress: 65,
    lastAccessedAt: '2023-07-12T16:45:00Z',
    resources: [
      { type: 'document', url: '/resources/labs/1/setup-guide.pdf' },
      { type: 'code', url: '/resources/labs/1/terraform-files.zip' }
    ]
  },
  {
    id: 2,
    userId: 1,
    labId: 3,
    status: 'completed',
    createdAt: '2023-06-05T09:20:00Z',
    updatedAt: '2023-06-06T11:15:00Z',
    completionDate: '2023-06-06T11:15:00Z',
    progress: 100,
    lastAccessedAt: '2023-06-06T11:15:00Z',
    notes: 'Successfully deployed serverless function with Pub/Sub triggers'
  },
  {
    id: 3,
    userId: 1,
    labId: 5,
    status: 'completed',
    createdAt: '2023-05-28T13:10:00Z',
    updatedAt: '2023-05-29T15:40:00Z',
    completionDate: '2023-05-29T15:40:00Z',
    progress: 100,
    lastAccessedAt: '2023-05-29T15:40:00Z'
  }
];