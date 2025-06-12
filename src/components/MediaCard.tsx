
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import FloatingActions from './FloatingActions';
import CommentSystem from './CommentSystem';
import ShareModal from './ShareModal';

interface MediaCardProps {
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
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onRepost: () => void;
  isLiked?: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onRepost,
  isLiked = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleCommentClick = () => {
    setShowComments(true);
    onComment();
  };

  const handleShareClick = () => {
    setShowShareModal(true);
    onShare();
  };

  const renderMedia = () => {
    if (post.type === 'video' && post.content_url) {
      return (
        <video
          src={post.content_url}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      );
    }
    
    if (post.type === 'image' && post.content_url && !imageError) {
      return (
        <img
          src={post.content_url}
          alt={post.title || 'Posted image'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      );
    }
    
    // Enhanced text post background with dynamic gradients
    const gradients = [
      'from-purple-900 via-pink-900 to-blue-900',
      'from-green-900 via-teal-900 to-cyan-900',
      'from-orange-900 via-red-900 to-pink-900',
      'from-indigo-900 via-purple-900 to-pink-900',
      'from-yellow-900 via-orange-900 to-red-900'
    ];
    
    const gradientIndex = post.id.charCodeAt(0) % gradients.length;
    const selectedGradient = gradients[gradientIndex];
    
    return (
      <div className={`w-full h-full bg-gradient-to-br ${selectedGradient} flex items-center justify-center p-8 relative overflow-hidden`}>
        {/* Dynamic background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-pink-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>
        
        <div className="text-center relative z-10">
          {post.title && (
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">{post.title}</h2>
          )}
          {post.content && (
            <p className="text-xl text-white leading-relaxed max-w-md">{post.content}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="relative w-full h-full bg-black">
        {/* Media content */}
        {renderMedia()}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Bottom overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-24">
          <div className="flex justify-between items-end">
            {/* Left side - content info */}
            <div className="flex-1 pr-4">
              <div className="text-white space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">A</span>
                  </div>
                  <span className="font-medium">@anonymous</span>
                </div>
                
                {(post.title || post.content) && (
                  <div className="space-y-1">
                    {post.title && <p className="font-semibold text-lg">{post.title}</p>}
                    {post.content && post.type !== 'text' && (
                      <p className="text-sm opacity-90">{post.content}</p>
                    )}
                  </div>
                )}
                
                <p className="text-xs opacity-70">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            {/* Right side - floating actions */}
            <FloatingActions
              likesCount={post.likes_count}
              commentsCount={post.comments_count}
              repostsCount={post.reposts_count}
              isLiked={isLiked}
              onLike={onLike}
              onComment={handleCommentClick}
              onShare={handleShareClick}
              onRepost={onRepost}
            />
          </div>
        </div>
      </div>

      {/* Comment System Modal */}
      <CommentSystem
        postId={post.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={post.id}
        postTitle={post.title}
      />
    </>
  );
};

export default MediaCard;
