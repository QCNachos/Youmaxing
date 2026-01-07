'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Music as MusicIcon,
  Disc3,
  ListMusic,
  Loader2,
  ExternalLink,
  Crown,
  Sparkles,
  ThumbsUp,
  Meh,
  ThumbsDown,
  X,
  Play,
  Link2,
} from 'lucide-react';
import type { MusicLibraryItem, FilmTier } from '@/types/database';

// Tier configuration (shared with Films)
const tierConfig: Record<FilmTier, { label: string; color: string; bgColor: string; icon: typeof Crown }> = {
  legendary: { label: 'LEGENDARY', color: '#FFD700', bgColor: '#FFD70020', icon: Crown },
  amazing: { label: 'AMAZING', color: '#C0C0C0', bgColor: '#C0C0C020', icon: Sparkles },
  very_good: { label: 'VERY GOOD', color: '#CD7F32', bgColor: '#CD7F3220', icon: ThumbsUp },
  good: { label: 'GOOD', color: '#22C55E', bgColor: '#22C55E20', icon: ThumbsUp },
  okay: { label: 'OKAY', color: '#3B82F6', bgColor: '#3B82F620', icon: Meh },
  not_good: { label: 'NOT GOOD', color: '#F97316', bgColor: '#F9731620', icon: ThumbsDown },
  not_interested: { label: 'NOT INTERESTED', color: '#6B7280', bgColor: '#6B728020', icon: X },
};

// Mock data
const mockLibrary: MusicLibraryItem[] = [
  {
    id: '1',
    user_id: '1',
    spotify_id: '3n3Ppam7vgaVa1iaRUc9Lp',
    title: 'Mr. Brightside',
    artist: 'The Killers',
    album: 'Hot Fuss',
    type: 'track',
    tier: 'legendary',
    cover_url: null,
    preview_url: null,
    genres: ['rock', 'indie'],
    release_year: 2004,
    added_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    spotify_id: '4cOdK2wGLETKBW3PvgPWqT',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    type: 'track',
    tier: 'legendary',
    cover_url: null,
    preview_url: null,
    genres: ['rock', 'classic rock'],
    release_year: 1975,
    added_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    spotify_id: '1BxfuPKGuaTgP7aM0Bbdwr',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    type: 'track',
    tier: 'amazing',
    cover_url: null,
    preview_url: null,
    genres: ['pop', 'synth-pop'],
    release_year: 2020,
    added_at: new Date().toISOString(),
  },
];

interface MusicProps {
  isConnected?: boolean;
  onConnect?: () => void;
}

