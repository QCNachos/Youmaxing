'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { aspects } from '@/lib/aspects';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Plus,
  Sparkles,
  Calendar,
  Target,
  Zap,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Play,
  Camera,
  Search,
  Bell,
  Heart,
  MapPin,
  Users,
  Gift,
  Ticket,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================
// VALUE PROPOSITION FOR EACH MINI-APP:
// ============================================
// 
// TRAINING: AI creates personalized workout plans, tracks progress, suggests rest days
// FOOD: Quick meal logging (photo), AI nutrition advice, weekly meal plans, shopping lists
// FINANCE: AI investment tips, spending insights, automated savings suggestions, bill reminders
// SPORTS: Game schedules, watch party planning, fantasy insights, team news
// FILMS: AI recommendations based on mood, "what to watch tonight", streaming deal alerts
// TRAVEL: AI trip planner, deal alerts, packing lists, local tips
// BUSINESS: Goal tracking, AI productivity coach, meeting prep, skill suggestions
// FAMILY: Important date reminders, gift ideas, quality time suggestions, photo memories
// FRIENDS: Stay connected reminders, event planning, group activity ideas
// EVENTS: Personalized event discovery, ticket deals, calendar sync
// 
// User effort: 5-10 min/day (quick inputs, confirmations)
// Value delivered: 20-25 min (analysis, recommendations, enjoyment)
// ============================================

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  points?: number;
}

interface AIInsight {
  type: 'tip' | 'alert' | 'opportunity';
  title: string;
  description: string;
  action?: string;
}

interface AspectData {
  quickActions: QuickAction[];
  todayFocus: { title: string; progress: number; target: string };
  aiInsights: AIInsight[];
  streakDays: number;
  weeklyGoalProgress: number;
}

