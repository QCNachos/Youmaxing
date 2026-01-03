'use client';

import { useAppStore } from '@/lib/store';
import { aspects } from '@/lib/aspects';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Filter out settings - it's a menu now, not an aspect
const aspectsWithoutSettings = aspects.filter(a => a.id !== 'settings');

export function AvatarWithRing() {
  const { currentAspect, nextAspect, prevAspect, setCurrentAspect } = useAppStore();
  const currentAspectConfig = aspectsWithoutSettings.find((a) => a.id === currentAspect) || aspectsWithoutSettings[0];
  const currentIndex = aspectsWithoutSettings.findIndex((a) => a.id === currentAspect);
  const Icon = currentAspectConfig?.icon;

  // Calculate positions for 7 visible icons in an elongated ellipse
  const getVisibleAspects = () => {
    const total = aspectsWithoutSettings.length;
    const visible = [];
    for (let i = -3; i <= 3; i++) {
      const index = (currentIndex + i + total) % total;
      visible.push({
        aspect: aspectsWithoutSettings[index],
        position: i,
      });
    }
    return visible;
  };

  const visibleAspects = getVisibleAspects();

  // Elongated ellipse positioning - WIDER spread
  const getIconStyle = (position: number) => {
    const radiusX = 380; // Much wider horizontal spread
    const radiusY = 80;  // Slightly more vertical for better curve
    
    // Increase angle spread so icons are further apart
    const angleSpread = 18;
    const baseAngle = -90;
    const angle = baseAngle + (position * angleSpread);
    
    const x = Math.cos((angle * Math.PI) / 180) * radiusX;
    const y = Math.sin((angle * Math.PI) / 180) * radiusY;
    
    const scale = position === 0 ? 1.1 : Math.abs(position) === 1 ? 0.95 : Math.abs(position) === 2 ? 0.8 : 0.65;
    const opacity = position === 0 ? 1 : Math.abs(position) === 1 ? 0.75 : Math.abs(position) === 2 ? 0.5 : 0.3;
    
    return {
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
      zIndex: position === 0 ? 5 : 1,
    };
  };

  return (
    <div className="relative h-[420px] w-full flex items-center justify-center overflow-visible">
      {/* Background Glow */}
      <div 
        className="absolute inset-0 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${currentAspectConfig?.color}15 0%, transparent 50%)`
        }}
      />

      {/* Container for everything */}
      <div className="relative flex flex-col items-center justify-center gap-6">
        
        {/* Active Icon Badge (at top, with space) */}
        <div className="flex-shrink-0" style={{ zIndex: 15 }}>
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center ring-2 ring-white/20 ring-offset-4 ring-offset-transparent shadow-2xl transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${currentAspectConfig?.color}, ${currentAspectConfig?.color}80)`,
              boxShadow: `0 10px 50px ${currentAspectConfig?.color}50`
            }}
          >
            {Icon && <Icon className="h-7 w-7 text-white" />}
          </div>
        </div>

        {/* Avatar + Carousel Container */}
        <div className="relative flex items-center justify-center">
          
          {/* LAYER 1: Ellipse Track (behind everything) - WIDER */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] pointer-events-none" style={{ zIndex: 1 }}>
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[160px] rounded-[100%] border border-white/[0.03]"
            />
          </div>

          {/* LAYER 2: Carousel Icons (behind avatar, in front of track) - WIDER container */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px]" style={{ zIndex: 2 }}>
            <div className="relative w-full h-full flex items-center justify-center">
              {visibleAspects.filter(({ position }) => position !== 0).map(({ aspect, position }) => {
                const AspectIcon = aspect.icon;
                
                return (
                  <button
                    key={aspect.id}
                    onClick={() => setCurrentAspect(aspect.id)}
                    className="absolute transition-all duration-500 ease-out cursor-pointer hover:scale-110"
                    style={getIconStyle(position)}
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:ring-1 hover:ring-white/20"
                      style={{
                        background: `${aspect.color}25`,
                      }}
                    >
                      <AspectIcon className="h-5 w-5 text-white/70" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LAYER 3: Avatar (in front of carousel) */}
          <div className="relative" style={{ zIndex: 10 }}>
            <div className="relative w-40 h-52 flex items-center justify-center">
              {/* Avatar Container with Glow */}
              <div 
                className="relative w-full h-full rounded-[3rem] transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, ${currentAspectConfig?.color}60, ${currentAspectConfig?.color}30)`,
                  boxShadow: `
                    0 25px 70px ${currentAspectConfig?.color}40,
                    inset 0 0 50px ${currentAspectConfig?.color}20
                  `
                }}
              >
                {/* Inner Ring */}
                <div 
                  className="absolute inset-4 rounded-[2.25rem] border opacity-40"
                  style={{ borderColor: currentAspectConfig?.color }}
                />
                
                {/* 3D Character */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-28 h-36 rounded-[1.75rem] relative animate-float"
                    style={{ 
                      background: `linear-gradient(180deg, ${currentAspectConfig?.color}, ${currentAspectConfig?.color}90)`,
                      boxShadow: `0 18px 50px ${currentAspectConfig?.color}50`
                    }}
                  >
                    {/* Face */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-[#FFE4C9] rounded-full shadow-inner">
                      <div className="absolute top-6 left-3 w-2.5 h-3 bg-[#2C1810] rounded-full" />
                      <div className="absolute top-6 right-3 w-2.5 h-3 bg-[#2C1810] rounded-full" />
                      <div className="absolute top-9 left-2 w-2.5 h-2 bg-pink-300/40 rounded-full" />
                      <div className="absolute top-9 right-2 w-2.5 h-2 bg-pink-300/40 rounded-full" />
                    </div>
                    
                    {/* Arms */}
                    <div 
                      className="absolute top-20 -left-4 w-5 h-12 rounded-full animate-wave"
                      style={{ background: currentAspectConfig?.color }}
                    />
                    <div 
                      className="absolute top-20 -right-4 w-5 h-12 rounded-full animate-wave"
                      style={{ background: currentAspectConfig?.color, animationDelay: '0.5s' }}
                    />
                    
                    {/* Aspect Badge on body */}
                    <div 
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))`,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Ground Shadow */}
              <div 
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-28 h-7 rounded-[100%] animate-pulse"
                style={{ 
                  background: `radial-gradient(ellipse, ${currentAspectConfig?.color}30, transparent)` 
                }}
              />
            </div>
          </div>

          {/* LAYER 4: Navigation Arrows (in front of everything, beside avatar) */}
          <button
            onClick={prevAspect}
            className="absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 flex items-center justify-center transition-all hover:scale-110 group"
            style={{ 
              zIndex: 20,
              left: 'calc(50% - 130px)',
            }}
          >
            <ChevronLeft className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
          </button>
          
          <button
            onClick={nextAspect}
            className="absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 flex items-center justify-center transition-all hover:scale-110 group"
            style={{ 
              zIndex: 20,
              left: 'calc(50% + 85px)',
            }}
          >
            <ChevronRight className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Aspect Name - Below avatar */}
        <div className="text-center flex-shrink-0" style={{ zIndex: 15 }}>
          <h2 
            className="text-2xl font-bold tracking-tight transition-colors duration-500"
            style={{ color: currentAspectConfig?.color }}
          >
            {currentAspectConfig?.name}
          </h2>
        </div>
      </div>
    </div>
  );
}
