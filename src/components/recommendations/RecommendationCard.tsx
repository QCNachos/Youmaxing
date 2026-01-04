'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  X, 
  Check, 
  TrendingUp,
  Sparkles,
  Clock,
  ExternalLink,
  Twitter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aspects } from '@/lib/aspects';
import type { AIRecommendation, AspectType } from '@/types/database';

interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onAction?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onClick?: (aspect: AspectType) => void;
  compact?: boolean;
}

export function RecommendationCard({ 
  recommendation, 
  onAction, 
  onDismiss,
  onClick,
  compact = false,
}: RecommendationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  
  const aspect = aspects.find(a => a.id === recommendation.aspect);
  const isTrending = recommendation.source === 'twitter_trend' || recommendation.action_type === 'trending';
  
  const priorityStyles = {
    low: 'border-l-gray-400',
    medium: 'border-l-blue-500',
    high: 'border-l-orange-500',
    urgent: 'border-l-red-500 animate-pulse',
  };

  const actionTypeIcons = {
    info: Sparkles,
    action: ArrowRight,
    reminder: Clock,
    trending: TrendingUp,
  };

  const ActionIcon = actionTypeIcons[recommendation.action_type];

  const handleDismiss = async () => {
    setIsDismissing(true);
    await onDismiss?.(recommendation.id);
  };

  const handleAction = () => {
    onAction?.(recommendation.id);
    if (onClick && aspect) {
      onClick(aspect.id);
    }
  };

  if (compact) {
    return (
      <div 
        className={cn(
          'p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all cursor-pointer group',
          'border-l-4',
          priorityStyles[recommendation.priority],
          isDismissing && 'opacity-50 scale-95',
        )}
        onClick={handleAction}
      >
        <div className="flex items-start gap-2">
          {isTrending && (
            <Twitter className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{recommendation.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {recommendation.content}
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs flex-shrink-0"
            style={{ 
              backgroundColor: `${aspect?.color}20`, 
              color: aspect?.color 
            }}
          >
            {aspect?.name}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300 border-l-4',
        priorityStyles[recommendation.priority],
        isHovered && 'shadow-lg scale-[1.02]',
        isDismissing && 'opacity-50 scale-95',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Aspect indicator */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ 
                backgroundColor: `${aspect?.color}20`, 
                color: aspect?.color 
              }}
            >
              {aspect && <aspect.icon className="h-5 w-5" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-foreground">
                  {recommendation.title}
                </h4>
                
                {/* Source badge */}
                {isTrending && (
                  <Badge variant="outline" className="text-xs gap-1 text-sky-600 border-sky-200 bg-sky-50">
                    <Twitter className="h-3 w-3" />
                    Trending
                  </Badge>
                )}
                
                {/* Priority badge */}
                {recommendation.priority === 'urgent' && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    Urgent
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-1">
                {recommendation.content}
              </p>
              
              {/* Trend context */}
              {recommendation.trend_context && (
                <p className="text-xs text-muted-foreground mt-2 italic flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {recommendation.trend_context}
                </p>
              )}
            </div>
          </div>
          
          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <ActionIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground capitalize">
              {recommendation.action_type}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {recommendation.action_url && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                asChild
              >
                <a 
                  href={recommendation.action_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Learn more
                </a>
              </Button>
            )}
            
            <Button
              variant="default"
              size="sm"
              className="h-8"
              style={{ backgroundColor: aspect?.color }}
              onClick={handleAction}
            >
              <Check className="h-4 w-4 mr-1" />
              Got it
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}








