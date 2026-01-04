'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar as CalendarIcon,
  Plus,
  Target,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Settings,
  Share,
  Download,
  Upload,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Star,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Award,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { aspects } from '@/lib/aspects';
import type { AspectType } from '@/types/database';

type ViewMode = 'month' | 'week' | 'day' | 'agenda' | 'objectives';

type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  aspect: AspectType;
  type: 'personal' | 'job';
  start_date: string;
  end_date?: string;
  all_day?: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'completed' | 'cancelled';
  tags?: string[];
  location?: string;
  attendees?: string[];
};

type Objective = {
  id: string;
  title: string;
  description?: string;
  aspect: AspectType;
  type: 'personal' | 'job';
  status: 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  progress_percentage: number;
  completed_at?: string;
  target_date: string;
};

type MonthlyObjective = Objective & {
  target_month: string;
  weekly_goals?: WeeklyObjective[];
};

type WeeklyObjective = Objective & {
  target_week_start: string;
  monthly_objective_id?: string;
  daily_tasks?: DailyTask[];
};

type DailyTask = Objective & {
  target_date: string;
  weekly_objective_id?: string;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
};

type CalendarTemplate = {
  id: string;
  name: string;
  description?: string;
  category: string;
  events: {
    title: string;
    description?: string;
    aspect: AspectType;
    type: 'personal' | 'job';
    duration_minutes?: number;
    relative_days: number;
    start_time?: string;
    is_all_day?: boolean;
    priority: 'low' | 'medium' | 'high';
  }[];
};

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily team sync',
    aspect: 'business',
    type: 'job',
    start_date: new Date().toISOString(),
    end_date: addDays(new Date(), 0).toISOString(),
    all_day: false,
    priority: 'medium',
    status: 'scheduled',
    attendees: ['team@company.com']
  },
  {
    id: '2',
    title: 'Gym Session',
    description: 'Upper body workout',
    aspect: 'training',
    type: 'personal',
    start_date: addDays(new Date(), 1).toISOString(),
    end_date: addDays(new Date(), 1).toISOString(),
    all_day: false,
    priority: 'high',
    status: 'scheduled'
  },
  {
    id: '3',
    title: 'Client Presentation',
    description: 'Q4 product demo',
    aspect: 'business',
    type: 'job',
    start_date: addDays(new Date(), 3).toISOString(),
    end_date: addDays(new Date(), 3).toISOString(),
    all_day: false,
    priority: 'high',
    status: 'scheduled',
    location: 'Conference Room A'
  }
];

const mockMonthlyObjectives: MonthlyObjective[] = [
  {
    id: 'm1',
    title: 'Launch Mobile App',
    description: 'Complete and launch the mobile application',
    aspect: 'business',
    type: 'job',
    status: 'active',
    priority: 'high',
    progress_percentage: 65,
    target_month: format(new Date(), 'yyyy-MM'),
    target_date: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  },
  {
    id: 'm2',
    title: 'Improve Fitness',
    description: 'Build consistent workout routine',
    aspect: 'training',
    type: 'personal',
    status: 'active',
    priority: 'medium',
    progress_percentage: 80,
    target_month: format(new Date(), 'yyyy-MM'),
    target_date: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  }
];

const mockTemplates: CalendarTemplate[] = [
  {
    id: 't1',
    name: 'Morning Routine',
    description: 'Start your day right',
    category: 'productivity',
    events: [
      {
        title: 'Meditation',
        description: '10 minutes of mindfulness',
        aspect: 'training',
        type: 'personal',
        duration_minutes: 10,
        relative_days: 0,
        start_time: '07:00',
        priority: 'high'
      },
      {
        title: 'Exercise',
        description: 'Daily workout',
        aspect: 'training',
        type: 'personal',
        duration_minutes: 45,
        relative_days: 0,
        start_time: '07:15',
        priority: 'high'
      }
    ]
  },
  {
    id: 't2',
    name: 'Client Meeting',
    description: 'Prepare for important client discussions',
    category: 'work',
    events: [
      {
        title: 'Meeting Preparation',
        description: 'Review agenda and materials',
        aspect: 'business',
        type: 'job',
        duration_minutes: 60,
        relative_days: 0,
        start_time: '14:00',
        priority: 'high'
      }
    ]
  }
];

