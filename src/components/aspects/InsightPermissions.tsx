'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Brain,
  Settings,
  Check,
  X,
  Zap,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLATFORMS_CONFIG, getPlatformsForAspect } from '@/components/settings/InsightAgentSettings';
import type { AnalysisPlatform } from '@/lib/insight-agent/types';

interface InsightPermissionsProps {
  aspect: string;
  enabledPlatforms: AnalysisPlatform[];
  onTogglePlatform: (platform: AnalysisPlatform) => void;
  hasClaudeCode: boolean;
  compact?: boolean;
}

/**
 * Mini-app level permission controls for the Insight Agent.
 * Each mini-app shows only the platforms relevant to it.
 */
export function InsightPermissions({
  aspect,
  enabledPlatforms,
  onTogglePlatform,
  hasClaudeCode,
  compact = false,
}: InsightPermissionsProps) {
  const [open, setOpen] = useState(false);
  
  const relevantPlatforms = getPlatformsForAspect(aspect);
  const enabledCount = relevantPlatforms.filter(p => enabledPlatforms.includes(p)).length;
  
  // Compact version - just a button that opens dialog
  if (compact) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Brain className="h-4 w-4" />
            <span className="text-xs">
              {enabledCount}/{relevantPlatforms.length} sources
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-500" />
              Data Sources for {aspect.charAt(0).toUpperCase() + aspect.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Enable platforms to improve recommendations in this mini-app
            </DialogDescription>
          </DialogHeader>
          <InsightPermissionsContent 
            aspect={aspect}
            enabledPlatforms={enabledPlatforms}
            onTogglePlatform={onTogglePlatform}
            hasClaudeCode={hasClaudeCode}
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  // Full inline version
  return (
    <div className="p-4 rounded-xl border bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-medium">AI Data Sources</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {enabledCount}/{relevantPlatforms.length} enabled
        </Badge>
      </div>
      <InsightPermissionsContent 
        aspect={aspect}
        enabledPlatforms={enabledPlatforms}
        onTogglePlatform={onTogglePlatform}
        hasClaudeCode={hasClaudeCode}
      />
    </div>
  );
}

function InsightPermissionsContent({
  aspect,
  enabledPlatforms,
  onTogglePlatform,
  hasClaudeCode,
}: Omit<InsightPermissionsProps, 'compact'>) {
  const relevantPlatforms = getPlatformsForAspect(aspect);
  
  if (relevantPlatforms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No data sources configured for this aspect yet.
      </p>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Claude Code status */}
      {!hasClaudeCode && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Zap className="h-4 w-4 text-amber-500" />
          <p className="text-xs text-muted-foreground flex-1">
            Enable Claude Code in Settings for automatic analysis
          </p>
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            Setup
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
      
      {/* Platform list */}
      <div className="space-y-2">
        {relevantPlatforms.map((platformId) => {
          const platform = PLATFORMS_CONFIG[platformId];
          const isEnabled = enabledPlatforms.includes(platformId);
          
          return (
            <div
              key={platformId}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg transition-all",
                isEnabled ? "bg-primary/5" : "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: platform.color }}
                >
                  {platform.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{platform.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {platform.dataTypes.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={() => onTogglePlatform(platformId)}
                disabled={!hasClaudeCode}
              />
            </div>
          );
        })}
      </div>
      
      {/* Quick tip */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        The more sources enabled, the better recommendations you&apos;ll get
      </p>
    </div>
  );
}

/**
 * Simple status badge showing insight sources for a mini-app
 */
export function InsightSourcesBadge({
  aspect,
  enabledPlatforms,
  onClick,
}: {
  aspect: string;
  enabledPlatforms: AnalysisPlatform[];
  onClick?: () => void;
}) {
  const relevantPlatforms = getPlatformsForAspect(aspect);
  const enabledCount = relevantPlatforms.filter(p => enabledPlatforms.includes(p)).length;
  
  if (relevantPlatforms.length === 0) return null;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors",
        enabledCount > 0
          ? "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      <Brain className="h-3 w-3" />
      <span>{enabledCount}/{relevantPlatforms.length}</span>
    </button>
  );
}

export default InsightPermissions;



