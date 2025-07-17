/*
  # Storage Setup for Tweet Media

  1. Storage Bucket
    - Create tweet-media bucket for user uploads
    - Set up RLS policies for secure access

  2. Storage Policies
    - Users can upload their own media
    - Public read access for all media
    - Users can delete their own media

  3. Helper Functions
    - Function to clean up orphaned media files
*/

-- Create storage bucket for tweet media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tweet-media', 'tweet-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tweet media
CREATE POLICY "Users can upload tweet media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'tweet-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public read access for tweet media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'tweet-media');

CREATE POLICY "Users can delete own tweet media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'tweet-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Function to clean up orphaned media files
CREATE OR REPLACE FUNCTION cleanup_orphaned_media()
RETURNS void AS $$
BEGIN
  -- Delete storage objects that are not referenced by any tweets
  DELETE FROM storage.objects
  WHERE bucket_id = 'tweet-media'
  AND name NOT IN (
    SELECT DISTINCT media_url
    FROM public.tweets
    WHERE media_url IS NOT NULL
    AND media_url LIKE '%' || name || '%'
  )
  AND created_at < (now() - interval '24 hours'); -- Only delete files older than 24 hours
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;