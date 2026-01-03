'use client';

import { useAppStore } from '@/lib/store';
import {
  Training,
  Food,
  Sports,
  Films,
  Finance,
  Business,
  Travel,
  Family,
  Friends,
  Events,
  Settings,
} from '@/components/aspects';
import type { AspectType } from '@/types/database';

const aspectComponents: Record<AspectType, React.ComponentType> = {
  training: Training,
  food: Food,
  sports: Sports,
  films: Films,
  finance: Finance,
  business: Business,
  travel: Travel,
  family: Family,
  friends: Friends,
  events: Events,
  settings: Settings,
};

export function AspectRenderer() {
  const currentAspect = useAppStore((state) => state.currentAspect);
  const Component = aspectComponents[currentAspect];
  
  if (!Component) {
    return <div>Aspect not found</div>;
  }
  
  return <Component />;
}

