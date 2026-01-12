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
      ai_message_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          estimated_cost_usd: number | null
          id: string
          is_byok: boolean | null
          model: string
          provider: string
          response_time_ms: number | null
          success: boolean | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          estimated_cost_usd?: number | null
          id?: string
          is_byok?: boolean | null
          model: string
          provider: string
          response_time_ms?: number | null
          success?: boolean | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          estimated_cost_usd?: number | null
          id?: string
          is_byok?: boolean | null
          model?: string
          provider?: string
          response_time_ms?: number | null
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_recommendations: {
        Row: {
          acted_on: boolean | null
          action_type: string | null
          action_url: string | null
          aspect: string
          content: string
          created_at: string | null
          dismissed: boolean | null
          expires_at: string | null
          id: string
          priority: string | null
          source: string | null
          title: string
          trend_context: string | null
          user_id: string
        }
        Insert: {
          acted_on?: boolean | null
          action_type?: string | null
          action_url?: string | null
          aspect: string
          content: string
          created_at?: string | null
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          source?: string | null
          title: string
          trend_context?: string | null
          user_id: string
        }
        Update: {
          acted_on?: boolean | null
          action_type?: string | null
          action_url?: string | null
          aspect?: string
          content?: string
          created_at?: string | null
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          source?: string | null
          title?: string
          trend_context?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_tracking: {
        Row: {
          created_at: string | null
          id: string
          last_reset_at: string | null
          messages_limit: number | null
          messages_used: number
          period_end: string
          period_start: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_reset_at?: string | null
          messages_limit?: number | null
          messages_used?: number
          period_end?: string
          period_start?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_reset_at?: string | null
          messages_limit?: number | null
          messages_used?: number
          period_end?: string
          period_start?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      aspect_apps: {
        Row: {
          category: string
          color: string
          created_at: string | null
          description: string | null
          gradient: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          requires_oauth: string[] | null
          slug: string
        }
        Insert: {
          category: string
          color: string
          created_at?: string | null
          description?: string | null
          gradient: string
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          requires_oauth?: string[] | null
          slug: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string | null
          description?: string | null
          gradient?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          requires_oauth?: string[] | null
          slug?: string
        }
        Relationships: []
      }
      bucket_list: {
        Row: {
          country: string | null
          created_at: string | null
          destination: string
          emoji: string | null
          id: string
          notes: string | null
          priority: string | null
          reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          destination: string
          emoji?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string | null
          destination?: string
          emoji?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      business_projects: {
        Row: {
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          name: string
          priority: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          priority?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          priority?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_analytics: {
        Row: {
          average_daily_events: number | null
          busiest_day_of_week: number | null
          completed_tasks: number | null
          created_at: string | null
          date_recorded: string
          goal_completion_rate: number | null
          id: string
          most_productive_aspect: string | null
          time_blocked_hours: number | null
          total_events: number | null
          total_tasks: number | null
          user_id: string | null
        }
        Insert: {
          average_daily_events?: number | null
          busiest_day_of_week?: number | null
          completed_tasks?: number | null
          created_at?: string | null
          date_recorded: string
          goal_completion_rate?: number | null
          id?: string
          most_productive_aspect?: string | null
          time_blocked_hours?: number | null
          total_events?: number | null
          total_tasks?: number | null
          user_id?: string | null
        }
        Update: {
          average_daily_events?: number | null
          busiest_day_of_week?: number | null
          completed_tasks?: number | null
          created_at?: string | null
          date_recorded?: string
          goal_completion_rate?: number | null
          id?: string
          most_productive_aspect?: string | null
          time_blocked_hours?: number | null
          total_events?: number | null
          total_tasks?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          actual_duration_minutes: number | null
          all_day: boolean | null
          aspect: string
          aspect_id: string | null
          attendees: string[] | null
          calendar_group_id: string | null
          color_override: string | null
          completed_at: string | null
          created_at: string | null
          daily_task_id: string | null
          description: string | null
          end_date: string | null
          estimated_duration_minutes: number | null
          id: string
          is_recurring: boolean | null
          location: string | null
          monthly_objective_id: string | null
          parent_event_id: string | null
          priority: string
          recurrence_exception_dates: string[] | null
          recurrence_rule: string | null
          recurring_pattern_id: string | null
          reminder_minutes_before: number[] | null
          start_date: string
          status: string
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
          virtual_meeting_url: string | null
          weekly_objective_id: string | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          all_day?: boolean | null
          aspect: string
          aspect_id?: string | null
          attendees?: string[] | null
          calendar_group_id?: string | null
          color_override?: string | null
          completed_at?: string | null
          created_at?: string | null
          daily_task_id?: string | null
          description?: string | null
          end_date?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          monthly_objective_id?: string | null
          parent_event_id?: string | null
          priority?: string
          recurrence_exception_dates?: string[] | null
          recurrence_rule?: string | null
          recurring_pattern_id?: string | null
          reminder_minutes_before?: number[] | null
          start_date: string
          status?: string
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
          virtual_meeting_url?: string | null
          weekly_objective_id?: string | null
        }
        Update: {
          actual_duration_minutes?: number | null
          all_day?: boolean | null
          aspect?: string
          aspect_id?: string | null
          attendees?: string[] | null
          calendar_group_id?: string | null
          color_override?: string | null
          completed_at?: string | null
          created_at?: string | null
          daily_task_id?: string | null
          description?: string | null
          end_date?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          monthly_objective_id?: string | null
          parent_event_id?: string | null
          priority?: string
          recurrence_exception_dates?: string[] | null
          recurrence_rule?: string | null
          recurring_pattern_id?: string | null
          reminder_minutes_before?: number[] | null
          start_date?: string
          status?: string
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          virtual_meeting_url?: string | null
          weekly_objective_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_aspect_id_fkey"
            columns: ["aspect_id"]
            isOneToOne: false
            referencedRelation: "life_aspects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_calendar_group_id_fkey"
            columns: ["calendar_group_id"]
            isOneToOne: false
            referencedRelation: "calendar_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_daily_task_id_fkey"
            columns: ["daily_task_id"]
            isOneToOne: false
            referencedRelation: "daily_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_monthly_objective_id_fkey"
            columns: ["monthly_objective_id"]
            isOneToOne: false
            referencedRelation: "monthly_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_recurring_pattern_id_fkey"
            columns: ["recurring_pattern_id"]
            isOneToOne: false
            referencedRelation: "recurring_patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_weekly_objective_id_fkey"
            columns: ["weekly_objective_id"]
            isOneToOne: false
            referencedRelation: "weekly_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_exports: {
        Row: {
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          expires_at: string
          export_type: string
          export_url: string | null
          id: string
          include_private_events: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          expires_at: string
          export_type: string
          export_url?: string | null
          id?: string
          include_private_events?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          expires_at?: string
          export_type?: string
          export_url?: string | null
          id?: string
          include_private_events?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_group_members: {
        Row: {
          group_id: string | null
          id: string
          joined_at: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "calendar_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      calendar_insights: {
        Row: {
          actionable: boolean | null
          created_at: string | null
          description: string
          dismissed: boolean | null
          expires_at: string | null
          id: string
          insight_type: string
          priority: string | null
          related_aspects: string[] | null
          suggested_actions: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          actionable?: boolean | null
          created_at?: string | null
          description: string
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          insight_type: string
          priority?: string | null
          related_aspects?: string[] | null
          suggested_actions?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          actionable?: boolean | null
          created_at?: string | null
          description?: string
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          priority?: string | null
          related_aspects?: string[] | null
          suggested_actions?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_preferences: {
        Row: {
          auto_expand_recurring: boolean | null
          calendar_theme: string | null
          created_at: string | null
          default_view: string | null
          id: string
          show_completed_tasks: boolean | null
          show_weekends: boolean | null
          time_format: string | null
          timezone: string | null
          user_id: string
          week_starts_on: number | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          auto_expand_recurring?: boolean | null
          calendar_theme?: string | null
          created_at?: string | null
          default_view?: string | null
          id?: string
          show_completed_tasks?: boolean | null
          show_weekends?: boolean | null
          time_format?: string | null
          timezone?: string | null
          user_id: string
          week_starts_on?: number | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          auto_expand_recurring?: boolean | null
          calendar_theme?: string | null
          created_at?: string | null
          default_view?: string | null
          id?: string
          show_completed_tasks?: boolean | null
          show_weekends?: boolean | null
          time_format?: string | null
          timezone?: string | null
          user_id?: string
          week_starts_on?: number | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: []
      }
      calendar_quick_actions: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          last_used_at: string | null
          name: string
          shortcut_key: string | null
          template: Json | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          shortcut_key?: string | null
          template?: Json | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          shortcut_key?: string | null
          template?: Json | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_shares: {
        Row: {
          calendar_owner_id: string | null
          id: string
          permission_level: string
          shared_at: string | null
          shared_with_user_id: string | null
        }
        Insert: {
          calendar_owner_id?: string | null
          id?: string
          permission_level: string
          shared_at?: string | null
          shared_with_user_id?: string | null
        }
        Update: {
          calendar_owner_id?: string | null
          id?: string
          permission_level?: string
          shared_at?: string | null
          shared_with_user_id?: string | null
        }
        Relationships: []
      }
      calendar_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
        }
        Relationships: []
      }
      calendar_views: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          is_default: boolean | null
          name: string
          user_id: string | null
          view_type: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          name: string
          user_id?: string | null
          view_type: string
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          name?: string
          user_id?: string | null
          view_type?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          aspect: string | null
          created_at: string | null
          id: string
          messages: Json | null
          user_id: string
        }
        Insert: {
          aspect?: string | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          user_id: string
        }
        Update: {
          aspect?: string | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      custom_foods: {
        Row: {
          barcode: string | null
          brand: string | null
          calories: number | null
          carbs: number | null
          created_at: string | null
          fat: number | null
          fiber: number | null
          id: string
          is_favorite: boolean | null
          name: string
          protein: number | null
          serving_size: string
          sodium: number | null
          sugar: number | null
          times_used: number | null
          user_id: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          is_favorite?: boolean | null
          name: string
          protein?: number | null
          serving_size: string
          sodium?: number | null
          sugar?: number | null
          times_used?: number | null
          user_id: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          protein?: number | null
          serving_size?: string
          sodium?: number | null
          sugar?: number | null
          times_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          actual_duration_minutes: number | null
          aspect_id: string
          completed_at: string | null
          created_at: string | null
          dependencies: string[] | null
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          priority: string | null
          review_date: string | null
          review_notes: string | null
          status: string | null
          target_date: string
          template_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
          weekly_objective_id: string | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          aspect_id: string
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          priority?: string | null
          review_date?: string | null
          review_notes?: string | null
          status?: string | null
          target_date: string
          template_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
          weekly_objective_id?: string | null
        }
        Update: {
          actual_duration_minutes?: number | null
          aspect_id?: string
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          priority?: string | null
          review_date?: string | null
          review_notes?: string | null
          status?: string | null
          target_date?: string
          template_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          weekly_objective_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_aspect_id_fkey"
            columns: ["aspect_id"]
            isOneToOne: false
            referencedRelation: "life_aspects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "objective_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_tasks_weekly_objective_id_fkey"
            columns: ["weekly_objective_id"]
            isOneToOne: false
            referencedRelation: "weekly_objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          birthday: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          relationship: string
          user_id: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          relationship: string
          user_id: string
        }
        Update: {
          birthday?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          relationship?: string
          user_id?: string
        }
        Relationships: []
      }
      finances: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          currency: string | null
          date: string | null
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          currency?: string | null
          date?: string | null
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          currency?: string | null
          date?: string | null
          description?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      food_analysis_logs: {
        Row: {
          ai_response: Json
          confidence: number | null
          corrected_data: Json | null
          created_at: string | null
          id: string
          image_url: string | null
          input_data: string | null
          input_type: string
          processing_time_ms: number | null
          user_corrected: boolean | null
          user_id: string
        }
        Insert: {
          ai_response: Json
          confidence?: number | null
          corrected_data?: Json | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          input_data?: string | null
          input_type: string
          processing_time_ms?: number | null
          user_corrected?: boolean | null
          user_id: string
        }
        Update: {
          ai_response?: Json
          confidence?: number | null
          corrected_data?: Json | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          input_data?: string | null
          input_type?: string
          processing_time_ms?: number | null
          user_corrected?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string | null
          how_met: string | null
          id: string
          last_contact: string | null
          name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          how_met?: string | null
          id?: string
          last_contact?: string | null
          name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          how_met?: string | null
          id?: string
          last_contact?: string | null
          name?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          friend_id: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          friend_id: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      insight_agent_settings: {
        Row: {
          analyze_frequency_days: number | null
          auto_analyze: boolean | null
          created_at: string | null
          enabled_platforms: string[] | null
          has_claude_code: boolean | null
          last_prompted: string | null
          privacy_level: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analyze_frequency_days?: number | null
          auto_analyze?: boolean | null
          created_at?: string | null
          enabled_platforms?: string[] | null
          has_claude_code?: boolean | null
          last_prompted?: string | null
          privacy_level?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analyze_frequency_days?: number | null
          auto_analyze?: boolean | null
          created_at?: string | null
          enabled_platforms?: string[] | null
          has_claude_code?: boolean | null
          last_prompted?: string | null
          privacy_level?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      insight_analyses: {
        Row: {
          analyzed_at: string | null
          duration_seconds: number | null
          error: string | null
          id: string
          insights_count: number | null
          logged_in: boolean
          platform: string
          user_id: string
        }
        Insert: {
          analyzed_at?: string | null
          duration_seconds?: number | null
          error?: string | null
          id?: string
          insights_count?: number | null
          logged_in?: boolean
          platform: string
          user_id: string
        }
        Update: {
          analyzed_at?: string | null
          duration_seconds?: number | null
          error?: string | null
          id?: string
          insights_count?: number | null
          logged_in?: boolean
          platform?: string
          user_id?: string
        }
        Relationships: []
      }
      life_aspects: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order: number
          icon?: string | null
          id: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      list_shares: {
        Row: {
          id: string
          list_id: string
          message: string | null
          shared_at: string | null
          shared_with_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          list_id: string
          message?: string | null
          shared_at?: string | null
          shared_with_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          list_id?: string
          message?: string | null
          shared_at?: string | null
          shared_with_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_shares_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shared_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_items: {
        Row: {
          ai_analyzed: boolean | null
          barcode: string | null
          calories: number | null
          carbs: number | null
          created_at: string | null
          fat: number | null
          fiber: number | null
          id: string
          image_url: string | null
          meal_id: string
          name: string
          protein: number | null
          quantity: number | null
          sodium: number | null
          sugar: number | null
          unit: string | null
        }
        Insert: {
          ai_analyzed?: boolean | null
          barcode?: string | null
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          image_url?: string | null
          meal_id: string
          name: string
          protein?: number | null
          quantity?: number | null
          sodium?: number | null
          sugar?: number | null
          unit?: string | null
        }
        Update: {
          ai_analyzed?: boolean | null
          barcode?: string | null
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          image_url?: string | null
          meal_id?: string
          name?: string
          protein?: number | null
          quantity?: number | null
          sodium?: number | null
          sugar?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          ai_analyzed: boolean | null
          ai_confidence: number | null
          calories: number | null
          carbs: number | null
          created_at: string | null
          fat: number | null
          fiber: number | null
          id: string
          image_url: string | null
          ingredients: Json | null
          logged_at: string | null
          name: string
          notes: string | null
          protein: number | null
          serving_size: string | null
          sodium: number | null
          source: string | null
          sugar: number | null
          type: string | null
          user_id: string
        }
        Insert: {
          ai_analyzed?: boolean | null
          ai_confidence?: number | null
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          logged_at?: string | null
          name: string
          notes?: string | null
          protein?: number | null
          serving_size?: string | null
          sodium?: number | null
          source?: string | null
          sugar?: number | null
          type?: string | null
          user_id: string
        }
        Update: {
          ai_analyzed?: boolean | null
          ai_confidence?: number | null
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          logged_at?: string | null
          name?: string
          notes?: string | null
          protein?: number | null
          serving_size?: string | null
          sodium?: number | null
          source?: string | null
          sugar?: number | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      monthly_objectives: {
        Row: {
          aspect_id: string
          completed_at: string | null
          created_at: string | null
          dependencies: string[] | null
          description: string | null
          estimated_duration_days: number | null
          id: string
          priority: string | null
          progress_percentage: number | null
          review_date: string | null
          review_notes: string | null
          status: string | null
          success_criteria: string[] | null
          target_month: string
          template_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aspect_id: string
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          priority?: string | null
          progress_percentage?: number | null
          review_date?: string | null
          review_notes?: string | null
          status?: string | null
          success_criteria?: string[] | null
          target_month: string
          template_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aspect_id?: string
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          priority?: string | null
          progress_percentage?: number | null
          review_date?: string | null
          review_notes?: string | null
          status?: string | null
          success_criteria?: string[] | null
          target_month?: string
          template_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_objectives_aspect_id_fkey"
            columns: ["aspect_id"]
            isOneToOne: false
            referencedRelation: "life_aspects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_objectives_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "objective_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      music_library: {
        Row: {
          added_at: string | null
          album: string | null
          artist: string
          cover_url: string | null
          genres: string[] | null
          id: string
          preview_url: string | null
          release_year: number | null
          spotify_id: string | null
          tier: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          album?: string | null
          artist: string
          cover_url?: string | null
          genres?: string[] | null
          id?: string
          preview_url?: string | null
          release_year?: number | null
          spotify_id?: string | null
          tier?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          album?: string | null
          artist?: string
          cover_url?: string | null
          genres?: string[] | null
          id?: string
          preview_url?: string | null
          release_year?: number | null
          spotify_id?: string | null
          tier?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nutrition_goals: {
        Row: {
          created_at: string | null
          daily_calories: number | null
          daily_carbs: number | null
          daily_fat: number | null
          daily_fiber: number | null
          daily_protein: number | null
          daily_sodium: number | null
          daily_sugar: number | null
          daily_water_glasses: number | null
          goal_type: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fat?: number | null
          daily_fiber?: number | null
          daily_protein?: number | null
          daily_sodium?: number | null
          daily_sugar?: number | null
          daily_water_glasses?: number | null
          goal_type?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fat?: number | null
          daily_fiber?: number | null
          daily_protein?: number | null
          daily_sodium?: number | null
          daily_sugar?: number | null
          daily_water_glasses?: number | null
          goal_type?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      objective_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          level: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          level: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          level?: string
          name?: string
        }
        Relationships: []
      }
      pantry_items: {
        Row: {
          barcode: string | null
          category: string | null
          created_at: string | null
          expiration_date: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          notes: string | null
          quantity: number | null
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          notes?: string | null
          quantity?: number | null
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          barcode?: string | null
          category?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          quantity?: number | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      point_rules: {
        Row: {
          action: string
          daily_limit: number | null
          description: string | null
          id: string
          is_active: boolean | null
          points: number
        }
        Insert: {
          action: string
          daily_limit?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          points: number
        }
        Update: {
          action?: string
          daily_limit?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          points?: number
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          related_item_id: string | null
          related_user_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          related_item_id?: string | null
          related_user_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          related_item_id?: string | null
          related_user_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_patterns: {
        Row: {
          created_at: string | null
          days_of_month: number[] | null
          days_of_week: number[] | null
          end_date: string | null
          frequency: number | null
          id: string
          max_occurrences: number | null
          months_of_year: number[] | null
          name: string
          pattern_type: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          days_of_month?: number[] | null
          days_of_week?: number[] | null
          end_date?: string | null
          frequency?: number | null
          id?: string
          max_occurrences?: number | null
          months_of_year?: number[] | null
          name: string
          pattern_type: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          days_of_month?: number[] | null
          days_of_week?: number[] | null
          end_date?: string | null
          frequency?: number | null
          id?: string
          max_occurrences?: number | null
          months_of_year?: number[] | null
          name?: string
          pattern_type?: string
          start_date?: string
        }
        Relationships: []
      }
      shared_lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          items: Json
          likes_count: number | null
          list_type: string
          owner_id: string
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          items?: Json
          likes_count?: number | null
          list_type: string
          owner_id: string
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          items?: Json
          likes_count?: number | null
          list_type?: string
          owner_id?: string
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      social_feed: {
        Row: {
          content: Json
          created_at: string | null
          feed_type: string
          id: string
          is_read: boolean | null
          related_id: string | null
          source_user_id: string | null
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          feed_type: string
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          source_user_id?: string | null
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          feed_type?: string
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          source_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sports_activities: {
        Row: {
          activity_date: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          notes: string | null
          sport: string
          user_id: string
          with_team: boolean | null
        }
        Insert: {
          activity_date?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          sport: string
          user_id: string
          with_team?: boolean | null
        }
        Update: {
          activity_date?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          sport?: string
          user_id?: string
          with_team?: boolean | null
        }
        Relationships: []
      }
      supplement_logs: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          servings: number | null
          supplement_id: string
          taken_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          servings?: number | null
          supplement_id: string
          taken_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          servings?: number | null
          supplement_id?: string
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplement_logs_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      supplements: {
        Row: {
          brand: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          notes: string | null
          nutrition_per_serving: Json | null
          serving_size: string | null
          servings_per_container: number | null
          type: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          nutrition_per_serving?: Json | null
          serving_size?: string | null
          servings_per_container?: number | null
          type: string
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          nutrition_per_serving?: Json | null
          serving_size?: string | null
          servings_per_container?: number | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      task_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string | null
          dependent_task_id: string
          id: string
          prerequisite_task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string | null
          dependent_task_id: string
          id?: string
          prerequisite_task_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          dependency_type?: string | null
          dependent_task_id?: string
          id?: string
          prerequisite_task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_dependent_task_id_user_id_fkey"
            columns: ["dependent_task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "daily_tasks"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "task_dependencies_prerequisite_task_id_user_id_fkey"
            columns: ["prerequisite_task_id", "user_id"]
            isOneToOne: false
            referencedRelation: "daily_tasks"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      template_events: {
        Row: {
          aspect_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_all_day: boolean | null
          priority: string | null
          relative_days: number
          start_time: string | null
          tags: string[] | null
          template_id: string | null
          title: string
          type: string
        }
        Insert: {
          aspect_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_all_day?: boolean | null
          priority?: string | null
          relative_days: number
          start_time?: string | null
          tags?: string[] | null
          template_id?: string | null
          title: string
          type: string
        }
        Update: {
          aspect_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_all_day?: boolean | null
          priority?: string | null
          relative_days?: number
          start_time?: string | null
          tags?: string[] | null
          template_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_events_aspect_id_fkey"
            columns: ["aspect_id"]
            isOneToOne: false
            referencedRelation: "life_aspects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_events_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "calendar_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_objectives: {
        Row: {
          aspect_id: string
          created_at: string | null
          description: string | null
          estimated_duration_days: number | null
          id: string
          priority: string | null
          success_criteria: string[] | null
          template_id: string | null
          title: string
          type: string
        }
        Insert: {
          aspect_id: string
          created_at?: string | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          priority?: string | null
          success_criteria?: string[] | null
          template_id?: string | null
          title: string
          type: string
        }
        Update: {
          aspect_id?: string
          created_at?: string | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          priority?: string | null
          success_criteria?: string[] | null
          template_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_objectives_aspect_id_fkey"
            columns: ["aspect_id"]
            isOneToOne: false
            referencedRelation: "life_aspects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_objectives_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "objective_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tier_limits: {
        Row: {
          ai_messages_per_month: number | null
          ai_model: string | null
          created_at: string | null
          has_analytics_dashboard: boolean | null
          has_early_access: boolean | null
          has_goal_coaching: boolean | null
          has_integrations: boolean | null
          has_priority_support: boolean | null
          has_proactive_checkins: boolean | null
          has_social_features: boolean | null
          has_trend_insights: boolean | null
          has_voice_mode: boolean | null
          has_weekly_review: boolean | null
          has_weekly_summary: boolean | null
          support_level: string | null
          tier: string
          updated_at: string | null
        }
        Insert: {
          ai_messages_per_month?: number | null
          ai_model?: string | null
          created_at?: string | null
          has_analytics_dashboard?: boolean | null
          has_early_access?: boolean | null
          has_goal_coaching?: boolean | null
          has_integrations?: boolean | null
          has_priority_support?: boolean | null
          has_proactive_checkins?: boolean | null
          has_social_features?: boolean | null
          has_trend_insights?: boolean | null
          has_voice_mode?: boolean | null
          has_weekly_review?: boolean | null
          has_weekly_summary?: boolean | null
          support_level?: string | null
          tier: string
          updated_at?: string | null
        }
        Update: {
          ai_messages_per_month?: number | null
          ai_model?: string | null
          created_at?: string | null
          has_analytics_dashboard?: boolean | null
          has_early_access?: boolean | null
          has_goal_coaching?: boolean | null
          has_integrations?: boolean | null
          has_priority_support?: boolean | null
          has_proactive_checkins?: boolean | null
          has_social_features?: boolean | null
          has_trend_insights?: boolean | null
          has_voice_mode?: boolean | null
          has_weekly_review?: boolean | null
          has_weekly_summary?: boolean | null
          support_level?: string | null
          tier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          intensity: string | null
          notes: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          intensity?: string | null
          notes?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trend_recommendations: {
        Row: {
          aspect: string
          created_at: string | null
          id: string
          personalization_hints: Json | null
          recommendation_template: string
          trend_id: string | null
          user_segment: string[] | null
        }
        Insert: {
          aspect: string
          created_at?: string | null
          id?: string
          personalization_hints?: Json | null
          recommendation_template: string
          trend_id?: string | null
          user_segment?: string[] | null
        }
        Update: {
          aspect?: string
          created_at?: string | null
          id?: string
          personalization_hints?: Json | null
          recommendation_template?: string
          trend_id?: string | null
          user_segment?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "trend_recommendations_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "twitter_trends"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget: number | null
          created_at: string | null
          current_saved: number | null
          destination: string
          end_date: string | null
          id: string
          notes: string | null
          start_date: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          current_saved?: number | null
          destination: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          current_saved?: number | null
          destination?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      twitter_trends: {
        Row: {
          category: string
          created_at: string | null
          first_seen_at: string
          id: string
          influential_accounts: string[] | null
          is_emerging: boolean | null
          key_insights: string[] | null
          last_updated_at: string
          raw_data: Json | null
          related_aspects: string[] | null
          relevance_score: number
          sentiment: string
          topic: string
          tweet_volume: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          first_seen_at?: string
          id?: string
          influential_accounts?: string[] | null
          is_emerging?: boolean | null
          key_insights?: string[] | null
          last_updated_at?: string
          raw_data?: Json | null
          related_aspects?: string[] | null
          relevance_score?: number
          sentiment?: string
          topic: string
          tweet_volume?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          first_seen_at?: string
          id?: string
          influential_accounts?: string[] | null
          is_emerging?: boolean | null
          key_insights?: string[] | null
          last_updated_at?: string
          raw_data?: Json | null
          related_aspects?: string[] | null
          relevance_score?: number
          sentiment?: string
          topic?: string
          tweet_volume?: number | null
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string
          city: string
          company: string | null
          country_code: string
          created_at: string | null
          first_name: string
          id: string
          is_default_billing: boolean | null
          is_default_shipping: boolean | null
          last_name: string
          phone: string | null
          postal_code: string
          state_province: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type: string
          city: string
          company?: string | null
          country_code: string
          created_at?: string | null
          first_name: string
          id?: string
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          last_name: string
          phone?: string | null
          postal_code: string
          state_province?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string
          city?: string
          company?: string | null
          country_code?: string
          created_at?: string | null
          first_name?: string
          id?: string
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          state_province?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          anthropic_key_encrypted: string | null
          anthropic_key_valid: boolean | null
          anthropic_last_validated_at: string | null
          anthropic_validation_error: string | null
          created_at: string | null
          id: string
          openai_key_encrypted: string | null
          openai_key_valid: boolean | null
          openai_last_validated_at: string | null
          openai_validation_error: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anthropic_key_encrypted?: string | null
          anthropic_key_valid?: boolean | null
          anthropic_last_validated_at?: string | null
          anthropic_validation_error?: string | null
          created_at?: string | null
          id?: string
          openai_key_encrypted?: string | null
          openai_key_valid?: boolean | null
          openai_last_validated_at?: string | null
          openai_validation_error?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anthropic_key_encrypted?: string | null
          anthropic_key_valid?: boolean | null
          anthropic_last_validated_at?: string | null
          anthropic_validation_error?: string | null
          created_at?: string | null
          id?: string
          openai_key_encrypted?: string | null
          openai_key_valid?: boolean | null
          openai_last_validated_at?: string | null
          openai_validation_error?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_insight_profiles: {
        Row: {
          created_at: string | null
          entertainment: Json | null
          financial: Json | null
          health: Json | null
          interests: Json | null
          last_analysis: string | null
          platforms_analyzed: string[] | null
          social: Json | null
          total_insights: number | null
          travel: Json | null
          updated_at: string | null
          user_id: string
          work: Json | null
        }
        Insert: {
          created_at?: string | null
          entertainment?: Json | null
          financial?: Json | null
          health?: Json | null
          interests?: Json | null
          last_analysis?: string | null
          platforms_analyzed?: string[] | null
          social?: Json | null
          total_insights?: number | null
          travel?: Json | null
          updated_at?: string | null
          user_id: string
          work?: Json | null
        }
        Update: {
          created_at?: string | null
          entertainment?: Json | null
          financial?: Json | null
          health?: Json | null
          interests?: Json | null
          last_analysis?: string | null
          platforms_analyzed?: string[] | null
          social?: Json | null
          total_insights?: number | null
          travel?: Json | null
          updated_at?: string | null
          user_id?: string
          work?: Json | null
        }
        Relationships: []
      }
      user_insights: {
        Row: {
          category: string
          confidence: number
          evidence: string | null
          expires_at: string | null
          extracted_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          user_id: string
          value: Json
        }
        Insert: {
          category: string
          confidence?: number
          evidence?: string | null
          expires_at?: string | null
          extracted_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          user_id: string
          value: Json
        }
        Update: {
          category?: string
          confidence?: number
          evidence?: string | null
          expires_at?: string | null
          extracted_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          user_id?: string
          value?: Json
        }
        Relationships: []
      }
      user_installed_apps: {
        Row: {
          app_slug: string
          id: string
          installed_at: string | null
          is_connected: boolean | null
          oauth_tokens: Json | null
          settings: Json | null
          user_id: string
        }
        Insert: {
          app_slug: string
          id?: string
          installed_at?: string | null
          is_connected?: boolean | null
          oauth_tokens?: Json | null
          settings?: Json | null
          user_id: string
        }
        Update: {
          app_slug?: string
          id?: string
          installed_at?: string | null
          is_connected?: boolean | null
          oauth_tokens?: Json | null
          settings?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_installed_apps_app_slug_fkey"
            columns: ["app_slug"]
            isOneToOne: false
            referencedRelation: "aspect_apps"
            referencedColumns: ["slug"]
          },
        ]
      }
      user_interest_signals: {
        Row: {
          aspect: string
          created_at: string | null
          id: string
          keywords: string[] | null
          last_updated: string
          signal_type: string
          strength: number
          user_id: string | null
        }
        Insert: {
          aspect: string
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          last_updated?: string
          signal_type: string
          strength?: number
          user_id?: string | null
        }
        Update: {
          aspect?: string
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          last_updated?: string
          signal_type?: string
          strength?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_points: {
        Row: {
          balance: number | null
          id: string
          lifetime_earned: number | null
          lifetime_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          id?: string
          lifetime_earned?: number | null
          lifetime_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          id?: string
          lifetime_earned?: number | null
          lifetime_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          aspect_priorities: string[] | null
          auto_add_sports_games_to_calendar: boolean | null
          carousel_apps: string[] | null
          created_at: string | null
          daily_message_count: number | null
          id: string
          installed_apps: string[] | null
          notifications_enabled: boolean | null
          onboarding_completed: boolean | null
          user_id: string
          wishlist_apps: string[] | null
        }
        Insert: {
          aspect_priorities?: string[] | null
          auto_add_sports_games_to_calendar?: boolean | null
          carousel_apps?: string[] | null
          created_at?: string | null
          daily_message_count?: number | null
          id?: string
          installed_apps?: string[] | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          user_id: string
          wishlist_apps?: string[] | null
        }
        Update: {
          aspect_priorities?: string[] | null
          auto_add_sports_games_to_calendar?: boolean | null
          carousel_apps?: string[] | null
          created_at?: string | null
          daily_message_count?: number | null
          id?: string
          installed_apps?: string[] | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          user_id?: string
          wishlist_apps?: string[] | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          ai_provider: string | null
          ai_tone: string | null
          avatar_3d_url: string | null
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_provider?: string | null
          ai_tone?: string | null
          avatar_3d_url?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_provider?: string | null
          ai_tone?: string | null
          avatar_3d_url?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          tier: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      visited_places: {
        Row: {
          city: string | null
          coordinates_x: number
          coordinates_y: number
          country: string
          created_at: string | null
          emoji: string | null
          id: string
          notes: string | null
          photos: string[] | null
          rating: number | null
          updated_at: string | null
          user_id: string
          visited_at: string | null
          year: number
        }
        Insert: {
          city?: string | null
          coordinates_x: number
          coordinates_y: number
          country: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          rating?: number | null
          updated_at?: string | null
          user_id: string
          visited_at?: string | null
          year: number
        }
        Update: {
          city?: string | null
          coordinates_x?: number
          coordinates_y?: number
          country?: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string
          visited_at?: string | null
          year?: number
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          backdrop_url: string | null
          cast_members: string[] | null
          created_at: string | null
          director: string | null
          franchise: string | null
          genres: string[] | null
          id: string
          imdb_id: string | null
          notes: string | null
          poster_url: string | null
          rating: number | null
          release_year: number | null
          runtime_minutes: number | null
          status: string | null
          streaming_providers: Json | null
          tier: string | null
          title: string
          tmdb_id: number | null
          type: string | null
          user_id: string
          user_review: string | null
          watched_date: string | null
        }
        Insert: {
          backdrop_url?: string | null
          cast_members?: string[] | null
          created_at?: string | null
          director?: string | null
          franchise?: string | null
          genres?: string[] | null
          id?: string
          imdb_id?: string | null
          notes?: string | null
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          runtime_minutes?: number | null
          status?: string | null
          streaming_providers?: Json | null
          tier?: string | null
          title: string
          tmdb_id?: number | null
          type?: string | null
          user_id: string
          user_review?: string | null
          watched_date?: string | null
        }
        Update: {
          backdrop_url?: string | null
          cast_members?: string[] | null
          created_at?: string | null
          director?: string | null
          franchise?: string | null
          genres?: string[] | null
          id?: string
          imdb_id?: string | null
          notes?: string | null
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          runtime_minutes?: number | null
          status?: string | null
          streaming_providers?: Json | null
          tier?: string | null
          title?: string
          tmdb_id?: number | null
          type?: string | null
          user_id?: string
          user_review?: string | null
          watched_date?: string | null
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string | null
          id: string
          logged_at: string | null
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          id?: string
          logged_at?: string | null
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          id?: string
          logged_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weekly_objectives: {
        Row: {
          aspect_id: string
          completed_at: string | null
          created_at: string | null
          dependencies: string[] | null
          description: string | null
          estimated_duration_days: number | null
          id: string
          monthly_objective_id: string | null
          priority: string | null
          progress_percentage: number | null
          review_date: string | null
          review_notes: string | null
          status: string | null
          success_criteria: string[] | null
          target_week_start: string
          template_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aspect_id: string
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          monthly_objective_id?: string | null
          priority?: string | null
          progress_percentage?: number | null
          review_date?: string | null
          review_notes?: string | null
          status?: string | null
          success_criteria?: string[] | null
          target_week_start: string
          template_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aspect_id?: string
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: string
          monthly_objective_id?: string | null
          priority?: string | null
          progress_percentage?: number | null
          review_date?: string | null
          review_notes?: string | null
          status?: string | null
          success_criteria?: string[] | null
          target_week_start?: string
          template_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_objectives_aspect_id_fkey"
            columns: ["aspect_id"]
            isOneToOne: false
            referencedRelation: "life_aspects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_objectives_monthly_objective_id_fkey"
            columns: ["monthly_objective_id"]
            isOneToOne: false
            referencedRelation: "monthly_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_objectives_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "objective_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_points: {
        Args: {
          p_action: string
          p_amount?: number
          p_description?: string
          p_related_item_id?: string
          p_related_user_id?: string
          p_user_id: string
        }
        Returns: Json
      }
      calculate_calendar_analytics: {
        Args: { p_date: string; p_user_id: string }
        Returns: undefined
      }
      can_make_ai_request: { Args: { p_user_id: string }; Returns: boolean }
      cleanup_expired_recommendations: { Args: never; Returns: undefined }
      generate_recurring_events: {
        Args: { p_end_date: string; p_pattern_id: string; p_start_date: string }
        Returns: {
          event_date: string
          instance_number: number
        }[]
      }
      get_daily_nutrition: {
        Args: { p_date?: string; p_user_id: string }
        Returns: {
          meal_count: number
          total_calories: number
          total_carbs: number
          total_fat: number
          total_fiber: number
          total_protein: number
          total_sodium: number
          total_sugar: number
          water_ml: number
        }[]
      }
      get_expiring_items: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          category: string
          days_until_expiry: number
          expiration_date: string
          item_id: string
          item_name: string
        }[]
      }
      get_personalized_recommendations: {
        Args: { p_aspect?: string; p_limit?: number; p_user_id: string }
        Returns: Json
      }
      get_todays_supplements: {
        Args: { p_user_id: string }
        Returns: {
          last_taken: string
          supplement_id: string
          supplement_name: string
          supplement_type: string
          times_taken: number
        }[]
      }
      get_user_tier_info: {
        Args: { p_user_id: string }
        Returns: {
          has_valid_byok: boolean
          messages_limit: number
          messages_used: number
          status: string
          stripe_customer_id: string
          tier: string
        }[]
      }
      increment_ai_usage: { Args: { p_user_id: string }; Returns: undefined }
      reset_monthly_usage: { Args: never; Returns: undefined }
      tip_friend: {
        Args: {
          p_amount: number
          p_from_user_id: string
          p_message?: string
          p_to_user_id: string
        }
        Returns: Json
      }
      update_monthly_objective_progress: {
        Args: { p_monthly_objective_id: string }
        Returns: undefined
      }
      update_user_interests: {
        Args: {
          p_aspect: string
          p_keywords: string[]
          p_strength?: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_weekly_objective_progress: {
        Args: { p_weekly_objective_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
