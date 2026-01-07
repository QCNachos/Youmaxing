'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Music,
  BookOpen,
  Gamepad2,
  Baby,
  PawPrint,
  Check,
  Star,
  Loader2,
  Home,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { aspects } from '@/lib/aspects';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Extended icon mapping including main aspect icons
const iconMap: Record<string, LucideIcon> = {
  Music,
  BookOpen,
  Gamepad2,
  Baby,
  PawPrint,
};

interface AppItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  category: 'productivity' | 'health' | 'entertainment' | 'lifestyle' | 'finance';
  isActive: boolean; // true = available in V1, false = coming soon in V2
  requiresOauth?: string[];
}

// All apps including V1 (10 main apps) and V2 (coming soon)
const allApps: AppItem[] = [
  // V1 - Main Apps (Active)
  ...aspects
    .filter((a) => a.id !== 'settings')
    .map((aspect) => ({
      id: aspect.id,
      slug: aspect.id,
      name: aspect.name,
      description: aspect.description,
      icon: aspect.icon,
      color: aspect.color,
      gradient: aspect.gradient,
      category: 
        aspect.id === 'training' || aspect.id === 'food' || aspect.id === 'sports'
          ? ('health' as const)
          : aspect.id === 'finance'
          ? ('finance' as const)
          : aspect.id === 'business'
          ? ('productivity' as const)
          : aspect.id === 'films' || aspect.id === 'events'
          ? ('entertainment' as const)
          : ('lifestyle' as const),
      isActive: true,
    })),
  
  // V2 - Coming Soon Apps
  {
    id: 'music',
    slug: 'music',
    name: 'Music',
    description: 'Track your favorite music with Spotify integration',
    icon: Music,
    color: '#1DB954',
    gradient: 'from-green-500 to-emerald-500',
    category: 'entertainment',
    isActive: false,
    requiresOauth: ['spotify'],
  },
  {
    id: 'books',
    slug: 'books',
    name: 'Books',
    description: 'Your reading list and book recommendations',
    icon: BookOpen,
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-500',
    category: 'entertainment',
    isActive: false,
  },
  {
    id: 'games',
    slug: 'games',
    name: 'Games',
    description: 'Track games you play and want to play',
    icon: Gamepad2,
    color: '#EF4444',
    gradient: 'from-red-500 to-orange-500',
    category: 'entertainment',
    isActive: false,
  },
  {
    id: 'kids',
    slug: 'kids',
    name: 'Kids',
    description: 'Activities and content for your children',
    icon: Baby,
    color: '#F59E0B',
    gradient: 'from-amber-500 to-yellow-500',
    category: 'lifestyle',
    isActive: false,
  },
  {
    id: 'pets',
    slug: 'pets',
    name: 'Pets',
    description: 'Care tracking for your furry friends',
    icon: PawPrint,
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
    category: 'lifestyle',
    isActive: false,
  },
];

interface AppsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppSelect?: (appSlug: string) => void;
}

