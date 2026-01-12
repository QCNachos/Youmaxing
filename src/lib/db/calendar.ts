/**
 * Calendar Events CRUD Operations
 * 
 * Database operations for calendar_events table
 */

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert'];
type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update'];

// =====================================================
// READ OPERATIONS
// =====================================================

/**
 * Get calendar events for a date range
 */
export async function getCalendarEvents(
  userId: string,
  startDate: string,
  endDate?: string
): Promise<CalendarEvent[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_date', `${startDate}T00:00:00`)
    .order('start_date', { ascending: true });
  
  if (endDate) {
    query = query.lte('start_date', `${endDate}T23:59:59`);
  } else {
    query = query.lte('start_date', `${startDate}T23:59:59`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

/**
 * Get a single calendar event by ID
 */
export async function getCalendarEventById(eventId: string): Promise<CalendarEvent | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', eventId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

/**
 * Get upcoming events (next N days)
 */
export async function getUpcomingEvents(
  userId: string,
  days: number = 7
): Promise<CalendarEvent[]> {
  const supabase = createClient();
  const now = new Date();
  const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_date', now.toISOString())
    .lte('start_date', endDate.toISOString())
    .order('start_date', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

/**
 * Get events by aspect
 */
export async function getEventsByAspect(
  userId: string,
  aspect: string,
  startDate?: string,
  endDate?: string
): Promise<CalendarEvent[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .eq('aspect', aspect)
    .order('start_date', { ascending: true });
  
  if (startDate) {
    query = query.gte('start_date', `${startDate}T00:00:00`);
  }
  if (endDate) {
    query = query.lte('start_date', `${endDate}T23:59:59`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

// =====================================================
// CREATE OPERATIONS
// =====================================================

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(
  event: CalendarEventInsert
): Promise<CalendarEvent> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      ...event,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Create multiple calendar events at once
 */
export async function createCalendarEvents(
  events: CalendarEventInsert[]
): Promise<CalendarEvent[]> {
  const supabase = createClient();
  
  const eventsWithTimestamps = events.map((event) => ({
    ...event,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(eventsWithTimestamps)
    .select();
  
  if (error) throw error;
  return data || [];
}

// =====================================================
// UPDATE OPERATIONS
// =====================================================

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: CalendarEventUpdate
): Promise<CalendarEvent> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Mark an event as completed
 */
export async function completeCalendarEvent(eventId: string): Promise<CalendarEvent> {
  return updateCalendarEvent(eventId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  });
}

/**
 * Cancel an event
 */
export async function cancelCalendarEvent(eventId: string): Promise<CalendarEvent> {
  return updateCalendarEvent(eventId, {
    status: 'cancelled',
  });
}

/**
 * Reschedule an event
 */
export async function rescheduleCalendarEvent(
  eventId: string,
  newStartDate: string,
  newEndDate?: string
): Promise<CalendarEvent> {
  const updates: CalendarEventUpdate = {
    start_date: newStartDate,
  };
  
  if (newEndDate) {
    updates.end_date = newEndDate;
  }
  
  return updateCalendarEvent(eventId, updates);
}

// =====================================================
// DELETE OPERATIONS
// =====================================================

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId);
  
  if (error) throw error;
}

/**
 * Delete all events in a date range
 */
export async function deleteEventsInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('user_id', userId)
    .gte('start_date', `${startDate}T00:00:00`)
    .lte('start_date', `${endDate}T23:59:59`);
  
  if (error) throw error;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Check if there are any conflicting events
 */
export async function checkEventConflicts(
  userId: string,
  startDate: string,
  endDate: string,
  excludeEventId?: string
): Promise<CalendarEvent[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .or(`and(start_date.lte.${endDate},end_date.gte.${startDate}),and(start_date.gte.${startDate},start_date.lte.${endDate})`);
  
  if (excludeEventId) {
    query = query.neq('id', excludeEventId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

/**
 * Get event count by aspect for a time period
 */
export async function getEventCountByAspect(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, number>> {
  const events = await getCalendarEvents(userId, startDate, endDate);
  
  const counts: Record<string, number> = {};
  events.forEach((event) => {
    counts[event.aspect] = (counts[event.aspect] || 0) + 1;
  });
  
  return counts;
}


