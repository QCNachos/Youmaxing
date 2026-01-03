'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Award,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Star,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from 'date-fns';
import { aspects } from '@/lib/aspects';
import type { AspectType } from '@/types/database';

type ObjectiveStatus = 'active' | 'completed' | 'cancelled' | 'paused';

type MonthlyObjective = {
  id: string;
  title: string;
  description?: string;
  aspect: AspectType;
  type: 'personal' | 'job';
  status: ObjectiveStatus;
  priority: 'low' | 'medium' | 'high';
  progress_percentage: number;
  target_month: string; // YYYY-MM
  estimated_duration_days: number;
  success_criteria?: string[];
  completed_at?: string;
  created_at: string;
  weekly_goals?: WeeklyObjective[];
};

type WeeklyObjective = {
  id: string;
  title: string;
  description?: string;
  aspect: AspectType;
  type: 'personal' | 'job';
  status: ObjectiveStatus;
  priority: 'low' | 'medium' | 'high';
  progress_percentage: number;
  target_week_start: string; // YYYY-MM-DD (Monday)
  monthly_objective_id?: string;
  estimated_duration_days: number;
  success_criteria?: string[];
  completed_at?: string;
  created_at: string;
  daily_tasks?: DailyTask[];
};

type DailyTask = {
  id: string;
  title: string;
  description?: string;
  aspect: AspectType;
  type: 'personal' | 'job';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  target_date: string; // YYYY-MM-DD
  weekly_objective_id?: string;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  completed_at?: string;
  created_at: string;
};

const mockMonthlyObjectives: MonthlyObjective[] = [
  {
    id: 'm1',
    title: 'Launch Mobile App',
    description: 'Complete development and launch the mobile application to production',
    aspect: 'business',
    type: 'job',
    status: 'active',
    priority: 'high',
    progress_percentage: 65,
    target_month: format(new Date(), 'yyyy-MM'),
    estimated_duration_days: 30,
    success_criteria: [
      'App submitted to app stores',
      'Beta testing completed',
      'User feedback incorporated',
      'Launch marketing campaign ready'
    ],
    created_at: new Date().toISOString(),
    weekly_goals: []
  },
  {
    id: 'm2',
    title: 'Improve Fitness Routine',
    description: 'Build consistent workout habits and improve overall fitness',
    aspect: 'training',
    type: 'personal',
    status: 'active',
    priority: 'medium',
    progress_percentage: 80,
    target_month: format(new Date(), 'yyyy-MM'),
    estimated_duration_days: 30,
    success_criteria: [
      'Workout 4x per week consistently',
      'Increase strength by 10%',
      'Complete a 5K run',
      'Track nutrition daily'
    ],
    created_at: new Date().toISOString(),
    weekly_goals: []
  },
  {
    id: 'm3',
    title: 'Financial Planning',
    description: 'Review and optimize monthly budget and savings goals',
    aspect: 'finance',
    type: 'personal',
    status: 'completed',
    priority: 'high',
    progress_percentage: 100,
    target_month: format(new Date(), 'yyyy-MM'),
    estimated_duration_days: 15,
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    weekly_goals: []
  }
];

const mockWeeklyObjectives: WeeklyObjective[] = [
  {
    id: 'w1',
    title: 'Complete App UI Design',
    description: 'Finish designing the main user interface screens',
    aspect: 'business',
    type: 'job',
    status: 'active',
    priority: 'high',
    progress_percentage: 70,
    target_week_start: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    monthly_objective_id: 'm1',
    estimated_duration_days: 5,
    success_criteria: ['Wireframes approved', 'Design system documented', 'User testing scheduled'],
    created_at: new Date().toISOString(),
    daily_tasks: []
  },
  {
    id: 'w2',
    title: 'Strength Training Program',
    description: 'Focus on building upper body strength this week',
    aspect: 'training',
    type: 'personal',
    status: 'active',
    priority: 'medium',
    progress_percentage: 60,
    target_week_start: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    monthly_objective_id: 'm2',
    estimated_duration_days: 7,
    success_criteria: ['3 strength sessions completed', 'Track progress measurements', 'Adjust program based on results'],
    created_at: new Date().toISOString(),
    daily_tasks: []
  }
];

