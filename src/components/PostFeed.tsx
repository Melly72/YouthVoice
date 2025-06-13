import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAnonymousUserId } from '@/utils/anonymousUser';
import MediaCard from './MediaCard';
import { useToast } from '@/hooks/use-toast';
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

      // Type assertion to ensure proper typing
      const typedPosts: Post[] = (data || []).map(post => ({
        ...post,
        type: post.type as 'text' | 'image' | 'video'
      }));

      setPosts(typedPosts);

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
    console.log(`Opening comments for post ${postId}`);
  };

  const handleShare = async (postId: string) => {
    console.log(`Sharing post ${postId}`);
  };

  const handleRepost = async (postId: string) => {
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
      <div className="flex justify-center items-center h-screen bg-black">
        <RefreshCw className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* TikTok-style vertical feed */}
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center h-screen text-white">
            <p className="text-xl">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="snap-start h-screen">
              <MediaCard
                post={post}
                onLike={() => handleLike(post.id)}
                onComment={() => handleComment(post.id)}
                onShare={() => handleShare(post.id)}
                onRepost={() => handleRepost(post.id)}
                isLiked={userLikes.has(post.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PostFeed;
