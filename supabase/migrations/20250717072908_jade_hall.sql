/*
  # Follows System

  1. New Tables
    - `follows`
      - `id` (uuid, primary key)
      - `follower_id` (uuid, foreign key to users)
      - `following_id` (uuid, foreign key to users)
      - `created_at` (timestamp)
      - Unique constraint on (follower_id, following_id)
      - Check constraint to prevent self-follows

  2. Security
    - Enable RLS on follows table
    - Add policies for authenticated users to follow/unfollow
    - Add policy for public read access

  3. Functions
    - Function to get follower/following counts
    - Function to check if user is following another user

  4. Indexes
    - Index on follower_id and following_id for efficient queries
*/

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read follows"
  ON public.follows
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can follow others"
  ON public.follows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
  ON public.follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS follows_created_at_idx ON public.follows(created_at DESC);

-- Function to get user follow stats
CREATE OR REPLACE FUNCTION get_user_follow_stats(p_user_id uuid)
RETURNS TABLE(
  followers_count bigint,
  following_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.follows WHERE following_id = p_user_id) as followers_count,
    (SELECT COUNT(*) FROM public.follows WHERE follower_id = p_user_id) as following_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is following another user
CREATE OR REPLACE FUNCTION is_following(p_follower_id uuid, p_following_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.follows 
    WHERE follower_id = p_follower_id AND following_id = p_following_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get following feed (tweets from followed users)
CREATE OR REPLACE FUNCTION get_following_feed(p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
RETURNS TABLE(
  tweet_id uuid,
  user_id uuid,
  content text,
  media_url text,
  parent_id uuid,
  created_at timestamptz,
  username text,
  avatar_url text,
  user_level integer,
  user_xp integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as tweet_id,
    t.user_id,
    t.content,
    t.media_url,
    t.parent_id,
    t.created_at,
    u.username,
    u.avatar_url,
    u.level as user_level,
    u.xp as user_xp
  FROM public.tweets t
  JOIN public.users u ON t.user_id = u.id
  WHERE t.user_id IN (
    SELECT following_id FROM public.follows WHERE follower_id = p_user_id
  )
  AND t.parent_id IS NULL
  ORDER BY t.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;