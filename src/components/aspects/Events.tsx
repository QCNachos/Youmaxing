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
import { 
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Check,
  X,
  Bell,
} from 'lucide-react';
import type { CalendarEvent, AspectType } from '@/types/database';
import { format, isSameDay, addDays } from 'date-fns';
import { aspects } from '@/lib/aspects';

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Team Meeting',
    description: 'Weekly sync',
    aspect: 'business',
    start_date: new Date().toISOString(),
    end_date: null,
    all_day: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    title: 'Dinner with Alex',
    description: 'Catch up at the new Italian place',
    aspect: 'friends',
    start_date: addDays(new Date(), 2).toISOString(),
    end_date: null,
    all_day: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    title: 'Gym Session',
    description: null,
    aspect: 'training',
    start_date: addDays(new Date(), 1).toISOString(),
    end_date: null,
    all_day: false,
    created_at: new Date().toISOString(),
  },
];

const invitations = [
  { title: "Sarah's Birthday Party", date: 'Saturday 8PM', host: 'Sarah', status: 'pending' },
  { title: 'Company Offsite', date: 'Next Friday', host: 'Work', status: 'pending' },
];

export function Events() {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    aspect: 'events' as AspectType,
    all_day: false,
  });

  const todayEvents = events.filter(
    (e) => selectedDate && isSameDay(new Date(e.start_date), selectedDate)
  );

  const stats = [
    { label: 'This Week', value: events.length },
    { label: 'Pending RSVPs', value: invitations.length },
    { label: 'Upcoming', value: 5 },
    { label: 'This Month', value: 12 },
  ];

  const addEvent = () => {
    const event: CalendarEvent = {
      id: Date.now().toString(),
      user_id: '1',
      ...newEvent,
      description: newEvent.description || null,
      start_date: (selectedDate || new Date()).toISOString(),
      end_date: null,
      created_at: new Date().toISOString(),
    };
    setEvents([event, ...events]);
    setIsAddingEvent(false);
    setNewEvent({ title: '', description: '', aspect: 'events', all_day: false });
  };

  const getAspectColor = (aspectId: AspectType) => {
    return aspects.find((a) => a.id === aspectId)?.color || '#8B5CF6';
  };

  return (
    <AspectLayout
      aspectId="events"
      stats={stats}
      aiInsight="You have 2 pending invitations. Sarah's birthday party is this Saturday - consider RSVPing soon!"
      onAddNew={() => setIsAddingEvent(true)}
      addNewLabel="Add Event"
    >
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                />
              </CardContent>
            </Card>

            <div>
              <h3 className="font-semibold mb-4">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
              </h3>
              {todayEvents.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">No events on this day</p>
                    <Button onClick={() => setIsAddingEvent(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-1 h-full min-h-[40px] rounded-full"
                            style={{ backgroundColor: getAspectColor(event.aspect) }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="secondary"
                                style={{
                                  backgroundColor: `${getAspectColor(event.aspect)}20`,
                                  color: getAspectColor(event.aspect),
                                }}
                              >
                                {aspects.find((a) => a.id === event.aspect)?.name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          {invitations.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No pending invitations"
              description="When you receive event invitations, they'll appear here."
              actionLabel="Add Event"
              onAction={() => setIsAddingEvent(true)}
            />
          ) : (
            <div className="space-y-4">
              {invitations.map((invite, index) => (
                <Card key={index} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                        <CalendarDays className="h-6 w-6 text-violet-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{invite.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {invite.date}
                          </span>
                          <span>by {invite.host}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button size="sm" variant="outline">
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${getAspectColor(event.aspect)}20` }}
                    >
                      <CalendarDays className="h-6 w-6" style={{ color: getAspectColor(event.aspect) }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
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
                          {aspects.find((a) => a.id === event.aspect)?.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              onClick={addEvent}
              disabled={!newEvent.title.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AspectLayout>
  );
}

