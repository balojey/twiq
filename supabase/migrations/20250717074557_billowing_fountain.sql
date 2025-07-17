/*
  # Daily Login System

  1. New Tables
    - `daily_logins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `login_date` (date, not null)
      - `streak_count` (integer, default 1)
      - `xp_awarded` (integer, default 20)
      - `created_at` (timestamp)
      - Unique constraint on (user_id, login_date)

  2. Functions
    - Function to record daily login
    - Function to calculate login streak
    - Function to award daily login bonus

  3. Enhanced XP System
    - Daily login bonus (+20 XP)
    - Streak bonuses (additional XP for consecutive days)
*/

-- Create daily_logins table
CREATE TABLE IF NOT EXISTS daily_logins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  login_date date NOT NULL,
  streak_count integer DEFAULT 1 NOT NULL,
  xp_awarded integer DEFAULT 20 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, login_date)
);

-- Enable RLS
ALTER TABLE public.daily_logins ENABLE ROW LEVEL SECURITY;

-- Daily logins policies
CREATE POLICY "Users can read own daily logins"
  ON public.daily_logins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS daily_logins_user_id_idx ON public.daily_logins(user_id);
CREATE INDEX IF NOT EXISTS daily_logins_date_idx ON public.daily_logins(login_date DESC);

-- Function to record daily login and award XP
CREATE OR REPLACE FUNCTION record_daily_login(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  today_date date := CURRENT_DATE;
  yesterday_date date := CURRENT_DATE - interval '1 day';
  existing_login RECORD;
  current_streak integer := 1;
  base_xp integer := 20;
  streak_bonus integer := 0;
  total_xp integer;
  result jsonb;
BEGIN
  -- Check if user already logged in today
  SELECT * INTO existing_login 
  FROM public.daily_logins 
  WHERE user_id = p_user_id AND login_date = today_date;
  
  IF existing_login IS NOT NULL THEN
    -- User already logged in today
    RETURN jsonb_build_object(
      'already_logged_in', true,
      'streak_count', existing_login.streak_count,
      'xp_awarded', 0
    );
  END IF;
  
  -- Check yesterday's login to calculate streak
  SELECT streak_count INTO current_streak
  FROM public.daily_logins 
  WHERE user_id = p_user_id AND login_date = yesterday_date;
  
  IF current_streak IS NULL THEN
    -- No login yesterday, reset streak
    current_streak := 1;
  ELSE
    -- Continue streak
    current_streak := current_streak + 1;
  END IF;
  
  -- Calculate streak bonus (5 XP per day after day 3, max 50 bonus)
  IF current_streak > 3 THEN
    streak_bonus := LEAST((current_streak - 3) * 5, 50);
  END IF;
  
  total_xp := base_xp + streak_bonus;
  
  -- Record today's login
  INSERT INTO public.daily_logins (user_id, login_date, streak_count, xp_awarded)
  VALUES (p_user_id, today_date, current_streak, total_xp);
  
  -- Award XP
  PERFORM award_xp(p_user_id, 'daily_login', total_xp);
  
  -- Create notification for streak milestones
  IF current_streak = 7 THEN
    PERFORM create_notification(
      p_user_id,
      'quest_complete',
      'Week Streak!',
      'Amazing! You''ve logged in for 7 days straight!',
      jsonb_build_object('streak_count', current_streak)
    );
  ELSIF current_streak = 30 THEN
    PERFORM create_notification(
      p_user_id,
      'quest_complete',
      'Month Streak!',
      'Incredible! You''ve logged in for 30 days straight!',
      jsonb_build_object('streak_count', current_streak)
    );
  END IF;
  
  RETURN jsonb_build_object(
    'already_logged_in', false,
    'streak_count', current_streak,
    'xp_awarded', total_xp,
    'base_xp', base_xp,
    'streak_bonus', streak_bonus
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current login streak
CREATE OR REPLACE FUNCTION get_user_login_streak(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  latest_login RECORD;
  streak_count integer := 0;
BEGIN
  -- Get the most recent login
  SELECT * INTO latest_login
  FROM public.daily_logins 
  WHERE user_id = p_user_id 
  ORDER BY login_date DESC 
  LIMIT 1;
  
  IF latest_login IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Check if the latest login was today or yesterday
  IF latest_login.login_date = CURRENT_DATE OR 
     latest_login.login_date = CURRENT_DATE - interval '1 day' THEN
    RETURN latest_login.streak_count;
  ELSE
    -- Streak was broken
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;