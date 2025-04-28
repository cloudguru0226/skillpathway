import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  BookOpen, 
  FileText, 
  BookOpenCheck, 
  Video, 
  Code, 
  Link,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

type ResourceType = {
  id: number;
  title: string;
  description: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export default function GuidesPage() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['/api/resources'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/resources');
        if (!res.ok) throw new Error('Failed to fetch resources');
        return await res.json();
      } catch (error) {
        console.error('Error fetching resources:', error);
        return [];
      }
    }
  });

  const filteredResources = resources
    .filter((resource: ResourceType) => {
      if (!selectedType) return true;
      return resource.type === selectedType;
    })
    .filter((resource: ResourceType) => {
      if (!search) return true;
      return (
        resource.title.toLowerCase().includes(search.toLowerCase()) ||
        (resource.description && resource.description.toLowerCase().includes(search.toLowerCase()))
      );
    });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'tutorial':
        return <Code className="h-5 w-5" />;
      case 'book':
        return <BookOpenCheck className="h-5 w-5" />;
      default:
        return <Link className="h-5 w-5" />;
    }
  };

  const resourceTypes = [
    { value: 'article', label: 'Articles' },
    { value: 'video', label: 'Videos' },
    { value: 'tutorial', label: 'Tutorials' },
    { value: 'book', label: 'Books' },
  ];

  const demoResources = [
    { 
      id: 1, 
      title: 'Getting Started with React',
      description: 'A comprehensive guide to React fundamentals for beginners',
      type: 'article',
      url: 'https://example.com/react-guide',
      thumbnailUrl: '',
      createdAt: '2023-05-10T12:00:00Z',
      updatedAt: '2023-05-10T12:00:00Z'
    },
    { 
      id: 2, 
      title: 'Modern JavaScript Tutorial',
      description: 'From the basics to advanced topics with simple, detailed explanations',
      type: 'tutorial',
      url: 'https://example.com/js-tutorial',
      thumbnailUrl: '',
      createdAt: '2023-06-15T12:00:00Z',
      updatedAt: '2023-06-15T12:00:00Z'
    },
    { 
      id: 3, 
      title: 'Full Node.js Course',
      description: 'Learn server-side JavaScript and build modern backend applications',
      type: 'video',
      url: 'https://example.com/nodejs-video',
      thumbnailUrl: '',
      createdAt: '2023-07-20T12:00:00Z',
      updatedAt: '2023-07-20T12:00:00Z'
    },
    { 
      id: 4, 
      title: 'Eloquent JavaScript',
      description: 'A book about JavaScript, programming, and the wonders of the digital',
      type: 'book',
      url: 'https://example.com/eloquent-js',
      thumbnailUrl: '',
      createdAt: '2023-04-05T12:00:00Z',
      updatedAt: '2023-04-05T12:00:00Z'
    },
    { 
      id: 5, 
      title: 'Understanding CSS Grid',
      description: 'A complete guide to CSS Grid layout system',
      type: 'article',
      url: 'https://example.com/css-grid',
      thumbnailUrl: '',
      createdAt: '2023-08-12T12:00:00Z',
      updatedAt: '2023-08-12T12:00:00Z'
    },
  ];

  // Use demoResources if no real resources are available
  const displayResources = filteredResources.length > 0 ? filteredResources : demoResources;

  return (
    <div>
      <Helmet>
        <title>Guides & Resources | Learning Platform</title>
      </Helmet>
      
      <div className="container py-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Guides & Resources</h1>
            <p className="text-muted-foreground mt-1">
              Curated guides, articles, videos, and tutorials to help you on your learning journey
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
              <Button 
                variant={selectedType === null ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedType(null)}
                className="whitespace-nowrap"
              >
                All
              </Button>
              
              {resourceTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.value === selectedType ? null : type.value)}
                  className="whitespace-nowrap"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-40 bg-secondary animate-pulse" />
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-secondary rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-secondary rounded animate-pulse mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-full bg-secondary rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-secondary rounded animate-pulse mt-2" />
                  </CardContent>
                </Card>
              ))
            ) : displayResources.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No resources found</h3>
                <p className="text-muted-foreground mb-6">
                  {search || selectedType ? 'Try changing your search or filters' : 'Resources will be added soon!'}
                </p>
                <Button variant="outline">Browse Roadmaps Instead</Button>
              </div>
            ) : (
              displayResources.map((resource: ResourceType) => (
                <Card key={resource.id} className="overflow-hidden flex flex-col">
                  <div className="bg-muted h-40 flex items-center justify-center">
                    {resource.thumbnailUrl ? (
                      <img 
                        src={resource.thumbnailUrl} 
                        alt={resource.title} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        {getResourceIcon(resource.type)}
                        <span className="mt-2 text-sm capitalize">{resource.type}</span>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="capitalize mb-2">
                        {resource.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-1">{resource.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">
                      {resource.description}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      View Resource
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
          
          <div className="flex justify-center pt-8">
            <Button variant="outline" size="lg" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Load More Resources
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}