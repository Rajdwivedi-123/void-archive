"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type DustFieldProps = {
  reducedMotion: boolean;
};

export function DustField({ reducedMotion }: DustFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const elapsedTimeRef = useRef(0);
  const { viewport } = useThree();

  const particleCount = viewport.width > 8 ? 120 : viewport.width > 4 ? 80 : 50;

  const positions = useMemo(() => {
    const data = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const seed = index * 0.143;
      const radius = 8 + ((seed % 7) / 7) * 12;
      const theta = ((seed % 29) / 29) * Math.PI * 2;
      const height = (((seed * 3) % 11) / 11) * 10 - 4;
      const variance = (((seed * 5) % 13) / 13) * 1.4;
      data[index * 3] = Math.cos(theta) * radius;
      data[index * 3 + 1] = height + variance;
      data[index * 3 + 2] = Math.sin(theta) * radius;
    }
    return data;
  }, [particleCount]);

  const velocities = useMemo(() => {
    const data = new Float32Array(particleCount);
    for (let index = 0; index < particleCount; index += 1) {
      const seed = index * 0.091;
      data[index] = 0.002 + ((seed % 17) / 17) * 0.003;
    }
    return data;
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    elapsedTimeRef.current += delta;
    const array = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const drift = reducedMotion ? 0.3 : 0.7;

    for (let index = 0; index < particleCount; index += 1) {
      const baseIndex = index * 3;
      array[baseIndex + 1] -= delta * velocities[index] * drift;

      if (array[baseIndex + 1] < -5) {
        array[baseIndex + 1] = 7 + Math.random() * 2;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = elapsedTimeRef.current * 0.01;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#8a857d"
        size={0.025}
        transparent
        opacity={0.22}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
