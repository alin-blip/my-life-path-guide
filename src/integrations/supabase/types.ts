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
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          created_at: string | null
          error_message: string
          id: string
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          component_name?: string | null
          created_at?: string | null
          error_message: string
          id?: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          component_name?: string | null
          created_at?: string | null
          error_message?: string
          id?: string
          stack_trace?: string | null
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
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dashboard_widgets?: Json | null
          id?: string
          language?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dashboard_widgets?: Json | null
          id?: string
          language?: string | null
          updated_at?: string | null
          user_id?: string
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
          id: string
          is_key_point: boolean | null
          list_type: string
          position: number | null
          priority: number | null
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
          id?: string
          is_key_point?: boolean | null
          list_type: string
          position?: number | null
          priority?: number | null
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
          id?: string
          is_key_point?: boolean | null
          list_type?: string
          position?: number | null
          priority?: number | null
          selected?: boolean | null
          task_id?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          week_key?: string | null
        }
        Relationships: []
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
          created_at: string | null
          created_by_admin: boolean | null
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          is_template: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by_admin?: boolean | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          is_template?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by_admin?: boolean | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          is_template?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      clear_user_task_history: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
