"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type SceneProps = {
  isSceneReady: boolean;
  reducedMotion: boolean;
};

export function Scene({ isSceneReady, reducedMotion }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedTimeRef = useRef(0);

  const geometry = useMemo(
    () => new THREE.TorusKnotGeometry(1.25, 0.26, 220, 20),
    [],
  );
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#d9d9d8",
        metalness: 0.45,
        roughness: 0.18,
        clearcoat: 0.8,
        transparent: true,
        opacity: 0.92,
        emissive: "#080808",
        emissiveIntensity: 0.18,
      }),
    [],
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    elapsedTimeRef.current += delta;
    const t = elapsedTimeRef.current;
    groupRef.current.rotation.x = reducedMotion
      ? 0.25 + Math.sin(t * 0.35) * 0.03
      : 0.25 + Math.sin(t * 0.35) * 0.05;
    groupRef.current.rotation.y = reducedMotion
      ? 0.7 + t * 0.16
      : 0.7 + t * 0.12;
    groupRef.current.rotation.z = reducedMotion
      ? 0.15
      : 0.15 + Math.sin(t * 0.2) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <mesh
        position={[0, 0.8, 0]}
        geometry={geometry}
        material={material}
        scale={isSceneReady ? 1 : 0.98}
      />
      <mesh position={[0, -1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.06, 64]} />
        <meshStandardMaterial
          color="#0f0f0f"
          metalness={0.65}
          roughness={0.26}
        />
      </mesh>
    </group>
  );
}
