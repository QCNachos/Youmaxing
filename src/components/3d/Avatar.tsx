'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import type { AspectType } from '@/types/database';
import { getAspect } from '@/lib/aspects';

interface AvatarProps {
  currentAspect: AspectType;
  avatarUrl?: string;
}

// Default stylized avatar when no custom avatar is provided
function DefaultAvatar({ currentAspect }: { currentAspect: AspectType }) {
  const meshRef = useRef<THREE.Group>(null);
  const aspect = getAspect(currentAspect);
  
  // Idle animation - gentle floating
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.3, 0.6, 4, 16]} />
        <meshStandardMaterial color={aspect.color} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#FFE4C4" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.08, 0.7, 0.2]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.08, 0.7, 0.2]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Smile */}
      <mesh position={[0, 0.58, 0.22]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.4, 0.1, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
        <meshStandardMaterial color={aspect.color} />
      </mesh>
      <mesh position={[0.4, 0.1, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
        <meshStandardMaterial color={aspect.color} />
      </mesh>
      
      {/* Platform */}
      <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Ready Player Me avatar loader
function RPMAvatar({ avatarUrl, currentAspect }: { avatarUrl: string; currentAspect: AspectType }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(avatarUrl);
  const { actions } = useAnimations(animations, group);
  
  useEffect(() => {
    // Play idle animation if available
    if (actions['Idle']) {
      actions['Idle'].play();
    }
  }, [actions]);

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    }
  });

  const aspect = getAspect(currentAspect);

  return (
    <group ref={group}>
      <primitive object={scene} scale={1} />
      {/* Platform */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
        <meshStandardMaterial color={aspect.color} metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function Avatar({ currentAspect, avatarUrl }: AvatarProps) {
  if (avatarUrl) {
    return <RPMAvatar avatarUrl={avatarUrl} currentAspect={currentAspect} />;
  }
  
  return <DefaultAvatar currentAspect={currentAspect} />;
}



