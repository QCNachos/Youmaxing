/* eslint-disable @typescript-eslint/no-explicit-any */
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
      daily_tasks: {
        Row: {
          id: string
          user_id: string
          weekly_objective_id: string | null
          title: string
          description: string | null
          aspect_id: string
          type: string
          target_date: string
          status: string
          priority: string
          estimated_duration_minutes: number | null
          actual_duration_minutes: number | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          weekly_objective_id?: string | null
          title: string
          description?: string | null
          aspect_id: string
          type: string
          target_date: string
          status?: string
          priority?: string
          estimated_duration_minutes?: number | null
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          weekly_objective_id?: string | null
          title?: string
          description?: string | null
          aspect_id?: string
          type?: string
          target_date?: string
          status?: string
          priority?: string
          estimated_duration_minutes?: number | null
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      monthly_objectives: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          aspect_id: string
          type: string
          target_month: string
          status: string
          priority: string
          progress_percentage: number
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          aspect_id: string
          type: string
          target_month: string
          status?: string
          priority?: string
          progress_percentage?: number
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          aspect_id?: string
          type?: string
          target_month?: string
          status?: string
          priority?: string
          progress_percentage?: number
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      weekly_objectives: {
        Row: {
          id: string
          user_id: string
          monthly_objective_id: string | null
          title: string
          description: string | null
          aspect_id: string
          type: string
          target_week_start: string
          status: string
          priority: string
          progress_percentage: number
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          monthly_objective_id?: string | null
          title: string
          description?: string | null
          aspect_id: string
          type: string
          target_week_start: string
          status?: string
          priority?: string
          progress_percentage?: number
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          monthly_objective_id?: string | null
          title?: string
          description?: string | null
          aspect_id?: string
          type?: string
          target_week_start?: string
          status?: string
          priority?: string
          progress_percentage?: number
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      trips: {
        Row: {
          budget: number | null
          created_at: string | null
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
        Relationships: []
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
      watchlist: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          rating: number | null
          status: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          status?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          status?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
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
      can_make_ai_request: { Args: { p_user_id: string }; Returns: boolean }
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
      tip_friend: {
        Args: {
          p_amount: number
          p_from_user_id: string
          p_message?: string
          p_to_user_id: string
        }
        Returns: Json
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

// Custom type aliases for the app
export type AspectType =
  | 'training'
  | 'food'
  | 'sports'
  | 'films'
  | 'finance'
  | 'business'
  | 'travel'
  | 'family'
  | 'friends'
  | 'events'
  | 'settings';

export type AITone = 'chill' | 'professional' | 'motivational' | 'friendly';
export type AIProvider = 'openai' | 'anthropic';
export type FoodInputType = 'image' | 'barcode' | 'voice' | 'text';
export type FilmTier = 'legendary' | 'amazing' | 'very_good' | 'good' | 'okay' | 'not_good' | 'not_interested';
export type SupplementType = 'vitamin' | 'mineral' | 'protein' | 'creatine' | 'omega' | 'pre_workout' | 'amino_acids' | 'herbal' | 'other';
export type FeedType = 'recommendation' | 'friend_activity' | 'achievement' | 'shared_list' | 'list_shared' | 'tip_received' | 'friend_added';
export type ListVisibility = 'private' | 'friends' | 'public';
export type AppCategory = 'productivity' | 'health' | 'finance' | 'social' | 'entertainment' | 'lifestyle';
export type PointTransactionType = 'earn' | 'spend' | 'tip_received' | 'tip_sent' | 'daily_login' | 'rate_item' | 'share_list' | 'receive_tip' | 'give_tip' | 'unlock_feature' | 'add_friend' | 'complete_watchlist' | 'signup_bonus' | 'referral';

// Flexible interfaces for dynamic data (kept for backward compatibility)
export interface AnalyzedFood { [key: string]: any }
export interface FoodAnalysisResult { [key: string]: any }
export interface UserProfile { [key: string]: any }
export interface UserPreferences { [key: string]: any }
export interface Meal { [key: string]: any }
export interface TrainingLog { [key: string]: any }
export interface SportsActivity { [key: string]: any }
export interface WatchlistItem { [key: string]: any }
export interface Friend { [key: string]: any }
export interface FamilyMember { [key: string]: any }
export interface Trip { [key: string]: any }
export interface BusinessProject { [key: string]: any }
export interface FinanceEntry { [key: string]: any }
export interface CalendarEvent { [key: string]: any }
export interface AspectApp { [key: string]: any }
export interface UserInstalledApp { [key: string]: any }
export interface SocialFeedItem { [key: string]: any }
export interface SharedList { [key: string]: any }
export interface MusicLibraryItem { [key: string]: any }
export interface Supplement { [key: string]: any }
export interface AIRecommendation { [key: string]: any }
export interface TwitterTrend { [key: string]: any }
export interface PointTransaction { [key: string]: any }
export interface UserPoints { [key: string]: any }
export interface Conversation { [key: string]: any }
export interface ChatMessage { [key: string]: any }
