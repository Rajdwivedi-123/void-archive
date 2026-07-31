"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/hooks/useDeviceProfile";

type GeometricIsolationPassageProps = { tier: DeviceTier; scrollProgress: MutableRefObject<number> };

export function GeometricIsolationPassage({ tier, scrollProgress }: GeometricIsolationPassageProps) {
  const impossibleRef = useRef<THREE.Group>(null);
  const ribs = tier === "mobile" ? [-5.2, 5.2] : [-6.8, -4.9, 4.9, 6.8];
  useFrame((_, delta) => {
    if (!impossibleRef.current) return;
    const extension = THREE.MathUtils.smoothstep(scrollProgress.current, .823, .847);
    impossibleRef.current.scale.z = THREE.MathUtils.damp(impossibleRef.current.scale.z, 1 + extension * .72, 4, delta);
  });
  return (
    <group ref={impossibleRef} position={[2.4, 0, -250]}>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[16, 0.22, 34]} />
        <meshStandardMaterial color="#020303" metalness={0.8} roughness={0.32} />
      </mesh>
      {ribs.map((x, index) => (
        <group key={x} position={[x, 4.4, -2 + index * 1.8]} rotation={[0, 0, index % 2 ? -0.018 : 0.018]}>
          <mesh><boxGeometry args={[0.1, 8.8, 0.12]} /><meshStandardMaterial color="#111513" metalness={0.88} roughness={0.28} /></mesh>
          <mesh position={[-x * 0.5, 4.3, 0]}><boxGeometry args={[Math.abs(x), 0.08, 0.1]} /><meshStandardMaterial color="#151917" metalness={0.9} roughness={0.25} /></mesh>
        </group>
      ))}
      {[-5.4, -2.5, 0.6, 3.9].map((x, index) => (
        <mesh key={x} position={[x, 0.035, -5 - index * 3.6]} rotation={[-Math.PI / 2, 0, index * 0.035]}>
          <planeGeometry args={[0.022, 13]} />
          <meshBasicMaterial color="#929b96" transparent opacity={0.08 - index * 0.012} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0.8, 4.3, -15.5]}>
        <planeGeometry args={[0.035, 7.8]} />
        <meshBasicMaterial color="#bac0ba" transparent opacity={0.07} toneMapped={false} />
      </mesh>
      {[-12, -6, 1, 9, 18].slice(0, tier === "mobile" ? 3 : 5).map((z, index) => <group key={z} position={[0, 4.25, z]} scale={[1 - index * .025, 1, 1]}><mesh position={[-6.4, 0, 0]}><boxGeometry args={[.07, 8.5, .08]} /><meshBasicMaterial color="#aeb5b0" transparent opacity={.045} /></mesh><mesh position={[6.4, 0, 0]}><boxGeometry args={[.07, 8.5, .08]} /><meshBasicMaterial color="#aeb5b0" transparent opacity={.045} /></mesh><mesh position={[0, 4.22, 0]}><boxGeometry args={[12.8, .06, .08]} /><meshBasicMaterial color="#aeb5b0" transparent opacity={.04} /></mesh></group>)}
    </group>
  );
}
