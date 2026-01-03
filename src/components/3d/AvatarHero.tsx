'use client';

import { useAppStore } from '@/lib/store';
import { aspects } from '@/lib/aspects';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AvatarHero() {
  const { currentAspect, nextAspect, prevAspect } = useAppStore();
  const currentAspectConfig = aspects.find((a) => a.id === currentAspect);
  const Icon = currentAspectConfig?.icon;

  // Get adjacent aspects for preview
  const currentIndex = aspects.findIndex((a) => a.id === currentAspect);
  const prevAspectConfig = aspects[(currentIndex - 1 + aspects.length) % aspects.length];
  const nextAspectConfig = aspects[(currentIndex + 1) % aspects.length];

  return (
    <div className="relative h-[45vh] min-h-[350px] flex items-center justify-center overflow-hidden">
      {/* Dynamic Background Glow */}
      <div 
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 80%, ${currentAspectConfig?.color}30 0%, transparent 60%)`
        }}
      />
      
      {/* Previous Aspect Preview (Left) */}
      <button
        onClick={prevAspect}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-10 group"
      >
        <div 
          className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-40 group-hover:opacity-70 transition-all group-hover:scale-110 group-hover:border-white/20"
        >
          {prevAspectConfig && (
            <prevAspectConfig.icon 
              className="h-8 w-8" 
              style={{ color: prevAspectConfig.color }}
            />
          )}
        </div>
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft className="h-6 w-6 text-white/60" />
        </div>
      </button>

      {/* Main Avatar Area */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Avatar Container */}
        <div 
          className="relative w-56 h-56 rounded-[3rem] flex items-center justify-center transition-all duration-500 group cursor-pointer hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${currentAspectConfig?.color}40, ${currentAspectConfig?.color}10)`,
            boxShadow: `
              0 0 100px ${currentAspectConfig?.color}30,
              inset 0 0 60px ${currentAspectConfig?.color}20
            `
          }}
        >
          {/* Inner Glow Ring */}
          <div 
            className="absolute inset-4 rounded-[2rem] border-2 opacity-30"
            style={{ borderColor: currentAspectConfig?.color }}
          />
          
          {/* 3D Character Placeholder - This is where the real 3D avatar goes */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Character Body */}
            <div 
              className="w-32 h-40 rounded-[2rem] relative animate-float"
              style={{ 
                background: `linear-gradient(180deg, ${currentAspectConfig?.color}90, ${currentAspectConfig?.color}70)`,
                boxShadow: `0 20px 60px ${currentAspectConfig?.color}40`
              }}
            >
              {/* Face */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#FFE4C9] rounded-full">
                {/* Eyes */}
                <div className="absolute top-6 left-3 w-2.5 h-3 bg-[#2C1810] rounded-full" />
                <div className="absolute top-6 right-3 w-2.5 h-3 bg-[#2C1810] rounded-full" />
                {/* Cheeks */}
                <div className="absolute top-9 left-1 w-3 h-2 bg-pink-300/50 rounded-full" />
                <div className="absolute top-9 right-1 w-3 h-2 bg-pink-300/50 rounded-full" />
              </div>
              
              {/* Arms */}
              <div 
                className="absolute top-20 -left-5 w-5 h-12 rounded-full animate-wave"
                style={{ background: currentAspectConfig?.color }}
              />
              <div 
                className="absolute top-20 -right-5 w-5 h-12 rounded-full animate-wave"
                style={{ background: currentAspectConfig?.color, animationDelay: '0.5s' }}
              />
              
              {/* Badge/Icon */}
              <div 
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ 
                  background: currentAspectConfig?.color,
                  boxShadow: `0 4px 20px ${currentAspectConfig?.color}60`
                }}
              >
                {Icon && <Icon className="h-4 w-4" />}
              </div>
            </div>
            
            {/* Base/Shadow */}
            <div 
              className="w-20 h-5 rounded-[100%] mt-4 animate-pulse"
              style={{ 
                background: `radial-gradient(ellipse, ${currentAspectConfig?.color}40, transparent)` 
              }}
            />
          </div>
        </div>

        {/* Aspect Name */}
        <div className="mt-8 text-center">
          <h1 
            className="text-3xl font-bold tracking-tight transition-colors duration-500"
            style={{ color: currentAspectConfig?.color }}
          >
            {currentAspectConfig?.name}
          </h1>
          <p className="text-white/50 text-sm mt-2">
            {getAspectDescription(currentAspect)}
          </p>
        </div>
      </div>

      {/* Next Aspect Preview (Right) */}
      <button
        onClick={nextAspect}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-10 group"
      >
        <div 
          className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-40 group-hover:opacity-70 transition-all group-hover:scale-110 group-hover:border-white/20"
        >
          {nextAspectConfig && (
            <nextAspectConfig.icon 
              className="h-8 w-8" 
              style={{ color: nextAspectConfig.color }}
            />
          )}
        </div>
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="h-6 w-6 text-white/60" />
        </div>
      </button>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-float-particle"
            style={{
              left: `${15 + (i * 7)}%`,
              top: `${20 + (i % 3) * 25}%`,
              backgroundColor: currentAspectConfig?.color,
              opacity: 0.3 + (i % 3) * 0.2,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

function getAspectDescription(aspectId: string): string {
  const descriptions: Record<string, string> = {
    training: 'Track workouts and crush your fitness goals',
    food: 'Nutrition logging and meal planning',
    sports: 'Follow your favorite teams and activities',
    films: 'Movies, series, and entertainment tracking',
    finance: 'Budgets, investments, and savings',
    business: 'Projects, goals, and career growth',
    travel: 'Trip planning and bucket list adventures',
    family: 'Stay connected with loved ones',
    friends: 'Social connections and hangouts',
    events: 'Upcoming events and important dates',
    settings: 'Customize your YOUMAXING experience',
  };
  return descriptions[aspectId] || '';
}