// Data for each aspect
const aspectData: Record<string, AspectData> = {
  training: {
    quickActions: [
      { label: 'Start Workout', icon: Play, description: 'AI-guided session', color: '#EF4444', points: 50 },
      { label: 'Log Activity', icon: Plus, description: 'Quick entry', color: '#EF4444' },
      { label: 'View Plan', icon: Calendar, description: 'This week', color: '#EF4444' },
    ],
    todayFocus: { title: 'Upper Body Day', progress: 0, target: '45 min strength training' },
    aiInsights: [
      { type: 'tip', title: 'Recovery Check', description: 'Your sleep was 7.5h. Good for intense training today!' },
      { type: 'opportunity', title: 'Streak Bonus', description: 'Complete today for 7-day streak! +100 bonus points', action: 'Start Now' },
    ],
    streakDays: 6,
    weeklyGoalProgress: 71,
  },
  food: {
    quickActions: [
      { label: 'Snap Meal', icon: Camera, description: 'AI analyzes photo', color: '#22C55E', points: 20 },
      { label: 'Quick Log', icon: Plus, description: 'Text entry', color: '#22C55E' },
      { label: 'Meal Plan', icon: Calendar, description: 'AI suggestions', color: '#22C55E' },
    ],
    todayFocus: { title: 'Hit Protein Goal', progress: 68, target: '120g protein today' },
    aiInsights: [
      { type: 'tip', title: 'Lunch Suggestion', description: 'Grilled chicken salad would hit your remaining protein (38g)' },
      { type: 'alert', title: 'Low Fiber Yesterday', description: 'Add more greens today. Here are 3 easy options.', action: 'See Recipes' },
    ],
    streakDays: 12,
    weeklyGoalProgress: 85,
  },
  finance: {
    quickActions: [
      { label: 'Log Expense', icon: Plus, description: 'Quick entry', color: '#10B981', points: 10 },
      { label: 'See Insights', icon: TrendingUp, description: 'AI analysis', color: '#10B981' },
      { label: 'Investment Tips', icon: Lightbulb, description: 'Today\'s picks', color: '#10B981' },
    ],
    todayFocus: { title: 'Stay Under Budget', progress: 42, target: '$85 remaining today' },
    aiInsights: [
      { type: 'opportunity', title: 'Market Alert', description: 'S&P 500 dipped 2%. Good time to buy? See analysis.', action: 'View' },
      { type: 'tip', title: 'Savings Boost', description: 'Move $200 to high-yield savings. You\'d earn $18/year extra.' },
    ],
    streakDays: 8,
    weeklyGoalProgress: 92,
  },
  sports: {
    quickActions: [
      { label: 'Today\'s Games', icon: Play, description: 'Live & upcoming', color: '#F97316', points: 5 },
      { label: 'Watch Party', icon: Users, description: 'Invite friends', color: '#F97316' },
      { label: 'Fantasy Check', icon: Star, description: 'Your lineup', color: '#F97316' },
    ],
    todayFocus: { title: 'Lakers vs Celtics', progress: 0, target: '7:30 PM - Set reminder?' },
    aiInsights: [
      { type: 'alert', title: 'Game Tonight!', description: 'Lakers vs Celtics at 7:30 PM. 3 friends also watching.', action: 'Create Watch Party' },
      { type: 'tip', title: 'Fantasy Tip', description: 'Bench injured player. Here\'s a better pick for tonight.' },
    ],
    streakDays: 4,
    weeklyGoalProgress: 60,
  },
  films: {
    quickActions: [
      { label: 'What to Watch', icon: Sparkles, description: 'AI picks for you', color: '#A855F7', points: 5 },
      { label: 'Search', icon: Search, description: 'Find something', color: '#A855F7' },
      { label: 'My List', icon: Heart, description: 'Watchlist', color: '#A855F7' },
    ],
    todayFocus: { title: 'Continue Watching', progress: 65, target: 'Dune: Part Two - 1h 12m left' },
    aiInsights: [
      { type: 'tip', title: 'Tonight\'s Pick', description: 'Based on your mood: "The Bear" S3 - 92% match for you' },
      { type: 'opportunity', title: 'New Release', description: 'Dune 3 premieres Friday! Add to watchlist?', action: 'Add' },
    ],
    streakDays: 3,
    weeklyGoalProgress: 40,
  },
  travel: {
    quickActions: [
      { label: 'Plan Trip', icon: MapPin, description: 'AI itinerary', color: '#06B6D4', points: 30 },
      { label: 'Find Deals', icon: Search, description: 'Flights & hotels', color: '#06B6D4' },
      { label: 'Bucket List', icon: Heart, description: 'Dream destinations', color: '#06B6D4' },
    ],
    todayFocus: { title: 'Japan Trip Fund', progress: 84, target: '$4,200 / $5,000 saved' },
    aiInsights: [
      { type: 'opportunity', title: 'Flight Deal!', description: 'Tokyo flights 18% cheaper this week. Save $340.', action: 'View Deals' },
      { type: 'tip', title: 'Trip Prep', description: 'Japan trip in 67 days. Start packing list? Visa check?' },
    ],
    streakDays: 15,
    weeklyGoalProgress: 100,
  },
  business: {
    quickActions: [
      { label: 'Today\'s Tasks', icon: CheckCircle2, description: 'Priority list', color: '#6366F1', points: 25 },
      { label: 'Track Goal', icon: Target, description: 'Update progress', color: '#6366F1' },
      { label: 'AI Coach', icon: Sparkles, description: 'Productivity tips', color: '#6366F1' },
    ],
    todayFocus: { title: 'Q1 Project', progress: 67, target: '3 tasks remaining this week' },
    aiInsights: [
      { type: 'tip', title: 'Peak Hours', description: 'You\'re most productive 9-11 AM. Block focus time?' },
      { type: 'alert', title: 'Deadline Approaching', description: 'Project review in 3 days. 2 items need attention.', action: 'View' },
    ],
    streakDays: 21,
    weeklyGoalProgress: 78,
  },
  family: {
    quickActions: [
      { label: 'Call Mom', icon: Heart, description: 'Last call: 5 days ago', color: '#EC4899', points: 30 },
      { label: 'Gift Ideas', icon: Gift, description: 'Dad\'s birthday soon', color: '#EC4899' },
      { label: 'Plan Activity', icon: Calendar, description: 'Family time', color: '#EC4899' },
    ],
    todayFocus: { title: 'Stay Connected', progress: 60, target: '2 family calls this week' },
    aiInsights: [
      { type: 'alert', title: 'Dad\'s Birthday', description: 'In 12 days! Here are gift ideas based on his interests.', action: 'See Ideas' },
      { type: 'tip', title: 'Quality Time', description: 'Weekend forecast is great. Suggest a family hike?' },
    ],
    streakDays: 7,
    weeklyGoalProgress: 50,
  },
  friends: {
    quickActions: [
      { label: 'Catch Up', icon: Users, description: 'Who to call', color: '#F59E0B', points: 20 },
      { label: 'Plan Hangout', icon: Calendar, description: 'Create event', color: '#F59E0B' },
      { label: 'Gift Tracker', icon: Gift, description: 'Birthdays coming', color: '#F59E0B' },
    ],
    todayFocus: { title: 'Stay Social', progress: 75, target: '3/4 friend connections this week' },
    aiInsights: [
      { type: 'tip', title: 'Reconnect', description: 'You haven\'t talked to Jake in 3 weeks. Quick text?', action: 'Message' },
      { type: 'opportunity', title: 'Group Activity', description: 'New escape room opened nearby. 4 friends interested!', action: 'Create Event' },
    ],
    streakDays: 9,
    weeklyGoalProgress: 75,
  },
  events: {
    quickActions: [
      { label: 'Discover', icon: Search, description: 'Events near you', color: '#8B5CF6', points: 10 },
      { label: 'My Events', icon: Ticket, description: 'Upcoming plans', color: '#8B5CF6' },
      { label: 'Reminders', icon: Bell, description: 'Set alerts', color: '#8B5CF6' },
    ],
    todayFocus: { title: 'This Weekend', progress: 0, target: '2 events matched your interests' },
    aiInsights: [
      { type: 'opportunity', title: 'Concert Tonight', description: 'Coldplay at 8 PM. Tickets from $45. 2 friends going!', action: 'Get Tickets' },
      { type: 'tip', title: 'Food Festival', description: 'This Saturday matches your "foodie" interest. Free entry!' },
    ],
    streakDays: 2,
    weeklyGoalProgress: 30,
  },
};

