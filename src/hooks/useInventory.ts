'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export type InventoryLocation = 'pantry' | 'fridge' | 'freezer';
export type InventoryCategory = 
  | 'produce' 
  | 'dairy' 
  | 'meat' 
  | 'seafood' 
  | 'grains' 
  | 'canned'
  | 'frozen' 
  | 'snacks' 
  | 'beverages' 
  | 'condiments' 
  | 'spices' 
  | 'other';

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  category: InventoryCategory | null;
  quantity: number;
  unit: string | null;
  expiration_date: string | null;
  location: InventoryLocation;
  image_url: string | null;
  barcode: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InventoryItemInsert = Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type InventoryItemUpdate = Partial<InventoryItemInsert>;

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setItems([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(async (item: InventoryItemInsert): Promise<InventoryItem | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pantry_items')
        .insert({
          ...item,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setItems(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item');
      return null;
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: InventoryItemUpdate): Promise<InventoryItem | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pantry_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setItems(prev => prev.map(i => i.id === id ? data : i));
      return data;
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item');
      return null;
    }
  }, []);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setItems(prev => prev.filter(i => i.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
      return false;
    }
  }, []);

  const getByLocation = useCallback((location: InventoryLocation): InventoryItem[] => {
    return items.filter(i => i.location === location);
  }, [items]);

  const getByCategory = useCallback((category: InventoryCategory): InventoryItem[] => {
    return items.filter(i => i.category === category);
  }, [items]);

  const getExpiringSoon = useCallback((days: number = 7): InventoryItem[] => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return items.filter(i => {
      if (!i.expiration_date) return false;
      const expDate = new Date(i.expiration_date);
      return expDate <= cutoff && expDate >= now;
    }).sort((a, b) => 
      new Date(a.expiration_date!).getTime() - new Date(b.expiration_date!).getTime()
    );
  }, [items]);

  const getExpired = useCallback((): InventoryItem[] => {
    const now = new Date();
    
    return items.filter(i => {
      if (!i.expiration_date) return false;
      return new Date(i.expiration_date) < now;
    });
  }, [items]);

  const searchItems = useCallback((query: string): InventoryItem[] => {
    const lowerQuery = query.toLowerCase();
    return items.filter(i => 
      i.name.toLowerCase().includes(lowerQuery) ||
      i.category?.toLowerCase().includes(lowerQuery) ||
      i.notes?.toLowerCase().includes(lowerQuery)
    );
  }, [items]);

  const adjustQuantity = useCallback(async (id: string, delta: number): Promise<boolean> => {
    const item = items.find(i => i.id === id);
    if (!item) return false;
    
    const newQuantity = Math.max(0, item.quantity + delta);
    
    if (newQuantity === 0) {
      return deleteItem(id);
    }
    
    const result = await updateItem(id, { quantity: newQuantity });
    return result !== null;
  }, [items, updateItem, deleteItem]);

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    getByLocation,
    getByCategory,
    getExpiringSoon,
    getExpired,
    searchItems,
    adjustQuantity,
  };
}

