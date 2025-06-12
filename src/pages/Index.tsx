
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Share2, Users, Sparkles } from 'lucide-react';
import CreatePostForm from '@/components/CreatePostForm';
import PostFeed from '@/components/PostFeed';
import DonationPage from '@/components/DonationPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'donate'>('home');

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (currentView === 'donate') {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">YouthVoice</h1>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setCurrentView('home')}>
                  Home
                </Button>
                <Button variant="default">
                  Donate
                </Button>
              </div>
            </div>
          </div>
        </nav>
        <DonationPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">YouthVoice</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setCurrentView('home')}>
                Home
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('donate')}>
                <Heart className="h-4 w-4 mr-2" />
                Donate
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Share Your Voice Anonymously</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with your community, share your stories, and make your voice heard. 
            No registration required - just authentic, anonymous expression.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <span className="font-medium">Share Stories</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Users className="h-6 w-6 text-green-600" />
              <span className="font-medium">Connect Safely</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Share2 className="h-6 w-6 text-purple-600" />
              <span className="font-medium">Spread Awareness</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Post Form */}
          <div className="lg:col-span-1">
            <CreatePostForm onPostCreated={handlePostCreated} />
            
            {/* Stats Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Anonymous Users</span>
                  <span className="font-semibold">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Posts Shared</span>
                  <span className="font-semibold">12,395</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-semibold">45,672</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Likes Given</span>
                  <span className="font-semibold">128,493</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Post Feed */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="image">Images</TabsTrigger>
                <TabsTrigger value="video">Videos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <PostFeed postType="all" refreshTrigger={refreshTrigger} />
              </TabsContent>
              
              <TabsContent value="text" className="mt-6">
                <PostFeed postType="text" refreshTrigger={refreshTrigger} />
              </TabsContent>
              
              <TabsContent value="image" className="mt-6">
                <PostFeed postType="image" refreshTrigger={refreshTrigger} />
              </TabsContent>
              
              <TabsContent value="video" className="mt-6">
                <PostFeed postType="video" refreshTrigger={refreshTrigger} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">YouthVoice</span>
              </div>
              <p className="text-muted-foreground">
                Empowering young voices through anonymous, safe, and authentic community sharing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Guidelines</li>
                <li>Safety Center</li>
                <li>Report Content</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support Us</h3>
              <p className="text-muted-foreground mb-4">
                Help us keep this platform free and accessible for all young people.
              </p>
              <Button onClick={() => setCurrentView('donate')}>
                <Heart className="h-4 w-4 mr-2" />
                Donate Now
              </Button>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 YouthVoice. Building safer communities for young people.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
