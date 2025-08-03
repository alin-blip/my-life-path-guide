export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      affiliate_referrals: {
        Row: {
          commission_percentage: number | null
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          commission_percentage?: number | null
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          commission_percentage?: number | null
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      ai_live_coaching_sessions: {
        Row: {
          answer: string | null
          answers: Json | null
          created_at: string
          id: string
          question: string
          session_id: string
          step_number: number
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          answers?: Json | null
          created_at?: string
          id?: string
          question: string
          session_id: string
          step_number: number
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          answers?: Json | null
          created_at?: string
          id?: string
          question?: string
          session_id?: string
          step_number?: number
          user_id?: string | null
        }
        Relationships: []
      }
      anger_stack_sessions: {
        Row: {
          answer: string | null
          answers: Json | null
          created_at: string
          id: string
          question: string
          session_id: string
          step_number: number
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          answers?: Json | null
          created_at?: string
          id?: string
          question: string
          session_id: string
          step_number: number
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          answers?: Json | null
          created_at?: string
          id?: string
          question?: string
          session_id?: string
          step_number?: number
          user_id?: string | null
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_completed: boolean | null
          order_index: number
          pdf_url: string | null
          text_content: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_completed?: boolean | null
          order_index: number
          pdf_url?: string | null
          text_content?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_completed?: boolean | null
          order_index?: number
          pdf_url?: string | null
          text_content?: string | null
          title?: string
          updated_at?: string
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
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_completed: boolean | null
          module_id: string | null
          order_index: number
          pdf_url: string | null
          text_content: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_completed?: boolean | null
          module_id?: string | null
          order_index: number
          pdf_url?: string | null
          text_content?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_completed?: boolean | null
          module_id?: string | null
          order_index?: number
          pdf_url?: string | null
          text_content?: string | null
          title?: string
          updated_at?: string
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
          access_level: string
          author: string | null
          category: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          image: string | null
          is_locked: boolean | null
          is_premium: boolean | null
          price: number | null
          status: string | null
          subcategory: string
          title: string
          type: string
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          access_level?: string
          author?: string | null
          category: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image?: string | null
          is_locked?: boolean | null
          is_premium?: boolean | null
          price?: number | null
          status?: string | null
          subcategory: string
          title: string
          type?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          access_level?: string
          author?: string | null
          category?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          image?: string | null
          is_locked?: boolean | null
          is_premium?: boolean | null
          price?: number | null
          status?: string | null
          subcategory?: string
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      divine_coaching_sessions: {
        Row: {
          answer: string | null
          answers: Json | null
          created_at: string
          id: string
          is_system_response: boolean | null
          question: string
          session_id: string
          step_number: number
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          answers?: Json | null
          created_at?: string
          id?: string
          is_system_response?: boolean | null
          question: string
          session_id: string
          step_number: number
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          answers?: Json | null
          created_at?: string
          id?: string
          is_system_response?: boolean | null
          question?: string
          session_id?: string
          step_number?: number
          user_id?: string | null
        }
        Relationships: []
      }
      fact_maps: {
        Row: {
          category: string
          created_at: string
          id: string
          items: Json
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          items?: Json
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          items?: Json
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      game_journey_maps: {
        Row: {
          annual_goal: string | null
          category: string
          created_at: string | null
          current_reality: string | null
          id: string
          monthly_goal: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          annual_goal?: string | null
          category: string
          created_at?: string | null
          current_reality?: string | null
          id?: string
          monthly_goal?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          annual_goal?: string | null
          category?: string
          created_at?: string | null
          current_reality?: string | null
          id?: string
          monthly_goal?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          date: string
          id: string
          lesson: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          date?: string
          id?: string
          lesson?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          id?: string
          lesson?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      monthly_missions: {
        Row: {
          category: string
          created_at: string
          end_date: string
          id: string
          is_impossible_game: boolean | null
          name: string
          parts: Json | null
          questions: Json | null
          result: Json | null
          start_date: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          end_date: string
          id?: string
          is_impossible_game?: boolean | null
          name: string
          parts?: Json | null
          questions?: Json | null
          result?: Json | null
          start_date: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          end_date?: string
          id?: string
          is_impossible_game?: boolean | null
          name?: string
          parts?: Json | null
          questions?: Json | null
          result?: Json | null
          start_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      monthly_planning: {
        Row: {
          created_at: string
          focus_areas: Json | null
          goals: Json | null
          id: number
          key_metrics: Json | null
          month_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          focus_areas?: Json | null
          goals?: Json | null
          id?: number
          key_metrics?: Json | null
          month_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          focus_areas?: Json | null
          goals?: Json | null
          id?: number
          key_metrics?: Json | null
          month_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      power_stack_sessions: {
        Row: {
          answer: string | null
          answers: Json | null
          created_at: string
          id: string
          question: string
          session_id: string
          step_number: number
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          answers?: Json | null
          created_at?: string
          id?: string
          question: string
          session_id: string
          step_number: number
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          answers?: Json | null
          created_at?: string
          id?: string
          question?: string
          session_id?: string
          step_number?: number
          user_id?: string | null
        }
        Relationships: []
      }
      quarterly_strategy: {
        Row: {
          created_at: string
          id: number
          key_results: Json | null
          quarter_end: string
          quarter_start: string
          resource_allocation: Json | null
          strategic_objectives: Json | null
          updated_at: string
          user_id: string
          vision_statement: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          key_results?: Json | null
          quarter_end: string
          quarter_start: string
          resource_allocation?: Json | null
          strategic_objectives?: Json | null
          updated_at?: string
          user_id: string
          vision_statement?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          key_results?: Json | null
          quarter_end?: string
          quarter_start?: string
          resource_allocation?: Json | null
          strategic_objectives?: Json | null
          updated_at?: string
          user_id?: string
          vision_statement?: string | null
        }
        Relationships: []
      }
      quote_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          quote_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          quote_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          quote_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_interactions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_ratings: {
        Row: {
          created_at: string | null
          id: string
          quote_id: string | null
          rating: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          quote_id?: string | null
          rating: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          quote_id?: string | null
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_ratings_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_reflections: {
        Row: {
          created_at: string | null
          id: string
          quote_id: string | null
          reflection: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          quote_id?: string | null
          reflection: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          quote_id?: string | null
          reflection?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_reflections_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          author: string
          background_options: string[]
          category: string
          created_at: string | null
          difficulty: string
          id: string
          language: string
          tags: string[]
          text: string
          updated_at: string | null
        }
        Insert: {
          author: string
          background_options?: string[]
          category: string
          created_at?: string | null
          difficulty: string
          id?: string
          language?: string
          tags?: string[]
          text: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          background_options?: string[]
          category?: string
          created_at?: string | null
          difficulty?: string
          id?: string
          language?: string
          tags?: string[]
          text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stack_library: {
        Row: {
          color: string
          content: Json | null
          created_at: string
          id: string
          questions: Json | null
          share_id: string | null
          shared: boolean | null
          trigger: string
          trigger_label: string
          user_id: string | null
        }
        Insert: {
          color: string
          content?: Json | null
          created_at?: string
          id?: string
          questions?: Json | null
          share_id?: string | null
          shared?: boolean | null
          trigger: string
          trigger_label: string
          user_id?: string | null
        }
        Update: {
          color?: string
          content?: Json | null
          created_at?: string
          id?: string
          questions?: Json | null
          share_id?: string | null
          shared?: boolean | null
          trigger?: string
          trigger_label?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string | null
          daily_score: number | null
          date: string
          id: string
          journal_completed: boolean | null
          stack_completed: boolean | null
          user_id: string | null
          week_number: number
          year: number
        }
        Insert: {
          created_at?: string | null
          daily_score?: number | null
          date?: string
          id?: string
          journal_completed?: boolean | null
          stack_completed?: boolean | null
          user_id?: string | null
          week_number: number
          year: number
        }
        Update: {
          created_at?: string | null
          daily_score?: number | null
          date?: string
          id?: string
          journal_completed?: boolean | null
          stack_completed?: boolean | null
          user_id?: string | null
          week_number?: number
          year?: number
        }
        Relationships: []
      }
      user_quote_preferences: {
        Row: {
          created_at: string | null
          excluded_authors: string[]
          id: string
          preferred_categories: string[]
          preferred_difficulty: string | null
          preferred_language: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          excluded_authors?: string[]
          id?: string
          preferred_categories?: string[]
          preferred_difficulty?: string | null
          preferred_language?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          excluded_authors?: string[]
          id?: string
          preferred_categories?: string[]
          preferred_difficulty?: string | null
          preferred_language?: string
          updated_at?: string | null
          user_id?: string | null
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
          id: string
          total_daily_points: number | null
          total_journals: number | null
          total_stacks: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          total_daily_points?: number | null
          total_journals?: number | null
          total_stacks?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          total_daily_points?: number | null
          total_journals?: number | null
          total_stacks?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weekly_actions: {
        Row: {
          completed: boolean | null
          created_at: string
          description: string
          due_date: string | null
          id: number
          updated_at: string
          user_id: string
          weekly_review_id: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: number
          updated_at?: string
          user_id: string
          weekly_review_id?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: number
          updated_at?: string
          user_id?: string
          weekly_review_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_actions_weekly_review_id_fkey"
            columns: ["weekly_review_id"]
            isOneToOne: false
            referencedRelation: "weekly_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reviews: {
        Row: {
          actions_for_next_week: Json | null
          core4_completion: number
          created_at: string
          id: number
          updated_at: string
          user_id: string
          week_end: string
          week_start: string
          weekly_score: number
          weekly_score_total: number
        }
        Insert: {
          actions_for_next_week?: Json | null
          core4_completion: number
          created_at?: string
          id?: number
          updated_at?: string
          user_id: string
          week_end: string
          week_start: string
          weekly_score: number
          weekly_score_total: number
        }
        Update: {
          actions_for_next_week?: Json | null
          core4_completion?: number
          created_at?: string
          id?: number
          updated_at?: string
          user_id?: string
          week_end?: string
          week_start?: string
          weekly_score?: number
          weekly_score_total?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_users: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_profile: {
        Args: { user_id: number }
        Returns: {
          id: number
          username: string
          email: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      process_referral: {
        Args: { referrer_code: string; user_id: string }
        Returns: undefined
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
