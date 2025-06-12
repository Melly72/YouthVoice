import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNavBar from '@/components/BottomNavBar';
import TopNavBar from '@/components/TopNavBar';
import ReelsSection from '@/components/ReelsSection';
import PostFeed from '@/components/PostFeed';
import UploadForm from '@/components/UploadForm';
import DonationPage from '@/components/DonationPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [feedType, setFeedType] = useState<'text' | 'image' | 'video' | 'all'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('home'); // Navigate back to home after posting
  };

  const handleReelClick = (reelId: string) => {
    console.log(`Opening reel ${reelId}`);
    // Future implementation for reel detail view
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Future implementation for search functionality
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadForm onPostCreated={handlePostCreated} />;
      
      case 'feed':
        return (
          <div className="min-h-screen bg-black pt-16">
            {/* Feed tabs */}
            <div className="sticky top-16 bg-black/90 backdrop-blur-md border-b border-gray-800 z-40">
              <Tabs value={feedType} onValueChange={(value) => setFeedType(value as typeof feedType)} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-900 mx-4 mt-4 mb-2">
                  <TabsTrigger value="all" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">All</TabsTrigger>
                  <TabsTrigger value="text" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Text</TabsTrigger>
                  <TabsTrigger value="image" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Images</TabsTrigger>
                  <TabsTrigger value="video" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Videos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <PostFeed postType={feedType} refreshTrigger={refreshTrigger} />
          </div>
        );
      
      case 'donate':
        return <DonationPage />;
      
      case 'about':
        return (
          <div className="min-h-screen bg-black text-white p-6 pb-20 pt-20">
            <div className="max-w-md mx-auto space-y-8">
              <h1 className="text-3xl font-bold text-center text-pink-500">About YouthVoice</h1>
              
              <div className="space-y-6 text-gray-300">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">Our Mission</h2>
                  <p>Empowering young voices through anonymous, safe, and authentic community sharing. We believe every young person deserves a platform to express themselves freely.</p>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">Anonymous & Safe</h2>
                  <p>Share your thoughts, creativity, and experiences without fear of judgment. No accounts required, complete anonymity guaranteed.</p>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">Community Guidelines</h2>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Be respectful and kind to others</li>
                    <li>No harassment or bullying</li>
                    <li>Keep content appropriate for all ages</li>
                    <li>Report inappropriate content</li>
                  </ul>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">Support Us</h2>
                  <p>Help us keep this platform free and accessible by donating to our youth empowerment initiative.</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default: // home
        return (
          <div className="min-h-screen bg-black pt-16">
            <ReelsSection reels={[]} onReelClick={handleReelClick} />
            <PostFeed postType="all" refreshTrigger={refreshTrigger} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {(activeTab === 'home' || activeTab === 'feed') && (
        <TopNavBar onSearch={handleSearch} searchQuery={searchQuery} />
      )}
      {renderContent()}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
