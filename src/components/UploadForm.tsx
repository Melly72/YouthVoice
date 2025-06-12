
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Type, Image, Video, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getAnonymousUserId } from '@/utils/anonymousUser';
import { useToast } from '@/hooks/use-toast';

interface UploadFormProps {
  onPostCreated: () => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onPostCreated }) => {
  const [postType, setPostType] = useState<'text' | 'image' | 'video'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() && !content.trim() && !file) {
      toast({
        title: "Empty post",
        description: "Please add some content to your post",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      let contentUrl = null;
      
      if (file) {
        contentUrl = await uploadFile(file);
        if (!contentUrl) {
          throw new Error('Failed to upload file');
        }
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          type: postType,
          title: title.trim() || null,
          content: content.trim() || null,
          content_url: contentUrl,
          anonymous_user_id: getAnonymousUserId()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Posted!",
        description: "Your post has been shared anonymously"
      });

      // Reset form
      setTitle('');
      setContent('');
      setFile(null);
      setPostType('text');
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const typeButtons = [
    { type: 'text' as const, icon: Type, label: 'Text', color: 'bg-blue-500' },
    { type: 'image' as const, icon: Image, label: 'Image', color: 'bg-green-500' },
    { type: 'video' as const, icon: Video, label: 'Video', color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8 text-pink-500">Share Anonymously</h1>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-center">Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Post type selector */}
              <div className="space-y-3">
                <Label className="text-white">Post Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {typeButtons.map(({ type, icon: Icon, label, color }) => (
                    <Button
                      key={type}
                      type="button"
                      variant={postType === type ? "default" : "outline"}
                      onClick={() => setPostType(type)}
                      className={`flex flex-col items-center space-y-2 h-20 ${
                        postType === type 
                          ? `${color} text-white` 
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Title (Optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add a catchy title..."
                  maxLength={200}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              {/* Content input */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-white">
                  {postType === 'text' ? 'Content' : 'Caption (Optional)'}
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={postType === 'text' ? "Share your thoughts..." : "Add a caption..."}
                  rows={4}
                  maxLength={2000}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              {/* File upload for media */}
              {(postType === 'image' || postType === 'video') && (
                <div className="space-y-2">
                  <Label htmlFor="file-upload" className="text-white">
                    Upload {postType === 'image' ? 'Image' : 'Video'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept={postType === 'image' ? 'image/*' : 'video/*'}
                      className="bg-gray-800 border-gray-700 text-white file:bg-pink-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4"
                    />
                  </div>
                  {file && (
                    <p className="text-sm text-gray-400">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              )}

              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition-colors duration-200"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Posting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Post Anonymously</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadForm;
