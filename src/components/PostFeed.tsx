
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAnonymousUserId } from '@/utils/anonymousUser';
import PostCard from './PostCard';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

interface Post {
  id: string;
  type: 'text' | 'image' | 'video';
  title?: string;
  content?: string;
  content_url?: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  created_at: string;
}

interface PostFeedProps {
  postType?: 'text' | 'image' | 'video' | 'all';
  refreshTrigger?: number;
}

const PostFeed: React.FC<PostFeedProps> = ({ postType = 'all', refreshTrigger = 0 }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'top'>('latest');
  const { toast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('*');

      if (postType !== 'all') {
        query = query.eq('type', postType);
      }

      // Apply sorting
      switch (sortBy) {
        case 'trending':
          query = query.order('likes_count', { ascending: false });
          break;
        case 'top':
          query = query.order('likes_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) {
        throw error;
      }

      setPosts(data || []);

      // Fetch user's likes
      const anonymousId = getAnonymousUserId();
      const { data: likesData } = await supabase
        .from('likes')
        .select('post_id')
        .eq('anonymous_user_id', anonymousId);

      setUserLikes(new Set(likesData?.map(like => like.post_id) || []));
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [postType, sortBy, refreshTrigger]);

  const handleLike = async (postId: string) => {
    const anonymousId = getAnonymousUserId();
    const isLiked = userLikes.has(postId);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('anonymous_user_id', anonymousId);

        if (error) throw error;

        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });

        // Update post likes count
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count - 1 }
            : post
        ));
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            anonymous_user_id: anonymousId
          });

        if (error) throw error;

        setUserLikes(prev => new Set([...prev, postId]));

        // Update post likes count
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to post detail view (to be implemented)
    window.location.href = `/post/${postId}`;
  };

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post on YouthVoice',
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Post link has been copied to clipboard"
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: "Share link",
          description: shareUrl,
        });
      }
    }
  };

  const handleRepost = async (postId: string) => {
    // For now, just increment repost count
    try {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, reposts_count: post.reposts_count + 1 }
          : post
      ));

      toast({
        title: "Reposted!",
        description: "Post has been shared to your feed"
      });
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={(value: 'latest' | 'trending' | 'top') => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="top">Top</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" size="sm" onClick={fetchPosts}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onRepost={handleRepost}
              isLiked={userLikes.has(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostFeed;
