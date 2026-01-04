'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Award,
  Zap,
  Users,
  Star,
  Lightbulb,
  BarChart,
  LineChart,
  CalendarDays,
  Timer,
  Flame,
  Trophy,
  ChevronUp,
  ChevronDown,
  Minus,
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { aspects } from '@/lib/aspects';
import type { AspectType } from '@/types/database';

type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year';

type CalendarInsight = {
  id: string;
  type: 'productivity' | 'balance' | 'overbooking' | 'goal_progress' | 'habit';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  related_aspects: AspectType[];
  suggested_actions: string[];
  data: any;
};

type ProductivityMetrics = {
  total_events: number;
  completed_tasks: number;
  total_tasks: number;
  time_blocked_hours: number;
  most_productive_aspect: AspectType;
  busiest_day_of_week: number;
  average_daily_events: number;
  goal_completion_rate: number;
  productivity_score: number;
};

type TrendData = {
  date: string;
  value: number;
  label: string;
};

const mockInsights: CalendarInsight[] = [
  {
    id: '1',
    type: 'productivity',
    title: 'Peak Productivity Time',
    description: 'You\'re most productive between 9-11 AM. Consider scheduling important tasks during this window.',
    priority: 'medium',
    actionable: true,
    related_aspects: ['business', 'training'],
    suggested_actions: ['Schedule deep work sessions 9-11 AM', 'Block calendar for focus time'],
    data: { peak_hours: [9, 10, 11], productivity_score: 85 }
  },
  {
    id: '2',
    type: 'balance',
    title: 'Work-Life Balance Opportunity',
    description: 'You\'ve had 12 work-related events this week but only 2 personal activities. Consider adding more personal time.',
    priority: 'high',
    actionable: true,
    related_aspects: ['friends', 'family', 'training'],
    suggested_actions: ['Schedule family dinner tonight', 'Book a weekend activity', 'Add personal time blocks'],
    data: { work_events: 12, personal_events: 2, ratio: 6.0 }
  },
  {
    id: '3',
    type: 'goal_progress',
    title: 'Monthly Goal Progress',
    description: 'Your "Launch Mobile App" goal is 65% complete. You\'re on track but might need to accelerate weekly objectives.',
    priority: 'medium',
    actionable: true,
    related_aspects: ['business'],
    suggested_actions: ['Review weekly objectives', 'Adjust timeline if needed', 'Add more development time'],
    data: { goal_name: 'Launch Mobile App', progress: 65, target_completion: '2024-02-15' }
  },
  {
    id: '4',
    type: 'habit',
    title: 'Consistent Exercise Streak',
    description: 'You\'ve maintained your exercise routine for 12 consecutive days. Great job! Keep it up.',
    priority: 'low',
    actionable: false,
    related_aspects: ['training'],
    suggested_actions: ['Celebrate the milestone', 'Consider increasing intensity'],
    data: { streak_days: 12, habit: 'exercise' }
  },
  {
    id: '5',
    type: 'overbooking',
    title: 'Calendar Overload Warning',
    description: 'You have 8 hours of meetings scheduled for Tuesday. This might be overwhelming.',
    priority: 'high',
    actionable: true,
    related_aspects: ['business'],
    suggested_actions: ['Reschedule 2 meetings', 'Decline low-priority requests', 'Add buffer time between meetings'],
    data: { day: 'Tuesday', hours_scheduled: 8, recommended_max: 6 }
  }
];

const mockProductivityData: ProductivityMetrics = {
  total_events: 47,
  completed_tasks: 23,
  total_tasks: 28,
  time_blocked_hours: 38.5,
  most_productive_aspect: 'business',
  busiest_day_of_week: 2, // Tuesday
  average_daily_events: 6.7,
  goal_completion_rate: 72,
  productivity_score: 78
};

