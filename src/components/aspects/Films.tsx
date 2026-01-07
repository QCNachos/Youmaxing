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
} from 'lucide-react';
import type { WatchlistItem, FilmTier } from '@/types/database';
import type { AnalysisPlatform } from '@/lib/insight-agent/types';
import { InsightPermissions, InsightSourcesBadge } from './InsightPermissions';

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

// Enhanced mock data with new fields
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
    poster_url: null,
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
    poster_url: null,
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
    poster_url: null,
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
    poster_url: null,
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
  { title: 'Shogun', type: 'series', reason: 'Based on your love for epic dramas like GoT' },
  { title: 'The Last Samurai', type: 'movie', reason: 'Similar to films you rated LEGENDARY' },
  { title: 'Foundation', type: 'series', reason: 'Epic sci-fi for Star Wars fans' },
];

export function Films() {
  const { theme } = useAppStore();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(mockWatchlist);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TMDBSearchResult | null>(null);
  const [providers, setProviders] = useState<StreamingProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [filterTier, setFilterTier] = useState<FilmTier | 'all'>('all');
  const [filterFranchise, setFilterFranchise] = useState<string | 'all'>('all');
  
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

  // Filter watchlist
  const filteredWatchlist = watchlist.filter(item => {
    if (filterTier !== 'all' && item.tier !== filterTier) return false;
    if (filterFranchise !== 'all' && item.franchise !== filterFranchise) return false;
    return true;
  });

  // Group by tier for display
  const groupedByTier = filteredWatchlist.reduce((acc, item) => {
    const tier = item.tier || 'unrated';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(item);
    return acc;
  }, {} as Record<string, WatchlistItem[]>);

  const stats = [
    { label: 'Watched', value: watchlist.filter((i) => i.status === 'watched').length },
    { label: 'Legendary', value: watchlist.filter((i) => i.tier === 'legendary').length },
    { label: 'Watchlist', value: watchlist.filter((i) => i.status === 'want_to_watch').length },
    { label: 'Franchises', value: franchises.length },
  ];

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

  const addItem = () => {
    const item: WatchlistItem = {
      id: Date.now().toString(),
      user_id: '1',
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
      last_provider_check: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setWatchlist([item, ...watchlist]);
    closeDialog();
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
      stats={stats}
      aiInsight="Based on your LEGENDARY ratings (GoT, LotR), you might love 'Shogun' - it's epic storytelling at its finest!"
      onAddNew={() => setIsAddingItem(true)}
      addNewLabel="Add to Watchlist"
    >
      {/* Filters & Data Sources */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex gap-2">
          <Select value={filterTier} onValueChange={(v) => setFilterTier(v as FilmTier | 'all')}>
            <SelectTrigger className="w-[140px]">
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
          
          <Select value={filterFranchise} onValueChange={setFilterFranchise}>
            <SelectTrigger className="w-[160px]">
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

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="recommendations">For You</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-6">
          {filteredWatchlist.filter(i => i.status === 'watched').length === 0 ? (
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
          {filteredWatchlist.filter((i) => i.status !== 'watched').length === 0 ? (
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
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                      {rec.type === 'movie' ? (
                        <Film className="h-6 w-6 text-violet-500" />
                      ) : (
                        <Tv className="h-6 w-6 text-violet-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    </div>
                    <Button
                      size="sm"
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
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add to Watchlist</DialogTitle>
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
              disabled={!newItem.title.trim() && !selectedResult}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Watchlist
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}
