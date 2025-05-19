import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { LabEnvironment, LabTask } from "@shared/schema";
import { useLocation, Link } from "wouter";
import { Loader2, Server, CheckCircle2, XCircle, ChevronLeft, Play } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function LabDetailPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const labId = parseInt(location.split('/').pop() || '0');

  // Get lab environment details
  const { data: lab, isLoading: isLabLoading } = useQuery<LabEnvironment>({
    queryKey: [`/api/labs/${labId}`],
    enabled: !!labId,
    onError: (error) => {
      toast({
        title: "Error loading lab",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get lab tasks
  const { data: tasks, isLoading: isTasksLoading } = useQuery<LabTask[]>({
    queryKey: [`/api/labs/${labId}/tasks`],
    enabled: !!labId,
    onError: (error) => {
      toast({
        title: "Error loading lab tasks",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create a lab instance
  const createInstanceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/labs/${labId}/instances`, {
        userId: user?.id,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Lab launched!",
        description: "Your lab environment is being provisioned.",
      });
      // Redirect to the lab instance page
      setLocation(`/labs/instance/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to launch lab",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLaunchLab = () => {
    createInstanceMutation.mutate();
  };

  const isLoading = isLabLoading || isTasksLoading;
  const isPending = createInstanceMutation.isPending;

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Lab not found</h2>
          <p className="text-muted-foreground mt-2">The lab you're looking for doesn't exist.</p>
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

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{lab.name}</h1>
              <Badge className="ml-2">{lab.difficulty}</Badge>
            </div>
            <p className="text-muted-foreground mt-2">{lab.description}</p>
          </div>

          <Button
            className="mt-4 md:mt-0 md:self-start"
            onClick={handleLaunchLab}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Provisioning...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Launch Lab
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Lab Overview</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: lab.detailedDescription || '' }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Complete the following tasks to finish this lab.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks?.map((task, index) => (
                  <div key={task.id} className="flex items-start p-4 border rounded-md">
                    <div className="flex-shrink-0 mr-4 text-lg font-bold">{index + 1}.</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{task.description}</p>
                    </div>
                  </div>
                ))}
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
                  <dt className="text-sm font-medium text-muted-foreground">Duration</dt>
                  <dd className="text-sm">{lab.estimatedDuration} minutes</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Difficulty</dt>
                  <dd className="text-sm">{lab.difficulty}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Resources</dt>
                  <dd className="text-sm">{lab.resourcesProvided}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Tags</dt>
                  <dd className="text-sm flex flex-wrap gap-1 mt-1">
                    {lab.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lab.prerequisites?.map((prerequisite, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{prerequisite}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}