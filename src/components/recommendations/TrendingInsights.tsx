'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Twitter, 
  ExternalLink,
  Flame,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aspects } from '@/lib/aspects';
import type { TwitterTrend, AspectType } from '@/types/database';

interface TrendingInsightsProps {
  limit?: number;
  aspectFilter?: AspectType;
  onTrendClick?: (trend: TwitterTrend) => void;
}

export function TrendingInsights({ 
  limit = 6, 
  aspectFilter,
  onTrendClick,
}: TrendingInsightsProps) {
  const [trends, setTrends] = useState<TwitterTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTrends = async (live = false) => {
    try {
      if (live) setIsRefreshing(true);
      
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      if (aspectFilter) params.set('aspect', aspectFilter);
      if (live) params.set('source', 'live');

      const response = await fetch(`/api/trends?${params}`);
      const data = await response.json();

      if (data.trends) {
        setTrends(data.trends);
      }
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [limit, aspectFilter]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      finance: '#22C55E',
      health: '#4ECDC4',
      tech: '#3B82F6',
      business: '#8B5CF6',
      lifestyle: '#F97316',
      entertainment: '#A855F7',
      sports: '#FFE66D',
      general: '#6B7280',
    };
    return colors[category] || colors.general;
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'finance' || category === 'business') return TrendingUp;
    if (category === 'health') return Flame;
    return Sparkles;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-sky-500/20">
                <Twitter className="h-4 w-4 text-sky-400" />
              </div>
              Trending Intelligence
            </CardTitle>
            <CardDescription className="text-slate-400">
              Early signals from X before they go mainstream
            </CardDescription>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-white/10"
            onClick={() => fetchTrends(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {trends.length === 0 ? (
          <div className="text-center py-8">
            <Twitter className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No trending topics available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trends.map((trend, index) => {
              const CategoryIcon = getCategoryIcon(trend.category);
              const color = getCategoryColor(trend.category);
              const relatedAspectConfigs = trend.related_aspects
                .map(a => aspects.find(asp => asp.id === a))
                .filter(Boolean);

              return (
                <button
                  key={trend.id || index}
                  onClick={() => onTrendClick?.(trend)}
                  className={cn(
                    'group relative p-4 rounded-xl text-left transition-all duration-300',
                    'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20',
                    'hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5',
                  )}
                >
                  {/* Emerging badge */}
                  {trend.is_emerging && (
                    <Badge 
                      className="absolute -top-2 -right-2 text-xs px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 border-0"
                    >
                      <Flame className="h-3 w-3 mr-1" />
                      Early
                    </Badge>
                  )}

                  {/* Category indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="p-1 rounded-md"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <CategoryIcon className="h-3 w-3" style={{ color }} />
                    </div>
                    <span 
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color }}
                    >
                      {trend.category}
                    </span>
                  </div>

                  {/* Topic name */}
                  <h3 className="font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                    {trend.topic}
                  </h3>

                  {/* Key insight */}
                  {trend.key_insights?.[0] && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {trend.key_insights[0]}
                    </p>
                  )}

                  {/* Related aspects */}
                  <div className="flex items-center gap-1 mt-3">
                    {relatedAspectConfigs.slice(0, 2).map((asp) => (
                      asp && (
                        <div
                          key={asp.id}
                          className="p-1 rounded-md"
                          style={{ backgroundColor: `${asp.color}20` }}
                          title={asp.name}
                        >
                          <asp.icon className="h-3 w-3" style={{ color: asp.color }} />
                        </div>
                      )
                    ))}
                    
                    {/* Relevance score */}
                    <div className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(trend.relevance_score)}%
                    </div>
                  </div>

                  {/* Hover arrow */}
                  <ArrowUpRight 
                    className="absolute top-4 right-4 h-4 w-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" 
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* Influential accounts teaser */}
        {trends.some(t => t.influential_accounts?.length > 0) && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Insights powered by: 
              <span className="text-slate-400">
                {Array.from(new Set(trends.flatMap(t => t.influential_accounts || []))).slice(0, 3).map(a => `@${a}`).join(', ')}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}











