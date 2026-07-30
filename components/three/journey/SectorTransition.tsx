"use client";

import * as THREE from "three";

export function SectorTransition() {
  return (
    <group position={[6.8, 3.7, -24.2]}>
      <mesh position={[-4.05, 0, 0]}><boxGeometry args={[0.18, 7.6, 0.26]} /><meshStandardMaterial color="#202729" metalness={0.94} roughness={0.2} /></mesh>
      <mesh position={[4.05, 0, 0]}><boxGeometry args={[0.18, 7.6, 0.26]} /><meshStandardMaterial color="#202729" metalness={0.94} roughness={0.2} /></mesh>
      <mesh position={[0, 3.7, 0]}><boxGeometry args={[8.25, 0.18, 0.26]} /><meshStandardMaterial color="#202729" metalness={0.94} roughness={0.2} /></mesh>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[7.8, 7.2]} />
        <meshBasicMaterial color="#9aa5a8" transparent opacity={0.018} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
