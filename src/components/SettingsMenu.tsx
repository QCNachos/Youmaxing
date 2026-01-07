'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Settings,
  User,
  CreditCard,
  HelpCircle,
  Bell,
  Shield,
  Palette,
  LogOut,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { 
    id: 'profile', 
    label: 'Profile', 
    description: 'Manage your account details',
    icon: User, 
    color: '#8B5CF6' 
  },
  { 
    id: 'notifications', 
    label: 'Notifications', 
    description: 'Control alerts and reminders',
    icon: Bell, 
    color: '#F59E0B' 
  },
  { 
    id: 'appearance', 
    label: 'Appearance', 
    description: 'Theme and display settings',
    icon: Palette, 
    color: '#EC4899' 
  },
  { 
    id: 'ai-preferences', 
    label: 'AI Preferences', 
    description: 'Customize your AI assistant',
    icon: Sparkles, 
    color: '#06B6D4' 
  },
  { 
    id: 'privacy', 
    label: 'Privacy & Security', 
    description: 'Data and security settings',
    icon: Shield, 
    color: '#10B981' 
  },
  { 
    id: 'billing', 
    label: 'Billing & Plans', 
    description: 'Subscription and payments',
    icon: CreditCard, 
    color: '#6366F1' 
  },
  { 
    id: 'support', 
    label: 'Help & Support', 
    description: 'FAQs and contact us',
    icon: HelpCircle, 
    color: '#F97316' 
  },
];

export function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const router = useRouter();
  const { theme } = useAppStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = 'youmaxing-demo=; path=/; max-age=0';
    router.push('/login');
    router.refresh();
  };

  const handleMenuItemClick = (itemId: string) => {
    // Map menu item IDs to settings page tab IDs
    const tabMapping: Record<string, string> = {
      'profile': 'profile',
      'notifications': 'notifications',
      'appearance': 'appearance',
      'ai-preferences': 'insights',
      'privacy': 'privacy',
      'billing': 'billing',
      'support': 'profile', // Default to profile for support
    };

    const tab = tabMapping[itemId] || 'profile';
    router.push(`/settings?tab=${tab}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 backdrop-blur-sm z-40 animate-fade-in",
          theme === 'light' ? "bg-black/20" : "bg-black/60"
        )}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-[420px] max-w-full backdrop-blur-xl border-l z-50 animate-slide-in-right overflow-hidden flex flex-col",
        theme === 'light'
          ? "bg-white/95 border-violet-200/50 shadow-[-8px_0_32px_-8px_rgba(139,92,246,0.15)]"
          : "bg-black/95 border-white/10"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-6 border-b",
          theme === 'light' ? "border-violet-100" : "border-white/10"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className={cn("text-xl font-bold", theme === 'light' ? "text-slate-800" : "text-white")}>Settings</h2>
              <p className={cn("text-sm", theme === 'light' ? "text-slate-500" : "text-white/40")}>Customize your experience</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn(
              "rounded-xl",
              theme === 'light'
                ? "text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={cn(
                  'w-full p-4 rounded-2xl flex items-center gap-4 transition-all group',
                  theme === 'light'
                    ? cn(
                        'hover:bg-violet-50',
                        activeSection === item.id && 'bg-violet-50'
                      )
                    : cn(
                        'hover:bg-white/5',
                        activeSection === item.id && 'bg-white/5'
                      )
                )}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
                <div className="flex-1 text-left">
                  <p className={cn("font-medium", theme === 'light' ? "text-slate-800" : "text-white")}>{item.label}</p>
                  <p className={cn("text-sm", theme === 'light' ? "text-slate-500" : "text-white/40")}>{item.description}</p>
                </div>
                <ChevronRight className={cn(
                  "h-5 w-5 transition-colors",
                  theme === 'light'
                    ? "text-slate-300 group-hover:text-violet-400"
                    : "text-white/20 group-hover:text-white/40"
                )} />
              </button>
            );
          })}
        </div>

        {/* Sign Out */}
        <div className={cn(
          "p-4 border-t",
          theme === 'light' ? "border-violet-100" : "border-white/10"
        )}>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={cn(
              "w-full h-12 rounded-xl gap-2",
              theme === 'light'
                ? "bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                : "bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
            )}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>

          {/* Version */}
          <p className={cn(
            "text-center text-xs mt-4",
            theme === 'light' ? "text-slate-300" : "text-white/20"
          )}>
            YOUMAXING v1.0.0
          </p>
        </div>
      </div>
    </>
  );
}

