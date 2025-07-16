/*
  # Create tweets table and related functionality

  1. New Tables
    - `tweets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `content` (text, not null, max 280 chars)
      - `media_url` (text, optional)
      - `parent_id` (uuid, optional, for replies/threads)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `tweets` table
    - Add policies for authenticated users to create tweets
    - Add policy for public read access to tweets
    - Add policy for users to delete their own tweets

  3. Indexes
    - Index on user_id for efficient user tweet queries
    - Index on parent_id for thread queries
    - Index on created_at for timeline queries
*/

-- Create tweets table
CREATE TABLE IF NOT EXISTS tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL CHECK (char_length(content) <= 280 AND char_length(content) > 0),
  media_url text,
  parent_id uuid REFERENCES tweets(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read tweets"
  ON public.tweets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tweets"
  ON public.tweets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tweets"
  ON public.tweets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS tweets_user_id_idx ON public.tweets(user_id);
CREATE INDEX IF NOT EXISTS tweets_parent_id_idx ON public.tweets(parent_id);
CREATE INDEX IF NOT EXISTS tweets_created_at_idx ON public.tweets(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_tweets_updated_at
  BEFORE UPDATE ON public.tweets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();