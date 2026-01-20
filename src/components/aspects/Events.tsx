'use client';

import { useState } from 'react';
import { AspectLayout, EmptyState } from './AspectLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  CalendarDays,
  Clock,
  Plus,
  Bell,
  Trash2,
  Loader2,
} from 'lucide-react';
import type { AspectType } from '@/types/database';
import { format, isSameDay } from 'date-fns';
import { aspects } from '@/lib/aspects';
import { useEvents } from '@/hooks/useEvents';

export function Events() {
  const { theme } = useAppStore();
  const { 
    events, 
    loading, 
    createEvent, 
    deleteEvent,
    getUpcoming,
    getEventsForDate 
  } = useEvents();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    aspect: 'events' as AspectType,
    all_day: false,
  });

  const todayEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const upcomingEvents = getUpcoming(30);

  const stats = [
    { label: 'This Week', value: getUpcoming(7).length.toString() },
    { label: 'This Month', value: upcomingEvents.length.toString() },
    { label: 'Today', value: getEventsForDate(new Date()).length.toString() },
    { label: 'Total', value: events.length.toString() },
  ];

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) return;
    
    setIsSubmitting(true);
    await createEvent({
      title: newEvent.title,
      description: newEvent.description || undefined,
      aspect: newEvent.aspect,
      start_date: (selectedDate || new Date()).toISOString(),
      all_day: newEvent.all_day,
    });
    setIsSubmitting(false);
    setIsAddingEvent(false);
    setNewEvent({ title: '', description: '', aspect: 'events', all_day: false });
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  const getAspectColor = (aspectId: string) => {
    return aspects.find((a) => a.id === aspectId)?.color || '#8B5CF6';
  };

  // Highlight dates with events
  const eventDates = events.map(e => new Date(e.start_date));

  return (
    <AspectLayout
      aspectId="events"
      stats={stats}
      aiInsight={events.length > 0 
        ? `You have ${getUpcoming(7).length} event${getUpcoming(7).length !== 1 ? 's' : ''} coming up this week. ${upcomingEvents[0] ? `Next: ${upcomingEvents[0].title}` : ''}`
        : 'Add your first event to start organizing your schedule!'
      }
      onAddNew={() => setIsAddingEvent(true)}
      addNewLabel="Add Event"
    >
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md"
                    modifiers={{
                      hasEvent: eventDates,
                    }}
                    modifiersStyles={{
                      hasEvent: {
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        textDecorationColor: '#8B5CF6',
                      }
                    }}
                  />
                </CardContent>
              </Card>

              <div>
                <h3 className={cn(
                  "font-semibold mb-4",
                  theme === 'light' ? "text-slate-900" : "text-white"
                )}>
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
                </h3>
                {todayEvents.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <p className={cn(
                        "text-sm mb-4",
                        theme === 'light' ? "text-slate-500" : "text-white/60"
                      )}>
                        No events on this day
                      </p>
                      <Button onClick={() => setIsAddingEvent(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <Card key={event.id} className="group">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-1 h-full min-h-[40px] rounded-full"
                              style={{ backgroundColor: getAspectColor(event.aspect) }}
                            />
                            <div className="flex-1">
                              <h4 className={cn(
                                "font-medium",
                                theme === 'light' ? "text-slate-900" : "text-white"
                              )}>
                                {event.title}
                              </h4>
                              {event.description && (
                                <p className={cn(
                                  "text-sm",
                                  theme === 'light' ? "text-slate-500" : "text-white/60"
                                )}>
                                  {event.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant="secondary"
                                  style={{
                                    backgroundColor: `${getAspectColor(event.aspect)}20`,
                                    color: getAspectColor(event.aspect),
                                  }}
                                >
                                  {aspects.find((a) => a.id === event.aspect)?.name || event.aspect}
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : upcomingEvents.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No upcoming events"
              description="Add events to your calendar to see them here."
              actionLabel="Add Event"
              onAction={() => setIsAddingEvent(true)}
            />
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:border-primary/50 transition-colors group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${getAspectColor(event.aspect)}20` }}
                      >
                        <CalendarDays className="h-6 w-6" style={{ color: getAspectColor(event.aspect) }} />
                      </div>
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-medium",
                          theme === 'light' ? "text-slate-900" : "text-white"
                        )}>
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={cn(
                            "text-sm flex items-center gap-1",
                            theme === 'light' ? "text-slate-500" : "text-white/60"
                          )}>
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.start_date), 'MMM d, h:mm a')}
                          </span>
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: `${getAspectColor(event.aspect)}20`,
                              color: getAspectColor(event.aspect),
                            }}
                          >
                            {aspects.find((a) => a.id === event.aspect)?.name || event.aspect}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Event Dialog */}
      <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Title</Label>
              <Input
                placeholder="What's happening?"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="Add details..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <p className="text-sm text-muted-foreground">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date on the calendar'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {aspects.filter((a) => a.id !== 'settings').slice(0, 6).map((aspect) => (
                  <Button
                    key={aspect.id}
                    type="button"
                    variant={newEvent.aspect === aspect.id ? 'default' : 'outline'}
                    size="sm"
                    style={newEvent.aspect === aspect.id ? { backgroundColor: aspect.color } : undefined}
                    onClick={() => setNewEvent({ ...newEvent, aspect: aspect.id })}
                  >
                    {aspect.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allday"
                checked={newEvent.all_day}
                onChange={(e) => setNewEvent({ ...newEvent, all_day: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="allday">All day event</Label>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={handleAddEvent}
              disabled={!newEvent.title.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}
