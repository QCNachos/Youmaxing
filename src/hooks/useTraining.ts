'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  TrainingLog,
  SleepLog,
  TrainingResource,
  WorkoutExercise,
  TrainingType,
  BodyPart,
  WeeklyWorkoutSummary,
} from '@/types/database';
import { startOfWeek, endOfWeek, format, eachDayOfInterval, isSameDay } from 'date-fns';

// Training Logs Hook
export function useTrainingLogs(options?: {
  startDate?: Date;
  endDate?: Date;
  type?: TrainingType;
}) {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options?.startDate) {
        params.set('startDate', format(options.startDate, 'yyyy-MM-dd'));
      }
      if (options?.endDate) {
        params.set('endDate', format(options.endDate, 'yyyy-MM-dd'));
      }
      if (options?.type) {
        params.set('type', options.type);
      }

      const response = await fetch(`/api/training/logs?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch training logs');
      }

      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options?.startDate, options?.endDate, options?.type]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const createLog = async (logData: Partial<TrainingLog> & { exercises?: Partial<WorkoutExercise>[] }) => {
    try {
      const response = await fetch('/api/training/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create log');
      }

      setLogs(prev => [data.log, ...prev]);
      return data.log;
    } catch (err) {
      throw err;
    }
  };

  const updateLog = async (id: string, updates: Partial<TrainingLog>) => {
    try {
      const response = await fetch('/api/training/logs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update log');
      }

      setLogs(prev => prev.map(log => log.id === id ? { ...log, ...data.log } : log));
      return data.log;
    } catch (err) {
      throw err;
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const response = await fetch(`/api/training/logs?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete log');
      }

      setLogs(prev => prev.filter(log => log.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
    createLog,
    updateLog,
    deleteLog,
  };
}

// Weekly Summary Hook
export function useWeeklyWorkoutSummary(weekStart?: Date) {
  const [summary, setSummary] = useState<Map<number, WeeklyWorkoutSummary>>(new Map());
  const [loading, setLoading] = useState(true);

  const start = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(start, { weekStartsOn: 1 });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd'),
        });

        const response = await fetch(`/api/training/logs?${params.toString()}`);
        const data = await response.json();

        if (response.ok && data.logs) {
          // Group logs by day of week
          const summaryMap = new Map<number, WeeklyWorkoutSummary>();
          
          // Initialize all days
          for (let i = 0; i < 7; i++) {
            summaryMap.set(i, {
              day_of_week: i,
              workout_count: 0,
              total_duration: 0,
              total_calories: 0,
            });
          }

          // Aggregate workout data
          data.logs.forEach((log: TrainingLog) => {
            const date = new Date(log.workout_date);
            const dayOfWeek = date.getDay(); // 0 = Sunday
            const existing = summaryMap.get(dayOfWeek)!;
            
            // Use duration_seconds if available, fallback to duration_minutes
            const durationSeconds = log.duration_seconds || (log.duration_minutes || 0) * 60;
            
            summaryMap.set(dayOfWeek, {
              day_of_week: dayOfWeek,
              workout_count: existing.workout_count + 1,
              total_duration: existing.total_duration + durationSeconds,
              total_calories: existing.total_calories + (log.calories_burned || 0),
            });
          });

          setSummary(summaryMap);
        }
      } catch (err) {
        console.error('Error fetching weekly summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [start.toISOString()]);

  // Get week days with their workout status
  const weekDays = eachDayOfInterval({ start, end }).map(date => {
    const dayOfWeek = date.getDay();
    const daySummary = summary.get(dayOfWeek);
    const isToday = isSameDay(date, new Date());
    const isPast = date < new Date() && !isToday;
    
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      hasWorkout: (daySummary?.workout_count || 0) > 0,
      workoutCount: daySummary?.workout_count || 0,
      duration: daySummary?.total_duration || 0,
      calories: daySummary?.total_calories || 0,
      isToday,
      isPast,
    };
  });

  // Total stats for the week
  const weeklyTotals = {
    workouts: Array.from(summary.values()).reduce((sum, day) => sum + day.workout_count, 0),
    duration: Array.from(summary.values()).reduce((sum, day) => sum + day.total_duration, 0),
    calories: Array.from(summary.values()).reduce((sum, day) => sum + day.total_calories, 0),
  };

  return {
    weekDays,
    weeklyTotals,
    loading,
    weekStart: start,
    weekEnd: end,
  };
}

