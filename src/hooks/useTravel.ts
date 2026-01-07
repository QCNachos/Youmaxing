'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  status: 'dream' | 'planning' | 'booked' | 'completed';
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  current_saved?: number | null;
  notes: string | null;
  created_at: string;
}

export interface BucketListItem {
  id: string;
  user_id: string;
  destination: string;
  country: string | null;
  emoji: string;
  reason: string | null;
  priority: 'low' | 'medium' | 'high';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitedPlace {
  id: string;
  user_id: string;
  country: string;
  city: string | null;
  year: number;
  emoji: string;
  coordinates_x: number;
  coordinates_y: number;
  notes: string | null;
  photos: string[] | null;
  rating: number | null;
  visited_at: string | null;
  created_at: string;
  updated_at: string;
}

// Hook for managing trips
export function useTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTrips(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const addTrip = async (tripData: Omit<Trip, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');

    const supabase = createClient();
    const { data, error: addError } = await supabase
      .from('trips')
      .insert({ ...tripData, user_id: user.id })
      .select()
      .single();

    if (addError) throw addError;
    setTrips((prev) => [data, ...prev]);
    return data;
  };

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    if (!user) throw new Error('User not authenticated');

    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    setTrips((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  };

  const deleteTrip = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('trips')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    trips,
    loading,
    error,
    addTrip,
    updateTrip,
    deleteTrip,
    refetch: fetchTrips,
  };
}

// Hook for managing bucket list
export function useBucketList() {
  const { user } = useAuth();
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('bucket_list')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setItems(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bucket list:', err);
      setError('Failed to load bucket list');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (itemData: Omit<BucketListItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    const supabase = createClient();
    const { data, error: addError } = await supabase
      .from('bucket_list')
      .insert({ ...itemData, user_id: user.id })
      .select()
      .single();

    if (addError) throw addError;
    setItems((prev) => [data, ...prev]);
    return data;
  };

  const updateItem = async (id: string, updates: Partial<BucketListItem>) => {
    if (!user) throw new Error('User not authenticated');

    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from('bucket_list')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    setItems((prev) => prev.map((item) => (item.id === id ? data : item)));
    return data;
  };

  const deleteItem = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('bucket_list')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  };
}

// Hook for managing visited places
export function useVisitedPlaces() {
  const { user } = useAuth();
  const [places, setPlaces] = useState<VisitedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    if (!user) {
      setPlaces([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('visited_places')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPlaces(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching visited places:', err);
      setError('Failed to load visited places');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const addPlace = async (placeData: Omit<VisitedPlace, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    const supabase = createClient();
    const { data, error: addError } = await supabase
      .from('visited_places')
      .insert({ ...placeData, user_id: user.id })
      .select()
      .single();

    if (addError) throw addError;
    setPlaces((prev) => [data, ...prev]);
    return data;
  };

  const updatePlace = async (id: string, updates: Partial<VisitedPlace>) => {
    if (!user) throw new Error('User not authenticated');

    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from('visited_places')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    setPlaces((prev) => prev.map((place) => (place.id === id ? data : place)));
    return data;
  };

  const deletePlace = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('visited_places')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;
    setPlaces((prev) => prev.filter((place) => place.id !== id));
  };

  return {
    places,
    loading,
    error,
    addPlace,
    updatePlace,
    deletePlace,
    refetch: fetchPlaces,
  };
}

