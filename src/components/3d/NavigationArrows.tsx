'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ArrowProps {
  position: [number, number, number];
  rotation: [number, number, number];
  onClick: () => void;
  direction: 'left' | 'right';
}

function Arrow({ position, rotation, onClick, direction }: ArrowProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      meshRef.current.scale.setScalar(hovered ? scale * 1.2 : scale);
      
      // Slight float
      const floatOffset = direction === 'left' ? 0 : Math.PI;
      meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 2 + floatOffset) * 0.02;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerEnter={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerLeave={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <coneGeometry args={[0.15, 0.3, 3]} />
      <meshStandardMaterial
        color={hovered ? '#ffffff' : '#888888'}
        emissive={hovered ? '#ffffff' : '#444444'}
        emissiveIntensity={hovered ? 0.3 : 0.1}
        metalness={0.5}
        roughness={0.3}
      />
    </mesh>
  );
}

interface NavigationArrowsProps {
  onPrev: () => void;
  onNext: () => void;
}

export function NavigationArrows({ onPrev, onNext }: NavigationArrowsProps) {
  return (
    <group>
      {/* Left Arrow */}
      <Arrow
        position={[-1.2, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        onClick={onPrev}
        direction="left"
      />
      
      {/* Right Arrow */}
      <Arrow
        position={[1.2, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        onClick={onNext}
        direction="right"
      />
    </group>
  );
}



