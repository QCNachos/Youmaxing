'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay, addDays } from 'date-fns';
import { aspects } from '@/lib/aspects';
import type { AspectType } from '@/types/database';

type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  aspect: AspectType;
  type: 'personal' | 'job';
  date: Date;
  time?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'completed' | 'cancelled';
};

type DailyTask = {
  id: string;
  title: string;
  aspect: AspectType;
  type: 'personal' | 'job';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  date: Date;
};

// Mock events for demo
const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'Gym Session', aspect: 'training', type: 'personal', date: new Date(), time: '07:00', priority: 'high', status: 'scheduled' },
  { id: '2', title: 'Dinner with Alex', aspect: 'friends', type: 'personal', date: new Date(), time: '19:00', priority: 'medium', status: 'scheduled' },
  { id: '3', title: 'Project Review', aspect: 'business', type: 'job', date: addDays(new Date(), 1), time: '14:00', priority: 'high', status: 'scheduled' },
  { id: '4', title: 'Team Standup', aspect: 'business', type: 'job', date: new Date(), time: '09:00', priority: 'medium', status: 'completed' },
  { id: '5', title: 'Meal Prep', aspect: 'food', type: 'personal', date: addDays(new Date(), 2), time: '18:00', priority: 'low', status: 'scheduled' },
];

const mockTasks: DailyTask[] = [
  { id: 't1', title: 'Review design mockups', aspect: 'business', type: 'job', status: 'completed', priority: 'high', date: new Date() },
  { id: 't2', title: 'Upper body workout', aspect: 'training', type: 'personal', status: 'in_progress', priority: 'medium', date: new Date() },
  { id: 't3', title: 'Call mom', aspect: 'family', type: 'personal', status: 'pending', priority: 'low', date: new Date() },
  { id: 't4', title: 'Finish report', aspect: 'business', type: 'job', status: 'pending', priority: 'high', date: new Date() },
];

const mockObjectives = {
  monthly: [
    { id: 'm1', title: 'Launch Mobile App', progress: 65, aspect: 'business' as AspectType },
    { id: 'm2', title: 'Improve Fitness', progress: 80, aspect: 'training' as AspectType },
  ],
  weekly: [
    { id: 'w1', title: 'Complete UI Design', progress: 70, aspect: 'business' as AspectType },
    { id: 'w2', title: 'Strength Training', progress: 60, aspect: 'training' as AspectType },
  ]
};

