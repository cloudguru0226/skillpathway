import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { LabInstance, LabTask, UserLabTaskProgress } from "@shared/schema";
import { useLocation, Link } from "wouter";
import { Loader2, ChevronLeft, Terminal, PlayCircle, CheckCircle2, XCircle, Server, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function LabInstancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const instanceId = parseInt(location.split('/').pop() || '0');
  const [solution, setSolution] = useState("");
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  // Get lab instance
  const { data: instance, isLoading: isInstanceLoading } = useQuery<LabInstance>({
    queryKey: [`/api/labs/instances/${instanceId}`],
    enabled: !!instanceId,
    refetchInterval: (data) => {
      // If the instance is provisioning or deprovisioning, refetch every 5 seconds
      return data?.state === 'provisioning' || data?.state === 'deprovisioning' ? 5000 : false;
    },
    onError: (error: Error) => {
      toast({
        title: "Error loading lab instance",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get lab tasks
  const { data: tasks, isLoading: isTasksLoading } = useQuery<LabTask[]>({
    queryKey: [`/api/labs/environments/${instance?.environmentId}/tasks`],
    enabled: !!instance?.environmentId,
    onError: (error: Error) => {
      toast({
        title: "Error loading lab tasks",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get task progress
  const { data: taskProgress, isLoading: isProgressLoading } = useQuery<UserLabTaskProgress[]>({
    queryKey: [`/api/labs/instances/${instanceId}/progress`],
    enabled: !!instanceId && !!user?.id,
    onError: (error: Error) => {
      toast({
        title: "Error loading progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit task solution
  const submitSolutionMutation = useMutation({
    mutationFn: async ({ taskId, solution }: { taskId: number; solution: string }) => {
      const res = await apiRequest("POST", `/api/labs/instances/${instanceId}/tasks/${taskId}/verify`, { solution });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Task completed!",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: [`/api/labs/instances/${instanceId}/progress`] });
        setSolution("");
      } else {
        toast({
          title: "Incorrect solution",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting solution",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Terminate lab instance
  const terminateInstanceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/labs/instances/${instanceId}/terminate`);
    },
    onSuccess: () => {
      toast({
        title: "Lab terminated",
        description: "Your lab environment is being shut down.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/labs/instances/${instanceId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error terminating lab",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitSolution = () => {
    if (!activeTaskId) return;
    submitSolutionMutation.mutate({ taskId: activeTaskId, solution });
  };

  const handleTerminateLab = () => {
    terminateInstanceMutation.mutate();
  };

  // Calculate progress
  const completedTasks = taskProgress?.filter(p => p.isCompleted).length || 0;
  const totalTasks = tasks?.length || 0;
  const progressPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const isLoading = isInstanceLoading || isTasksLoading || isProgressLoading;
  const isSubmitting = submitSolutionMutation.isPending;
  const isTerminating = terminateInstanceMutation.isPending;

  // Check if a task is completed
  const isTaskCompleted = (taskId: number) => {
    return taskProgress?.some(p => p.taskId === taskId && p.isCompleted) || false;
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Lab instance not found</h2>
          <p className="text-muted-foreground mt-2">The lab instance you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link to="/labs">Back to Labs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
          <Link to="/labs">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Labs
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{instance.environmentName}</h1>
              <Badge 
                variant={
                  instance.state === 'running' ? 'success' :
                  instance.state === 'provisioning' ? 'default' :
                  instance.state === 'failed' ? 'destructive' : 'outline'
                }
                className="ml-2"
              >
                {instance.state}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2">Lab instance started at {new Date(instance.createdAt).toLocaleString()}</p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              Time elapsed: {formatElapsedTime(instance.createdAt)}
            </div>
            <Button 
              variant="destructive" 
              onClick={handleTerminateLab}
              disabled={isTerminating || instance.state === 'deprovisioning' || instance.state === 'terminated'}
            >
              {isTerminating || instance.state === 'deprovisioning' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Terminating...
                </>
              ) : (
                <>
                  Terminate Lab
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {instance.state === 'provisioning' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Provisioning Your Lab Environment</CardTitle>
            <CardDescription>
              Please wait while we set up your lab environment with Terraform. This may take a few minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={40} className="h-2 mb-2" />
            <div className="text-sm text-muted-foreground">Setting up infrastructure resources...</div>
          </CardContent>
        </Card>
      )}

      {instance.state === 'running' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Lab Tasks</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">Progress:</div>
                    <div className="font-medium">{progressPercentage}%</div>
                  </div>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks?.map((task, index) => {
                    const isCompleted = isTaskCompleted(task.id);
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`flex items-start p-4 border rounded-md ${
                          activeTaskId === task.id ? 'border-primary bg-primary/5' : ''
                        } ${isCompleted ? 'border-green-500/30 bg-green-500/5' : ''}`}
                      >
                        <div className="flex-shrink-0 mr-4 text-lg font-bold">{index + 1}.</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{task.title}</h3>
                            {isCompleted && (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mt-1">{task.description}</p>
                          
                          {!isCompleted && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setActiveTaskId(task.id)}
                            >
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Work on this task
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Lab Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Instance ID</dt>
                    <dd className="text-sm font-mono">{instance.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="text-sm flex items-center gap-1">
                      <Badge 
                        variant={
                          instance.state === 'running' ? 'success' :
                          instance.state === 'provisioning' ? 'default' :
                          instance.state === 'failed' ? 'destructive' : 'outline'
                        }
                      >
                        {instance.state}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Resources</dt>
                    <dd className="text-sm flex items-center gap-1">
                      <Server className="h-4 w-4 mr-1 text-muted-foreground" />
                      {instance.resourcesProvisioned}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {activeTaskId && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Solution</CardTitle>
                  <CardDescription>
                    Complete the task by entering your solution and submitting it for verification.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Enter your solution here..."
                    className="min-h-[150px] font-mono text-sm"
                  />
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTaskId(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitSolution}
                    disabled={isSubmitting || !solution.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Terminal className="mr-2 h-4 w-4" />
                        Submit Solution
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      )}

      {(instance.state === 'terminated' || instance.state === 'failed') && (
        <Card>
          <CardHeader>
            <CardTitle>
              {instance.state === 'terminated' ? 'Lab Terminated' : 'Lab Provisioning Failed'}
            </CardTitle>
            <CardDescription>
              {instance.state === 'terminated' 
                ? 'This lab instance has been terminated and all resources have been released.' 
                : 'There was an error provisioning your lab environment.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instance.state === 'failed' && (
              <div className="text-destructive mb-4">
                <h4 className="font-semibold">Error details:</h4>
                <p className="text-sm mt-1">{instance.stateDetails || 'Unknown error'}</p>
              </div>
            )}
            <Button asChild>
              <Link to="/labs">Return to Labs</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper function to format elapsed time
function formatElapsedTime(startTime: Date) {
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  const elapsed = now - start;
  
  const hours = Math.floor(elapsed / (1000 * 60 * 60));
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}