export function AppStore({ open, onOpenChange, onAppSelect }: AppsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [carouselApps, setCarouselApps] = useState<string[]>([]);
  const [wishlistApps, setWishlistApps] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userId, setUserId] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All Apps' },
    { value: 'health', label: 'Health' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'finance', label: 'Finance' },
    { value: 'lifestyle', label: 'Lifestyle' },
  ];

  const activeApps = allApps.filter((a) => a.isActive);
  const comingSoonApps = allApps.filter((a) => !a.isActive);

  const filteredApps =
    selectedCategory === 'all'
      ? allApps
      : allApps.filter((app) => app.category === selectedCategory);

  // Load user preferences
  useEffect(() => {
    if (open) {
      loadUserPreferences();
    }
  }, [open]);

  const loadUserPreferences = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
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
        // Set defaults
        setCarouselApps(activeApps.slice(0, 5).map((a) => a.slug));
        setWishlistApps([]);
      } else {
        setCarouselApps(
          preferences?.carousel_apps ||
            preferences?.installed_apps ||
            activeApps.slice(0, 5).map((a) => a.slug)
        );
        setWishlistApps(preferences?.wishlist_apps || []);
      }
    } catch (error) {
      console.error('Error in loadUserPreferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_preferences')
        .update({
          carousel_apps: carouselApps,
          wishlist_apps: wishlistApps,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleCarouselApp = (appSlug: string) => {
    if (carouselApps.includes(appSlug)) {
      // Remove - but enforce minimum of 5
      if (carouselApps.length <= 5) {
        toast.error('You must have at least 5 apps in your carousel');
        return;
      }
      setCarouselApps(carouselApps.filter((s) => s !== appSlug));
    } else {
      // Add - but enforce maximum of 10
      if (carouselApps.length >= 10) {
        toast.error('You can have maximum 10 apps in your carousel');
        return;
      }
      setCarouselApps([...carouselApps, appSlug]);
    }
  };

  const toggleWishlist = (appSlug: string) => {
    if (wishlistApps.includes(appSlug)) {
      setWishlistApps(wishlistApps.filter((s) => s !== appSlug));
      toast.success('Removed from wishlist');
    } else {
      setWishlistApps([...wishlistApps, appSlug]);
      toast.success('Added to wishlist! We\'ll notify you when it\'s ready.');
    }
  };

  const handleOpenApp = (appSlug: string) => {
    if (allApps.find((a) => a.slug === appSlug && !a.isActive)) {
      toast.error('This app is coming soon!');
      return;
    }
    onOpenChange(false);
    onAppSelect?.(appSlug);
  };

  const renderAppCard = (app: AppItem) => {
    const Icon = app.icon;
    const isInCarousel = carouselApps.includes(app.slug);
    const isWishlisted = wishlistApps.includes(app.slug);

    return (
      <Card
        key={app.id}
        className={cn(
          'relative overflow-hidden transition-all',
          !app.isActive ? 'opacity-80' : 'hover:border-primary/50'
        )}
      >
        {!app.isActive && (
          <Badge
            className="absolute top-2 right-2 bg-amber-500/20 text-amber-400 border-amber-500/30"
            variant="secondary"
          >
            Coming Soon
          </Badge>
        )}

        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* App Icon */}
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${app.gradient} flex-shrink-0`}
            >
              <Icon className="h-7 w-7 text-white" />
            </div>

            {/* App Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1">{app.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {app.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-xs">
                  {app.category}
                </Badge>
                {isInCarousel && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-primary/10 border-primary/30"
                  >
                    <Home className="h-3 w-3 mr-1" />
                    In Carousel
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between gap-2">
            {app.isActive ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenApp(app.slug)}
                  className="flex-1"
                >
                  Open App
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleCarouselApp(app.slug)}
                    title={
                      isInCarousel
                        ? 'Remove from carousel'
                        : 'Add to carousel'
                    }
                    className="h-9 w-9"
                  >
                    {isInCarousel ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex-1"
                >
                  Coming in V2
                </Button>
                <Button
                  variant={isWishlisted ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => toggleWishlist(app.slug)}
                  title={
                    isWishlisted
                      ? 'Remove from wishlist'
                      : 'Add to wishlist'
                  }
                  className="h-9 w-9"
                >
                  {isWishlisted ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <BellOff className="h-4 w-4" />
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Apps
              </DialogTitle>
              <DialogDescription className="mt-1">
                Manage which apps appear in your home carousel (min 5, max 10)
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {carouselApps.length}/10 in carousel
              </Badge>
              <Button
                size="sm"
                onClick={savePreferences}
                disabled={saving || loading}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Category Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="flex-1 flex flex-col min-h-0 px-6"
        >
          <TabsList className="grid grid-cols-6 w-full mt-4">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 mt-4 pb-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6 pr-4">
                {/* Active Apps Section */}
                {filteredApps.filter((a) => a.isActive).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Available Now
                    </h3>
                    <div className="grid gap-4">
                      {filteredApps
                        .filter((a) => a.isActive)
                        .map(renderAppCard)}
                    </div>
                  </div>
                )}

                {/* Coming Soon Apps Section */}
                {filteredApps.filter((a) => !a.isActive).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Coming in Version 2
                    </h3>
                    <div className="grid gap-4">
                      {filteredApps
                        .filter((a) => !a.isActive)
                        .map(renderAppCard)}
                    </div>
                  </div>
                )}

                {filteredApps.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No apps in this category.
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{activeApps.length} apps available</span>
              <span className="text-amber-500">
                {comingSoonApps.length} coming soon
              </span>
              {wishlistApps.length > 0 && (
                <span>
                  <Bell className="h-3 w-3 inline mr-1" />
                  {wishlistApps.length} wishlisted
                </span>
              )}
            </div>
            <p>Use the eye icon to add/remove apps from your home carousel</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
