import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DiscussionForm } from '@/components/community/discussion-form';
import { 
  Users, 
  MessageCircle, 
  Search, 
  MessageSquare, 
  Eye, 
  Filter, 
  PlusCircle,
  Bot,
  Award,
  Clock,
  Flame
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

export default function CommunityPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const { data: discussionTopics = [], isLoading } = useQuery({
    queryKey: ['/api/discussions'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/discussions');
        if (!res.ok) throw new Error('Failed to fetch discussions');
        return await res.json();
      } catch (error) {
        console.error('Error fetching discussions:', error);
        return [];
      }
    }
  });

  const popularTags = [
    'frontend', 'backend', 'devops', 'javascript', 'react',
    'python', 'node', 'database', 'aws', 'beginners'
  ];

  const filteredDiscussions = discussionTopics
    .filter((topic: any) => {
      if (filter === 'all') return true;
      if (filter === 'pinned') return topic.isPinned;
      if (filter === 'open') return !topic.isClosed;
      return true;
    })
    .filter((topic: any) => {
      if (!search) return true;
      return (
        topic.title.toLowerCase().includes(search.toLowerCase()) ||
        topic.content.toLowerCase().includes(search.toLowerCase())
      );
    })
    .filter((topic: any) => {
      if (!selectedTag) return true;
      if (!topic.tags) return false;
      return topic.tags.includes(selectedTag);
    });

  return (
    <div>
      <Helmet>
        <title>Community | Learning Platform</title>
      </Helmet>
      
      <div className="container py-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Community</h1>
              <p className="text-muted-foreground mt-1">
                Connect with other learners, ask questions, and join discussions
              </p>
            </div>
            
            <DiscussionForm 
              roadmapId={0}
              nodeId=""
              trigger={
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  New Discussion
                </Button>
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center w-full max-w-md relative">
                      <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search discussions..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[140px] gap-2">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Discussions</SelectItem>
                          <SelectItem value="pinned">Pinned Only</SelectItem>
                          <SelectItem value="open">Open Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                
                <Tabs defaultValue="latest">
                  <div className="px-6">
                    <TabsList className="w-full justify-start mb-6">
                      <TabsTrigger value="latest" className="flex gap-2">
                        <Clock className="h-4 w-4" /> Latest
                      </TabsTrigger>
                      <TabsTrigger value="popular" className="flex gap-2">
                        <Flame className="h-4 w-4" /> Popular
                      </TabsTrigger>
                      <TabsTrigger value="answered" className="flex gap-2">
                        <Award className="h-4 w-4" /> Answered
                      </TabsTrigger>
                    </TabsList>
                  </div>
                
                  <CardContent className="p-0">
                    <TabsContent value="latest" className="m-0">
                      {isLoading ? (
                        <div className="p-6 text-center">
                          <div className="animate-pulse flex flex-col items-center">
                            <div className="h-10 w-10 bg-secondary rounded-full mb-4"></div>
                            <div className="h-4 w-1/3 bg-secondary rounded mb-2"></div>
                            <div className="h-3 w-1/4 bg-secondary rounded"></div>
                          </div>
                          <p className="text-muted-foreground mt-4">Loading discussions...</p>
                        </div>
                      ) : filteredDiscussions.length === 0 ? (
                        <div className="p-6 text-center border-t border-border">
                          <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No discussions found</h3>
                          <p className="text-muted-foreground mb-4">
                            {search || selectedTag ? 'Try changing your search or filters' : 'Be the first to start a discussion!'}
                          </p>
                          <DiscussionForm 
                            roadmapId={0}
                            nodeId=""
                            trigger={
                              <Button variant="outline" className="gap-2">
                                <PlusCircle className="h-4 w-4" />
                                New Discussion
                              </Button>
                            }
                          />
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {filteredDiscussions.map((topic: any, index: number) => (
                            <div key={index} className="p-6 flex flex-col sm:flex-row gap-4">
                              <div className="flex flex-col items-center text-center space-y-1 min-w-[60px]">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    {topic.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  {topic.user?.username || 'User'}
                                </span>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <h3 className="font-medium text-lg line-clamp-1">
                                    {topic.isPinned && <span className="text-primary mr-1">📌</span>}
                                    {topic.title}
                                  </h3>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" /> 
                                      {topic.replyCount || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" /> 
                                      {topic.viewCount || 0}
                                    </span>
                                  </div>
                                </div>
                                
                                <p className="text-muted-foreground mt-2 line-clamp-2">
                                  {topic.content}
                                </p>
                                
                                <div className="flex flex-wrap items-center justify-between mt-3">
                                  <div className="flex flex-wrap gap-2">
                                    {topic.tags?.map((tag: string, i: number) => (
                                      <Badge 
                                        key={i} 
                                        variant="outline"
                                        className="cursor-pointer"
                                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  
                                  <span className="text-xs text-muted-foreground mt-2 sm:mt-0">
                                    {topic.createdAt ? new Date(topic.createdAt).toLocaleDateString() : 'Just now'}
                                  </span>
                                </div>
                                
                                <div className="mt-4">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-xs"
                                    onClick={() => alert('View discussion details (to be implemented)')}
                                  >
                                    View discussion
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="popular" className="m-0">
                      <div className="p-6 text-center border-t border-border">
                        <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Popular discussions coming soon</h3>
                        <p className="text-muted-foreground">
                          We're still gathering data on the most popular discussions.
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="answered" className="m-0">
                      <div className="p-6 text-center border-t border-border">
                        <Bot className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Answered discussions coming soon</h3>
                        <p className="text-muted-foreground">
                          This feature will show discussions with accepted answers.
                        </p>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Tags</CardTitle>
                  <CardDescription>
                    Browse discussions by topic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant={selectedTag === tag ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Community Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Discussions</span>
                    <span className="font-medium">{discussionTopics.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-medium">32</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Responses</span>
                    <span className="font-medium">124</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    Join Community
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}