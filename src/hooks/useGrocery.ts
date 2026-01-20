'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Recipe } from './useRecipes';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  checked: boolean;
  recipeId?: string;
  recipeName?: string;
}

export interface GroceryList {
  id: string;
  user_id: string;
  name: string;
  items: GroceryItem[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  quantity: number;
  unit: string | null;
  expiration_date: string | null;
  location: 'pantry' | 'fridge' | 'freezer';
  image_url: string | null;
  barcode: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useGrocery() {
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const listIdRef = useRef<string | null>(null);

  const fetchActiveGroceryList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setGroceryList(null);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      setGroceryList(data || null);
      listIdRef.current = data?.id || null;
    } catch (err) {
      console.error('Error fetching grocery list:', err);
      setError('Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchActiveGroceryList();
  }, [fetchActiveGroceryList]);

  // Subscribe to realtime updates on the grocery list
  useEffect(() => {
    const supabase = createClient();
    
    // Setup realtime subscription for grocery_lists table
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cleanup previous subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      // Subscribe to changes on grocery_lists for this user
      channelRef.current = supabase
        .channel('grocery_lists_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'grocery_lists',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('[Grocery] Realtime update received:', payload.eventType);
            
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const newData = payload.new as GroceryList;
              // Only update if it's the active list
              if (newData.is_active) {
                setGroceryList(newData);
                listIdRef.current = newData.id;
              }
            } else if (payload.eventType === 'DELETE') {
              // If deleted list was ours, refetch
              if (payload.old && (payload.old as GroceryList).id === listIdRef.current) {
                fetchActiveGroceryList();
              }
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchActiveGroceryList]);

  const createGroceryList = useCallback(async (name: string = 'Shopping List'): Promise<GroceryList | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      // Deactivate existing active lists
      await supabase
        .from('grocery_lists')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      const { data, error } = await supabase
        .from('grocery_lists')
        .insert({
          user_id: user.id,
          name,
          items: [],
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      
      setGroceryList(data);
      return data;
    } catch (err) {
      console.error('Error creating grocery list:', err);
      setError('Failed to create grocery list');
      return null;
    }
  }, []);

  const addItem = useCallback(async (item: Omit<GroceryItem, 'id' | 'checked'>): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      let currentList = groceryList;
      
      // Create list if none exists
      if (!currentList) {
        currentList = await createGroceryList();
        if (!currentList) return false;
      }

      const newItem: GroceryItem = {
        ...item,
        id: crypto.randomUUID(),
        checked: false,
      };

      const updatedItems = [...currentList.items, newItem];

      const { data, error } = await supabase
        .from('grocery_lists')
        .update({
          items: updatedItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentList.id)
        .select()
        .single();

      if (error) throw error;
      
      setGroceryList(data);
      return true;
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item');
      return false;
    }
  }, [groceryList, createGroceryList]);

  const removeItem = useCallback(async (itemId: string): Promise<boolean> => {
    if (!groceryList) return false;

    try {
      const supabase = createClient();
      
      const updatedItems = groceryList.items.filter(i => i.id !== itemId);

      const { data, error } = await supabase
        .from('grocery_lists')
        .update({
          items: updatedItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', groceryList.id)
        .select()
        .single();

      if (error) throw error;
      
      setGroceryList(data);
      return true;
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
      return false;
    }
  }, [groceryList]);

  const toggleItem = useCallback(async (itemId: string): Promise<boolean> => {
    if (!groceryList) return false;

    try {
      const supabase = createClient();
      
      const updatedItems = groceryList.items.map(i => 
        i.id === itemId ? { ...i, checked: !i.checked } : i
      );

      const { data, error } = await supabase
        .from('grocery_lists')
        .update({
          items: updatedItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', groceryList.id)
        .select()
        .single();

      if (error) throw error;
      
      setGroceryList(data);
      return true;
    } catch (err) {
      console.error('Error toggling item:', err);
      return false;
    }
  }, [groceryList]);

  const addFromRecipes = useCallback(async (recipes: Recipe[], inventory: PantryItem[] = []): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      let currentList = groceryList;
      
      if (!currentList) {
        currentList = await createGroceryList();
        if (!currentList) return false;
      }

      // Collect all ingredients from recipes
      const allIngredients: GroceryItem[] = [];
      
      for (const recipe of recipes) {
        for (const ingredient of recipe.ingredients) {
          // Check if we have it in inventory
          const inInventory = inventory.find(
            p => p.name.toLowerCase() === ingredient.name.toLowerCase()
          );
          
          // Calculate needed quantity
          let neededQuantity = ingredient.quantity;
          if (inInventory && inInventory.quantity > 0) {
            neededQuantity = Math.max(0, ingredient.quantity - inInventory.quantity);
          }
          
          if (neededQuantity > 0) {
            // Check if already in list
            const existingIndex = allIngredients.findIndex(
              i => i.name.toLowerCase() === ingredient.name.toLowerCase() && i.unit === ingredient.unit
            );
            
            if (existingIndex >= 0) {
              allIngredients[existingIndex].quantity += neededQuantity;
            } else {
              allIngredients.push({
                id: crypto.randomUUID(),
                name: ingredient.name,
                quantity: neededQuantity,
                unit: ingredient.unit,
                checked: false,
                recipeId: recipe.id,
                recipeName: recipe.name,
              });
            }
          }
        }
      }

      // Merge with existing items
      const existingItems = currentList.items;
      for (const newItem of allIngredients) {
        const existingIndex = existingItems.findIndex(
          i => i.name.toLowerCase() === newItem.name.toLowerCase() && i.unit === newItem.unit
        );
        
        if (existingIndex >= 0) {
          existingItems[existingIndex].quantity += newItem.quantity;
        } else {
          existingItems.push(newItem);
        }
      }

      const { data, error } = await supabase
        .from('grocery_lists')
        .update({
          items: existingItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentList.id)
        .select()
        .single();

      if (error) throw error;
      
      setGroceryList(data);
      return true;
    } catch (err) {
      console.error('Error adding from recipes:', err);
      setError('Failed to add items from recipes');
      return false;
    }
  }, [groceryList, createGroceryList]);

  const clearChecked = useCallback(async (): Promise<boolean> => {
    if (!groceryList) return false;

    try {
      const supabase = createClient();
      
      const updatedItems = groceryList.items.filter(i => !i.checked);

      const { data, error } = await supabase
        .from('grocery_lists')
        .update({
          items: updatedItems,
          updated_at: new Date().toISOString(),
        })
        .eq('id', groceryList.id)
        .select()
        .single();

      if (error) throw error;
      
      setGroceryList(data);
      return true;
    } catch (err) {
      console.error('Error clearing checked items:', err);
      return false;
    }
  }, [groceryList]);

  const clearAll = useCallback(async (): Promise<boolean> => {
    if (!groceryList) return false;

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('grocery_lists')
        .update({
          items: [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', groceryList.id)
        .select()
        .single();

      if (error) throw error;
      
      setGroceryList(data);
      return true;
    } catch (err) {
      console.error('Error clearing list:', err);
      return false;
    }
  }, [groceryList]);

  // Archive the current grocery list
  const archiveList = useCallback(async (): Promise<boolean> => {
    if (!groceryList || groceryList.items.length === 0) return false;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const checkedItems = groceryList.items.filter(i => i.checked);
      const totalItems = groceryList.items.length;

      // Create archive entry
      const { error: archiveError } = await supabase
        .from('grocery_list_archive')
        .insert({
          user_id: user.id,
          original_list_id: groceryList.id,
          name: groceryList.name,
          items: groceryList.items,
          total_items: totalItems,
          checked_items: checkedItems.length,
          created_at: groceryList.created_at,
        });

      if (archiveError) throw archiveError;

      // Clear the current list
      const { data, error } = await supabase
        .from('grocery_lists')
        .update({
          items: [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', groceryList.id)
        .select()
        .single();

      if (error) throw error;
      
      setGroceryList(data);
      return true;
    } catch (err) {
      console.error('Error archiving list:', err);
      setError('Failed to archive list');
      return false;
    }
  }, [groceryList]);

  // Get archived lists
  const getArchivedLists = useCallback(async (limit: number = 10): Promise<GroceryList[]> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from('grocery_list_archive')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return (data || []) as unknown as GroceryList[];
    } catch (err) {
      console.error('Error fetching archived lists:', err);
      return [];
    }
  }, []);

  // Get frequently purchased items for AI suggestions
  const getSuggestedItems = useCallback(async (limit: number = 10): Promise<{ name: string; category: string; count: number }[]> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      // Get archived lists
      const { data: archives, error } = await supabase
        .from('grocery_list_archive')
        .select('items')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Count item frequency
      const itemCounts: Record<string, { name: string; category: string; count: number }> = {};
      
      for (const archive of archives || []) {
        const items = archive.items as GroceryItem[];
        for (const item of items) {
          const key = item.name.toLowerCase();
          if (!itemCounts[key]) {
            itemCounts[key] = { name: item.name, category: item.category || 'other', count: 0 };
          }
          itemCounts[key].count++;
        }
      }

      // Sort by frequency and return top items
      return Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (err) {
      console.error('Error getting suggested items:', err);
      return [];
    }
  }, []);

  // Check if all items are checked (for auto-archive)
  const allItemsChecked = groceryList?.items.length > 0 && 
    groceryList.items.every(item => item.checked);

  return {
    groceryList,
    loading,
    error,
    allItemsChecked,
    fetchActiveGroceryList,
    createGroceryList,
    addItem,
    removeItem,
    toggleItem,
    addFromRecipes,
    clearChecked,
    clearAll,
    archiveList,
    getArchivedLists,
    getSuggestedItems,
  };
}

