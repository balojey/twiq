/*
  # Advanced Analytics and Reporting System

  1. New Tables
    - `user_analytics`
      - Daily/weekly/monthly user activity tracking
      - Engagement metrics and growth statistics
    
    - `content_analytics`
      - Tweet performance metrics
      - Trending content analysis
      - Hashtag performance tracking

  2. Functions
    - Advanced analytics functions for admin dashboard
    - User engagement scoring algorithms
    - Content recommendation engine

  3. Performance Optimizations
    - Materialized views for heavy analytics queries
    - Optimized indexes for reporting
*/

-- Create user analytics table for tracking daily metrics
CREATE TABLE IF NOT EXISTS user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  tweets_posted integer DEFAULT 0,
  likes_given integer DEFAULT 0,
  likes_received integer DEFAULT 0,
  retweets_given integer DEFAULT 0,
  retweets_received integer DEFAULT 0,
  replies_made integer DEFAULT 0,
  replies_received integer DEFAULT 0,
  new_followers integer DEFAULT 0,
  new_following integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  quests_completed integer DEFAULT 0,
  engagement_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

-- Create content analytics table
CREATE TABLE IF NOT EXISTS content_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id uuid REFERENCES tweets(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  retweets_count integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  reach_score numeric DEFAULT 0,
  hashtags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(tweet_id, date)
);

-- Enable RLS
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Users can read own analytics"
  ON user_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read content analytics"
  ON content_analytics
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_analytics_user_date_idx ON user_analytics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS user_analytics_date_idx ON user_analytics(date DESC);
CREATE INDEX IF NOT EXISTS content_analytics_tweet_date_idx ON content_analytics(tweet_id, date DESC);
CREATE INDEX IF NOT EXISTS content_analytics_engagement_idx ON content_analytics(engagement_rate DESC);

-- Function to calculate user engagement score
CREATE OR REPLACE FUNCTION calculate_user_engagement_score(p_user_id uuid, p_days integer DEFAULT 7)
RETURNS numeric AS $$
DECLARE
  engagement_score numeric := 0;
  total_tweets integer;
  total_interactions integer;
  follower_count integer;
  activity_factor numeric;
