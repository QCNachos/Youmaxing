/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AspectLayout, EmptyState } from './AspectLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  Film,
  Tv,
  Star,
  Plus,
  Play,
  Check,
  Bookmark,
  Search,
  Loader2,
  ExternalLink,
  Crown,
  Sparkles,
  ThumbsUp,
  Meh,
  ThumbsDown,
  X,
  Trophy,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Heart,
  Ticket,
} from 'lucide-react';
import { SIMPLIFIED_GENRES, getSimplifiedGenres } from '@/lib/tmdb/types';
import type { WatchlistItem, FilmTier } from '@/types/database';
import type { AnalysisPlatform } from '@/lib/insight-agent/types';
import { InsightPermissions, InsightSourcesBadge } from './InsightPermissions';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Tier configuration with colors and icons
const tierConfig: Record<FilmTier, { label: string; color: string; bgColor: string; icon: typeof Crown }> = {
  legendary: { label: 'LEGENDARY', color: '#FFD700', bgColor: '#FFD70020', icon: Crown },
  amazing: { label: 'AMAZING', color: '#C0C0C0', bgColor: '#C0C0C020', icon: Sparkles },
  very_good: { label: 'VERY GOOD', color: '#CD7F32', bgColor: '#CD7F3220', icon: ThumbsUp },
  good: { label: 'GOOD', color: '#22C55E', bgColor: '#22C55E20', icon: ThumbsUp },
  okay: { label: 'OKAY', color: '#3B82F6', bgColor: '#3B82F620', icon: Meh },
  not_good: { label: 'NOT GOOD', color: '#F97316', bgColor: '#F9731620', icon: ThumbsDown },
  not_interested: { label: 'NOT INTERESTED', color: '#6B7280', bgColor: '#6B728020', icon: X },
};

const statusConfig = {
  want_to_watch: { label: 'Want to Watch', icon: Bookmark, color: '#F59E0B' },
  watching: { label: 'Watching', icon: Play, color: '#3B82F6' },
  watched: { label: 'Watched', icon: Check, color: '#22C55E' },
};

const franchiseLabels: Record<string, string> = {
  star_wars: 'Star Wars',
  got: 'Game of Thrones',
  lotr: 'Lord of the Rings',
  mcu: 'Marvel',
  harry_potter: 'Harry Potter',
  matrix: 'Matrix',
  dc: 'DC',
  dune: 'Dune',
  vikings: 'Vikings',
};

interface TMDBSearchResult {
  tmdbId: number;
  title: string;
  type: 'movie' | 'series';
  overview: string;
  posterUrl: string | null;
  releaseYear: number | null;
  rating: number;
  genres: string[];
  franchise?: string;
}

interface StreamingProvider {
  id: number;
  name: string;
  logoUrl: string;
}

// Enhanced mock data with new fields - including poster URLs from TMDB
const mockWatchlist: WatchlistItem[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Game of Thrones',
    type: 'series',
    status: 'watched',
    rating: 10,
    tier: 'legendary',
    franchise: 'got',
    poster_url: 'https://image.tmdb.org/t/p/w342/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    tmdb_id: 1399,
    streaming_providers: { flatrate: [{ provider_id: 384, provider_name: 'HBO Max', logo_path: '/logo.jpg', display_priority: 1 }] },
    genres: ['Drama', 'Fantasy'],
    release_year: 2011,
    notes: null,
    last_provider_check: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    type: 'movie',
    status: 'watched',
    rating: 10,
    tier: 'legendary',
    franchise: 'lotr',
    poster_url: 'https://image.tmdb.org/t/p/w342/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    tmdb_id: 120,
    streaming_providers: { flatrate: [{ provider_id: 9, provider_name: 'Amazon Prime Video', logo_path: '/logo.jpg', display_priority: 1 }] },
    genres: ['Adventure', 'Fantasy'],
    release_year: 2001,
    notes: null,
    last_provider_check: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    title: 'Star Wars',
    type: 'movie',
    status: 'watched',
    rating: 9,
    tier: 'amazing',
    franchise: 'star_wars',
    poster_url: 'https://image.tmdb.org/t/p/w342/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
    tmdb_id: 11,
    streaming_providers: { flatrate: [{ provider_id: 337, provider_name: 'Disney Plus', logo_path: '/logo.jpg', display_priority: 1 }] },
    genres: ['Adventure', 'Action', 'Science Fiction'],
    release_year: 1977,
    notes: null,
    last_provider_check: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: '1',
    title: 'Shogun',
    type: 'series',
    status: 'want_to_watch',
    rating: null,
    tier: null,
    franchise: null,
    poster_url: 'https://image.tmdb.org/t/p/w342/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg',
    tmdb_id: 126308,
    streaming_providers: { flatrate: [{ provider_id: 43, provider_name: 'Hulu', logo_path: '/logo.jpg', display_priority: 1 }] },
    genres: ['Drama', 'War'],
    release_year: 2024,
    notes: 'Recommended based on GoT love',
    last_provider_check: null,
    created_at: new Date().toISOString(),
  },
];

const recommendations = [
  { 
    title: 'Shogun', 
    type: 'series', 
    reason: 'Based on your love for epic dramas like GoT',
    predictedTier: 'legendary' as FilmTier,
    genres: ['Drama', 'War'],
    posterUrl: 'https://image.tmdb.org/t/p/w342/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg',
    confidence: 92,
  },
  { 
    title: 'The Last Samurai', 
    type: 'movie', 
    reason: 'Similar to films you rated LEGENDARY',
    predictedTier: 'amazing' as FilmTier,
    genres: ['Action', 'Drama'],
    posterUrl: 'https://image.tmdb.org/t/p/w342/8M0zHMIEMEjDLVyp0m2LDdWoOeK.jpg',
    confidence: 87,
  },
  { 
    title: 'Foundation', 
    type: 'series', 
    reason: 'Epic sci-fi for Star Wars fans',
    predictedTier: 'very_good' as FilmTier,
    genres: ['Sci-Fi', 'Drama'],
    posterUrl: 'https://image.tmdb.org/t/p/w342/f0GjI8HlLxJlpXQYM3VPH3VNpjL.jpg',
    confidence: 79,
  },
];

