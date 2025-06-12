
import React from 'react';
import { Facebook, Twitter, MessageSquare, Link, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, postId, postTitle }) => {
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/post/${postId}`;

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => {
        const text = postTitle ? `Check out: ${postTitle}` : 'Check out this post on YouthVoice';
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      action: () => {
        const text = postTitle ? `Check out: ${postTitle} ${shareUrl}` : `Check out this post: ${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    },
    {
      name: 'Copy Link',
      icon: Copy,
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link copied!",
            description: "Post link has been copied to clipboard"
          });
          onClose();
        } catch (error) {
          toast({
            title: "Share link",
            description: shareUrl,
          });
        }
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-black w-full rounded-t-3xl border-t border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Share Post</h3>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.name}
                variant="ghost"
                onClick={option.action}
                className="flex flex-col items-center space-y-2 p-4 h-auto bg-gray-800 hover:bg-gray-700 rounded-2xl"
              >
                <Icon className="h-6 w-6 text-white" />
                <span className="text-white text-sm">{option.name}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
