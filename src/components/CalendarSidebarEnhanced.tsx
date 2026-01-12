'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Target, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon,
  User,
  Briefcase,
  ExternalLink,
  Trash2,
  Edit,
  X,
  Loader2,
  AlertCircle,
  Expand,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { aspects } from '@/lib/aspects';
import type { AspectType } from '@/types/database';
import { useTasksAndObjectives } from '@/hooks/useTasksAndObjectives';
import { 
  generateUnifiedEvents, 
  type CalendarEvent,
} from '@/lib/unifiedCalendar';
import { useTrips } from '@/hooks/useTravel';
import { tripsToCalendarEvents } from '@/lib/tripsToCalendar';
import { ExpandedObjectivesDialogEnhanced } from '@/components/ExpandedObjectivesDialogEnhanced';

type DialogType = 'addTask' | 'addWeekly' | 'addMonthly' | 'editTask' | 'editWeekly' | 'editMonthly' | 'addEvent' | null;

export function CalendarSidebarEnhanced() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'tasks' | 'objectives'>('events');
  const [typeFilter, setTypeFilter] = useState<'all' | 'personal' | 'job'>('all');
  const [manualEvents, setManualEvents] = useState<CalendarEvent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [objectivesExpanded, setObjectivesExpanded] = useState(false);
  
  // Fetch user's trips for calendar integration
  const { trips } = useTrips();

  // Debug: Log trips to verify they're being fetched
  useEffect(() => {
    console.log('📅 Calendar: Trips loaded:', trips);
  }, [trips]);

  // Use the tasks and objectives hook
  const {
    tasks,
    weeklyObjectives,
    monthlyObjectives,
    loading,
    error,
    addTask,
    editTask,
    removeTask,
    toggleTask,
    addWeeklyObjective,
    editWeeklyObjective,
    removeWeeklyObjective,
    addMonthlyObjective,
    editMonthlyObjective,
    removeMonthlyObjective,
  } = useTasksAndObjectives(date || new Date());

  // Form states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    aspect_id: 'training' as AspectType,
    type: 'personal' as 'personal' | 'job',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimated_duration_minutes: 30,
  });

  const [objectiveForm, setObjectiveForm] = useState({
    title: '',
    description: '',
    aspect_id: 'training' as AspectType,
    type: 'personal' as 'personal' | 'job',
    priority: 'medium' as 'low' | 'medium' | 'high',
    progress_percentage: 0,
  });

  // Filter out settings from aspect list for tasks/objectives
  const validAspects = aspects.filter(a => a.id !== 'settings');

  // Event form state (for manual calendar events)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    aspect: 'events' as AspectType,
    type: 'personal' as 'personal' | 'job',
    time: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Generate unified events from all mini-apps + manual events + trips
  const events = useMemo(() => {
    const unified = generateUnifiedEvents();
    const tripEvents = tripsToCalendarEvents(trips);
    console.log('📅 Calendar: Trip events generated:', tripEvents);
    console.log('📅 Calendar: Total events:', [...unified, ...tripEvents, ...manualEvents].length);
    return [...unified, ...tripEvents, ...manualEvents];
  }, [manualEvents, trips]);

  // Apply type filter
  const filteredEvents = events.filter(event => 
    typeFilter === 'all' ? true : event.type === typeFilter
  );

  const filteredTasks = tasks.filter(task => 
    typeFilter === 'all' ? true : task.type === typeFilter
  );

  const filteredWeeklyObjectives = weeklyObjectives.filter(obj => 
    typeFilter === 'all' ? true : obj.type === typeFilter
  );

  const filteredMonthlyObjectives = monthlyObjectives.filter(obj => 
    typeFilter === 'all' ? true : obj.type === typeFilter
  );

  const todayEvents = filteredEvents.filter(
    (event) => date && isSameDay(event.date, date)
  );

  const getAspectColor = (aspectId: AspectType) => {
    return aspects.find((a) => a.id === aspectId)?.color || '#888';
  };

  const getPriorityColor = (priority: string, filled: boolean = false) => {
    // In dark mode (filled=true), use filled backgrounds. In light mode, use lighter backgrounds.
    if (filled) {
      switch (priority) {
        case 'high': return 'text-white bg-red-500 border-red-500 dark:bg-red-500 dark:border-red-500';
        case 'medium': return 'text-white bg-yellow-500 border-yellow-500 dark:bg-yellow-500 dark:border-yellow-500';
        case 'low': return 'text-white bg-green-500 border-green-500 dark:bg-green-500 dark:border-green-500';
        default: return 'text-white bg-gray-500 border-gray-500';
      }
    }
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/20 dark:border-red-500/50';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/20 dark:border-yellow-500/50';
      case 'low': return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-500/20 dark:border-green-500/50';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-500/20 dark:border-gray-500/50';
    }
  };

  // Navigate to aspect mini-app
  const goToAspect = (aspectId: AspectType) => {
    if (aspectId !== 'settings') {
      router.push(`/${aspectId}`);
    }
  };

  // Calculate stats
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const totalTasks = filteredTasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Dialog handlers
  const openAddTaskDialog = () => {
    setTaskForm({
      title: '',
      description: '',
      aspect_id: 'training',
      type: 'personal',
      priority: 'medium',
      estimated_duration_minutes: 30,
    });
    setEditingId(null);
    setDialogType('addTask');
  };

  const openEditTaskDialog = (task: typeof tasks[0]) => {
    setTaskForm({
      title: task.title,
      description: task.description || '',
      aspect_id: task.aspect_id as AspectType,
      type: task.type as 'personal' | 'job',
      priority: task.priority as 'low' | 'medium' | 'high',
      estimated_duration_minutes: task.estimated_duration_minutes || 30,
    });
    setEditingId(task.id);
    setDialogType('editTask');
  };

  const openAddWeeklyDialog = () => {
    setObjectiveForm({
      title: '',
      description: '',
      aspect_id: 'training',
      type: 'personal',
      priority: 'medium',
      progress_percentage: 0,
    });
    setEditingId(null);
    setDialogType('addWeekly');
  };

  const openEditWeeklyDialog = (objective: typeof weeklyObjectives[0]) => {
    setObjectiveForm({
      title: objective.title,
      description: objective.description || '',
      aspect_id: objective.aspect_id as AspectType,
      type: objective.type as 'personal' | 'job',
      priority: objective.priority as 'low' | 'medium' | 'high',
      progress_percentage: objective.progress_percentage,
    });
    setEditingId(objective.id);
    setDialogType('editWeekly');
  };

  const openAddMonthlyDialog = () => {
    setObjectiveForm({
      title: '',
      description: '',
      aspect_id: 'training',
      type: 'personal',
      priority: 'medium',
      progress_percentage: 0,
    });
    setEditingId(null);
    setDialogType('addMonthly');
  };

  const openEditMonthlyDialog = (objective: typeof monthlyObjectives[0]) => {
    setObjectiveForm({
      title: objective.title,
      description: objective.description || '',
      aspect_id: objective.aspect_id as AspectType,
      type: objective.type as 'personal' | 'job',
      priority: objective.priority as 'low' | 'medium' | 'high',
      progress_percentage: objective.progress_percentage,
    });
    setEditingId(objective.id);
    setDialogType('editMonthly');
  };

  const closeDialog = () => {
    setDialogType(null);
    setEditingId(null);
  };

  // Event handlers
  const openAddEventDialog = () => {
    setEventForm({
      title: '',
      description: '',
      aspect: 'events',
      type: 'personal',
      time: '',
      priority: 'medium'
    });
    setDialogType('addEvent');
  };

  const handleEventSubmit = () => {
    const event: CalendarEvent = {
      id: `manual-${Date.now()}`,
      title: eventForm.title,
      description: eventForm.description,
      aspect: eventForm.aspect,
      type: eventForm.type,
      date: date || new Date(),
      time: eventForm.time,
      priority: eventForm.priority,
      status: 'scheduled',
      source: 'manual',
    };
    setManualEvents([...manualEvents, event]);
    closeDialog();
  };

  // CRUD handlers
  const handleTaskSubmit = async () => {
    try {
      if (dialogType === 'editTask' && editingId) {
        await editTask(editingId, taskForm);
      } else {
        await addTask(taskForm);
      }
      closeDialog();
    } catch (err: any) {
      console.error('Error saving task:', err);
      const errorMsg = err?.message || 'Failed to save task. Make sure you ran the database migration!';
      alert(`Error: ${errorMsg}\n\nIf you see "foreign key constraint", you need to run the migration file: 00013_fix_life_aspects.sql`);
    }
  };

  const handleWeeklySubmit = async () => {
    try {
      if (dialogType === 'editWeekly' && editingId) {
        await editWeeklyObjective(editingId, objectiveForm);
      } else {
        await addWeeklyObjective(objectiveForm);
      }
      closeDialog();
    } catch (err: any) {
      console.error('Error saving weekly objective:', err);
      const errorMsg = err?.message || 'Failed to save weekly objective';
      alert(`Error: ${errorMsg}\n\nIf you see "foreign key constraint" or "409", you need to run the migration file: 00013_fix_life_aspects.sql`);
    }
  };

  const handleMonthlySubmit = async () => {
    try {
      if (dialogType === 'editMonthly' && editingId) {
        await editMonthlyObjective(editingId, objectiveForm);
      } else {
        await addMonthlyObjective(objectiveForm);
      }
      closeDialog();
    } catch (err: any) {
      console.error('Error saving monthly objective:', err);
      const errorMsg = err?.message || 'Failed to save monthly objective';
      alert(`Error: ${errorMsg}\n\nIf you see "foreign key constraint" or "409", you need to run the migration file: 00013_fix_life_aspects.sql`);
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      await removeTask(id);
    }
  };

  const handleDeleteWeekly = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this objective?')) {
      await removeWeeklyObjective(id);
    }
  };

  const handleDeleteMonthly = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this objective?')) {
      await removeMonthlyObjective(id);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Month Navigation */}
      <div className="px-3 pt-2 pb-1 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-foreground text-sm">{format(currentMonth, 'MMMM yyyy')}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-2 py-1 flex justify-center flex-shrink-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="rounded-md w-full max-w-[300px] [&_td]:p-0 [&_th]:p-0 [&_button]:h-8 [&_button]:w-8"
          showOutsideDays={false}
        />
      </div>

      {/* Type Filter */}
      <div className="px-3 py-2 border-t border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Show:</span>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            <button
              onClick={() => setTypeFilter('all')}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                typeFilter === 'all'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Both
            </button>
            <button
              onClick={() => setTypeFilter('personal')}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                typeFilter === 'personal'
                  ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="h-3 w-3" />
              Personal
            </button>
            <button
              onClick={() => setTypeFilter('job')}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1",
                typeFilter === 'job'
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Briefcase className="h-3 w-3" />
              Job
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-3 mb-1 p-1.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-xs flex-shrink-0">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs for Events/Tasks/Objectives */}
      <div className="flex-1 border-t border-border flex flex-col min-h-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'events' | 'tasks' | 'objectives')} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 mx-3 mt-2 mb-1 flex-shrink-0 h-8" style={{ width: 'calc(100% - 24px)' }}>
            <TabsTrigger value="events" className="text-xs h-7">
              <CalendarIcon className="h-3 w-3 mr-1" />
              Events
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs h-7">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="objectives" className="text-xs h-7">
              <Target className="h-3 w-3 mr-1" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="flex-1 overflow-hidden m-0 px-3 pb-2 flex flex-col min-h-0" style={{ marginTop: 0 }}>
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="font-medium text-xs">
                {date ? format(date, 'EEE, MMM d') : 'Select a date'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2"
                onClick={() => setObjectivesExpanded(true)}
              >
                <Expand className="h-3 w-3" />
                Expand
              </Button>
            </div>
            {todayEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-muted-foreground mb-1.5 opacity-50" />
                <p className="text-xs text-muted-foreground">No events scheduled</p>
                <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={openAddEventDialog}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Event
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 -mx-3 px-3 min-h-0">
                  <div className="space-y-1.5 pb-1">
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => goToAspect(event.aspect)}
                        className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border group"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-sm" style={{ backgroundColor: `${getAspectColor(event.aspect)}15` }}>
                            {event.emoji || '📅'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-xs truncate">{event.title}</p>
                              {event.status === 'completed' && (
                                <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                              )}
                              <ExternalLink className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {event.time && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Clock className="h-2.5 w-2.5" />
                                  {event.time}
                                </span>
                              )}
                              {event.type === 'job' ? (
                                <Badge variant="outline" className="text-[10px] h-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-1">
                                  Job
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] h-4 px-1"
                                  style={{ 
                                    backgroundColor: `${getAspectColor(event.aspect)}20`,
                                    color: getAspectColor(event.aspect)
                                  }}
                                >
                                  {aspects.find((a) => a.id === event.aspect)?.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-full mt-1 h-7 text-xs text-muted-foreground hover:text-foreground flex-shrink-0" 
                  onClick={openAddEventDialog}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Event
                </Button>
              </>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="flex-1 overflow-hidden m-0 px-3 pb-2 flex flex-col min-h-0" style={{ marginTop: 0 }}>
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-xs">Tasks</h3>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                  {completedTasks}/{totalTasks}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2"
                onClick={() => setObjectivesExpanded(true)}
              >
                <Expand className="h-3 w-3" />
                Expand
              </Button>
            </div>
            <Progress value={taskProgress} className="h-1 mb-2 flex-shrink-0" />
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-muted-foreground mb-1.5 opacity-50" />
                <p className="text-xs text-muted-foreground mb-2">No tasks for today</p>
                <Button size="sm" onClick={openAddTaskDialog} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Task
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 -mx-3 px-3 min-h-0">
                  <div className="space-y-1.5 pb-1">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border group"
                      >
                        <CheckCircle2
                          className={`h-4 w-4 flex-shrink-0 transition-colors cursor-pointer ${
                            task.status === 'completed' 
                              ? 'text-green-500 fill-green-500' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => toggleTask(task.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`block text-xs truncate ${
                            task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {task.type === 'job' ? (
                              <Badge variant="outline" className="text-[10px] h-3.5 px-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                                Job
                              </Badge>
                            ) : task.aspect_id && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-3.5 px-1"
                                style={{ 
                                  backgroundColor: `${getAspectColor(task.aspect_id as AspectType)}20`,
                                  color: getAspectColor(task.aspect_id as AspectType)
                                }}
                              >
                                {aspects.find((a) => a.id === task.aspect_id)?.name}
                              </Badge>
                            )}
                            {task.estimated_duration_minutes && (
                              <span className="text-[10px] text-muted-foreground">
                                {task.estimated_duration_minutes}m
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] h-4 px-1 border",
                            getPriorityColor(task.priority)
                          )}
                        >
                          {task.priority[0].toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => openEditTaskDialog(task)}
                          >
                            <Edit className="h-2.5 w-2.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={(e) => handleDeleteTask(task.id, e)}
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-1.5 h-7 text-xs flex-shrink-0" 
                  onClick={openAddTaskDialog}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Task
                </Button>
              </>
            )}
          </TabsContent>

          {/* Objectives Tab */}
          <TabsContent value="objectives" className="flex-1 overflow-hidden m-0 px-3 pb-2 flex flex-col min-h-0" style={{ marginTop: 0 }}>
            {/* Header with Expand Button */}
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
              <h3 className="font-medium text-xs">Goals & Objectives</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2"
                onClick={() => setObjectivesExpanded(true)}
              >
                <Expand className="h-3 w-3" />
                Expand
              </Button>
            </div>
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="flex-1 -mx-3 px-3 min-h-0">
                <div className="space-y-3 pb-1">
                  {/* Monthly Goals */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                        Monthly Goals
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px]"
                        onClick={openAddMonthlyDialog}
                      >
                        <Plus className="h-2.5 w-2.5 mr-0.5" />
                        Add
                      </Button>
                    </div>
                    {filteredMonthlyObjectives.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground text-center py-2">
                        No monthly goals yet
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {filteredMonthlyObjectives.map(obj => (
                          <div 
                            key={obj.id} 
                            className="p-2 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors group"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-xs font-medium flex-1 truncate pr-1">{obj.title}</span>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => openEditMonthlyDialog(obj)}
                                >
                                  <Edit className="h-2.5 w-2.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                  onClick={(e) => handleDeleteMonthly(obj.id, e)}
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Progress value={obj.progress_percentage} className="h-1 flex-1" />
                              <span className="text-[10px] text-muted-foreground font-medium min-w-[28px] text-right">
                                {obj.progress_percentage}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] h-4 px-1 border",
                                  getPriorityColor(obj.priority)
                                )}
                              >
                                {obj.priority[0].toUpperCase()}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-4 px-1"
                                style={{ 
                                  backgroundColor: `${getAspectColor(obj.aspect_id as AspectType)}20`,
                                  color: getAspectColor(obj.aspect_id as AspectType)
                                }}
                              >
                                {aspects.find((a) => a.id === obj.aspect_id)?.name}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Weekly Objectives */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                        Weekly Objectives
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px]"
                        onClick={openAddWeeklyDialog}
                      >
                        <Plus className="h-2.5 w-2.5 mr-0.5" />
                        Add
                      </Button>
                    </div>
                    {filteredWeeklyObjectives.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground text-center py-2">
                        No weekly objectives yet
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {filteredWeeklyObjectives.map(obj => (
                          <div 
                            key={obj.id} 
                            className="p-2 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors group"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="text-xs font-medium flex-1 truncate pr-1">{obj.title}</span>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => openEditWeeklyDialog(obj)}
                                >
                                  <Edit className="h-2.5 w-2.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                  onClick={(e) => handleDeleteWeekly(obj.id, e)}
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Progress value={obj.progress_percentage} className="h-1 flex-1" />
                              <span className="text-[10px] text-muted-foreground font-medium min-w-[28px] text-right">
                                {obj.progress_percentage}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] h-4 px-1 border",
                                  getPriorityColor(obj.priority)
                                )}
                              >
                                {obj.priority[0].toUpperCase()}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-4 px-1"
                                style={{ 
                                  backgroundColor: `${getAspectColor(obj.aspect_id as AspectType)}20`,
                                  color: getAspectColor(obj.aspect_id as AspectType)
                                }}
                              >
                                {aspects.find((a) => a.id === obj.aspect_id)?.name}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Stats */}
      <div className="px-3 py-2 border-t border-border bg-muted/30 flex-shrink-0">
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-sm font-bold text-primary">{todayEvents.length}</p>
            <p className="text-[10px] text-muted-foreground">Events</p>
          </div>
          <div>
            <p className="text-sm font-bold text-green-500">{completedTasks}</p>
            <p className="text-[10px] text-muted-foreground">Done</p>
          </div>
          <div>
            <p className="text-sm font-bold text-blue-500">{taskProgress}%</p>
            <p className="text-[10px] text-muted-foreground">Progress</p>
          </div>
        </div>
      </div>

      {/* Task Dialog */}
      <Dialog open={dialogType === 'addTask' || dialogType === 'editTask'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogType === 'editTask' ? 'Edit Task' : 'Add Task'}</DialogTitle>
            <DialogDescription>
              {dialogType === 'editTask' ? 'Update the details of your task.' : 'Create a new task for the selected date.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Task description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={taskForm.type} 
                onValueChange={(value: 'personal' | 'job') => setTaskForm({ ...taskForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="job">Job/Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {taskForm.type === 'personal' && (
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={taskForm.aspect_id} 
                  onValueChange={(value: AspectType) => setTaskForm({ ...taskForm, aspect_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {validAspects.map(aspect => (
                      <SelectItem key={aspect.id} value={aspect.id}>
                        {aspect.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={taskForm.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => setTaskForm({ ...taskForm, priority: value })}
                >
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
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  value={taskForm.estimated_duration_minutes}
                  onChange={(e) => setTaskForm({ ...taskForm, estimated_duration_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleTaskSubmit}
              disabled={!taskForm.title.trim()}
              className="bg-gradient-to-r from-violet-600 to-pink-600"
            >
              {dialogType === 'editTask' ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Objective Dialog (Weekly/Monthly) */}
      <Dialog open={dialogType === 'addWeekly' || dialogType === 'editWeekly' || dialogType === 'addMonthly' || dialogType === 'editMonthly'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'editWeekly' ? 'Edit Weekly Objective' : 
               dialogType === 'editMonthly' ? 'Edit Monthly Objective' :
               dialogType === 'addWeekly' ? 'Add Weekly Objective' : 'Add Monthly Objective'}
            </DialogTitle>
            <DialogDescription>
              {dialogType?.includes('Weekly') 
                ? 'Set a goal for this week with progress tracking.' 
                : 'Set a goal for this month with progress tracking.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Objective title"
                value={objectiveForm.title}
                onChange={(e) => setObjectiveForm({ ...objectiveForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Objective description"
                value={objectiveForm.description}
                onChange={(e) => setObjectiveForm({ ...objectiveForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={objectiveForm.type} 
                onValueChange={(value: 'personal' | 'job') => setObjectiveForm({ ...objectiveForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="job">Job/Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {objectiveForm.type === 'personal' && (
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={objectiveForm.aspect_id} 
                  onValueChange={(value: AspectType) => setObjectiveForm({ ...objectiveForm, aspect_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {validAspects.map(aspect => (
                      <SelectItem key={aspect.id} value={aspect.id}>
                        {aspect.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={objectiveForm.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => setObjectiveForm({ ...objectiveForm, priority: value })}
                >
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
              <div className="space-y-2">
                <Label>Progress (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={objectiveForm.progress_percentage}
                  onChange={(e) => setObjectiveForm({ ...objectiveForm, progress_percentage: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button 
              onClick={dialogType?.includes('Weekly') ? handleWeeklySubmit : handleMonthlySubmit}
              disabled={!objectiveForm.title.trim()}
              className="bg-gradient-to-r from-violet-600 to-pink-600"
            >
              {dialogType?.includes('edit') ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={dialogType === 'addEvent'} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              Create a calendar event for the selected date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Event title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Event description"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aspect</Label>
                <Select 
                  value={eventForm.aspect} 
                  onValueChange={(value: AspectType) => setEventForm({ ...eventForm, aspect: value })}
                >
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
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={eventForm.type} 
                  onValueChange={(value: 'personal' | 'job') => setEventForm({ ...eventForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time (Optional)</Label>
                <Input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={eventForm.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => setEventForm({ ...eventForm, priority: value })}
                >
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button 
              onClick={handleEventSubmit}
              disabled={!eventForm.title.trim()}
              className="bg-gradient-to-r from-violet-600 to-pink-600"
            >
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expanded Objectives Dialog */}
      <ExpandedObjectivesDialogEnhanced
        open={objectivesExpanded}
        onOpenChange={setObjectivesExpanded}
        selectedDate={date || new Date()}
      />
    </div>
  );
}

