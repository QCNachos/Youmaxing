/**
 * Streaming Service Sync Types
 * 
 * This module defines types for syncing data from streaming services.
 * Data can be collected via:
 * 1. Claude Computer Use (browser automation with user's logged-in sessions)
 * 2. TMDB API (fallback for metadata/availability)
 * 3. Manual user input
 */

export type StreamingService = 
  | 'netflix'
  | 'prime_video'
  | 'disney_plus'
  | 'hbo_max'
  | 'hulu'
  | 'apple_tv'
  | 'peacock'
  | 'paramount_plus'
  | 'crunchyroll';

export type SyncMethod = 'claude_code' | 'api' | 'manual';

export interface StreamingItem {
  title: string;
  type: 'movie' | 'series';
  service: StreamingService;
  service_id?: string; // Netflix ID, Prime ASIN, etc.
  poster_url?: string;
  progress?: number; // 0-100 for "continue watching"
  last_watched?: string; // ISO date
  in_watchlist: boolean;
  rating?: number; // User's rating if available
  seasons_watched?: number; // For series
  episodes_watched?: number;
}

export interface SyncResult {
  service: StreamingService;
  method: SyncMethod;
  items: StreamingItem[];
  synced_at: string;
  success: boolean;
  error?: string;
}

export interface UserSyncPreferences {
  user_id: string;
  has_claude_code: boolean;
  enabled_services: StreamingService[];
  auto_sync: boolean;
  sync_frequency_days: number;
  last_sync?: Record<StreamingService, string>;
}

// Instructions for Claude Code to follow
export interface SyncInstructions {
  service: StreamingService;
  steps: string[];
  selectors?: Record<string, string>; // CSS selectors for scraping
  urls: {
    login?: string;
    watchlist: string;
    history?: string;
    continue_watching?: string;
  };
}

// Data format that Claude Code should return
export interface ClaudeCodeSyncPayload {
  service: StreamingService;
  timestamp: string;
  user_agent: string;
  data: {
    watchlist: StreamingItem[];
    continue_watching: StreamingItem[];
    recently_watched: StreamingItem[];
  };
}


