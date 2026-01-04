'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { aspects } from '@/lib/aspects';
import { ProactiveChat } from '@/components/ProactiveChat';
import { AvatarWithRing } from '@/components/3d/AvatarWithRing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Calendar,
  ListChecks,
  Plus,
  ChevronRight,
  Folder,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  trainingStats,
  todaysWorkoutPlan,
  workoutsThisWeek,
  weeklyMealPlan,
  getTodaysMeal,
  groceryList,
  financeStats,
  savingsGoals,
  recentTransactions,
  friends,
  getFriendsToContact,
  upcomingTrips,
} from '@/lib/miniAppData';
import { FolderBrowser, businessFolders } from '@/components/FolderBrowser';
import { Films } from '@/components/aspects/Films';
import type { AspectType } from '@/types/database';

// Filter valid aspect IDs
const validAspects = aspects.filter(a => a.id !== 'settings').map(a => a.id);

export default function MiniAppPage() {
  const params = useParams();
  const router = useRouter();
  const aspectId = params.aspect as string;
  const { setCurrentAspect, theme } = useAppStore();
  
  const aspectConfig = aspects.find(a => a.id === aspectId);
  const Icon = aspectConfig?.icon;
  
  // Redirect if invalid aspect
  useEffect(() => {
    if (!validAspects.includes(aspectId as AspectType)) {
      router.push('/dashboard');
      return;
    }
    setCurrentAspect(aspectId as AspectType);
  }, [aspectId, router, setCurrentAspect]);

  if (!aspectConfig) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 flex items-center gap-4 border-b border-white/5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard')}
          className={cn(
            "rounded-xl",
            theme === 'light'
              ? "hover:bg-slate-100 text-slate-600"
              : "hover:bg-white/10 text-white/60"
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div 
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${aspectConfig.color}80, ${aspectConfig.color}40)` 
          }}
        >
          {Icon && <Icon className="h-5 w-5 text-white" />}
        </div>
        <div className="flex-1">
          <h1 className={cn(
            "text-lg font-bold",
            theme === 'light' ? "text-slate-900" : "text-white"
          )}>
            {aspectConfig.name}
          </h1>
          <p className={cn(
            "text-xs",
            theme === 'light' ? "text-slate-500" : "text-white/50"
          )}>
            Mini-App Dashboard
          </p>
        </div>
        <Badge
          className="text-xs"
          style={{ 
            backgroundColor: `${aspectConfig.color}20`,
            color: aspectConfig.color 
          }}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
          {/* Left: Dashboard */}
          <div className="p-6 overflow-auto border-r border-white/5">
            <MiniAppContent aspectId={aspectId as AspectType} theme={theme} color={aspectConfig.color} />
          </div>
          
          {/* Right: Chat - Aspect-specific mode */}
          <div className="h-full overflow-hidden">
            <ProactiveChat mode="aspect" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Aspect-specific dashboard content
function MiniAppContent({ aspectId, theme, color }: { aspectId: AspectType; theme: 'dark' | 'light'; color: string }) {
  const cardBg = theme === 'light' ? 'bg-white/80 border-slate-200/50' : 'bg-white/5 border-white/10';
  const textPrimary = theme === 'light' ? 'text-slate-900' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-slate-500' : 'text-white/50';

  switch (aspectId) {
    case 'training':
      return (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className={cn("border", cardBg)}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold" style={{ color }}>{trainingStats.streak}</p>
                <p className={cn("text-xs", textSecondary)}>Day Streak 🔥</p>
              </CardContent>
            </Card>
            <Card className={cn("border", cardBg)}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold" style={{ color }}>{trainingStats.weeklyCompleted}/{trainingStats.weeklyGoal}</p>
                <p className={cn("text-xs", textSecondary)}>This Week</p>
              </CardContent>
            </Card>
            <Card className={cn("border", cardBg)}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold" style={{ color }}>{trainingStats.avgSleep}h</p>
                <p className={cn("text-xs", textSecondary)}>Avg Sleep</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Plan */}
          <Card className={cn("border", cardBg)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className={cn("font-semibold", textPrimary)}>Today's Workout</h3>
                <Badge style={{ backgroundColor: `${color}20`, color }}>{todaysWorkoutPlan.estimatedDuration} min</Badge>
              </div>
              <p className={cn("text-sm mb-3", textSecondary)}>{todaysWorkoutPlan.name}</p>
              <div className="space-y-2">
                {todaysWorkoutPlan.exercises.slice(0, 3).map((ex, i) => (
                  <div key={i} className={cn("flex justify-between text-sm", textSecondary)}>
                    <span>{ex.name}</span>
                    <span>{ex.sets} × {ex.reps}</span>
                  </div>
                ))}
                {todaysWorkoutPlan.exercises.length > 3 && (
                  <p className={cn("text-xs", textSecondary)}>+{todaysWorkoutPlan.exercises.length - 3} more...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Workouts */}
          <Card className={cn("border", cardBg)}>
            <CardContent className="p-4">
              <h3 className={cn("font-semibold mb-3", textPrimary)}>This Week</h3>
              <div className="space-y-2">
                {workoutsThisWeek.slice(-4).map((w) => (
                  <div key={w.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                      {w.completed ? '✓' : '○'}
                    </div>
                    <div className="flex-1">
                      <p className={cn("text-sm", textPrimary)}>{w.name}</p>
                      <p className={cn("text-xs", textSecondary)}>{w.duration} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 'food':
      const todaysMeal = getTodaysMeal();
      const uncheckedGroceries = groceryList.filter(i => !i.checked);
      
      return (
        <div className="space-y-4">
          {/* Today's Meal */}
          <Card className={cn("border", cardBg)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className={cn("font-semibold", textPrimary)}>Tonight's Dinner</h3>
                <Calendar className={cn("h-4 w-4", textSecondary)} />
              </div>
              {todaysMeal ? (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: `${color}10` }}>
                  <span className="text-3xl">{todaysMeal.emoji}</span>
                  <div>
                    <p className={cn("font-medium", textPrimary)}>{todaysMeal.name}</p>
                    <p className={cn("text-xs", textSecondary)}>{todaysMeal.tags.join(' • ')}</p>
                  </div>
                </div>
              ) : (
                <p className={cn("text-sm", textSecondary)}>Nothing planned yet</p>
              )}
            </CardContent>
          </Card>

          {/* Weekly Plan */}
          <Card className={cn("border", cardBg)}>
            <CardContent className="p-4">
              <h3 className={cn("font-semibold mb-3", textPrimary)}>This Week</h3>
              <div className="space-y-2">
                {Object.entries(weeklyMealPlan).map(([day, meal]) => (
                  <div key={day} className="flex items-center justify-between py-1">
                    <span className={cn("text-sm", textSecondary)}>{day}</span>
                    {meal ? (
                      <span className={cn("text-sm", textPrimary)}>{meal.emoji} {meal.name}</span>
                    ) : (
                      <span className={cn("text-xs", textSecondary)}>—</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grocery List */}
          <Card className={cn("border", cardBg)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className={cn("font-semibold", textPrimary)}>Grocery List</h3>
                <Badge style={{ backgroundColor: `${color}20`, color }}>{uncheckedGroceries.length} items</Badge>
              </div>
              <div className="space-y-1">
                {uncheckedGroceries.slice(0, 5).map((item, i) => (
                  <div key={i} className={cn("text-sm", textSecondary)}>• {item.item}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 'finance':
      return (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className={cn("border", cardBg)}>
              <CardContent className="p-4">
                <p className={cn("text-xs mb-1", textSecondary)}>Portfolio</p>
                <p className="text-2xl font-bold" style={{ color }}>${financeStats.portfolioValue.toLocaleString()}</p>
                <p className={financeStats.portfolioChange > 0 ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                  {financeStats.portfolioChange > 0 ? '+' : ''}{financeStats.portfolioChange}%
                </p>
              </CardContent>
            </Card>
            <Card className={cn("border", cardBg)}>
              <CardContent className="p-4">
                <p className={cn("text-xs mb-1", textSecondary)}>Monthly Budget</p>
                <p className="text-2xl font-bold" style={{ color }}>${financeStats.monthlySpent}</p>
                <p className={cn("text-xs", textSecondary)}>of ${financeStats.monthlyBudget}</p>
              </CardContent>
            </Card>
          </div>

          {/* Savings Goals */}
          <Card className={cn("border", cardBg)}>
            <CardContent className="p-4">
              <h3 className={cn("font-semibold mb-3", textPrimary)}>Savings Goals</h3>
              <div className="space-y-3">
                {savingsGoals.map(goal => (
                  <div key={goal.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={textPrimary}>{goal.name}</span>
                      <span className={textSecondary}>{Math.round((goal.current / goal.target) * 100)}%</span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className={cn("border", cardBg)}>
            <CardContent className="p-4">
              <h3 className={cn("font-semibold mb-3", textPrimary)}>Recent</h3>
              <div className="space-y-2">
                {recentTransactions.slice(0, 4).map(t => (
                  <div key={t.id} className="flex justify-between text-sm">
                    <span className={textSecondary}>{t.description}</span>
                    <span className={t.amount < 0 ? "text-red-400" : "text-green-400"}>
                      {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 'friends':
      const toContact = getFriendsToContact();
      
      return (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className={cn("border", cardBg)}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold" style={{ color }}>{friends.length}</p>
                <p className={cn("text-xs", textSecondary)}>Friends</p>
              </CardContent>
            </Card>
            <Card className={cn("border", cardBg)}>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold" style={{ color }}>{toContact.length}</p>
                <p className={cn("text-xs", textSecondary)}>To Catch Up</p>
              </CardContent>
            </Card>
          </div>

          {/* To Contact */}
          <Card className={cn("border", cardBg)}>
            <CardContent className="p-4">
              <h3 className={cn("font-semibold mb-3", textPrimary)}>Haven't Talked In A While</h3>
              <div className="space-y-2">
                {toContact.map(f => {
                  const daysAgo = Math.floor((Date.now() - f.lastContact.getTime()) / (24 * 60 * 60 * 1000));
                  return (
                    <div key={f.id} className="flex items-center justify-between">
                      <span className={textPrimary}>{f.name}</span>
                      <span className={cn("text-xs", textSecondary)}>{daysAgo} days ago</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* All Friends */}
          <Card className={cn("border", cardBg)}>
            <CardContent className="p-4">
              <h3 className={cn("font-semibold mb-3", textPrimary)}>All Friends</h3>
              <div className="flex flex-wrap gap-2">
                {friends.map(f => (
                  <Badge key={f.id} variant="outline" className={textSecondary}>{f.name}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );

    case 'travel':
      return (
        <div className="space-y-4">
          {/* Upcoming Trips */}
          {upcomingTrips.map(trip => (
            <Card key={trip.id} className={cn("border", cardBg)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={cn("font-semibold", textPrimary)}>{trip.destination}</h3>
                  <Badge style={{ backgroundColor: `${color}20`, color }}>{trip.status}</Badge>
                </div>
                <p className={cn("text-sm mb-3", textSecondary)}>{trip.dates}</p>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={textSecondary}>Fund Progress</span>
                    <span style={{ color }}>{trip.fundProgress}%</span>
                  </div>
                  <Progress value={trip.fundProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );

    case 'business':
      return (
        <div className="h-full">
          <Card className={cn("border h-full", cardBg)}>
            <CardContent className="p-3 h-full">
              <FolderBrowser
                folders={businessFolders}
                aspectColor={color}
                title="Business Files"
                onAIQuery={(context) => {
                  // This would trigger the AI chat with the selected context
                  console.log('AI Query with context:', context);
                }}
              />
            </CardContent>
          </Card>
        </div>
      );

    case 'films':
      return <Films />;

    default:
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${color}20` }}
          >
            <Sparkles className="h-10 w-10" style={{ color }} />
          </div>
          <h3 className={cn("text-xl font-bold mb-2", textPrimary)}>
            {aspects.find(a => a.id === aspectId)?.name} Dashboard
          </h3>
          <p className={cn("text-sm max-w-xs", textSecondary)}>
            This mini-app is under development. Use the chat to interact with your data.
          </p>
        </div>
      );
  }
}

