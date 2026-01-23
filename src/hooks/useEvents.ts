'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  aspect: string;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  created_at: string;
}

export interface EventInsert {
  title: string;
  description?: string;
  aspect?: string;
  start_date: string;
  end_date?: string;
  all_day?: boolean;
}

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch events
  const fetchEvents = useCallback(async (options?: {
    startDate?: Date;
    endDate?: Date;
    aspect?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setEvents([]);
        return;
      }

      let query = supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (options?.startDate) {
        query = query.gte('start_date', startOfDay(options.startDate).toISOString());
      }
      if (options?.endDate) {
        query = query.lte('start_date', endOfDay(options.endDate).toISOString());
      }
      if (options?.aspect) {
        query = query.eq('aspect', options.aspect);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      // Transform data to ensure proper types
      const transformedData: CalendarEvent[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        description: item.description,
        aspect: item.aspect,
        start_date: item.start_date,
        end_date: item.end_date,
        all_day: item.all_day ?? false,
        created_at: item.created_at || new Date().toISOString(),
      }));
      
      setEvents(transformedData);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      channelRef.current = supabase
        .channel('calendar_events_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calendar_events',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchEvents();
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchEvents]);

  // Create an event
  const createEvent = useCallback(async (event: EventInsert): Promise<CalendarEvent | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          title: event.title,
          description: event.description || null,
          aspect: event.aspect || 'events',
          type: 'event', // Required field
          start_date: event.start_date,
          end_date: event.end_date || null,
          all_day: event.all_day || false,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Transform to ensure proper types
      const transformedData: CalendarEvent = {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        description: data.description,
        aspect: data.aspect,
        start_date: data.start_date,
        end_date: data.end_date,
        all_day: data.all_day ?? false,
        created_at: data.created_at || new Date().toISOString(),
      };
      
      setEvents(prev => [...prev, transformedData].sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      ));
      return transformedData;
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event');
      return null;
    }
  }, []);

  // Update an event
  const updateEvent = useCallback(async (id: string, updates: Partial<EventInsert>): Promise<boolean> => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setEvents(prev => prev.map(e => 
        e.id === id ? { ...e, ...updates } as CalendarEvent : e
      ));
      return true;
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
      return false;
    }
  }, []);

  // Delete an event
  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEvents(prev => prev.filter(e => e.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
      return false;
    }
  }, []);

  // Get upcoming events
  const getUpcoming = useCallback((days: number = 7) => {
    const now = new Date();
    const futureDate = addDays(now, days);
    
    return events.filter(e => {
      const eventDate = new Date(e.start_date);
      return eventDate >= now && eventDate <= futureDate;
    });
  }, [events]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => {
      const eventDate = format(new Date(e.start_date), 'yyyy-MM-dd');
      return eventDate === dateStr;
    });
  }, [events]);

  // Get events by aspect
  const getEventsByAspect = useCallback((aspect: string) => {
    return events.filter(e => e.aspect === aspect);
  }, [events]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getUpcoming,
    getEventsForDate,
    getEventsByAspect,
  };
}
