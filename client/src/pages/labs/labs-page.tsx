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
import { Server, Clock, Tag, Calendar, ArrowRight, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function LabsPage() {
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Fetch lab environments
  const { data: labs, isLoading, error } = useQuery({
    queryKey: ["/api/labs"],
    queryFn: async () => {
      // During development with fallback, return mock data
      if (process.env.NODE_ENV === "development") {
        return mockLabEnvironments;
      }
      
      try {
        const res = await fetch('/api/labs');
        if (!res.ok) throw new Error('Failed to fetch lab environments');
        return await res.json() as LabEnvironment[];
      } catch (err) {
        console.error("Error fetching lab environments:", err);
        throw err;
      }
    }
  });
  
  // Filter labs by difficulty and search term
  const filteredLabs = labs?.filter(lab => {
    const difficultyMatches = difficulty === "all" || lab.difficulty === difficulty;
    const searchMatches = 
      lab.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lab.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Terraform Labs</h1>
      
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
          
          <Tabs defaultValue="all">
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
          {filteredLabs?.map(lab => (
            <Card key={lab.id} className="overflow-hidden flex flex-col h-full">
              <div 
                className="h-48 bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url(${lab.imageUrl || '/placeholder-lab.jpg'})`,
                  backgroundColor: '#1e293b'
                }}
              />
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
                  {lab.tags.map(tag => (
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
                  <Button className="w-full">
                    Start Lab
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
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