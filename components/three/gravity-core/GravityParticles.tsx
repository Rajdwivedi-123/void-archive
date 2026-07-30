"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import type { GravityMotionProps } from "./types";

type GravityParticlesProps = GravityMotionProps & { tier: DeviceTier };

export function GravityParticles({ activation, reducedMotion, scrollProgress, tier }: GravityParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = tier === "desktop" ? 150 : tier === "tablet" ? 90 : 48;
  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const orbit = new Float32Array(count * 4);
    for (let index = 0; index < count; index += 1) {
      const phase = (index / count) * Math.PI * 2 * 3.17;
      const radius = 0.92 + ((index * 37) % count) / count * 1.72;
      const height = (((index * 19) % count) / count - 0.5) * 2.3;
      orbit.set([phase, radius, height, 0.035 + (index % 11) * 0.003], index * 4);
      positions.set([Math.cos(phase) * radius, height, Math.sin(phase) * radius * 0.7], index * 3);
    }
    return { positions, orbit };
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const motionTime = reducedMotion ? 0 : clock.elapsedTime;
    const strength = activation.current.debris;
    for (let index = 0; index < count; index += 1) {
      const orbitIndex = index * 4;
      const positionIndex = index * 3;
      const phase = data.orbit[orbitIndex] + motionTime * data.orbit[orbitIndex + 3] * strength;
      const breathing = reducedMotion ? 0 : Math.sin(motionTime * 0.28 + index) * 0.035;
      const radius = data.orbit[orbitIndex + 1] + breathing - scrollProgress.current * 0.06;
      positions[positionIndex] = Math.cos(phase) * radius;
      positions[positionIndex + 1] = data.orbit[orbitIndex + 2] + Math.sin(phase * 1.6) * 0.08 * strength;
      positions[positionIndex + 2] = Math.sin(phase) * radius * 0.7;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = 0.02 + strength * 0.48;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#c4c9cb" size={tier === "mobile" ? 0.018 : 0.023} transparent opacity={0} depthWrite={false} sizeAttenuation />
    </points>
  );
}