export function CalendarDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [monthlyObjectives, setMonthlyObjectives] = useState<MonthlyObjective[]>(mockMonthlyObjectives);
  const [templates, setTemplates] = useState<CalendarTemplate[]>(mockTemplates);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAspect, setSelectedAspect] = useState<AspectType | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'personal' | 'job'>('all');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    aspect: 'events' as AspectType,
    type: 'personal' as 'personal' | 'job',
    start_date: '',
    end_date: '',
    all_day: false,
    priority: 'medium' as 'low' | 'medium' | 'high',
    location: '',
    tags: [] as string[]
  });

  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    aspect: 'business' as AspectType,
    type: 'personal' as 'personal' | 'job',
    level: 'monthly' as 'monthly' | 'weekly' | 'daily',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAspect = selectedAspect === 'all' || event.aspect === selectedAspect;
    const matchesType = selectedType === 'all' || event.type === selectedType;
    return matchesSearch && matchesAspect && matchesType;
  });

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event =>
      isSameDay(new Date(event.start_date), date)
    );
  };

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
        break;
    }
  };

  // Render different view modes
  const renderCalendarView = () => {
    switch (viewMode) {
      case 'month':
        return <MonthView currentDate={currentDate} events={filteredEvents} onDateSelect={setSelectedDate} />;
      case 'week':
        return <WeekView currentDate={currentDate} events={filteredEvents} onDateSelect={setSelectedDate} />;
      case 'day':
        return <DayView currentDate={currentDate} events={getEventsForDate(currentDate)} />;
      case 'agenda':
        return <AgendaView events={filteredEvents} currentDate={currentDate} />;
      case 'objectives':
        return <ObjectivesView objectives={monthlyObjectives} />;
      default:
        return <MonthView currentDate={currentDate} events={filteredEvents} onDateSelect={setSelectedDate} />;
    }
  };

  const addEvent = () => {
    const event: CalendarEvent = {
      id: Date.now().toString(),
      ...newEvent,
      start_date: newEvent.start_date || selectedDate?.toISOString() || new Date().toISOString(),
      end_date: newEvent.end_date || newEvent.start_date,
      status: 'scheduled'
    };
    setEvents([...events, event]);
    setIsAddingEvent(false);
    setNewEvent({
      title: '',
      description: '',
      aspect: 'events',
      type: 'personal',
      start_date: '',
      end_date: '',
      all_day: false,
      priority: 'medium',
      location: '',
      tags: []
    });
  };

  const applyTemplate = (template: CalendarTemplate) => {
    const baseDate = selectedDate || new Date();
    const newEvents = template.events.map(eventTemplate => ({
      id: `${template.id}_${Date.now()}_${Math.random()}`,
      title: eventTemplate.title,
      description: eventTemplate.description,
      aspect: eventTemplate.aspect,
      type: eventTemplate.type,
      start_date: eventTemplate.start_time
        ? format(addDays(baseDate, eventTemplate.relative_days), `yyyy-MM-dd'T'${eventTemplate.start_time}:00`)
        : format(addDays(baseDate, eventTemplate.relative_days), 'yyyy-MM-dd'),
      end_date: eventTemplate.start_time && eventTemplate.duration_minutes
        ? format(addDays(addDays(baseDate, eventTemplate.relative_days), 0), `yyyy-MM-dd'T'${eventTemplate.start_time}:00`)
        : format(addDays(baseDate, eventTemplate.relative_days), 'yyyy-MM-dd'),
      all_day: eventTemplate.is_all_day || false,
      priority: eventTemplate.priority,
      status: 'scheduled' as const
    }));

    setEvents([...events, ...newEvents]);
    setShowTemplates(false);
  };

  const getAspectColor = (aspectId: AspectType) => {
    return aspects.find((a) => a.id === aspectId)?.color || '#8B5CF6';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Calendar</h1>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'agenda' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('agenda')}
              >
                Agenda
              </Button>
              <Button
                variant={viewMode === 'objectives' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('objectives')}
              >
                <Target className="h-4 w-4 mr-1" />
                Objectives
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
              <Zap className="h-4 w-4 mr-1" />
              Templates
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button onClick={() => setIsAddingEvent(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Navigation and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[200px] text-center">
                {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d')}`}
                {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={selectedAspect} onValueChange={(value: AspectType | 'all') => setSelectedAspect(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Aspects</SelectItem>
                {aspects.map(aspect => (
                  <SelectItem key={aspect.id} value={aspect.id}>
                    {aspect.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={(value: 'all' | 'personal' | 'job') => setSelectedType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="job">Job</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderCalendarView()}
      </div>

      {/* Quick Stats Sidebar */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{filteredEvents.length}</div>
            <div className="text-sm text-muted-foreground">Events Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {monthlyObjectives.filter(o => o.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Goals Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {Math.round(monthlyObjectives.reduce((sum, obj) => sum + obj.progress_percentage, 0) / monthlyObjectives.length)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {new Set(filteredEvents.map(e => e.aspect)).size}
            </div>
            <div className="text-sm text-muted-foreground">Active Aspects</div>
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
                placeholder="Event description"
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
                <Label>Start Date</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.start_date}
                  onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.end_date}
                  onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="Location (optional)"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
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

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply Calendar Template</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <Card key={template.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-violet-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          {template.events.length} event{template.events.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-3"
                      onClick={() => applyTemplate(template)}
                    >
                      Apply Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Month View Component
function MonthView({ currentDate, events, onDateSelect }: {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_date), date));
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(day => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                !isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''
              } ${isToday ? 'bg-primary/10 border-primary' : ''}`}
              onClick={() => onDateSelect(day)}
            >
              <div className="text-sm font-medium mb-2">
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded truncate"
                    style={{ backgroundColor: `${aspects.find(a => a.id === event.aspect)?.color}20` }}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Week View Component
function WeekView({ currentDate, events, onDateSelect }: {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate) });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_date), date));
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div key={day.toISOString()} className="border border-border rounded-lg p-4">
              <div className={`text-center mb-4 ${isToday ? 'font-bold text-primary' : 'font-medium'}`}>
                <div className="text-lg">{format(day, 'd')}</div>
                <div className="text-sm text-muted-foreground">{format(day, 'EEE')}</div>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                      onClick={() => onDateSelect(day)}
                    >
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.start_date), 'HH:mm')}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {aspects.find(a => a.id === event.aspect)?.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Day View Component
function DayView({ currentDate, events }: { currentDate: Date; events: CalendarEvent[] }) {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
      </div>

      <ScrollArea className="h-[600px]">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No events scheduled</h3>
            <p className="text-muted-foreground">Your day is free!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-1 h-full min-h-[60px] rounded-full"
                      style={{ backgroundColor: aspects.find(a => a.id === event.aspect)?.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {event.type === 'personal' ? 'Personal' : 'Job'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(event.start_date), 'HH:mm')}
                          {event.end_date && ` - ${format(new Date(event.end_date), 'HH:mm')}`}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${aspects.find(a => a.id === event.aspect)?.color}20`,
                            color: aspects.find(a => a.id === event.aspect)?.color
                          }}
                        >
                          {aspects.find(a => a.id === event.aspect)?.name}
                        </Badge>
                        <Badge variant={event.priority === 'high' ? 'destructive' : 'secondary'}>
                          {event.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Agenda View Component
function AgendaView({ events, currentDate }: { events: CalendarEvent[]; currentDate: Date }) {
  const sortedEvents = events
    .filter(event => new Date(event.start_date) >= currentDate)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return (
    <div className="p-4">
      <ScrollArea className="h-[600px]">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No upcoming events</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map(event => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-2xl font-bold text-primary">
                        {format(new Date(event.start_date), 'd')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(event.start_date), 'MMM')}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(event.start_date), 'EEEE, HH:mm')}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: `${aspects.find(a => a.id === event.aspect)?.color}20`,
                            color: aspects.find(a => a.id === event.aspect)?.color
                          }}
                        >
                          {aspects.find(a => a.id === event.aspect)?.name}
                        </Badge>
                        <Badge variant={event.priority === 'high' ? 'destructive' : 'secondary'}>
                          {event.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// Objectives View Component
function ObjectivesView({ objectives }: { objectives: MonthlyObjective[] }) {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Objectives</h2>
        <p className="text-muted-foreground">Track your goals across different time horizons</p>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objectives.map(objective => (
              <Card key={objective.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{objective.title}</h3>
                      {objective.description && (
                        <p className="text-sm text-muted-foreground mt-1">{objective.description}</p>
                      )}
                    </div>
                    <Badge variant={objective.status === 'completed' ? 'default' : 'secondary'}>
                      {objective.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{objective.progress_percentage}%</span>
                    </div>
                    <Progress value={objective.progress_percentage} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: `${aspects.find(a => a.id === objective.aspect)?.color}20`,
                        color: aspects.find(a => a.id === objective.aspect)?.color
                      }}
                    >
                      {aspects.find(a => a.id === objective.aspect)?.name}
                    </Badge>
                    <Badge variant="outline">
                      {objective.type === 'personal' ? 'Personal' : 'Job'}
                    </Badge>
                    <Badge variant={objective.priority === 'high' ? 'destructive' : 'secondary'}>
                      {objective.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Weekly objectives</h3>
            <p className="text-muted-foreground">Break down your monthly goals into weekly milestones</p>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Daily tasks</h3>
            <p className="text-muted-foreground">Manage your daily to-do list and track completion</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}







