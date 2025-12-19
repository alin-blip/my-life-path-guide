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
      course_modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          order_index: number
          pdf_url: string | null
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
          order_index: number
          pdf_url?: string | null
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
          order_index?: number
          pdf_url?: string | null
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
          period: string | null
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
          period?: string | null
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
          period?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
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