export function MiniAppDashboard() {
  const { currentAspect, theme } = useAppStore();
  const currentAspectConfig = aspects.find((a) => a.id === currentAspect);
  const data = aspectData[currentAspect] || aspectData.training;
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  if (currentAspect === 'settings') {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-5 space-y-5">
      {/* Header with Streak & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${currentAspectConfig?.color}15`, color: currentAspectConfig?.color }}
          >
            <Zap className="h-4 w-4" />
            {data.streakDays} day streak
          </div>
          <div className={cn("text-sm", theme === 'light' ? "text-slate-500" : "text-white/40")}>
            Weekly: {data.weeklyGoalProgress}% complete
          </div>
        </div>
        <div 
          className="w-24 h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: `${currentAspectConfig?.color}20` }}
        >
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${data.weeklyGoalProgress}%`,
              backgroundColor: currentAspectConfig?.color 
            }}
          />
        </div>
      </div>

      {/* Quick Actions - Main Value Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {data.quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              className={cn(
                "p-4 rounded-2xl border transition-all group text-left",
                theme === 'light'
                  ? "bg-white/80 hover:bg-white border-slate-200 hover:border-violet-200 shadow-sm hover:shadow-md"
                  : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${action.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: action.color }} />
                </div>
                {action.points && (
                  <span className={cn("text-xs font-medium", theme === 'light' ? "text-amber-500" : "text-amber-400")}>+{action.points} pts</span>
                )}
              </div>
              <p className={cn("font-medium text-sm", theme === 'light' ? "text-slate-800" : "text-white")}>{action.label}</p>
              <p className={cn("text-xs mt-0.5", theme === 'light' ? "text-slate-500" : "text-white/40")}>{action.description}</p>
            </button>
          );
        })}
      </div>

      {/* Today's Focus Card */}
      <div
        className={cn("p-4 rounded-2xl border", theme === 'light' && "shadow-sm")}
        style={{
          backgroundColor: `${currentAspectConfig?.color}${theme === 'light' ? '08' : '08'}`,
          borderColor: `${currentAspectConfig?.color}20`
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" style={{ color: currentAspectConfig?.color }} />
            <span className={cn("text-sm", theme === 'light' ? "text-slate-500" : "text-white/60")}>Today's Focus</span>
          </div>
          <span
            className="text-sm font-medium"
            style={{ color: currentAspectConfig?.color }}
          >
            {data.todayFocus.progress}%
          </span>
        </div>
        <h3 className={cn("font-semibold mb-1", theme === 'light' ? "text-slate-800" : "text-white")}>{data.todayFocus.title}</h3>
        <p className={cn("text-sm mb-3", theme === 'light' ? "text-slate-500" : "text-white/50")}>{data.todayFocus.target}</p>
        <div className={cn("w-full h-2 rounded-full overflow-hidden", theme === 'light' ? "bg-slate-200" : "bg-white/10")}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${data.todayFocus.progress}%`,
              backgroundColor: currentAspectConfig?.color
            }}
          />
        </div>
      </div>

      {/* AI Insights - The Real Value */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className={cn("text-sm font-medium", theme === 'light' ? "text-slate-600" : "text-white/60")}>AI Insights</span>
        </div>

        {data.aiInsights.map((insight, i) => (
          <div
            key={i}
            className={cn(
              'p-4 rounded-2xl border transition-all cursor-pointer',
              theme === 'light'
                ? expandedInsight === i ? 'border-violet-200 shadow-md' : 'border-slate-200 hover:border-violet-200 shadow-sm hover:shadow-md'
                : expandedInsight === i ? 'border-white/20' : 'border-white/5 hover:border-white/10'
            )}
            style={{
              backgroundColor: theme === 'light'
                ? insight.type === 'opportunity'
                  ? `${currentAspectConfig?.color}08`
                  : insight.type === 'alert'
                  ? 'rgba(251, 191, 36, 0.06)'
                  : 'white'
                : insight.type === 'opportunity'
                ? `${currentAspectConfig?.color}10`
                : insight.type === 'alert'
                ? 'rgba(251, 191, 36, 0.08)'
                : 'rgba(255, 255, 255, 0.03)'
            }}
            onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: insight.type === 'opportunity'
                    ? `${currentAspectConfig?.color}25`
                    : insight.type === 'alert'
                    ? 'rgba(251, 191, 36, 0.2)'
                    : theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                {insight.type === 'opportunity' && <TrendingUp className="h-4 w-4" style={{ color: currentAspectConfig?.color }} />}
                {insight.type === 'alert' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                {insight.type === 'tip' && <Lightbulb className={cn("h-4 w-4", theme === 'light' ? "text-slate-500" : "text-white/60")} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={cn("font-medium text-sm", theme === 'light' ? "text-slate-800" : "text-white")}>{insight.title}</h4>
                  <ChevronRight className={cn(
                    'h-4 w-4 transition-transform',
                    theme === 'light' ? "text-slate-400" : "text-white/30",
                    expandedInsight === i && 'rotate-90'
                  )} />
                </div>
                <p className={cn("text-sm mt-1", theme === 'light' ? "text-slate-500" : "text-white/50")}>{insight.description}</p>

                {insight.action && expandedInsight === i && (
                  <Button
                    size="sm"
                    className="mt-3 h-8 rounded-lg text-xs gap-1 text-white"
                    style={{
                      background: `linear-gradient(135deg, ${currentAspectConfig?.color}, ${currentAspectConfig?.color}80)`
                    }}
                  >
                    {insight.action}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className={cn("h-4 w-4", theme === 'light' ? "text-slate-400" : "text-white/40")} />
            <span className={cn("text-sm", theme === 'light' ? "text-slate-500" : "text-white/40")}>Recent Activity</span>
          </div>
          <button className={cn("text-xs transition-colors", theme === 'light' ? "text-slate-400 hover:text-violet-600" : "text-white/40 hover:text-white/60")}>
            View All
          </button>
        </div>
        <div className="space-y-2">
          {[1, 2].map((_, i) => (
            <div key={i} className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all",
              theme === 'light'
                ? "bg-white/60 hover:bg-white shadow-sm hover:shadow-md border border-slate-100"
                : "bg-white/3 hover:bg-white/5"
            )}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${currentAspectConfig?.color}15` }}
              >
                <CheckCircle2 className="h-4 w-4" style={{ color: currentAspectConfig?.color }} />
              </div>
              <div className="flex-1">
                <p className={cn("text-sm", theme === 'light' ? "text-slate-700" : "text-white/80")}>Completed daily goal</p>
                <p className={cn("text-xs", theme === 'light' ? "text-slate-400" : "text-white/30")}>{i === 0 ? 'Today, 9:32 AM' : 'Yesterday, 6:15 PM'}</p>
              </div>
              <span className={cn("text-xs font-medium", theme === 'light' ? "text-amber-500" : "text-amber-400")}>+25 pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
