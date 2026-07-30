"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type CentralInstallationProps = {
  reducedMotion: boolean;
  scrollProgress: number;
};

export function CentralInstallation({
  reducedMotion,
  scrollProgress,
}: CentralInstallationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const elapsedTimeRef = useRef(0);

  const orbitPoints = useMemo(
    () => [
      { x: 1.65, z: 0 },
      { x: -1.65, z: 0 },
      { x: 0, z: 1.65 },
      { x: 0, z: -1.65 },
    ],
    [],
  );

  useFrame((_, delta) => {
    if (
      !groupRef.current ||
      !ringRef.current ||
      !orbitRef.current ||
      !coreRef.current
    )
      return;

    elapsedTimeRef.current += delta;
    const elapsedTime = elapsedTimeRef.current;
    const drift = reducedMotion ? 0.015 : 0.025;
    groupRef.current.rotation.y += delta * 0.015;
    ringRef.current.rotation.z += delta * (reducedMotion ? 0.02 : 0.03);
    ringRef.current.rotation.x = Math.sin(elapsedTime * 0.32) * 0.04 + 0.16;
    orbitRef.current.rotation.z += delta * 0.035;
    coreRef.current.position.y =
      2.38 + Math.sin(elapsedTime * 0.7) * 0.025 + scrollProgress * 0.06;
    groupRef.current.position.y = 2.4 + Math.sin(elapsedTime * 0.42) * drift;
  });

  return (
    <group ref={groupRef} position={[0, 2.4, 0]}>
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.6, 0.06, 20, 120]} />
          <meshPhysicalMaterial
            color="#d7d0c4"
            metalness={0.62}
            roughness={0.13}
            clearcoat={0.9}
          />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.1, 0.05, 16, 100]} />
          <meshPhysicalMaterial
            color="#a8a09a"
            metalness={0.7}
            roughness={0.2}
            clearcoat={0.8}
          />
        </mesh>
      </group>

      <group ref={orbitRef}>
        {orbitPoints.map((point) => (
          <mesh key={`${point.x}-${point.z}`} position={[point.x, 0, point.z]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial
              color="#beb6aa"
              metalness={0.8}
              roughness={0.15}
            />
          </mesh>
        ))}
      </group>

      <mesh ref={coreRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.42, 1.2, 24]} />
        <meshPhysicalMaterial
          color="#e4e0d8"
          metalness={0.78}
          roughness={0.12}
          clearcoat={0.95}
          emissive="#060606"
          emissiveIntensity={0.15}
        />
      </mesh>

      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[0.55, 0.58, 0.12, 32]} />
        <meshStandardMaterial
          color="#0e0e0e"
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}
