import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Target, 
  Laptop, 
  Calendar,
  Clock,
  Users,
  Star,
  ArrowRight,
  X
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SearchFilters {
  query: string;
  type: string[];
  difficulty: string[];
  tags: string[];
  categories: string[];
  duration: string;
  status: string;
}

interface SearchResult {
  id: number;
  title: string;
  description: string;
  type: "course" | "roadmap" | "lab" | "assignment";
  difficulty: string;
  tags: string[];
  categories: string[];
  duration?: number;
  estimatedTime?: string;
  enrollmentCount?: number;
  rating?: number;
  coverImageUrl?: string;
  status?: string;
  isEnrolled?: boolean;
  progress?: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  iconName?: string;
  parentId?: number;
  children?: Category[];
}

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      query: params.get("q") || "",
      type: params.getAll("type") || [],
      difficulty: params.getAll("difficulty") || [],
      tags: params.getAll("tags") || [],
      categories: params.getAll("categories") || [],
      duration: params.get("duration") || "",
      status: params.get("status") || ""
    };
  });

  // Fetch search results
  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.query) params.set("q", filters.query);
      filters.type.forEach(t => params.append("type", t));
      filters.difficulty.forEach(d => params.append("difficulty", d));
      filters.tags.forEach(tag => params.append("tags", tag));
      filters.categories.forEach(cat => params.append("categories", cat));
      if (filters.duration) params.set("duration", filters.duration);
      if (filters.status) params.set("status", filters.status);

      try {
        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) throw new Error("Search failed");
        return await res.json();
      } catch (error) {
        // Mock data for demo
        return mockSearchResults.filter(item => {
          const matchesQuery = !filters.query || 
            item.title.toLowerCase().includes(filters.query.toLowerCase()) ||
            item.description.toLowerCase().includes(filters.query.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(filters.query.toLowerCase()));
          
          const matchesType = filters.type.length === 0 || filters.type.includes(item.type);
          const matchesDifficulty = filters.difficulty.length === 0 || filters.difficulty.includes(item.difficulty);
          const matchesTags = filters.tags.length === 0 || 
            filters.tags.some(tag => item.tags.includes(tag));
          
          return matchesQuery && matchesType && matchesDifficulty && matchesTags;
        });
      }
    }
  });

  // Fetch categories for filtering
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        return await res.json();
      } catch (error) {
        // Mock categories
        return [
          { id: 1, name: "Frontend Development", color: "#3b82f6", iconName: "Monitor" },
          { id: 2, name: "Backend Development", color: "#10b981", iconName: "Server" },
          { id: 3, name: "DevOps & Cloud", color: "#f59e0b", iconName: "Cloud" },
          { id: 4, name: "Data Science", color: "#8b5cf6", iconName: "BarChart" },
          { id: 5, name: "Mobile Development", color: "#ec4899", iconName: "Smartphone" },
          { id: 6, name: "Security", color: "#ef4444", iconName: "Shield" }
        ];
      }
    }
  });

  // Available tags from search results
  const availableTags = [...new Set(results?.flatMap(item => item.tags) || [])];

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    filters.type.forEach(t => params.append("type", t));
    filters.difficulty.forEach(d => params.append("difficulty", d));
    filters.tags.forEach(tag => params.append("tags", tag));
    filters.categories.forEach(cat => params.append("categories", cat));
    if (filters.duration) params.set("duration", filters.duration);
    if (filters.status) params.set("status", filters.status);

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ""}`;
    if (newUrl !== location) {
      window.history.replaceState({}, "", newUrl);
    }
  }, [filters, location]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: "type" | "difficulty" | "tags" | "categories", value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      type: [],
      difficulty: [],
      tags: [],
      categories: [],
      duration: "",
      status: ""
    });
  };

  const hasActiveFilters = filters.type.length > 0 || filters.difficulty.length > 0 || 
    filters.tags.length > 0 || filters.categories.length > 0 || filters.duration || filters.status;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course": return <BookOpen className="h-4 w-4" />;
      case "roadmap": return <Target className="h-4 w-4" />;
      case "lab": return <Laptop className="h-4 w-4" />;
      case "assignment": return <Calendar className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "course": return "default";
      case "roadmap": return "secondary";
      case "lab": return "outline";
      case "assignment": return "destructive";
      default: return "default";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "";
    }
  };

  // Mock data
  const mockSearchResults: SearchResult[] = [
    {
      id: 1,
      title: "React Fundamentals",
      description: "Learn the basics of React development with hands-on projects",
      type: "course",
      difficulty: "beginner",
      tags: ["react", "javascript", "frontend"],
      categories: ["Frontend Development"],
      duration: 20,
      enrollmentCount: 1250,
      rating: 4.8,
      isEnrolled: false
    },
    {
      id: 2,
      title: "Frontend Developer Roadmap",
      description: "Complete learning path to become a frontend developer",
      type: "roadmap",
      difficulty: "intermediate",
      tags: ["frontend", "html", "css", "javascript", "react"],
      categories: ["Frontend Development"],
      estimatedTime: "3-6 months",
      enrollmentCount: 850,
      rating: 4.9,
      isEnrolled: true,
      progress: 65
    },
    {
      id: 3,
      title: "AWS EC2 Setup Lab",
      description: "Hands-on experience with AWS EC2 instance configuration",
      type: "lab",
      difficulty: "intermediate",
      tags: ["aws", "cloud", "ec2", "devops"],
      categories: ["DevOps & Cloud"],
      duration: 90,
      enrollmentCount: 420,
      rating: 4.6
    },
    {
      id: 4,
      title: "Node.js API Development",
      description: "Build scalable REST APIs with Node.js and Express",
      type: "course",
      difficulty: "intermediate",
      tags: ["nodejs", "api", "backend", "express"],
      categories: ["Backend Development"],
      duration: 25,
      enrollmentCount: 980,
      rating: 4.7
    },
    {
      id: 5,
      title: "Docker Fundamentals",
      description: "Learn containerization with Docker from scratch",
      type: "course",
      difficulty: "beginner",
      tags: ["docker", "containers", "devops"],
      categories: ["DevOps & Cloud"],
      duration: 15,
      enrollmentCount: 1100,
      rating: 4.5
    },
    {
      id: 6,
      title: "React Dashboard Project",
      description: "Build a complete admin dashboard using React and TypeScript",
      type: "assignment",
      difficulty: "advanced",
      tags: ["react", "typescript", "project"],
      categories: ["Frontend Development"],
      status: "in_progress",
      progress: 45
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Search Learning Content</h1>
          <p className="text-muted-foreground">
            Find courses, roadmaps, labs, and assignments to advance your skills
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for courses, roadmaps, labs..."
              value={filters.query}
              onChange={(e) => updateFilter("query", e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 rounded-full">
                {filters.type.length + filters.difficulty.length + filters.tags.length + 
                 filters.categories.length + (filters.duration ? 1 : 0) + (filters.status ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium">Active filters:</span>
            {filters.type.map(type => (
              <Badge key={type} variant="secondary" className="gap-1">
                {type}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleArrayFilter("type", type)}
                />
              </Badge>
            ))}
            {filters.difficulty.map(diff => (
              <Badge key={diff} variant="secondary" className="gap-1">
                {diff}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleArrayFilter("difficulty", diff)}
                />
              </Badge>
            ))}
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleArrayFilter("tags", tag)}
                />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="lg:col-span-1">
          <CollapsibleContent className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Type Filter */}
                <div className="space-y-3">
                  <h4 className="font-medium">Content Type</h4>
                  <div className="space-y-2">
                    {["course", "roadmap", "lab", "assignment"].map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={filters.type.includes(type)}
                          onCheckedChange={() => toggleArrayFilter("type", type)}
                        />
                        <label htmlFor={type} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">
                          {type}s
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div className="space-y-3">
                  <h4 className="font-medium">Difficulty</h4>
                  <div className="space-y-2">
                    {["beginner", "intermediate", "advanced"].map(difficulty => (
                      <div key={difficulty} className="flex items-center space-x-2">
                        <Checkbox
                          id={difficulty}
                          checked={filters.difficulty.includes(difficulty)}
                          onCheckedChange={() => toggleArrayFilter("difficulty", difficulty)}
                        />
                        <label htmlFor={difficulty} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">
                          {difficulty}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories Filter */}
                {categories && categories.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Categories</h4>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={filters.categories.includes(category.name)}
                            onCheckedChange={() => toggleArrayFilter("categories", category.name)}
                          />
                          <label htmlFor={`category-${category.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags Filter */}
                {availableTags.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Tags</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableTags.slice(0, 20).map(tag => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={filters.tags.includes(tag)}
                            onCheckedChange={() => toggleArrayFilter("tags", tag)}
                          />
                          <label htmlFor={`tag-${tag}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duration Filter */}
                <div className="space-y-3">
                  <h4 className="font-medium">Duration</h4>
                  <Select value={filters.duration} onValueChange={(value) => updateFilter("duration", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any duration</SelectItem>
                      <SelectItem value="short">Short (&lt; 5 hours)</SelectItem>
                      <SelectItem value="medium">Medium (5-20 hours)</SelectItem>
                      <SelectItem value="long">Long (&gt; 20 hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Search Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {isLoading ? "Searching..." : `Found ${results?.length || 0} results`}
              </h2>
              {filters.query && (
                <p className="text-muted-foreground">
                  for "{filters.query}"
                </p>
              )}
            </div>
            
            <Select defaultValue="relevance">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : results?.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search query or filters
                  </p>
                </div>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {results?.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <Badge variant={getTypeColor(item.type)} className="capitalize">
                            {item.type}
                          </Badge>
                          <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                            {item.difficulty}
                          </Badge>
                          {item.isEnrolled && (
                            <Badge variant="default">Enrolled</Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription className="text-base">{item.description}</CardDescription>
                      </div>
                      {item.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {item.rating}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar for enrolled content */}
                      {item.isEnrolled && item.progress !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Your Progress</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all" 
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {item.tags.slice(0, 6).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 6 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.tags.length - 6} more
                          </Badge>
                        )}
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {(item.duration || item.estimatedTime) && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {item.duration ? `${item.duration}h` : item.estimatedTime}
                            </div>
                          )}
                          {item.enrollmentCount && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {item.enrollmentCount.toLocaleString()} enrolled
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" asChild>
                            <Link href={`/${item.type}s/${item.id}`}>
                              View Details
                            </Link>
                          </Button>
                          {item.isEnrolled ? (
                            <Button asChild>
                              <Link href={`/${item.type}s/${item.id}`}>
                                Continue Learning
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Link>
                            </Button>
                          ) : (
                            <Button>
                              Enroll Now
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}