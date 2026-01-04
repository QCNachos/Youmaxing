'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Coins,
  Gift,
  Trophy,
  Star,
  CheckCircle2,
  ChevronRight,
  Zap,
  Calendar,
  Music,
  MessageSquare,
  Users,
  Link2,
  Sparkles,
  TrendingUp,
  Target,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

interface EarnPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EarnTask {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  category: 'connect' | 'daily' | 'achievement' | 'referral';
  completed: boolean;
  progress?: number;
  maxProgress?: number;
}

// Social/Platform icons as simple components
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const SpotifyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const mockTasks: EarnTask[] = [
  // Connect tasks
  {
    id: 'connect-facebook',
    title: 'Connect Facebook',
    description: 'Link your Facebook account to sync social activities',
    points: 500,
    icon: FacebookIcon,
    color: '#1877F2',
    category: 'connect',
    completed: false,
  },
  {
    id: 'connect-spotify',
    title: 'Connect Spotify',
    description: 'Share your music taste and get personalized recommendations',
    points: 500,
    icon: SpotifyIcon,
    color: '#1DB954',
    category: 'connect',
    completed: true,
  },
  {
    id: 'connect-google',
    title: 'Connect Google Calendar',
    description: 'Sync your calendar for smart scheduling',
    points: 750,
    icon: GoogleIcon,
    color: '#4285F4',
    category: 'connect',
    completed: false,
  },
  {
    id: 'connect-twitter',
    title: 'Connect X (Twitter)',
    description: 'Share achievements and earn bonus points',
    points: 400,
    icon: TwitterIcon,
    color: '#000000',
    category: 'connect',
    completed: false,
  },
  // Daily tasks
  {
    id: 'daily-login',
    title: 'Daily Login Streak',
    description: 'Log in 7 days in a row',
    points: 100,
    icon: Calendar,
    color: '#8B5CF6',
    category: 'daily',
    completed: false,
    progress: 5,
    maxProgress: 7,
  },
  {
    id: 'daily-chat',
    title: 'Chat with AI Coach',
    description: 'Have a conversation with your AI coach today',
    points: 50,
    icon: MessageSquare,
    color: '#06B6D4',
    category: 'daily',
    completed: true,
  },
  {
    id: 'daily-task',
    title: 'Complete 3 Tasks',
    description: 'Finish any 3 tasks today',
    points: 75,
    icon: CheckCircle2,
    color: '#22C55E',
    category: 'daily',
    completed: false,
    progress: 1,
    maxProgress: 3,
  },
  // Achievements
  {
    id: 'achieve-profile',
    title: 'Complete Your Profile',
    description: 'Fill out all profile sections',
    points: 200,
    icon: Users,
    color: '#EC4899',
    category: 'achievement',
    completed: true,
  },
  {
    id: 'achieve-first-goal',
    title: 'Set Your First Goal',
    description: 'Create a monthly objective',
    points: 150,
    icon: Target,
    color: '#F97316',
    category: 'achievement',
    completed: false,
  },
  // Referral
  {
    id: 'referral-invite',
    title: 'Invite a Friend',
    description: 'Share your referral link and earn when they join',
    points: 1000,
    icon: Gift,
    color: '#EF4444',
    category: 'referral',
    completed: false,
  },
];

const categories = [
  { id: 'all', label: 'All Tasks', icon: Zap },
  { id: 'connect', label: 'Connect', icon: Link2 },
  { id: 'daily', label: 'Daily', icon: Calendar },
  { id: 'achievement', label: 'Achievements', icon: Trophy },
  { id: 'referral', label: 'Referral', icon: Gift },
];

export function EarnPanel({ isOpen, onClose }: EarnPanelProps) {
  const { theme } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tasks, setTasks] = useState(mockTasks);

  const totalPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
  const pendingPoints = tasks.filter(t => !t.completed).reduce((sum, t) => sum + t.points, 0);

  const filteredTasks = selectedCategory === 'all'
    ? tasks
    : tasks.filter(t => t.category === selectedCategory);

  const handleTaskAction = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    ));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 backdrop-blur-sm z-50 transition-opacity",
          theme === 'light' ? "bg-black/20" : "bg-black/60"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={cn(
        "fixed inset-y-0 left-16 w-[420px] z-50 shadow-2xl border-r overflow-hidden",
        theme === 'light'
          ? "bg-gradient-to-b from-amber-50 via-white to-orange-50/50 border-amber-200/50"
          : "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-white/10"
      )}>
        {/* Header with gradient */}
        <div className="relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl" />
          
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Coins className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Earn Points</h2>
                  <p className="text-white/50 text-sm">Complete tasks to earn rewards</p>
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

            {/* Points Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-4 w-4 text-amber-400" />
                  <span className="text-white/50 text-sm">Your Points</span>
                </div>
                <p className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-white/50 text-sm">Available</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">+{pendingPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                    selectedCategory === cat.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tasks List */}
        <ScrollArea className="flex-1 h-[calc(100vh-320px)]">
          <div className="p-4 space-y-3">
            {filteredTasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.id}
                  className={cn(
                    'group relative rounded-2xl p-4 transition-all border',
                    task.completed
                      ? 'bg-white/5 border-white/10 opacity-60'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: `${task.color}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: task.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={cn(
                            'font-semibold',
                            task.completed ? 'text-white/50 line-through' : 'text-white'
                          )}>
                            {task.title}
                          </h3>
                          <p className="text-white/40 text-sm mt-0.5">{task.description}</p>
                        </div>
                        
                        {/* Points Badge */}
                        <Badge 
                          className={cn(
                            'flex-shrink-0 font-bold',
                            task.completed
                              ? 'bg-white/10 text-white/40'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          )}
                        >
                          <Coins className="h-3 w-3 mr-1" />
                          +{task.points}
                        </Badge>
                      </div>

                      {/* Progress bar if applicable */}
                      {task.progress !== undefined && task.maxProgress && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-white/40">Progress</span>
                            <span className="text-white/60">{task.progress}/{task.maxProgress}</span>
                          </div>
                          <Progress 
                            value={(task.progress / task.maxProgress) * 100} 
                            className="h-1.5 bg-white/10"
                          />
                        </div>
                      )}

                      {/* Action Button */}
                      {!task.completed && !task.progress && (
                        <Button
                          size="sm"
                          onClick={() => handleTaskAction(task.id)}
                          className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 rounded-xl"
                        >
                          {task.category === 'connect' ? 'Connect' : 'Start'}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}

                      {/* Completed badge */}
                      {task.completed && (
                        <div className="flex items-center gap-1.5 mt-3 text-emerald-400 text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer - Crypto hint */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-r from-violet-500/10 to-pink-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium">Points → Crypto Coming Soon</p>
              <p className="text-white/40 text-xs">Earn now, convert to tokens later</p>
            </div>
            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
              <Star className="h-3 w-3 mr-1" />
              Beta
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
}








