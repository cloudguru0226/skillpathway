import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsItem, TabsList } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Check,
  Clock,
  Code,
  FileTerminal,
  HelpCircle,
  Info,
  Loader2,
  LucideIcon,
  Play,
  RefreshCw,
  Server,
  Terminal,
  X,
  AlertTriangle,
} from "lucide-react";

// Lab instance type
type LabInstance = {
  id: number;
  userId: number;
  environmentId: number;
  environmentName: string;
  createdAt: string;
  state: "provisioning" | "running" | "failed" | "deprovisioning" | "terminated";
  stateDetails: string;
  accessUrl?: string;
  credentials?: Record<string, string>;
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

// Lab task progress type
type TaskProgress = {
  taskId: number;
  completed: boolean;
  attempts: number;
  lastAttemptAt?: string;
};

// Console log entry
type ConsoleLog = {
  timestamp: string;
  message: string;
  type: "info" | "error" | "success";
};

export default function LabInstancePage() {
  const params = useParams<{ id: string }>();
  const instanceId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("tasks");
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [solution, setSolution] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  
  // Fetch lab instance
  const { 
    data: instance,
    isLoading: isInstanceLoading,
    error: instanceError,
    refetch: refetchInstance
  } = useQuery({
    queryKey: [`/api/labs/instances/${instanceId}`],
    queryFn: async () => {
      // During development, use mock data
      if (process.env.NODE_ENV === "development") {
        return mockLabInstance;
      }
      
      try {
        const res = await fetch(`/api/labs/instances/${instanceId}`);
        if (!res.ok) throw new Error('Failed to fetch lab instance');
        return await res.json() as LabInstance;
      } catch (err) {
        console.error("Error fetching lab instance:", err);
        throw err;
      }
    },
    refetchInterval: (data) => {
      // Poll every 10 seconds while provisioning or deprovisioning
      if (data?.state === "provisioning" || data?.state === "deprovisioning") {
        return 10000;
      }
      return false;
    }
  });
  
  // Fetch lab tasks
  const { 
    data: tasks,
    isLoading: isTasksLoading,
    error: tasksError
  } = useQuery({
    queryKey: [`/api/labs/${instance?.environmentId}/tasks`],
    queryFn: async () => {
      // If we don't have an instance yet, return empty array
      if (!instance?.environmentId) return [];
      
      // During development, use mock data
      if (process.env.NODE_ENV === "development") {
        return mockLabTasks;
      }
      
      try {
        const res = await fetch(`/api/labs/${instance.environmentId}/tasks`);
        if (!res.ok) throw new Error('Failed to fetch lab tasks');
        return await res.json() as LabTask[];
      } catch (err) {
        console.error("Error fetching lab tasks:", err);
        throw err;
      }
    },
    enabled: !!instance?.environmentId
  });
  
  // Fetch task progress
  const { 
    data: taskProgress,
    isLoading: isProgressLoading,
    error: progressError,
    refetch: refetchProgress
  } = useQuery({
    queryKey: [`/api/labs/instances/${instanceId}/progress`],
    queryFn: async () => {
      // During development, use mock data
      if (process.env.NODE_ENV === "development") {
        return mockTaskProgress;
      }
      
      try {
        const res = await fetch(`/api/labs/instances/${instanceId}/progress`);
        if (!res.ok) throw new Error('Failed to fetch task progress');
        return await res.json() as TaskProgress[];
      } catch (err) {
        console.error("Error fetching task progress:", err);
        throw err;
      }
    }
  });
  
  // Calculate overall progress percentage
  const progressPercentage = taskProgress?.length && tasks?.length 
    ? Math.round((taskProgress.filter(p => p.completed).length / tasks.length) * 100) 
    : 0;
  
  // Verify task solution mutation
  const verifyTaskMutation = useMutation({
    mutationFn: async ({ taskId, solution }: { taskId: number, solution: string }) => {
      const res = await apiRequest("POST", `/api/labs/instances/${instanceId}/tasks/${taskId}/verify`, { solution });
      return await res.json();
    },
    onSuccess: (data, variables) => {
      // Add success message to console logs
      setConsoleLogs(prev => [
        ...prev, 
        { 
          timestamp: new Date().toISOString(), 
          message: `Task verification successful: ${data.message || "Solution accepted!"}`, 
          type: "success" 
        }
      ]);
      
      // Refetch progress
      refetchProgress();
      
      // Clear solution field
      setSolution("");
      
      // Show success toast
      toast({
        title: "Task Completed!",
        description: "Your solution was correct. Moving on to the next task.",
      });
      
      // If there are more tasks, select the next one
      if (tasks && activeTaskId !== null) {
        const currentIndex = tasks.findIndex(t => t.id === activeTaskId);
        if (currentIndex < tasks.length - 1) {
          setActiveTaskId(tasks[currentIndex + 1].id);
        }
      }
    },
    onError: (error: Error, variables) => {
      // Add error message to console logs
      setConsoleLogs(prev => [
        ...prev, 
        { 
          timestamp: new Date().toISOString(), 
          message: `Task verification failed: ${error.message || "Invalid solution"}`, 
          type: "error" 
        }
      ]);
      
      toast({
        title: "Verification Failed",
        description: error.message || "Your solution didn't pass verification. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Terminate lab instance mutation
  const terminateLabMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/labs/instances/${instanceId}/terminate`, {});
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Lab Terminated",
        description: "Your lab environment is being terminated. This may take a few minutes.",
      });
      refetchInstance();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to terminate lab",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });
  
  // Handle solution submission
  const handleSubmitSolution = (taskId: number) => {
    if (!solution.trim()) {
      toast({
        title: "Solution Required",
        description: "Please enter your solution before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    // Add log entry for submission
    setConsoleLogs(prev => [
      ...prev, 
      { 
        timestamp: new Date().toISOString(), 
        message: `Submitting solution for task ${taskId}...`, 
        type: "info" 
      }
    ]);
    
    verifyTaskMutation.mutate({ taskId, solution });
  };
  
  // Handle task selection
  const handleSelectTask = (taskId: number) => {
    setActiveTaskId(taskId);
    setShowHint(false);
    setShowSolution(false);
  };
  
  // Handle lab termination
  const handleTerminateLab = () => {
    if (window.confirm("Are you sure you want to terminate this lab? All progress will be saved, but the cloud resources will be destroyed.")) {
      terminateLabMutation.mutate();
    }
  };
  
  // Set active task when tasks load
  useEffect(() => {
    if (tasks && tasks.length > 0 && !activeTaskId) {
      // If we have task progress, find the first incomplete task
      if (taskProgress && taskProgress.length > 0) {
        const firstIncompleteTask = tasks.find(task => 
          !taskProgress.some(progress => progress.taskId === task.id && progress.completed)
        );
        
        if (firstIncompleteTask) {
          setActiveTaskId(firstIncompleteTask.id);
        } else {
          // If all tasks are complete, select the first one
          setActiveTaskId(tasks[0].id);
        }
      } else {
        // Otherwise start with the first task
        setActiveTaskId(tasks[0].id);
      }
    }
  }, [tasks, taskProgress, activeTaskId]);
  
  // Get current task
  const currentTask = tasks?.find(task => task.id === activeTaskId);
  
  // Get current task progress
  const currentTaskProgress = taskProgress?.find(p => p.taskId === activeTaskId);
  
  // Loading state
  if (isInstanceLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-8" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (instanceError || !instance) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Error Loading Lab Instance</h2>
          <p>{instanceError instanceof Error ? instanceError.message : "An unknown error occurred"}</p>
          <div className="flex space-x-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => refetchInstance()}
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
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <Link href="/labs">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Labs
              </Button>
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground">{instance.environmentName}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{instance.environmentName}</h1>
          <div className="flex items-center">
            <StatusBadge state={instance.state} />
            {instance.state === "running" && (
              <div className="ml-4 text-sm text-muted-foreground">
                <span>Progress: </span>
                <span className="font-medium">{progressPercentage}%</span>
                <Progress value={progressPercentage} className="h-2 w-24 inline-block ml-2" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant="outline"
            onClick={() => refetchInstance()}
            disabled={instance.state === "deprovisioning" || instance.state === "terminated"}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            variant="destructive"
            onClick={handleTerminateLab}
            disabled={
              terminateLabMutation.isPending || 
              instance.state === "deprovisioning" || 
              instance.state === "terminated"
            }
          >
            {terminateLabMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Terminating...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Terminate Lab
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Provisioning State */}
      {instance.state === "provisioning" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Provisioning Lab Environment
            </CardTitle>
            <CardDescription>
              Your lab environment is being created. This may take a few minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{instance.stateDetails}</p>
              </div>
              <Progress value={35} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Status updates will appear automatically. You don't need to refresh the page.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Failed State */}
      {instance.state === "failed" && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Provisioning Failed</AlertTitle>
          <AlertDescription>
            {instance.stateDetails}
            <div className="mt-4">
              <Button onClick={() => refetchInstance()} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Deprovisioning or Terminated State */}
      {(instance.state === "deprovisioning" || instance.state === "terminated") && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              {instance.state === "deprovisioning" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Deprovisioning Lab Environment
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Lab Environment Terminated
                </>
              )}
            </CardTitle>
            <CardDescription>
              {instance.state === "deprovisioning" 
                ? "Your lab environment is being terminated. This may take a few minutes."
                : "Your lab environment has been terminated. Your progress has been saved."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instance.state === "deprovisioning" && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">{instance.stateDetails}</p>
                </div>
                <Progress value={75} className="h-2" />
              </>
            )}
            <div className="mt-4">
              <Link href="/labs">
                <Button>
                  Back to Labs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Running State */}
      {instance.state === "running" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Task Tabs */}
            <Card>
              <CardHeader className="border-b pb-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsItem value="tasks">Tasks</TabsItem>
                    <TabsItem value="console">Console</TabsItem>
                    <TabsItem value="resources">Resources</TabsItem>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="pt-6">
                {activeTab === "tasks" && (
                  <div className="space-y-8">
                    {isTasksLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    ) : tasksError ? (
                      <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md">
                        <p className="text-destructive">Error loading tasks: {tasksError instanceof Error ? tasksError.message : "Unknown error"}</p>
                      </div>
                    ) : !currentTask ? (
                      <div className="text-center py-8">
                        <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
                        <h3 className="mt-4 font-semibold">No tasks available</h3>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-6">
                          <h2 className="text-xl font-semibold flex items-center">
                            {currentTask.title}
                            {currentTaskProgress?.completed && (
                              <Badge variant="outline" className="ml-2">
                                <Check className="h-3 w-3 mr-1" /> Completed
                              </Badge>
                            )}
                          </h2>
                          <div className="mt-2 text-muted-foreground">
                            {currentTask.description}
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          {/* Solution Input */}
                          <div>
                            <div className="flex justify-between mb-2">
                              <h3 className="text-sm font-medium">Your Solution:</h3>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setShowHint(!showHint)}
                                  disabled={!currentTask.hintText}
                                >
                                  <HelpCircle className="h-3.5 w-3.5 mr-1" />
                                  {showHint ? "Hide Hint" : "Show Hint"}
                                </Button>
                                {currentTaskProgress?.completed && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowSolution(!showSolution)}
                                    disabled={!currentTask.solutionText}
                                  >
                                    <Code className="h-3.5 w-3.5 mr-1" />
                                    {showSolution ? "Hide Solution" : "Solution"}
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {showHint && currentTask.hintText && (
                              <div className="mb-4 p-3 bg-muted rounded-md text-sm">
                                <div className="font-medium mb-1">Hint:</div>
                                {currentTask.hintText}
                              </div>
                            )}
                            
                            {showSolution && currentTask.solutionText && (
                              <div className="mb-4 p-3 bg-muted rounded-md text-sm">
                                <div className="font-medium mb-1">Solution:</div>
                                <code className="block whitespace-pre-wrap">
                                  {currentTask.solutionText}
                                </code>
                              </div>
                            )}
                            
                            <Textarea
                              placeholder="Enter your solution here (e.g., Terraform configuration)"
                              className="font-mono h-48"
                              value={solution}
                              onChange={(e) => setSolution(e.target.value)}
                              disabled={
                                currentTaskProgress?.completed || 
                                verifyTaskMutation.isPending
                              }
                            />
                            
                            <div className="flex justify-end mt-3">
                              <Button
                                onClick={() => handleSubmitSolution(currentTask.id)}
                                disabled={
                                  currentTaskProgress?.completed || 
                                  verifyTaskMutation.isPending || 
                                  !solution.trim()
                                }
                              >
                                {verifyTaskMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Verifying...
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Submit Solution
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === "console" && (
                  <div className="bg-black text-green-400 font-mono p-4 rounded-md h-[500px] overflow-y-auto">
                    {consoleLogs.map((log, index) => (
                      <div key={index} className={`mb-1 ${
                        log.type === "error" ? "text-red-400" :
                        log.type === "success" ? "text-green-400" :
                        "text-gray-400"
                      }`}>
                        <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                        {log.message}
                      </div>
                    ))}
                    {consoleLogs.length === 0 && (
                      <div className="text-gray-500 italic">No console logs available yet. Submit a task to see results here.</div>
                    )}
                  </div>
                )}
                
                {activeTab === "resources" && (
                  <div className="space-y-4">
                    {instance.accessUrl && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Access Environment</CardTitle>
                          <CardDescription>
                            You can access your environment through the following URL:
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-3 rounded-md font-mono overflow-x-auto">
                            <a 
                              href={instance.accessUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline text-blue-500"
                            >
                              {instance.accessUrl}
                            </a>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            onClick={() => window.open(instance.accessUrl, "_blank")}
                          >
                            Open in New Tab
                          </Button>
                        </CardFooter>
                      </Card>
                    )}
                    
                    {instance.credentials && Object.keys(instance.credentials).length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Credentials</CardTitle>
                          <CardDescription>
                            Use these credentials to access your environment:
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-3 rounded-md font-mono">
                            {Object.entries(instance.credentials).map(([key, value]) => (
                              <div key={key} className="mb-2">
                                <span className="font-bold">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Terraform Configuration</CardTitle>
                        <CardDescription>
                          Copy and use these Terraform configuration files in your environment.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible>
                          <AccordionItem value="main">
                            <AccordionTrigger>main.tf</AccordionTrigger>
                            <AccordionContent>
                              <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto whitespace-pre">
{`provider "aws" {
  region = "us-west-2"
}

resource "aws_s3_bucket" "website" {
  bucket = "my-terraform-website-\${random_string.suffix.result}"
  
  tags = {
    Name        = "My Website Bucket"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_ownership_controls" "website" {
  bucket = aws_s3_bucket.website.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "website" {
  depends_on = [
    aws_s3_bucket_ownership_controls.website,
    aws_s3_bucket_public_access_block.website,
  ]

  bucket = aws_s3_bucket.website.id
  acl    = "public-read"
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}`}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="variables">
                            <AccordionTrigger>variables.tf</AccordionTrigger>
                            <AccordionContent>
                              <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto whitespace-pre">
{`variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}`}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="outputs">
                            <AccordionTrigger>outputs.tf</AccordionTrigger>
                            <AccordionContent>
                              <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto whitespace-pre">
{`output "website_bucket_name" {
  description = "Name of the S3 bucket hosting the website"
  value       = aws_s3_bucket.website.id
}

output "website_endpoint" {
  description = "Website endpoint"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}`}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div>
            <div className="space-y-6">
              {/* Tasks Progress */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>
                    {taskProgress?.filter(t => t.completed).length || 0}/{tasks?.length || 0} completed
                  </CardDescription>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2" 
                  />
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto">
                  {isTasksLoading || isProgressLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center">
                          <Skeleton className="h-5 w-5 rounded-full mr-3" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : tasksError || progressError ? (
                    <div className="text-sm text-destructive">
                      Failed to load tasks
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks?.map((task) => {
                        const progress = taskProgress?.find(p => p.taskId === task.id);
                        
                        return (
                          <Button
                            key={task.id}
                            variant={activeTaskId === task.id ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handleSelectTask(task.id)}
                          >
                            {progress?.completed ? (
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                              <span className="h-4 w-4 mr-2 flex items-center justify-center rounded-full border border-current text-xs">
                                {task.order}
                              </span>
                            )}
                            <span className={progress?.completed ? "line-through opacity-70" : ""}>
                              {task.title}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Lab Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Lab Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleTerminateLab}
                    disabled={
                      terminateLabMutation.isPending || 
                      instance.state === "deprovisioning" || 
                      instance.state === "terminated"
                    }
                  >
                    {terminateLabMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Terminating...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Terminate Lab
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Help */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>
                      <span className="font-medium">Hint Button:</span> Use the "Show Hint" button for guidance on the current task.
                    </li>
                    <li>
                      <span className="font-medium">Console:</span> Check the Console tab for error messages and verification results.
                    </li>
                    <li>
                      <span className="font-medium">Resources:</span> Find environment access details in the Resources tab.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Status Badge component
function StatusBadge({ state }: { state: LabInstance["state"] }) {
  let color: string;
  let Icon: LucideIcon;
  let label: string;
  
  switch (state) {
    case "provisioning":
      color = "bg-blue-500";
      Icon = Loader2;
      label = "Provisioning";
      break;
    case "running":
      color = "bg-green-500";
      Icon = Check;
      label = "Running";
      break;
    case "failed":
      color = "bg-red-500";
      Icon = X;
      label = "Failed";
      break;
    case "deprovisioning":
      color = "bg-yellow-500";
      Icon = AlertTriangle;
      label = "Deprovisioning";
      break;
    case "terminated":
      color = "bg-gray-500";
      Icon = X;
      label = "Terminated";
      break;
  }
  
  return (
    <div className="flex items-center gap-1.5">
      <span className={`flex h-2.5 w-2.5 rounded-full ${color} mr-1`}></span>
      <span className="flex items-center text-sm">
        {state === "provisioning" || state === "deprovisioning" ? (
          <Icon className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <Icon className="h-3.5 w-3.5 mr-1" />
        )}
        {label}
      </span>
    </div>
  );
}

// Mock data for development/fallback
const mockLabInstance: LabInstance = {
  id: 123,
  userId: 1,
  environmentId: 1,
  environmentName: "AWS S3 Static Website Hosting",
  createdAt: "2023-01-15T00:00:00Z",
  state: "running",
  stateDetails: "Lab environment is ready and running.",
  accessUrl: "https://console.aws.amazon.com",
  credentials: {
    "AWS_ACCESS_KEY_ID": "AKIA1234567890EXAMPLE",
    "AWS_SECRET_ACCESS_KEY": "abcdefg1234567890/abcdefg1234567890EXAMPLE",
    "AWS_REGION": "us-west-2"
  }
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

const mockTaskProgress: TaskProgress[] = [
  {
    taskId: 1,
    completed: true,
    attempts: 1,
    lastAttemptAt: "2023-05-15T14:30:00Z"
  },
  {
    taskId: 2,
    completed: true,
    attempts: 2,
    lastAttemptAt: "2023-05-15T14:45:00Z"
  },
  {
    taskId: 3,
    completed: false,
    attempts: 0
  }
];