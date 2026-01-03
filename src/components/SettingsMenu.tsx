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
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = 'youmaxing-demo=; path=/; max-age=0';
    router.push('/login');
    router.refresh();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed right-0 top-0 h-full w-[420px] max-w-full bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 animate-slide-in-right overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <p className="text-sm text-white/40">Customize your experience</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl text-white/60 hover:text-white hover:bg-white/10"
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
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'w-full p-4 rounded-2xl flex items-center gap-4 transition-all group hover:bg-white/5',
                  activeSection === item.id && 'bg-white/5'
                )}
              >
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-white/40 text-sm">{item.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-white/40 transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Sign Out */}
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full h-12 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 gap-2"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
          
          {/* Version */}
          <p className="text-center text-white/20 text-xs mt-4">
            YOUMAXING v1.0.0
          </p>
        </div>
      </div>
    </>
  );
}

