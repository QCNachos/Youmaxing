'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { startOfWeek, format, addDays } from 'date-fns';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface PlannedMeal {
  recipeId?: string;
  recipeName?: string;
  customMeal?: string;
  notes?: string;
}

export interface DayPlan {
  breakfast?: PlannedMeal;
  lunch?: PlannedMeal;
  dinner?: PlannedMeal;
  snacks?: PlannedMeal[];
}

export interface WeeklyMealPlan {
  id: string;
  user_id: string;
  week_start: string;
  meals: {
    [date: string]: DayPlan;
  };
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useMealPlan(weekStart?: Date) {
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    weekStart || startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const fetchMealPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMealPlan(null);
        return;
      }

      const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');

      const { data, error: fetchError } = await supabase
        .from('weekly_meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start', weekStartStr)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      setMealPlan(data || null);
    } catch (err) {
      console.error('Error fetching meal plan:', err);
      setError('Failed to load meal plan');
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchMealPlan();
  }, [fetchMealPlan]);

  const createOrUpdateMealPlan = useCallback(async (meals: { [date: string]: DayPlan }): Promise<WeeklyMealPlan | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('weekly_meal_plans')
        .upsert({
          user_id: user.id,
          week_start: weekStartStr,
          meals,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,week_start',
        })
        .select()
        .single();

      if (error) throw error;
      
      setMealPlan(data);
      return data;
    } catch (err) {
      console.error('Error saving meal plan:', err);
      setError('Failed to save meal plan');
      return null;
    }
  }, [currentWeekStart]);

  const setMealForDay = useCallback(async (
    date: Date, 
    slot: MealSlot, 
    meal: PlannedMeal | null
  ): Promise<boolean> => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentMeals = mealPlan?.meals || {};
    const dayPlan = currentMeals[dateStr] || {};

    if (slot === 'snack' && meal) {
      // For snacks, we append to the array
      const snacks = dayPlan.snacks || [];
      dayPlan.snacks = [...snacks, meal];
    } else if (meal) {
      dayPlan[slot] = meal;
    } else {
      delete dayPlan[slot];
    }

    const updatedMeals = {
      ...currentMeals,
      [dateStr]: dayPlan,
    };

    const result = await createOrUpdateMealPlan(updatedMeals);
    return result !== null;
  }, [mealPlan, createOrUpdateMealPlan]);

  const removeMealFromDay = useCallback(async (
    date: Date, 
    slot: MealSlot,
    snackIndex?: number
  ): Promise<boolean> => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentMeals = mealPlan?.meals || {};
    const dayPlan = { ...currentMeals[dateStr] };

    if (slot === 'snack' && snackIndex !== undefined && dayPlan.snacks) {
      dayPlan.snacks = dayPlan.snacks.filter((_, i) => i !== snackIndex);
    } else {
      delete dayPlan[slot];
    }

    const updatedMeals = {
      ...currentMeals,
      [dateStr]: dayPlan,
    };

    const result = await createOrUpdateMealPlan(updatedMeals);
    return result !== null;
  }, [mealPlan, createOrUpdateMealPlan]);

  const getWeekDates = useCallback((): Date[] => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const getDayPlan = useCallback((date: Date): DayPlan | null => {
    if (!mealPlan) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return mealPlan.meals[dateStr] || null;
  }, [mealPlan]);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  }, []);

  const goToWeek = useCallback((date: Date) => {
    setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
  }, []);

  const getRecipeIdsForWeek = useCallback((): string[] => {
    if (!mealPlan) return [];
    
    const recipeIds = new Set<string>();
    
    Object.values(mealPlan.meals).forEach(dayPlan => {
      if (dayPlan.breakfast?.recipeId) recipeIds.add(dayPlan.breakfast.recipeId);
      if (dayPlan.lunch?.recipeId) recipeIds.add(dayPlan.lunch.recipeId);
      if (dayPlan.dinner?.recipeId) recipeIds.add(dayPlan.dinner.recipeId);
      dayPlan.snacks?.forEach(s => {
        if (s.recipeId) recipeIds.add(s.recipeId);
      });
    });
    
    return Array.from(recipeIds);
  }, [mealPlan]);

  return {
    mealPlan,
    loading,
    error,
    currentWeekStart,
    fetchMealPlan,
    createOrUpdateMealPlan,
    setMealForDay,
    removeMealFromDay,
    getWeekDates,
    getDayPlan,
    goToNextWeek,
    goToPreviousWeek,
    goToWeek,
    getRecipeIdsForWeek,
  };
}

