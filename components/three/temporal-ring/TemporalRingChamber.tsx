"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import { temporalRingArtifact } from "@/artifacts/registry";
import { sampleArtifactLifecycle } from "@/artifacts/lifecycle";

type TemporalRingChamberProps = {
  tier: DeviceTier;
  scrollProgress: MutableRefObject<number>;
};

export function TemporalRingChamber({ tier, scrollProgress }: TemporalRingChamberProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  const barRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const depthBarRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const marks = useMemo(() => tier === "mobile" ? [-3.6, -1.8, 0, 1.8, 3.6] : [-5.4, -4.05, -2.7, -1.35, 0, 1.35, 2.7, 4.05, 5.4], [tier]);

  useFrame(() => {
    const lifecycle = sampleArtifactLifecycle(temporalRingArtifact, scrollProgress.current);
    barRefs.current.forEach((material, index) => {
      if (!material) return;
      const lead = index === barRefs.current.length - 1 ? 0.18 : 0;
      const reveal = THREE.MathUtils.clamp(lifecycle.entry * 1.45 - index * 0.045 + lead, 0, 1);
      material.opacity = lifecycle.visible * (0.035 + reveal * (index % 3 === 0 ? 0.32 : 0.14));
    });
    depthBarRefs.current.forEach((material, index) => {
      if (!material) return;
      const sequence = THREE.MathUtils.clamp(lifecycle.entry * 1.65 - index * 0.12, 0, 1);
      const rhythm = 0.55 + Math.sin(lifecycle.activation * 5.4 - index * 1.35) * 0.45;
      material.opacity = lifecycle.visible * (0.025 + sequence * (0.08 + rhythm * 0.14));
    });
    if (lightRef.current) lightRef.current.intensity = lifecycle.visible * (0.08 + lifecycle.activation * 0.72);
    if (rimLightRef.current) rimLightRef.current.intensity = lifecycle.visible * (0.04 + lifecycle.inspection * 0.62);
  });

  return (
    <group position={[11.5, 0, -170]}>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[18, 0.24, 24]} />
        <meshPhysicalMaterial color="#020404" metalness={0.9} roughness={0.25} clearcoat={0.16} />
      </mesh>
      <mesh position={[0, 7.6, -6.2]}>
        <boxGeometry args={[18, 15.4, 0.42]} />
        <meshStandardMaterial color="#030506" metalness={0.84} roughness={0.31} />
      </mesh>
      <mesh position={[-9.1, 4.4, -0.2]}>
        <boxGeometry args={[0.38, 8.9, 12.5]} />
        <meshStandardMaterial color="#050708" metalness={0.86} roughness={0.28} />
      </mesh>
      <mesh position={[9.1, 4.4, -0.2]}>
        <boxGeometry args={[0.38, 8.9, 12.5]} />
        <meshStandardMaterial color="#050708" metalness={0.86} roughness={0.28} />
      </mesh>

      {[-4.8, -3.1, -1.4, 0.3, 2, 3.7, 5.4].map((y, index) => (
        <mesh key={y} position={[0, y + 4.5, -5.96]}>
          <boxGeometry args={[index % 3 === 0 ? 15.4 : 12.8, 0.025, 0.035]} />
          <meshBasicMaterial ref={(material) => { barRefs.current[index] = material; }} color={index % 3 === 0 ? "#b9c5c6" : "#6f7e81"} transparent opacity={0} toneMapped={false} />
        </mesh>
      ))}

      {[3.9, 1.4, -1.1, -3.6].map((z, index) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[-7.15, 3.9, 0]}>
            <boxGeometry args={[0.025, 6.9 - index * 0.28, 0.025]} />
            <meshBasicMaterial ref={(material) => { depthBarRefs.current[index * 3] = material; }} color="#849194" transparent opacity={0} toneMapped={false} />
          </mesh>
          <mesh position={[7.15, 3.9, 0]}>
            <boxGeometry args={[0.025, 6.9 - index * 0.28, 0.025]} />
            <meshBasicMaterial ref={(material) => { depthBarRefs.current[index * 3 + 1] = material; }} color="#849194" transparent opacity={0} toneMapped={false} />
          </mesh>
          <mesh position={[0, 7.25 - index * 0.14, 0]}>
            <boxGeometry args={[14.3, 0.025, 0.025]} />
            <meshBasicMaterial ref={(material) => { depthBarRefs.current[index * 3 + 2] = material; }} color={index === 1 ? "#c2cccd" : "#738083"} transparent opacity={0} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {marks.map((x, index) => (
        <group key={x} position={[x, 0.09, -0.2 - Math.abs(x) * 0.12]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.018, index % 2 === 0 ? 7.8 : 4.8]} />
            <meshBasicMaterial color="#879396" transparent opacity={index % 2 === 0 ? 0.22 : 0.1} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.08, 3.85]}>
            <boxGeometry args={[index % 2 === 0 ? 0.18 : 0.1, 0.12, 0.03]} />
            <meshBasicMaterial color="#aab6b8" transparent opacity={0.26} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {[-5.7, 5.7].map((x) => (
        <group key={x} position={[x, 3.35, -0.45]}>
          <mesh>
            <boxGeometry args={[0.11, 5.9, 0.11]} />
            <meshStandardMaterial color="#1a2021" metalness={0.94} roughness={0.22} />
          </mesh>
          <mesh position={[0, 2.78, 0]}>
            <boxGeometry args={[0.7, 0.04, 0.04]} />
            <meshBasicMaterial color="#9eaaac" transparent opacity={0.34} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <pointLight ref={lightRef} color="#b3c7ca" intensity={0} distance={10} decay={2.2} position={[-5.8, 6.1, 2.1]} />
      <pointLight ref={rimLightRef} color="#e0e7e7" intensity={0} distance={8.5} decay={2.4} position={[5.4, 4.8, 1.4]} />
    </group>
  );
}
