/*
  # Enhanced Features and Performance Improvements

  1. New Functions
    - Function to get trending hashtags
    - Function to get user activity stats
    - Function to get tweet engagement metrics

  2. Performance Indexes
    - Additional indexes for better query performance
    - Composite indexes for common query patterns

  3. Enhanced Quest System
    - More sophisticated quest criteria
    - Weekly and monthly quest types
*/

-- Function to extract and count hashtags from tweets
CREATE OR REPLACE FUNCTION get_trending_hashtags(p_limit integer DEFAULT 10)
RETURNS TABLE(
  hashtag text,
  count bigint,
  recent_count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH hashtag_matches AS (
    SELECT 
      lower(regexp_replace(match[1], '^#', '')) as tag,
      t.created_at
    FROM public.tweets t,
    LATERAL regexp_split_to_table(t.content, '\s+') AS word,
    LATERAL regexp_matches(word, '^#(\w+)', 'g') AS match
    WHERE t.created_at > (now() - interval '7 days')
  )
  SELECT 
    hm.tag as hashtag,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE hm.created_at > (now() - interval '24 hours')) as recent_count
  FROM hashtag_matches hm
  GROUP BY hm.tag
  HAVING COUNT(*) > 1
  ORDER BY COUNT(*) DESC, recent_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity statistics
CREATE OR REPLACE FUNCTION get_user_activity_stats(p_user_id uuid)
RETURNS TABLE(
  tweets_count bigint,
  likes_given bigint,
  likes_received bigint,
  retweets_given bigint,
  retweets_received bigint,
  followers_count bigint,
  following_count bigint,
  total_xp integer,
  current_level integer,
  days_active bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.tweets WHERE user_id = p_user_id) as tweets_count,
    (SELECT COUNT(*) FROM public.likes WHERE user_id = p_user_id) as likes_given,
    (SELECT COUNT(*) FROM public.likes l JOIN public.tweets t ON l.tweet_id = t.id WHERE t.user_id = p_user_id) as likes_received,
    (SELECT COUNT(*) FROM public.retweets WHERE user_id = p_user_id) as retweets_given,
    (SELECT COUNT(*) FROM public.retweets r JOIN public.tweets t ON r.tweet_id = t.id WHERE t.user_id = p_user_id) as retweets_received,
    (SELECT COUNT(*) FROM public.follows WHERE following_id = p_user_id) as followers_count,
    (SELECT COUNT(*) FROM public.follows WHERE follower_id = p_user_id) as following_count,
    (SELECT COALESCE(xp, 0) FROM public.users WHERE id = p_user_id) as total_xp,
    (SELECT COALESCE(level, 1) FROM public.users WHERE id = p_user_id) as current_level,
    (SELECT COUNT(DISTINCT DATE(created_at)) FROM public.tweets WHERE user_id = p_user_id) as days_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tweet engagement metrics
CREATE OR REPLACE FUNCTION get_tweet_engagement_metrics(p_tweet_id uuid)
RETURNS TABLE(
  likes_count bigint,
  retweets_count bigint,
  replies_count bigint,
  engagement_rate numeric,
  reach_score numeric
) AS $$
DECLARE
  author_followers bigint;
BEGIN
  -- Get author's follower count for reach calculation
  SELECT COUNT(*) INTO author_followers
  FROM public.follows f
  JOIN public.tweets t ON f.following_id = t.user_id
  WHERE t.id = p_tweet_id;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.likes WHERE tweet_id = p_tweet_id) as likes_count,
    (SELECT COUNT(*) FROM public.retweets WHERE tweet_id = p_tweet_id) as retweets_count,
    (SELECT COUNT(*) FROM public.tweets WHERE parent_id = p_tweet_id) as replies_count,
    CASE 
      WHEN author_followers > 0 THEN
        ROUND(
          ((SELECT COUNT(*) FROM public.likes WHERE tweet_id = p_tweet_id) +
           (SELECT COUNT(*) FROM public.retweets WHERE tweet_id = p_tweet_id) +
           (SELECT COUNT(*) FROM public.tweets WHERE parent_id = p_tweet_id))::numeric / 
          author_followers::numeric * 100, 2
        )
      ELSE 0
    END as engagement_rate,
    CASE 
      WHEN author_followers > 0 THEN
        ROUND(
          ((SELECT COUNT(*) FROM public.retweets WHERE tweet_id = p_tweet_id) * author_followers)::numeric / 
          GREATEST(author_followers, 1)::numeric, 2
        )
      ELSE 0
    END as reach_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS tweets_content_gin_idx ON public.tweets USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS tweets_user_created_idx ON public.tweets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS likes_tweet_created_idx ON public.likes(tweet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS retweets_tweet_created_idx ON public.retweets(tweet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS follows_following_created_idx ON public.follows(following_id, created_at DESC);
CREATE INDEX IF NOT EXISTS xp_events_user_created_idx ON public.xp_events(user_id, created_at DESC);

-- Enhanced quest types
INSERT INTO public.quests (title, description, xp_reward, criteria) VALUES
  ('Hashtag Hero', 'Use 3 different hashtags in your tweets', 75, '{"hashtags_used": 3}'),
  ('Reply Master', 'Reply to 5 different tweets', 100, '{"replies_made": 5}'),
  ('Weekly Warrior', 'Post at least one tweet every day for a week', 300, '{"daily_tweets_week": 7}'),
  ('Social Connector', 'Follow 10 new users', 150, '{"new_follows": 10}'),
  ('Content Creator', 'Post 20 tweets in a week', 250, '{"tweets_in_week": 20}'),
  ('Engagement King', 'Get 50 total interactions in a week', 400, '{"weekly_interactions": 50}')
ON CONFLICT (title) DO NOTHING;

-- Function to update weekly/monthly quest progress
CREATE OR REPLACE FUNCTION update_weekly_monthly_quests()
RETURNS void AS $$
BEGIN
  -- Reset weekly quests (run weekly)
  DELETE FROM public.user_quests 
  WHERE quest_id IN (
    SELECT id FROM public.quests 
    WHERE criteria ? 'tweets_in_week' 
    OR criteria ? 'weekly_interactions'
    OR criteria ? 'daily_tweets_week'
  )
  AND created_at < (now() - interval '7 days');
  
  -- Reset monthly quests (run monthly)
  DELETE FROM public.user_quests 
  WHERE quest_id IN (
    SELECT id FROM public.quests 
    WHERE criteria ? 'tweets_in_month'
    OR criteria ? 'monthly_interactions'
  )
  AND created_at < (now() - interval '30 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;