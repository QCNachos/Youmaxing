'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeInstruction {
  step: number;
  text: string;
}

export interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  servings: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  nutrition_per_serving: RecipeNutrition | null;
  image_url: string | null;
  tags: string[];
  cuisine: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  is_favorite: boolean;
  source_url: string | null;
  times_cooked: number;
  last_cooked_at: string | null;
  created_at: string;
  updated_at: string;
}

export type RecipeInsert = Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'times_cooked' | 'last_cooked_at'>;
export type RecipeUpdate = Partial<RecipeInsert>;

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRecipes([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRecipes(data || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const addRecipe = useCallback(async (recipe: RecipeInsert): Promise<Recipe | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recipes')
        .insert({
          ...recipe,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setRecipes(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding recipe:', err);
      setError('Failed to add recipe');
      return null;
    }
  }, []);

  const updateRecipe = useCallback(async (id: string, updates: RecipeUpdate): Promise<Recipe | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recipes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setRecipes(prev => prev.map(r => r.id === id ? data : r));
      return data;
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError('Failed to update recipe');
      return null;
    }
  }, []);

  const deleteRecipe = useCallback(async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setRecipes(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError('Failed to delete recipe');
      return false;
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string): Promise<boolean> => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return false;
    
    const result = await updateRecipe(id, { is_favorite: !recipe.is_favorite });
    return result !== null;
  }, [recipes, updateRecipe]);

  const markAsCooked = useCallback(async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const recipe = recipes.find(r => r.id === id);
      if (!recipe) return false;

      const { data, error } = await supabase
        .from('recipes')
        .update({
          times_cooked: recipe.times_cooked + 1,
          last_cooked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setRecipes(prev => prev.map(r => r.id === id ? data : r));
      return true;
    } catch (err) {
      console.error('Error marking recipe as cooked:', err);
      return false;
    }
  }, [recipes]);

  const searchRecipes = useCallback((query: string): Recipe[] => {
    const lowerQuery = query.toLowerCase();
    return recipes.filter(r => 
      r.name.toLowerCase().includes(lowerQuery) ||
      r.description?.toLowerCase().includes(lowerQuery) ||
      r.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      r.cuisine?.toLowerCase().includes(lowerQuery)
    );
  }, [recipes]);

  const getFavorites = useCallback((): Recipe[] => {
    return recipes.filter(r => r.is_favorite);
  }, [recipes]);

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    markAsCooked,
    searchRecipes,
    getFavorites,
  };
}

