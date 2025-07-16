/*
  # Create likes and retweets tables

  1. New Tables
    - `likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `tweet_id` (uuid, foreign key to tweets)
      - `created_at` (timestamp)
      - Unique constraint on (user_id, tweet_id)
    
    - `retweets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `tweet_id` (uuid, foreign key to tweets)
      - `created_at` (timestamp)
      - Unique constraint on (user_id, tweet_id)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to like/unlike tweets
    - Add policies for authenticated users to retweet/unretweet tweets
    - Add policies for public read access

  3. Indexes
    - Index on user_id and tweet_id for efficient queries
*/

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tweet_id uuid REFERENCES tweets(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, tweet_id)
);

-- Create retweets table
CREATE TABLE IF NOT EXISTS retweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tweet_id uuid REFERENCES tweets(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, tweet_id)
);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retweets ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY "Anyone can read likes"
  ON public.likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can like tweets"
  ON public.likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike tweets"
  ON public.likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Retweets policies
CREATE POLICY "Anyone can read retweets"
  ON public.retweets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can retweet"
  ON public.retweets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unretweet"
  ON public.retweets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS likes_tweet_id_idx ON public.likes(tweet_id);
CREATE INDEX IF NOT EXISTS retweets_user_id_idx ON public.retweets(user_id);
CREATE INDEX IF NOT EXISTS retweets_tweet_id_idx ON public.retweets(tweet_id);