// Sports Watching types and data
interface FavoriteTeam {
  id: string;
  name: string;
  league: string;
  logo?: string;
  stadium?: string;
}

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: string;
  awayTeamId?: string;
  date: Date;
  time: string;
  league: string;
  venue?: string | null;
  isFavoriteTeamPlaying: boolean;
  thumbnail?: string | null;
}

interface MajorEvent {
  id: string;
  name: string;
  date: Date;
  league: string;
  description?: string;
}

const mockFavoriteTeams: FavoriteTeam[] = [
  { id: '1', name: 'Kansas City Chiefs', league: 'NFL' },
  { id: '2', name: 'Los Angeles Lakers', league: 'NBA' },
  { id: '3', name: 'Manchester United', league: 'Soccer' },
];

const mockUpcomingGames: Game[] = [
  {
    id: '1',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Denver Broncos',
    date: addDays(new Date(), 3),
    time: '8:20 PM',
    league: 'NFL',
    venue: 'Arrowhead Stadium',
    isFavoriteTeamPlaying: true,
  },
  {
    id: '2',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    date: addDays(new Date(), 5),
    time: '7:00 PM',
    league: 'NBA',
    venue: 'Crypto.com Arena',
    isFavoriteTeamPlaying: true,
  },
  {
    id: '3',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    date: addDays(new Date(), 7),
    time: '3:00 PM',
    league: 'Soccer',
    venue: 'Old Trafford',
    isFavoriteTeamPlaying: true,
  },
];

const mockMajorEvents: MajorEvent[] = [
  {
    id: '1',
    name: 'Super Bowl LVIII',
    date: new Date('2025-02-09'),
    league: 'NFL',
    description: 'The biggest game of the year',
  },
  {
    id: '2',
    name: 'NBA Finals Game 1',
    date: new Date('2025-06-05'),
    league: 'NBA',
    description: 'NBA Championship Finals',
  },
  {
    id: '3',
    name: 'World Cup Final',
    date: new Date('2026-07-19'),
    league: 'Soccer',
    description: 'FIFA World Cup Final',
  },
];

const popularTeams: FavoriteTeam[] = [
  { id: 'nfl-1', name: 'Kansas City Chiefs', league: 'NFL' },
  { id: 'nfl-2', name: 'San Francisco 49ers', league: 'NFL' },
  { id: 'nfl-3', name: 'Buffalo Bills', league: 'NFL' },
  { id: 'nba-1', name: 'Los Angeles Lakers', league: 'NBA' },
  { id: 'nba-2', name: 'Golden State Warriors', league: 'NBA' },
  { id: 'nba-3', name: 'Boston Celtics', league: 'NBA' },
  { id: 'soccer-1', name: 'Manchester United', league: 'Soccer' },
  { id: 'soccer-2', name: 'Liverpool', league: 'Soccer' },
  { id: 'soccer-3', name: 'Real Madrid', league: 'Soccer' },
];

