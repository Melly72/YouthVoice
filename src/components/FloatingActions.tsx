
import React from 'react';
import { Heart, MessageCircle, Share2, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionsProps {
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onRepost: () => void;
}

const FloatingActions: React.FC<FloatingActionsProps> = ({
  likesCount,
  commentsCount,
  repostsCount,
  isLiked,
  onLike,
  onComment,
  onShare,
  onRepost,
}) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Like button */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onLike}
          className={`w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border-0 hover:bg-black/40 transition-all duration-200 ${
            isLiked ? 'text-pink-500' : 'text-white'
          }`}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
        <span className="text-white text-xs mt-1 font-medium">
          {likesCount > 999 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}
        </span>
      </div>

      {/* Comment button */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onComment}
          className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border-0 hover:bg-black/40 transition-all duration-200 text-white"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        <span className="text-white text-xs mt-1 font-medium">
          {commentsCount > 999 ? `${(commentsCount / 1000).toFixed(1)}k` : commentsCount}
        </span>
      </div>

      {/* Repost button */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRepost}
          className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border-0 hover:bg-black/40 transition-all duration-200 text-white"
        >
          <Repeat className="w-6 h-6" />
        </Button>
        <span className="text-white text-xs mt-1 font-medium">
          {repostsCount > 999 ? `${(repostsCount / 1000).toFixed(1)}k` : repostsCount}
        </span>
      </div>

      {/* Share button */}
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onShare}
          className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border-0 hover:bg-black/40 transition-all duration-200 text-white"
        >
          <Share2 className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default FloatingActions;
