'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { aspects } from '@/lib/aspects';
import { toast } from 'sonner';

// Single source of truth for carousel apps
let cachedCarouselApps: string[] | null = null;
let cachedWishlistApps: string[] | null = null;
let listeners: Array<() => void> = [];

// Notify all listeners when preferences change
function notifyListeners() {
  listeners.forEach(listener => listener());
}

// Subscribe to preference changes
function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

/**
 * Custom hook for managing carousel apps across the entire application.
 * Provides a single source of truth with automatic synchronization.
 */
export function useCarouselApps() {
  const [carouselApps, setCarouselApps] = useState<string[]>([]);
  const [wishlistApps, setWishlistApps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get available aspects (excluding settings)
  const availableAspects = aspects.filter(a => a.id !== 'settings');
  const defaultApps = availableAspects.slice(0, 5).map(a => a.id);

  // Load preferences from database
  const loadPreferences = useCallback(async (forceRefresh = false) => {
    // Return cached data if available and not forcing refresh
    if (!forceRefresh && cachedCarouselApps !== null) {
      setCarouselApps(cachedCarouselApps);
      setWishlistApps(cachedWishlistApps || []);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in - use defaults
        const defaults = defaultApps;
        cachedCarouselApps = defaults;
        cachedWishlistApps = [];
        setCarouselApps(defaults);
        setWishlistApps([]);
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('carousel_apps, wishlist_apps, installed_apps')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading preferences:', error);
        // Use defaults on error
        cachedCarouselApps = defaultApps;
        cachedWishlistApps = [];
        setCarouselApps(defaultApps);
        setWishlistApps([]);
      } else {
        // Priority: carousel_apps > installed_apps > defaults
        const apps = preferences?.carousel_apps && preferences.carousel_apps.length > 0
          ? preferences.carousel_apps
          : preferences?.installed_apps && preferences.installed_apps.length > 0
          ? preferences.installed_apps
          : defaultApps;

        // Ensure we have at least 5 apps
        const finalApps = apps.length >= 5 ? apps : defaultApps;

        cachedCarouselApps = finalApps;
        cachedWishlistApps = preferences?.wishlist_apps || [];
        setCarouselApps(finalApps);
        setWishlistApps(cachedWishlistApps);
      }
    } catch (error) {
      console.error('Error in loadPreferences:', error);
      cachedCarouselApps = defaultApps;
      cachedWishlistApps = [];
      setCarouselApps(defaultApps);
      setWishlistApps([]);
    } finally {
      setLoading(false);
    }
  }, [defaultApps]);

  // Save preferences to database
  const savePreferences = useCallback(async (newCarouselApps: string[], newWishlistApps: string[]) => {
    if (!userId) {
      toast.error('You must be logged in to save preferences');
      return false;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_preferences')
        .update({
          carousel_apps: newCarouselApps,
          wishlist_apps: newWishlistApps,
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Update cache
      cachedCarouselApps = newCarouselApps;
      cachedWishlistApps = newWishlistApps;

      // Update local state
      setCarouselApps(newCarouselApps);
      setWishlistApps(newWishlistApps);

      // Notify all other components
      notifyListeners();

      toast.success('Preferences saved successfully!');
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
      return false;
    }
  }, [userId]);

  // Toggle app in carousel
  const toggleCarouselApp = useCallback((appSlug: string) => {
    const newApps = carouselApps.includes(appSlug)
      ? carouselApps.filter(s => s !== appSlug)
      : [...carouselApps, appSlug];

    // Enforce constraints
    if (newApps.length < 5) {
      toast.error('You must have at least 5 apps in your carousel');
      return false;
    }
    if (newApps.length > 10) {
      toast.error('You can have maximum 10 apps in your carousel');
      return false;
    }

    setCarouselApps(newApps);
    return true;
  }, [carouselApps]);

  // Toggle app in wishlist
  const toggleWishlist = useCallback((appSlug: string) => {
    const newWishlist = wishlistApps.includes(appSlug)
      ? wishlistApps.filter(s => s !== appSlug)
      : [...wishlistApps, appSlug];

    setWishlistApps(newWishlist);
    toast.success(
      newWishlist.includes(appSlug)
        ? "Added to wishlist! We'll notify you when it's ready."
        : 'Removed from wishlist'
    );
  }, [wishlistApps]);

  // Get filtered aspects for display
  const getFilteredAspects = useCallback(() => {
    return availableAspects.filter(aspect => carouselApps.includes(aspect.id));
  }, [carouselApps, availableAspects]);

  // Initial load
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Subscribe to changes from other components
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      loadPreferences(true); // Force refresh when notified
    });
    return unsubscribe;
  }, [loadPreferences]);

  return {
    carouselApps,
    wishlistApps,
    loading,
    userId,
    savePreferences,
    toggleCarouselApp,
    toggleWishlist,
    getFilteredAspects,
    refresh: () => loadPreferences(true),
  };
}

