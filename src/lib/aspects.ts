import {
  Dumbbell,
  Utensils,
  Trophy,
  Film,
  DollarSign,
  Briefcase,
  Plane,
  Users,
  Heart,
  PartyPopper,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { AspectType } from '@/types/database';

export interface AspectConfig {
  id: AspectType;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
}

export const aspects: AspectConfig[] = [
  {
    id: 'training',
    name: 'Training',
    description: 'Track workouts and fitness progress',
    icon: Dumbbell,
    color: '#FF6B6B',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    id: 'food',
    name: 'Food',
    description: 'Log meals and nutrition',
    icon: Utensils,
    color: '#4ECDC4',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Activities and team sports',
    icon: Trophy,
    color: '#FFE66D',
    gradient: 'from-yellow-500 to-amber-500',
  },
  {
    id: 'films',
    name: 'Film & Series',
    description: 'Watchlist and recommendations',
    icon: Film,
    color: '#A855F7',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Budget, investments and savings',
    icon: DollarSign,
    color: '#22C55E',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Projects and ideas',
    icon: Briefcase,
    color: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'travel',
    name: 'Travel',
    description: 'Trip planning and bucket list',
    icon: Plane,
    color: '#06B6D4',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'family',
    name: 'Family',
    description: 'Family events and memories',
    icon: Heart,
    color: '#EC4899',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'friends',
    name: 'Friends',
    description: 'Stay connected with friends',
    icon: Users,
    color: '#F97316',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Personal calendar and RSVPs',
    icon: PartyPopper,
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'App preferences and account',
    icon: Settings,
    color: '#6B7280',
    gradient: 'from-gray-500 to-slate-500',
  },
];

export function getAspect(id: AspectType): AspectConfig {
  return aspects.find((a) => a.id === id) || aspects[0];
}

export function getAspectIndex(id: AspectType): number {
  return aspects.findIndex((a) => a.id === id);
}

