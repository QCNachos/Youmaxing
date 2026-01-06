/**
 * Insight Agent Types
 * 
 * Claude Code acts as a personal data analyst - browsing user's logged-in 
 * accounts to extract INSIGHTS (not raw data) that power recommendations.
 * 
 * Privacy-first: We only store derived insights, never raw personal data.
 */

// Platforms the agent can analyze
export type AnalysisPlatform = 
  // Social
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'twitter'
  // Entertainment
  | 'netflix'
  | 'spotify'
  | 'youtube'
  | 'prime_video'
  // Productivity
  | 'google_drive'
  | 'google_calendar'
  | 'gmail'
  | 'notion'
  // Finance
  | 'mint'
  | 'robinhood'
  // Health
  | 'strava'
  | 'myfitnesspal';

// Categories of insights we extract
export type InsightCategory = 
  | 'interests'           // What topics/hobbies they're into
  | 'social_circle'       // Types of relationships, activity levels
  | 'work_patterns'       // When they work, what they work on
  | 'entertainment_prefs' // Genres, formats, consumption patterns
  | 'health_fitness'      // Activity levels, goals
  | 'financial_behavior'  // Spending patterns, goals
  | 'travel_interests'    // Destinations, travel style
  | 'food_preferences'    // Cuisines, dietary patterns
  | 'learning_interests'; // Skills they're developing

// A single insight extracted from a platform
export interface Insight {
  id: string;
  category: InsightCategory;
  platform: AnalysisPlatform;
  confidence: number; // 0-1, how confident we are in this insight
  value: string | string[] | Record<string, any>;
  evidence?: string; // Brief explanation of why we derived this
  extracted_at: string;
}

// Aggregated user profile built from insights
export interface UserInsightProfile {
  user_id: string;
  
  // Interests & Preferences
  interests: {
    topic: string;
    strength: number; // 0-1
    sources: AnalysisPlatform[];
  }[];
  
  // Content preferences (for Films, Music, etc.)
  entertainment: {
    preferred_genres: string[];
    preferred_formats: ('movie' | 'series' | 'documentary' | 'short')[];
    viewing_time: 'morning' | 'evening' | 'late_night' | 'weekend';
    binge_watcher: boolean;
    music_genres: string[];
    podcast_listener: boolean;
  };
  
  // Social patterns (for Friends, Family, Events)
  social: {
    social_activity_level: 'high' | 'medium' | 'low';
    preferred_group_size: 'solo' | 'small' | 'large';
    communication_style: 'frequent' | 'occasional' | 'minimal';
    close_friends_count: number;
    family_oriented: boolean;
  };
  
  // Work patterns (for Business)
  work: {
    work_schedule: 'standard' | 'flexible' | 'irregular';
    productivity_peak: 'morning' | 'afternoon' | 'evening';
    role_type: 'creative' | 'analytical' | 'management' | 'technical' | 'mixed';
    industry_interests: string[];
    skill_focus: string[];
  };
  
  // Health & Fitness (for Training, Food)
  health: {
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    workout_preferences: string[];
    dietary_restrictions: string[];
    health_goals: string[];
  };
  
  // Financial (for Finance)
  financial: {
    spending_style: 'frugal' | 'balanced' | 'generous';
    investment_interest: boolean;
    financial_goals: string[];
  };
  
  // Travel (for Travel)
  travel: {
    travel_style: 'adventure' | 'relaxation' | 'cultural' | 'luxury' | 'budget';
    preferred_destinations: string[];
    travel_frequency: 'rarely' | 'occasionally' | 'frequently';
  };
  
  // Meta
  last_analysis: string;
  platforms_analyzed: AnalysisPlatform[];
  total_insights: number;
}

// Analysis task for Claude Code
export interface AnalysisTask {
  platform: AnalysisPlatform;
  objectives: string[];
  urls: string[];
  insight_categories: InsightCategory[];
}

// Result from Claude Code analysis
export interface AnalysisResult {
  user_id: string;
  platform: AnalysisPlatform;
  timestamp: string;
  insights: Insight[];
  logged_in: boolean;
  error?: string;
}

// Agent capabilities
export interface AgentCapabilities {
  has_claude_code: boolean;
  available_platforms: AnalysisPlatform[];
  last_full_analysis?: string;
  analysis_in_progress: boolean;
}


