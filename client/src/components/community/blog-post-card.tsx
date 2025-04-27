import { formatDistanceToNow } from "date-fns";
import { Eye, Calendar, User, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { BlogPost } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface BlogPostCardProps {
  post: BlogPost;
  variant?: "default" | "compact";
  className?: string;
  onClick?: () => void;
}

export function BlogPostCard({ 
  post, 
  variant = "default", 
  className = "",
  onClick 
}: BlogPostCardProps) {
  const isCompact = variant === "compact";
  
  // Format date for display
  const publishDate = post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt);
  const formattedDate = formatDistanceToNow(publishDate, { addSuffix: true });
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={className}
      onClick={onClick}
    >
      <Card className={`overflow-hidden h-full cursor-pointer hover:border-primary/30 transition-all ${onClick ? 'cursor-pointer' : ''}`}>
        {post.coverImageUrl && !isCompact && (
          <div className="h-48 overflow-hidden relative">
            <img 
              src={post.coverImageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <CardHeader className={`${isCompact ? 'p-4' : 'pt-5'}`}>
          <div className="flex items-start justify-between gap-4">
            <h3 className={`font-semibold ${isCompact ? 'text-base' : 'text-xl'} line-clamp-2`}>
              {post.title}
            </h3>
            {post.isPromoted && (
              <Badge variant="default" className="bg-primary">Featured</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              <span>{post.viewCount} views</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={`${isCompact ? 'px-4 pb-4 pt-0' : ''}`}>
          {!isCompact && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {post.excerpt || post.content.substring(0, 150) + '...'}
            </p>
          )}
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-0 h-5 text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7">
              <AvatarImage src={post.user?.avatarUrl} alt={post.user?.username} />
              <AvatarFallback>
                {post.user?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs">
                {post.user?.username || "Anonymous"}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}