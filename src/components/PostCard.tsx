
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Repeat, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: {
    id: string;
    type: 'text' | 'image' | 'video';
    title?: string;
    content?: string;
    content_url?: string;
    likes_count: number;
    comments_count: number;
    reposts_count: number;
    created_at: string;
  };
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onRepost: (postId: string) => void;
  isLiked?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onRepost,
  isLiked = false
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const renderMedia = () => {
    if (post.type === 'image' && post.content_url && !imageError) {
      return (
        <img
          src={post.content_url}
          alt={post.title || 'Posted image'}
          className="w-full h-64 object-cover rounded-lg"
          onError={handleImageError}
        />
      );
    }
    
    if (post.type === 'video' && post.content_url) {
      return (
        <video
          src={post.content_url}
          controls
          className="w-full h-64 rounded-lg"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full mb-4 hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {post.type}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        {post.title && (
          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        )}
        
        {post.content && (
          <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
        )}
        
        {renderMedia()}
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes_count}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment(post.id)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRepost(post.id)}
              className="flex items-center gap-2"
            >
              <Repeat className="h-4 w-4" />
              <span>{post.reposts_count}</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare(post.id)}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
