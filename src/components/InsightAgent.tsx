'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  Check,
  X,
  Copy,
  ExternalLink,
  Sparkles,
  Zap,
  Info,
  Brain,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisPlatform, UserInsightProfile } from '@/lib/insight-agent/types';
import { generateAnalysisPrompt, PLATFORM_ANALYSIS } from '@/lib/insight-agent/analysis-prompts';

// Platform configurations
const PLATFORMS: Record<AnalysisPlatform, {
  name: string;
  icon: string;
  color: string;
  category: 'social' | 'entertainment' | 'productivity' | 'health' | 'finance';
}> = {
  // Social
  facebook: { name: 'Facebook', icon: 'f', color: '#1877F2', category: 'social' },
  instagram: { name: 'Instagram', icon: 'IG', color: '#E4405F', category: 'social' },
  linkedin: { name: 'LinkedIn', icon: 'in', color: '#0A66C2', category: 'social' },
  twitter: { name: 'X/Twitter', icon: 'X', color: '#000000', category: 'social' },
  // Entertainment
  netflix: { name: 'Netflix', icon: 'N', color: '#E50914', category: 'entertainment' },
  spotify: { name: 'Spotify', icon: '♪', color: '#1DB954', category: 'entertainment' },
  youtube: { name: 'YouTube', icon: '▶', color: '#FF0000', category: 'entertainment' },
  prime_video: { name: 'Prime Video', icon: 'P', color: '#00A8E1', category: 'entertainment' },
  // Productivity
  google_drive: { name: 'Google Drive', icon: '△', color: '#4285F4', category: 'productivity' },
  google_calendar: { name: 'Calendar', icon: '📅', color: '#4285F4', category: 'productivity' },
  gmail: { name: 'Gmail', icon: '✉', color: '#EA4335', category: 'productivity' },
  notion: { name: 'Notion', icon: 'N', color: '#000000', category: 'productivity' },
  // Health
  strava: { name: 'Strava', icon: 'S', color: '#FC4C02', category: 'health' },
  myfitnesspal: { name: 'MyFitnessPal', icon: 'M', color: '#0070F3', category: 'health' },
  // Finance
  mint: { name: 'Mint', icon: '$', color: '#00A86B', category: 'finance' },
  robinhood: { name: 'Robinhood', icon: '🪶', color: '#00C805', category: 'finance' },
};

const CATEGORY_LABELS = {
  social: 'Social Networks',
  entertainment: 'Entertainment',
  productivity: 'Productivity',
  health: 'Health & Fitness',
  finance: 'Finance',
};

interface InsightAgentProps {
  userId: string;
}

