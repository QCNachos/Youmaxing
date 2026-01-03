'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X,
  Crown,
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Zap,
  Star,
  Award,
  PieChart,
  Activity,
  Flame,
  Trophy,
  Sparkles,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aspects } from '@/lib/aspects';

interface PremiumPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock analytics data
const weeklyStats = {
  tasksCompleted: 24,
  tasksTotal: 32,
  eventsAttended: 8,
  goalsProgress: 73,
  streak: 12,
  focusHours: 18.5,
};

const aspectBreakdown = [
  { aspect: 'business', tasks: 12, percentage: 38 },
  { aspect: 'training', tasks: 8, percentage: 25 },
  { aspect: 'family', tasks: 6, percentage: 19 },
  { aspect: 'friends', tasks: 4, percentage: 12 },
  { aspect: 'food', tasks: 2, percentage: 6 },
];

const weeklyActivity = [
  { day: 'Mon', tasks: 5, mood: 'great' },
  { day: 'Tue', tasks: 3, mood: 'good' },
  { day: 'Wed', tasks: 7, mood: 'great' },
  { day: 'Thu', tasks: 4, mood: 'okay' },
  { day: 'Fri', tasks: 2, mood: 'tired' },
  { day: 'Sat', tasks: 1, mood: 'good' },
  { day: 'Sun', tasks: 2, mood: 'good' },
];

const achievements = [
  { id: 1, title: 'Early Bird', description: 'Complete 5 tasks before 9 AM', progress: 80, icon: Zap, unlocked: false },
  { id: 2, title: 'Streak Master', description: '7 day login streak', progress: 100, icon: Flame, unlocked: true },
  { id: 3, title: 'Goal Crusher', description: 'Complete 3 monthly goals', progress: 66, icon: Target, unlocked: false },
  { id: 4, title: 'Social Butterfly', description: 'Log 10 social events', progress: 40, icon: Star, unlocked: false },
];

const premiumFeatures = [
  { title: 'AI Insights', description: 'Get personalized recommendations', icon: Sparkles },
  { title: 'Advanced Analytics', description: 'Deep dive into your patterns', icon: PieChart },
  { title: 'Custom Reports', description: 'Export weekly/monthly reports', icon: BarChart3 },
  { title: 'Priority Support', description: '24/7 dedicated support', icon: Crown },
];

export function PremiumPanel({ isOpen, onClose }: PremiumPanelProps) {
  const [activeTab, setActiveTab] = useState('analytics');

  const getAspectColor = (aspectId: string) => {
    return aspects.find(a => a.id === aspectId)?.color || '#8B5CF6';
  };

  const getAspectName = (aspectId: string) => {
    return aspects.find(a => a.id === aspectId)?.name || aspectId;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed inset-y-0 left-16 w-[440px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 z-50 shadow-2xl border-r border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-pink-500/10 to-transparent" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-400/20 rounded-full blur-3xl" />
          
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">YOUMAXING</h2>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0 text-[10px]">
                      PRO
                    </Badge>
                    <span className="text-white/50 text-xs">Analytics & Insights</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 text-center border border-white/10">
                <p className="text-lg font-bold text-white">{weeklyStats.streak}</p>
                <p className="text-[10px] text-white/50">Day Streak</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 text-center border border-white/10">
                <p className="text-lg font-bold text-green-400">{weeklyStats.tasksCompleted}</p>
                <p className="text-[10px] text-white/50">Tasks Done</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 text-center border border-white/10">
                <p className="text-lg font-bold text-blue-400">{weeklyStats.goalsProgress}%</p>
                <p className="text-[10px] text-white/50">Goals</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 text-center border border-white/10">
                <p className="text-lg font-bold text-amber-400">{weeklyStats.focusHours}h</p>
                <p className="text-[10px] text-white/50">Focus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 grid grid-cols-3 bg-white/5">
            <TabsTrigger value="analytics" className="text-xs data-[state=active]:bg-white/10">
              <BarChart3 className="h-3 w-3 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs data-[state=active]:bg-white/10">
              <Trophy className="h-3 w-3 mr-1" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="premium" className="text-xs data-[state=active]:bg-white/10">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="flex-1 overflow-auto m-0 p-4 space-y-4">
            {/* Weekly Activity Chart */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-400" />
                Weekly Activity
              </h3>
              <div className="flex items-end gap-2 h-24">
                {weeklyActivity.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full rounded-t-lg transition-all hover:opacity-80"
                      style={{ 
                        height: `${(day.tasks / 7) * 100}%`,
                        backgroundColor: getAspectColor('business'),
                        minHeight: '8px'
                      }}
                    />
                    <span className="text-[10px] text-white/50">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aspect Breakdown */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-pink-400" />
                Focus Areas
              </h3>
              <div className="space-y-2">
                {aspectBreakdown.map(item => (
                  <div key={item.aspect} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getAspectColor(item.aspect) }}
                    />
                    <span className="text-xs text-white/70 flex-1">{getAspectName(item.aspect)}</span>
                    <span className="text-xs text-white/50">{item.tasks} tasks</span>
                    <div className="w-16">
                      <Progress value={item.percentage} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-r from-violet-500/10 to-pink-500/10 rounded-xl p-4 border border-violet-500/20">
              <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                AI Insights
              </h3>
              <p className="text-xs text-white/70 mb-2">
                You&apos;re 23% more productive on Wednesdays. Consider scheduling important tasks for midweek!
              </p>
              <Button size="sm" variant="ghost" className="text-violet-400 hover:text-violet-300 text-xs p-0 h-auto">
                View more insights <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="flex-1 overflow-auto m-0 p-4 space-y-3">
            {achievements.map(achievement => {
              const Icon = achievement.icon;
              return (
                <div 
                  key={achievement.id}
                  className={cn(
                    "rounded-xl p-4 border transition-all",
                    achievement.unlocked 
                      ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30"
                      : "bg-white/5 border-white/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      achievement.unlocked ? "bg-amber-500/20" : "bg-white/10"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        achievement.unlocked ? "text-amber-400" : "text-white/40"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white">{achievement.title}</h4>
                        {achievement.unlocked && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">{achievement.description}</p>
                      {!achievement.unlocked && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-white/40">Progress</span>
                            <span className="text-white/60">{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Premium Tab */}
          <TabsContent value="premium" className="flex-1 overflow-auto m-0 p-4 space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/30">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Upgrade to Pro</h3>
              <p className="text-sm text-white/50 mt-1">Unlock all features and analytics</p>
            </div>

            <div className="space-y-2">
              {premiumFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{feature.title}</p>
                      <p className="text-xs text-white/50">{feature.description}</p>
                    </div>
                    <Lock className="h-4 w-4 text-white/30" />
                  </div>
                );
              })}
            </div>

            <Button className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white border-0">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now - $9.99/mo
            </Button>

            <p className="text-center text-[10px] text-white/30">
              7-day free trial • Cancel anytime
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

