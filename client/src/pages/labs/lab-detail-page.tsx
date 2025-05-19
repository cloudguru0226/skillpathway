import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams, useRoute, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsItem, TabsList } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Clock, Tag, Calendar, Server, ArrowRight, Check, Info, FileText } from "lucide-react";

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
  prerequisites?: string[];
  objectives?: string[];
  labArchitecture?: string;
};

// Lab task type
type LabTask = {
  id: number;
  environmentId: number;
  title: string;
  description: string;
  order: number;
  points: number;
  hintText?: string;
  solutionText?: string;
};

export default function LabDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  const labId = parseInt(params.id);

  // Fetch lab details
  const { data: lab, isLoading: isLabLoading, error: labError } = useQuery({
    queryKey: [`/api/labs/${labId}`],
    queryFn: async () => {
      // During development, return mock data
      if (process.env.NODE_ENV === "development") {
        return mockLabEnvironment;
      }
      
      try {
        const res = await fetch(`/api/labs/${labId}`);
        if (!res.ok) throw new Error('Failed to fetch lab environment');
        return await res.json() as LabEnvironment;
      } catch (err) {
        console.error("Error fetching lab environment:", err);
        throw err;
      }
    }
  });
  
  // Fetch lab tasks
  const { data: tasks, isLoading: isTasksLoading, error: tasksError } = useQuery({
    queryKey: [`/api/labs/${labId}/tasks`],
    queryFn: async () => {
      // During development, return mock data
      if (process.env.NODE_ENV === "development") {
        return mockLabTasks;
      }
      
      try {
        const res = await fetch(`/api/labs/${labId}/tasks`);
        if (!res.ok) throw new Error('Failed to fetch lab tasks');
        return await res.json() as LabTask[];
      } catch (err) {
        console.error("Error fetching lab tasks:", err);
        throw err;
      }
    }
  });
  
  // Create lab instance mutation
  const createLabInstanceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/labs/${labId}/instances`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      // Redirect to the lab instance page
      setLocation(`/labs/instance/${data.id}`);
      toast({
        title: "Lab Environment Created",
        description: "Your lab environment is being provisioned. This may take a few minutes.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create lab environment",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });
  
  const handleStartLab = () => {
    createLabInstanceMutation.mutate();
  };

  // Loading state
  if (isLabLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-8 w-1/3" />
          
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="col-span-2">
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="mt-6">
                <Skeleton className="h-8 w-1/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (labError || !lab) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Error Loading Lab</h2>
          <p>{labError instanceof Error ? labError.message : "An unknown error occurred"}</p>
          <div className="flex space-x-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Link href="/labs">
              <Button variant="secondary">
                Back to Labs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-2 mb-8">
        <div className="flex items-center mb-2">
          <Link href="/labs">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Labs
            </Button>
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">{lab.name}</span>
        </div>
        <h1 className="text-3xl font-bold">{lab.name}</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant={
            lab.difficulty === 'beginner' ? 'default' : 
            lab.difficulty === 'intermediate' ? 'secondary' : 
            'destructive'
          }>
            {lab.difficulty}
          </Badge>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{lab.estimatedTime}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Server className="h-4 w-4" />
            <span>{lab.providerName}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Lab Environment Image */}
          <div 
            className="w-full rounded-lg bg-cover bg-center h-64 mb-8" 
            style={{ 
              backgroundImage: `url(${lab.imageUrl || '/placeholder-lab.jpg'})`,
              backgroundColor: '#1e293b'
            }}
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsItem value="overview">Overview</TabsItem>
              <TabsItem value="tasks">Tasks</TabsItem>
              <TabsItem value="architecture">Architecture</TabsItem>
              <TabsItem value="resources">Resources</TabsItem>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-muted-foreground">{lab.description}</p>
              </div>
              
              <Separator />
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {lab.prerequisites ? (
                    lab.prerequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))
                  ) : (
                    <li>Basic understanding of cloud infrastructure</li>
                  )}
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Learning Objectives</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {lab.objectives ? (
                    lab.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))
                  ) : (
                    <>
                      <li>Understand Terraform configuration basics</li>
                      <li>Learn how to provision cloud resources</li>
                      <li>Practice infrastructure as code principles</li>
                    </>
                  )}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-6">
              {isTasksLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : tasksError ? (
                <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                  <p>{tasksError instanceof Error ? tasksError.message : "Error loading tasks"}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks?.map((task) => (
                    <Card key={task.id} className="border border-border">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <Badge variant="outline">{task.points} Points</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{task.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="architecture" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Lab Architecture</h2>
                <p className="text-muted-foreground mb-4">
                  {lab.labArchitecture || 
                  "This lab will guide you through building a cloud infrastructure using Terraform. You'll learn how to define resources, manage state, and apply infrastructure as code principles."}
                </p>
                
                {/* Sample architecture diagram placeholder */}
                <div className="border border-border rounded-lg p-6 bg-card/50 flex items-center justify-center">
                  <div className="text-center">
                    <Server className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Architecture diagram will be displayed in the lab environment
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        Terraform Documentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Official Terraform documentation for reference.</p>
                    </CardContent>
                    <CardFooter>
                      <a href="https://www.terraform.io/docs" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          View Resource
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="mr-2 h-5 w-5" />
                        {lab.providerName} Provider Documentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Documentation for the {lab.providerName} provider.</p>
                    </CardContent>
                    <CardFooter>
                      <a href={`https://registry.terraform.io/providers/${lab.providerName.toLowerCase()}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          View Resource
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Start Lab Environment</CardTitle>
              <CardDescription>
                This lab will provision real cloud infrastructure using Terraform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p>You'll need to have a basic understanding of:</p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Terraform basics</li>
                    <li>{lab.providerName} fundamentals</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p>Estimated time to complete: {lab.estimatedTime}</p>
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                <p className="font-semibold mb-1">What you'll learn:</p>
                <ul className="list-disc list-inside ml-1 space-y-1">
                  {lab.objectives ? (
                    lab.objectives.slice(0, 3).map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))
                  ) : (
                    <>
                      <li>Terraform configuration</li>
                      <li>{lab.providerName} resource management</li>
                      <li>Infrastructure deployment</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleStartLab}
                disabled={createLabInstanceMutation.isPending}
              >
                {createLabInstanceMutation.isPending ? (
                  <>
                    <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
                    Provisioning...
                  </>
                ) : (
                  <>
                    Start Lab
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Mock data for development/fallback
const mockLabEnvironment: LabEnvironment = {
  id: 1,
  name: "AWS S3 Static Website Hosting",
  description: "Learn how to deploy a static website using AWS S3 and CloudFront. This hands-on lab will guide you through the process of creating an S3 bucket, configuring it for static website hosting, and setting up CloudFront to serve your content securely with HTTPS. By the end of this lab, you'll have a fully functional static website deployed on AWS infrastructure using Terraform.",
  difficulty: "beginner",
  estimatedTime: "30 minutes",
  tags: ["AWS", "S3", "CloudFront", "Static Website"],
  createdAt: "2023-01-15T00:00:00Z",
  updatedAt: "2023-01-15T00:00:00Z",
  imageUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  isActive: true,
  terraformVersion: "1.5.0",
  providerName: "AWS",
  prerequisites: [
    "Basic knowledge of AWS services",
    "Familiarity with Terraform syntax",
    "Understanding of DNS and web hosting concepts"
  ],
  objectives: [
    "Create and configure an S3 bucket for static website hosting",
    "Set up proper bucket policies for public access",
    "Create a CloudFront distribution for content delivery",
    "Configure custom error pages",
    "Deploy a sample static website"
  ],
  labArchitecture: "This lab architecture uses Amazon S3 for hosting static website content and Amazon CloudFront as a content delivery network (CDN). Users access the website through CloudFront, which caches content from the S3 bucket and serves it via a global network of edge locations for improved performance and security."
};

const mockLabTasks: LabTask[] = [
  {
    id: 1,
    environmentId: 1,
    title: "Set Up Terraform Configuration",
    description: "Create the initial Terraform configuration files with AWS provider setup and required variables.",
    order: 1,
    points: 10,
    hintText: "Remember to specify the AWS region and configure the provider block appropriately."
  },
  {
    id: 2,
    environmentId: 1,
    title: "Create S3 Bucket",
    description: "Define an S3 bucket resource with proper configuration for website hosting.",
    order: 2,
    points: 15,
    hintText: "Use the aws_s3_bucket resource and set website configuration with index and error documents."
  },
  {
    id: 3,
    environmentId: 1,
    title: "Configure Bucket Policy",
    description: "Set up a bucket policy to allow public read access to the website content.",
    order: 3,
    points: 20,
    hintText: "Use the aws_s3_bucket_policy resource and include the proper JSON policy with GetObject permissions."
  },
  {
    id: 4,
    environmentId: 1,
    title: "Create CloudFront Distribution",
    description: "Set up a CloudFront distribution pointing to your S3 bucket as the origin.",
    order: 4,
    points: 25,
    hintText: "Use the aws_cloudfront_distribution resource and configure the S3 origin with the website endpoint."
  },
  {
    id: 5,
    environmentId: 1,
    title: "Upload Website Content",
    description: "Use Terraform to upload the sample website content to the S3 bucket.",
    order: 5,
    points: 15,
    hintText: "Use for_each with aws_s3_bucket_object to upload multiple files with the correct content types."
  },
  {
    id: 6,
    environmentId: 1,
    title: "Test Website Access",
    description: "Verify that the static website is accessible through both S3 website endpoint and CloudFront.",
    order: 6,
    points: 15,
    hintText: "Use the CloudFront domain name provided in the Terraform outputs to access your website."
  }
];