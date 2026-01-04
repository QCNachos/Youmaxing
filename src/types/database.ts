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

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_3d_url: string | null;
  ai_tone: AITone;
  ai_provider: AIProvider;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  aspect_priorities: AspectType[];
  daily_message_count: number;
  notifications_enabled: boolean;
  onboarding_completed: boolean;
  country_code: string; // For streaming availability lookup
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  aspect: AspectType | null;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIRecommendation {
  id: string;
  user_id: string;
  aspect: AspectType;
  title: string;
  content: string;
  action_type: 'info' | 'action' | 'reminder' | 'trending';
  action_url?: string;
  acted_on: boolean;
  dismissed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'user_data' | 'twitter_trend' | 'hybrid';
  trend_context?: string;
  expires_at?: string;
  created_at: string;
}

// Twitter/X Trending Intelligence
export interface TwitterTrend {
  id: string;
  topic: string;
  category: 'finance' | 'health' | 'tech' | 'business' | 'lifestyle' | 'entertainment' | 'sports' | 'general';
  relevance_score: number;
  tweet_volume?: number;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  key_insights: string[];
  influential_accounts: string[];
  related_aspects: AspectType[];
  raw_data?: Record<string, unknown>;
  first_seen_at: string;
  last_updated_at: string;
  is_emerging: boolean;
  created_at: string;
}

// Trend-to-Recommendation mapping
export interface TrendRecommendation {
  id: string;
  trend_id: string;
  aspect: AspectType;
  user_segment: string[];
  recommendation_template: string;
  personalization_hints: Record<string, string>;
  created_at: string;
}

// User interest signals for better matching
export interface UserInterestSignal {
  id: string;
  user_id: string;
  aspect: AspectType;
  signal_type: 'explicit' | 'implicit' | 'inferred';
  keywords: string[];
  strength: number;
  last_updated: string;
  created_at: string;
}

// Aspect-specific types
export interface TrainingLog {
  id: string;
  user_id: string;
  title: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'other';
  duration_minutes: number;
  intensity: 'low' | 'medium' | 'high';
  notes: string | null;
  completed_at: string;
  created_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

export interface SportsActivity {
  id: string;
  user_id: string;
  sport: string;
  duration_minutes: number;
  location: string | null;
  with_team: boolean;
  notes: string | null;
  activity_date: string;
  created_at: string;
}

// Film/Series tier system
export type FilmTier = 
  | 'legendary' 
  | 'amazing' 
  | 'very_good' 
  | 'good' 
  | 'okay' 
  | 'not_good' 
  | 'not_interested';

// Streaming provider info from TMDB
export interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface StreamingProviders {
  flatrate?: StreamingProvider[];  // Subscription streaming
  rent?: StreamingProvider[];      // Rent
  buy?: StreamingProvider[];       // Buy
  free?: StreamingProvider[];      // Free with ads
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  title: string;
  type: 'movie' | 'series' | 'documentary';
  status: 'want_to_watch' | 'watching' | 'watched';
  rating: number | null;
  notes: string | null;
  // Enhanced fields
  tmdb_id: number | null;
  tier: FilmTier | null;
  franchise: string | null;
  poster_url: string | null;
  streaming_providers: StreamingProviders | null;
  genres: string[] | null;
  release_year: number | null;
  last_provider_check: string | null;
  created_at: string;
}

export interface FinanceEntry {
  id: string;
  user_id: string;
  type: 'income' | 'expense' | 'investment' | 'saving';
  category: string;
  amount: number;
  currency: string;
  description: string | null;
  date: string;
  created_at: string;
}

export interface BusinessProject {
  id: string;
  user_id: string;
  name: string;
  status: 'idea' | 'planning' | 'active' | 'paused' | 'completed';
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  deadline: string | null;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  status: 'dream' | 'planning' | 'booked' | 'completed';
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  notes: string | null;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  birthday: string | null;
  notes: string | null;
  created_at: string;
}

export interface Friend {
  id: string;
  user_id: string;
  name: string;
  how_met: string | null;
  last_contact: string | null;
  notes: string | null;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  aspect: AspectType;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  created_at: string;
}

// =====================================================
// APP STORE
// =====================================================

export type AppCategory = 'entertainment' | 'lifestyle' | 'productivity' | 'social';

export interface AspectApp {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  gradient: string;
  category: AppCategory;
  is_active: boolean;
  requires_oauth: string[];
  created_at: string;
}

export interface UserInstalledApp {
  id: string;
  user_id: string;
  app_slug: string;
  settings: Record<string, unknown>;
  oauth_tokens: Record<string, unknown> | null;
  is_connected: boolean;
  installed_at: string;
}

// =====================================================
// SOCIAL LAYER
// =====================================================

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
  accepted_at: string | null;
}

export type ListVisibility = 'private' | 'friends' | 'public';
export type ListType = 'films' | 'music' | 'custom';

