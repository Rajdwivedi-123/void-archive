"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { sampleArtifactLifecycle } from "@/artifacts/lifecycle";
import { voidArtifact } from "@/artifacts/registry";
import type { DeviceTier } from "@/hooks/useDeviceProfile";

type VoidChamberProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
};

const floorCurves = [
  [[-7.6, 0.06, 17], [-6.4, 0.06, 9], [-3.2, 0.06, 2.5], [-2.15, 0.06, -1.2]],
  [[-3.8, 0.065, 18], [-3.25, 0.065, 10], [-2.15, 0.065, 3.4], [-1.42, 0.065, 0.1]],
  [[0.2, 0.07, 18], [-0.3, 0.07, 10.5], [-0.78, 0.07, 3.2], [-0.44, 0.07, -1.6]],
  [[4.5, 0.065, 18], [3.25, 0.065, 10], [2.18, 0.065, 3.6], [1.6, 0.065, -0.4]],
  [[8.2, 0.06, 16], [6.25, 0.06, 9.2], [3.35, 0.06, 2.8], [2.22, 0.06, -1.2]],
] as const;

const floorGeometries = floorCurves.map((points, index) => {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  return new THREE.TubeGeometry(curve, 30, index === 2 ? 0.018 : 0.011, 4, false);
});

const smoothRange = (value: number, from: number, to: number) => THREE.MathUtils.smoothstep(value, from, to);

