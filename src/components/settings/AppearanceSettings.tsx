'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Palette, Moon, Sun, Monitor } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function AppearanceSettings() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Appearance</h2>
        <p className="text-muted-foreground">Customize how YOUMAXING looks and feels</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme
          </CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all hover:scale-105",
                theme === 'light'
                  ? "border-violet-500 bg-violet-50"
                  : "border-border hover:border-violet-300"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center">
                  <Sun className="h-6 w-6 text-violet-600" />
                </div>
                <span className="font-medium">Light</span>
                {theme === 'light' && (
                  <span className="text-xs text-violet-600">Active</span>
                )}
              </div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={cn(
                "p-4 rounded-xl border-2 transition-all hover:scale-105",
                theme === 'dark'
                  ? "border-violet-500 bg-violet-950/50"
                  : "border-border hover:border-violet-300"
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <Moon className="h-6 w-6 text-violet-400" />
                </div>
                <span className="font-medium">Dark</span>
                {theme === 'dark' && (
                  <span className="text-xs text-violet-400">Active</span>
                )}
              </div>
            </button>

            <button
              disabled
              className="p-4 rounded-xl border-2 border-border opacity-50 cursor-not-allowed"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                  <Monitor className="h-6 w-6 text-slate-600" />
                </div>
                <span className="font-medium">System</span>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
            </button>
          </div>

          {/* Quick Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
                </p>
              </div>
            </div>
            <Switch 
              checked={theme === 'dark'} 
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3D Avatar</CardTitle>
          <CardDescription>Customize your avatar appearance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <span className="text-4xl">🧑</span>
            </div>
            <div className="space-y-2">
              <Button variant="outline" disabled>
                Customize Avatar
              </Button>
              <p className="text-sm text-muted-foreground">
                Avatar customization coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
          <CardDescription>Adjust how content is displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact Mode</p>
              <p className="text-sm text-muted-foreground">
                Show more content in less space
              </p>
            </div>
            <Switch disabled />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Animations</p>
              <p className="text-sm text-muted-foreground">
                Enable smooth transitions and effects
              </p>
            </div>
            <Switch defaultChecked disabled />
          </div>
          <p className="text-xs text-muted-foreground">
            Additional display options coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