export interface SharedList {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  list_type: ListType;
  visibility: ListVisibility;
  items: Array<{ id: string; title: string; tier?: FilmTier }>;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListShare {
  id: string;
  list_id: string;
  shared_with_id: string;
  message: string | null;
  shared_at: string;
  viewed_at: string | null;
}

export type FeedType = 'list_shared' | 'recommendation' | 'achievement' | 'tip_received' | 'friend_added';

export interface SocialFeedItem {
  id: string;
  user_id: string;
  feed_type: FeedType;
  content: Record<string, unknown>;
  source_user_id: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

// =====================================================
// POINTS ECONOMY
// =====================================================

export interface UserPoints {
  id: string;
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  updated_at: string;
}

export type PointTransactionType = 
  | 'daily_login'
  | 'rate_item'
  | 'share_list'
  | 'receive_tip'
  | 'give_tip'
  | 'unlock_feature'
  | 'add_friend'
  | 'complete_watchlist'
  | 'signup_bonus'
  | 'referral';

export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: PointTransactionType;
  description: string | null;
  related_user_id: string | null;
  related_item_id: string | null;
  created_at: string;
}

export interface PointRule {
  id: string;
  action: string;
  points: number;
  daily_limit: number | null;
  description: string | null;
  is_active: boolean;
}

// =====================================================
// MUSIC LIBRARY
// =====================================================

export type MusicItemType = 'track' | 'album' | 'playlist' | 'artist';

export interface MusicLibraryItem {
  id: string;
  user_id: string;
  spotify_id: string | null;
  title: string;
  artist: string;
  album: string | null;
  type: MusicItemType;
  tier: FilmTier | null;
  cover_url: string | null;
  preview_url: string | null;
  genres: string[] | null;
  release_year: number | null;
  added_at: string;
}

// Database schema type for Supabase
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'user_id'>>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, 'id' | 'created_at'>;
        Update: Partial<Omit<UserPreferences, 'id' | 'user_id'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at'>;
        Update: Partial<Omit<Conversation, 'id' | 'user_id'>>;
      };
      ai_recommendations: {
        Row: AIRecommendation;
        Insert: Omit<AIRecommendation, 'id' | 'created_at'>;
        Update: Partial<Omit<AIRecommendation, 'id' | 'user_id'>>;
      };
      training_logs: {
        Row: TrainingLog;
        Insert: Omit<TrainingLog, 'id' | 'created_at'>;
        Update: Partial<Omit<TrainingLog, 'id' | 'user_id'>>;
      };
      meals: {
        Row: Meal;
        Insert: Omit<Meal, 'id' | 'created_at'>;
        Update: Partial<Omit<Meal, 'id' | 'user_id'>>;
      };
      sports_activities: {
        Row: SportsActivity;
        Insert: Omit<SportsActivity, 'id' | 'created_at'>;
        Update: Partial<Omit<SportsActivity, 'id' | 'user_id'>>;
      };
      watchlist: {
        Row: WatchlistItem;
        Insert: Omit<WatchlistItem, 'id' | 'created_at'>;
        Update: Partial<Omit<WatchlistItem, 'id' | 'user_id'>>;
      };
      finances: {
        Row: FinanceEntry;
        Insert: Omit<FinanceEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<FinanceEntry, 'id' | 'user_id'>>;
      };
      business_projects: {
        Row: BusinessProject;
        Insert: Omit<BusinessProject, 'id' | 'created_at'>;
        Update: Partial<Omit<BusinessProject, 'id' | 'user_id'>>;
      };
      trips: {
        Row: Trip;
        Insert: Omit<Trip, 'id' | 'created_at'>;
        Update: Partial<Omit<Trip, 'id' | 'user_id'>>;
      };
      family_members: {
        Row: FamilyMember;
        Insert: Omit<FamilyMember, 'id' | 'created_at'>;
        Update: Partial<Omit<FamilyMember, 'id' | 'user_id'>>;
      };
      friends: {
        Row: Friend;
        Insert: Omit<Friend, 'id' | 'created_at'>;
        Update: Partial<Omit<Friend, 'id' | 'user_id'>>;
      };
      calendar_events: {
        Row: CalendarEvent;
        Insert: Omit<CalendarEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<CalendarEvent, 'id' | 'user_id'>>;
      };
      twitter_trends: {
        Row: TwitterTrend;
        Insert: Omit<TwitterTrend, 'id' | 'created_at'>;
        Update: Partial<Omit<TwitterTrend, 'id'>>;
      };
      trend_recommendations: {
        Row: TrendRecommendation;
        Insert: Omit<TrendRecommendation, 'id' | 'created_at'>;
        Update: Partial<Omit<TrendRecommendation, 'id'>>;
      };
      user_interest_signals: {
        Row: UserInterestSignal;
        Insert: Omit<UserInterestSignal, 'id' | 'created_at'>;
        Update: Partial<Omit<UserInterestSignal, 'id' | 'user_id'>>;
      };
    };
  };
}

