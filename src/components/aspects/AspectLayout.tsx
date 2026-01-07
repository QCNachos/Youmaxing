'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Sparkles, TrendingUp } from 'lucide-react';
import { aspects } from '@/lib/aspects';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { AspectType } from '@/types/database';
import type { LucideIcon } from 'lucide-react';

interface AspectLayoutProps {
  aspectId: AspectType;
  children: React.ReactNode;
  stats?: { label: string; value: string | number; trend?: 'up' | 'down' }[];
  aiInsight?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
}

export function AspectLayout({
  aspectId,
  children,
  stats,
  aiInsight,
  onAddNew,
  addNewLabel = 'Add New',
}: AspectLayoutProps) {
  const { theme } = useAppStore();
  const aspect = aspects.find((a) => a.id === aspectId);
  if (!aspect) return null;

  const Icon = aspect.icon as LucideIcon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${aspect.color}20`, color: aspect.color }}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h1 className={cn(
              "text-2xl font-bold",
              theme === 'light' ? "text-slate-900" : "text-white"
            )}>
              {aspect.name}
            </h1>
            <p className={cn(
              "text-sm",
              theme === 'light' ? "text-slate-500" : "text-white/60"
            )}>
              {aspect.description}
            </p>
          </div>
        </div>
        {onAddNew && (
          <Button
            className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700"
            onClick={onAddNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            {addNewLabel}
          </Button>
        )}
      </div>

      {/* Stats Row */}
      {stats && stats.length > 0 && (
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
                <div className="flex items-center gap-2 mt-1">
                  <p className={cn(
                    "text-2xl font-bold",
                    theme === 'light' ? "text-slate-900" : "text-white"
                  )}>
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <TrendingUp
                      className={`h-4 w-4 ${
                        stat.trend === 'up' ? 'text-green-500' : 'text-red-500 rotate-180'
                      }`}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Insight */}
      {aiInsight && (
        <Card className="border-violet-500/30 bg-violet-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <p className="font-medium text-sm text-violet-400">AI Insight</p>
              <p className={cn(
                "text-sm mt-1",
                theme === 'light' ? "text-slate-600" : "text-white/70"
              )}>
                {aiInsight}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {children}
    </div>
  );
}

// Reusable empty state component
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const { theme } = useAppStore();
  
  return (
    <Card className="border-dashed">
      <CardContent className="p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Icon className={cn(
            "h-8 w-8",
            theme === 'light' ? "text-slate-400" : "text-white/40"
          )} />
        </div>
        <h3 className={cn(
          "text-lg font-semibold mb-2",
          theme === 'light' ? "text-slate-900" : "text-white"
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-sm mb-6 max-w-sm",
          theme === 'light' ? "text-slate-500" : "text-white/60"
        )}>
          {description}
        </p>
        <Button onClick={onAction}>
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

// Reusable item card component
interface ItemCardProps {
  title: string;
  subtitle?: string;
  badges?: { label: string; color?: string }[];
  metadata?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ItemCard({ title, subtitle, badges, metadata, onClick }: ItemCardProps) {
  const { theme } = useAppStore();
  
  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={cn(
              "font-medium",
              theme === 'light' ? "text-slate-900" : "text-white"
            )}>
              {title}
            </h4>
            {subtitle && (
              <p className={cn(
                "text-sm mt-1",
                theme === 'light' ? "text-slate-500" : "text-white/60"
              )}>
                {subtitle}
              </p>
            )}
            {badges && badges.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    style={badge.color ? {
                      backgroundColor: `${badge.color}20`,
                      color: badge.color,
                    } : undefined}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {metadata && (
            <span className={cn(
              "text-sm",
              theme === 'light' ? "text-slate-500" : "text-white/60"
            )}>
              {metadata}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



