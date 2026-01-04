'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Music,
  BookOpen,
  Gamepad2,
  Baby,
  PawPrint,
  Check,
  Plus,
  Loader2,
  Link2,
  ExternalLink,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { AspectApp, UserInstalledApp, AppCategory } from '@/types/database';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Music,
  BookOpen,
  Gamepad2,
  Baby,
  PawPrint,
};

// Mock available apps
const mockApps: AspectApp[] = [
  {
    id: '1',
    slug: 'music',
    name: 'Music',
    description: 'Track your favorite music with Spotify integration',
    icon: 'Music',
    color: '#1DB954',
    gradient: 'from-green-500 to-emerald-500',
    category: 'entertainment',
    is_active: true,
    requires_oauth: ['spotify'],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    slug: 'books',
    name: 'Books',
    description: 'Your reading list and book recommendations',
    icon: 'BookOpen',
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-500',
    category: 'entertainment',
    is_active: true,
    requires_oauth: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    slug: 'games',
    name: 'Games',
    description: 'Track games you play and want to play',
    icon: 'Gamepad2',
    color: '#EF4444',
    gradient: 'from-red-500 to-orange-500',
    category: 'entertainment',
    is_active: false, // Coming soon
    requires_oauth: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    slug: 'kids',
    name: 'Kids',
    description: 'Activities and content for your children',
    icon: 'Baby',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-yellow-500',
    category: 'lifestyle',
    is_active: false,
    requires_oauth: [],
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    slug: 'pets',
    name: 'Pets',
    description: 'Care tracking for your furry friends',
    icon: 'PawPrint',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
    category: 'lifestyle',
    is_active: false,
    requires_oauth: [],
    created_at: new Date().toISOString(),
  },
];

// Mock installed apps
const mockInstalledApps: UserInstalledApp[] = [
  {
    id: '1',
    user_id: '1',
    app_slug: 'music',
    settings: {},
    oauth_tokens: null,
    is_connected: false,
    installed_at: new Date().toISOString(),
  },
];

interface AppStoreProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppSelect?: (appSlug: string) => void;
}

export function AppStore({ open, onOpenChange, onAppSelect }: AppStoreProps) {
  const [apps, setApps] = useState<AspectApp[]>(mockApps);
  const [installedApps, setInstalledApps] = useState<UserInstalledApp[]>(mockInstalledApps);
  const [installing, setInstalling] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all'>('all');
  
  const categories: { value: AppCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Apps' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'productivity', label: 'Productivity' },
  ];
  
  const filteredApps = apps.filter(app => 
    selectedCategory === 'all' || app.category === selectedCategory
  );
  
  const isInstalled = (slug: string) => 
    installedApps.some(ia => ia.app_slug === slug);
  
  const getInstalledApp = (slug: string) =>
    installedApps.find(ia => ia.app_slug === slug);
  
  const handleInstall = async (app: AspectApp) => {
    if (!app.is_active) return;
    
    setInstalling(app.slug);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setInstalledApps(prev => [...prev, {
      id: Date.now().toString(),
      user_id: '1',
      app_slug: app.slug,
      settings: {},
      oauth_tokens: null,
      is_connected: false,
      installed_at: new Date().toISOString(),
    }]);
    
    setInstalling(null);
  };
  
  const handleUninstall = async (appSlug: string) => {
    setInstalling(appSlug);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setInstalledApps(prev => prev.filter(ia => ia.app_slug !== appSlug));
    
    setInstalling(null);
  };
  
  const handleOpenApp = (appSlug: string) => {
    onOpenChange(false);
    onAppSelect?.(appSlug);
  };
  
  const renderAppCard = (app: AspectApp) => {
    const Icon = iconMap[app.icon] || Sparkles;
    const installed = isInstalled(app.slug);
    const installedApp = getInstalledApp(app.slug);
    const isLoading = installing === app.slug;
    
    return (
      <Card 
        key={app.id} 
        className={`relative overflow-hidden transition-all ${
          !app.is_active ? 'opacity-60' : 'hover:border-primary/50'
        }`}
      >
        {!app.is_active && (
          <Badge 
            className="absolute top-2 right-2 bg-muted text-muted-foreground"
            variant="secondary"
          >
            Coming Soon
          </Badge>
        )}
        
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* App Icon */}
            <div 
              className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${app.gradient}`}
            >
              <Icon className="h-7 w-7 text-white" />
            </div>
            
            {/* App Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{app.name}</h3>
                {app.requires_oauth.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Link2 className="h-3 w-3 mr-1" />
                    OAuth
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {app.description}
              </p>
              
              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                {installed ? (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleOpenApp(app.slug)}
                      className="bg-gradient-to-r from-violet-600 to-pink-600"
                    >
                      Open
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUninstall(app.slug)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Remove'
                      )}
                    </Button>
                    {installedApp?.is_connected && (
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => handleInstall(app)}
                    disabled={!app.is_active || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    {app.is_active ? 'Add' : 'Coming Soon'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            App Store
          </DialogTitle>
          <DialogDescription>
            Extend Youmaxing with additional apps for entertainment, lifestyle, and more.
          </DialogDescription>
        </DialogHeader>
        
        {/* Category Tabs */}
        <Tabs 
          value={selectedCategory} 
          onValueChange={(v) => setSelectedCategory(v as AppCategory | 'all')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid grid-cols-4 w-full">
            {categories.map(cat => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={selectedCategory} className="flex-1 overflow-auto mt-4">
            <div className="space-y-4 pr-2">
              {filteredApps.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No apps in this category yet.
                </div>
              ) : (
                filteredApps.map(renderAppCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <div className="pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            More apps coming soon! Have a suggestion? Let us know.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

