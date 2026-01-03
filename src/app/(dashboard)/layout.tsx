'use client';

import { useState } from 'react';
import { CalendarSidebar } from '@/components/CalendarSidebar';
import { AvatarWithRing } from '@/components/3d/AvatarWithRing';
import { GlobalChat } from '@/components/GlobalChat';
import { MiniAppDashboard } from '@/components/MiniAppDashboard';
import { SettingsMenu } from '@/components/SettingsMenu';
import { EarnPanel } from '@/components/EarnPanel';
import { PremiumPanel } from '@/components/PremiumPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format, isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { useAppStore } from '@/lib/store';
import { aspects } from '@/lib/aspects';
import {
  Sparkles,
  Calendar,
  X,
  Settings,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Target,
  CheckCircle2,
  Clock,
  Plus,
  Coins,
  Smile,
  Meh,
  Frown,
  Sun,
  Zap,
  Heart,
  Coffee,
  Battery,
  BatteryLow,
  BatteryFull,
  Expand,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Filter out settings - it's a menu now
const sidebarAspects = aspects.filter(a => a.id !== 'settings');

// Theme-aware background component
function ThemedBackground({ theme }: { theme: 'dark' | 'light' }) {
  if (theme === 'light') {
    return (
      <>
        {/* Light mode - Elegant warm gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/60 via-background to-pink-50/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-200/30 via-transparent to-transparent" />
        
        {/* Soft floating shapes */}
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-gradient-to-br from-violet-300/20 to-pink-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-gradient-to-tr from-amber-200/15 to-violet-200/20 rounded-full blur-[80px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-to-bl from-cyan-200/15 to-violet-100/15 rounded-full blur-[60px]" />
        
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
        
        {/* Grid Pattern - Light */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </>
    );
  }

  return (
    <>
      {/* Dark mode - Original design */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-background to-pink-950/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]" />
      
      {/* Grid Pattern - Dark */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
    </>
  );
}

// Mock data for expanded calendar view
const mockEvents = [
  { id: '1', title: 'Gym Session', aspect: 'training', type: 'personal', date: new Date(), time: '07:00', priority: 'high' },
  { id: '2', title: 'Dinner with Alex', aspect: 'friends', type: 'personal', date: new Date(), time: '19:00', priority: 'medium' },
  { id: '3', title: 'Project Review', aspect: 'business', type: 'job', date: addDays(new Date(), 1), time: '14:00', priority: 'high' },
  { id: '4', title: 'Team Standup', aspect: 'business', type: 'job', date: new Date(), time: '09:00', priority: 'medium' },
  { id: '5', title: 'Meal Prep', aspect: 'food', type: 'personal', date: addDays(new Date(), 2), time: '18:00', priority: 'low' },
];

const mockObjectives = {
  monthly: [
    { id: 'm1', title: 'Launch Mobile App', progress: 65, aspect: 'business' },
    { id: 'm2', title: 'Improve Fitness', progress: 80, aspect: 'training' },
  ],
  weekly: [
    { id: 'w1', title: 'Complete UI Design', progress: 70, aspect: 'business' },
    { id: 'w2', title: 'Strength Training', progress: 60, aspect: 'training' },
  ],
  daily: [
    { id: 'd1', title: 'Review design mockups', status: 'completed', aspect: 'business' },
    { id: 'd2', title: 'Upper body workout', status: 'in_progress', aspect: 'training' },
    { id: 'd3', title: 'Call mom', status: 'pending', aspect: 'family' },
    { id: 'd4', title: 'Finish report', status: 'pending', aspect: 'business' },
  ]
};

// Mood data for the week
const moodOptions = [
  { id: 'great', icon: Smile, label: 'Great', color: '#22C55E' },
  { id: 'good', icon: Sun, label: 'Good', color: '#84CC16' },
  { id: 'okay', icon: Meh, label: 'Okay', color: '#EAB308' },
  { id: 'tired', icon: Coffee, label: 'Tired', color: '#F97316' },
  { id: 'stressed', icon: Zap, label: 'Stressed', color: '#EF4444' },
  { id: 'sad', icon: Frown, label: 'Sad', color: '#6366F1' },
];

const energyLevels = [
  { id: 'high', icon: BatteryFull, label: 'High Energy', color: '#22C55E' },
  { id: 'medium', icon: Battery, label: 'Normal', color: '#EAB308' },
  { id: 'low', icon: BatteryLow, label: 'Low Energy', color: '#EF4444' },
];

// Expanded Calendar View Component - Full page calendar
function ExpandedCalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [todayMood, setTodayMood] = useState<string | null>('good');
  const [todayEnergy, setTodayEnergy] = useState<string | null>('medium');
  const [moodNote, setMoodNote] = useState('');
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [objectivesExpanded, setObjectivesExpanded] = useState(false);
  const [moodExpanded, setMoodExpanded] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'personal' | 'job'>('all');

  const getAspectColor = (aspectId: string) => {
    return aspects.find((a) => a.id === aspectId)?.color || '#8B5CF6';
  };

  // Filter events based on type
  const filteredEvents = mockEvents.filter(event => 
    typeFilter === 'all' ? true : event.type === typeFilter
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Calculate number of weeks for proper grid sizing
  const numWeeks = Math.ceil(calendarDays.length / 7);

  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  return (
    <div className="flex gap-6 h-full min-h-[calc(100vh-200px)]">
      {/* Main Calendar - Takes most of the space */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
            <div className="flex items-center gap-4">
              <CardTitle>Calendar</CardTitle>
              <div className="flex items-center gap-1">
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
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold min-w-[150px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
              {/* Type Filter */}
              <div className="flex items-center gap-1 ml-4 bg-muted/50 rounded-lg p-0.5">
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
                  Job
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pb-4">
            {/* Month View */}
            {viewMode === 'month' && (
              <div className="flex-1 flex flex-col">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar grid - fills available space */}
                <div 
                  className="flex-1 grid grid-cols-7 gap-1"
                  style={{ gridTemplateRows: `repeat(${numWeeks}, 1fr)` }}
                >
                  {calendarDays.map(day => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);

                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "p-2 border rounded-lg cursor-pointer transition-colors flex flex-col min-h-[80px]",
                          !isCurrentMonth && "text-muted-foreground bg-muted/20",
                          isToday && "bg-primary/10 border-primary",
                          isSelected && "ring-2 ring-primary",
                          "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className={cn(
                          "text-sm font-medium mb-1 flex-shrink-0",
                          isToday && "text-primary font-bold"
                        )}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1 flex-1 overflow-hidden">
                          {dayEvents.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded truncate"
                              style={{ backgroundColor: `${getAspectColor(event.aspect)}20`, color: getAspectColor(event.aspect) }}
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
            )}
          </CardContent>
        </Card>
      </div>

{/* Sidebar - Events, Objectives & Mood - Equal Heights */}
      <div className="w-[320px] flex-shrink-0 grid grid-rows-3 gap-3 h-full">
        {/* Selected Day Events - Fixed Height */}
        <Card className="flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(selectedDate, 'EEE, MMM d')}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setEventsExpanded(true)}
            >
              <Expand className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              {getEventsForDay(selectedDate).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Calendar className="h-5 w-5 mb-1.5 opacity-50" />
                  <p className="text-xs">No events</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {getEventsForDay(selectedDate).slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getAspectColor(event.aspect) }}
                        />
                        <p className="font-medium text-xs truncate flex-1">{event.title}</p>
                        <span className="text-[10px] text-muted-foreground">{event.time}</span>
                      </div>
                    </div>
                  ))}
                  {getEventsForDay(selectedDate).length > 3 && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      +{getEventsForDay(selectedDate).length - 3} more
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Objectives Overview - Fixed Height */}
        <Card className="flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Objectives
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setObjectivesExpanded(true)}
            >
              <Expand className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto space-y-1.5">
              {mockObjectives.monthly.slice(0, 2).map(obj => (
                    <div key={obj.id} className="p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium truncate">{obj.title}</span>
                        <span className="text-[10px] text-muted-foreground">{obj.progress}%</span>
                      </div>
                      <Progress value={obj.progress} className="h-1" />
                    </div>
                  ))}
              <div className="pt-1 border-t border-border mt-2">
                <p className="text-[10px] text-muted-foreground mb-1">Daily Tasks</p>
                {mockObjectives.daily.slice(0, 2).map(task => (
                  <div key={task.id} className="flex items-center gap-1.5 py-0.5">
                      <CheckCircle2
                        className={cn(
                        "h-3 w-3 flex-shrink-0",
                          task.status === 'completed' ? 'text-green-500 fill-green-500' : 'text-muted-foreground'
                        )}
                      />
                      <span className={cn(
                      "text-[11px] truncate",
                        task.status === 'completed' && 'line-through text-muted-foreground'
                      )}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Mood Board - Fixed Height */}
        <Card className="flex flex-col min-h-0 overflow-hidden">
          <CardHeader className="pb-2 pt-3 px-4 flex-shrink-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Mood
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setMoodExpanded(true)}
            >
              <Expand className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex-1 overflow-hidden flex flex-col justify-center">
            {/* Mood Selection */}
            <div className="flex items-center justify-between gap-1 mb-3">
              {moodOptions.map(mood => {
                const Icon = mood.icon;
                const isSelected = todayMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setTodayMood(mood.id)}
                    className={cn(
                      "flex-1 p-2 rounded-lg flex items-center justify-center transition-all",
                      isSelected ? "ring-2 ring-offset-1" : "hover:bg-muted/50"
                    )}
                    style={isSelected ? { 
                      backgroundColor: `${mood.color}20`,
                      outlineColor: mood.color 
                    } : undefined}
                    title={mood.label}
                  >
                    <Icon 
                      className="h-4 w-4" 
                      style={{ color: isSelected ? mood.color : undefined }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Weekly Trend */}
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">This week</p>
              <div className="flex gap-0.5">
                {['great', 'good', 'okay', 'good', 'great', 'tired', 'good'].map((mood, i) => {
                  const moodConfig = moodOptions.find(m => m.id === mood);
                  return (
                    <div 
                      key={i}
                      className="flex-1 h-2 rounded-full"
                      style={{ backgroundColor: moodConfig?.color || '#888' }}
                      title={`${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}: ${moodConfig?.label}`}
                    />
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expanded Events Dialog */}
      <Dialog open={eventsExpanded} onOpenChange={setEventsExpanded}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto space-y-2 py-2">
            {getEventsForDay(selectedDate).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No events scheduled for this day</p>
              </div>
            ) : (
              getEventsForDay(selectedDate).map(event => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getAspectColor(event.aspect) }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {event.time}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{ 
                            backgroundColor: `${getAspectColor(event.aspect)}20`,
                            color: getAspectColor(event.aspect)
                          }}
                        >
                          {aspects.find(a => a.id === event.aspect)?.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </DialogContent>
      </Dialog>

      {/* Expanded Objectives Dialog */}
      <Dialog open={objectivesExpanded} onOpenChange={setObjectivesExpanded}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              All Objectives
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly" className="mt-4 space-y-3">
              {mockObjectives.monthly.map(obj => (
                <div key={obj.id} className="p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{obj.title}</span>
                    <span className="text-sm text-muted-foreground">{obj.progress}%</span>
                  </div>
                  <Progress value={obj.progress} className="h-2" />
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="weekly" className="mt-4 space-y-3">
              {mockObjectives.weekly.map(obj => (
                <div key={obj.id} className="p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{obj.title}</span>
                    <span className="text-sm text-muted-foreground">{obj.progress}%</span>
                  </div>
                  <Progress value={obj.progress} className="h-2" />
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="daily" className="mt-4 space-y-2">
              {mockObjectives.daily.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <CheckCircle2
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      task.status === 'completed' ? 'text-green-500 fill-green-500' : 'text-muted-foreground'
                    )}
                  />
                  <span className={cn(
                    "flex-1",
                    task.status === 'completed' && 'line-through text-muted-foreground'
                  )}>
                    {task.title}
                  </span>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Expanded Mood Dialog */}
      <Dialog open={moodExpanded} onOpenChange={setMoodExpanded}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Today&apos;s Mood & Energy
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            {/* Mood Selection */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">How are you feeling today?</p>
              <div className="grid grid-cols-6 gap-2">
                {moodOptions.map(mood => {
                  const Icon = mood.icon;
                  const isSelected = todayMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => setTodayMood(mood.id)}
                      className={cn(
                        "p-3 rounded-xl flex flex-col items-center gap-1 transition-all",
                        isSelected ? "ring-2 ring-offset-2" : "hover:bg-muted/50"
                      )}
                      style={isSelected ? { 
                        backgroundColor: `${mood.color}20`,
                        outlineColor: mood.color 
                      } : undefined}
                    >
                      <Icon 
                        className="h-6 w-6" 
                        style={{ color: isSelected ? mood.color : undefined }}
                      />
                      <span className="text-[10px]" style={{ color: isSelected ? mood.color : undefined }}>
                        {mood.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">Energy level</p>
              <div className="grid grid-cols-3 gap-2">
                {energyLevels.map(energy => {
                  const Icon = energy.icon;
                  const isSelected = todayEnergy === energy.id;
                  return (
                    <button
                      key={energy.id}
                      onClick={() => setTodayEnergy(energy.id)}
                      className={cn(
                        "p-3 rounded-xl flex items-center justify-center gap-2 transition-all",
                        isSelected ? "ring-2 ring-offset-2" : "bg-muted/50 hover:bg-muted"
                      )}
                      style={isSelected ? { 
                        backgroundColor: `${energy.color}20`,
                        outlineColor: energy.color,
                        color: energy.color
                      } : undefined}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{energy.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Add a note (optional)</p>
              <textarea 
                className="w-full p-3 text-sm rounded-xl bg-muted/50 border-0 resize-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="How's your day going? Any thoughts?"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
              />
            </div>

            {/* Weekly Trend */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">This week&apos;s trend</p>
                <span className="text-xs text-muted-foreground">7 day streak 🔥</span>
              </div>
              <div className="flex gap-1">
                {['great', 'good', 'okay', 'good', 'great', 'tired', 'good'].map((mood, i) => {
                  const moodConfig = moodOptions.find(m => m.id === mood);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: moodConfig?.color || '#888' }}
                      >
                        {moodConfig && <moodConfig.icon className="h-4 w-4 text-white" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentAspect, setCurrentAspect, theme } = useAppStore();
  const [calendarOpen, setCalendarOpen] = useState(true); // Calendar visible by default
  const [calendarExpanded, setCalendarExpanded] = useState(false); // Full-screen calendar dialog
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [earnOpen, setEarnOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background relative">
      {/* Theme-aware animated background */}
      <ThemedBackground theme={theme} />

      <div className="relative h-full w-full flex">
        {/* Left Sidebar - Compact Aspect Navigation */}
        <aside className={cn(
          "w-16 h-full border-r backdrop-blur-xl flex flex-col z-20 transition-all duration-300",
          theme === 'light' 
            ? "bg-white/80 border-violet-200/50 shadow-[4px_0_24px_-4px_rgba(139,92,246,0.1)]"
            : "bg-sidebar/80 border-border/20"
        )}>
          {/* Logo - Opens Premium/Analytics Panel */}
          <div className={cn("p-3 border-b", theme === 'light' ? "border-violet-100" : "border-white/5")}>
            <button 
              onClick={() => setPremiumOpen(true)}
              className="flex items-center justify-center group w-full relative"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center transition-all group-hover:scale-105",
                theme === 'light' 
                  ? "shadow-lg shadow-violet-400/30 group-hover:shadow-violet-400/50"
                  : "shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/50"
              )}>
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2.5 py-1 bg-popover/90 backdrop-blur-xl text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 pointer-events-none border border-border shadow-xl">
                Analytics & Premium
              </span>
            </button>
          </div>

          {/* Aspect Icons - Without Settings */}
          <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
            <div className="space-y-1 px-2">
              {sidebarAspects.map((aspect) => {
                const Icon = aspect.icon;
                const isActive = currentAspect === aspect.id;
                return (
                  <button
                    key={aspect.id}
                    onClick={() => setCurrentAspect(aspect.id)}
                    className={cn(
                      'w-full p-2.5 rounded-xl flex items-center justify-center transition-all duration-300 group relative',
                      isActive
                        ? 'shadow-lg'
                        : theme === 'light'
                          ? 'hover:bg-violet-50 text-slate-400 hover:text-slate-600'
                          : 'hover:bg-white/5 text-white/40 hover:text-white/80'
                    )}
                    style={isActive ? { 
                      backgroundColor: theme === 'light' ? `${aspect.color}18` : `${aspect.color}30`,
                      boxShadow: theme === 'light' 
                        ? `0 4px 16px -4px ${aspect.color}30`
                        : `0 8px 32px -8px ${aspect.color}50`
                    } : undefined}
                  >
                    <Icon 
                      className={cn('h-5 w-5 transition-transform group-hover:scale-110')} 
                      style={isActive ? { color: aspect.color } : undefined}
                    />
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                        style={{ backgroundColor: aspect.color }}
                      />
                    )}
                    
                    {/* Tooltip */}
                    <span className="absolute left-full ml-2 px-2.5 py-1 bg-popover/90 backdrop-blur-xl text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 pointer-events-none border border-border shadow-xl">
                      {aspect.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className={cn("p-2 border-t space-y-1", theme === 'light' ? "border-violet-100" : "border-border/20")}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-full rounded-xl relative",
                calendarOpen
                  ? theme === 'light'
                    ? "bg-violet-100 text-violet-600 shadow-md"
                    : "bg-violet-500/20 text-violet-400 shadow-lg"
                  : theme === 'light' 
                    ? "text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              style={calendarOpen ? {
                boxShadow: theme === 'light' 
                  ? '0 4px 16px -4px rgba(139, 92, 246, 0.3)'
                  : '0 8px 32px -8px rgba(139, 92, 246, 0.5)'
              } : undefined}
              onClick={() => setCalendarOpen(!calendarOpen)}
            >
              <Calendar className="h-5 w-5" />
              {/* Active Indicator */}
              {calendarOpen && (
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full bg-violet-500"
                />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-full rounded-xl group relative",
                earnOpen
                  ? theme === 'light'
                    ? "bg-amber-100 text-amber-600"
                    : "bg-amber-500/20 text-amber-400"
                  : theme === 'light' 
                    ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                    : "text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10"
              )}
              onClick={() => setEarnOpen(true)}
            >
              <Coins className="h-5 w-5" />
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2.5 py-1 bg-popover/90 backdrop-blur-xl text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 pointer-events-none border border-border shadow-xl">
                Earn Points
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-full rounded-xl",
                theme === 'light' 
                  ? "text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Theme Toggle - Top Right */}
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>

          {/* Top Section - Avatar with Icon Ring */}
          <div className="flex-shrink-0">
            <AvatarWithRing />
          </div>

          {/* Bottom Section - Dashboard + Chat Split */}
          <div className="flex-1 flex gap-4 p-4 pt-0 overflow-hidden min-h-0">
            {/* Mini-App Dashboard - Left Side */}
            <div className={cn(
              "flex-1 backdrop-blur-sm rounded-3xl border overflow-hidden transition-all duration-300",
              theme === 'light'
                ? "bg-white/60 border-violet-200/40 shadow-lg shadow-violet-200/20"
                : "bg-card/20 border-border/20"
            )}>
              <MiniAppDashboard />
            </div>

            {/* Global Chat - Right Side */}
            <div className="w-[360px] flex-shrink-0">
              <GlobalChat />
            </div>
          </div>
        </div>

        {/* Calendar Sidebar - Always visible on right side (wider) */}
        <aside
          className={cn(
            'h-full backdrop-blur-xl border-l z-20 transition-all duration-500 ease-out flex-shrink-0 overflow-hidden',
            calendarOpen ? 'w-[360px]' : 'w-0',
            theme === 'light'
              ? "bg-white/95 border-violet-200/50 shadow-[-8px_0_32px_-8px_rgba(139,92,246,0.15)]"
              : "bg-card/90 border-border"
          )}
        >
          {calendarOpen && (
            <>
          <div className={cn(
            "p-4 border-b flex items-center justify-between",
            theme === 'light' ? "border-violet-100" : "border-border"
          )}>
            <h2 className="text-lg font-semibold text-card-foreground">Calendar</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-8 gap-1",
                      theme === 'light'
                        ? "border-violet-200 hover:bg-violet-50"
                        : "border-border hover:bg-muted"
                    )}
                    onClick={() => setCalendarExpanded(true)}
                    title="Expand to Full Page"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span className="text-xs">Expand</span>
                  </Button>
                </div>
              </div>
              <CalendarSidebar />
            </>
          )}
        </aside>

        {/* Calendar Toggle Button - Shows when calendar is hidden */}
        {!calendarOpen && (
          <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "rounded-l-xl rounded-r-none border-r-0 h-12 w-8",
                theme === 'light'
                  ? "bg-white/90 border-violet-200/50 hover:bg-violet-50"
                  : "bg-card/90 border-border hover:bg-muted"
              )}
              onClick={() => setCalendarOpen(true)}
              title="Show Calendar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Full-Screen Calendar - Takes whole page except left sidebar */}
        {calendarExpanded && (
          <div className={cn(
            "fixed inset-0 z-40 flex",
            theme === 'light' ? "bg-white/98" : "bg-background/98"
          )}>
            {/* Left margin to account for sidebar */}
            <div className="w-16 flex-shrink-0" />
            
            {/* Full Calendar Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className={cn(
                "p-4 border-b flex items-center justify-between flex-shrink-0",
                theme === 'light' ? "border-violet-100 bg-white/80" : "border-border bg-card/80"
              )}>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                    Full Calendar
                  </h1>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-muted-foreground">Manage your events, tasks, and objectives</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCalendarExpanded(false)}
                  className={cn(
                    "gap-2",
                    theme === 'light'
                      ? "border-violet-200 hover:bg-violet-50"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>
              </div>
              
              {/* Calendar Content - Full width */}
              <div className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto">
                  <ExpandedCalendarView />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Menu */}
        <SettingsMenu 
          isOpen={settingsOpen} 
          onClose={() => setSettingsOpen(false)} 
        />

        {/* Earn Panel */}
        <EarnPanel 
          isOpen={earnOpen} 
          onClose={() => setEarnOpen(false)} 
        />

        {/* Premium Panel */}
        <PremiumPanel 
          isOpen={premiumOpen} 
          onClose={() => setPremiumOpen(false)} 
        />
      </div>
      
      {/* Children (for potential sub-routes) */}
      {children}
    </div>
  );
}