export function TV() {
  const { theme } = useAppStore();
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TMDBSearchResult | null>(null);
  const [providers, setProviders] = useState<StreamingProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [filterTier, setFilterTier] = useState<FilmTier | 'all'>('all');
  const [filterFranchise, setFilterFranchise] = useState<string | 'all'>('all');
  const [filterGenre, setFilterGenre] = useState<string | 'all'>('all');
  
  // Insight Agent state
  const [enabledPlatforms, setEnabledPlatforms] = useState<AnalysisPlatform[]>(['netflix', 'youtube']);
  const [hasClaudeCode, setHasClaudeCode] = useState(false);
  
  const togglePlatform = (platform: AnalysisPlatform) => {
    setEnabledPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Load watchlist from database
  useEffect(() => {
    const loadWatchlist = async () => {
      if (!user) {
        setLoadingWatchlist(false);
        // Show mock data for non-logged in users
        setWatchlist(mockWatchlist);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('watchlist')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading watchlist:', error);
          toast.error('Failed to load watchlist');
        } else {
          // Transform database rows to WatchlistItem type
          const items: WatchlistItem[] = (data || []).map((row: any) => ({
            id: row.id,
            user_id: row.user_id,
            title: row.title,
            type: row.type,
            status: row.status,
            rating: row.rating,
            tier: row.tier,
            franchise: row.franchise,
            poster_url: row.poster_url,
            tmdb_id: row.tmdb_id,
            streaming_providers: row.streaming_providers,
            genres: row.genres,
            release_year: row.release_year,
            notes: row.notes,
            last_provider_check: row.last_provider_check,
            created_at: row.created_at,
          }));
          setWatchlist(items);
        }
      } catch (error) {
        console.error('Error loading watchlist:', error);
      } finally {
        setLoadingWatchlist(false);
      }
    };

    loadWatchlist();
  }, [user]);

  // Fetch posters for items without poster_url
  useEffect(() => {
    const fetchMissingPosters = async () => {
      const itemsWithoutPosters = watchlist.filter(item => !item.poster_url && item.title);
      if (itemsWithoutPosters.length === 0) return;

      // Batch fetch posters (limit to first 5 to avoid rate limiting)
      const itemsToFetch = itemsWithoutPosters.slice(0, 5);
      const updates: Record<string, string> = {};

      await Promise.all(
        itemsToFetch.map(async (item) => {
          try {
            const type = item.type === 'movie' ? 'movie' : 'series';
            const res = await fetch(
              `/api/films/omdb?title=${encodeURIComponent(item.title)}&type=${type}&poster_only=true`
            );
            if (res.ok) {
              const data = await res.json();
              if (data.posterUrl) {
                updates[item.id] = data.posterUrl;
              }
            }
          } catch (error) {
            console.error(`Failed to fetch poster for ${item.title}:`, error);
          }
        })
      );

      // Update watchlist with fetched posters
      if (Object.keys(updates).length > 0) {
        setWatchlist(prev =>
          prev.map(item =>
            updates[item.id] ? { ...item, poster_url: updates[item.id] } : item
          )
        );
      }
    };

    if (!loadingWatchlist && watchlist.length > 0) {
      fetchMissingPosters();
    }
  }, [watchlist.length, loadingWatchlist]);

  // Sports Watching state
  const [favoriteTeams, setFavoriteTeams] = useState<FavoriteTeam[]>([]);
  const [loadingTeamsFromDB, setLoadingTeamsFromDB] = useState(true);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [visibleGamesCount, setVisibleGamesCount] = useState(3); // Show 3 games initially
  const [majorEvents, setMajorEvents] = useState<MajorEvent[]>(mockMajorEvents);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [autoAddGamesToCalendar, setAutoAddGamesToCalendar] = useState(false);
  const [loadingPreference, setLoadingPreference] = useState(true);

  // Load favorite teams from database
  useEffect(() => {
    const loadFavoriteTeams = async () => {
      if (!user) {
        setLoadingTeamsFromDB(false);
        return;
      }

      try {
        const supabase = createClient();
        // Type assertion needed until Supabase types are regenerated after migration
        const { data, error } = await (supabase as any)
          .from('favorite_sports_teams')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading favorite teams:', error);
        } else if (data) {
          const teams: FavoriteTeam[] = data.map((row: any) => ({
            id: row.team_id,
            name: row.team_name,
            league: row.league,
            logo: row.logo_url,
            stadium: row.stadium,
          }));
          setFavoriteTeams(teams);
        }
      } catch (error) {
        console.error('Error loading favorite teams:', error);
      } finally {
        setLoadingTeamsFromDB(false);
      }
    };

    loadFavoriteTeams();
  }, [user]);

  // Fetch upcoming games for favorite teams
  useEffect(() => {
    const fetchUpcomingGames = async () => {
      if (favoriteTeams.length === 0) {
        setUpcomingGames([]);
        return;
      }

      setLoadingGames(true);
      setVisibleGamesCount(3); // Reset to 3 when fetching new games
      
      try {
        const allGames: Game[] = [];
        const favoriteIds = favoriteTeams.map(t => t.id);

        // Fetch next events for each favorite team
        await Promise.all(
          favoriteTeams.map(async (team) => {
            try {
              const res = await fetch(
                `/api/sports/teams?team_id=${team.id}&events=next&favorite_ids=${favoriteIds.join(',')}`
              );
              if (res.ok) {
                const data = await res.json();
                if (data.events && data.events.length > 0) {
                  // Map to our Game interface
                  data.events.forEach((event: any) => {
                    // Convert IDs to strings for comparison (TheSportsDB returns numbers/strings inconsistently)
                    const teamIdStr = String(team.id);
                    const homeTeamIdStr = String(event.homeTeamId || '');
                    const awayTeamIdStr = String(event.awayTeamId || '');
                    
                    // Also check by team name (fallback for when IDs don't match)
                    const teamNameLower = team.name.toLowerCase();
                    const homeTeamLower = (event.homeTeam || '').toLowerCase();
                    const awayTeamLower = (event.awayTeam || '').toLowerCase();
                    
                    // Validate by ID first, then by name as fallback
                    const matchesById = homeTeamIdStr === teamIdStr || awayTeamIdStr === teamIdStr;
                    const matchesByName = homeTeamLower.includes(teamNameLower) || 
                                          awayTeamLower.includes(teamNameLower) ||
                                          teamNameLower.includes(homeTeamLower) ||
                                          teamNameLower.includes(awayTeamLower);
                    
                    const isActuallyThisTeamsGame = matchesById || matchesByName;
                    
                    // Only add if this team is playing and not a duplicate
                    if (isActuallyThisTeamsGame && !allGames.find(g => g.id === event.id)) {
                      allGames.push({
                        id: event.id,
                        homeTeam: event.homeTeam,
                        awayTeam: event.awayTeam,
                        homeTeamId: event.homeTeamId,
                        awayTeamId: event.awayTeamId,
                        date: new Date(event.date),
                        time: event.time,
                        league: event.league,
                        venue: event.venue,
                        isFavoriteTeamPlaying: true,
                        thumbnail: event.thumbnail,
                      });
                    }
                  });
                }
              }
            } catch (error) {
              console.error(`Failed to fetch games for ${team.name}:`, error);
            }
          })
        );

        // Sort by date
        allGames.sort((a, b) => a.date.getTime() - b.date.getTime());
        setUpcomingGames(allGames);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoadingGames(false);
      }
    };

    fetchUpcomingGames();
  }, [favoriteTeams]);
  
  // Games to display (limited by visibleGamesCount)
  const displayedGames = upcomingGames.slice(0, visibleGamesCount);
  const hasMoreGames = upcomingGames.length > visibleGamesCount;
  
  // Team selection dialog state
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [leagueTeams, setLeagueTeams] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  
  // Popular leagues for selection
  const popularLeagues = [
    { id: '4391', name: 'NFL', sport: 'American Football' },
    { id: '4387', name: 'NBA', sport: 'Basketball' },
    { id: '4424', name: 'MLB', sport: 'Baseball' },
    { id: '4380', name: 'NHL', sport: 'Ice Hockey' },
    { id: '4328', name: 'English Premier League', sport: 'Soccer' },
    { id: '4335', name: 'La Liga', sport: 'Soccer' },
    { id: '4331', name: 'Bundesliga', sport: 'Soccer' },
    { id: '4332', name: 'Serie A', sport: 'Soccer' },
    { id: '4334', name: 'Ligue 1', sport: 'Soccer' },
    { id: '4346', name: 'MLS', sport: 'Soccer' },
    { id: '4480', name: 'UEFA Champions League', sport: 'Soccer' },
  ];

  // Fetch teams when league is selected
  const fetchTeamsForLeague = async (leagueName: string) => {
    setLoadingTeams(true);
    try {
      const res = await fetch(`/api/sports/teams?league=${encodeURIComponent(leagueName)}`);
      if (res.ok) {
        const data = await res.json();
        setLeagueTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoadingTeams(false);
    }
  };

  // Handle league selection
  const handleLeagueSelect = (leagueName: string) => {
    setSelectedLeague(leagueName);
    setTeamSearchQuery('');
    fetchTeamsForLeague(leagueName);
  };

  // Filter teams by search query
  const filteredLeagueTeams = leagueTeams.filter(team => 
    team.strTeam?.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
    team.strAlternate?.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

  // Add team from API data and save to database
  const addTeamFromAPI = async (team: any) => {
    if (!user) {
      toast.error('Please log in to save favorite teams');
      return;
    }

    const newTeam: FavoriteTeam = {
      id: team.idTeam,
      name: team.strTeam,
      league: selectedLeague || team.strLeague,
      logo: team.strBadge,
      stadium: team.strStadium,
    };

    // Optimistically update UI
    setFavoriteTeams([...favoriteTeams, newTeam]);
    setIsAddingTeam(false);
    setSelectedLeague(null);
    setLeagueTeams([]);

    try {
      const supabase = createClient();
      // Type assertion needed until Supabase types are regenerated after migration
      const { error } = await (supabase as any)
        .from('favorite_sports_teams')
        .insert({
          user_id: user.id,
          team_id: team.idTeam,
          team_name: team.strTeam,
          league: selectedLeague || team.strLeague,
          logo_url: team.strBadge,
          stadium: team.strStadium,
        });

      if (error) {
        console.error('Error saving team:', error);
        // Rollback on error
        setFavoriteTeams(favoriteTeams);
        toast.error('Failed to save team');
        return;
      }

      toast.success(`Added ${team.strTeam} to favorites`);
    } catch (error) {
      console.error('Error saving team:', error);
      setFavoriteTeams(favoriteTeams);
      toast.error('Failed to save team');
    }
  };

  // Remove team and delete from database
  const removeTeam = async (teamId: string) => {
    if (!user) return;

    // Optimistically update UI
    const previousTeams = favoriteTeams;
    setFavoriteTeams(favoriteTeams.filter(t => t.id !== teamId));

    try {
      const supabase = createClient();
      // Type assertion needed until Supabase types are regenerated after migration
      const { error } = await (supabase as any)
        .from('favorite_sports_teams')
        .delete()
        .eq('user_id', user.id)
        .eq('team_id', teamId);

      if (error) {
        console.error('Error removing team:', error);
        setFavoriteTeams(previousTeams);
        toast.error('Failed to remove team');
      }
    } catch (error) {
      console.error('Error removing team:', error);
      setFavoriteTeams(previousTeams);
      toast.error('Failed to remove team');
    }
  };

  // Load auto-add preference
  useEffect(() => {
    const loadPreference = async () => {
      if (!user) {
        setLoadingPreference(false);
        return;
      }
      
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('user_preferences')
          .select('auto_add_sports_games_to_calendar')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading preference:', error);
        } else if (data) {
          // Type assertion needed until Supabase types are regenerated after migrations
          setAutoAddGamesToCalendar((data as any).auto_add_sports_games_to_calendar ?? false);
        }
      } catch (error) {
        console.error('Error loading preference:', error);
      } finally {
        setLoadingPreference(false);
      }
    };

    loadPreference();
  }, [user]);

  // Save auto-add preference
  const saveAutoAddPreference = async (value: boolean) => {
    if (!user) {
      toast.error('Please log in to save preferences');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          auto_add_sports_games_to_calendar: value,
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Error saving preference:', error);
        toast.error('Failed to save preference');
        return;
      }

      setAutoAddGamesToCalendar(value);
      toast.success(value ? 'Games will be automatically added to calendar' : 'Auto-add disabled');
    } catch (error) {
      console.error('Error saving preference:', error);
      toast.error('Failed to save preference');
    }
  };
  
  const [newItem, setNewItem] = useState<{
    title: string;
    type: WatchlistItem['type'];
    status: WatchlistItem['status'];
    tier: FilmTier | null;
    rating: number | null;
    tmdb_id: number | null;
    poster_url: string | null;
    franchise: string | null;
    genres: string[];
    release_year: number | null;
  }>({
    title: '',
    type: 'movie',
    status: 'want_to_watch',
    tier: null,
    rating: null,
    tmdb_id: null,
    poster_url: null,
    franchise: null,
    genres: [],
    release_year: null,
  });

  // Get unique franchises from watchlist
  const franchises = [...new Set(watchlist.filter(i => i.franchise).map(i => i.franchise!))];

  // Get unique genres from watchlist (simplified)
  const allGenres = new Set<string>();
  watchlist.forEach(item => {
    if (item.genres) {
      getSimplifiedGenres(item.genres).forEach(g => allGenres.add(g));
    }
  });
  const genres = Array.from(allGenres).sort();

  // Filter watchlist
  const filteredWatchlist = watchlist.filter(item => {
    if (filterTier !== 'all' && item.tier !== filterTier) return false;
    if (filterFranchise !== 'all' && item.franchise !== filterFranchise) return false;
    if (filterGenre !== 'all' && item.genres) {
      const simplifiedGenres = getSimplifiedGenres(item.genres);
      if (!simplifiedGenres.includes(filterGenre)) return false;
    }
    return true;
  });

  // Group by tier for display
  const groupedByTier = filteredWatchlist.reduce((acc, item) => {
    const tier = item.tier || 'unrated';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(item);
    return acc;
  }, {} as Record<string, WatchlistItem[]>);

  // Stats removed - not relevant for entertainment tracking

  // Debounced search
  const searchTMDB = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/films/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchTMDB(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchTMDB]);

  // Fetch providers when selecting a result
  const fetchProviders = async (tmdbId: number, type: 'movie' | 'series') => {
    setLoadingProviders(true);
    try {
      const tmdbType = type === 'series' ? 'tv' : 'movie';
      const res = await fetch(`/api/films/providers?tmdb_id=${tmdbId}&type=${tmdbType}&country=US`);
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers?.streaming || []);
      }
    } catch (error) {
      console.error('Fetch providers failed:', error);
    } finally {
      setLoadingProviders(false);
    }
  };

  const selectSearchResult = (result: TMDBSearchResult) => {
    setSelectedResult(result);
    setNewItem({
      title: result.title,
      type: result.type === 'movie' ? 'movie' : 'series',
      status: 'want_to_watch',
      tier: null,
      rating: null,
      tmdb_id: result.tmdbId,
      poster_url: result.posterUrl,
      franchise: result.franchise || null,
      genres: result.genres,
      release_year: result.releaseYear,
    });
    fetchProviders(result.tmdbId, result.type);
    setSearchResults([]);
    setSearchQuery('');
  };

  const addItem = async () => {
    if (!user) {
      toast.error('Please log in to add items to your watchlist');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      
      const insertData = {
        user_id: user.id,
      title: newItem.title,
      type: newItem.type,
      status: newItem.status,
      rating: newItem.rating,
      tier: newItem.tier,
      tmdb_id: newItem.tmdb_id,
      poster_url: newItem.poster_url,
      franchise: newItem.franchise,
      genres: newItem.genres,
      release_year: newItem.release_year,
      streaming_providers: providers.length > 0 ? { 
        flatrate: providers.map(p => ({ 
          provider_id: p.id, 
          provider_name: p.name, 
          logo_path: p.logoUrl,
          display_priority: 1 
        })) 
      } : null,
      notes: null,
      };

      const { data, error } = await supabase
        .from('watchlist')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error adding to watchlist:', error);
        toast.error('Failed to add to watchlist');
        return;
      }

      // Add the new item to local state
      // Type assertion needed until Supabase types are regenerated after migrations
      const dbData = data as any;
      const newWatchlistItem: WatchlistItem = {
        id: dbData.id,
        user_id: dbData.user_id,
        title: dbData.title,
        type: dbData.type,
        status: dbData.status,
        rating: dbData.rating,
        tier: dbData.tier,
        franchise: dbData.franchise,
        poster_url: dbData.poster_url,
        tmdb_id: dbData.tmdb_id,
        streaming_providers: dbData.streaming_providers,
        genres: dbData.genres,
        release_year: dbData.release_year,
        notes: dbData.notes,
        last_provider_check: dbData.last_provider_check,
        created_at: dbData.created_at,
      };

      setWatchlist([newWatchlistItem, ...watchlist]);
      toast.success(`Added "${newItem.title}" to your watchlist`);
    closeDialog();
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
    } finally {
      setIsSaving(false);
    }
  };

  const closeDialog = () => {
    setIsAddingItem(false);
    setSelectedResult(null);
    setSearchQuery('');
    setSearchResults([]);
    setProviders([]);
    setNewItem({
      title: '',
      type: 'movie',
      status: 'want_to_watch',
      tier: null,
      rating: null,
      tmdb_id: null,
      poster_url: null,
      franchise: null,
      genres: [],
      release_year: null,
    });
  };

  const renderStreamingBadges = (item: WatchlistItem) => {
    const providers = item.streaming_providers?.flatrate || [];
    if (providers.length === 0) return null;
    
    return (
      <div className="flex items-center gap-1 mt-1">
        {providers.slice(0, 3).map((provider: any, idx: number) => (
          <Badge 
            key={idx} 
            variant="outline" 
            className="text-xs px-1.5 py-0"
          >
            {provider.provider_name.replace(' Video', '').replace(' Plus', '+')}
          </Badge>
        ))}
      </div>
    );
  };

  const renderTierBadge = (tier: FilmTier | null | undefined) => {
    if (!tier) return null;
    const config = tierConfig[tier];
    const Icon = config.icon;
    return (
      <Badge 
        variant="secondary"
        className="font-semibold"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const renderWatchlistItem = (item: WatchlistItem, showStatus = true) => {
    const statusCfg = statusConfig[item.status as keyof typeof statusConfig];
    const StatusIcon = statusCfg.icon;
    
    return (
      <Card key={item.id} className="hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Poster placeholder or icon */}
            <div className="w-16 h-24 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {item.poster_url ? (
                <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" />
              ) : item.type === 'movie' ? (
                <Film className="h-8 w-8 text-purple-500" />
              ) : (
                <Tv className="h-8 w-8 text-purple-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium truncate">{item.title}</h4>
                  {item.release_year && (
                    <span className="text-xs text-muted-foreground">{item.release_year}</span>
                  )}
                </div>
                {item.rating && (
                  <span className="text-sm flex items-center gap-1 flex-shrink-0">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {item.rating}/10
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {item.type}
                </Badge>
                {renderTierBadge(item.tier)}
                {item.franchise && (
                  <Badge variant="outline" className="text-xs">
                    {franchiseLabels[item.franchise] || item.franchise}
                  </Badge>
                )}
                {/* Genre badges */}
                {item.genres && getSimplifiedGenres(item.genres).slice(0, 2).map((genre, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs text-muted-foreground">
                    {genre}
                  </Badge>
                ))}
                {showStatus && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: `${statusCfg.color}20`, color: statusCfg.color }}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusCfg.label}
                  </Badge>
                )}
              </div>
              
              {renderStreamingBadges(item)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AspectLayout
      aspectId="films"
      hideHeader
      onAddNew={() => setIsAddingItem(true)}
      addNewLabel="Add"
    >
      {/* Main Tabs - Primary Navigation */}
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 mb-4">
          <TabsTrigger value="library" className="text-sm font-medium">
            <Film className="h-4 w-4 mr-2" />
            Library
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="text-sm font-medium">
            <Bookmark className="h-4 w-4 mr-2" />
            Watchlist
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-sm font-medium">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Picks
          </TabsTrigger>
          <TabsTrigger value="sports" className="text-sm font-medium">
            <Trophy className="h-4 w-4 mr-2" />
            Sports
          </TabsTrigger>
        </TabsList>

        {/* Filters - shown for Library/Watchlist tabs */}
      <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap gap-2">
          <Select value={filterTier} onValueChange={(v) => setFilterTier(v as FilmTier | 'all')}>
              <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {Object.entries(tierConfig).map(([tier, config]) => (
                <SelectItem key={tier} value={tier}>
                  <span style={{ color: config.color }}>{config.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            
            <Select value={filterGenre} onValueChange={setFilterGenre}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {Object.keys(SIMPLIFIED_GENRES).map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterFranchise} onValueChange={setFilterFranchise}>
              <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Franchises" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Franchises</SelectItem>
              {franchises.map((f) => (
                <SelectItem key={f} value={f}>
                  {franchiseLabels[f] || f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* AI Data Sources - compact button that opens dialog */}
        <InsightPermissions
          aspect="films"
          enabledPlatforms={enabledPlatforms}
          onTogglePlatform={togglePlatform}
          hasClaudeCode={hasClaudeCode}
          compact
        />
      </div>

        <TabsContent value="library" className="mt-6">
          {loadingWatchlist ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredWatchlist.filter(i => i.status === 'watched').length === 0 ? (
            <EmptyState
              icon={Film}
              title="No watched titles yet"
              description="Start rating what you've watched to get better recommendations."
              actionLabel="Add Title"
              onAction={() => setIsAddingItem(true)}
            />
          ) : (
            <div className="space-y-6">
              {/* Group by tier */}
              {(['legendary', 'amazing', 'very_good', 'good', 'okay', 'not_good'] as const).map((tier) => {
                const items = groupedByTier[tier]?.filter((i: any) => i.status === 'watched') || [];
                if (items.length === 0) return null;
                
                const config = tierConfig[tier as FilmTier];
                return (
                  <div key={tier}>
                    <h3 
                      className="text-sm font-semibold mb-3 flex items-center gap-2"
                      style={{ color: config.color }}
                    >
                      <config.icon className="h-4 w-4" />
                      {config.label} ({items.length})
                    </h3>
                    <div className="space-y-3">
                      {items.map((item: any) => renderWatchlistItem(item, false))}
                    </div>
                  </div>
                );
              })}
              
              {/* Unrated */}
              {groupedByTier['unrated']?.filter((i: any) => i.status === 'watched').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                    Unrated ({groupedByTier['unrated'].filter((i: any) => i.status === 'watched').length})
                  </h3>
                  <div className="space-y-3">
                    {groupedByTier['unrated'].filter((i: any) => i.status === 'watched').map((item: any) => 
                      renderWatchlistItem(item, false)
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="watchlist" className="mt-6">
          {loadingWatchlist ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredWatchlist.filter((i) => i.status !== 'watched').length === 0 ? (
            <EmptyState
              icon={Film}
              title="Your watchlist is empty"
              description="Add movies and series you want to watch."
              actionLabel="Add Title"
              onAction={() => setIsAddingItem(true)}
            />
          ) : (
            <div className="space-y-4">
              {filteredWatchlist
                .filter((i) => i.status !== 'watched')
                .map((item) => renderWatchlistItem(item))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <div className="mb-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-400">AI-Powered Recommendations</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on your library, ratings, and viewing patterns
            </p>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const tierCfg = tierConfig[rec.predictedTier];
              return (
                <Card key={index} className="hover:border-primary/50 transition-colors overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Poster */}
                      <div className="w-16 h-24 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {rec.posterUrl ? (
                          <img src={rec.posterUrl} alt={rec.title} className="w-full h-full object-cover" />
                        ) : rec.type === 'movie' ? (
                          <Film className="h-8 w-8 text-violet-500" />
                        ) : (
                          <Tv className="h-8 w-8 text-violet-500" />
                      )}
                    </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium">{rec.title}</h4>
                          <Badge 
                            variant="secondary" 
                            className="text-xs flex-shrink-0"
                            style={{ backgroundColor: `${tierCfg.color}20`, color: tierCfg.color }}
                          >
                            {rec.confidence}% match
                          </Badge>
                    </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {rec.type}
                          </Badge>
                          {/* Predicted tier */}
                          <Badge 
                            variant="secondary"
                            className="text-xs font-medium"
                            style={{ backgroundColor: tierCfg.bgColor, color: tierCfg.color }}
                          >
                            <tierCfg.icon className="h-3 w-3 mr-1" />
                            Predicted: {tierCfg.label}
                          </Badge>
                          {/* Genre badges */}
                          {rec.genres.map((genre, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                    <Button
                      size="sm"
                        className="flex-shrink-0"
                      onClick={() => {
                        setSearchQuery(rec.title);
                        setIsAddingItem(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="sports" className="mt-6">
          <div className="space-y-6">
            {/* Favorite Teams Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Favorite Teams</h3>
                <div className="flex items-center gap-4">
                  <Button size="sm" onClick={() => setIsAddingTeam(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Team
                  </Button>
                  <div className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={autoAddGamesToCalendar}
                      onCheckedChange={saveAutoAddPreference}
                      disabled={loadingPreference}
                    />
                    <span className="text-muted-foreground whitespace-nowrap">Auto-add to calendar</span>
                  </div>
                </div>
              </div>
              {favoriteTeams.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No favorite teams yet"
                  description="Follow your favorite teams to see their games and schedules."
                  actionLabel="Add Team"
                  onAction={() => setIsAddingTeam(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteTeams.map((team) => (
                    <Card key={team.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {team.logo ? (
                              <img 
                                src={team.logo} 
                                alt={team.name}
                                className="w-10 h-10 rounded-full object-contain bg-white"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium">{team.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {team.league}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTeam(team.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
                </div>
              )}
            </div>

            {/* Upcoming Games Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upcoming Games</h3>
                {loadingGames && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {loadingGames ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : upcomingGames.length === 0 ? (
                <EmptyState
                  icon={CalendarIcon}
                  title={favoriteTeams.length === 0 ? "No favorite teams" : "No upcoming games found"}
                  description={favoriteTeams.length === 0 
                    ? "Follow teams to see their upcoming games." 
                    : "No scheduled games for your teams at the moment."}
                  actionLabel="Add Team"
                  onAction={() => setIsAddingTeam(true)}
                />
              ) : (
                <div className="space-y-3">
                  {displayedGames.map((game) => (
                    <Card key={game.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {game.league}
                              </Badge>
                              {game.isFavoriteTeamPlaying && (
                                <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                                  <Heart className="h-3 w-3 mr-1" />
                                  Favorite
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium mb-1">
                              {game.awayTeam} @ {game.homeTeam}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {format(game.date, 'MMM d, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {game.time}
                              </span>
                              {game.venue && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {game.venue}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedGame(game);
                                setIsAddingToCalendar(true);
                              }}
                            >
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              Calendar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600/50 hover:bg-green-600/10"
                              onClick={() => {
                                // Dispatch event to open chat with ticket search prompt
                                const prompt = `Find tickets for ${game.awayTeam} vs ${game.homeTeam} on ${format(game.date, 'MMMM d, yyyy')} at ${game.venue || 'their stadium'}`;
                                window.dispatchEvent(new CustomEvent('open-chat', { 
                                  detail: { prompt }
                                }));
                                toast.info('Opening ticket search in AI assistant...');
                              }}
                            >
                              <Ticket className="h-4 w-4 mr-1" />
                              Tickets
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Load More button */}
                  {hasMoreGames && (
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => setVisibleGamesCount(prev => prev + 5)}
                    >
                      Load More ({upcomingGames.length - visibleGamesCount} remaining)
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Major Events Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Major Events</h3>
              </div>
              <div className="space-y-3">
                {mockMajorEvents.map((event) => (
                  <Card key={event.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {event.league}
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-700 dark:text-purple-400">
                              Major Event
                            </Badge>
                          </div>
                          <h4 className="font-medium mb-1">{event.name}</h4>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            {format(event.date, 'MMMM d, yyyy')}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/calendar-chat', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    messages: [{
                                      role: 'user',
                                      content: `Add "${event.name}" to my calendar on ${format(event.date, 'yyyy-MM-dd')} as a personal event in the films aspect`,
                                    }],
                                  }),
                                });
                                if (response.ok) {
                                  toast.success(`Added ${event.name} to calendar`);
                                }
                              } catch (error) {
                                console.error('Failed to add to calendar:', error);
                                toast.error('Failed to add to calendar');
                              }
                            }}
                          >
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Calendar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600/50 hover:bg-green-600/10"
                            onClick={() => {
                              const prompt = `Find tickets for ${event.name} on ${format(event.date, 'MMMM d, yyyy')}`;
                              window.dispatchEvent(new CustomEvent('open-chat', { 
                                detail: { prompt }
                              }));
                              toast.info('Opening ticket search in AI assistant...');
                            }}
                          >
                            <Ticket className="h-4 w-4 mr-1" />
                            Tickets
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Movie or Series</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Search */}
            {!selectedResult && (
              <div className="space-y-2">
                <Label>Search Movies & Series</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search TMDB..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                  )}
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <ScrollArea className="h-64 rounded-md border">
                    <div className="p-2 space-y-2">
                      {searchResults.map((result) => (
                        <button
                          key={result.tmdbId}
                          onClick={() => selectSearchResult(result)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent text-left transition-colors"
                        >
                          <div className="w-10 h-14 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {result.posterUrl ? (
                              <img src={result.posterUrl} alt="" className="w-full h-full object-cover" />
                            ) : result.type === 'movie' ? (
                              <Film className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Tv className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{result.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {result.releaseYear} • {result.type} • ★ {result.rating}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                
                {/* Manual entry option */}
                <p className="text-xs text-muted-foreground text-center py-2">
                  Or enter manually below
                </p>
              </div>
            )}

            {/* Selected result preview */}
            {selectedResult && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                <div className="w-12 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {selectedResult.posterUrl ? (
                    <img src={selectedResult.posterUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Film className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedResult.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedResult.releaseYear} • {selectedResult.type}
                  </p>
                  {selectedResult.franchise && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {franchiseLabels[selectedResult.franchise] || selectedResult.franchise}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedResult(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Title (for manual entry) */}
            {!selectedResult && (
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Movie or series name"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>
            )}

            {/* Streaming availability */}
            {(providers.length > 0 || loadingProviders) && (
              <div className="space-y-2">
                <Label>Available on</Label>
                <div className="flex flex-wrap gap-2">
                  {loadingProviders ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    providers.map((p) => (
                      <Badge key={p.id} variant="secondary">
                        {p.name}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                {(['movie', 'series', 'documentary'] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    size="sm"
                    variant={newItem.type === type ? 'default' : 'outline'}
                    onClick={() => setNewItem({ ...newItem, type })}
                  >
                    {type === 'movie' && <Film className="h-4 w-4 mr-1" />}
                    {type === 'series' && <Tv className="h-4 w-4 mr-1" />}
                    {type === 'documentary' && <Film className="h-4 w-4 mr-1" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant={newItem.status === status ? 'default' : 'outline'}
                      className="flex-1"
                      style={newItem.status === status ? { backgroundColor: config.color } : undefined}
                      onClick={() => setNewItem({ ...newItem, status: status as WatchlistItem['status'] })}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Tier */}
            <div className="space-y-2">
              <Label>Your Rating Tier</Label>
              <Select 
                value={newItem.tier || ''} 
                onValueChange={(v) => setNewItem({ ...newItem, tier: v as FilmTier || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tierConfig).map(([tier, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={tier} value={tier}>
                        <span className="flex items-center gap-2" style={{ color: config.color }}>
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={addItem}
              disabled={isSaving || (!newItem.title.trim() && !selectedResult)}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
              <Plus className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Team Dialog */}
      <Dialog open={isAddingTeam} onOpenChange={(open) => {
        setIsAddingTeam(open);
        if (!open) {
          setSelectedLeague(null);
          setLeagueTeams([]);
          setTeamSearchQuery('');
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedLeague ? `Select Team - ${selectedLeague}` : 'Follow a Team'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!selectedLeague ? (
              /* Step 1: Select League */
              <div className="space-y-2">
                <Label>Select a League</Label>
                <div className="grid grid-cols-2 gap-2">
                  {popularLeagues.map((league) => (
                    <button
                      key={league.id}
                      onClick={() => handleLeagueSelect(league.name)}
                      className="flex flex-col items-start p-3 rounded-lg border hover:bg-accent text-left transition-colors"
                    >
                      <span className="font-medium text-sm">{league.name}</span>
                      <span className="text-xs text-muted-foreground">{league.sport}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Step 2: Select Team from League */
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedLeague(null);
                    setLeagueTeams([]);
                    setTeamSearchQuery('');
                  }}
                  className="mb-2"
                >
                  ← Back to Leagues
                </Button>
                
                {/* Search within league */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teams..."
                    value={teamSearchQuery}
                    onChange={(e) => setTeamSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                {loadingTeams ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ScrollArea className="h-72 rounded-md border">
                    <div className="p-2 space-y-2">
                      {filteredLeagueTeams.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No teams found
                        </p>
                      ) : (
                        filteredLeagueTeams
                          .filter(team => !favoriteTeams.find(ft => ft.id === team.idTeam))
                          .map((team) => (
                            <button
                              key={team.idTeam}
                              onClick={() => addTeamFromAPI(team)}
                              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent text-left transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {team.strBadge ? (
                                  <img 
                                    src={team.strBadge} 
                                    alt={team.strTeam}
                                    className="w-10 h-10 rounded-full object-contain bg-white"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{team.strTeam}</p>
                                  {team.strStadium && (
                                    <p className="text-xs text-muted-foreground">{team.strStadium}</p>
                                  )}
                                </div>
                              </div>
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </button>
                          ))
                      )}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Game to Calendar Dialog */}
      <Dialog open={isAddingToCalendar && selectedGame !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddingToCalendar(false);
          setSelectedGame(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Game to Calendar</DialogTitle>
          </DialogHeader>
          {selectedGame && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-accent/50">
                <h4 className="font-medium mb-2">
                  {selectedGame.awayTeam} @ {selectedGame.homeTeam}
                </h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(selectedGame.date, 'MMMM d, yyyy')} at {selectedGame.time}
                  </div>
                  {selectedGame.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedGame.venue}
                    </div>
                  )}
                  <Badge variant="secondary" className="mt-2">
                    {selectedGame.league}
                  </Badge>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
                onClick={async () => {
                  if (!selectedGame || !user) return;
                  
                  try {
                    // Format date and time for calendar
                    const [time, period] = selectedGame.time.split(' ');
                    const [hours, minutes] = time.split(':');
                    let hour24 = parseInt(hours);
                    if (period === 'PM' && hour24 !== 12) hour24 += 12;
                    if (period === 'AM' && hour24 === 12) hour24 = 0;
                    
                    const eventDate = new Date(selectedGame.date);
                    eventDate.setHours(hour24, parseInt(minutes), 0, 0);
                    const endDate = new Date(eventDate);
                    endDate.setHours(endDate.getHours() + 3); // Assume 3 hour game
                    
                    const response = await fetch('/api/calendar-chat', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        messages: [{
                          role: 'user',
                          content: `Add "${selectedGame.awayTeam} @ ${selectedGame.homeTeam}" to my calendar on ${format(eventDate, 'yyyy-MM-dd')} at ${format(eventDate, 'HH:mm')} as a personal event in the films aspect. Location: ${selectedGame.venue || 'TBD'}. Description: ${selectedGame.league} game.`,
                        }],
                      }),
                    });
                    
                    if (response.ok) {
                      alert(`Added ${selectedGame.awayTeam} @ ${selectedGame.homeTeam} to calendar`);
                      setIsAddingToCalendar(false);
                      setSelectedGame(null);
                    } else {
                      const error = await response.json();
                      console.error('Failed to add to calendar:', error);
                      alert('Failed to add to calendar. Please try again.');
                    }
                  } catch (error) {
                    console.error('Failed to add to calendar:', error);
                    alert('Failed to add to calendar. Please try again.');
                  }
                }}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}
