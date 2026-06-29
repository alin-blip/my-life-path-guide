export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_sessions: {
        Row: {
          activity_type: string
          created_at: string | null
          date: string
          distance_km: number | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          date?: string
          distance_km?: number | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          date?: string
          distance_km?: number | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_impersonation_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          reason: string | null
          target_user_id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          reason?: string | null
          target_user_id: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          reason?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      ai_generated_images: {
        Row: {
          category: string | null
          created_at: string
          has_logo: boolean | null
          id: string
          image_url: string
          prompt: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          has_logo?: boolean | null
          id?: string
          image_url: string
          prompt: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          has_logo?: boolean | null
          id?: string
          image_url?: string
          prompt?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      anger_stack_sessions: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          session_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          session_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          session_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      archived_tasks: {
        Row: {
          archived_at: string | null
          completed: boolean | null
          created_at: string | null
          id: string
          original_data: Json | null
          original_task_id: string
          task_type: string
          title: string
          user_id: string
          week_key: string | null
        }
        Insert: {
          archived_at?: string | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          original_data?: Json | null
          original_task_id: string
          task_type: string
          title: string
          user_id: string
          week_key?: string | null
        }
        Update: {
          archived_at?: string | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          original_data?: Json | null
          original_task_id?: string
          task_type?: string
          title?: string
          user_id?: string
          week_key?: string | null
        }
        Relationships: []
      }
      biz4_daily_metrics: {
        Row: {
          close_completed: boolean | null
          close_conversations_count: number | null
          close_deals_won: number | null
          content_completed: boolean | null
          content_pieces_count: number | null
          content_type: string | null
          created_at: string | null
          date: string
          engage_comments_count: number | null
          engage_completed: boolean | null
          engage_minutes: number | null
          id: string
          outreach_channels: string[] | null
          outreach_completed: boolean | null
          outreach_prospects_count: number | null
          podcast_completed: boolean | null
          podcast_episode_number: number | null
          updated_at: string | null
          user_id: string
          webinar_attendees_count: number | null
          webinar_completed: boolean | null
        }
        Insert: {
          close_completed?: boolean | null
          close_conversations_count?: number | null
          close_deals_won?: number | null
          content_completed?: boolean | null
          content_pieces_count?: number | null
          content_type?: string | null
          created_at?: string | null
          date?: string
          engage_comments_count?: number | null
          engage_completed?: boolean | null
          engage_minutes?: number | null
          id?: string
          outreach_channels?: string[] | null
          outreach_completed?: boolean | null
          outreach_prospects_count?: number | null
          podcast_completed?: boolean | null
          podcast_episode_number?: number | null
          updated_at?: string | null
          user_id: string
          webinar_attendees_count?: number | null
          webinar_completed?: boolean | null
        }
        Update: {
          close_completed?: boolean | null
          close_conversations_count?: number | null
          close_deals_won?: number | null
          content_completed?: boolean | null
          content_pieces_count?: number | null
          content_type?: string | null
          created_at?: string | null
          date?: string
          engage_comments_count?: number | null
          engage_completed?: boolean | null
          engage_minutes?: number | null
          id?: string
          outreach_channels?: string[] | null
          outreach_completed?: boolean | null
          outreach_prospects_count?: number | null
          podcast_completed?: boolean | null
          podcast_episode_number?: number | null
          updated_at?: string | null
          user_id?: string
          webinar_attendees_count?: number | null
          webinar_completed?: boolean | null
        }
        Relationships: []
      }
      biz4_weekly_objectives: {
        Row: {
          content_target: number | null
          conversations_target: number | null
          created_at: string | null
          deals_target: number | null
          engage_minutes_target: number | null
          id: string
          notes: string | null
          prospects_target: number | null
          updated_at: string | null
          user_id: string
          week_key: string
        }
        Insert: {
          content_target?: number | null
          conversations_target?: number | null
          created_at?: string | null
          deals_target?: number | null
          engage_minutes_target?: number | null
          id?: string
          notes?: string | null
          prospects_target?: number | null
          updated_at?: string | null
          user_id: string
          week_key: string
        }
        Update: {
          content_target?: number | null
          conversations_target?: number | null
          created_at?: string | null
          deals_target?: number | null
          engage_minutes_target?: number | null
          id?: string
          notes?: string | null
          prospects_target?: number | null
          updated_at?: string | null
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      book_reading_progress: {
        Row: {
          action_completed: boolean | null
          chapter: string
          created_at: string | null
          id: string
          notes: string | null
          page_number: number
          principle: string
          read_at: string
          user_id: string
        }
        Insert: {
          action_completed?: boolean | null
          chapter: string
          created_at?: string | null
          id?: string
          notes?: string | null
          page_number: number
          principle: string
          read_at?: string
          user_id: string
        }
        Update: {
          action_completed?: boolean | null
          chapter?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          page_number?: number
          principle?: string
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      breakthrough_logs: {
        Row: {
          action_added_to_hit_list: boolean | null
          action_committed: string | null
          created_at: string | null
          emotion_after: string | null
          emotion_before: string
          id: string
          intensity_after: number | null
          intensity_before: number | null
          session_id: string | null
          story_identified: string | null
          transformation_insight: string | null
          user_id: string
        }
        Insert: {
          action_added_to_hit_list?: boolean | null
          action_committed?: string | null
          created_at?: string | null
          emotion_after?: string | null
          emotion_before: string
          id?: string
          intensity_after?: number | null
          intensity_before?: number | null
          session_id?: string | null
          story_identified?: string | null
          transformation_insight?: string | null
          user_id: string
        }
        Update: {
          action_added_to_hit_list?: boolean | null
          action_committed?: string | null
          created_at?: string | null
          emotion_after?: string | null
          emotion_before?: string
          id?: string
          intensity_after?: number | null
          intensity_before?: number | null
          session_id?: string | null
          story_identified?: string | null
          transformation_insight?: string | null
          user_id?: string
        }
        Relationships: []
      }
      breathing_music: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_path: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_path: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_path?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      brotherhood_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          media_url: string | null
          message_type: string | null
          receiver_id: string | null
          sender_id: string
          tribe_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          receiver_id?: string | null
          sender_id: string
          tribe_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          receiver_id?: string | null
          sender_id?: string
          tribe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brotherhood_messages_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      burnout_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          created_at: string
          description: string
          id: string
          metric_value: number | null
          recommendations: string[] | null
          severity: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          created_at?: string
          description: string
          id?: string
          metric_value?: number | null
          recommendations?: string[] | null
          severity: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          metric_value?: number | null
          recommendations?: string[] | null
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      canvas_projects: {
        Row: {
          canvas_data: Json | null
          created_at: string | null
          id: string
          is_public: boolean | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          canvas_data?: Json | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          canvas_data?: Json | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      challenge_coach_conversations: {
        Row: {
          content: string
          created_at: string | null
          day_number: number
          id: string
          role: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          day_number?: number
          id?: string
          role: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          day_number?: number
          id?: string
          role?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      challenge_day1_responses: {
        Row: {
          commitment_confirmed: boolean | null
          created_at: string | null
          id: string
          question_1: string | null
          question_2: string | null
          question_3: string | null
          question_4: string | null
          question_5: string | null
          target_date: string | null
          updated_at: string | null
          user_id: string
          vision_body: string | null
          vision_business: string | null
          vision_declaration: string | null
          vision_relationships: string | null
          vision_spirit: string | null
          what_i_will_give: string | null
        }
        Insert: {
          commitment_confirmed?: boolean | null
          created_at?: string | null
          id?: string
          question_1?: string | null
          question_2?: string | null
          question_3?: string | null
          question_4?: string | null
          question_5?: string | null
          target_date?: string | null
          updated_at?: string | null
          user_id: string
          vision_body?: string | null
          vision_business?: string | null
          vision_declaration?: string | null
          vision_relationships?: string | null
          vision_spirit?: string | null
          what_i_will_give?: string | null
        }
        Update: {
          commitment_confirmed?: boolean | null
          created_at?: string | null
          id?: string
          question_1?: string | null
          question_2?: string | null
          question_3?: string | null
          question_4?: string | null
          question_5?: string | null
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
          vision_body?: string | null
          vision_business?: string | null
          vision_declaration?: string | null
          vision_relationships?: string | null
          vision_spirit?: string | null
          what_i_will_give?: string | null
        }
        Relationships: []
      }
      challenge_intake: {
        Row: {
          biggest_block: string
          commitment_level: string
          created_at: string
          id: string
          occupation: string | null
          posted_to_community: boolean
          user_id: string
          win_30_days: string
        }
        Insert: {
          biggest_block: string
          commitment_level?: string
          created_at?: string
          id?: string
          occupation?: string | null
          posted_to_community?: boolean
          user_id: string
          win_30_days: string
        }
        Update: {
          biggest_block?: string
          commitment_level?: string
          created_at?: string
          id?: string
          occupation?: string | null
          posted_to_community?: boolean
          user_id?: string
          win_30_days?: string
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          actions_completed: Json | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          day_number: number
          id: string
          stack_session_id: string | null
          updated_at: string | null
          user_id: string
          video_watched: boolean | null
        }
        Insert: {
          actions_completed?: Json | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          day_number: number
          id?: string
          stack_session_id?: string | null
          updated_at?: string | null
          user_id: string
          video_watched?: boolean | null
        }
        Update: {
          actions_completed?: Json | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          day_number?: number
          id?: string
          stack_session_id?: string | null
          updated_at?: string | null
          user_id?: string
          video_watched?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_stack_session_id_fkey"
            columns: ["stack_session_id"]
            isOneToOne: false
            referencedRelation: "stack_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_recovery_emails: {
        Row: {
          clicked_at: string | null
          converted: boolean | null
          converted_at: string | null
          email: string
          id: string
          opened_at: string | null
          sent_at: string
          stuck_on_day: number
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          converted?: boolean | null
          converted_at?: string | null
          email: string
          id?: string
          opened_at?: string | null
          sent_at?: string
          stuck_on_day: number
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          converted?: boolean | null
          converted_at?: string | null
          email?: string
          id?: string
          opened_at?: string | null
          sent_at?: string
          stuck_on_day?: number
          user_id?: string | null
        }
        Relationships: []
      }
      champion_routine_logs: {
        Row: {
          apply_completed: boolean | null
          apply_notes: string | null
          autosuggestion_completed: boolean | null
          autosuggestion_text: string | null
          big_one_today: string | null
          breathing_completed: boolean | null
          content_script: string | null
          content_topic: string | null
          created_at: string | null
          daily_todos: Json | null
          date: string
          emotional_transform_completed: boolean | null
          evening_completed: boolean | null
          evening_reflection_done_well: string | null
          evening_reflection_learned: string | null
          evening_reflection_not_done: string | null
          exercise_completed: boolean | null
          gratitude_items: Json | null
          id: string
          journaling_completed: boolean | null
          learn_completed: boolean | null
          learn_notes: string | null
          light_exposure: boolean | null
          meals_logged: Json | null
          meditation_duration_seconds: number | null
          mind_shift_summary: Json | null
          morning_emotion: string | null
          morning_emotion_intensity: number | null
          pomodoro_sessions: number | null
          priorities: Json | null
          reading_completed: boolean | null
          relationship_actions: Json | null
          stack_selection_completed: boolean | null
          total_calories: number | null
          total_protein: number | null
          transformed_energy: string | null
          updated_at: string | null
          user_id: string
          vision_declaration_read: boolean | null
          visualization_completed: boolean | null
          water_drunk: boolean | null
        }
        Insert: {
          apply_completed?: boolean | null
          apply_notes?: string | null
          autosuggestion_completed?: boolean | null
          autosuggestion_text?: string | null
          big_one_today?: string | null
          breathing_completed?: boolean | null
          content_script?: string | null
          content_topic?: string | null
          created_at?: string | null
          daily_todos?: Json | null
          date?: string
          emotional_transform_completed?: boolean | null
          evening_completed?: boolean | null
          evening_reflection_done_well?: string | null
          evening_reflection_learned?: string | null
          evening_reflection_not_done?: string | null
          exercise_completed?: boolean | null
          gratitude_items?: Json | null
          id?: string
          journaling_completed?: boolean | null
          learn_completed?: boolean | null
          learn_notes?: string | null
          light_exposure?: boolean | null
          meals_logged?: Json | null
          meditation_duration_seconds?: number | null
          mind_shift_summary?: Json | null
          morning_emotion?: string | null
          morning_emotion_intensity?: number | null
          pomodoro_sessions?: number | null
          priorities?: Json | null
          reading_completed?: boolean | null
          relationship_actions?: Json | null
          stack_selection_completed?: boolean | null
          total_calories?: number | null
          total_protein?: number | null
          transformed_energy?: string | null
          updated_at?: string | null
          user_id: string
          vision_declaration_read?: boolean | null
          visualization_completed?: boolean | null
          water_drunk?: boolean | null
        }
        Update: {
          apply_completed?: boolean | null
          apply_notes?: string | null
          autosuggestion_completed?: boolean | null
          autosuggestion_text?: string | null
          big_one_today?: string | null
          breathing_completed?: boolean | null
          content_script?: string | null
          content_topic?: string | null
          created_at?: string | null
          daily_todos?: Json | null
          date?: string
          emotional_transform_completed?: boolean | null
          evening_completed?: boolean | null
          evening_reflection_done_well?: string | null
          evening_reflection_learned?: string | null
          evening_reflection_not_done?: string | null
          exercise_completed?: boolean | null
          gratitude_items?: Json | null
          id?: string
          journaling_completed?: boolean | null
          learn_completed?: boolean | null
          learn_notes?: string | null
          light_exposure?: boolean | null
          meals_logged?: Json | null
          meditation_duration_seconds?: number | null
          mind_shift_summary?: Json | null
          morning_emotion?: string | null
          morning_emotion_intensity?: number | null
          pomodoro_sessions?: number | null
          priorities?: Json | null
          reading_completed?: boolean | null
          relationship_actions?: Json | null
          stack_selection_completed?: boolean | null
          total_calories?: number | null
          total_protein?: number | null
          transformed_energy?: string | null
          updated_at?: string | null
          user_id?: string
          vision_declaration_read?: boolean | null
          visualization_completed?: boolean | null
          water_drunk?: boolean | null
        }
        Relationships: []
      }
      champion_routine_people: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          position: number | null
          relationship_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          position?: number | null
          relationship_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          position?: number | null
          relationship_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      champion_routine_settings: {
        Row: {
          active_steps: Json | null
          activity_level: string | null
          age: number | null
          apply_teach_description: string | null
          binaural_default_type: string | null
          binaural_enabled: boolean | null
          calorie_target: number | null
          carbs_percent: number | null
          carbs_target: number | null
          created_at: string | null
          default_autosuggestion: string | null
          fats_percent: number | null
          fats_target: number | null
          habit_steps: Json | null
          height_cm: number | null
          id: string
          include_daily_tasks: boolean | null
          is_configured: boolean | null
          journaling_min_words: number | null
          journaling_show_prompts: boolean | null
          learn_task_description: string | null
          learn_task_type: string | null
          light_exposure_duration: number | null
          meditation_default_duration: number | null
          meditation_default_mode: string | null
          nutrition_configured: boolean | null
          protein_percent: number | null
          protein_target: number | null
          reading_book_title: string | null
          reading_pages_per_day: number | null
          routine_steps_order: Json | null
          setup_completed_at: string | null
          step_configs: Json | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
          workout_days_per_week: number | null
          workout_goal: string | null
          workout_level: string | null
          workout_location: string | null
          workout_target_groups: Json | null
        }
        Insert: {
          active_steps?: Json | null
          activity_level?: string | null
          age?: number | null
          apply_teach_description?: string | null
          binaural_default_type?: string | null
          binaural_enabled?: boolean | null
          calorie_target?: number | null
          carbs_percent?: number | null
          carbs_target?: number | null
          created_at?: string | null
          default_autosuggestion?: string | null
          fats_percent?: number | null
          fats_target?: number | null
          habit_steps?: Json | null
          height_cm?: number | null
          id?: string
          include_daily_tasks?: boolean | null
          is_configured?: boolean | null
          journaling_min_words?: number | null
          journaling_show_prompts?: boolean | null
          learn_task_description?: string | null
          learn_task_type?: string | null
          light_exposure_duration?: number | null
          meditation_default_duration?: number | null
          meditation_default_mode?: string | null
          nutrition_configured?: boolean | null
          protein_percent?: number | null
          protein_target?: number | null
          reading_book_title?: string | null
          reading_pages_per_day?: number | null
          routine_steps_order?: Json | null
          setup_completed_at?: string | null
          step_configs?: Json | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
          workout_days_per_week?: number | null
          workout_goal?: string | null
          workout_level?: string | null
          workout_location?: string | null
          workout_target_groups?: Json | null
        }
        Update: {
          active_steps?: Json | null
          activity_level?: string | null
          age?: number | null
          apply_teach_description?: string | null
          binaural_default_type?: string | null
          binaural_enabled?: boolean | null
          calorie_target?: number | null
          carbs_percent?: number | null
          carbs_target?: number | null
          created_at?: string | null
          default_autosuggestion?: string | null
          fats_percent?: number | null
          fats_target?: number | null
          habit_steps?: Json | null
          height_cm?: number | null
          id?: string
          include_daily_tasks?: boolean | null
          is_configured?: boolean | null
          journaling_min_words?: number | null
          journaling_show_prompts?: boolean | null
          learn_task_description?: string | null
          learn_task_type?: string | null
          light_exposure_duration?: number | null
          meditation_default_duration?: number | null
          meditation_default_mode?: string | null
          nutrition_configured?: boolean | null
          protein_percent?: number | null
          protein_target?: number | null
          reading_book_title?: string | null
          reading_pages_per_day?: number | null
          routine_steps_order?: Json | null
          setup_completed_at?: string | null
          step_configs?: Json | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
          workout_days_per_week?: number | null
          workout_goal?: string | null
          workout_level?: string | null
          workout_location?: string | null
          workout_target_groups?: Json | null
        }
        Relationships: []
      }
      checkout_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          metadata: Json | null
          plan_id: string | null
          session_id: string | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          session_id?: string | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          session_id?: string | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coach_content: {
        Row: {
          coach_id: string
          content_type: string
          content_url: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_published: boolean | null
          price_cents: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          thumbnail_url: string | null
          title: string
          total_revenue: number | null
          total_sales: number | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          content_type?: string
          content_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          price_cents?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          thumbnail_url?: string | null
          title: string
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          content_type?: string
          content_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          price_cents?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          thumbnail_url?: string | null
          title?: string
          total_revenue?: number | null
          total_sales?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_content_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_content_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_content_purchases: {
        Row: {
          amount_paid: number
          coach_id: string
          coach_share: number
          content_id: string
          created_at: string
          currency: string
          id: string
          platform_share: number
          purchased_at: string
          status: string
          stripe_session_id: string | null
          stripe_transfer_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid: number
          coach_id: string
          coach_share: number
          content_id: string
          created_at?: string
          currency?: string
          id?: string
          platform_share: number
          purchased_at?: string
          status?: string
          stripe_session_id?: string | null
          stripe_transfer_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number
          coach_id?: string
          coach_share?: number
          content_id?: string
          created_at?: string
          currency?: string
          id?: string
          platform_share?: number
          purchased_at?: string
          status?: string
          stripe_session_id?: string | null
          stripe_transfer_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_content_purchases_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_content_purchases_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_content_purchases_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "coach_content"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_messages: {
        Row: {
          client_id: string
          coach_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_type: string
        }
        Insert: {
          client_id: string
          coach_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_type: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_messages_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_messages_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          commission_rate: number
          created_at: string
          display_name: string
          id: string
          is_verified: boolean | null
          pending_payout: number | null
          referral_code: string
          stripe_connect_id: string | null
          stripe_onboarding_complete: boolean | null
          total_earnings: number | null
          total_referrals: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number
          created_at?: string
          display_name: string
          id?: string
          is_verified?: boolean | null
          pending_payout?: number | null
          referral_code: string
          stripe_connect_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          commission_rate?: number
          created_at?: string
          display_name?: string
          id?: string
          is_verified?: boolean | null
          pending_payout?: number | null
          referral_code?: string
          stripe_connect_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_earnings?: number | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_routine_templates: {
        Row: {
          active_steps: Json | null
          coach_id: string
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          name: string
          routine_steps_order: Json | null
          step_configs: Json | null
          tribe_id: string | null
          updated_at: string
        }
        Insert: {
          active_steps?: Json | null
          coach_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          routine_steps_order?: Json | null
          step_configs?: Json | null
          tribe_id?: string | null
          updated_at?: string
        }
        Update: {
          active_steps?: Json | null
          coach_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          routine_steps_order?: Json | null
          step_configs?: Json | null
          tribe_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_routine_templates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_routine_templates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_routine_templates_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount: number
          coach_id: string
          created_at: string
          currency: string
          id: string
          original_payment: number
          paid_at: string | null
          referral_id: string
          status: string
          stripe_payment_id: string | null
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          coach_id: string
          created_at?: string
          currency?: string
          id?: string
          original_payment: number
          paid_at?: string | null
          referral_id: string
          status?: string
          stripe_payment_id?: string | null
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          coach_id?: string
          created_at?: string
          currency?: string
          id?: string
          original_payment?: number
          paid_at?: string | null
          referral_id?: string
          status?: string
          stripe_payment_id?: string | null
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      community_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      content_creation: {
        Row: {
          completed: boolean | null
          content_description: string | null
          content_type: string | null
          created_at: string | null
          date: string
          id: string
          steps_completed: Json | null
          updated_at: string | null
          user_id: string
          video_description: string | null
        }
        Insert: {
          completed?: boolean | null
          content_description?: string | null
          content_type?: string | null
          created_at?: string | null
          date?: string
          id?: string
          steps_completed?: Json | null
          updated_at?: string | null
          user_id: string
          video_description?: string | null
        }
        Update: {
          completed?: boolean | null
          content_description?: string | null
          content_type?: string | null
          created_at?: string | null
          date?: string
          id?: string
          steps_completed?: Json | null
          updated_at?: string | null
          user_id?: string
          video_description?: string | null
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          is_free: boolean | null
          order_index: number
          pdf_url: string | null
          section_name: string | null
          text_content: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_free?: boolean | null
          order_index: number
          pdf_url?: string | null
          section_name?: string | null
          text_content?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_free?: boolean | null
          order_index?: number
          pdf_url?: string | null
          section_name?: string | null
          text_content?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_purchases: {
        Row: {
          amount_paid: number | null
          created_at: string
          currency: string | null
          id: string
          product_id: string
          purchased_at: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          product_id: string
          purchased_at?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          product_id?: string
          purchased_at?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      course_submodules: {
        Row: {
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          module_id: string
          order_index: number
          pdf_url: string | null
          text_content: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          module_id: string
          order_index: number
          pdf_url?: string | null
          text_content?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          module_id?: string
          order_index?: number
          pdf_url?: string | null
          text_content?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_submodules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration: string | null
          id: string
          is_published: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration?: string | null
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration?: string | null
          id?: string
          is_published?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crm_activity_timeline: {
        Row: {
          activity_data: Json | null
          activity_title: string | null
          activity_type: string
          contact_id: string | null
          created_at: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_title?: string | null
          activity_type: string
          contact_id?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_title?: string | null
          activity_type?: string
          contact_id?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activity_timeline_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_admin_sessions: {
        Row: {
          actions_taken: Json | null
          admin_email: string | null
          admin_id: string
          ended_at: string | null
          id: string
          notes: string | null
          session_type: string
          started_at: string | null
          target_contact_id: string | null
          target_email: string | null
          target_user_id: string | null
        }
        Insert: {
          actions_taken?: Json | null
          admin_email?: string | null
          admin_id: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          session_type: string
          started_at?: string | null
          target_contact_id?: string | null
          target_email?: string | null
          target_user_id?: string | null
        }
        Update: {
          actions_taken?: Json | null
          admin_email?: string | null
          admin_id?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          session_type?: string
          started_at?: string | null
          target_contact_id?: string | null
          target_email?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_admin_sessions_target_contact_id_fkey"
            columns: ["target_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contact_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contact_profiles: {
        Row: {
          account_created_at: string | null
          admin_notes: string | null
          avatar_emoji: string | null
          challenge_completed_at: string | null
          challenge_current_day: number | null
          challenge_days_completed: number | null
          challenge_started_at: string | null
          created_at: string | null
          current_streak: number | null
          days_in_current_stage: number | null
          door_completion_rate: number | null
          email: string
          email_clicks: number | null
          email_opens: number | null
          engagement_score: number | null
          first_purchase_at: string | null
          first_seen_at: string | null
          funnel_stage: string | null
          funnel_stage_changed_at: string | null
          gender: string | null
          id: string
          last_activity_at: string | null
          lead_captured_at: string | null
          lead_magnet_clicks: number | null
          lead_score: number | null
          lead_source: string | null
          lifetime_value: number | null
          mql_at: string | null
          name: string | null
          phone: string | null
          sql_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          tags: string[] | null
          time_on_quiz_seconds: number | null
          total_door_tasks: number | null
          total_page_views: number | null
          total_purchases: number | null
          total_sessions: number | null
          total_stack_sessions: number | null
          updated_at: string | null
          user_id: string | null
          vision_2026_completed_at: string | null
          vision_2026_score: number | null
          warrior_power_completed_at: string | null
          warrior_power_data: Json | null
          warrior_power_score: number | null
          warrior_power_started_at: string | null
        }
        Insert: {
          account_created_at?: string | null
          admin_notes?: string | null
          avatar_emoji?: string | null
          challenge_completed_at?: string | null
          challenge_current_day?: number | null
          challenge_days_completed?: number | null
          challenge_started_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          days_in_current_stage?: number | null
          door_completion_rate?: number | null
          email: string
          email_clicks?: number | null
          email_opens?: number | null
          engagement_score?: number | null
          first_purchase_at?: string | null
          first_seen_at?: string | null
          funnel_stage?: string | null
          funnel_stage_changed_at?: string | null
          gender?: string | null
          id?: string
          last_activity_at?: string | null
          lead_captured_at?: string | null
          lead_magnet_clicks?: number | null
          lead_score?: number | null
          lead_source?: string | null
          lifetime_value?: number | null
          mql_at?: string | null
          name?: string | null
          phone?: string | null
          sql_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tags?: string[] | null
          time_on_quiz_seconds?: number | null
          total_door_tasks?: number | null
          total_page_views?: number | null
          total_purchases?: number | null
          total_sessions?: number | null
          total_stack_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
          vision_2026_completed_at?: string | null
          vision_2026_score?: number | null
          warrior_power_completed_at?: string | null
          warrior_power_data?: Json | null
          warrior_power_score?: number | null
          warrior_power_started_at?: string | null
        }
        Update: {
          account_created_at?: string | null
          admin_notes?: string | null
          avatar_emoji?: string | null
          challenge_completed_at?: string | null
          challenge_current_day?: number | null
          challenge_days_completed?: number | null
          challenge_started_at?: string | null
          created_at?: string | null
          current_streak?: number | null
          days_in_current_stage?: number | null
          door_completion_rate?: number | null
          email?: string
          email_clicks?: number | null
          email_opens?: number | null
          engagement_score?: number | null
          first_purchase_at?: string | null
          first_seen_at?: string | null
          funnel_stage?: string | null
          funnel_stage_changed_at?: string | null
          gender?: string | null
          id?: string
          last_activity_at?: string | null
          lead_captured_at?: string | null
          lead_magnet_clicks?: number | null
          lead_score?: number | null
          lead_source?: string | null
          lifetime_value?: number | null
          mql_at?: string | null
          name?: string | null
          phone?: string | null
          sql_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tags?: string[] | null
          time_on_quiz_seconds?: number | null
          total_door_tasks?: number | null
          total_page_views?: number | null
          total_purchases?: number | null
          total_sessions?: number | null
          total_stack_sessions?: number | null
          updated_at?: string | null
          user_id?: string | null
          vision_2026_completed_at?: string | null
          vision_2026_score?: number | null
          warrior_power_completed_at?: string | null
          warrior_power_data?: Json | null
          warrior_power_score?: number | null
          warrior_power_started_at?: string | null
        }
        Relationships: []
      }
      custom_widgets: {
        Row: {
          config: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          is_template: boolean | null
          name: string
          order_index: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          is_template?: boolean | null
          name: string
          order_index?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          is_template?: boolean | null
          name?: string
          order_index?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          gratitude_note: string | null
          id: string
          mood_score: number | null
          top_priority: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          energy_level?: number | null
          gratitude_note?: string | null
          id?: string
          mood_score?: number | null
          top_priority?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          gratitude_note?: string | null
          id?: string
          mood_score?: number | null
          top_priority?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_flow_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: string | null
          date: string
          id: string
          started_at: string | null
          steps_completed: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          date?: string
          id?: string
          started_at?: string | null
          steps_completed?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          date?: string
          id?: string
          started_at?: string | null
          steps_completed?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_habit_completions: {
        Row: {
          completed_at: string | null
          date: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          date?: string
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          date?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "daily_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_habits: {
        Row: {
          category: string
          created_at: string | null
          habit_group: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          position: number | null
          source_mission_id: string | null
          sync_to_routine: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          habit_group?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          position?: number | null
          source_mission_id?: string | null
          sync_to_routine?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          habit_group?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          position?: number | null
          source_mission_id?: string | null
          sync_to_routine?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_habits_source_mission_id_fkey"
            columns: ["source_mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_progress: {
        Row: {
          created_at: string | null
          date: string
          id: string
          notes: string | null
          progress_data: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          progress_data?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          progress_data?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      daily_progress_stats: {
        Row: {
          completed_tasks: number | null
          completion_rate: number | null
          created_at: string | null
          date: string
          do_list_items: number | null
          hit_list_items: number | null
          hot_list_items: number | null
          id: string
          streak_days: number | null
          total_tasks: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_tasks?: number | null
          completion_rate?: number | null
          created_at?: string | null
          date: string
          do_list_items?: number | null
          hit_list_items?: number | null
          hot_list_items?: number | null
          id?: string
          streak_days?: number | null
          total_tasks?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_tasks?: number | null
          completion_rate?: number | null
          created_at?: string | null
          date?: string
          do_list_items?: number | null
          hit_list_items?: number | null
          hot_list_items?: number | null
          id?: string
          streak_days?: number | null
          total_tasks?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_tracking: {
        Row: {
          core_score: number | null
          created_at: string | null
          daily_four_score: number | null
          date: string
          door_tasks_completed: number | null
          id: string
          journal_completed: boolean | null
          stack_completed: boolean | null
          tracking_data: Json | null
          updated_at: string | null
          user_id: string
          weekly_two_score: number | null
        }
        Insert: {
          core_score?: number | null
          created_at?: string | null
          daily_four_score?: number | null
          date?: string
          door_tasks_completed?: number | null
          id?: string
          journal_completed?: boolean | null
          stack_completed?: boolean | null
          tracking_data?: Json | null
          updated_at?: string | null
          user_id: string
          weekly_two_score?: number | null
        }
        Update: {
          core_score?: number | null
          created_at?: string | null
          daily_four_score?: number | null
          date?: string
          door_tasks_completed?: number | null
          id?: string
          journal_completed?: boolean | null
          stack_completed?: boolean | null
          tracking_data?: Json | null
          updated_at?: string | null
          user_id?: string
          weekly_two_score?: number | null
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      divine_coaching_sessions: {
        Row: {
          answer: string | null
          answers: string | null
          created_at: string | null
          id: string
          is_system_response: boolean | null
          message: string | null
          question: string | null
          session_id: string
          step_number: number | null
          type: string | null
          user_id: string
        }
        Insert: {
          answer?: string | null
          answers?: string | null
          created_at?: string | null
          id?: string
          is_system_response?: boolean | null
          message?: string | null
          question?: string | null
          session_id: string
          step_number?: number | null
          type?: string | null
          user_id: string
        }
        Update: {
          answer?: string | null
          answers?: string | null
          created_at?: string | null
          id?: string
          is_system_response?: boolean | null
          message?: string | null
          question?: string | null
          session_id?: string
          step_number?: number | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ebook_purchases: {
        Row: {
          created_at: string
          delivery_email_sent_at: string | null
          email: string
          id: string
          language: string
          name: string | null
          purchased_at: string
          stripe_session_id: string | null
          updated_at: string
          upsell_email_1_sent_at: string | null
          upsell_email_2_sent_at: string | null
          upsell_purchased_at: string | null
        }
        Insert: {
          created_at?: string
          delivery_email_sent_at?: string | null
          email: string
          id?: string
          language?: string
          name?: string | null
          purchased_at?: string
          stripe_session_id?: string | null
          updated_at?: string
          upsell_email_1_sent_at?: string | null
          upsell_email_2_sent_at?: string | null
          upsell_purchased_at?: string | null
        }
        Update: {
          created_at?: string
          delivery_email_sent_at?: string | null
          email?: string
          id?: string
          language?: string
          name?: string | null
          purchased_at?: string
          stripe_session_id?: string | null
          updated_at?: string
          upsell_email_1_sent_at?: string | null
          upsell_email_2_sent_at?: string | null
          upsell_purchased_at?: string | null
        }
        Relationships: []
      }
      email_leads: {
        Row: {
          created_at: string
          email: string
          gender: string | null
          id: string
          ip_address: string | null
          lead_magnet: string
          metadata: Json | null
          name: string | null
          phone: string | null
          source: string | null
          subscribed: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          gender?: string | null
          id?: string
          ip_address?: string | null
          lead_magnet?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          source?: string | null
          subscribed?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          gender?: string | null
          id?: string
          ip_address?: string | null
          lead_magnet?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          source?: string | null
          subscribed?: boolean | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_sequence_log: {
        Row: {
          clicked_at: string | null
          day_number: number
          email: string
          id: string
          lead_id: string | null
          opened_at: string | null
          sent_at: string | null
          sequence_type: string
          tracking_id: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          clicked_at?: string | null
          day_number: number
          email: string
          id?: string
          lead_id?: string | null
          opened_at?: string | null
          sent_at?: string | null
          sequence_type: string
          tracking_id?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          clicked_at?: string | null
          day_number?: number
          email?: string
          id?: string
          lead_id?: string | null
          opened_at?: string | null
          sent_at?: string | null
          sequence_type?: string
          tracking_id?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "email_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      emotional_checkins: {
        Row: {
          context: string | null
          created_at: string
          emotion: string
          energy_level: number
          id: string
          intensity: number
          notes: string | null
          reaction: string | null
          result: string | null
          trigger: string | null
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          emotion: string
          energy_level: number
          id?: string
          intensity: number
          notes?: string | null
          reaction?: string | null
          result?: string | null
          trigger?: string | null
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          emotion?: string
          energy_level?: number
          id?: string
          intensity?: number
          notes?: string | null
          reaction?: string | null
          result?: string | null
          trigger?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emotional_patterns: {
        Row: {
          ai_insight: string | null
          created_at: string
          description: string
          first_detected: string
          frequency: number
          id: string
          is_active: boolean
          last_detected: string
          pattern_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_insight?: string | null
          created_at?: string
          description: string
          first_detected?: string
          frequency?: number
          id?: string
          is_active?: boolean
          last_detected?: string
          pattern_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_insight?: string | null
          created_at?: string
          description?: string
          first_detected?: string
          frequency?: number
          id?: string
          is_active?: boolean
          last_detected?: string
          pattern_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      empowerment_meditations: {
        Row: {
          audio_url: string | null
          binaural_type: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          is_favorite: boolean | null
          meditation_script: string
          objectives_snapshot: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          binaural_type?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          is_favorite?: boolean | null
          meditation_script: string
          objectives_snapshot?: Json | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          binaural_type?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          is_favorite?: boolean | null
          meditation_script?: string
          objectives_snapshot?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          component_name: string | null
          component_stack: string | null
          created_at: string | null
          error_message: string
          id: string
          resolved: boolean | null
          resolved_at: string | null
          stack_trace: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component_name?: string | null
          component_stack?: string | null
          created_at?: string | null
          error_message: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component_name?: string | null
          component_stack?: string | null
          created_at?: string | null
          error_message?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          stack_trace?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fact_maps: {
        Row: {
          category: string
          created_at: string | null
          goals: Json | null
          id: string
          items: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          goals?: Json | null
          id?: string
          items?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          goals?: Json | null
          id?: string
          items?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      game_journey_maps: {
        Row: {
          annual_goal: Json | null
          category: string
          created_at: string | null
          fact_answers: Json | null
          id: string
          map_type: string
          monthly_goal: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_goal?: Json | null
          category: string
          created_at?: string | null
          fact_answers?: Json | null
          id?: string
          map_type?: string
          monthly_goal?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_goal?: Json | null
          category?: string
          created_at?: string | null
          fact_answers?: Json | null
          id?: string
          map_type?: string
          monthly_goal?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goal_reminders: {
        Row: {
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          last_shown_at: string | null
          mission_id: string
          next_reminder_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency: string
          id?: string
          is_active?: boolean
          last_shown_at?: string | null
          mission_id: string
          next_reminder_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_shown_at?: string | null
          mission_id?: string
          next_reminder_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_reminders_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      hot_list_items: {
        Row: {
          completed: boolean | null
          created_at: string | null
          day: string | null
          day_of_week: string | null
          id: string
          item_id: string
          list_type: string
          priority: number | null
          selected: boolean | null
          title: string
          updated_at: string | null
          user_id: string
          week_key: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          day?: string | null
          day_of_week?: string | null
          id?: string
          item_id: string
          list_type: string
          priority?: number | null
          selected?: boolean | null
          title: string
          updated_at?: string | null
          user_id: string
          week_key: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          day?: string | null
          day_of_week?: string | null
          id?: string
          item_id?: string
          list_type?: string
          priority?: number | null
          selected?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      idea_empowerment: {
        Row: {
          created_at: string | null
          essence: string | null
          feeling_achieved: string | null
          how_overcome: string | null
          id: string
          is_massive: boolean | null
          negative_impact: string | null
          obstacles: string | null
          other_obstacles: string | null
          positive_impact: string | null
          task_id: string | null
          updated_at: string | null
          user_id: string
          who_involved: string | null
          why_exactly: string | null
          why_want: string | null
        }
        Insert: {
          created_at?: string | null
          essence?: string | null
          feeling_achieved?: string | null
          how_overcome?: string | null
          id?: string
          is_massive?: boolean | null
          negative_impact?: string | null
          obstacles?: string | null
          other_obstacles?: string | null
          positive_impact?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id: string
          who_involved?: string | null
          why_exactly?: string | null
          why_want?: string | null
        }
        Update: {
          created_at?: string | null
          essence?: string | null
          feeling_achieved?: string | null
          how_overcome?: string | null
          id?: string
          is_massive?: boolean | null
          negative_impact?: string | null
          obstacles?: string | null
          other_obstacles?: string | null
          positive_impact?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string
          who_involved?: string | null
          why_exactly?: string | null
          why_want?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idea_empowerment_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "user_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas_bank: {
        Row: {
          analysis_result: Json | null
          analyzed_at: string | null
          category: string | null
          created_at: string | null
          id: string
          linked_objective_id: string | null
          priority: number | null
          status: string | null
          text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          analyzed_at?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          linked_objective_id?: string | null
          priority?: number | null
          status?: string | null
          text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          analyzed_at?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          linked_objective_id?: string | null
          priority?: number | null
          status?: string | null
          text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      knowledge_base_files: {
        Row: {
          content_preview: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          project_id: string | null
          upload_date: string | null
          user_id: string
        }
        Insert: {
          content_preview?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id?: string | null
          upload_date?: string | null
          user_id: string
        }
        Update: {
          content_preview?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id?: string | null
          upload_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "napoleon_hill_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_magnet_events: {
        Row: {
          created_at: string
          device_type: string | null
          email: string | null
          event_data: Json | null
          event_type: string
          id: string
          lead_magnet: string
          page_path: string | null
          referrer: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          email?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          lead_magnet: string
          page_path?: string | null
          referrer?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          device_type?: string | null
          email?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          lead_magnet?: string
          page_path?: string | null
          referrer?: string | null
          session_id?: string
        }
        Relationships: []
      }
      leaderboard_profiles: {
        Row: {
          avatar_emoji: string | null
          created_at: string | null
          display_name: string
          id: string
          is_visible: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_emoji?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          is_visible?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_emoji?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          is_visible?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lifebook_drafts: {
        Row: {
          created_at: string | null
          id: string
          last_saved_at: string
          messages: Json
          section: string
          subcategory: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_saved_at?: string
          messages?: Json
          section: string
          subcategory: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_saved_at?: string
          messages?: Json
          section?: string
          subcategory?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lifebook_entries: {
        Row: {
          category: string
          content: Json
          created_at: string | null
          id: string
          messages: Json | null
          section: string
          status: string | null
          subcategory: string
          summary: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          content?: Json
          created_at?: string | null
          id?: string
          messages?: Json | null
          section: string
          status?: string | null
          subcategory: string
          summary?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string | null
          id?: string
          messages?: Json | null
          section?: string
          status?: string | null
          subcategory?: string
          summary?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      marketing_assets: {
        Row: {
          asset_type: string
          category: string | null
          content: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          asset_type: string
          category?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          category?: string | null
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marriage_profiles: {
        Row: {
          axis_scores: Json | null
          children_count: number | null
          created_at: string
          id: string
          last_analysis_at: string | null
          partner_love_language: string | null
          partner_name: string | null
          partner_pronoun: string | null
          recurring_patterns: Json | null
          relationship_context: string | null
          relationship_years: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          axis_scores?: Json | null
          children_count?: number | null
          created_at?: string
          id?: string
          last_analysis_at?: string | null
          partner_love_language?: string | null
          partner_name?: string | null
          partner_pronoun?: string | null
          recurring_patterns?: Json | null
          relationship_context?: string | null
          relationship_years?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          axis_scores?: Json | null
          children_count?: number | null
          created_at?: string
          id?: string
          last_analysis_at?: string | null
          partner_love_language?: string | null
          partner_name?: string | null
          partner_pronoun?: string | null
          recurring_patterns?: Json | null
          relationship_context?: string | null
          relationship_years?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marriage_sessions: {
        Row: {
          attachment_types: string[] | null
          attachments: Json | null
          axis_diagnosis: Json | null
          conflict_summary: string | null
          created_at: string
          detected_distortions: Json | null
          fact_vs_interpretation: string | null
          factual_situation: string | null
          id: string
          pattern_recurrence: number | null
          perspective_coach: string | null
          perspective_husband: string | null
          perspective_wife: string | null
          primary_destructured_axis: string | null
          status: string
          task_description: string | null
          task_exported: boolean | null
          task_id: string | null
          task_title: string | null
          title: string | null
          transcripts: Json | null
          updated_at: string
          user_context: string | null
          user_id: string
        }
        Insert: {
          attachment_types?: string[] | null
          attachments?: Json | null
          axis_diagnosis?: Json | null
          conflict_summary?: string | null
          created_at?: string
          detected_distortions?: Json | null
          fact_vs_interpretation?: string | null
          factual_situation?: string | null
          id?: string
          pattern_recurrence?: number | null
          perspective_coach?: string | null
          perspective_husband?: string | null
          perspective_wife?: string | null
          primary_destructured_axis?: string | null
          status?: string
          task_description?: string | null
          task_exported?: boolean | null
          task_id?: string | null
          task_title?: string | null
          title?: string | null
          transcripts?: Json | null
          updated_at?: string
          user_context?: string | null
          user_id: string
        }
        Update: {
          attachment_types?: string[] | null
          attachments?: Json | null
          axis_diagnosis?: Json | null
          conflict_summary?: string | null
          created_at?: string
          detected_distortions?: Json | null
          fact_vs_interpretation?: string | null
          factual_situation?: string | null
          id?: string
          pattern_recurrence?: number | null
          perspective_coach?: string | null
          perspective_husband?: string | null
          perspective_wife?: string | null
          primary_destructured_axis?: string | null
          status?: string
          task_description?: string | null
          task_exported?: boolean | null
          task_id?: string | null
          task_title?: string | null
          title?: string | null
          transcripts?: Json | null
          updated_at?: string
          user_context?: string | null
          user_id?: string
        }
        Relationships: []
      }
      marriage_timeline_events: {
        Row: {
          axis_affected: string | null
          created_at: string
          description: string | null
          distortion: string | null
          event_type: string
          id: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          axis_affected?: string | null
          created_at?: string
          description?: string | null
          distortion?: string | null
          event_type: string
          id?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          axis_affected?: string | null
          created_at?: string
          description?: string | null
          distortion?: string | null
          event_type?: string
          id?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marriage_timeline_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "marriage_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_days: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          meal_plan_id: string
          meals: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          meal_plan_id: string
          meals?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          meal_plan_id?: string
          meals?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_days_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          calorie_target: number | null
          carbs_target: number | null
          coach_id: string
          created_at: string
          description: string | null
          fats_target: number | null
          id: string
          name: string
          protein_target: number | null
          tribe_id: string | null
          updated_at: string
        }
        Insert: {
          calorie_target?: number | null
          carbs_target?: number | null
          coach_id: string
          created_at?: string
          description?: string | null
          fats_target?: number | null
          id?: string
          name: string
          protein_target?: number | null
          tribe_id?: string | null
          updated_at?: string
        }
        Update: {
          calorie_target?: number | null
          carbs_target?: number | null
          coach_id?: string
          created_at?: string
          description?: string | null
          fats_target?: number | null
          id?: string
          name?: string
          protein_target?: number | null
          tribe_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      mentalitate_stack_sessions: {
        Row: {
          action: string | null
          axes_impacted: string[]
          completed: boolean
          completed_at: string | null
          control_score: number | null
          created_at: string
          deep_dive_axis: string | null
          distortion_detected: string | null
          domino_task_id: string | null
          id: string
          mode: string
          pattern_summary: string | null
          phase_answers: Json
          reframe: string | null
          source: string
          updated_at: string
          user_id: string
          vina_score: number | null
        }
        Insert: {
          action?: string | null
          axes_impacted?: string[]
          completed?: boolean
          completed_at?: string | null
          control_score?: number | null
          created_at?: string
          deep_dive_axis?: string | null
          distortion_detected?: string | null
          domino_task_id?: string | null
          id?: string
          mode?: string
          pattern_summary?: string | null
          phase_answers?: Json
          reframe?: string | null
          source?: string
          updated_at?: string
          user_id: string
          vina_score?: number | null
        }
        Update: {
          action?: string | null
          axes_impacted?: string[]
          completed?: boolean
          completed_at?: string | null
          control_score?: number | null
          created_at?: string
          deep_dive_axis?: string | null
          distortion_detected?: string | null
          domino_task_id?: string | null
          id?: string
          mode?: string
          pattern_summary?: string | null
          phase_answers?: Json
          reframe?: string | null
          source?: string
          updated_at?: string
          user_id?: string
          vina_score?: number | null
        }
        Relationships: []
      }
      migration_status: {
        Row: {
          backup_data: Json | null
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          items_migrated: number | null
          items_total: number | null
          migration_type: string
          status: string
          user_id: string
        }
        Insert: {
          backup_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          items_migrated?: number | null
          items_total?: number | null
          migration_type: string
          status?: string
          user_id: string
        }
        Update: {
          backup_data?: Json | null
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          items_migrated?: number | null
          items_total?: number | null
          migration_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_axis_scores: {
        Row: {
          axis: string
          contributing_quizzes: number
          created_at: string
          details: Json | null
          id: string
          last_computed_at: string
          score_healthy: number
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          axis: string
          contributing_quizzes?: number
          created_at?: string
          details?: Json | null
          id?: string
          last_computed_at?: string
          score_healthy?: number
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          axis?: string
          contributing_quizzes?: number
          created_at?: string
          details?: Json | null
          id?: string
          last_computed_at?: string
          score_healthy?: number
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_belief_matrix: {
        Row: {
          belief_key: string
          created_at: string
          data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          belief_key: string
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          belief_key?: string
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_psa_history: {
        Row: {
          belief_key: string
          created_at: string
          data: Json
          id: string
          progress_percent: number
          user_id: string
        }
        Insert: {
          belief_key: string
          created_at?: string
          data?: Json
          id?: string
          progress_percent?: number
          user_id: string
        }
        Update: {
          belief_key?: string
          created_at?: string
          data?: Json
          id?: string
          progress_percent?: number
          user_id?: string
        }
        Relationships: []
      }
      mind_psa_reconstruction: {
        Row: {
          belief_key: string
          created_at: string
          data: Json
          id: string
          progress_percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          belief_key: string
          created_at?: string
          data?: Json
          id?: string
          progress_percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          belief_key?: string
          created_at?: string
          data?: Json
          id?: string
          progress_percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_quiz_drafts: {
        Row: {
          answers: Json
          created_at: string
          current_index: number
          language: string
          quiz_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          current_index?: number
          language?: string
          quiz_slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          current_index?: number
          language?: string
          quiz_slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_quiz_responses: {
        Row: {
          answers: Json
          axes_distribution: Json | null
          band: string | null
          completed_at: string | null
          created_at: string
          id: string
          language: string
          max_score: number | null
          quiz_slug: string
          raw_score: number | null
          score_healthy: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          axes_distribution?: Json | null
          band?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          language?: string
          max_score?: number | null
          quiz_slug: string
          raw_score?: number | null
          score_healthy?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          axes_distribution?: Json | null
          band?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          language?: string
          max_score?: number | null
          quiz_slug?: string
          raw_score?: number | null
          score_healthy?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mind_shift_beliefs: {
        Row: {
          activation_prompt: string
          active: boolean
          created_at: string
          emotion_tags: string[] | null
          id: string
          incantation: string
          long_description: string | null
          name: string
          order_index: number
          short_description: string
          slug: string
          updated_at: string
        }
        Insert: {
          activation_prompt: string
          active?: boolean
          created_at?: string
          emotion_tags?: string[] | null
          id?: string
          incantation: string
          long_description?: string | null
          name: string
          order_index?: number
          short_description: string
          slug: string
          updated_at?: string
        }
        Update: {
          activation_prompt?: string
          active?: boolean
          created_at?: string
          emotion_tags?: string[] | null
          id?: string
          incantation?: string
          long_description?: string | null
          name?: string
          order_index?: number
          short_description?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      mind_shift_categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          name: string
          order_index: number | null
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          name: string
          order_index?: number | null
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          name?: string
          order_index?: number | null
          slug?: string
        }
        Relationships: []
      }
      mind_shift_distortions: {
        Row: {
          active: boolean
          created_at: string
          example: string | null
          id: string
          name: string
          order_index: number
          reframe_template: string | null
          short_description: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          example?: string | null
          id?: string
          name: string
          order_index?: number
          reframe_template?: string | null
          short_description: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          example?: string | null
          id?: string
          name?: string
          order_index?: number
          reframe_template?: string | null
          short_description?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      mind_shift_sessions: {
        Row: {
          act_value: string | null
          ai_suggestions: Json | null
          automatic_thought: string | null
          belief_slug: string | null
          category: string | null
          chat_history: Json | null
          chat_step: number
          cognitive_reframe: string | null
          commitment_task_id: string | null
          commitment_text: string | null
          completed_at: string | null
          created_at: string
          date: string
          distortion_slug: string | null
          emotion: string | null
          id: string
          incantation_text: string | null
          intensity: number | null
          intensity_after: number | null
          intensity_before: number | null
          perception_area: string | null
          positive_reframe: string | null
          recurrence: string | null
          situation: string | null
          source: string
          status: string
          title: string | null
          updated_at: string
          user_id: string
          week_key: string | null
        }
        Insert: {
          act_value?: string | null
          ai_suggestions?: Json | null
          automatic_thought?: string | null
          belief_slug?: string | null
          category?: string | null
          chat_history?: Json | null
          chat_step?: number
          cognitive_reframe?: string | null
          commitment_task_id?: string | null
          commitment_text?: string | null
          completed_at?: string | null
          created_at?: string
          date?: string
          distortion_slug?: string | null
          emotion?: string | null
          id?: string
          incantation_text?: string | null
          intensity?: number | null
          intensity_after?: number | null
          intensity_before?: number | null
          perception_area?: string | null
          positive_reframe?: string | null
          recurrence?: string | null
          situation?: string | null
          source?: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
          week_key?: string | null
        }
        Update: {
          act_value?: string | null
          ai_suggestions?: Json | null
          automatic_thought?: string | null
          belief_slug?: string | null
          category?: string | null
          chat_history?: Json | null
          chat_step?: number
          cognitive_reframe?: string | null
          commitment_task_id?: string | null
          commitment_text?: string | null
          completed_at?: string | null
          created_at?: string
          date?: string
          distortion_slug?: string | null
          emotion?: string | null
          id?: string
          incantation_text?: string | null
          intensity?: number | null
          intensity_after?: number | null
          intensity_before?: number | null
          perception_area?: string | null
          positive_reframe?: string | null
          recurrence?: string | null
          situation?: string | null
          source?: string
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
          week_key?: string | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          category: string
          completed: boolean | null
          created_at: string | null
          end_goal_value: string | null
          goal_data: Json
          id: string
          is_impossible_game: boolean | null
          measurable_result: string | null
          mission_type: string
          parent_mission_id: string | null
          period: string | null
          position: number | null
          project_name: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          completed?: boolean | null
          created_at?: string | null
          end_goal_value?: string | null
          goal_data?: Json
          id?: string
          is_impossible_game?: boolean | null
          measurable_result?: string | null
          mission_type?: string
          parent_mission_id?: string | null
          period?: string | null
          position?: number | null
          project_name?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          created_at?: string | null
          end_goal_value?: string | null
          goal_data?: Json
          id?: string
          is_impossible_game?: boolean | null
          measurable_result?: string | null
          mission_type?: string
          parent_mission_id?: string | null
          period?: string | null
          position?: number | null
          project_name?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_parent_mission_id_fkey"
            columns: ["parent_mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_scores: {
        Row: {
          average_score: number | null
          created_at: string
          id: string
          month_key: string
          perfect_days: number | null
          total_xp_earned: number | null
          updated_at: string
          user_id: string
          weekly_scores: Json | null
        }
        Insert: {
          average_score?: number | null
          created_at?: string
          id?: string
          month_key: string
          perfect_days?: number | null
          total_xp_earned?: number | null
          updated_at?: string
          user_id: string
          weekly_scores?: Json | null
        }
        Update: {
          average_score?: number | null
          created_at?: string
          id?: string
          month_key?: string
          perfect_days?: number | null
          total_xp_earned?: number | null
          updated_at?: string
          user_id?: string
          weekly_scores?: Json | null
        }
        Relationships: []
      }
      napoleon_hill_notifications: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          last_sent_at: string | null
          notification_day: number | null
          notification_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          last_sent_at?: string | null
          notification_day?: number | null
          notification_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          last_sent_at?: string | null
          notification_day?: number | null
          notification_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      napoleon_hill_principle_drafts: {
        Row: {
          created_at: string | null
          id: string
          last_saved_at: string
          messages: Json
          principle_number: number
          project_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_saved_at?: string
          messages?: Json
          principle_number: number
          project_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_saved_at?: string
          messages?: Json
          principle_number?: number
          project_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "napoleon_hill_principle_drafts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "napoleon_hill_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      napoleon_hill_projects: {
        Row: {
          action_items: Json | null
          created_at: string | null
          current_principle: number
          goal_amount: string | null
          goal_deadline: string | null
          goal_description: string
          id: string
          principle_answers: Json | null
          principle_summaries: Json | null
          project_name: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string | null
          current_principle?: number
          goal_amount?: string | null
          goal_deadline?: string | null
          goal_description: string
          id?: string
          principle_answers?: Json | null
          principle_summaries?: Json | null
          project_name: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string | null
          current_principle?: number
          goal_amount?: string | null
          goal_deadline?: string | null
          goal_description?: string
          id?: string
          principle_answers?: Json | null
          principle_summaries?: Json | null
          project_name?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          pinned: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      objectives: {
        Row: {
          category: string
          completed: boolean | null
          created_at: string | null
          description: string
          id: string
          updated_at: string | null
          user_id: string
          week_key: string
        }
        Insert: {
          category: string
          completed?: boolean | null
          created_at?: string | null
          description: string
          id?: string
          updated_at?: string | null
          user_id: string
          week_key: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          created_at?: string | null
          description?: string
          id?: string
          updated_at?: string | null
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          completed_days: number[]
          created_at: string
          current_day: number
          id: string
          is_completed: boolean
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_days?: number[]
          created_at?: string
          current_day?: number
          id?: string
          is_completed?: boolean
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_days?: number[]
          created_at?: string
          current_day?: number
          id?: string
          is_completed?: boolean
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payout_history: {
        Row: {
          amount: number
          coach_id: string
          commissions_included: string[]
          created_at: string
          currency: string
          id: string
          status: string
          stripe_transfer_id: string
        }
        Insert: {
          amount: number
          coach_id: string
          commissions_included: string[]
          created_at?: string
          currency?: string
          id?: string
          status?: string
          stripe_transfer_id: string
        }
        Update: {
          amount?: number
          coach_id?: string
          commissions_included?: string[]
          created_at?: string
          currency?: string
          id?: string
          status?: string
          stripe_transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_history_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_history_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_power_progress: {
        Row: {
          breakthrough_completed: boolean
          breakthrough_text: string | null
          coaching_completed: boolean
          created_at: string
          day_number: number
          exercise_completed: boolean
          exercise_responses: Json | null
          id: string
          lesson_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          breakthrough_completed?: boolean
          breakthrough_text?: string | null
          coaching_completed?: boolean
          created_at?: string
          day_number: number
          exercise_completed?: boolean
          exercise_responses?: Json | null
          id?: string
          lesson_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          breakthrough_completed?: boolean
          breakthrough_text?: string | null
          coaching_completed?: boolean
          created_at?: string
          day_number?: number
          exercise_completed?: boolean
          exercise_responses?: Json | null
          id?: string
          lesson_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_course_referrals: {
        Row: {
          coach_id: string
          commission_cents: number
          course_slug: string
          created_at: string
          id: string
          status: string
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          coach_id: string
          commission_cents?: number
          course_slug: string
          created_at?: string
          id?: string
          status?: string
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          coach_id?: string
          commission_cents?: number
          course_slug?: string
          created_at?: string
          id?: string
          status?: string
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      public_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string | null
          recipient_id: string | null
          sender_id: string
          title: string
          tribe_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type?: string | null
          recipient_id?: string | null
          sender_id: string
          title: string
          tribe_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string | null
          recipient_id?: string | null
          sender_id?: string
          title?: string
          tribe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_notifications_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      quests: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          quest_type: string
          target_value: number
          title: string
          xp_reward: number
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          quest_type: string
          target_value?: number
          title: string
          xp_reward?: number
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          quest_type?: string
          target_value?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          updated_at: string | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          updated_at?: string | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          updated_at?: string | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          coach_id: string
          created_at: string
          first_payment_at: string | null
          id: string
          lifetime_value: number | null
          referral_code: string
          referred_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          first_payment_at?: string | null
          id?: string
          lifetime_value?: number | null
          referral_code: string
          referred_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          first_payment_at?: string | null
          id?: string
          lifetime_value?: number | null
          referral_code?: string
          referred_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_actions: {
        Row: {
          action_description: string | null
          completed: boolean | null
          created_at: string | null
          date: string
          id: string
          message_sent: string | null
          person_name: string | null
          person_type: string
          quality_time_description: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_description?: string | null
          completed?: boolean | null
          created_at?: string | null
          date?: string
          id?: string
          message_sent?: string | null
          person_name?: string | null
          person_type: string
          quality_time_description?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_description?: string | null
          completed?: boolean | null
          created_at?: string | null
          date?: string
          id?: string
          message_sent?: string | null
          person_name?: string | null
          person_type?: string
          quality_time_description?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      routine_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      routine_user_stats: {
        Row: {
          best_streak: number | null
          created_at: string | null
          current_level: number | null
          current_streak: number | null
          id: string
          last_routine_date: string | null
          total_meditation_seconds: number | null
          total_routines_completed: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_streak?: number | null
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          id?: string
          last_routine_date?: string | null
          total_meditation_seconds?: number | null
          total_routines_completed?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_streak?: number | null
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          id?: string
          last_routine_date?: string | null
          total_meditation_seconds?: number | null
          total_routines_completed?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          image_id: string | null
          meta_post_id: string | null
          platforms: string[] | null
          published_at: string | null
          scheduled_for: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          content_type?: string
          created_at?: string
          id?: string
          image_id?: string | null
          meta_post_id?: string | null
          platforms?: string[] | null
          published_at?: string | null
          scheduled_for: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          image_id?: string | null
          meta_post_id?: string | null
          platforms?: string[] | null
          published_at?: string | null
          scheduled_for?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "ai_generated_images"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          event_details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stack_library: {
        Row: {
          content: Json | null
          created_at: string | null
          has_transcript: boolean | null
          id: string
          title: string
          transcript_path: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          has_transcript?: boolean | null
          id?: string
          title: string
          transcript_path?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          has_transcript?: boolean | null
          id?: string
          title?: string
          transcript_path?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stack_sessions: {
        Row: {
          answers: Json | null
          challenge_day_number: number | null
          completed: boolean | null
          created_at: string | null
          data: Json | null
          id: string
          session_id: string
          stack_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          challenge_day_number?: number | null
          completed?: boolean | null
          created_at?: string | null
          data?: Json | null
          id?: string
          session_id: string
          stack_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          challenge_day_number?: number | null
          completed?: boolean | null
          created_at?: string | null
          data?: Json | null
          id?: string
          session_id?: string
          stack_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          early_bird_expires_at: string | null
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean | null
          subscription_end: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          early_bird_expires_at?: string | null
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          early_bird_expires_at?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean | null
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          activity: string
          category: string
          created_at: string
          date: string
          duration_minutes: number
          ended_at: string | null
          energy_after: number | null
          energy_before: number | null
          id: string
          notes: string | null
          satisfaction: number | null
          started_at: string | null
          user_id: string
          was_planned: boolean | null
        }
        Insert: {
          activity: string
          category: string
          created_at?: string
          date?: string
          duration_minutes?: number
          ended_at?: string | null
          energy_after?: number | null
          energy_before?: number | null
          id?: string
          notes?: string | null
          satisfaction?: number | null
          started_at?: string | null
          user_id: string
          was_planned?: boolean | null
        }
        Update: {
          activity?: string
          category?: string
          created_at?: string
          date?: string
          duration_minutes?: number
          ended_at?: string | null
          energy_after?: number | null
          energy_before?: number | null
          id?: string
          notes?: string | null
          satisfaction?: number | null
          started_at?: string | null
          user_id?: string
          was_planned?: boolean | null
        }
        Relationships: []
      }
      tribe_badges: {
        Row: {
          badge_type: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          points_required: number | null
          tribe_id: string
        }
        Insert: {
          badge_type?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points_required?: number | null
          tribe_id: string
        }
        Update: {
          badge_type?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points_required?: number | null
          tribe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_badges_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_course_modules: {
        Row: {
          content_text: string | null
          content_type: string
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          pdf_url: string | null
          position: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content_text?: string | null
          content_type?: string
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          pdf_url?: string | null
          position?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content_text?: string | null
          content_type?: string
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          pdf_url?: string | null
          position?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tribe_course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "tribe_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_courses: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          position: number
          thumbnail_url: string | null
          title: string
          tribe_id: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          position?: number
          thumbnail_url?: string | null
          title: string
          tribe_id: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          position?: number
          thumbnail_url?: string | null
          title?: string
          tribe_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_courses_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_event_rsvps: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tribe_events"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_events: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          duration_minutes: number | null
          end_at: string | null
          event_type: string
          id: string
          is_recurring: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_url: string | null
          recurrence_rule: string | null
          remind_before: boolean | null
          start_at: string
          timezone: string | null
          title: string
          tribe_id: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          duration_minutes?: number | null
          end_at?: string | null
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_url?: string | null
          recurrence_rule?: string | null
          remind_before?: boolean | null
          start_at: string
          timezone?: string | null
          title: string
          tribe_id: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration_minutes?: number | null
          end_at?: string | null
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_url?: string | null
          recurrence_rule?: string | null
          remind_before?: boolean | null
          start_at?: string
          timezone?: string | null
          title?: string
          tribe_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tribe_events_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_invites: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          invite_code: string
          is_active: boolean | null
          max_uses: number | null
          tribe_id: string
          uses_count: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          invite_code: string
          is_active?: boolean | null
          max_uses?: number | null
          tribe_id: string
          uses_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          is_active?: boolean | null
          max_uses?: number | null
          tribe_id?: string
          uses_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tribe_invites_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_join_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tribe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tribe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tribe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_join_requests_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          tribe_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          tribe_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          tribe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_members_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_module_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "tribe_course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_points: {
        Row: {
          created_at: string | null
          id: string
          points: number
          reason: string
          source_type: string
          tribe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points?: number
          reason: string
          source_type?: string
          tribe_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number
          reason?: string
          source_type?: string
          tribe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_points_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      tribe_user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tribe_user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "tribe_badges"
            referencedColumns: ["id"]
          },
        ]
      }
      tribes: {
        Row: {
          avatar_url: string | null
          coach_id: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_coach_tribe: boolean | null
          is_public: boolean | null
          member_count: number | null
          name: string
          requires_approval: boolean | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          avatar_url?: string | null
          coach_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_coach_tribe?: boolean | null
          is_public?: boolean | null
          member_count?: number | null
          name: string
          requires_approval?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          avatar_url?: string | null
          coach_id?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_coach_tribe?: boolean | null
          is_public?: boolean | null
          member_count?: number | null
          name?: string
          requires_approval?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tribes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tribes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ultimate_you_progress: {
        Row: {
          breakthrough_completed: boolean | null
          breakthrough_text: string | null
          coaching_completed: boolean | null
          completed_at: string | null
          created_at: string | null
          day_number: number
          exercise_completed: boolean | null
          exercise_responses: Json | null
          id: string
          lesson_completed: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          breakthrough_completed?: boolean | null
          breakthrough_text?: string | null
          coaching_completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          day_number: number
          exercise_completed?: boolean | null
          exercise_responses?: Json | null
          id?: string
          lesson_completed?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          breakthrough_completed?: boolean | null
          breakthrough_text?: string | null
          coaching_completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          day_number?: number
          exercise_completed?: boolean | null
          exercise_responses?: Json | null
          id?: string
          lesson_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_id: string
          achievement_name: string
          category: string
          icon: string | null
          id: string
          unlocked_at: string
          user_id: string
          xp_reward: number | null
        }
        Insert: {
          achievement_description?: string | null
          achievement_id: string
          achievement_name: string
          category: string
          icon?: string | null
          id?: string
          unlocked_at?: string
          user_id: string
          xp_reward?: number | null
        }
        Update: {
          achievement_description?: string | null
          achievement_id?: string
          achievement_name?: string
          category?: string
          icon?: string | null
          id?: string
          unlocked_at?: string
          user_id?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          page_path: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page_path?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          page_path?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          module_id: string | null
          updated_at: string | null
          user_id: string
          watched_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string | null
          updated_at?: string | null
          user_id: string
          watched_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string | null
          updated_at?: string | null
          user_id?: string
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goal_categories: {
        Row: {
          category_key: string
          color: string | null
          created_at: string | null
          display_name: string
          display_name_ro: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          order_index: number | null
          parent_category: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_key: string
          color?: string | null
          created_at?: string | null
          display_name: string
          display_name_ro?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          order_index?: number | null
          parent_category?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_key?: string
          color?: string | null
          created_at?: string | null
          display_name?: string
          display_name_ro?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          order_index?: number | null
          parent_category?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          dashboard_widgets: Json | null
          id: string
          language: string | null
          last_mind_test_at: string | null
          mind_test_skip_count: number
          onboarding_completed: Json | null
          preferred_tts_voice: string | null
          sound_muted: boolean | null
          sound_volume: number | null
          updated_at: string | null
          user_id: string
          vision_quiz_scores: Json | null
        }
        Insert: {
          created_at?: string | null
          dashboard_widgets?: Json | null
          id?: string
          language?: string | null
          last_mind_test_at?: string | null
          mind_test_skip_count?: number
          onboarding_completed?: Json | null
          preferred_tts_voice?: string | null
          sound_muted?: boolean | null
          sound_volume?: number | null
          updated_at?: string | null
          user_id: string
          vision_quiz_scores?: Json | null
        }
        Update: {
          created_at?: string | null
          dashboard_widgets?: Json | null
          id?: string
          language?: string | null
          last_mind_test_at?: string | null
          mind_test_skip_count?: number
          onboarding_completed?: Json | null
          preferred_tts_voice?: string | null
          sound_muted?: boolean | null
          sound_volume?: number | null
          updated_at?: string | null
          user_id?: string
          vision_quiz_scores?: Json | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_quest_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          current_value: number
          id: string
          quest_id: string
          reset_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          quest_id: string
          reset_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number
          id?: string
          quest_id?: string
          reset_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quest_progress_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          total_core4_sessions: number | null
          total_journal_entries: number | null
          total_stacks_completed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          total_core4_sessions?: number | null
          total_journal_entries?: number | null
          total_stacks_completed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          total_core4_sessions?: number | null
          total_journal_entries?: number | null
          total_stacks_completed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          area: string | null
          category: string | null
          completed: boolean | null
          created_at: string | null
          day: string | null
          day_of_week: string | null
          domain_category: string | null
          duration_minutes: number | null
          id: string
          is_key_point: boolean | null
          list_type: string
          parent_task_id: string | null
          position: number | null
          priority: number | null
          scheduled_time: string | null
          selected: boolean | null
          task_id: string | null
          task_type: string | null
          title: string
          updated_at: string | null
          user_id: string
          week_key: string | null
        }
        Insert: {
          area?: string | null
          category?: string | null
          completed?: boolean | null
          created_at?: string | null
          day?: string | null
          day_of_week?: string | null
          domain_category?: string | null
          duration_minutes?: number | null
          id?: string
          is_key_point?: boolean | null
          list_type: string
          parent_task_id?: string | null
          position?: number | null
          priority?: number | null
          scheduled_time?: string | null
          selected?: boolean | null
          task_id?: string | null
          task_type?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          week_key?: string | null
        }
        Update: {
          area?: string | null
          category?: string | null
          completed?: boolean | null
          created_at?: string | null
          day?: string | null
          day_of_week?: string | null
          domain_category?: string | null
          duration_minutes?: number | null
          id?: string
          is_key_point?: boolean | null
          list_type?: string
          parent_task_id?: string | null
          position?: number | null
          priority?: number | null
          scheduled_time?: string | null
          selected?: boolean | null
          task_id?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          week_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "user_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_widget_purchases: {
        Row: {
          created_at: string | null
          has_full_access: boolean | null
          id: string
          purchased_at: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          has_full_access?: boolean | null
          id?: string
          purchased_at?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          has_full_access?: boolean | null
          id?: string
          purchased_at?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_widget_purchases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "widget_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp: {
        Row: {
          created_at: string
          current_level: number
          id: string
          total_xp: number
          updated_at: string
          user_id: string
          xp_to_next_level: number
        }
        Insert: {
          created_at?: string
          current_level?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id: string
          xp_to_next_level?: number
        }
        Update: {
          created_at?: string
          current_level?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id?: string
          xp_to_next_level?: number
        }
        Relationships: []
      }
      vision_boards: {
        Row: {
          balance_image_url: string | null
          balance_vision: string | null
          being_image_url: string | null
          being_vision: string | null
          body_image_url: string | null
          body_vision: string | null
          business_image_url: string | null
          business_vision: string | null
          created_at: string | null
          email: string | null
          id: string
          is_complete: boolean | null
          quiz_answers: Json | null
          source: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance_image_url?: string | null
          balance_vision?: string | null
          being_image_url?: string | null
          being_vision?: string | null
          body_image_url?: string | null
          body_vision?: string | null
          business_image_url?: string | null
          business_vision?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_complete?: boolean | null
          quiz_answers?: Json | null
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance_image_url?: string | null
          balance_vision?: string | null
          being_image_url?: string | null
          being_vision?: string | null
          body_image_url?: string | null
          body_vision?: string | null
          business_image_url?: string | null
          business_vision?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_complete?: boolean | null
          quiz_answers?: Json | null
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      voice_recordings: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          id: string
          metadata: Json | null
          question_number: number | null
          question_text: string | null
          sentiment_analysis: Json | null
          session_id: string
          stack_type: string
          storage_path: string
          transcript: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          question_number?: number | null
          question_text?: string | null
          sentiment_analysis?: Json | null
          session_id: string
          stack_type: string
          storage_path: string
          transcript?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          question_number?: number | null
          question_text?: string | null
          sentiment_analysis?: Json | null
          session_id?: string
          stack_type?: string
          storage_path?: string
          transcript?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wall_post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          media_urls: string[] | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          media_urls?: string[] | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wall_post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "wall_post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wall_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "wall_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      wall_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wall_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "wall_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      wall_posts: {
        Row: {
          category: string | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          source_context: string | null
          source_label: string | null
          tribe_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          source_context?: string | null
          source_label?: string | null
          tribe_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          source_context?: string | null
          source_label?: string | null
          tribe_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wall_posts_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      warrior_power_results: {
        Row: {
          created_at: string
          email: string
          gender: string | null
          id: string
          name: string | null
          phone: string | null
          scores: Json
          total_score: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          gender?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          scores?: Json
          total_score?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          gender?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          scores?: Json
          total_score?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      warriors_action_completions: {
        Row: {
          action_index: number
          completed_at: string
          created_at: string
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          action_index: number
          completed_at?: string
          created_at?: string
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          action_index?: number
          completed_at?: string
          created_at?: string
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: []
      }
      warriors_comment_reactions: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warriors_comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "warriors_way_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      warriors_way_comments: {
        Row: {
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          module_id: string
          parent_id: string | null
          updated_at: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          module_id: string
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          module_id?: string
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warriors_way_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "warriors_way_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      warriors_way_lesson_content: {
        Row: {
          action_prompts: Json | null
          aha_moment: string | null
          created_at: string | null
          full_script: string
          id: string
          key_concepts: Json | null
          module_id: string
          order_number: number
          searchable_content: unknown
          section_id: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          action_prompts?: Json | null
          aha_moment?: string | null
          created_at?: string | null
          full_script: string
          id?: string
          key_concepts?: Json | null
          module_id: string
          order_number: number
          searchable_content?: unknown
          section_id: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          action_prompts?: Json | null
          aha_moment?: string | null
          created_at?: string | null
          full_script?: string
          id?: string
          key_concepts?: Json | null
          module_id?: string
          order_number?: number
          searchable_content?: unknown
          section_id?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      warriors_way_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          module_id: string
          updated_at: string | null
          user_id: string
          watched_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id: string
          updated_at?: string | null
          user_id: string
          watched_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string
          updated_at?: string | null
          user_id?: string
          watched_seconds?: number | null
        }
        Relationships: []
      }
      weekly_planning: {
        Row: {
          category: string | null
          created_at: string | null
          domino_title: string | null
          id: string
          key_points: Json | null
          plan_data: Json | null
          review_data: Json | null
          updated_at: string | null
          user_id: string
          week_goal: string | null
          week_key: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          domino_title?: string | null
          id?: string
          key_points?: Json | null
          plan_data?: Json | null
          review_data?: Json | null
          updated_at?: string | null
          user_id: string
          week_goal?: string | null
          week_key: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          domino_title?: string | null
          id?: string
          key_points?: Json | null
          plan_data?: Json | null
          review_data?: Json | null
          updated_at?: string | null
          user_id?: string
          week_goal?: string | null
          week_key?: string
        }
        Relationships: []
      }
      weekly_planning_drafts: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_skipping_review: boolean
          last_saved_at: string
          messages: Json
          questions_answered: number
          updated_at: string
          user_id: string
          week_key: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_skipping_review?: boolean
          last_saved_at?: string
          messages?: Json
          questions_answered?: number
          updated_at?: string
          user_id: string
          week_key: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_skipping_review?: boolean
          last_saved_at?: string
          messages?: Json
          questions_answered?: number
          updated_at?: string
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      weekly_planning_history: {
        Row: {
          created_at: string | null
          do_list_snapshot: Json | null
          domino_title: string | null
          hit_list_snapshot: Json | null
          hot_list_snapshot: Json | null
          id: string
          key_points: Json | null
          review_data: Json | null
          snapshot_reason: string | null
          user_id: string
          version_number: number
          week_goal: string | null
          week_key: string
        }
        Insert: {
          created_at?: string | null
          do_list_snapshot?: Json | null
          domino_title?: string | null
          hit_list_snapshot?: Json | null
          hot_list_snapshot?: Json | null
          id?: string
          key_points?: Json | null
          review_data?: Json | null
          snapshot_reason?: string | null
          user_id: string
          version_number?: number
          week_goal?: string | null
          week_key: string
        }
        Update: {
          created_at?: string | null
          do_list_snapshot?: Json | null
          domino_title?: string | null
          hit_list_snapshot?: Json | null
          hot_list_snapshot?: Json | null
          id?: string
          key_points?: Json | null
          review_data?: Json | null
          snapshot_reason?: string | null
          user_id?: string
          version_number?: number
          week_goal?: string | null
          week_key?: string
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          balance_progress: number | null
          being_progress: number | null
          body_progress: number | null
          business_progress: number | null
          created_at: string
          id: string
          improvements: string[] | null
          lessons: string[] | null
          next_week_focus: string | null
          overall_rating: number | null
          updated_at: string
          user_id: string
          week_key: string
          wins: string[] | null
        }
        Insert: {
          balance_progress?: number | null
          being_progress?: number | null
          body_progress?: number | null
          business_progress?: number | null
          created_at?: string
          id?: string
          improvements?: string[] | null
          lessons?: string[] | null
          next_week_focus?: string | null
          overall_rating?: number | null
          updated_at?: string
          user_id: string
          week_key: string
          wins?: string[] | null
        }
        Update: {
          balance_progress?: number | null
          being_progress?: number | null
          body_progress?: number | null
          business_progress?: number | null
          created_at?: string
          id?: string
          improvements?: string[] | null
          lessons?: string[] | null
          next_week_focus?: string | null
          overall_rating?: number | null
          updated_at?: string
          user_id?: string
          week_key?: string
          wins?: string[] | null
        }
        Relationships: []
      }
      weekly_scores: {
        Row: {
          average_score: number | null
          created_at: string
          daily_scores: Json | null
          id: string
          objectives_completed: number | null
          objectives_total: number | null
          streak_bonus: number | null
          total_score: number | null
          updated_at: string
          user_id: string
          week_key: string
        }
        Insert: {
          average_score?: number | null
          created_at?: string
          daily_scores?: Json | null
          id?: string
          objectives_completed?: number | null
          objectives_total?: number | null
          streak_bonus?: number | null
          total_score?: number | null
          updated_at?: string
          user_id: string
          week_key: string
        }
        Update: {
          average_score?: number | null
          created_at?: string
          daily_scores?: Json | null
          id?: string
          objectives_completed?: number | null
          objectives_total?: number | null
          streak_bonus?: number | null
          total_score?: number | null
          updated_at?: string
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      weekly_time_reports: {
        Row: {
          ai_recommendations: string[] | null
          ai_summary: string | null
          category_breakdown: Json | null
          created_at: string
          energy_average: number | null
          id: string
          roi_score: number | null
          total_hours: number | null
          user_id: string
          week_start: string
        }
        Insert: {
          ai_recommendations?: string[] | null
          ai_summary?: string | null
          category_breakdown?: Json | null
          created_at?: string
          energy_average?: number | null
          id?: string
          roi_score?: number | null
          total_hours?: number | null
          user_id: string
          week_start: string
        }
        Update: {
          ai_recommendations?: string[] | null
          ai_summary?: string | null
          category_breakdown?: Json | null
          created_at?: string
          energy_average?: number | null
          id?: string
          roi_score?: number | null
          total_hours?: number | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      widget_data: {
        Row: {
          created_at: string | null
          data: Json
          date: string | null
          id: string
          updated_at: string | null
          user_id: string
          widget_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          date?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          widget_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          date?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_data_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "custom_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_templates: {
        Row: {
          category: string | null
          config: Json
          created_at: string | null
          creator_user_id: string | null
          description: string | null
          icon: string | null
          id: string
          is_official: boolean | null
          is_premium: boolean | null
          name: string
          price: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          config?: Json
          created_at?: string | null
          creator_user_id?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_official?: boolean | null
          is_premium?: boolean | null
          name: string
          price?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          config?: Json
          created_at?: string | null
          creator_user_id?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_official?: boolean | null
          is_premium?: boolean | null
          name?: string
          price?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      workout_day_exercises: {
        Row: {
          created_at: string | null
          day_id: string
          exercise_name: string
          id: string
          notes: string | null
          order_index: number | null
          target_reps: string | null
          target_sets: number | null
          target_weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          day_id: string
          exercise_name: string
          id?: string
          notes?: string | null
          order_index?: number | null
          target_reps?: string | null
          target_sets?: number | null
          target_weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          day_id?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          order_index?: number | null
          target_reps?: string | null
          target_sets?: number | null
          target_weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_day_exercises_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "workout_program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          exercise_name: string
          id: string
          notes: string | null
          order_index: number | null
          reps: number | null
          session_id: string | null
          sets: number | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          exercise_name: string
          id?: string
          notes?: string | null
          order_index?: number | null
          reps?: number | null
          session_id?: string | null
          sets?: number | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          exercise_name?: string
          id?: string
          notes?: string | null
          order_index?: number | null
          reps?: number | null
          session_id?: string | null
          sets?: number | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_program_days: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          is_rest_day: boolean | null
          name: string | null
          order_index: number | null
          program_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          is_rest_day?: boolean | null
          name?: string | null
          order_index?: number | null
          program_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_rest_day?: boolean | null
          name?: string | null
          order_index?: number | null
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_programs: {
        Row: {
          coach_id: string | null
          created_at: string | null
          created_by_admin: boolean | null
          description: string | null
          id: string
          is_active: boolean | null
          is_coach_template: boolean
          is_public: boolean | null
          is_template: boolean | null
          name: string
          tribe_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          created_by_admin?: boolean | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_coach_template?: boolean
          is_public?: boolean | null
          is_template?: boolean | null
          name: string
          tribe_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          created_by_admin?: boolean | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_coach_template?: boolean
          is_public?: boolean | null
          is_template?: boolean | null
          name?: string
          tribe_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_programs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_programs_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string | null
          date: string
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          total_duration_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          total_duration_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          total_duration_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_templates: {
        Row: {
          category: string | null
          created_at: string | null
          creator_user_id: string | null
          days_per_week: number | null
          description: string | null
          difficulty: string | null
          id: string
          is_official: boolean | null
          name: string
          program_data: Json | null
          source_program_id: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          creator_user_id?: string | null
          days_per_week?: number | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_official?: boolean | null
          name: string
          program_data?: Json | null
          source_program_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          creator_user_id?: string | null
          days_per_week?: number | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_official?: boolean | null
          name?: string
          program_data?: Json | null
          source_program_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_templates_source_program_id_fkey"
            columns: ["source_program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_history: {
        Row: {
          created_at: string
          id: string
          reason: string
          user_id: string
          xp_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          user_id: string
          xp_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      coach_profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          is_verified: boolean | null
          referral_code: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          is_verified?: boolean | null
          referral_code?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          is_verified?: boolean | null
          referral_code?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      leaderboard_stats: {
        Row: {
          actions_completed: number | null
          avatar_emoji: string | null
          display_name: string | null
          last_activity: string | null
          pages_read: number | null
          principles_touched: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      archive_user_tasks: {
        Args: { target_task_types?: string[]; target_week_key: string }
        Returns: undefined
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      clear_user_task_history: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coach_referrals: {
        Args: { coach_id: string }
        Returns: undefined
      }
      is_tribe_member: {
        Args: { _tribe_id: string; _user_id: string }
        Returns: boolean
      }
      is_tribe_owner: {
        Args: { _tribe_id: string; _user_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "coach" | "trainer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "coach", "trainer"],
    },
  },
} as const
