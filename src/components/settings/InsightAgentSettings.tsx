'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Shield,
  Clock,
  Zap,
  ChevronRight,
  AlertCircle,
  Check,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisPlatform } from '@/lib/insight-agent/types';

// Platform configurations with mini-app associations
export const PLATFORMS_CONFIG: Record<AnalysisPlatform, {
  name: string;
  icon: string;
  color: string;
  category: 'social' | 'entertainment' | 'productivity' | 'health' | 'finance';
  relatedAspects: string[]; // Which mini-apps this platform helps
  dataTypes: string[]; // What kind of data we extract
}> = {
  // Social
  facebook: { 
    name: 'Facebook', 
    icon: 'f', 
    color: '#1877F2', 
    category: 'social',
    relatedAspects: ['friends', 'family', 'events'],
    dataTypes: ['interests', 'events', 'social patterns'],
  },
  instagram: { 
    name: 'Instagram', 
    icon: 'IG', 
    color: '#E4405F', 
    category: 'social',
    relatedAspects: ['travel', 'food', 'friends'],
    dataTypes: ['visual interests', 'travel spots', 'food preferences'],
  },
  linkedin: { 
    name: 'LinkedIn', 
    icon: 'in', 
    color: '#0A66C2', 
    category: 'social',
    relatedAspects: ['business'],
    dataTypes: ['career interests', 'skills', 'industry trends'],
  },
  twitter: { 
    name: 'X/Twitter', 
    icon: 'X', 
    color: '#000000', 
    category: 'social',
    relatedAspects: ['business', 'events'],
    dataTypes: ['interests', 'news preferences'],
  },
  // Entertainment
  netflix: { 
    name: 'Netflix', 
    icon: 'N', 
    color: '#E50914', 
    category: 'entertainment',
    relatedAspects: ['films'],
    dataTypes: ['genres', 'viewing patterns', 'watch history'],
  },
  spotify: { 
    name: 'Spotify', 
    icon: '♪', 
    color: '#1DB954', 
    category: 'entertainment',
    relatedAspects: ['films'], // Music aspect when added
    dataTypes: ['music genres', 'listening habits', 'mood patterns'],
  },
  youtube: { 
    name: 'YouTube', 
    icon: '▶', 
    color: '#FF0000', 
    category: 'entertainment',
    relatedAspects: ['films', 'business'],
    dataTypes: ['content interests', 'learning topics'],
  },
  prime_video: { 
    name: 'Prime Video', 
    icon: 'P', 
    color: '#00A8E1', 
    category: 'entertainment',
    relatedAspects: ['films'],
    dataTypes: ['genres', 'watch history'],
  },
  // Productivity
  google_drive: { 
    name: 'Google Drive', 
    icon: '△', 
    color: '#4285F4', 
    category: 'productivity',
    relatedAspects: ['business'],
    dataTypes: ['work patterns', 'project types'],
  },
  google_calendar: { 
    name: 'Calendar', 
    icon: '📅', 
    color: '#4285F4', 
    category: 'productivity',
    relatedAspects: ['business', 'training', 'events'],
    dataTypes: ['schedule patterns', 'availability'],
  },
  gmail: { 
    name: 'Gmail', 
    icon: '✉', 
    color: '#EA4335', 
    category: 'productivity',
    relatedAspects: ['travel', 'finance', 'business'],
    dataTypes: ['subscriptions', 'travel bookings'],
  },
  notion: { 
    name: 'Notion', 
    icon: 'N', 
    color: '#000000', 
    category: 'productivity',
    relatedAspects: ['business'],
    dataTypes: ['productivity style', 'goals'],
  },
  // Health
  strava: { 
    name: 'Strava', 
    icon: 'S', 
    color: '#FC4C02', 
    category: 'health',
    relatedAspects: ['training'],
    dataTypes: ['workout types', 'fitness level', 'goals'],
  },
  myfitnesspal: { 
    name: 'MyFitnessPal', 
    icon: 'M', 
    color: '#0070F3', 
    category: 'health',
    relatedAspects: ['training', 'food'],
    dataTypes: ['diet preferences', 'nutrition goals'],
  },
  // Finance
  mint: { 
    name: 'Mint', 
    icon: '$', 
    color: '#00A86B', 
    category: 'finance',
    relatedAspects: ['finance'],
    dataTypes: ['spending patterns (high-level)', 'financial goals'],
  },
  robinhood: { 
    name: 'Robinhood', 
    icon: '🪶', 
    color: '#00C805', 
    category: 'finance',
    relatedAspects: ['finance'],
    dataTypes: ['investment interest', 'risk tolerance'],
  },
};

// Get platforms relevant to a specific aspect
export function getPlatformsForAspect(aspect: string): AnalysisPlatform[] {
  return (Object.entries(PLATFORMS_CONFIG) as [AnalysisPlatform, typeof PLATFORMS_CONFIG[AnalysisPlatform]][])
    .filter(([_, config]) => config.relatedAspects.includes(aspect))
    .map(([platform]) => platform);
}

interface InsightAgentSettingsProps {
  userId: string;
}