BEGIN
  -- Get user's activity in the last p_days
  SELECT 
    COALESCE(SUM(tweets_posted), 0),
    COALESCE(SUM(likes_received + retweets_received + replies_received), 0)
  INTO total_tweets, total_interactions
  FROM user_analytics
  WHERE user_id = p_user_id 
  AND date >= CURRENT_DATE - interval '1 day' * p_days;
  
  -- Get current follower count
  SELECT COUNT(*) INTO follower_count
  FROM follows
  WHERE following_id = p_user_id;
  
  -- Calculate activity factor (tweets per day)
  activity_factor := CASE 
    WHEN total_tweets > 0 THEN total_tweets::numeric / p_days::numeric
    ELSE 0
  END;
  
  -- Calculate engagement score
  -- Formula: (interactions / max(tweets, 1)) * activity_factor * log(followers + 1)
  engagement_score := CASE
    WHEN total_tweets > 0 THEN
      (total_interactions::numeric / total_tweets::numeric) * 
      activity_factor * 
      ln(follower_count + 1)
    ELSE 0
  END;
  
  RETURN ROUND(engagement_score, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending content
CREATE OR REPLACE FUNCTION get_trending_content(p_hours integer DEFAULT 24, p_limit integer DEFAULT 10)
RETURNS TABLE(
  tweet_id uuid,
  content text,
  username text,
  engagement_rate numeric,
  total_interactions bigint,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as tweet_id,
    t.content,
    u.username,
    COALESCE(ca.engagement_rate, 0) as engagement_rate,
    (COALESCE(ca.likes_count, 0) + COALESCE(ca.retweets_count, 0) + COALESCE(ca.replies_count, 0))::bigint as total_interactions,
    t.created_at
  FROM tweets t
  JOIN users u ON t.user_id = u.id
  LEFT JOIN content_analytics ca ON t.id = ca.tweet_id AND ca.date = CURRENT_DATE
  WHERE t.created_at >= (now() - interval '1 hour' * p_hours)
  AND t.parent_id IS NULL
  ORDER BY total_interactions DESC, engagement_rate DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  tweet_record RECORD;
BEGIN
  -- Update user analytics for yesterday
  FOR user_record IN SELECT id FROM users LOOP
    INSERT INTO user_analytics (
      user_id, 
      date,
      tweets_posted,
      likes_given,
      likes_received,
      retweets_given,
      retweets_received,
      replies_made,
      replies_received,
      new_followers,
      new_following,
      xp_earned,
      quests_completed
    )
    SELECT 
      user_record.id,
      CURRENT_DATE - interval '1 day',
      (SELECT COUNT(*) FROM tweets WHERE user_id = user_record.id AND created_at::date = CURRENT_DATE - interval '1 day'),
      (SELECT COUNT(*) FROM likes WHERE user_id = user_record.id AND created_at::date = CURRENT_DATE - interval '1 day'),
      (SELECT COUNT(*) FROM likes l JOIN tweets t ON l.tweet_id = t.id WHERE t.user_id = user_record.id AND l.created_at::date = CURRENT_DATE - interval '1 day'),
      (SELECT COUNT(*) FROM retweets WHERE user_id = user_record.id AND created_at::date = CURRENT_DATE - interval '1 day'),
      (SELECT COUNT(*) FROM retweets r JOIN tweets t ON r.tweet_id = t.id WHERE t.user_id = user_record.id AND r.created_at::date = CURRENT_DATE - interval '1 day'),
      (SELECT COUNT(*) FROM tweets WHERE user_id = user_record.id AND parent_id IS NOT NULL AND created_at::date = CURRENT_DATE - interval '1 day'),
      (SELECT COUNT(*) FROM tweets t JOIN tweets p ON t.parent_id = p.id WHERE p.user_id = user_record.id AND t.created_at::date = CURRENT_DATE - interval '1 day'),
      (SELECT COUNT(*) FROM follows WHERE following_id = user_record.id AND created_at::date = CURRENT_DATE - interval '1 day'),
      (SELECT COUNT(*) FROM follows WHERE follower_id = user_record.id AND created_at::date = CURRENT_DATE - interval '1 day'),
      (SELECT COALESCE(SUM(xp_amount), 0) FROM xp_events WHERE user_id = user_record.id AND created_at::date = CURRENT_DATE - interval '1 day'),
      (SELECT COUNT(*) FROM user_quests WHERE user_id = user_record.id AND completed_at::date = CURRENT_DATE - interval '1 day')
    ON CONFLICT (user_id, date) DO NOTHING;
  END LOOP;
  
  -- Update content analytics for yesterday's tweets
  FOR tweet_record IN 
    SELECT id FROM tweets WHERE created_at::date = CURRENT_DATE - interval '1 day'
  LOOP
    INSERT INTO content_analytics (
      tweet_id,
      date,
      likes_count,
      retweets_count,
      replies_count,
      hashtags
    )
    SELECT 
      tweet_record.id,
      CURRENT_DATE - interval '1 day',
      (SELECT COUNT(*) FROM likes WHERE tweet_id = tweet_record.id),
      (SELECT COUNT(*) FROM retweets WHERE tweet_id = tweet_record.id),
      (SELECT COUNT(*) FROM tweets WHERE parent_id = tweet_record.id),
      (SELECT array_agg(DISTINCT lower(regexp_replace(match[1], '^#', '')))
       FROM tweets t,
       LATERAL regexp_split_to_table(t.content, '\s+') AS word,
       LATERAL regexp_matches(word, '^#(\w+)', 'g') AS match
       WHERE t.id = tweet_record.id)
    ON CONFLICT (tweet_id, date) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user growth metrics
CREATE OR REPLACE FUNCTION get_user_growth_metrics(p_user_id uuid, p_days integer DEFAULT 30)
RETURNS TABLE(
  date date,
  followers_gained integer,
  tweets_posted integer,
  engagement_score numeric,
  xp_earned integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.date,
    ua.new_followers,
    ua.tweets_posted,
    ua.engagement_score,
    ua.xp_earned
  FROM user_analytics ua
  WHERE ua.user_id = p_user_id
  AND ua.date >= CURRENT_DATE - interval '1 day' * p_days
  ORDER BY ua.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;