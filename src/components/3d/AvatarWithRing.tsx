'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/lib/store';
import { aspects } from '@/lib/aspects';
import { ChevronLeft, ChevronRight, User, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// Filter out settings - it's a menu now, not an aspect
const aspectsWithoutSettings = aspects.filter(a => a.id !== 'settings');

// 3D GLB Character Component
function GLBCharacter({ url, aspectColor }: { url: string; aspectColor: string }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    // Setup shadows
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    // Play the first available animation or 'Idle' if exists
    const idleAction = actions['Idle'] || actions[names[0]];
    if (idleAction) {
      idleAction.reset().fadeIn(0.5).play();
    }
    return () => {
      if (idleAction) {
        idleAction.fadeOut(0.5);
      }
    };
  }, [actions, names]);

  // Base rotation to face forward (character faces camera)
  // Model default faces diagonally, adjust to face directly at camera
  // -45 degrees minus ~8 more degrees to center better
  const baseRotation = -Math.PI / 4 - Math.PI / 22; // About -53 degrees to face camera straight on
  
  // Gentle floating animation with subtle sway
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.012;
      // Subtle sway around base facing direction
      group.current.rotation.y = baseRotation + Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
    }
  });

  return (
    <>
      {/* Character group - rotates to face camera */}
      <group ref={group} scale={1.0} position={[0, -0.15, 0]} rotation={[0, baseRotation, 0]}>
        <primitive object={scene} />
      </group>
    </>
  );
}

// Fixed platform that counter-rotates to stay level when using OrbitControls
function FixedPlatform({ color }: { color: string }) {
  const platformRef = useRef<THREE.Mesh>(null);
  
  // Counter-rotate to stay fixed as camera orbits
  useFrame(({ camera }) => {
    if (platformRef.current) {
      // Keep platform facing up regardless of camera rotation
      // Extract camera's azimuth angle and counter-rotate
      const azimuth = Math.atan2(camera.position.x, camera.position.z);
      platformRef.current.rotation.y = azimuth;
    }
  });

  return (
    <mesh ref={platformRef} position={[0, -0.67, 0]}>
      <cylinderGeometry args={[0.35, 0.4, 0.04, 32]} />
      <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
    </mesh>
  );
}

// Preload the model
useGLTF.preload('/char1.glb');

// Loading spinner for 3D scene
function LoadingSpinner({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div 
        className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: `${color}40`, borderTopColor: color }}
      />
    </div>
  );
}

