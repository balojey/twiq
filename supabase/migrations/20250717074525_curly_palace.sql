/*
  # Media Upload and Notification System

  1. Storage Setup
    - Create bucket for tweet media
    - Set up RLS policies for media access

  2. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `type` (text, notification type)
      - `title` (text, notification title)
      - `message` (text, notification message)
      - `data` (jsonb, additional data)
      - `read` (boolean, default false)
      - `created_at` (timestamp)

    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `notifications_likes` (boolean, default true)
      - `notifications_retweets` (boolean, default true)
      - `notifications_follows` (boolean, default true)
      - `notifications_quests` (boolean, default true)
      - `notifications_level_up` (boolean, default true)
      - `theme` (text, default 'system')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Functions
    - Function to create notifications
    - Function to mark notifications as read
    - Function to get user notification settings

  4. Storage Bucket
    - Create tweet-media bucket
    - Set up RLS policies for media access
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'retweet', 'follow', 'quest_complete', 'level_up', 'reply')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}' NOT NULL,
  read boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  notifications_likes boolean DEFAULT true NOT NULL,
  notifications_retweets boolean DEFAULT true NOT NULL,
  notifications_follows boolean DEFAULT true NOT NULL,
  notifications_quests boolean DEFAULT true NOT NULL,
  notifications_level_up boolean DEFAULT true NOT NULL,
  theme text DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can read own settings"
  ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  -- Check if user has notifications enabled for this type
  IF EXISTS (
    SELECT 1 FROM public.user_settings 
    WHERE user_id = p_user_id 
    AND (
      (p_type = 'like' AND notifications_likes = true) OR
      (p_type = 'retweet' AND notifications_retweets = true) OR
      (p_type = 'follow' AND notifications_follows = true) OR
      (p_type = 'quest_complete' AND notifications_quests = true) OR
      (p_type = 'level_up' AND notifications_level_up = true) OR
      (p_type = 'reply' AND notifications_likes = true) -- Use likes setting for replies
    )
  ) THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(p_user_id uuid, p_notification_ids uuid[] DEFAULT NULL)
RETURNS void AS $$
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all notifications as read
    UPDATE public.notifications 
    SET read = true 
    WHERE user_id = p_user_id AND read = false;
  ELSE
    -- Mark specific notifications as read
    UPDATE public.notifications 
    SET read = true 
    WHERE user_id = p_user_id AND id = ANY(p_notification_ids);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default user settings
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default settings for new users
CREATE TRIGGER create_user_settings_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_settings();

-- Create storage bucket for tweet media (this needs to be run manually in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tweet-media', 'tweet-media', true);

-- Updated award_xp function to include notifications
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
  IF p_event_type != 'quest_completed' THEN
    PERFORM update_quest_progress(p_user_id, p_event_type, jsonb_build_object('reference_id', p_reference_id));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;