export function CalendarSidebar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [tasks, setTasks] = useState<DailyTask[]>(mockTasks);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'tasks' | 'objectives'>('events');
  const [typeFilter, setTypeFilter] = useState<'all' | 'personal' | 'job'>('all');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    aspect: 'events' as AspectType,
    type: 'personal' as 'personal' | 'job',
    time: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Apply type filter to events and tasks
  const filteredEvents = events.filter(event => 
    typeFilter === 'all' ? true : event.type === typeFilter
  );

  const filteredTasks = tasks.filter(task => 
    typeFilter === 'all' ? true : task.type === typeFilter
  );

  const todayEvents = filteredEvents.filter(
    (event) => date && isSameDay(event.date, date)
  );

  const todayTasks = filteredTasks.filter(
    (task) => date && isSameDay(task.date, date)
  );

  const getAspectColor = (aspectId: AspectType) => {
    return aspects.find((a) => a.id === aspectId)?.color || '#888';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  };

  const addEvent = () => {
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      aspect: newEvent.aspect,
      type: newEvent.type,
      date: date || new Date(),
      time: newEvent.time,
      priority: newEvent.priority,
      status: 'scheduled'
    };
    setEvents([...events, event]);
    setIsAddingEvent(false);
    setNewEvent({
      title: '',
      description: '',
      aspect: 'events',
      type: 'personal',
      time: '',
      priority: 'medium'
    });
  };

  // Calculate stats
  const completedTasks = todayTasks.filter(t => t.status === 'completed').length;
  const totalTasks = todayTasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="h-full flex flex-col">
      {/* Month Navigation */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-foreground">{format(currentMonth, 'MMMM yyyy')}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar - Wider and Centered */}
      <div className="p-4 flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="rounded-md w-full max-w-[320px] [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full [&_.rdp-cell]:text-center [&_.rdp-head_th]:text-center [&_.rdp-head_th]:w-10 [&_.rdp-cell]:w-10 [&_.rdp-day]:w-10 [&_.rdp-day]:h-10"
          modifiers={{
            hasEvent: filteredEvents.map(e => e.date)
          }}
          modifiersClassNames={{
            hasEvent: 'bg-primary/10 font-bold'
          }}
        />
      </div>

      {/* Type Filter - Personal/Job/Both */}
      <div className="px-4 py-3 border-t border-border">
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

      {/* Tabs for Events/Tasks/Objectives */}
      <div className="flex-1 border-t border-border flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'events' | 'tasks' | 'objectives')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-3 mb-2 flex-shrink-0" style={{ width: 'calc(100% - 32px)' }}>
            <TabsTrigger value="events" className="text-xs">
              <CalendarIcon className="h-3 w-3 mr-1" />
              Events
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="objectives" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="flex-1 overflow-auto m-0 px-4 pb-4">
          <h3 className="font-medium text-sm mb-3">
            {date ? format(date, 'EEEE, MMMM d') : 'Select a date'}
          </h3>
            {todayEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No events scheduled</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setIsAddingEvent(true)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Event
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: getAspectColor(event.aspect) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{event.title}</p>
                          {event.status === 'completed' && (
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {event.time && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}
                            </span>
                          )}
                          <Badge
                            variant="secondary"
                            className="text-xs rounded-md"
                            style={{ 
                              backgroundColor: `${getAspectColor(event.aspect)}20`,
                              color: getAspectColor(event.aspect)
                            }}
                          >
                            {aspects.find((a) => a.id === event.aspect)?.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="ghost" className="w-full mt-2 text-muted-foreground hover:text-foreground" onClick={() => setIsAddingEvent(true)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Event
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="flex-1 overflow-auto m-0 px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">Today&apos;s Tasks</h3>
              <Badge variant="outline" className="text-xs">
                {completedTasks}/{totalTasks}
              </Badge>
            </div>
            <Progress value={taskProgress} className="h-1.5 mb-3" />
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No tasks for today</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border"
                    onClick={() => toggleTaskStatus(task.id)}
                  >
                    <CheckCircle2
                      className={`h-5 w-5 flex-shrink-0 transition-colors ${
                        task.status === 'completed' 
                          ? 'text-green-500 fill-green-500' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    />
                    <span className={`flex-1 text-sm ${
                      task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {task.title}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs border ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority[0].toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Objectives Tab */}
          <TabsContent value="objectives" className="flex-1 overflow-auto m-0 px-4 pb-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-xs text-muted-foreground mb-2 uppercase tracking-wider">Monthly Goals</h4>
                <div className="space-y-2">
                  {mockObjectives.monthly.map(obj => (
                    <div key={obj.id} className="p-3 rounded-xl bg-muted/50 border border-transparent hover:border-border transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{obj.title}</span>
                        <span className="text-xs text-muted-foreground font-medium">{obj.progress}%</span>
                      </div>
                      <Progress value={obj.progress} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-xs text-muted-foreground mb-2 uppercase tracking-wider">Weekly Objectives</h4>
                <div className="space-y-2">
                  {mockObjectives.weekly.map(obj => (
                    <div key={obj.id} className="p-3 rounded-xl bg-muted/50 border border-transparent hover:border-border transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{obj.title}</span>
                        <span className="text-xs text-muted-foreground font-medium">{obj.progress}%</span>
                      </div>
                      <Progress value={obj.progress} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-primary">{todayEvents.length}</p>
            <p className="text-xs text-muted-foreground">Events</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-500">{completedTasks}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-500">{taskProgress}%</p>
            <p className="text-xs text-muted-foreground">Progress</p>
          </div>
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Event description (optional)"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aspect</Label>
                <Select value={newEvent.aspect} onValueChange={(value: AspectType) => setNewEvent({ ...newEvent, aspect: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspects.filter(a => a.id !== 'settings').map(aspect => (
                      <SelectItem key={aspect.id} value={aspect.id}>
                        {aspect.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newEvent.type} onValueChange={(value: 'personal' | 'job') => setNewEvent({ ...newEvent, type: value })}>
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
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newEvent.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewEvent({ ...newEvent, priority: value })}>
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
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={addEvent}
              disabled={!newEvent.title.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

