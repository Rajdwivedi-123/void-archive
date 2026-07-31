"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import { neuralRelicArtifact } from "@/artifacts/registry";
import { sampleArtifactLifecycle } from "@/artifacts/lifecycle";

type NeuralRelicChamberProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
};

const floorGrowthLines = [
  { position: [-1.2, 0.08, 1.8] as [number, number, number], length: 5.8, angle: -0.22 },
  { position: [1.2, 0.08, 0.5] as [number, number, number], length: 4.2, angle: 0.4 },
  { position: [-3.1, 0.08, -0.4] as [number, number, number], length: 3.1, angle: -0.7 },
  { position: [3.5, 0.08, 2.2] as [number, number, number], length: 2.7, angle: 0.82 },
  { position: [0.2, 0.08, -2.2] as [number, number, number], length: 4.8, angle: 0.08 },
];

export function NeuralRelicChamber({ tier, reducedMotion, scrollProgress }: NeuralRelicChamberProps) {
  const scanRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const floorRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const primaryLightRef = useRef<THREE.PointLight>(null);
  const responseLightRef = useRef<THREE.PointLight>(null);
  const timeRef = useRef(0);
  const rails = useMemo(() => tier === "mobile" ? [-5.7, 5.4] : [-7.2, -5.45, 5.1, 7.35], [tier]);

  useFrame((_, delta) => {
    const lifecycle = sampleArtifactLifecycle(neuralRelicArtifact, scrollProgress.current);
    if (!reducedMotion) timeRef.current += delta;
    scanRefs.current.forEach((material, index) => {
      if (!material) return;
      const staged = THREE.MathUtils.clamp(lifecycle.entry * 1.5 - index * 0.11, 0, 1);
      const response = reducedMotion ? 0.5 : Math.sin(timeRef.current * (0.52 + lifecycle.inspection * 0.35) - index * 1.4) * 0.5 + 0.5;
      material.opacity = lifecycle.visible * (0.025 + staged * (0.09 + response * 0.16));
    });
    floorRefs.current.forEach((material, index) => {
      if (!material) return;
      const reveal = THREE.MathUtils.clamp(lifecycle.activation * 1.7 - index * 0.14, 0, 1);
      material.opacity = 0.025 + reveal * (index === 0 ? 0.28 : 0.14);
    });
    if (primaryLightRef.current) primaryLightRef.current.intensity = lifecycle.visible * (0.08 + lifecycle.activation * 0.58);
    if (responseLightRef.current) responseLightRef.current.intensity = lifecycle.activation * (0.04 + lifecycle.inspection * 0.55);
  });

  return (
    <group position={[-2.5, 0, -220]}>
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[19, 0.25, 24]} />
        <meshStandardMaterial color="#020403" metalness={0.72} roughness={0.34} />
      </mesh>
      <mesh position={[0, 7.8, -7.2]}>
        <boxGeometry args={[19, 15.8, 0.45]} />
        <meshStandardMaterial color="#020403" metalness={0.66} roughness={0.42} />
      </mesh>
      <mesh position={[-9.6, 4.5, -0.6]}>
        <boxGeometry args={[0.38, 9.1, 13.6]} />
        <meshStandardMaterial color="#050706" metalness={0.78} roughness={0.32} />
      </mesh>
      <mesh position={[9.6, 4.5, -0.6]}>
        <boxGeometry args={[0.38, 9.1, 13.6]} />
        <meshStandardMaterial color="#050706" metalness={0.78} roughness={0.32} />
      </mesh>

      {rails.map((x, index) => (
        <group key={x} position={[x, 4.15 + (index % 2) * 0.45, -1.1 - (index % 3) * 0.7]}>
          <mesh>
            <boxGeometry args={[index % 2 ? 0.075 : 0.12, index % 2 ? 6.4 : 7.5, 0.11]} />
            <meshStandardMaterial color="#1a1f1d" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[index % 2 ? -0.32 : 0.36, 1.2, 0.08]}>
            <boxGeometry args={[0.62, 0.025, 0.025]} />
            <meshBasicMaterial ref={(material) => { scanRefs.current[index] = material; }} color="#c5c9bc" transparent opacity={0} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {[-4.7, 4.3].map((x, index) => (
        <mesh key={x} position={[x, 4.25, -0.2 + index * 0.6]} rotation={[0, index ? -0.035 : 0.045, 0]}>
          <planeGeometry args={[0.035, 7.6]} />
          <meshStandardMaterial color="#78817d" transparent opacity={0.08} roughness={0.24} metalness={0.22} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <group position={[-3.8, 7.1, 0.2]} rotation={[0.08, 0.05, -0.03]}>
        <mesh position={[0, 0, 0]}><boxGeometry args={[5.2, 0.1, 0.1]} /><meshStandardMaterial color="#202522" metalness={0.9} roughness={0.25} /></mesh>
        <mesh position={[-2.55, -1.15, 0]}><boxGeometry args={[0.08, 2.4, 0.08]} /><meshStandardMaterial color="#202522" metalness={0.9} roughness={0.25} /></mesh>
        <mesh position={[2.55, -0.7, 0]}><boxGeometry args={[0.08, 1.5, 0.08]} /><meshStandardMaterial color="#202522" metalness={0.9} roughness={0.25} /></mesh>
      </group>
      <group position={[4.2, 6.45, -1.4]} rotation={[-0.04, -0.08, 0.025]}>
        <mesh><boxGeometry args={[3.9, 0.07, 0.07]} /><meshStandardMaterial color="#191e1b" metalness={0.9} roughness={0.26} /></mesh>
        <mesh position={[1.9, -1.35, 0]}><boxGeometry args={[0.06, 2.75, 0.06]} /><meshStandardMaterial color="#191e1b" metalness={0.9} roughness={0.26} /></mesh>
      </group>

      {floorGrowthLines.map((line, index) => (
        <mesh key={index} position={line.position} rotation={[-Math.PI / 2, 0, line.angle]}>
          <planeGeometry args={[0.018, line.length]} />
          <meshBasicMaterial ref={(material) => { floorRefs.current[index] = material; }} color={index === 0 ? "#c4c8bb" : "#7d8781"} transparent opacity={0.02} toneMapped={false} />
        </mesh>
      ))}
      {[-3.8, -1.4, 1.7, 4.2].map((x, index) => (
        <mesh key={x} position={[x, 0.1, 3.4 - index * 1.6]}>
          <boxGeometry args={[0.14, 0.05, 0.14]} />
          <meshBasicMaterial color="#aeb4aa" transparent opacity={0.25} toneMapped={false} />
        </mesh>
      ))}
      <pointLight ref={primaryLightRef} color="#c4c8ba" intensity={0} distance={11} decay={2.2} position={[-5.7, 6.8, 2.8]} />
      <pointLight ref={responseLightRef} color="#e1e3da" intensity={0} distance={9} decay={2.5} position={[4.8, 4.4, 1.6]} />
    </group>
  );
}
