'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type WatchStatus = 'want_to_watch' | 'watching' | 'watched';

export interface WatchlistItem {
  id: string;
  user_id: string;
  title: string;
  media_type: 'movie' | 'tv';
  tmdb_id: number | null;
  poster_path: string | null;
  status: WatchStatus;
  user_rating: number | null;
  notes: string | null;
  created_at: string;
}

export interface WatchlistInsert {
  title: string;
  media_type?: 'movie' | 'tv';
  tmdb_id?: number;
  poster_path?: string;
  status?: WatchStatus;
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch watchlist
  const fetchWatchlist = useCallback(async (status?: WatchStatus) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setItems([]);
        return;
      }

      let query = supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      setError('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

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
        .channel('watchlist_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'watchlist',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchWatchlist();
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
  }, [fetchWatchlist]);

  // Add to watchlist
  const addItem = useCallback(async (item: WatchlistInsert): Promise<WatchlistItem | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          title: item.title,
          media_type: item.media_type || 'movie',
          tmdb_id: item.tmdb_id || null,
          poster_path: item.poster_path || null,
          status: item.status || 'want_to_watch',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          setError('Already on your watchlist');
          return null;
        }
        throw error;
      }
      
      setItems(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      setError('Failed to add item');
      return null;
    }
  }, []);

  // Update status
  const updateStatus = useCallback(async (id: string, status: WatchStatus, rating?: number): Promise<boolean> => {
    try {
      const supabase = createClient();

      const updates: Record<string, unknown> = { status };
      if (rating !== undefined) {
        updates.user_rating = rating;
      }

      const { error } = await supabase
        .from('watchlist')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, status, ...(rating !== undefined && { user_rating: rating }) } : item
      ));
      return true;
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
      return false;
    }
  }, []);

  // Rate item
  const rateItem = useCallback(async (id: string, rating: number): Promise<boolean> => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('watchlist')
        .update({ user_rating: rating })
        .eq('id', id);

      if (error) throw error;
      
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, user_rating: rating } : item
      ));
      return true;
    } catch (err) {
      console.error('Error rating item:', err);
      setError('Failed to rate item');
      return false;
    }
  }, []);

  // Remove from watchlist
  const removeItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
      return false;
    }
  }, []);

  // Get items by status
  const getByStatus = useCallback((status: WatchStatus) => {
    return items.filter(item => item.status === status);
  }, [items]);

  // Get stats
  const getStats = useCallback(() => {
    const wantToWatch = items.filter(i => i.status === 'want_to_watch').length;
    const watching = items.filter(i => i.status === 'watching').length;
    const watched = items.filter(i => i.status === 'watched').length;
    const avgRating = items.filter(i => i.user_rating).reduce((sum, i) => sum + (i.user_rating || 0), 0) / 
      (items.filter(i => i.user_rating).length || 1);

    return {
      total: items.length,
      wantToWatch,
      watching,
      watched,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }, [items]);

  return {
    items,
    loading,
    error,
    fetchWatchlist,
    addItem,
    updateStatus,
    rateItem,
    removeItem,
    getByStatus,
    getStats,
  };
}
