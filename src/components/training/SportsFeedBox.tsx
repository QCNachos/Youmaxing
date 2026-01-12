'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Trophy,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';

interface UpcomingGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: Date;
  time: string;
  league: string;
  venue: string | null;
}

// Mock data - in production this would come from the sports API
const mockUpcomingGames: UpcomingGame[] = [
  {
    id: '1',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    date: new Date(Date.now() + 86400000), // Tomorrow
    time: '7:30 PM',
    league: 'NBA',
    venue: 'Crypto.com Arena',
  },
  {
    id: '2',
    homeTeam: 'Cowboys',
    awayTeam: 'Eagles',
    date: new Date(Date.now() + 172800000), // Day after tomorrow
    time: '4:25 PM',
    league: 'NFL',
    venue: 'AT&T Stadium',
  },
  {
    id: '3',
    homeTeam: 'Man United',
    awayTeam: 'Liverpool',
    date: new Date(Date.now() + 259200000), // 3 days
    time: '3:00 PM',
    league: 'Premier League',
    venue: 'Old Trafford',
  },
];

interface SportsFeedBoxProps {
  onNavigateToSports?: () => void;
  compact?: boolean;
}

export function SportsFeedBox({ onNavigateToSports, compact = false }: SportsFeedBoxProps) {
  const { theme } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [games, setGames] = useState<UpcomingGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - in production, fetch from /api/sports/upcoming
    const fetchGames = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/sports/upcoming');
        // const data = await response.json();
        // setGames(data.games);
        
        // Using mock data for now
        await new Promise(resolve => setTimeout(resolve, 500));
        setGames(mockUpcomingGames);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const formatGameDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM d');
  };

  const getLeagueColor = (league: string) => {
    const colors: Record<string, string> = {
      NBA: '#C8102E',
      NFL: '#013369',
      'Premier League': '#3D195B',
      NHL: '#000000',
      MLB: '#002D72',
    };
    return colors[league] || '#6366F1';
  };

  if (loading) {
    return (
      <Card className={cn(compact && "border-dashed")}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (games.length === 0) {
    return null; // Don't show if no upcoming games
  }

  if (compact) {
    return (
      <Card className="border-dashed hover:border-solid transition-all cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                theme === 'light' ? "bg-yellow-100" : "bg-yellow-500/20"
              )}>
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className={cn(
                  "font-medium text-sm",
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  {games.length} Upcoming Games
                </p>
                <p className={cn(
                  "text-xs",
                  theme === 'light' ? "text-slate-500" : "text-white/60"
                )}>
                  From your favorite teams
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {isExpanded && (
            <div className="mt-4 space-y-3 pt-4 border-t">
              {games.slice(0, 3).map((game) => (
                <div
                  key={game.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg",
                    theme === 'light' ? "bg-slate-50" : "bg-white/5"
                  )}
                >
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      theme === 'light' ? "text-slate-900" : "text-white"
                    )}>
                      {game.homeTeam} vs {game.awayTeam}
                    </p>
                    <p className={cn(
                      "text-xs",
                      theme === 'light' ? "text-slate-500" : "text-white/60"
                    )}>
                      {formatGameDate(game.date)} at {game.time}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    style={{ backgroundColor: `${getLeagueColor(game.league)}20`, color: getLeagueColor(game.league) }}
                  >
                    {game.league}
                  </Badge>
                </div>
              ))}
              {onNavigateToSports && (
                <Button
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToSports();
                  }}
                >
                  View All in Sports
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "flex items-center gap-2 text-lg",
            theme === 'light' ? "text-slate-900" : "text-white"
          )}>
            <Trophy className="h-5 w-5 text-yellow-500" />
            Upcoming Games
          </CardTitle>
          {onNavigateToSports && (
            <Button variant="ghost" size="sm" onClick={onNavigateToSports}>
              View All
              <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {games.map((game) => (
            <div
              key={game.id}
              className={cn(
                "p-3 rounded-xl transition-colors",
                theme === 'light' ? "bg-slate-50 hover:bg-slate-100" : "bg-white/5 hover:bg-white/10"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    style={{ backgroundColor: `${getLeagueColor(game.league)}20`, color: getLeagueColor(game.league) }}
                  >
                    {game.league}
                  </Badge>
                  <span className={cn(
                    "text-sm",
                    theme === 'light' ? "text-slate-500" : "text-white/60"
                  )}>
                    {formatGameDate(game.date)}
                  </span>
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  theme === 'light' ? "text-slate-700" : "text-white/80"
                )}>
                  {game.time}
                </span>
              </div>
              
              <p className={cn(
                "font-semibold text-lg",
                theme === 'light' ? "text-slate-900" : "text-white"
              )}>
                {game.homeTeam} vs {game.awayTeam}
              </p>
              
              {game.venue && (
                <p className={cn(
                  "text-sm flex items-center gap-1 mt-1",
                  theme === 'light' ? "text-slate-500" : "text-white/60"
                )}>
                  <MapPin className="h-3 w-3" />
                  {game.venue}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

