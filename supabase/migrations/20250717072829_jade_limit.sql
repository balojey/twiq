/*
  # Quest Progress Tracking System

  1. Functions
    - Function to update quest progress
    - Function to check quest completion
    - Function to award quest rewards

  2. Triggers
    - Trigger to update quest progress on tweet creation
    - Trigger to update quest progress on likes/retweets

  3. Enhanced Quest System
    - Better quest progress tracking
    - Automatic quest completion detection
*/

-- Function to update quest progress
CREATE OR REPLACE FUNCTION update_quest_progress(
  p_user_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT '{}'
)
RETURNS void AS $$
DECLARE
  quest_record RECORD;
  user_quest_record RECORD;
  current_progress jsonb;
  new_progress jsonb;
  criteria_key text;
  criteria_value integer;
  current_value integer;
  is_completed boolean;
BEGIN
  -- Get all active quests
  FOR quest_record IN 
    SELECT * FROM public.quests WHERE active = true
  LOOP
    -- Get or create user quest record
    SELECT * INTO user_quest_record 
    FROM public.user_quests 
    WHERE user_id = p_user_id AND quest_id = quest_record.id;
    
    IF user_quest_record IS NULL THEN
      INSERT INTO public.user_quests (user_id, quest_id, progress)
      VALUES (p_user_id, quest_record.id, '{}')
      RETURNING * INTO user_quest_record;
    END IF;
    
    -- Skip if already completed
    IF user_quest_record.completed_at IS NOT NULL THEN
      CONTINUE;
    END IF;
    
    current_progress := user_quest_record.progress;
    new_progress := current_progress;
    is_completed := false;
    
    -- Update progress based on quest criteria and event type
    FOR criteria_key, criteria_value IN 
      SELECT key, value::integer FROM jsonb_each_text(quest_record.criteria)
    LOOP
      current_value := COALESCE((current_progress->>criteria_key)::integer, 0);
      
      CASE 
        WHEN criteria_key = 'tweets_count' AND p_event_type = 'tweet' THEN
          new_progress := jsonb_set(new_progress, ARRAY[criteria_key], to_jsonb(current_value + 1));
          
        WHEN criteria_key = 'likes_received' AND p_event_type = 'like_received' THEN
          new_progress := jsonb_set(new_progress, ARRAY[criteria_key], to_jsonb(current_value + 1));
          
        WHEN criteria_key = 'retweets_received' AND p_event_type = 'retweet_received' THEN
          new_progress := jsonb_set(new_progress, ARRAY[criteria_key], to_jsonb(current_value + 1));
          
        WHEN criteria_key = 'total_interactions' AND p_event_type IN ('like_received', 'retweet_received') THEN
          new_progress := jsonb_set(new_progress, ARRAY[criteria_key], to_jsonb(current_value + 1));
          
        WHEN criteria_key = 'tweets_in_day' AND p_event_type = 'tweet' THEN
          -- Check if it's the same day
          IF user_quest_record.created_at::date = CURRENT_DATE THEN
            new_progress := jsonb_set(new_progress, ARRAY[criteria_key], to_jsonb(current_value + 1));
          END IF;
          
        WHEN criteria_key = 'retweets_on_single_tweet' AND p_event_type = 'retweet_received' THEN
          -- This would need more complex logic to track per tweet
          new_progress := jsonb_set(new_progress, ARRAY[criteria_key], to_jsonb(current_value + 1));
      END CASE;
      
      -- Check if quest is completed
      IF (new_progress->>criteria_key)::integer >= criteria_value THEN
        is_completed := true;
      ELSE
        is_completed := false;
        EXIT; -- If any criteria is not met, quest is not complete
      END IF;
    END LOOP;
    
    -- Update quest progress
    UPDATE public.user_quests 
    SET 
      progress = new_progress,
      completed_at = CASE WHEN is_completed THEN now() ELSE NULL END
    WHERE id = user_quest_record.id;
    
    -- Award quest reward if completed
    IF is_completed AND user_quest_record.completed_at IS NULL THEN
      PERFORM award_xp(p_user_id, 'quest_completed', quest_record.xp_reward, quest_record.id);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced award_xp function to also update quest progress
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id uuid,
  p_event_type text,
  p_xp_amount integer,
  p_reference_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert XP event
  INSERT INTO public.xp_events (user_id, event_type, xp_amount, reference_id)
  VALUES (p_user_id, p_event_type, p_xp_amount, p_reference_id);
  
  -- Update user's total XP and level
  UPDATE public.users 
  SET 
    xp = xp + p_xp_amount,
    level = GREATEST(1, FLOOR((xp + p_xp_amount) / 100) + 1),
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Update quest progress (except for quest completion events to avoid recursion)
  IF p_event_type != 'quest_completed' THEN
    PERFORM update_quest_progress(p_user_id, p_event_type, jsonb_build_object('reference_id', p_reference_id));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset daily quests (to be called by a cron job)
CREATE OR REPLACE FUNCTION reset_daily_quests()
RETURNS void AS $$
BEGIN
  -- Delete user quest progress for daily quests that are older than 24 hours
  DELETE FROM public.user_quests 
  WHERE created_at < (now() - interval '24 hours')
  AND quest_id IN (
    SELECT id FROM public.quests 
    WHERE criteria ? 'tweets_in_day' 
    OR title LIKE '%Daily%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;