/**
 * Travel Conversions - Auto-convert completed trips and bucket list items
 */

import { createClient } from './supabase/client';
import { geocodeLocation } from './geocoding';

/**
 * Convert a completed trip (end_date < today) to a visited place
 */
export async function convertCompletedTripToVisitedPlace(tripId: string) {
  const supabase = createClient();
  
  try {
    // Get the trip
    const { data: trip, error: fetchError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (fetchError || !trip) {
      throw new Error('Trip not found');
    }

    // Check if trip is completed (end_date passed)
    if (!trip.end_date) {
      throw new Error('Trip has no end date');
    }

    const endDate = new Date(trip.end_date);
    const today = new Date();
    
    if (endDate >= today) {
      throw new Error('Trip is not yet completed');
    }

    // Geocode the destination
    const coords = await geocodeLocation(trip.destination, null);

    // Extract year from end_date
    const year = endDate.getFullYear();

    // Create visited place
    const { data: place, error: insertError } = await supabase
      .from('visited_places')
      .insert({
        user_id: trip.user_id,
        country: trip.destination,
        city: null,
        year,
        emoji: '✈️',
        coordinates_x: coords.lng,
        coordinates_y: coords.lat,
        notes: trip.notes || `Trip from ${trip.start_date || 'unknown'} to ${trip.end_date}`,
        rating: 5,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Delete the trip (or optionally mark as archived)
    const { error: deleteError } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (deleteError) {
      throw deleteError;
    }

    return place;
  } catch (error) {
    console.error('Error converting trip to visited place:', error);
    throw error;
  }
}

/**
 * Check and auto-convert all completed trips for a user
 */
export async function autoConvertCompletedTrips(userId: string) {
  const supabase = createClient();
  
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get all completed trips (end_date < today)
    const { data: completedTrips, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .not('end_date', 'is', null)
      .lt('end_date', today);

    if (error) {
      throw error;
    }

    const results = [];
    for (const trip of completedTrips || []) {
      try {
        const place = await convertCompletedTripToVisitedPlace(trip.id);
        results.push({ success: true, trip, place });
      } catch (err) {
        results.push({ success: false, trip, error: err });
      }
    }

    return results;
  } catch (error) {
    console.error('Error auto-converting trips:', error);
    throw error;
  }
}

/**
 * Convert a bucket list item to a trip
 */
export async function convertBucketListToTrip(bucketListId: string, tripData: {
  start_date?: string;
  end_date?: string;
  budget?: number;
  current_saved?: number;
  notes?: string;
}) {
  const supabase = createClient();
  
  try {
    // Get the bucket list item
    const { data: item, error: fetchError } = await supabase
      .from('bucket_list')
      .select('*')
      .eq('id', bucketListId)
      .single();

    if (fetchError || !item) {
      throw new Error('Bucket list item not found');
    }

    // Create trip from bucket list item
    const { data: trip, error: insertError } = await supabase
      .from('trips')
      .insert({
        user_id: item.user_id,
        destination: item.destination,
        status: 'planning',
        start_date: tripData.start_date || null,
        end_date: tripData.end_date || null,
        budget: tripData.budget || null,
        current_saved: tripData.current_saved || 0,
        notes: tripData.notes || item.reason || null,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Delete the bucket list item
    const { error: deleteError } = await supabase
      .from('bucket_list')
      .delete()
      .eq('id', bucketListId);

    if (deleteError) {
      throw deleteError;
    }

    return trip;
  } catch (error) {
    console.error('Error converting bucket list to trip:', error);
    throw error;
  }
}

