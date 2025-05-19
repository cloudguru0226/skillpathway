import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { LabEnvironment } from "@shared/schema";
import { Link } from "wouter";
import { Loader2, Search, Server, Tag } from "lucide-react";
import { useState } from "react";

export default function LabsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  const { data: labEnvironments, isLoading } = useQuery<LabEnvironment[]>({
    queryKey: ["/api/labs"],
    onError: (error) => {
      toast({
        title: "Error loading labs",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter labs based on search query, difficulty, and tags
  const filteredLabs = labEnvironments?.filter((lab) => {
    const matchesSearch = 
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lab.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === "all" || lab.difficulty === difficultyFilter;
    
    const matchesTags = tagFilter.length === 0 || 
      (lab.tags && tagFilter.every(tag => lab.tags.includes(tag)));
    
    return matchesSearch && matchesDifficulty && matchesTags;
  });

  // Get unique tags from all labs
  const allTags = [...new Set(labEnvironments?.flatMap(lab => lab.tags || []))];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Terraform Labs</h1>
          <p className="text-muted-foreground mt-2">
            Hands-on practice environments powered by Terraform. Experiment with real infrastructure in a safe learning environment.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search labs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="sm:ml-auto">
            <Tag className="mr-2 h-4 w-4" />
            Filter by Tags
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={setDifficultyFilter}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Levels</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs?.map((lab) => (
            <Card key={lab.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge className="mb-2">{lab.difficulty}</Badge>
                  <Badge variant="outline">{lab.estimatedDuration} mins</Badge>
                </div>
                <CardTitle className="text-xl">{lab.name}</CardTitle>
                <CardDescription className="line-clamp-2">{lab.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {lab.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="border-t bg-muted/50 px-6 py-4">
                <div className="flex items-center text-sm mr-4">
                  <Server className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{lab.resourcesProvided}</span>
                </div>
                <Button asChild className="ml-auto">
                  <Link to={`/labs/${lab.id}`}>Launch Lab</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}

          {filteredLabs?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium">No labs found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}