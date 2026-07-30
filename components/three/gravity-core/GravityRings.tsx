"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { GravityMotionProps } from "./types";

const outerSegments = [
  { start: 0.08, arc: 1.12, radius: 2.06, tube: 0.058 },
  { start: 1.48, arc: 0.6, radius: 2.06, tube: 0.058 },
  { start: 2.32, arc: 1.28, radius: 2.06, tube: 0.058 },
  { start: 3.96, arc: 0.4, radius: 2.06, tube: 0.058 },
  { start: 4.66, arc: 1.14, radius: 2.06, tube: 0.058 },
  { start: 0.36, arc: 1.54, radius: 2.22, tube: 0.018 },
  { start: 2.38, arc: 0.82, radius: 2.22, tube: 0.018 },
  { start: 3.7, arc: 1.7, radius: 2.22, tube: 0.018 },
];

const orbitalConfigurations = [
  { rotation: [0.96, 0.16, -0.38] as const, radius: 1.52, tube: 0.031, speed: 0.058, start: 0.3, arc: 4.62 },
  { rotation: [0.24, 1.21, 0.46] as const, radius: 1.2, tube: 0.021, speed: -0.043, start: 1.12, arc: 3.72 },
  { rotation: [1.38, -0.34, 0.83] as const, radius: 1.77, tube: 0.014, speed: 0.029, start: 2.05, arc: 2.78 },
];

export function GravityRings({ activation, reducedMotion, scrollProgress }: GravityMotionProps) {
  const outerRef = useRef<THREE.Group>(null);
  const orbitalRefs = useRef<Array<THREE.Group | null>>([]);
  const segmentMaterialRefs = useRef<Array<THREE.MeshPhysicalMaterial | null>>([]);
  const timeRef = useRef(0);
  const clampPositions = useMemo(() => [1.3, 2.16, 3.75, 4.48, 5.94].map((angle, index) => ({
    angle,
    radius: index === 2 ? 2.2 : 2.06,
  })), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const motion = reducedMotion ? 0 : 1;
    const scroll = scrollProgress.current;
    const compression = activation.current.compression;

    if (outerRef.current) {
      outerRef.current.rotation.z = -0.12 + timeRef.current * 0.018 * activation.current.outer * motion;
      outerRef.current.rotation.x = 0.18 + Math.sin(timeRef.current * 0.14) * 0.009 * motion;
      outerRef.current.rotation.y = -0.12 + compression * 0.08;
      const scale = 0.94 + activation.current.outer * 0.06 + scroll * 0.022 - compression * 0.018;
      outerRef.current.scale.setScalar(scale);
    }

    const sweepPosition = activation.current.sweep * (outerSegments.length - 1);
    segmentMaterialRefs.current.forEach((material, index) => {
      if (!material) return;
      const proximity = THREE.MathUtils.clamp(1 - Math.abs(index - sweepPosition) * 0.88, 0, 1);
      material.emissiveIntensity = proximity * Math.sin(activation.current.sweep * Math.PI) * 0.72;
    });

    orbitalRefs.current.forEach((ring, index) => {
      if (!ring) return;
      const config = orbitalConfigurations[index];
      const staged = THREE.MathUtils.clamp(activation.current.orbitals * 1.55 - index * 0.28, 0, 1);
      const alignedX = 0.16 + index * 0.035;
      const alignedY = -0.08 + index * 0.06;
      ring.rotation.x = THREE.MathUtils.lerp(config.rotation[0], alignedX, compression * 0.82);
      ring.rotation.y = THREE.MathUtils.lerp(config.rotation[1], alignedY, compression * 0.82);
      ring.rotation.z = config.rotation[2] + timeRef.current * config.speed * staged * motion;
      ring.scale.setScalar(0.84 + staged * 0.16 + scroll * (0.014 + index * 0.005) - compression * 0.035);
    });
  });

  return (
    <group>
      <group ref={outerRef} rotation={[0.18, -0.12, -0.12]}>
        {outerSegments.map((segment, index) => (
          <mesh key={`${segment.start}-${segment.radius}`} rotation={[0, 0, segment.start]}>
            <torusGeometry args={[segment.radius, segment.tube, segment.tube > 0.05 ? 12 : 8, 72, segment.arc]} />
            <meshPhysicalMaterial
              ref={(node) => { segmentMaterialRefs.current[index] = node; }}
              color={segment.tube > 0.04 ? (index === 2 ? "#3b4143" : "#131719") : "#4c5457"}
              emissive="#8d999c"
              emissiveIntensity={0}
              metalness={0.98}
              roughness={segment.tube > 0.05 ? 0.24 : 0.17}
              clearcoat={0.34}
              clearcoatRoughness={0.3}
            />
          </mesh>
        ))}
        {clampPositions.map(({ angle, radius }, index) => (
          <group key={angle} rotation={[0, 0, angle]}>
            <mesh position={[radius, 0, 0]}>
              <boxGeometry args={[0.16, index === 2 ? 0.25 : 0.19, 0.34]} />
              <meshPhysicalMaterial color={index === 2 ? "#858b8e" : "#111416"} metalness={0.94} roughness={0.25} clearcoat={0.3} />
            </mesh>
            <mesh position={[radius, 0, 0.235]}>
              <boxGeometry args={[0.055, 0.085, 0.045]} />
              <meshBasicMaterial color="#c5ccce" toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>

      {orbitalConfigurations.map((config, index) => (
        <group key={config.radius} ref={(node) => { orbitalRefs.current[index] = node; }} rotation={config.rotation}>
          <mesh rotation={[0, 0, config.start]}>
            <torusGeometry args={[config.radius, config.tube, 10, 92, config.arc]} />
            <meshPhysicalMaterial color={index === 1 ? "#8a9194" : "#41474a"} metalness={0.98} roughness={0.17 + index * 0.07} clearcoat={0.48} />
          </mesh>
          <mesh rotation={[0, 0, config.start + config.arc]} position={[Math.cos(config.start + config.arc) * config.radius, Math.sin(config.start + config.arc) * config.radius, 0]}>
            <octahedronGeometry args={[0.09 + index * 0.018, 0]} />
            <meshStandardMaterial color="#aab1b4" metalness={1} roughness={0.18} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