export function InsightAgent({ userId }: InsightAgentProps) {
  const [hasClaudeCode, setHasClaudeCode] = useState(false);
  const [enabledPlatforms, setEnabledPlatforms] = useState<AnalysisPlatform[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<Record<AnalysisPlatform, {
    lastAnalysis?: string;
    insightsCount?: number;
  }>>({} as any);
  const [profile, setProfile] = useState<UserInsightProfile | null>(null);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate overall insight strength
  const insightStrength = profile 
    ? Math.min(100, (profile.total_insights / 50) * 100)
    : 0;

  const togglePlatform = (platform: AnalysisPlatform) => {
    setEnabledPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const startAnalysis = () => {
    const apiEndpoint = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const prompt = generateAnalysisPrompt(userId, enabledPlatforms, apiEndpoint);
    setCurrentPrompt(prompt);
    setShowPromptDialog(true);
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group platforms by category
  const platformsByCategory = Object.entries(PLATFORMS).reduce((acc, [id, config]) => {
    if (!acc[config.category]) acc[config.category] = [];
    acc[config.category].push({ id: id as AnalysisPlatform, ...config });
    return acc;
  }, {} as Record<string, Array<{ id: AnalysisPlatform } & typeof PLATFORMS[AnalysisPlatform]>>);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-pink-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Insight Agent</CardTitle>
                <CardDescription>
                  AI-powered analysis of your online activity
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-sm",
                hasClaudeCode 
                  ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/50" 
                  : "bg-amber-500/20 text-amber-600 border-amber-500/50"
              )}
            >
              {hasClaudeCode ? 'Claude Code Ready' : 'Manual Mode'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Claude Code Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-violet-500" />
              <div>
                <p className="font-medium">I have Claude Code</p>
                <p className="text-sm text-muted-foreground">
                  Enable browser automation for automatic analysis
                </p>
              </div>
            </div>
            <Switch
              checked={hasClaudeCode}
              onCheckedChange={setHasClaudeCode}
            />
          </div>

          {/* Insight Strength */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Insight Profile Strength</span>
              <span className="font-medium">{Math.round(insightStrength)}%</span>
            </div>
            <Progress value={insightStrength} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {insightStrength < 30 
                ? "Add more platforms to improve recommendations"
                : insightStrength < 70
                  ? "Good start! More platforms = better recommendations"
                  : "Great! You have a rich insight profile"
              }
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Privacy First
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                We only store <strong>derived insights</strong> (like &quot;interested in hiking&quot;), 
                never personal data, messages, or specific details. You control what gets analyzed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Select Platforms to Analyze</CardTitle>
          <CardDescription>
            Choose which platforms to include in your insight profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(platformsByCategory).map(([category, platforms]) => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => {
                    const isEnabled = enabledPlatforms.includes(platform.id);
                    const status = analysisStatus[platform.id];
                    
                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
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
                            style={{ backgroundColor: platform.color }}
                          >
                            {platform.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {status?.lastAnalysis 
                                ? `${status.insightsCount} insights`
                                : 'Not analyzed'
                              }
                            </p>
                          </div>
                          {isEnabled && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {hasClaudeCode ? (
              <Button 
                className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600"
                onClick={startAnalysis}
                disabled={enabledPlatforms.length === 0}
              >
                <Zap className="h-4 w-4 mr-2" />
                Analyze Selected ({enabledPlatforms.length})
              </Button>
            ) : (
              <Button 
                className="flex-1"
                variant="outline"
                disabled
              >
                <Info className="h-4 w-4 mr-2" />
                Enable Claude Code to Analyze
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Insights Preview */}
      {profile && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Insight Profile</CardTitle>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Top Interests */}
              {profile.interests.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Top Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.slice(0, 6).map((interest, i) => (
                      <Badge key={i} variant="secondary">
                        {interest.topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Entertainment */}
              {profile.entertainment.preferred_genres.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Preferred Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.entertainment.preferred_genres.slice(0, 5).map((genre, i) => (
                      <Badge key={i} variant="outline">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Platforms Analyzed */}
              <div>
                <p className="text-sm font-medium mb-2">Data Sources</p>
                <div className="flex flex-wrap gap-2">
                  {profile.platforms_analyzed.map((platform, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {PLATFORMS[platform as AnalysisPlatform]?.name || platform}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback for non-Claude Code users */}
      {!hasClaudeCode && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Alternative Methods</CardTitle>
            <CardDescription>
              Build your insight profile without browser automation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  📋
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Quick Survey</p>
                  <p className="text-xs text-muted-foreground">5 min questionnaire about your preferences</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  🎬
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Rate Your Favorites</p>
                  <p className="text-xs text-muted-foreground">Tell us what you love watching, reading, doing</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  🔗
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Connect Services</p>
                  <p className="text-xs text-muted-foreground">OAuth integrations where available</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      )}

      {/* Prompt Dialog */}
      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-500" />
              Claude Code Analysis Instructions
            </DialogTitle>
            <DialogDescription>
              Copy these instructions and paste them into Claude Code. 
              Make sure you&apos;re logged into the selected platforms.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Selected Platforms */}
            <div className="flex flex-wrap gap-2">
              {enabledPlatforms.map(p => (
                <Badge key={p} variant="secondary">
                  {PLATFORMS[p]?.name}
                </Badge>
              ))}
            </div>
            
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
            
            <ScrollArea className="h-[350px] rounded-lg border p-4 bg-muted/30">
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {currentPrompt}
              </pre>
            </ScrollArea>
            
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="h-4 w-4 text-emerald-500 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong>What happens:</strong> Claude will browse each platform using your 
                logged-in sessions, extract high-level insights (not personal data), and 
                send them to Youmaxing. This powers personalized recommendations across all mini-apps.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InsightAgent;


