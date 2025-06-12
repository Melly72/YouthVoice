
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { getAnonymousUserId } from '@/utils/anonymousUser';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  anonymous_user_id: string;
  created_at: string;
  likes_count?: number;
  replies?: Comment[];
}

interface CommentSystemProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentSystem: React.FC<CommentSystemProps> = ({ postId, isOpen, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('comments-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${postId}`
          },
          (payload) => {
            setComments(prev => [...prev, payload.new as Comment]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          content: newComment.trim(),
          anonymous_user_id: getAnonymousUserId()
        });

      if (error) throw error;

      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-black w-full h-2/3 rounded-t-3xl border-t border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-white font-semibold">Comments</h3>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </Button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {loading ? (
            <div className="text-center text-gray-400">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-400">No comments yet. Be the first to comment!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">A</span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-800 rounded-2xl px-4 py-2">
                    <p className="text-white text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white p-0 h-auto">
                      Like
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-gray-400 hover:text-white p-0 h-auto"
                      onClick={() => setReplyTo(comment.id)}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment input */}
        <div className="p-4 border-t border-gray-800">
          <form onSubmit={handleSubmitComment} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold">A</span>
            </div>
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? "Reply to comment..." : "Add a comment..."}
              className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full"
            />
            <Button type="submit" size="icon" className="bg-pink-500 hover:bg-pink-600 rounded-full">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentSystem;
