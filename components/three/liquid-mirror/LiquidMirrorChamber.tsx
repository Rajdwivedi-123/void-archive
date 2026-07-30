"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { liquidMirrorArtifact } from "@/artifacts/registry";
import { sampleArtifactLifecycle } from "@/artifacts/lifecycle";
import type { MutableRefObject } from "react";
import type { DeviceTier } from "@/hooks/useDeviceProfile";

type LiquidMirrorChamberProps = {
  tier: DeviceTier;
  scrollProgress: MutableRefObject<number>;
};

export function LiquidMirrorChamber({ tier, scrollProgress }: LiquidMirrorChamberProps) {
  const seamRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const lightRef = useRef<THREE.PointLight>(null);
  const seams = useMemo(() => tier === "mobile" ? [-2.65, 2.55] : [-2.85, -2.05, 2.1, 2.78], [tier]);

  useFrame(() => {
    const lifecycle = sampleArtifactLifecycle(liquidMirrorArtifact, scrollProgress.current);
    seamRefs.current.forEach((material, index) => {
      if (!material) return;
      const stagger = Math.max(0, lifecycle.entry * 1.35 - index * 0.12);
      material.opacity = (0.05 + Math.min(stagger, 1) * (index % 2 === 0 ? 0.32 : 0.18)) * lifecycle.visible;
    });
    if (lightRef.current) lightRef.current.intensity = lifecycle.visible * (0.18 + lifecycle.entry * 0.72);
  });

  return (
    <group position={[4.72, 0, -116]}>
      <mesh position={[0, -0.05, 0.4]}>
        <boxGeometry args={[7.4, 0.22, 17]} />
        <meshPhysicalMaterial color="#020405" metalness={0.88} roughness={0.21} clearcoat={0.24} clearcoatRoughness={0.58} />
      </mesh>
      <mesh position={[-3.7, 3.7, -1.2]}>
        <boxGeometry args={[0.36, 7.6, 14]} />
        <meshStandardMaterial color="#050708" metalness={0.88} roughness={0.28} />
      </mesh>
      <mesh position={[3.7, 3.7, -1.2]}>
        <boxGeometry args={[0.36, 7.6, 14]} />
        <meshStandardMaterial color="#050708" metalness={0.88} roughness={0.28} />
      </mesh>
      <mesh position={[0, 7.45, -1.2]}>
        <boxGeometry args={[7.8, 0.34, 14]} />
        <meshStandardMaterial color="#030506" metalness={0.82} roughness={0.35} />
      </mesh>
      <mesh position={[0, 3.55, -4.4]}>
        <boxGeometry args={[7.05, 7.15, 0.28]} />
        <meshPhysicalMaterial color="#030506" metalness={0.88} roughness={0.24} clearcoat={0.16} />
      </mesh>

      {seams.map((x, index) => (
        <mesh key={x} position={[x, 3.55, -4.2]}>
          <boxGeometry args={[index % 2 === 0 ? 0.024 : 0.012, index % 2 === 0 ? 5.8 : 3.9, 0.03]} />
          <meshBasicMaterial ref={(material) => { seamRefs.current[index] = material; }} color={index % 2 === 0 ? "#a2adb0" : "#657174"} transparent opacity={0} toneMapped={false} />
        </mesh>
      ))}

      {[-1.9, 0, 1.9].map((x, index) => (
        <mesh key={x} position={[x, 0.085, -0.7 - index * 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.018, 8]} />
          <meshBasicMaterial color="#7b8588" transparent opacity={index === 1 ? 0.13 : 0.07} toneMapped={false} />
        </mesh>
      ))}

      <mesh position={[-2.2, 3.15, -0.35]} rotation={[0, 0, -0.025]}>
        <boxGeometry args={[0.18, 6.4, 0.5]} />
        <meshPhysicalMaterial color="#151a1c" metalness={0.96} roughness={0.2} clearcoat={0.2} />
      </mesh>
      <mesh position={[2.26, 3.15, -0.42]} rotation={[0, 0, 0.04]}>
        <boxGeometry args={[0.16, 6.1, 0.48]} />
        <meshPhysicalMaterial color="#151a1c" metalness={0.96} roughness={0.2} clearcoat={0.2} />
      </mesh>
      <pointLight ref={lightRef} color="#b5c0c2" intensity={0} distance={8} decay={2.3} position={[-2.8, 5.6, 1.8]} />
    </group>
  );
}
