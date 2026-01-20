'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface SportsActivity {
  id: string;
  user_id: string;
  sport: string;
  duration_minutes: number | null;
  location: string | null;
  with_team: boolean;
  notes: string | null;
  activity_date: string;
  created_at: string;
}

export interface SportsActivityInsert {
  sport: string;
  duration_minutes?: number;
  location?: string;
  with_team?: boolean;
  notes?: string;
  activity_date?: string;
}

export function useSports() {
  const [activities, setActivities] = useState<SportsActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch activities
  const fetchActivities = useCallback(async (options?: {
    startDate?: Date;
    endDate?: Date;
    sport?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setActivities([]);
        return;
      }

      let query = supabase
        .from('sports_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false });

      if (options?.startDate) {
        query = query.gte('activity_date', format(options.startDate, 'yyyy-MM-dd'));
      }
      if (options?.endDate) {
        query = query.lte('activity_date', format(options.endDate, 'yyyy-MM-dd'));
      }
      if (options?.sport) {
        query = query.eq('sport', options.sport);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching sports activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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
        .channel('sports_activities_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sports_activities',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchActivities();
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
  }, [fetchActivities]);

  // Log a new activity
  const logActivity = useCallback(async (activity: SportsActivityInsert): Promise<SportsActivity | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sports_activities')
        .insert({
          user_id: user.id,
          sport: activity.sport,
          duration_minutes: activity.duration_minutes || null,
          location: activity.location || null,
          with_team: activity.with_team || false,
          notes: activity.notes || null,
          activity_date: activity.activity_date || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      setActivities(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error logging activity:', err);
      setError('Failed to log activity');
      return null;
    }
  }, []);

  // Update an activity
  const updateActivity = useCallback(async (id: string, updates: Partial<SportsActivityInsert>): Promise<boolean> => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('sports_activities')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setActivities(prev => prev.map(a => 
        a.id === id ? { ...a, ...updates } : a
      ));
      return true;
    } catch (err) {
      console.error('Error updating activity:', err);
      setError('Failed to update activity');
      return false;
    }
  }, []);

  // Delete an activity
  const deleteActivity = useCallback(async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('sports_activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setActivities(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('Failed to delete activity');
      return false;
    }
  }, []);

  // Get monthly stats
  const getMonthlyStats = useCallback(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const thisMonthActivities = activities.filter(a => {
      const date = new Date(a.activity_date);
      return date >= monthStart && date <= monthEnd;
    });

    const totalMinutes = thisMonthActivities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
    const sportCounts: Record<string, number> = {};
    
    thisMonthActivities.forEach(a => {
      sportCounts[a.sport] = (sportCounts[a.sport] || 0) + 1;
    });

    const favoriteSport = Object.entries(sportCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      totalActivities: thisMonthActivities.length,
      totalMinutes,
      favoriteSport,
      sportCounts,
    };
  }, [activities]);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    logActivity,
    updateActivity,
    deleteActivity,
    getMonthlyStats,
  };
}
