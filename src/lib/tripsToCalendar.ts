/**
 * Convert trips from database to calendar events
 */

import type { CalendarEvent } from './unifiedCalendar';
import type { Trip } from '@/hooks/useTravel';

export function tripsToCalendarEvents(trips: Trip[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  trips.forEach((trip) => {
    // Only add trips with dates
    if (!trip.start_date) return;
    
    const startDate = new Date(trip.start_date);
    
    // Determine status emoji and color
    let emoji = '✈️';
    switch (trip.status) {
      case 'dream':
        emoji = '💭';
        break;
      case 'planning':
        emoji = '📝';
        break;
      case 'booked':
        emoji = '✅';
        break;
      case 'completed':
        emoji = '🏁';
        break;
    }
    
    // Create description with budget info if available
    let description = trip.notes || `Trip to ${trip.destination}`;
    if (trip.budget && trip.current_saved !== null) {
      const progress = Math.round((trip.current_saved / trip.budget) * 100);
      description += ` • Budget: ${progress}% funded ($${trip.current_saved}/$${trip.budget})`;
    }
    
    events.push({
      id: `trip-${trip.id}`,
      title: `${emoji} ${trip.destination}`,
      description,
      aspect: 'travel',
      type: 'personal',
      date: startDate,
      time: '09:00',
      priority: trip.status === 'booked' ? 'high' : 'medium',
      status: trip.status === 'completed' ? 'completed' : 'scheduled',
      source: 'travel',
      emoji,
    });
    
    // Add end date as separate event if exists
    if (trip.end_date) {
      const endDate = new Date(trip.end_date);
      events.push({
        id: `trip-end-${trip.id}`,
        title: `${emoji} ${trip.destination} - Return`,
        description: `End of ${trip.destination} trip`,
        aspect: 'travel',
        type: 'personal',
        date: endDate,
        time: '18:00',
        priority: trip.status === 'booked' ? 'high' : 'medium',
        status: trip.status === 'completed' ? 'completed' : 'scheduled',
        source: 'travel',
        emoji: '🏠',
      });
    }
  });
  
  return events;
}


