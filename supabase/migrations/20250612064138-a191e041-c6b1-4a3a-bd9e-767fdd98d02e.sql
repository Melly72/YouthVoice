
-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video')),
  title TEXT,
  content TEXT,
  content_url TEXT,
  anonymous_user_id TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  anonymous_user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  anonymous_user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, anonymous_user_id)
);

-- Create donations table for tracking fundraising progress
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount INTEGER NOT NULL,
  donor_name TEXT,
  message TEXT,
  anonymous_user_id TEXT,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Enable Row Level Security (RLS) but allow all operations for anonymous access
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for anonymous access
CREATE POLICY "Allow all operations on posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on likes" ON public.likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on donations" ON public.donations FOR ALL USING (true) WITH CHECK (true);

-- Storage policies for media bucket
CREATE POLICY "Allow all operations on media bucket" ON storage.objects FOR ALL USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');

-- Enable realtime for comments table
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