const mockTrendData: TrendData[] = [
  { date: '2024-01-01', value: 65, label: 'Mon' },
  { date: '2024-01-02', value: 72, label: 'Tue' },
  { date: '2024-01-03', value: 78, label: 'Wed' },
  { date: '2024-01-04', value: 82, label: 'Thu' },
  { date: '2024-01-05', value: 75, label: 'Fri' },
  { date: '2024-01-06', value: 68, label: 'Sat' },
  { date: '2024-01-07', value: 71, label: 'Sun' }
];

const mockAspectBreakdown = [
  { aspect: 'business', hours: 18.5, percentage: 48, color: '#3B82F6' },
  { aspect: 'training', hours: 6.2, percentage: 16, color: '#EF4444' },
  { aspect: 'friends', hours: 4.8, percentage: 12, color: '#F97316' },
  { aspect: 'food', hours: 3.5, percentage: 9, color: '#4ECDC4' },
  { aspect: 'finance', hours: 2.8, percentage: 7, color: '#22C55E' },
  { aspect: 'business', hours: 2.7, percentage: 7, color: '#A855F7' },
  { aspect: 'other', hours: 0.0, percentage: 1, color: '#6B7280' }
];

export function CalendarAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('week');
  const [insights, setInsights] = useState<CalendarInsight[]>(mockInsights);
  const [productivityData, setProductivityData] = useState<ProductivityMetrics>(mockProductivityData);
  const [trendData, setTrendData] = useState<TrendData[]>(mockTrendData);
  const [aspectBreakdown, setAspectBreakdown] = useState(mockAspectBreakdown);

  const getPeriodDateRange = (period: AnalyticsPeriod) => {
    const now = new Date();
    switch (period) {
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        return { start: quarterStart, end: quarterEnd };
      case 'year':
        return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) };
      default:
        return { start: startOfWeek(now), end: endOfWeek(now) };
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'productivity': return <TrendingUp className="h-5 w-5" />;
      case 'balance': return <Activity className="h-5 w-5" />;
      case 'overbooking': return <AlertTriangle className="h-5 w-5" />;
      case 'goal_progress': return <Target className="h-5 w-5" />;
      case 'habit': return <Award className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ChevronUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <ChevronDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Calendar Analytics</h1>
            <p className="text-muted-foreground">Insights and progress tracking for your calendar</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={(value: AnalyticsPeriod) => setSelectedPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-1" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{productivityData.total_events}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{productivityData.completed_tasks}</p>
                  <p className="text-xs text-muted-foreground">Tasks Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatHours(productivityData.time_blocked_hours)}</p>
                  <p className="text-xs text-muted-foreground">Time Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{productivityData.productivity_score}%</p>
                  <p className="text-xs text-muted-foreground">Productivity Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productivity Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Productivity Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {productivityData.productivity_score}%
                    </div>
                    <Progress value={productivityData.productivity_score} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Task Completion</p>
                      <p className="font-medium">
                        {Math.round((productivityData.completed_tasks / productivityData.total_tasks) * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Goal Progress</p>
                      <p className="font-medium">{productivityData.goal_completion_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Daily Events</p>
                      <p className="font-medium">{productivityData.average_daily_events}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Most Productive</p>
                      <p className="font-medium">
                        {aspects.find(a => a.id === productivityData.most_productive_aspect)?.name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Goals</span>
                        <span>2/3 completed</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Weekly Objectives</span>
                        <span>3/4 completed</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Daily Tasks</span>
                        <span>23/28 completed</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Flame className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">12-day exercise streak</p>
                        <p className="text-xs text-muted-foreground">Keep it up!</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Completed monthly goal</p>
                        <p className="text-xs text-muted-foreground">Financial planning</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">High productivity week</p>
                        <p className="text-xs text-muted-foreground">85% score</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">6.7</p>
                      <p className="text-xs text-muted-foreground">Avg Events/Day</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">82%</p>
                      <p className="text-xs text-muted-foreground">Task Success</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">Tue</p>
                      <p className="text-xs text-muted-foreground">Busiest Day</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-500">38.5h</p>
                      <p className="text-xs text-muted-foreground">Time Blocked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <div className="space-y-4">
              {insights.map(insight => (
                <Card key={insight.id} className={`border-l-4 ${
                  insight.priority === 'high' ? 'border-l-red-500' :
                  insight.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        insight.priority === 'high' ? 'bg-red-500/20' :
                        insight.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                      }`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium">{insight.title}</h3>
                          <Badge className={`border ${getInsightColor(insight.priority)}`}>
                            {insight.priority} priority
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{insight.description}</p>

                        {insight.related_aspects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {insight.related_aspects.map(aspect => (
                              <Badge
                                key={aspect}
                                variant="secondary"
                                style={{
                                  backgroundColor: `${aspects.find(a => a.id === aspect)?.color}20`,
                                  color: aspects.find(a => a.id === aspect)?.color
                                }}
                              >
                                {aspects.find(a => a.id === aspect)?.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {insight.actionable && insight.suggested_actions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Suggested Actions:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {insight.suggested_actions.map((action, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productivity Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Productivity Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {trendData.map((data, index) => (
                      <div key={data.date} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-primary rounded-t"
                          style={{ height: `${(data.value / 100) * 200}px` }}
                        />
                        <span className="text-xs text-muted-foreground mt-2">{data.label}</span>
                        <span className="text-xs font-medium">{data.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Time Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aspectBreakdown.map(aspect => (
                      <div key={aspect.aspect} className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: aspect.color }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{aspects.find(a => a.id === aspect.aspect)?.name || aspect.aspect}</span>
                            <span>{aspect.hours}h ({aspect.percentage}%)</span>
                          </div>
                          <Progress value={aspect.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Goal Progress Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Goal Completion Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Monthly Goals</span>
                        <span className="flex items-center gap-1">
                          {getTrendIcon(67, 60)}
                          67%
                        </span>
                      </div>
                      <Progress value={67} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">+7% from last week</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Weekly Objectives</span>
                        <span className="flex items-center gap-1">
                          {getTrendIcon(75, 70)}
                          75%
                        </span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">+5% from last week</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Daily Tasks</span>
                        <span className="flex items-center gap-1">
                          {getTrendIcon(82, 78)}
                          82%
                        </span>
                      </div>
                      <Progress value={82} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">+4% from last week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Events Created</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(47, 42)}
                        <span className="font-medium">47</span>
                        <span className="text-xs text-muted-foreground">(+12%)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tasks Completed</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(23, 20)}
                        <span className="font-medium">23</span>
                        <span className="text-xs text-muted-foreground">(+15%)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Time Blocked</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(38.5, 35.2)}
                        <span className="font-medium">38.5h</span>
                        <span className="text-xs text-muted-foreground">(+9%)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Productivity Score</span>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(78, 74)}
                        <span className="font-medium">78%</span>
                        <span className="text-xs text-muted-foreground">(+5%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aspect Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Time by Life Aspect</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aspectBreakdown.map(aspect => (
                      <div key={aspect.aspect} className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: aspect.color }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">
                              {aspects.find(a => a.id === aspect.aspect)?.name || aspect.aspect}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatHours(aspect.hours)}
                            </span>
                          </div>
                          <Progress value={aspect.percentage} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {aspect.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded bg-red-500" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">High Priority</span>
                          <span className="text-sm text-muted-foreground">12 events</span>
                        </div>
                        <Progress value={40} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">40%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded bg-yellow-500" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Medium Priority</span>
                          <span className="text-sm text-muted-foreground">15 events</span>
                        </div>
                        <Progress value={50} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">50%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded bg-green-500" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Low Priority</span>
                          <span className="text-sm text-muted-foreground">3 events</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">10%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal vs Job</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded bg-blue-500" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Job Related</span>
                          <span className="text-sm text-muted-foreground">28 events</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">60%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded bg-purple-500" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Personal</span>
                          <span className="text-sm text-muted-foreground">19 events</span>
                        </div>
                        <Progress value={40} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">40%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completion Rates */}
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Daily Tasks</span>
                        <span>82% (23/28)</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Weekly Objectives</span>
                        <span>75% (3/4)</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Monthly Goals</span>
                        <span>67% (2/3)</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Event Attendance</span>
                        <span>94% (44/47)</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}







