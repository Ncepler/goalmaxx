export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      exam_dates: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'sat' | 'ap' | 'final'
          date: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'sat' | 'ap' | 'final'
          date: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'sat' | 'ap' | 'final'
          date?: string
          created_at?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          id: string
          minutes_spent: number | null
          read_at: string | null
          source: string | null
          takeaway: string | null
          title: string | null
          url: string
          user_id: string
        }
        Insert: {
          id?: string
          minutes_spent?: number | null
          read_at?: string | null
          source?: string | null
          takeaway?: string | null
          title?: string | null
          url: string
          user_id: string
        }
        Update: {
          id?: string
          minutes_spent?: number | null
          read_at?: string | null
          source?: string | null
          takeaway?: string | null
          title?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string | null
          current_page: number | null
          finished_at: string | null
          id: string
          notes_md: string | null
          started_at: string | null
          title: string
          total_pages: number | null
          user_id: string
        }
        Insert: {
          author?: string | null
          current_page?: number | null
          finished_at?: string | null
          id?: string
          notes_md?: string | null
          started_at?: string | null
          title: string
          total_pages?: number | null
          user_id: string
        }
        Update: {
          author?: string | null
          current_page?: number | null
          finished_at?: string | null
          id?: string
          notes_md?: string | null
          started_at?: string | null
          title?: string
          total_pages?: number | null
          user_id?: string
        }
        Relationships: []
      }
      brand_accounts: {
        Row: {
          display_name: string | null
          handle: string
          id: string
          platform: string
          user_id: string
        }
        Insert: {
          display_name?: string | null
          handle: string
          id?: string
          platform: string
          user_id: string
        }
        Update: {
          display_name?: string | null
          handle?: string
          id?: string
          platform?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_snapshots: {
        Row: {
          account_id: string
          date: string
          engagement: number | null
          followers: number | null
          id: string
          user_id: string
          views_total: number | null
        }
        Insert: {
          account_id: string
          date: string
          engagement?: number | null
          followers?: number | null
          id?: string
          user_id: string
          views_total?: number | null
        }
        Update: {
          account_id?: string
          date?: string
          engagement?: number | null
          followers?: number | null
          id?: string
          user_id?: string
          views_total?: number | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string | null
          id: string
          muscle_group: string | null
          name: string
          rep_range_high: number | null
          rep_range_low: number | null
          user_id: string
          weight_increment_kg: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          muscle_group?: string | null
          name: string
          rep_range_high?: number | null
          rep_range_low?: number | null
          user_id: string
          weight_increment_kg?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          muscle_group?: string | null
          name?: string
          rep_range_high?: number | null
          rep_range_low?: number | null
          user_id?: string
          weight_increment_kg?: number | null
        }
        Relationships: []
      }
      favorite_teams: {
        Row: {
          display_name: string
          espn_team_id: string
          id: string
          league: string
          sort_order: number | null
          user_id: string
        }
        Insert: {
          display_name: string
          espn_team_id: string
          id?: string
          league: string
          sort_order?: number | null
          user_id: string
        }
        Update: {
          display_name?: string
          espn_team_id?: string
          id?: string
          league?: string
          sort_order?: number | null
          user_id?: string
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          broken: boolean | null
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string
          unlock_conditions: Json | null
          user_id: string
        }
        Insert: {
          broken?: boolean | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at: string
          unlock_conditions?: Json | null
          user_id: string
        }
        Update: {
          broken?: boolean | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          unlock_conditions?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          description: string
          id: string
          logged_at: string | null
          meal_type: string | null
          photo_url: string | null
          user_id: string
        }
        Insert: {
          description: string
          id?: string
          logged_at?: string | null
          meal_type?: string | null
          photo_url?: string | null
          user_id: string
        }
        Update: {
          description?: string
          id?: string
          logged_at?: string | null
          meal_type?: string | null
          photo_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      github_cache: {
        Row: {
          cache_key: string
          expires_at: string
          payload: Json
        }
        Insert: {
          cache_key: string
          expires_at: string
          payload: Json
        }
        Update: {
          cache_key?: string
          expires_at?: string
          payload?: Json
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          date: string
          habit_id: string
          id: string
          met: boolean
          user_id: string
        }
        Insert: {
          date: string
          habit_id: string
          id?: string
          met: boolean
          user_id: string
        }
        Update: {
          date?: string
          habit_id?: string
          id?: string
          met?: boolean
          user_id?: string
        }
        Relationships: []
      }
      habits: {
        Row: {
          active: boolean | null
          id: string
          name: string
          rule: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          id?: string
          name: string
          rule: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          id?: string
          name?: string
          rule?: string
          user_id?: string
        }
        Relationships: []
      }
      health_data: {
        Row: {
          date: string
          raw_payload: Json | null
          screen_time_minutes: number | null
          sleep_minutes: number | null
          social_minutes: number | null
          steps: number | null
          user_id: string
        }
        Insert: {
          date: string
          raw_payload?: Json | null
          screen_time_minutes?: number | null
          sleep_minutes?: number | null
          social_minutes?: number | null
          steps?: number | null
          user_id: string
        }
        Update: {
          date?: string
          raw_payload?: Json | null
          screen_time_minutes?: number | null
          sleep_minutes?: number | null
          social_minutes?: number | null
          steps?: number | null
          user_id?: string
        }
        Relationships: []
      }
      hydration_logs: {
        Row: {
          date: string
          id: string
          logged_at: string | null
          ml: number
          source: string
          user_id: string
        }
        Insert: {
          date: string
          id?: string
          logged_at?: string | null
          ml: number
          source: string
          user_id: string
        }
        Update: {
          date?: string
          id?: string
          logged_at?: string | null
          ml?: number
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      incoming_orders: {
        Row: {
          amount: number
          currency: string | null
          expected_date: string | null
          id: string
          notes: string | null
          received_at: string | null
          source: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          currency?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          received_at?: string | null
          source: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          received_at?: string | null
          source?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medication_logs: {
        Row: {
          id: string
          medication_id: string
          scheduled_for: string
          status: string
          taken_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          medication_id: string
          scheduled_for: string
          status: string
          taken_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          medication_id?: string
          scheduled_for?: string
          status?: string
          taken_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          active: boolean | null
          created_at: string | null
          dose: string | null
          id: string
          name: string
          notes: string | null
          schedule_times: string[]
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          dose?: string | null
          id?: string
          name: string
          notes?: string | null
          schedule_times: string[]
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          dose?: string | null
          id?: string
          name?: string
          notes?: string | null
          schedule_times?: string[]
          user_id?: string
        }
        Relationships: []
      }
      my_games: {
        Row: {
          id: string
          location: string | null
          notes: string | null
          opponent: string | null
          result: string | null
          scheduled_for: string
          sport: string
          stats: Json | null
          user_id: string
        }
        Insert: {
          id?: string
          location?: string | null
          notes?: string | null
          opponent?: string | null
          result?: string | null
          scheduled_for: string
          sport: string
          stats?: Json | null
          user_id: string
        }
        Update: {
          id?: string
          location?: string | null
          notes?: string | null
          opponent?: string | null
          result?: string | null
          scheduled_for?: string
          sport?: string
          stats?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      overseer_messages: {
        Row: {
          context_snapshot: Json | null
          created_at: string | null
          id: string
          message: string
          responded_at: string | null
          response: string | null
          user_id: string
        }
        Insert: {
          context_snapshot?: Json | null
          created_at?: string | null
          id?: string
          message: string
          responded_at?: string | null
          response?: string | null
          user_id: string
        }
        Update: {
          context_snapshot?: Json | null
          created_at?: string | null
          id?: string
          message?: string
          responded_at?: string | null
          response?: string | null
          user_id?: string
        }
        Relationships: []
      }
      piano_songs: {
        Row: {
          added_at: string | null
          artist: string | null
          id: string
          is_current: boolean | null
          learned_at: string | null
          status: string | null
          tiktok_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          artist?: string | null
          id?: string
          is_current?: boolean | null
          learned_at?: string | null
          status?: string | null
          tiktok_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          artist?: string | null
          id?: string
          is_current?: boolean | null
          learned_at?: string | null
          status?: string | null
          tiktok_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          anthropic_api_key: string | null
          bedtime_target: string | null
          bottle_size_ml: number | null
          created_at: string | null
          cup_size_ml: number | null
          display_name: string | null
          focus_target_minutes: number | null
          gatorade_size_ml: number | null
          id: string
          shortcut_token: string | null
          water_target_ml: number | null
        }
        Insert: {
          anthropic_api_key?: string | null
          bedtime_target?: string | null
          bottle_size_ml?: number | null
          created_at?: string | null
          cup_size_ml?: number | null
          display_name?: string | null
          focus_target_minutes?: number | null
          gatorade_size_ml?: number | null
          id: string
          shortcut_token?: string | null
          water_target_ml?: number | null
        }
        Update: {
          anthropic_api_key?: string | null
          bedtime_target?: string | null
          bottle_size_ml?: number | null
          created_at?: string | null
          cup_size_ml?: number | null
          display_name?: string | null
          focus_target_minutes?: number | null
          gatorade_size_ml?: number | null
          id?: string
          shortcut_token?: string | null
          water_target_ml?: number | null
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          project_id: string
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          project_id: string
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          project_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          github_repo: string | null
          id: string
          live_url: string | null
          name: string
          notes_md: string | null
          slug: string
          status: string | null
          tagline: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          github_repo?: string | null
          id?: string
          live_url?: string | null
          name: string
          notes_md?: string | null
          slug: string
          status?: string | null
          tagline?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          github_repo?: string | null
          id?: string
          live_url?: string | null
          name?: string
          notes_md?: string | null
          slug?: string
          status?: string | null
          tagline?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_sessions: {
        Row: {
          book_id: string | null
          date: string
          id: string
          minutes: number | null
          pages: number | null
          user_id: string
        }
        Insert: {
          book_id?: string | null
          date: string
          id?: string
          minutes?: number | null
          pages?: number | null
          user_id: string
        }
        Update: {
          book_id?: string | null
          date?: string
          id?: string
          minutes?: number | null
          pages?: number | null
          user_id?: string
        }
        Relationships: []
      }
      routine_plans: {
        Row: {
          bedtime: string
          created_at: string | null
          date: string
          generated_schedule: Json | null
          id: string
          items: Json
          user_id: string
        }
        Insert: {
          bedtime: string
          created_at?: string | null
          date: string
          generated_schedule?: Json | null
          id?: string
          items: Json
          user_id: string
        }
        Update: {
          bedtime?: string
          created_at?: string | null
          date?: string
          generated_schedule?: Json | null
          id?: string
          items?: Json
          user_id?: string
        }
        Relationships: []
      }
      sat_tests: {
        Row: {
          id: string
          is_practice: boolean | null
          math_score: number | null
          notes: string | null
          rw_score: number | null
          scheduled_for: string
          source_url: string | null
          taken_at: string | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          id?: string
          is_practice?: boolean | null
          math_score?: number | null
          notes?: string | null
          rw_score?: number | null
          scheduled_for: string
          source_url?: string | null
          taken_at?: string | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          id?: string
          is_practice?: boolean | null
          math_score?: number | null
          notes?: string | null
          rw_score?: number | null
          scheduled_for?: string
          source_url?: string | null
          taken_at?: string | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      school_assignments: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          fun: boolean | null
          id: string
          length: string | null
          notes: string | null
          subject_id: string
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          fun?: boolean | null
          id?: string
          length?: string | null
          notes?: string | null
          subject_id: string
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          fun?: boolean | null
          id?: string
          length?: string | null
          notes?: string | null
          subject_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      school_links: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          label: string
          sort_order: number | null
          subject_id: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          label: string
          sort_order?: number | null
          subject_id: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          label?: string
          sort_order?: number | null
          subject_id?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      school_subjects: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          kind: string
          name: string
          notes_md: string | null
          period: string | null
          slug: string
          sort_order: number | null
          teacher: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          kind: string
          name: string
          notes_md?: string | null
          period?: string | null
          slug: string
          sort_order?: number | null
          teacher?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          kind?: string
          name?: string
          notes_md?: string | null
          period?: string | null
          slug?: string
          sort_order?: number | null
          teacher?: string | null
          user_id?: string
        }
        Relationships: []
      }
      screen_time_logs: {
        Row: {
          created_at: string | null
          date: string
          id: string
          productive_minutes: number | null
          social_minutes: number | null
          source: string | null
          total_minutes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          productive_minutes?: number | null
          social_minutes?: number | null
          source?: string | null
          total_minutes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          productive_minutes?: number | null
          social_minutes?: number | null
          source?: string | null
          total_minutes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      sets: {
        Row: {
          exercise_id: string
          id: string
          logged_at: string | null
          reps: number
          rpe: number | null
          session_id: string
          set_order: number
          user_id: string
          weight_kg: number
        }
        Insert: {
          exercise_id: string
          id?: string
          logged_at?: string | null
          reps: number
          rpe?: number | null
          session_id: string
          set_order: number
          user_id: string
          weight_kg: number
        }
        Update: {
          exercise_id?: string
          id?: string
          logged_at?: string | null
          reps?: number
          rpe?: number | null
          session_id?: string
          set_order?: number
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          sleep_end: string | null
          sleep_start: string
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          sleep_end?: string | null
          sleep_start: string
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          sleep_end?: string | null
          sleep_start?: string
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sports_cache: {
        Row: {
          cache_key: string
          expires_at: string
          payload: Json
        }
        Insert: {
          cache_key: string
          expires_at: string
          payload: Json
        }
        Update: {
          cache_key?: string
          expires_at?: string
          payload?: Json
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cadence: string
          cost: number
          created_at: string | null
          currency: string | null
          id: string
          next_charge_date: string | null
          service: string
          user_id: string
        }
        Insert: {
          cadence: string
          cost: number
          created_at?: string | null
          currency?: string | null
          id?: string
          next_charge_date?: string | null
          service: string
          user_id: string
        }
        Update: {
          cadence?: string
          cost?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          next_charge_date?: string | null
          service?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          due_date: string
          est_minutes: number | null
          id: string
          notes: string | null
          priority: number | null
          rolled_from_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date: string
          est_minutes?: number | null
          id?: string
          notes?: string | null
          priority?: number | null
          rolled_from_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string
          est_minutes?: number | null
          id?: string
          notes?: string | null
          priority?: number | null
          rolled_from_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_costs: {
        Row: {
          cost_usd: number
          created_at: string | null
          feature: string
          id: string
          input_tokens: number
          model: string
          output_tokens: number
          user_id: string
        }
        Insert: {
          cost_usd: number
          created_at?: string | null
          feature: string
          id?: string
          input_tokens: number
          model: string
          output_tokens: number
          user_id: string
        }
        Update: {
          cost_usd?: number
          created_at?: string | null
          feature?: string
          id?: string
          input_tokens?: number
          model?: string
          output_tokens?: number
          user_id?: string
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          created_at: string | null
          didnt_work_md: string | null
          id: string
          metrics_snapshot: Json | null
          next_week_focus_md: string | null
          user_id: string
          week_start: string
          worked_md: string | null
        }
        Insert: {
          created_at?: string | null
          didnt_work_md?: string | null
          id?: string
          metrics_snapshot?: Json | null
          next_week_focus_md?: string | null
          user_id: string
          week_start: string
          worked_md?: string | null
        }
        Update: {
          created_at?: string | null
          didnt_work_md?: string | null
          id?: string
          metrics_snapshot?: Json | null
          next_week_focus_md?: string | null
          user_id?: string
          week_start?: string
          worked_md?: string | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type HydrationLog = Database['public']['Tables']['hydration_logs']['Row']
export type SleepLog = Database['public']['Tables']['sleep_logs']['Row']
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row']
export type FocusSession = Database['public']['Tables']['focus_sessions']['Row']
export type SchoolSubject = Database['public']['Tables']['school_subjects']['Row']
export type SchoolLink = Database['public']['Tables']['school_links']['Row']
export type SchoolAssignment = Database['public']['Tables']['school_assignments']['Row']
