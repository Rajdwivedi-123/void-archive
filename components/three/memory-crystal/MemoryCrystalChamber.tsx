"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { sampleArtifactLifecycle } from "@/artifacts/lifecycle";
import { memoryCrystalArtifact } from "@/artifacts/registry";
import type { DeviceTier } from "@/hooks/useDeviceProfile";

type MemoryCrystalChamberProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
};

const floorLines = [
  { x: -6.8, z: 6.4, length: 18, angle: 0.02 },
  { x: -3.7, z: 3.2, length: 14, angle: -0.018 },
  { x: -0.4, z: 5.8, length: 17, angle: 0.012 },
  { x: 3.1, z: 2.4, length: 13, angle: -0.025 },
  { x: 6.6, z: 5.2, length: 16, angle: 0.018 },
];

export function MemoryCrystalChamber({ tier, reducedMotion, scrollProgress }: MemoryCrystalChamberProps) {
  const panelMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const floorMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const wallSeamRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const sanctuaryLightRef = useRef<THREE.PointLight>(null);
  const pearlLightRef = useRef<THREE.PointLight>(null);
  const timeRef = useRef(0);
  const panelCount = tier === "mobile" ? 4 : tier === "tablet" ? 6 : 8;
  const panelDefinitions = useMemo(() => [
    [-7.6, 7.8, -2.8, 4.6], [-5.2, 4.9, -4.5, 2.8], [-2.2, 8.6, -5.5, 5.2],
    [1.3, 6.1, -4.1, 3.6], [4.7, 8.2, -5.2, 4.8], [7.4, 5.4, -3.2, 3.1],
    [-8.7, 3.6, 1.8, 2.2], [8.5, 8.9, 0.8, 4.3],
  ] as Array<[number, number, number, number]>, []);

  useFrame((_, delta) => {
    const lifecycle = sampleArtifactLifecycle(memoryCrystalArtifact, scrollProgress.current);
    const recallIn = THREE.MathUtils.smoothstep(scrollProgress.current, 0.986, 0.991);
    const recallOut = THREE.MathUtils.smoothstep(scrollProgress.current, 0.994, 0.999);
    const recall = reducedMotion ? lifecycle.inspection * 0.3 : recallIn * (1 - recallOut);
    if (!reducedMotion) timeRef.current += delta;
    panelMaterialRefs.current.forEach((material, index) => {
      if (!material) return;
      const staged = THREE.MathUtils.clamp(lifecycle.entry * 1.65 - index * 0.075, 0, 1);
      const breathing = reducedMotion ? 0.5 : Math.sin(timeRef.current * 0.24 + index * 1.3) * 0.5 + 0.5;
      material.opacity = lifecycle.visible * staged * (0.045 + lifecycle.activation * (0.07 + breathing * 0.06)) * (1 - recall * 0.28);
    });
    floorMaterialRefs.current.forEach((material, index) => {
      if (!material) return;
      const reveal = THREE.MathUtils.clamp(lifecycle.activation * 1.55 - index * 0.09, 0, 1);
      material.opacity = lifecycle.visible * (0.02 + reveal * (index === 2 ? 0.2 : 0.09) + recall * 0.08);
    });
    wallSeamRefs.current.forEach((material, index) => {
      if (!material) return;
      material.opacity = lifecycle.visible * (0.025 + lifecycle.entry * (index % 2 ? 0.09 : 0.16) + recall * 0.06);
    });
    if (sanctuaryLightRef.current) sanctuaryLightRef.current.intensity = lifecycle.visible * (0.05 + lifecycle.activation * 0.88) * (1 - recall * 0.16);
    if (pearlLightRef.current) pearlLightRef.current.intensity = lifecycle.activation * (0.04 + lifecycle.inspection * 0.7 + recall * 0.28);
  });

  return (
    <group position={[4.2, 0, -350]}>
      <mesh position={[0, -0.12, 2.2]}>
        <boxGeometry args={[24, 0.28, 36]} />
        <meshPhysicalMaterial color="#030605" metalness={0.68} roughness={0.24} clearcoat={0.18} clearcoatRoughness={0.6} />
      </mesh>
      <mesh position={[0, 10.4, -8.1]}>
        <boxGeometry args={[24, 20.8, 0.48]} />
        <meshStandardMaterial color="#030504" metalness={0.67} roughness={0.42} />
      </mesh>
      <mesh position={[-12.2, 9, 1.2]}>
        <boxGeometry args={[0.42, 18, 31]} />
        <meshStandardMaterial color="#050806" metalness={0.76} roughness={0.34} />
      </mesh>
      <mesh position={[12.2, 9, 1.2]}>
        <boxGeometry args={[0.42, 18, 31]} />
        <meshStandardMaterial color="#050806" metalness={0.76} roughness={0.34} />
      </mesh>

      {panelDefinitions.slice(0, panelCount).map(([x, y, z, height], index) => (
        <group key={index} position={[x, y, z]} rotation={[0, index % 2 ? -0.08 : 0.06, index % 3 === 0 ? 0.018 : -0.012]}>
          <mesh>
            <planeGeometry args={[index % 3 === 0 ? 0.06 : 0.035, height]} />
            <meshBasicMaterial ref={(material) => { panelMaterialRefs.current[index] = material; }} color={index % 3 === 0 ? "#e0e1d9" : "#aeb8b3"} transparent opacity={0} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -0.06]}>
            <planeGeometry args={[index % 3 === 0 ? 0.52 : 0.34, height * 0.9]} />
            <meshBasicMaterial color="#69736e" transparent opacity={0.018} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {[-8.4, -5.8, 5.6, 8.2].map((x, index) => (
        <group key={x} position={[x, 8.6, -7.72]}>
          <mesh>
            <boxGeometry args={[0.11, 16.4, 0.08]} />
            <meshStandardMaterial color="#171d1a" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[index % 2 ? 0.31 : -0.31, 1.2, 0.05]}>
            <planeGeometry args={[0.025, 6.2]} />
            <meshBasicMaterial ref={(material) => { wallSeamRefs.current[index] = material; }} color="#bdc4be" transparent opacity={0} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {floorLines.map((line, index) => (
        <mesh key={line.x} position={[line.x, 0.045, line.z]} rotation={[-Math.PI / 2, 0, line.angle]}>
          <planeGeometry args={[0.018, line.length]} />
          <meshBasicMaterial ref={(material) => { floorMaterialRefs.current[index] = material; }} color={index === 2 ? "#d9d9d0" : "#7f8a85"} transparent opacity={0} toneMapped={false} />
        </mesh>
      ))}

      <mesh position={[0, 0.07, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.7, 48]} />
        <meshPhysicalMaterial color="#111815" metalness={0.72} roughness={0.18} clearcoat={0.35} transparent opacity={0.32} depthWrite={false} />
      </mesh>
      <group position={[0, 0.09, -0.4]}>
        <mesh position={[0.18, 0, 2.48]}><boxGeometry args={[4.6, 0.012, 0.025]} /><meshBasicMaterial color="#bfc5bf" transparent opacity={0.13} toneMapped={false} /></mesh>
        <mesh position={[-0.28, 0, -2.32]}><boxGeometry args={[4.1, 0.012, 0.025]} /><meshBasicMaterial color="#bfc5bf" transparent opacity={0.09} toneMapped={false} /></mesh>
        <mesh position={[2.35, 0, 0.12]}><boxGeometry args={[0.025, 0.012, 4.72]} /><meshBasicMaterial color="#8f9994" transparent opacity={0.08} toneMapped={false} /></mesh>
        <mesh position={[-2.2, 0, -0.18]}><boxGeometry args={[0.025, 0.012, 4.1]} /><meshBasicMaterial color="#8f9994" transparent opacity={0.07} toneMapped={false} /></mesh>
      </group>

      <mesh position={[-9.7, 5.8, 6.8]} rotation={[0, 0.12, 0]}>
        <boxGeometry args={[0.24, 11.6, 0.36]} />
        <meshStandardMaterial color="#101512" metalness={0.84} roughness={0.3} />
      </mesh>
      <pointLight ref={sanctuaryLightRef} color="#d9d2c7" intensity={0} distance={22} decay={2.15} position={[-8.8, 10.8, 3.8]} />
      <pointLight ref={pearlLightRef} color="#d8e2e0" intensity={0} distance={14} decay={2.35} position={[2.8, 6.4, 1.4]} />
    </group>
  );
}
