import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProgressReport, useLearningVelocityReport, UserProgressReport, LearningVelocity } from "@/hooks/use-admin";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Download, TrendingUp, Users, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ReportsSection() {
  const [activeTab, setActiveTab] = useState("user-progress");
  
  const {
    data: progressReport,
    isLoading: isLoadingProgress,
    refetch: refetchProgress
  } = useUserProgressReport();
  
  const {
    data: velocityReport,
    isLoading: isLoadingVelocity,
    refetch: refetchVelocity
  } = useLearningVelocityReport();
  
  // Fetch data when tabs are activated
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "user-progress" && !progressReport && !isLoadingProgress) {
      refetchProgress();
    } else if (value === "learning-velocity" && !velocityReport && !isLoadingVelocity) {
      refetchVelocity();
    }
  };
  
  // If no data has been fetched yet, fetch it on component mount
  if (activeTab === "user-progress" && !progressReport && !isLoadingProgress) {
    refetchProgress();
  }
  
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="user-progress" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>User Progress</span>
        </TabsTrigger>
        <TabsTrigger value="learning-velocity" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span>Learning Velocity</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="user-progress">
        <Card>
          <CardHeader>
            <CardTitle>User Progress Report</CardTitle>
            <CardDescription>
              Overview of all users and their progress on assigned roadmaps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProgress ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <UserProgressTable report={progressReport} />
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="learning-velocity">
        <Card>
          <CardHeader>
            <CardTitle>Learning Velocity Report</CardTitle>
            <CardDescription>
              Measure how quickly users are progressing through their learning paths.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingVelocity ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <LearningVelocityDisplay report={velocityReport} />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

interface UserProgressTableProps {
  report?: UserProgressReport[];
}

function UserProgressTable({ report }: UserProgressTableProps) {
  if (!report || report.length === 0) {
    return <div className="text-center p-4">No user progress data available</div>;
  }
  
  // Download report as CSV
  const downloadReport = () => {
    // Create CSV content
    let csv = "User ID,Username,Email,Roadmap ID,Roadmap Title,Completion %,Completed Nodes,Total Nodes,Last Accessed\n";
    
    report.forEach(user => {
      if (user.roadmapProgress.length === 0) {
        csv += `${user.userId},${user.username},${user.email},,,,,\n`;
      } else {
        user.roadmapProgress.forEach(progress => {
          csv += `${user.userId},${user.username},${user.email},${progress.roadmapId},${progress.roadmapTitle},${progress.completionPercentage}%,${progress.completedNodes},${progress.totalNodes},${new Date(progress.lastAccessedAt).toLocaleDateString()}\n`;
        });
      }
    });
    
    // Create a blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user_progress_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={downloadReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>
      
      <Table>
        <TableCaption>User progress across all assigned roadmaps</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roadmaps</TableHead>
            <TableHead>Avg. Completion</TableHead>
            <TableHead>Latest Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.map(user => {
            // Calculate average completion percentage
            const avgCompletion = user.roadmapProgress.length > 0
              ? Math.round(
                  user.roadmapProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / 
                  user.roadmapProgress.length
                )
              : 0;
            
            // Find latest activity
            const latestActivity = user.roadmapProgress.length > 0
              ? new Date(
                  Math.max(...user.roadmapProgress.map(p => new Date(p.lastAccessedAt).getTime()))
                ).toLocaleDateString()
              : "Never";
            
            return (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.roadmapProgress.length}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={avgCompletion} className="h-2 w-[60px]" />
                    <span>{avgCompletion}%</span>
                  </div>
                </TableCell>
                <TableCell>{latestActivity}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

interface LearningVelocityDisplayProps {
  report?: LearningVelocity;
}

function LearningVelocityDisplay({ report }: LearningVelocityDisplayProps) {
  if (!report) {
    return <div className="text-center p-4">No velocity data available</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">User Velocity Ranking</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Avg. Nodes / Week</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.users.map(user => (
              <TableRow key={user.userId}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{user.avgNodesPerWeek.toFixed(1)}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Platform Learning Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.overall.map((period, index) => (
            <Card key={index}>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">{period.period}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{period.average.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg. nodes completed
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}