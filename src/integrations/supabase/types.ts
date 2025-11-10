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
    PostgrestVersion: "13.0.5"
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
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          upload_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          upload_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          upload_date?: string | null
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
      stack_library: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stack_sessions: {
        Row: {
          answers: Json | null
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
          priority: number | null
          selected: boolean | null
          task_id: string
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
          priority?: number | null
          selected?: boolean | null
          task_id: string
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
          priority?: number | null
          selected?: boolean | null
          task_id?: string
          task_type?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          week_key?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
