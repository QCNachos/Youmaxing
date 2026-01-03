'use client';

import { useAppStore } from '@/lib/store';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative w-14 h-8 rounded-full transition-all duration-500 overflow-hidden group',
        'flex items-center',
        theme === 'light'
          ? 'bg-gradient-to-r from-amber-100 to-orange-100 shadow-lg shadow-amber-200/50 border border-amber-200/60'
          : 'bg-gradient-to-r from-indigo-900 to-violet-900 shadow-lg shadow-violet-500/20 border border-violet-500/30'
      )}
    >
      {/* Toggle circle */}
      <div
        className={cn(
          'absolute w-6 h-6 rounded-full transition-all duration-500 flex items-center justify-center',
          theme === 'light'
            ? 'left-1 bg-gradient-to-br from-amber-400 to-orange-400 shadow-md shadow-orange-300/50'
            : 'left-7 bg-gradient-to-br from-indigo-400 to-violet-400 shadow-md shadow-violet-400/50'
        )}
      >
        {theme === 'light' ? (
          <Sun className="h-3.5 w-3.5 text-white" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-white" />
        )}
      </div>

      {/* Stars for dark mode */}
      {theme === 'dark' && (
        <>
          <div className="absolute left-2 top-1.5 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
          <div className="absolute left-3.5 top-3 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute left-1.5 top-4.5 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </>
      )}

      {/* Clouds for light mode */}
      {theme === 'light' && (
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
          <div className="flex gap-0.5">
            <div className="w-2 h-1.5 bg-white/70 rounded-full" />
            <div className="w-1.5 h-1 bg-white/50 rounded-full mt-0.5" />
          </div>
        </div>
      )}
    </button>
  );
}
