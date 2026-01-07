'use client';

import { useState, useEffect, useCallback } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  Zap,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import type { AIRecommendation, AspectType } from '@/types/database';

interface RecommendationFeedProps {
  aspect?: AspectType;
  limit?: number;
  showHeader?: boolean;
  onNavigateToAspect?: (aspect: AspectType) => void;
}

export function RecommendationFeed({ 
  aspect, 
  limit = 10, 
  showHeader = true,
  onNavigateToAspect,
}: RecommendationFeedProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'trending' | 'personal'>('all');
  const { setCurrentAspect } = useAppStore();

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (aspect) params.set('aspect', aspect);
      params.set('limit', String(limit));

      const response = await fetch(`/api/recommendations?${params}`);
      const data = await response.json();

      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [aspect, limit]);

  // Generate new recommendations
  const generateNewRecommendations = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        // Refresh the list
        await fetchRecommendations();
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Mark as acted on
  const handleAction = async (id: string) => {
    try {
      await fetch('/api/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, acted_on: true }),
      });

      setRecommendations(prev => 
        prev.map(r => r.id === id ? { ...r, acted_on: true } : r)
      );
    } catch (error) {
      console.error('Failed to mark as acted on:', error);
    }
  };

  // Dismiss recommendation
  const handleDismiss = async (id: string) => {
    try {
      await fetch('/api/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, dismissed: true }),
      });

      setRecommendations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to dismiss:', error);
    }
  };

  // Handle navigation to aspect
  const handleNavigate = (aspectId: AspectType) => {
    if (onNavigateToAspect) {
      onNavigateToAspect(aspectId);
    } else {
      setCurrentAspect(aspectId);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'all') return true;
    if (filter === 'trending') return rec.source === 'twitter_trend' || rec.action_type === 'trending';
    if (filter === 'personal') return rec.source === 'user_data';
    return true;
  });

  // Stats
  const trendingCount = recommendations.filter(r => r.source === 'twitter_trend').length;
  const urgentCount = recommendations.filter(r => r.priority === 'urgent' || r.priority === 'high').length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {showHeader && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                AI Insights
              </CardTitle>
              <CardDescription>
                Personalized recommendations powered by trends & your data
              </CardDescription>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateNewRecommendations}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              {isRefreshing ? 'Generating...' : 'Refresh'}
            </Button>
          </div>

          {/* Stats & Filters */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-3">
              {trendingCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3 text-sky-500" />
                  {trendingCount} trending
                </Badge>
              )}
              {urgentCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Zap className="h-3 w-3 text-orange-500" />
                  {urgentCount} priority
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-muted-foreground mr-1" />
              {(['all', 'trending', 'personal'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={cn("space-y-4", !showHeader && "pt-4")}>
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'No recommendations yet. Click refresh to generate some!'
                : `No ${filter} recommendations at the moment.`}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={generateNewRecommendations}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Generate Insights
            </Button>
          </div>
        ) : (
          filteredRecommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onAction={handleAction}
              onDismiss={handleDismiss}
              onClick={handleNavigate}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}