// Sleep Logs Hook
export function useSleepLogs(options?: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [summary, setSummary] = useState<{
    avg_hours: number;
    avg_quality: number | null;
    days_logged: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options?.startDate) {
        params.set('startDate', format(options.startDate, 'yyyy-MM-dd'));
      }
      if (options?.endDate) {
        params.set('endDate', format(options.endDate, 'yyyy-MM-dd'));
      }
      if (options?.limit) {
        params.set('limit', options.limit.toString());
      }

      const response = await fetch(`/api/training/sleep?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sleep logs');
      }

      setLogs(data.logs || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options?.startDate, options?.endDate, options?.limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const createLog = async (logData: {
    sleep_date: string;
    hours_slept: number;
    quality_rating?: number;
    notes?: string;
  }) => {
    try {
      const response = await fetch('/api/training/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create sleep log');
      }

      // Upsert logic - update existing or add new
      setLogs(prev => {
        const existingIndex = prev.findIndex(log => log.sleep_date === logData.sleep_date);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data.log;
          return updated;
        }
        return [data.log, ...prev].sort((a, b) => 
          new Date(b.sleep_date).getTime() - new Date(a.sleep_date).getTime()
        );
      });

      return data.log;
    } catch (err) {
      throw err;
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const response = await fetch(`/api/training/sleep?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete sleep log');
      }

      setLogs(prev => prev.filter(log => log.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    logs,
    summary,
    loading,
    error,
    refetch: fetchLogs,
    createLog,
    deleteLog,
  };
}

// Training Resources Hook
export function useTrainingResources(options?: {
  type?: string;
  trainingType?: string;
  bodyPart?: string;
  favoritesOnly?: boolean;
}) {
  const [resources, setResources] = useState<TrainingResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options?.type) params.set('type', options.type);
      if (options?.trainingType) params.set('trainingType', options.trainingType);
      if (options?.bodyPart) params.set('bodyPart', options.bodyPart);
      if (options?.favoritesOnly) params.set('favorites', 'true');

      const response = await fetch(`/api/training/resources?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch resources');
      }

      setResources(data.resources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options?.type, options?.trainingType, options?.bodyPart, options?.favoritesOnly]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const createResource = async (resourceData: Partial<TrainingResource>) => {
    try {
      const response = await fetch('/api/training/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create resource');
      }

      setResources(prev => [data.resource, ...prev]);
      return data.resource;
    } catch (err) {
      throw err;
    }
  };

  const updateResource = async (id: string, updates: Partial<TrainingResource>) => {
    try {
      const response = await fetch('/api/training/resources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update resource');
      }

      setResources(prev => prev.map(r => r.id === id ? data.resource : r));
      return data.resource;
    } catch (err) {
      throw err;
    }
  };

  const toggleFavorite = async (id: string) => {
    const resource = resources.find(r => r.id === id);
    if (resource) {
      return updateResource(id, { is_favorite: !resource.is_favorite });
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const response = await fetch(`/api/training/resources?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete resource');
      }

      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    resources,
    loading,
    error,
    refetch: fetchResources,
    createResource,
    updateResource,
    toggleFavorite,
    deleteResource,
  };
}

// Utility: Calculate pace from distance and duration
export function calculatePace(distanceKm: number, durationMinutes: number, unit: 'km' | 'miles' = 'km'): string {
  if (!distanceKm || !durationMinutes || distanceKm <= 0) return '--:--';
  
  let paceMinutes: number;
  if (unit === 'miles') {
    const distanceMiles = distanceKm / 1.60934;
    paceMinutes = durationMinutes / distanceMiles;
  } else {
    paceMinutes = durationMinutes / distanceKm;
  }
  
  const mins = Math.floor(paceMinutes);
  const secs = Math.round((paceMinutes - mins) * 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Utility: Calculate speed from distance and duration
export function calculateSpeed(distanceKm: number, durationMinutes: number, unit: 'km' | 'miles' = 'km'): string {
  if (!distanceKm || !durationMinutes || durationMinutes <= 0) return '--';
  
  const speedKmH = (distanceKm / durationMinutes) * 60;
  
  if (unit === 'miles') {
    const speedMph = speedKmH / 1.60934;
    return `${speedMph.toFixed(1)} mph`;
  }
  
  return `${speedKmH.toFixed(1)} km/h`;
}

// Utility: Convert distance between km and miles
export function convertDistance(distance: number, from: 'km' | 'miles', to: 'km' | 'miles'): number {
  if (from === to) return distance;
  if (from === 'km' && to === 'miles') return distance / 1.60934;
  return distance * 1.60934;
}

