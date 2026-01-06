'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useAppStore();

  useEffect(() => {
    // Set initial theme on mount
    document.documentElement.className = theme;
  }, [theme]);

  return <>{children}</>;
}