const mockDailyTasks: DailyTask[] = [
  {
    id: 'd1',
    title: 'Review design mockups',
    description: 'Go through latest UI designs and provide feedback',
    aspect: 'business',
    type: 'job',
    status: 'completed',
    priority: 'high',
    target_date: format(new Date(), 'yyyy-MM-dd'),
    weekly_objective_id: 'w1',
    estimated_duration_minutes: 120,
    actual_duration_minutes: 90,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'd2',
    title: 'Upper body workout',
    description: 'Bench press, shoulder press, and rows',
    aspect: 'training',
    type: 'personal',
    status: 'in_progress',
    priority: 'medium',
    target_date: format(new Date(), 'yyyy-MM-dd'),
    weekly_objective_id: 'w2',
    estimated_duration_minutes: 60,
    created_at: new Date().toISOString()
  },
  {
    id: 'd3',
    title: 'Code review',
    description: 'Review pull requests for the authentication module',
    aspect: 'business',
    type: 'job',
    status: 'pending',
    priority: 'medium',
    target_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    weekly_objective_id: 'w1',
    estimated_duration_minutes: 90,
    created_at: new Date().toISOString()
  }
];

export function ObjectivesSystem() {
  const [monthlyObjectives, setMonthlyObjectives] = useState<MonthlyObjective[]>(mockMonthlyObjectives);
  const [weeklyObjectives, setWeeklyObjectives] = useState<WeeklyObjective[]>(mockWeeklyObjectives);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(mockDailyTasks);
  const [selectedLevel, setSelectedLevel] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [editingObjective, setEditingObjective] = useState<any>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    aspect: 'business' as AspectType,
    type: 'personal' as 'personal' | 'job',
    level: 'monthly' as 'monthly' | 'weekly' | 'daily',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimated_duration_days: 30,
    success_criteria: [] as string[],
    monthly_objective_id: '',
    target_date: format(new Date(), 'yyyy-MM-dd')
  });

  // Calculate progress and update hierarchical completion
  useEffect(() => {
    // Update weekly objectives based on daily tasks
    const updatedWeeklyObjectives = weeklyObjectives.map(weekly => {
      const relatedTasks = dailyTasks.filter(task => task.weekly_objective_id === weekly.id);
      const completedTasks = relatedTasks.filter(task => task.status === 'completed').length;
      const totalTasks = relatedTasks.length;

      if (totalTasks > 0) {
        const progress = Math.round((completedTasks / totalTasks) * 100);
        return { ...weekly, progress_percentage: progress };
      }
      return weekly;
    });
    setWeeklyObjectives(updatedWeeklyObjectives);

    // Update monthly objectives based on weekly objectives
    const updatedMonthlyObjectives = monthlyObjectives.map(monthly => {
      const relatedWeeklies = updatedWeeklyObjectives.filter(weekly => weekly.monthly_objective_id === monthly.id);
      const completedWeeklies = relatedWeeklies.filter(weekly => weekly.status === 'completed').length;
      const totalWeeklies = relatedWeeklies.length;

      if (totalWeeklies > 0) {
        const progress = Math.round((completedWeeklies / totalWeeklies) * 100);
        return { ...monthly, progress_percentage: progress };
      }
      return monthly;
    });
    setMonthlyObjectives(updatedMonthlyObjectives);
  }, [dailyTasks, weeklyObjectives]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const addObjective = () => {
    const baseObjective = {
      id: `${newObjective.level}_${Date.now()}`,
      title: newObjective.title,
      description: newObjective.description,
      aspect: newObjective.aspect,
      type: newObjective.type,
      status: 'active' as ObjectiveStatus,
      priority: newObjective.priority,
      progress_percentage: 0,
      estimated_duration_days: newObjective.estimated_duration_days,
      success_criteria: newObjective.success_criteria,
      created_at: new Date().toISOString()
    };

    if (newObjective.level === 'monthly') {
      const monthlyObj: MonthlyObjective = {
        ...baseObjective,
        target_month: format(new Date(), 'yyyy-MM'),
        weekly_goals: []
      };
      setMonthlyObjectives([...monthlyObjectives, monthlyObj]);
    } else if (newObjective.level === 'weekly') {
      const weeklyObj: WeeklyObjective = {
        ...baseObjective,
        target_week_start: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
        monthly_objective_id: newObjective.monthly_objective_id || undefined,
        daily_tasks: []
      };
      setWeeklyObjectives([...weeklyObjectives, weeklyObj]);
    } else if (newObjective.level === 'daily') {
      const dailyTask: DailyTask = {
        ...baseObjective,
        target_date: newObjective.target_date,
        weekly_objective_id: newObjective.monthly_objective_id || undefined, // reusing field for weekly objective id
        status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled'
      };
      setDailyTasks([...dailyTasks, dailyTask]);
    }

    setIsAddingObjective(false);
    resetNewObjective();
  };

  const resetNewObjective = () => {
    setNewObjective({
      title: '',
      description: '',
      aspect: 'business',
      type: 'personal',
      level: 'monthly',
      priority: 'medium',
      estimated_duration_days: 30,
      success_criteria: [],
      monthly_objective_id: '',
      target_date: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const updateTaskStatus = (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    setDailyTasks(tasks =>
      tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
            }
          : task
      )
    );
  };

  const getStatusColor = (status: ObjectiveStatus | string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'active': return 'text-blue-600';
      case 'in_progress': return 'text-yellow-600';
      case 'paused': return 'text-orange-600';
      case 'cancelled': return 'text-red-600';
      case 'pending': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAspectColor = (aspectId: AspectType) => {
    return aspects.find((a) => a.id === aspectId)?.color || '#8B5CF6';
  };

  const renderMonthlyObjectives = () => (
    <div className="space-y-4">
      {monthlyObjectives.map(objective => (
        <Card key={objective.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{objective.title}</h3>
                  <Badge
                    variant={objective.status === 'completed' ? 'default' : 'secondary'}
                    className={getStatusColor(objective.status)}
                  >
                    {objective.status}
                  </Badge>
                </div>
                {objective.description && (
                  <p className="text-muted-foreground mb-3">{objective.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{objective.progress_percentage}%</span>
                </div>
                <Progress value={objective.progress_percentage} className="h-2" />
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${getAspectColor(objective.aspect)}20`,
                    color: getAspectColor(objective.aspect)
                  }}
                >
                  {aspects.find(a => a.id === objective.aspect)?.name}
                </Badge>
                <Badge variant="outline">
                  {objective.type === 'personal' ? 'Personal' : 'Job'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={`border ${getPriorityColor(objective.priority)}`}>
                  {objective.priority} priority
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {objective.estimated_duration_days} days
                </span>
              </div>
            </div>

            {objective.success_criteria && objective.success_criteria.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Success Criteria</h4>
                <div className="space-y-1">
                  {objective.success_criteria.map((criteria, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span>{criteria}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Target: {format(new Date(objective.target_month + '-01'), 'MMMM yyyy')}</span>
                {objective.completed_at && (
                  <span>Completed: {format(new Date(objective.completed_at), 'MMM d, yyyy')}</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(objective.id)}
              >
                {expandedItems.has(objective.id) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Weekly Goals
              </Button>
            </div>

            {expandedItems.has(objective.id) && (
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-3">
                  {weeklyObjectives
                    .filter(w => w.monthly_objective_id === objective.id)
                    .map(weekly => (
                      <div key={weekly.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{weekly.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {weekly.progress_percentage}% complete
                            </Badge>
                          </div>
                          <Badge className={getStatusColor(weekly.status)}>
                            {weekly.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {weeklyObjectives.filter(w => w.monthly_objective_id === objective.id).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No weekly goals set for this month
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderWeeklyObjectives = () => (
    <div className="space-y-4">
      {weeklyObjectives.map(objective => (
        <Card key={objective.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{objective.title}</h3>
                  <Badge
                    variant={objective.status === 'completed' ? 'default' : 'secondary'}
                    className={getStatusColor(objective.status)}
                  >
                    {objective.status}
                  </Badge>
                </div>
                {objective.description && (
                  <p className="text-muted-foreground mb-3">{objective.description}</p>
                )}
                {objective.monthly_objective_id && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Part of: {monthlyObjectives.find(m => m.id === objective.monthly_objective_id)?.title}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{objective.progress_percentage}%</span>
                </div>
                <Progress value={objective.progress_percentage} className="h-2" />
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${getAspectColor(objective.aspect)}20`,
                    color: getAspectColor(objective.aspect)
                  }}
                >
                  {aspects.find(a => a.id === objective.aspect)?.name}
                </Badge>
                <Badge variant="outline">
                  {objective.type === 'personal' ? 'Personal' : 'Job'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={`border ${getPriorityColor(objective.priority)}`}>
                  {objective.priority} priority
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Week of {format(new Date(objective.target_week_start), 'MMM d')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{objective.estimated_duration_days} day target</span>
                {objective.completed_at && (
                  <span>Completed: {format(new Date(objective.completed_at), 'MMM d, yyyy')}</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(objective.id)}
              >
                {expandedItems.has(objective.id) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Daily Tasks
              </Button>
            </div>

            {expandedItems.has(objective.id) && (
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-3">
                  {dailyTasks
                    .filter(t => t.weekly_objective_id === objective.id)
                    .map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-6 w-6"
                          onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                        >
                          <CheckCircle2
                            className={`h-4 w-4 ${
                              task.status === 'completed' ? 'text-green-600 fill-green-600' : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {task.status}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {task.estimated_duration_minutes}m
                        </div>
                      </div>
                    ))}
                  {dailyTasks.filter(t => t.weekly_objective_id === objective.id).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No daily tasks set for this week
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDailyTasks = () => (
    <div className="space-y-4">
      {dailyTasks.map(task => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 w-6 mt-1"
                  onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                >
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      task.status === 'completed' ? 'text-green-600 fill-green-600' : 'text-muted-foreground'
                    }`}
                  />
                </Button>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-muted-foreground mt-1 ${task.status === 'completed' ? 'line-through' : ''}`}>
                      {task.description}
                    </p>
                  )}
                  {task.weekly_objective_id && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Part of: {weeklyObjectives.find(w => w.id === task.weekly_objective_id)?.title}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${getAspectColor(task.aspect)}20`,
                    color: getAspectColor(task.aspect)
                  }}
                >
                  {aspects.find(a => a.id === task.aspect)?.name}
                </Badge>
                <Badge variant="outline">
                  {task.type === 'personal' ? 'Personal' : 'Job'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={`border ${getPriorityColor(task.priority)}`}>
                  {task.priority} priority
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(task.target_date), 'MMM d, yyyy')}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {task.estimated_duration_minutes && (
                  <span>Est: {task.estimated_duration_minutes}m</span>
                )}
                {task.actual_duration_minutes && (
                  <span>Actual: {task.actual_duration_minutes}m</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Objectives System</h1>
            <p className="text-muted-foreground">4-level hierarchical goal management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </Button>
            <Button variant="outline">
              <Star className="h-4 w-4 mr-1" />
              Templates
            </Button>
            <Button onClick={() => setIsAddingObjective(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Objective
            </Button>
          </div>
        </div>

        {/* Level Navigation */}
        <Tabs value={selectedLevel} onValueChange={(value: any) => setSelectedLevel(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Monthly Goals
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Objectives
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Daily Tasks
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {selectedLevel === 'monthly' && renderMonthlyObjectives()}
        {selectedLevel === 'weekly' && renderWeeklyObjectives()}
        {selectedLevel === 'daily' && renderDailyTasks()}
      </div>

      {/* Stats Footer */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {monthlyObjectives.filter(o => o.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Monthly Goals Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {weeklyObjectives.filter(o => o.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Weekly Objectives Done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {dailyTasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Daily Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {Math.round(
                (monthlyObjectives.reduce((sum, obj) => sum + obj.progress_percentage, 0) / monthlyObjectives.length) || 0
              )}%
            </div>
            <div className="text-sm text-muted-foreground">Average Progress</div>
          </div>
        </div>
      </div>

      {/* Add Objective Dialog */}
      <Dialog open={isAddingObjective} onOpenChange={setIsAddingObjective}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Objective</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Objective title"
                value={newObjective.title}
                onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Objective description"
                value={newObjective.description}
                onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={newObjective.level} onValueChange={(value: any) => setNewObjective({ ...newObjective, level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly Goal</SelectItem>
                    <SelectItem value="weekly">Weekly Objective</SelectItem>
                    <SelectItem value="daily">Daily Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Aspect</Label>
                <Select value={newObjective.aspect} onValueChange={(value: AspectType) => setNewObjective({ ...newObjective, aspect: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspects.map(aspect => (
                      <SelectItem key={aspect.id} value={aspect.id}>
                        {aspect.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newObjective.type} onValueChange={(value: 'personal' | 'job') => setNewObjective({ ...newObjective, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newObjective.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewObjective({ ...newObjective, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newObjective.level === 'weekly' && (
              <div className="space-y-2">
                <Label>Link to Monthly Goal</Label>
                <Select value={newObjective.monthly_objective_id} onValueChange={(value) => setNewObjective({ ...newObjective, monthly_objective_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select monthly goal (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthlyObjectives.filter(m => m.status === 'active').map(objective => (
                      <SelectItem key={objective.id} value={objective.id}>
                        {objective.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {newObjective.level === 'daily' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={newObjective.target_date}
                    onChange={(e) => setNewObjective({ ...newObjective, target_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link to Weekly Objective</Label>
                  <Select value={newObjective.monthly_objective_id} onValueChange={(value) => setNewObjective({ ...newObjective, monthly_objective_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select weekly objective (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {weeklyObjectives.filter(w => w.status === 'active').map(objective => (
                        <SelectItem key={objective.id} value={objective.id}>
                          {objective.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={addObjective}
              disabled={!newObjective.title.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {newObjective.level.charAt(0).toUpperCase() + newObjective.level.slice(1)} Objective
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
