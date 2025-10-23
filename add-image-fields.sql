-- Add before and after image fields to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS before_image_url TEXT,
ADD COLUMN IF NOT EXISTS after_image_url TEXT;

-- Create storage bucket for ticket images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-images', 'ticket-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage bucket
CREATE POLICY IF NOT EXISTS "Anyone can view ticket images" ON storage.objects
FOR SELECT USING (bucket_id = 'ticket-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload ticket images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'ticket-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Users can update their own ticket images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'ticket-images' 
  AND auth.role() = 'authenticated'
);