export function Music({ isConnected = false, onConnect }: MusicProps) {
  const { theme } = useAppStore();
  const [library, setLibrary] = useState<MusicLibraryItem[]>(mockLibrary);
  const [isConnecting, setIsConnecting] = useState(false);
  const [filterTier, setFilterTier] = useState<FilmTier | 'all'>('all');
  
  // Filter library
  const filteredLibrary = library.filter(item => {
    if (filterTier !== 'all' && item.tier !== filterTier) return false;
    return true;
  });
  
  // Group by tier
  const groupedByTier = filteredLibrary.reduce((acc, item) => {
    const tier = item.tier || 'unrated';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(item);
    return acc;
  }, {} as Record<string, MusicLibraryItem[]>);
  
  const stats = [
    { label: 'Tracks', value: library.filter(i => i.type === 'track').length },
    { label: 'Legendary', value: library.filter(i => i.tier === 'legendary').length },
    { label: 'Artists', value: new Set(library.map(i => i.artist)).size },
    { label: 'Genres', value: new Set(library.flatMap(i => i.genres || [])).size },
  ];
  
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/spotify/auth');
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to start Spotify auth:', error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const renderTierBadge = (tier: FilmTier | null) => {
    if (!tier) return null;
    const config = tierConfig[tier];
    const Icon = config.icon;
    return (
      <Badge 
        variant="secondary"
        className="font-semibold text-xs"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };
  
  const renderTrackItem = (item: MusicLibraryItem) => (
    <Card key={item.id} className="hover:border-primary/50 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Album art placeholder */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {item.cover_url ? (
              <img src={item.cover_url} alt={item.album || ''} className="w-full h-full object-cover" />
            ) : (
              <MusicIcon className="h-6 w-6 text-green-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-medium text-sm truncate",
              theme === 'light' ? "text-slate-900" : "text-white"
            )}>
              {item.title}
            </h4>
            <p className={cn(
              "text-xs truncate",
              theme === 'light' ? "text-slate-500" : "text-white/60"
            )}>
              {item.artist} • {item.album}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {renderTierBadge(item.tier)}
              {item.release_year && (
                <span className={cn(
                  "text-xs",
                  theme === 'light' ? "text-slate-500" : "text-white/60"
                )}>
                  {item.release_year}
                </span>
              )}
            </div>
          </div>
          
          {item.preview_url && (
            <Button size="sm" variant="ghost">
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  // Not connected state
  if (!isConnected) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-500/20">
            <MusicIcon className="h-7 w-7 text-green-500" />
          </div>
          <div>
            <h1 className={cn(
              "text-2xl font-bold",
              theme === 'light' ? "text-slate-900" : "text-white"
            )}>
              Music
            </h1>
            <p className={cn(
              "text-sm",
              theme === 'light' ? "text-slate-500" : "text-white/60"
            )}>
              Track your favorite music with Spotify
            </p>
          </div>
        </div>
        
        {/* Connect Card */}
        <Card className="border-dashed border-green-500/50">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <Disc3 className="h-10 w-10 text-green-500" />
            </div>
            <h3 className={cn(
              "text-xl font-semibold mb-2",
              theme === 'light' ? "text-slate-900" : "text-white"
            )}>
              Connect Your Spotify
            </h3>
            <p className={cn(
              "text-sm mb-6 max-w-md",
              theme === 'light' ? "text-slate-500" : "text-white/60"
            )}>
              Connect your Spotify account to import your library, rate your favorite tracks,
              and get personalized music recommendations.
            </p>
            <Button 
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              Connect Spotify
            </Button>
          </CardContent>
        </Card>
        
        {/* Preview of what they'll get */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <ListMusic className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className={cn(
                  "font-medium text-sm",
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  Import Library
                </h4>
                <p className={cn(
                  "text-xs",
                  theme === 'light' ? "text-slate-500" : "text-white/60"
                )}>
                  Sync your saved tracks and playlists
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Crown className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className={cn(
                  "font-medium text-sm",
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  Rate & Tier
                </h4>
                <p className={cn(
                  "text-xs",
                  theme === 'light' ? "text-slate-500" : "text-white/60"
                )}>
                  Organize music from LEGENDARY to meh
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-violet-500 mt-0.5" />
              <div>
                <h4 className={cn(
                  "font-medium text-sm",
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  Get Recommendations
                </h4>
                <p className={cn(
                  "text-xs",
                  theme === 'light' ? "text-slate-500" : "text-white/60"
                )}>
                  Discover new music you'll love
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Connected state
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-500/20">
            <MusicIcon className="h-7 w-7 text-green-500" />
          </div>
          <div>
            <h1 className={cn(
              "text-2xl font-bold",
              theme === 'light' ? "text-slate-900" : "text-white"
            )}>
              Music
            </h1>
            <p className={cn(
              "text-sm",
              theme === 'light' ? "text-slate-500" : "text-white/60"
            )}>
              Your music library
            </p>
          </div>
        </div>
        <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
          <Disc3 className="h-3 w-3 mr-1" />
          Spotify Connected
        </Badge>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <p className={cn(
                "text-sm",
                theme === 'light' ? "text-slate-500" : "text-white/60"
              )}>
                {stat.label}
              </p>
              <p className={cn(
                "text-2xl font-bold mt-1",
                theme === 'light' ? "text-slate-900" : "text-white"
              )}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Filters */}
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
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="recommendations">For You</TabsTrigger>
        </TabsList>
        
        <TabsContent value="library" className="mt-6">
          <div className="space-y-6">
            {/* Group by tier */}
            {(['legendary', 'amazing', 'very_good', 'good', 'okay'] as FilmTier[]).map((tier) => {
              const items = groupedByTier[tier] || [];
              if (items.length === 0) return null;
              
              const config = tierConfig[tier];
              return (
                <div key={tier}>
                  <h3 
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: config.color }}
                  >
                    <config.icon className="h-4 w-4" />
                    {config.label} ({items.length})
                  </h3>
                  <div className="space-y-2">
                    {items.map(renderTrackItem)}
                  </div>
                </div>
              );
            })}
            
            {/* Unrated */}
            {groupedByTier['unrated']?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  Unrated ({groupedByTier['unrated'].length})
                </h3>
                <div className="space-y-2">
                  {groupedByTier['unrated'].map(renderTrackItem)}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="playlists" className="mt-6">
          <Card className="border-dashed">
            <CardContent className="p-12 flex flex-col items-center text-center">
              <ListMusic className={cn(
                "h-12 w-12 mb-4",
                theme === 'light' ? "text-slate-400" : "text-white/40"
              )} />
              <h3 className={cn(
                "text-lg font-semibold mb-2",
                theme === 'light' ? "text-slate-900" : "text-white"
              )}>
                Your Playlists
              </h3>
              <p className={cn(
                "text-sm mb-4",
                theme === 'light' ? "text-slate-500" : "text-white/60"
              )}>
                Sync your Spotify playlists to rate and share them.
              </p>
              <Button variant="outline">
                <Loader2 className="h-4 w-4 mr-2" />
                Sync Playlists
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="mt-6">
          <Card className="border-violet-500/30 bg-violet-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-violet-500 mt-0.5" />
                <div>
                  <h4 className={cn(
                    "font-medium",
                    theme === 'light' ? "text-slate-900" : "text-white"
                  )}>
                    Personalized Recommendations
                  </h4>
                  <p className={cn(
                    "text-sm mt-1",
                    theme === 'light' ? "text-slate-600" : "text-white/70"
                  )}>
                    Based on your LEGENDARY tracks like "Mr. Brightside" and "Bohemian Rhapsody",
                    you might love classic rock anthems with strong vocals. More recommendations coming soon!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


