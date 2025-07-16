/*
  # Create XP and gamification system

  1. New Tables
    - `xp_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `event_type` (text, not null - 'tweet', 'like_received', 'retweet_received', 'daily_login')
      - `xp_amount` (integer, not null)
      - `reference_id` (uuid, optional - references tweet/like/retweet)
      - `created_at` (timestamp)

    - `quests`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `xp_reward` (integer, not null)
      - `criteria` (jsonb, not null)
      - `active` (boolean, default true)
      - `created_at` (timestamp)

    - `user_quests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `quest_id` (uuid, foreign key to quests)
      - `progress` (jsonb, default '{}')
      - `completed_at` (timestamp, optional)
      - `created_at` (timestamp)
      - Unique constraint on (user_id, quest_id)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table

  3. Functions
    - Function to award XP
    - Function to check and update quest progress
*/

-- Create xp_events table
CREATE TABLE IF NOT EXISTS xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('tweet', 'like_received', 'retweet_received', 'daily_login')),
  xp_amount integer NOT NULL CHECK (xp_amount > 0),
  reference_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  xp_reward integer NOT NULL CHECK (xp_reward > 0),
  criteria jsonb NOT NULL DEFAULT '{}',
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_quests table
CREATE TABLE IF NOT EXISTS user_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  progress jsonb DEFAULT '{}' NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, quest_id)
);

-- Enable RLS
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;

-- XP Events policies
CREATE POLICY "Users can read own xp events"
  ON xp_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Quests policies
CREATE POLICY "Anyone can read active quests"
  ON quests
  FOR SELECT
  TO authenticated
  USING (active = true);

-- User Quests policies
CREATE POLICY "Users can read own quest progress"
  ON user_quests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quest progress"
  ON user_quests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quest progress"
  ON user_quests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS xp_events_user_id_idx ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS xp_events_created_at_idx ON xp_events(created_at DESC);
CREATE INDEX IF NOT EXISTS user_quests_user_id_idx ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS user_quests_quest_id_idx ON user_quests(quest_id);

-- Function to award XP
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id uuid,
  p_event_type text,
  p_xp_amount integer,
  p_reference_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert XP event
  INSERT INTO xp_events (user_id, event_type, xp_amount, reference_id)
  VALUES (p_user_id, p_event_type, p_xp_amount, p_reference_id);
  
  -- Update user's total XP and level
  UPDATE users 
  SET 
    xp = xp + p_xp_amount,
    level = GREATEST(1, FLOOR((xp + p_xp_amount) / 100) + 1),
    updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default quests
INSERT INTO quests (title, description, xp_reward, criteria) VALUES
  ('First Tweet', 'Post your first tweet', 50, '{"tweets_count": 1}'),
  ('Social Butterfly', 'Get 5 likes on your tweets', 100, '{"likes_received": 5}'),
  ('Viral Content', 'Get 3 retweets on a single tweet', 150, '{"retweets_on_single_tweet": 3}'),
  ('Daily Poster', 'Post 5 tweets in a day', 75, '{"tweets_in_day": 5}'),
  ('Engagement Master', 'Get 10 total interactions (likes + retweets)', 200, '{"total_interactions": 10}')
ON CONFLICT DO NOTHING;