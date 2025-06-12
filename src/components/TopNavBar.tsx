
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopNavBarProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ onSearch, searchQuery }) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality will be handled by parent component
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold gradient-text">YouthVoice</h1>
        </div>

        {/* Search */}
        <div className="flex items-center flex-1 max-w-md mx-4">
          {isSearchExpanded ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsSearchExpanded(false);
                  onSearch('');
                }}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchExpanded(true)}
              className="ml-auto text-gray-400 hover:text-white"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavBar;
