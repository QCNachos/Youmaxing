import { create } from 'zustand';
import type { AspectType, UserProfile, UserPreferences } from '@/types/database';
import type { PersonaType } from '@/lib/ai/personas';

export type ViewMode = 'chat' | 'dashboard';

interface AppState {
  // Current aspect
  currentAspect: AspectType;
  setCurrentAspect: (aspect: AspectType) => void;
  nextAspect: () => void;
  prevAspect: () => void;

  // User
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  setProfile: (profile: UserProfile | null) => void;
  setPreferences: (preferences: UserPreferences | null) => void;

  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isChatOpen: boolean;
  toggleChat: () => void;

  // View Mode (chat-first is default)
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;

  // AI Persona
  activePersona: PersonaType;
  setActivePersona: (persona: PersonaType) => void;

  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

const aspectOrder: AspectType[] = [
  'training',
  'food',
  'sports',
  'films',
  'finance',
  'business',
  'travel',
  'family',
  'friends',
  'events',
  'settings',
];

export const useAppStore = create<AppState>((set, get) => ({
  // Current aspect
  currentAspect: 'training',
  setCurrentAspect: (aspect) => set({ currentAspect: aspect }),
  nextAspect: () => {
    const current = get().currentAspect;
    const currentIndex = aspectOrder.indexOf(current);
    const nextIndex = (currentIndex + 1) % aspectOrder.length;
    set({ currentAspect: aspectOrder[nextIndex] });
  },
  prevAspect: () => {
    const current = get().currentAspect;
    const currentIndex = aspectOrder.indexOf(current);
    const prevIndex = (currentIndex - 1 + aspectOrder.length) % aspectOrder.length;
    set({ currentAspect: aspectOrder[prevIndex] });
  },

  // User
  profile: null,
  preferences: null,
  setProfile: (profile) => set({ profile }),
  setPreferences: (preferences) => set({ preferences }),

  // UI State
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  // View Mode (chat-first is default)
  viewMode: 'chat',
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleViewMode: () => set((state) => ({ 
    viewMode: state.viewMode === 'chat' ? 'dashboard' : 'chat' 
  })),

  // AI Persona
  activePersona: 'geek-buddy',
  setActivePersona: (persona) => set({ activePersona: persona }),

  // Theme
  theme: 'dark',
  setTheme: (theme) => {
    set({ theme });
    // Update document class
    if (typeof window !== 'undefined') {
      document.documentElement.className = theme;
    }
  },
  toggleTheme: () => {
    const current = get().theme;
    const newTheme = current === 'dark' ? 'light' : 'dark';
    set({ theme: newTheme });
    // Update document class
    if (typeof window !== 'undefined') {
      document.documentElement.className = newTheme;
    }
  },
}));