export function InsightAgentSettings({ userId }: InsightAgentSettingsProps) {
  const [hasClaudeCode, setHasClaudeCode] = useState(false);
  const [enabledPlatforms, setEnabledPlatforms] = useState<AnalysisPlatform[]>([]);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [analyzeFrequency, setAnalyzeFrequency] = useState(7); // days
  const [privacyLevel, setPrivacyLevel] = useState<'minimal' | 'standard' | 'detailed'>('standard');
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  // Load settings from database
  useEffect(() => {
    // TODO: Load from supabase
  }, [userId]);

  const saveSettings = async () => {
    setLoading(true);
    // TODO: Save to supabase
    setTimeout(() => setLoading(false), 500);
  };

  const togglePlatform = (platform: AnalysisPlatform) => {
    setEnabledPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const clearAllData = async () => {
    if (confirm('Are you sure? This will delete all your insight data and reset recommendations.')) {
      // TODO: Clear data from supabase
    }
  };

  // Group platforms by category
  const platformsByCategory = Object.entries(PLATFORMS_CONFIG).reduce((acc, [id, config]) => {
    if (!acc[config.category]) acc[config.category] = [];
    acc[config.category].push({ id: id as AnalysisPlatform, ...config });
    return acc;
  }, {} as Record<string, Array<{ id: AnalysisPlatform } & typeof PLATFORMS_CONFIG[AnalysisPlatform]>>);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
          <Brain className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Insight Agent</h1>
          <p className="text-muted-foreground">
            Control how AI learns about your preferences
          </p>
        </div>
      </div>

      {/* Claude Code Status */}
      <Card className={cn(
        "border-2",
        hasClaudeCode ? "border-emerald-500/50 bg-emerald-500/5" : "border-amber-500/50 bg-amber-500/5"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className={cn("h-5 w-5", hasClaudeCode ? "text-emerald-500" : "text-amber-500")} />
              <div>
                <p className="font-medium">
                  {hasClaudeCode ? 'Claude Code Enabled' : 'Claude Code Not Set Up'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hasClaudeCode 
                    ? 'Automatic browser analysis is available'
                    : 'Enable for automatic data collection from your accounts'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={hasClaudeCode}
              onCheckedChange={setHasClaudeCode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Platform Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Permissions</CardTitle>
          <CardDescription>
            Choose which platforms the AI can analyze to improve recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {Object.entries(platformsByCategory).map(([category, platforms]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  {category.replace('_', ' ')}
                </h3>
                <div className="space-y-2">
                  {platforms.map((platform) => {
                    const isEnabled = enabledPlatforms.includes(platform.id);
                    
                    return (
                      <div
                        key={platform.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all",
                          isEnabled 
                            ? "border-primary/50 bg-primary/5" 
                            : "border-transparent bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: platform.color }}
                          >
                            {platform.icon}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {platform.dataTypes.slice(0, 2).join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {platform.relatedAspects.slice(0, 2).map(aspect => (
                              <Badge key={aspect} variant="outline" className="text-xs">
                                {aspect}
                              </Badge>
                            ))}
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => togglePlatform(platform.id)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Auto-Analysis Settings */}
      {hasClaudeCode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Automatic Analysis</CardTitle>
            <CardDescription>
              Let the AI periodically refresh your insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Auto-refresh insights</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically analyze enabled platforms
                  </p>
                </div>
              </div>
              <Switch
                checked={autoAnalyze}
                onCheckedChange={setAutoAnalyze}
              />
            </div>
            
            {autoAnalyze && (
              <div className="pl-8 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frequency</span>
                  <span className="font-medium">Every {analyzeFrequency} days</span>
                </div>
                <Slider
                  value={[analyzeFrequency]}
                  onValueChange={([v]) => setAnalyzeFrequency(v)}
                  min={1}
                  max={30}
                  step={1}
                  className="py-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Privacy Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Privacy Level</CardTitle>
          <CardDescription>
            Control how detailed insights should be
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'minimal', label: 'Minimal', desc: 'Only basic patterns' },
              { id: 'standard', label: 'Standard', desc: 'Balanced insights' },
              { id: 'detailed', label: 'Detailed', desc: 'Rich preferences' },
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => setPrivacyLevel(level.id as any)}
                className={cn(
                  "p-3 rounded-xl border-2 text-left transition-all",
                  privacyLevel === level.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/50 hover:bg-muted"
                )}
              >
                <p className="font-medium text-sm">{level.label}</p>
                <p className="text-xs text-muted-foreground">{level.desc}</p>
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Shield className="h-4 w-4 text-blue-500 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Regardless of level, we <strong>never</strong> store personal data, messages, or 
              specific content. Only derived patterns and preferences.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button 
            className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium text-sm">View My Insights</p>
                <p className="text-xs text-muted-foreground">See what the AI knows about you</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <button 
            className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium text-sm">Analysis History</p>
                <p className="text-xs text-muted-foreground">
                  {lastAnalysis ? `Last: ${lastAnalysis}` : 'No analyses yet'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <button 
            onClick={clearAllData}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium text-sm">Clear All Insight Data</p>
                <p className="text-xs opacity-70">Delete all insights and start fresh</p>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        className="w-full" 
        size="lg"
        onClick={saveSettings}
        disabled={loading}
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            Save Settings
          </>
        )}
      </Button>
    </div>
  );
}

export default InsightAgentSettings;


