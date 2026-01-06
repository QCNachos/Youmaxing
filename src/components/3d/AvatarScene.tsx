'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Avatar } from './Avatar';
import { NavigationArrows } from './NavigationArrows';
import { useAppStore } from '@/lib/store';
import { getAspect } from '@/lib/aspects';

function Scene() {
  const { currentAspect, nextAspect, prevAspect, profile } = useAppStore();
  const aspect = getAspect(currentAspect);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color={aspect.color} />
      
      {/* Avatar */}
      <Avatar 
        currentAspect={currentAspect} 
        avatarUrl={profile?.avatar_3d_url || undefined}
      />
      
      {/* Navigation Arrows */}
      <NavigationArrows onPrev={prevAspect} onNext={nextAspect} />
      
      {/* Ground shadow */}
      <ContactShadows
        position={[0, -0.65, 0]}
        opacity={0.4}
        scale={3}
        blur={2}
        far={1}
      />
      
      {/* Environment for reflections */}
      <Environment preset="city" />
    </>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#888" wireframe />
    </mesh>
  );
}

export function AvatarScene() {
  const currentAspect = useAppStore((state) => state.currentAspect);
  const aspect = getAspect(currentAspect);
  
  return (
    <div className="relative w-full h-[300px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas
        camera={{ position: [0, 0.5, 2.5], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
      
      {/* Aspect Label Overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center pointer-events-none">
        <div 
          className="px-4 py-2 rounded-full text-white font-semibold text-lg backdrop-blur-sm"
          style={{ backgroundColor: `${aspect.color}CC` }}
        >
          {aspect.name}
        </div>
        <p className="text-white/60 text-sm mt-1">{aspect.description}</p>
      </div>
      
      {/* Navigation hints */}
      <div className="absolute top-4 left-4 text-white/40 text-xs">
        ← Previous
      </div>
      <div className="absolute top-4 right-4 text-white/40 text-xs">
        Next →
      </div>
    </div>
  );
}



