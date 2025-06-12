
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image, Video, Type } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getAnonymousUserId } from '@/utils/anonymousUser';
import { useToast } from '@/hooks/use-toast';

interface CreatePostFormProps {
  onPostCreated: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const [postType, setPostType] = useState<'text' | 'image' | 'video'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (postType === 'image' && !selectedFile.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      if (postType === 'video' && !selectedFile.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

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
        title: "Post created!",
        description: "Your post has been shared successfully"
      });

      // Reset form
      setTitle('');
      setContent('');
      setFile(null);
      setPostType('text');
      
      // Reset file input
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

  const getTypeIcon = () => {
    switch (postType) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <Type className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getTypeIcon()}
          Create New Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-type">Post Type</Label>
            <Select value={postType} onValueChange={(value: 'text' | 'image' | 'video') => setPostType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select post type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Post</SelectItem>
                <SelectItem value="image">Image Post</SelectItem>
                <SelectItem value="video">Video Post</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title to your post..."
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              maxLength={2000}
            />
          </div>

          {(postType === 'image' || postType === 'video') && (
            <div className="space-y-2">
              <Label htmlFor="file-upload">
                Upload {postType === 'image' ? 'Image' : 'Video'}
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept={postType === 'image' ? 'image/*' : 'video/*'}
                  className="flex-1"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isUploading}
          >
            {isUploading ? 'Creating Post...' : 'Create Post'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