// 3D Scene wrapper
function Character3DScene({ aspectColor }: { aspectColor: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingSpinner color={aspectColor} />}
      <Canvas
        camera={{ position: [0, 0.3, 2.0], fov: 40 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        onCreated={() => setIsLoading(false)}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight 
            position={[3, 5, 3]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
          <pointLight position={[-2, 2, -1]} intensity={0.4} color={aspectColor} />
          <pointLight position={[2, 2, 1]} intensity={0.3} color="#fff" />

          {/* Character */}
          <GLBCharacter url="/char1.glb" aspectColor={aspectColor} />

          {/* Platform - stays fixed when rotating */}
          <FixedPlatform color={aspectColor} />

          {/* Ground shadow */}
          <ContactShadows
            position={[0, -0.67, 0]}
            opacity={0.5}
            scale={1.5}
            blur={2}
            far={1}
          />

          {/* Environment for reflections */}
          <Environment preset="city" />
        </Suspense>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 8}
          maxAzimuthAngle={Math.PI / 8}
        />
      </Canvas>
    </>
  );
}

interface AvatarWithRingProps {
  compact?: boolean;
}

export function AvatarWithRing({ compact = false }: AvatarWithRingProps) {
  const router = useRouter();
  const { currentAspect, nextAspect, prevAspect, setCurrentAspect, theme } = useAppStore();
  const [use3DAvatar, setUse3DAvatar] = useState(false); // Toggle for 3D character
  const currentAspectConfig = aspectsWithoutSettings.find((a) => a.id === currentAspect) || aspectsWithoutSettings[0];
  const currentIndex = aspectsWithoutSettings.findIndex((a) => a.id === currentAspect);
  const Icon = currentAspectConfig?.icon;

  // Navigate to the current aspect's mini-app page
  const goToMiniApp = () => {
    router.push(`/${currentAspect}`);
  };

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

  // Elongated ellipse positioning - WIDER spread (scaled for compact)
  const getIconStyle = (position: number) => {
    const baseRadiusX = compact ? 280 : 380; // Smaller in compact mode
    const baseRadiusY = compact ? 55 : 80;
    
    // Increase angle spread so icons are further apart
    const angleSpread = compact ? 22 : 18;
    const baseAngle = -90;
    const angle = baseAngle + (position * angleSpread);
    
    const x = Math.cos((angle * Math.PI) / 180) * baseRadiusX;
    const y = Math.sin((angle * Math.PI) / 180) * baseRadiusY;
    
    const baseScale = position === 0 ? 1.1 : Math.abs(position) === 1 ? 0.95 : Math.abs(position) === 2 ? 0.8 : 0.65;
    const scale = baseScale * (compact ? 0.8 : 1);
    const opacity = position === 0 ? 1 : Math.abs(position) === 1 ? 0.75 : Math.abs(position) === 2 ? 0.5 : 0.3;
    
    return {
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
      zIndex: position === 0 ? 5 : 1,
    };
  };

  // Compact mode sizing
  const containerHeight = compact ? 'h-[280px]' : 'h-[420px]';
  const avatarScale = compact ? 0.7 : 1;
  const iconScale = compact ? 0.8 : 1;

  return (
    <div className={cn("relative w-full flex items-center justify-center overflow-visible transition-all duration-500", containerHeight)}>
      {/* Background Glow */}
      <div 
        className="absolute inset-0 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${currentAspectConfig?.color}15 0%, transparent 50%)`
        }}
      />

      {/* Container for everything */}
      <div className="relative flex flex-col items-center justify-center gap-6">
        
        {/* Active Icon Badge (at top, with space) - CLICKABLE to go to mini-app */}
        <button 
          onClick={goToMiniApp}
          className="flex-shrink-0 group cursor-pointer" 
          style={{ zIndex: 15 }}
          title={`Open ${currentAspectConfig?.name}`}
        >
          <div 
            className={cn(
              "rounded-2xl flex items-center justify-center ring-2 ring-white/20 ring-offset-4 ring-offset-transparent shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:ring-white/40 relative",
              compact ? "w-10 h-10" : "w-14 h-14"
            )}
            style={{
              background: `linear-gradient(135deg, ${currentAspectConfig?.color}, ${currentAspectConfig?.color}80)`,
              boxShadow: `0 10px 50px ${currentAspectConfig?.color}50`
            }}
          >
            {Icon && <Icon className={cn("text-white transition-transform group-hover:scale-110", compact ? "h-5 w-5" : "h-7 w-7")} />}
            <ExternalLink className={cn(
              "absolute transition-all opacity-0 group-hover:opacity-100 text-white/80",
              compact ? "-top-1 -right-1 h-3 w-3" : "top-0 right-0 h-3.5 w-3.5"
            )} />
          </div>
        </button>

        {/* Avatar + Carousel Container */}
        <div className="relative flex items-center justify-center">
          
          {/* LAYER 1: Ellipse Track (behind everything) - WIDER */}
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500",
            compact ? "w-[600px] h-[140px]" : "w-[800px] h-[200px]"
          )} style={{ zIndex: 1 }}>
            <div 
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[100%] border border-white/[0.03] transition-all duration-500",
                compact ? "w-[560px] h-[110px]" : "w-[760px] h-[160px]"
              )}
            />
          </div>

          {/* LAYER 2: Carousel Icons (behind avatar, in front of track) - WIDER container */}
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500",
            compact ? "w-[600px] h-[140px]" : "w-[800px] h-[200px]"
          )} style={{ zIndex: 2 }}>
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
          <div className="relative transition-all duration-500" style={{ zIndex: 10, transform: compact ? 'scale(0.7)' : 'scale(1)' }}>
            <div className="relative w-40 h-52 flex items-center justify-center">
              {/* Avatar Container with Glow */}
              <div 
                className="relative w-full h-full rounded-[3rem] transition-all duration-500 overflow-hidden"
                style={{
                  background: use3DAvatar 
                    ? `linear-gradient(135deg, ${currentAspectConfig?.color}40, ${currentAspectConfig?.color}15)`
                    : `linear-gradient(135deg, ${currentAspectConfig?.color}60, ${currentAspectConfig?.color}30)`,
                  boxShadow: `
                    0 25px 70px ${currentAspectConfig?.color}40,
                    inset 0 0 50px ${currentAspectConfig?.color}20
                  `
                }}
              >
                {/* Inner Ring */}
                <div 
                  className="absolute inset-4 rounded-[2.25rem] border opacity-40 pointer-events-none"
                  style={{ borderColor: currentAspectConfig?.color, zIndex: 20 }}
                />
                
                {/* Character - Either 3D GLB or CSS */}
                {use3DAvatar ? (
                  /* 3D GLB Character */
                  <div className="absolute inset-0">
                    <Character3DScene aspectColor={currentAspectConfig?.color || '#8B5CF6'} />
                  </div>
                ) : (
                  /* Original CSS Character */
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
                )}
              </div>
              
              {/* Ground Shadow */}
              <div 
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-28 h-7 rounded-[100%] animate-pulse"
                style={{ 
                  background: `radial-gradient(ellipse, ${currentAspectConfig?.color}30, transparent)` 
                }}
              />
              
              {/* Avatar Toggle Button */}
              <button
                onClick={() => setUse3DAvatar(!use3DAvatar)}
                className={cn(
                  "absolute -bottom-2 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg",
                  theme === 'light'
                    ? "bg-white border border-violet-200 text-violet-600 hover:bg-violet-50"
                    : "bg-slate-800 border border-white/20 text-white/80 hover:bg-slate-700"
                )}
                style={{ zIndex: 25 }}
                title={use3DAvatar ? "Switch to default avatar" : "Switch to 3D avatar"}
              >
                {use3DAvatar ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* LAYER 4: Navigation Arrows (in front of everything, beside avatar) */}
          <button
            onClick={prevAspect}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border flex items-center justify-center transition-all hover:scale-110 group",
              theme === 'light'
                ? "bg-white/80 hover:bg-white border-violet-200 hover:border-violet-300 shadow-md"
                : "bg-white/5 hover:bg-white/15 border-white/10 hover:border-white/25"
            )}
            style={{
              zIndex: 20,
              left: 'calc(50% - 130px)',
            }}
          >
            <ChevronLeft className={cn(
              "h-5 w-5 transition-colors",
              theme === 'light'
                ? "text-slate-400 group-hover:text-violet-600"
                : "text-white/50 group-hover:text-white"
            )} />
          </button>

          <button
            onClick={nextAspect}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border flex items-center justify-center transition-all hover:scale-110 group",
              theme === 'light'
                ? "bg-white/80 hover:bg-white border-violet-200 hover:border-violet-300 shadow-md"
                : "bg-white/5 hover:bg-white/15 border-white/10 hover:border-white/25"
            )}
            style={{
              zIndex: 20,
              left: 'calc(50% + 85px)',
            }}
          >
            <ChevronRight className={cn(
              "h-5 w-5 transition-colors",
              theme === 'light'
                ? "text-slate-400 group-hover:text-violet-600"
                : "text-white/50 group-hover:text-white"
            )} />
          </button>
        </div>

        {/* Aspect Name - Below avatar - CLICKABLE to go to mini-app */}
        <button 
          onClick={goToMiniApp}
          className="text-center flex-shrink-0 group cursor-pointer flex items-center gap-2" 
          style={{ zIndex: 15 }}
          title={`Open ${currentAspectConfig?.name}`}
        >
          <h2 
            className={cn(
              "font-bold tracking-tight transition-all duration-500 group-hover:opacity-80",
              compact ? "text-lg" : "text-2xl"
            )}
            style={{ color: currentAspectConfig?.color }}
          >
            {currentAspectConfig?.name}
          </h2>
          <ExternalLink 
            className={cn(
              "transition-all opacity-0 group-hover:opacity-100",
              compact ? "h-4 w-4" : "h-5 w-5"
            )} 
            style={{ color: currentAspectConfig?.color }}
          />
        </button>
      </div>
    </div>
  );
}
