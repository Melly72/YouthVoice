
import React from 'react';
import { Play } from 'lucide-react';

interface ReelItem {
  id: string;
  thumbnail: string;
  title: string;
}

interface ReelsSectionProps {
  reels: ReelItem[];
  onReelClick: (reelId: string) => void;
}

const ReelsSection: React.FC<ReelsSectionProps> = ({ reels, onReelClick }) => {
  // Mock reels data for now
  const mockReels = [
    { id: '1', thumbnail: '/placeholder.svg', title: 'Youth Voice #1' },
    { id: '2', thumbnail: '/placeholder.svg', title: 'Creative Post' },
    { id: '3', thumbnail: '/placeholder.svg', title: 'Trending Now' },
    { id: '4', thumbnail: '/placeholder.svg', title: 'Community' },
    { id: '5', thumbnail: '/placeholder.svg', title: 'Latest' },
  ];

  return (
    <div className="px-4 py-3 bg-black">
      <h2 className="text-white font-semibold mb-3">Reels</h2>
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
        {mockReels.map((reel) => (
          <div
            key={reel.id}
            onClick={() => onReelClick(reel.id)}
            className="flex-shrink-0 cursor-pointer"
          >
            <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-1 left-1 right-1">
                <p className="text-white text-xs font-medium truncate">{reel.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelsSection;