export function VoidChamber({ tier, reducedMotion, scrollProgress }: VoidChamberProps) {
  const floorMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const seamMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const affectedMaterialRefs = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
  const foregroundRef = useRef<THREE.Group>(null);
  const grazingLightRef = useRef<THREE.PointLight>(null);
  const edgeLightRef = useRef<THREE.PointLight>(null);
  const rails = useMemo(() => tier === "mobile" ? [-8.6, 8.2] : [-10.8, -8.7, 8.1, 10.6], [tier]);
  const affectedCount = tier === "mobile" ? 1 : tier === "tablet" ? 2 : 3;

  useFrame((_, delta) => {
    const progress = scrollProgress.current;
    const lifecycle = sampleArtifactLifecycle(voidArtifact, progress);
    const signatureIn = smoothRange(progress, 0.899, 0.905);
    const signatureOut = smoothRange(progress, 0.907, 0.913);
    const collapse = reducedMotion ? lifecycle.inspection * 0.28 : signatureIn * (1 - signatureOut);
    const aftermath = smoothRange(progress, 0.908, 0.914);

    floorMaterialRefs.current.forEach((material, index) => {
      if (!material) return;
      const staged = THREE.MathUtils.clamp(lifecycle.activation * 1.75 - index * 0.1, 0, 1);
      material.opacity = lifecycle.visible * (0.018 + staged * (index === 2 ? 0.28 : 0.14) + collapse * 0.12);
    });
    seamMaterialRefs.current.forEach((material, index) => {
      if (!material) return;
      const staged = THREE.MathUtils.clamp(lifecycle.entry * 1.65 - index * 0.08, 0, 1);
      const rhythm = index % 3 === 0 ? 1 : 0.55;
      material.opacity = lifecycle.visible * staged * (0.045 + lifecycle.activation * 0.12 * rhythm) * (1 - collapse * 0.52);
    });
    affectedMaterialRefs.current.forEach((material, index) => {
      if (!material) return;
      const localLoss = THREE.MathUtils.clamp(lifecycle.activation * 1.55 - index * 0.2, 0, 1);
      const lossStrength = index === 0 ? 0.42 : index === 1 ? 0.56 : 0.82;
      const permanentLoss = index === affectedCount - 1 ? aftermath : 0;
      material.opacity = Math.max(0, 0.58 * lifecycle.visible * (1 - localLoss * lossStrength - collapse * 0.3 - permanentLoss));
    });
    if (foregroundRef.current) {
      const targetScale = 1 + collapse * 0.42;
      foregroundRef.current.scale.z = THREE.MathUtils.damp(foregroundRef.current.scale.z, targetScale, 7, delta);
      foregroundRef.current.position.x = THREE.MathUtils.damp(foregroundRef.current.position.x, -6.2 - collapse * 0.28, 6, delta);
    }
    if (grazingLightRef.current) grazingLightRef.current.intensity = lifecycle.visible * (0.12 + lifecycle.activation * 1.08) * (1 - collapse * 0.68);
    if (edgeLightRef.current) edgeLightRef.current.intensity = lifecycle.activation * (0.12 + lifecycle.inspection * 0.9) * (1 - collapse * 0.32);
  });

  return (
    <group position={[5.3, 0, -282]}>
      <mesh position={[0, -0.12, 2.5]}>
        <boxGeometry args={[27, 0.28, 39]} />
        <meshStandardMaterial color="#010202" metalness={0.76} roughness={0.39} />
      </mesh>
      <mesh position={[-13.7, 6.3, 0]}>
        <boxGeometry args={[0.48, 12.8, 35]} />
        <meshStandardMaterial color="#030504" metalness={0.8} roughness={0.34} />
      </mesh>
      <mesh position={[13.7, 6.3, 0]}>
        <boxGeometry args={[0.48, 12.8, 35]} />
        <meshStandardMaterial color="#030504" metalness={0.8} roughness={0.34} />
      </mesh>
      <mesh position={[0, 12.6, 1.2]}>
        <boxGeometry args={[27, 0.35, 36]} />
        <meshStandardMaterial color="#010202" metalness={0.68} roughness={0.45} />
      </mesh>

      <group position={[0, 5.7, -8.4]}>
        <mesh position={[-8.9, 0, 0]}><boxGeometry args={[8.5, 11.4, 0.5]} /><meshStandardMaterial color="#030504" metalness={0.73} roughness={0.39} /></mesh>
        <mesh position={[8.3, 0.4, 0]}><boxGeometry args={[9.2, 10.6, 0.5]} /><meshStandardMaterial color="#030504" metalness={0.73} roughness={0.39} /></mesh>
        <mesh position={[-1.05, 5.05, 0]}><boxGeometry args={[6.7, 1.3, 0.5]} /><meshStandardMaterial color="#050706" metalness={0.78} roughness={0.34} /></mesh>
        <mesh position={[0.35, -4.82, 0]}><boxGeometry args={[8.2, 1.5, 0.5]} /><meshStandardMaterial color="#050706" metalness={0.78} roughness={0.34} /></mesh>
      </group>

      {rails.map((x, index) => (
        <group key={x} position={[x, 5.8, -0.6 - index * 0.8]} rotation={[0, index % 2 ? -0.035 : 0.04, index % 2 ? 0.012 : -0.018]}>
          <mesh><boxGeometry args={[index % 2 ? 0.09 : 0.14, 11.2, 0.16]} /><meshStandardMaterial color="#141917" metalness={0.91} roughness={0.24} /></mesh>
          <mesh position={[index % 2 ? -0.44 : 0.38, 1.1, 0.1]}>
            <boxGeometry args={[0.82, 0.025, 0.025]} />
            <meshBasicMaterial ref={(material) => { seamMaterialRefs.current[index] = material; }} color="#aeb5af" transparent opacity={0} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {floorGeometries.map((geometry, index) => (
        <mesh key={index}>
          <primitive attach="geometry" object={geometry} />
          <meshBasicMaterial ref={(material) => { floorMaterialRefs.current[index] = material; }} color={index === 2 ? "#c2c7c1" : "#77817c"} transparent opacity={0} toneMapped={false} />
        </mesh>
      ))}

      <group ref={foregroundRef} position={[-6.2, 4.5, 8.2]} rotation={[0.02, -0.13, -0.025]}>
        <mesh><boxGeometry args={[0.24, 9.3, 0.32]} /><meshStandardMaterial color="#111614" metalness={0.9} roughness={0.25} /></mesh>
        <mesh position={[0.18, 2.2, 0.22]}><boxGeometry args={[0.035, 3.4, 0.04]} /><meshBasicMaterial color="#a3aaa5" transparent opacity={0.16} toneMapped={false} /></mesh>
      </group>

      {[
        { position: [-4.5, 6.5, -2.2] as [number, number, number], scale: [3.7, 0.12, 0.14] as [number, number, number], rotation: [0, 0.08, 0.03] as [number, number, number] },
        { position: [4.8, 7.7, -3.1] as [number, number, number], scale: [4.2, 0.1, 0.12] as [number, number, number], rotation: [0, -0.05, -0.025] as [number, number, number] },
        { position: [2.65, 2.35, -0.8] as [number, number, number], scale: [0.1, 3.8, 0.12] as [number, number, number], rotation: [0.02, 0, 0.08] as [number, number, number] },
      ].slice(0, affectedCount).map((beam, index) => (
        <mesh key={index} position={beam.position} rotation={beam.rotation}>
          <boxGeometry args={beam.scale} />
          <meshStandardMaterial ref={(material) => { affectedMaterialRefs.current[index] = material; }} color="#27302c" metalness={0.88} roughness={0.28} transparent opacity={0} />
        </mesh>
      ))}

      {[-8.8, -3.4, 2.8, 8.9].map((x, index) => (
        <mesh key={x} position={[x, 0.1, 11.5 - index * 3.4]}>
          <boxGeometry args={[0.16, 0.045, 0.16]} />
          <meshBasicMaterial color="#9ba39e" transparent opacity={0.17} toneMapped={false} />
        </mesh>
      ))}
      <pointLight ref={grazingLightRef} color="#c6cbc4" intensity={0} distance={22} decay={2.25} position={[-8.8, 7.2, 4.6]} />
      <pointLight ref={edgeLightRef} color="#e0e2dd" intensity={0} distance={18} decay={2.4} position={[8.2, 4.2, 1.6]} />
    </group>
  );
}
