'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Check,
  X,
  RefreshCw,
  Copy,
  ExternalLink,
  Sparkles,
  Zap,
  Info,
  Monitor,
  Cloud,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StreamingService, UserSyncPreferences } from '@/lib/streaming-sync/types';
import { generateSyncPrompt, generateBatchSyncPrompt } from '@/lib/streaming-sync/instructions';

// Service configurations with branding
const SERVICES: Record<StreamingService, {
  name: string;
  color: string;
  logo: string;
}> = {
  netflix: { name: 'Netflix', color: '#E50914', logo: 'N' },
  prime_video: { name: 'Prime Video', color: '#00A8E1', logo: 'P' },
  disney_plus: { name: 'Disney+', color: '#113CCF', logo: 'D+' },
  hbo_max: { name: 'Max', color: '#5822B4', logo: 'M' },
  hulu: { name: 'Hulu', color: '#1CE783', logo: 'H' },
  apple_tv: { name: 'Apple TV+', color: '#000000', logo: 'TV' },
  peacock: { name: 'Peacock', color: '#FDB415', logo: 'P' },
  paramount_plus: { name: 'Paramount+', color: '#0064FF', logo: 'P+' },
  crunchyroll: { name: 'Crunchyroll', color: '#F47521', logo: 'CR' },
};

interface StreamingSyncProps {
  userId: string;
  onSyncComplete?: () => void;
}

export function StreamingSync({ userId, onSyncComplete }: StreamingSyncProps) {
  const [preferences, setPreferences] = useState<UserSyncPreferences>({
    user_id: userId,
    has_claude_code: false,
    enabled_services: ['netflix', 'prime_video', 'disney_plus'],
    auto_sync: false,
    sync_frequency_days: 7,
  });
  
  const [syncStatus, setSyncStatus] = useState<Record<StreamingService, {
    last_sync?: string;
    items_synced?: number;
    syncing?: boolean;
  }>>({} as any);
  
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Load sync status
  useEffect(() => {
    async function loadSyncStatus() {
      try {
        const res = await fetch(`/api/streaming-sync?user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setSyncStatus(data.syncs || {});
        }
      } catch (error) {
        console.error('Failed to load sync status:', error);
      }
    }
    loadSyncStatus();
  }, [userId]);
  
  const toggleService = (service: StreamingService) => {
    setPreferences(prev => ({
      ...prev,
      enabled_services: prev.enabled_services.includes(service)
        ? prev.enabled_services.filter(s => s !== service)
        : [...prev.enabled_services, service],
    }));
  };
  
  const handleSyncWithClaudeCode = (services?: StreamingService[]) => {
    const servicesToSync = services || preferences.enabled_services;
    
    const prompt = servicesToSync.length === 1
      ? generateSyncPrompt(servicesToSync[0], userId)
      : generateBatchSyncPrompt(servicesToSync, userId);
    
    setCurrentPrompt(prompt);
    setShowPromptDialog(true);
  };
  
  const copyPrompt = async () => {
    await navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const formatLastSync = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="space-y-6">
      {/* Claude Code Setup */}
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-pink-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Claude Code Sync</CardTitle>
                <CardDescription>Sync using your logged-in streaming sessions</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">I have Claude Code</span>
              <Switch
                checked={preferences.has_claude_code}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, has_claude_code: checked }))
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferences.has_claude_code ? (
            <>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Claude Code Enabled
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can sync your streaming services using Claude&apos;s browser automation. 
                    No API keys or logins needed - it uses your existing sessions.
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
                onClick={() => handleSyncWithClaudeCode()}
                disabled={preferences.enabled_services.length === 0}
              >
                <Zap className="h-4 w-4 mr-2" />
                Sync All Enabled Services ({preferences.enabled_services.length})
              </Button>
            </>
          ) : (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Info className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Claude Code Not Enabled
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  If you have Claude Code (Claude with browser control), enable it above to 
                  automatically sync your streaming watchlists. Otherwise, you can use TMDB 
                  for availability info or add items manually.
                </p>
                <a 
                  href="https://claude.ai/code" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-violet-500 hover:underline mt-2 inline-flex items-center gap-1"
                >
                  Learn about Claude Code <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Streaming Services Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Streaming Services
          </CardTitle>
          <CardDescription>
            Select which services to sync
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(Object.entries(SERVICES) as [StreamingService, typeof SERVICES[StreamingService]][]).map(([id, service]) => {
              const isEnabled = preferences.enabled_services.includes(id);
              const status = syncStatus[id];
              
              return (
                <button
                  key={id}
                  onClick={() => toggleService(id)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all",
                    isEnabled
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: service.color }}
                    >
                      {service.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {status?.last_sync 
                          ? formatLastSync(status.last_sync)
                          : 'Not synced'
                        }
                      </p>
                    </div>
                    {isEnabled && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  
                  {/* Sync single service button (only show if Claude Code enabled) */}
                  {preferences.has_claude_code && isEnabled && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-2 h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSyncWithClaudeCode([id]);
                      }}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync Now
                    </Button>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Fallback Options */}
      {!preferences.has_claude_code && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Alternative Sync Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-sm">TMDB Integration</p>
                <p className="text-xs text-muted-foreground">
                  Get streaming availability using TMDB API
                </p>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600">
                <Check className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-sm">Manual Entry</p>
                <p className="text-xs text-muted-foreground">
                  Add items to your watchlist manually
                </p>
              </div>
              <Button size="sm" variant="outline">
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Sync Prompt Dialog */}
      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Claude Code Sync Instructions
            </DialogTitle>
            <DialogDescription>
              Copy these instructions and paste them into Claude Code. Make sure you&apos;re 
              logged into your streaming services in your browser.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={copyPrompt} className="flex-1">
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Instructions
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('https://claude.ai', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Claude
              </Button>
            </div>
            
            <ScrollArea className="h-[400px] rounded-lg border p-4 bg-muted/30">
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {currentPrompt}
              </pre>
            </ScrollArea>
            
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong>How it works:</strong> Claude Code will navigate to your streaming 
                services, read your watchlists using your existing login sessions, and 
                send the data back to Youmaxing. No passwords are ever shared.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StreamingSync;



