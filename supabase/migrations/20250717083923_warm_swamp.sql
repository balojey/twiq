/*
  # Advanced Gamification Features

  1. New Tables
    - `achievements`
      - Permanent achievements system
      - Badge collection and display
    
    - `user_achievements`
      - User achievement progress and unlocks
      - Achievement timestamps and metadata
    
    - `leaderboard_seasons`
      - Seasonal leaderboard competitions
      - Monthly/quarterly competitions

  2. Enhanced Features
    - Achievement system with badges
    - Seasonal competitions
    - Advanced XP multipliers
    - Prestige system for high-level users
*/

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL UNIQUE,
  description text NOT NULL,
  badge_icon text NOT NULL,
  badge_color text DEFAULT '#3B82F6',
  criteria jsonb NOT NULL DEFAULT '{}',
  xp_reward integer DEFAULT 0,
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  category text DEFAULT 'general' CHECK (category IN ('general', 'social', 'content', 'engagement', 'streak', 'special')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  progress jsonb DEFAULT '{}' NOT NULL,
  unlocked_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Create leaderboard seasons table
CREATE TABLE IF NOT EXISTS leaderboard_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  season_type text DEFAULT 'monthly' CHECK (season_type IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  rewards jsonb DEFAULT '{}' NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create season leaderboard entries
CREATE TABLE IF NOT EXISTS season_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid REFERENCES leaderboard_seasons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  xp_earned integer DEFAULT 0,
  tweets_posted integer DEFAULT 0,
  engagement_score numeric DEFAULT 0,
  final_rank integer,
  rewards_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(season_id, user_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_leaderboard ENABLE ROW LEVEL SECURITY;

-- Achievement policies
CREATE POLICY "Anyone can read achievements"
  ON public.achievements
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Users can read own achievements"
  ON public.user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read leaderboard seasons"
  ON public.leaderboard_seasons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read season leaderboard"
  ON public.season_leaderboard
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS achievements_category_idx ON public.achievements(category);
CREATE INDEX IF NOT EXISTS achievements_rarity_idx ON public.achievements(rarity);
CREATE INDEX IF NOT EXISTS user_achievements_user_idx ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS user_achievements_unlocked_idx ON public.user_achievements(unlocked_at DESC) WHERE unlocked_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS season_leaderboard_season_rank_idx ON public.season_leaderboard(season_id, final_rank);

-- Insert default achievements
INSERT INTO public.achievements (title, description, badge_icon, badge_color, criteria, xp_reward, rarity, category) VALUES
  ('First Steps', 'Post your very first tweet', '🎯', '#10B981', '{"tweets_count": 1}', 50, 'common', 'content'),
  ('Social Butterfly', 'Follow 10 users', '🦋', '#3B82F6', '{"follows_made": 10}', 75, 'common', 'social'),
  ('Popular Creator', 'Get 100 total likes', '❤️', '#EF4444', '{"total_likes": 100}', 200, 'rare', 'engagement'),
  ('Viral Sensation', 'Get 50 retweets on a single tweet', '🚀', '#8B5CF6', '{"single_tweet_retweets": 50}', 500, 'epic', 'engagement'),
  ('Consistency King', 'Post every day for 30 days', '👑', '#F59E0B', '{"daily_streak": 30}', 1000, 'legendary', 'streak'),
  ('Community Builder', 'Get 100 followers', '🏗️', '#06B6D4', '{"followers_count": 100}', 300, 'rare', 'social'),
  ('Conversation Starter', 'Get 50 replies on your tweets', '💬', '#84CC16', '{"total_replies": 50}', 250, 'rare', 'engagement'),
  ('Level Master', 'Reach level 25', '⭐', '#F97316', '{"level_reached": 25}', 750, 'epic', 'general'),
  ('XP Collector', 'Earn 10,000 total XP', '💎', '#EC4899', '{"total_xp": 10000}', 1500, 'legendary', 'general'),
  ('Quest Completionist', 'Complete 50 quests', '🏆', '#6366F1', '{"quests_completed": 50}', 800, 'epic', 'general')
ON CONFLICT (title) DO NOTHING;

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_user_achievements(p_user_id uuid)
RETURNS void AS $$
DECLARE
  achievement_record RECORD;
  user_achievement_record RECORD;
  user_stats RECORD;
  criteria_met boolean;
  criteria_key text;
  criteria_value integer;
BEGIN
  -- Get user statistics
  SELECT 
    u.level,
    u.xp,
    (SELECT COUNT(*) FROM tweets WHERE user_id = p_user_id) as tweets_count,
    (SELECT COUNT(*) FROM follows WHERE follower_id = p_user_id) as follows_made,
    (SELECT COUNT(*) FROM follows WHERE following_id = p_user_id) as followers_count,
    (SELECT COUNT(*) FROM likes l JOIN tweets t ON l.tweet_id = t.id WHERE t.user_id = p_user_id) as total_likes,
    (SELECT COUNT(*) FROM retweets r JOIN tweets t ON r.tweet_id = t.id WHERE t.user_id = p_user_id) as total_retweets,
    (SELECT COUNT(*) FROM tweets t JOIN tweets r ON r.parent_id = t.id WHERE t.user_id = p_user_id) as total_replies,
    (SELECT COUNT(*) FROM user_quests WHERE user_id = p_user_id AND completed_at IS NOT NULL) as quests_completed,
    (SELECT MAX(streak_count) FROM daily_logins WHERE user_id = p_user_id) as max_streak
  INTO user_stats;
  
  -- Check each achievement
  FOR achievement_record IN 
    SELECT * FROM public.achievements WHERE active = true
  LOOP
    -- Check if user already has this achievement
    SELECT * INTO user_achievement_record
    FROM public.user_achievements
    WHERE user_id = p_user_id AND achievement_id = achievement_record.id;
    
    -- Skip if already unlocked
    IF user_achievement_record.unlocked_at IS NOT NULL THEN
      CONTINUE;
    END IF;
    
    -- Check if criteria are met
    criteria_met := true;
    FOR criteria_key, criteria_value IN 
      SELECT key, value::integer FROM jsonb_each_text(achievement_record.criteria)
    LOOP
      CASE criteria_key
        WHEN 'tweets_count' THEN
          IF user_stats.tweets_count < criteria_value THEN criteria_met := false; END IF;
        WHEN 'follows_made' THEN
          IF user_stats.follows_made < criteria_value THEN criteria_met := false; END IF;
        WHEN 'followers_count' THEN
          IF user_stats.followers_count < criteria_value THEN criteria_met := false; END IF;
        WHEN 'total_likes' THEN
          IF user_stats.total_likes < criteria_value THEN criteria_met := false; END IF;
        WHEN 'total_retweets' THEN
          IF user_stats.total_retweets < criteria_value THEN criteria_met := false; END IF;
        WHEN 'total_replies' THEN
          IF user_stats.total_replies < criteria_value THEN criteria_met := false; END IF;
        WHEN 'level_reached' THEN
          IF user_stats.level < criteria_value THEN criteria_met := false; END IF;
        WHEN 'total_xp' THEN
          IF user_stats.xp < criteria_value THEN criteria_met := false; END IF;
        WHEN 'quests_completed' THEN
          IF user_stats.quests_completed < criteria_value THEN criteria_met := false; END IF;
        WHEN 'daily_streak' THEN
          IF COALESCE(user_stats.max_streak, 0) < criteria_value THEN criteria_met := false; END IF;
        ELSE
          criteria_met := false; -- Unknown criteria
      END CASE;
      
      IF NOT criteria_met THEN EXIT; END IF;
    END LOOP;
    
    -- Unlock achievement if criteria met
    IF criteria_met THEN
      IF user_achievement_record IS NULL THEN
        INSERT INTO public.user_achievements (user_id, achievement_id, unlocked_at)
        VALUES (p_user_id, achievement_record.id, now());
      ELSE
        UPDATE public.user_achievements 
        SET unlocked_at = now()
        WHERE id = user_achievement_record.id;
      END IF;
      
      -- Award XP if specified
      IF achievement_record.xp_reward > 0 THEN
        PERFORM award_xp(p_user_id, 'achievement_unlocked', achievement_record.xp_reward, achievement_record.id);
      END IF;
      
      -- Create notification
      PERFORM create_notification(
        p_user_id,
        'achievement_unlocked',
        'Achievement Unlocked!',
        'You unlocked: ' || achievement_record.title,
        jsonb_build_object(
          'achievement_id', achievement_record.id,
          'achievement_title', achievement_record.title,
          'badge_icon', achievement_record.badge_icon,
          'xp_reward', achievement_record.xp_reward
        )
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's achievement progress
CREATE OR REPLACE FUNCTION get_user_achievement_progress(p_user_id uuid)
RETURNS TABLE(
  achievement_id uuid,
  title text,
  description text,
  badge_icon text,
  badge_color text,
  rarity text,
  category text,
  xp_reward integer,
  unlocked_at timestamptz,
  progress_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as achievement_id,
    a.title,
    a.description,
    a.badge_icon,
    a.badge_color,
    a.rarity,
    a.category,
    a.xp_reward,
    ua.unlocked_at,
    CASE 
      WHEN ua.unlocked_at IS NOT NULL THEN 100.0
      ELSE 0.0 -- Could be enhanced to show partial progress
    END as progress_percentage
  FROM public.achievements a
  LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = p_user_id
  WHERE a.active = true
  ORDER BY 
    CASE WHEN ua.unlocked_at IS NOT NULL THEN 1 ELSE 0 END DESC,
    a.rarity DESC,
    a.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced award_xp function to check achievements
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id uuid,
  p_event_type text,
  p_xp_amount integer,
  p_reference_id uuid DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  old_level integer;
  new_level integer;
BEGIN
  -- Get current level
  SELECT level INTO old_level FROM public.users WHERE id = p_user_id;
  
  -- Insert XP event
  INSERT INTO public.xp_events (user_id, event_type, xp_amount, reference_id)
  VALUES (p_user_id, p_event_type, p_xp_amount, p_reference_id);
  
  -- Update user's total XP and level
  UPDATE public.users 
  SET 
    xp = xp + p_xp_amount,
    level = GREATEST(1, FLOOR((xp + p_xp_amount) / 100) + 1),
    updated_at = now()
  WHERE id = p_user_id
  RETURNING level INTO new_level;
  
  -- Check if user leveled up
  IF new_level > old_level THEN
    PERFORM create_notification(
      p_user_id,
      'level_up',
      'Level Up!',
      'Congratulations! You reached level ' || new_level || '!',
      jsonb_build_object('new_level', new_level, 'old_level', old_level)
    );
  END IF;
  
  -- Update quest progress (except for quest completion events to avoid recursion)
  IF p_event_type != 'quest_completed' AND p_event_type != 'achievement_unlocked' THEN
    PERFORM update_quest_progress(p_user_id, p_event_type, jsonb_build_object('reference_id', p_reference_id));
  END IF;
  
  -- Check for new achievements
  PERFORM check_user_achievements(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;