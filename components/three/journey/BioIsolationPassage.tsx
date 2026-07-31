"use client";

import type { DeviceTier } from "@/hooks/useDeviceProfile";

type BioIsolationPassageProps = { tier: DeviceTier };

const gates = [
  { x: 11.2, z: -184 },
  { x: 9.1, z: -189 },
  { x: 6.5, z: -194 },
  { x: 3.4, z: -199 },
  { x: 0.4, z: -204 },
];

export function BioIsolationPassage({ tier }: BioIsolationPassageProps) {
  const visibleGates = tier === "mobile" ? gates.filter((_, index) => index % 2 === 0) : gates;
  return (
    <group>
      <mesh position={[5.1, -0.1, -194]} rotation={[0, -0.48, 0]}>
        <boxGeometry args={[8.2, 0.22, 30]} />
        <meshStandardMaterial color="#020403" metalness={0.74} roughness={0.4} />
      </mesh>
      {visibleGates.map((gate, index) => (
        <group key={gate.z} position={[gate.x, 3.6, gate.z]} rotation={[0, -0.48, 0]}>
          <mesh position={[-3.5, 0, 0]}><boxGeometry args={[0.1, 7.1, 0.12]} /><meshStandardMaterial color="#111613" metalness={0.86} roughness={0.3} /></mesh>
          <mesh position={[3.5, 0, 0]}><boxGeometry args={[0.1, 7.1, 0.12]} /><meshStandardMaterial color="#111613" metalness={0.86} roughness={0.3} /></mesh>
          <mesh position={[0, 3.52, 0]}><boxGeometry args={[7.1, 0.1, 0.12]} /><meshStandardMaterial color="#111613" metalness={0.86} roughness={0.3} /></mesh>
          <mesh position={[index % 2 ? 2.4 : -2.4, 1.1, 0.08]}><boxGeometry args={[0.025, 2.8, 0.025]} /><meshBasicMaterial color="#a3aca3" transparent opacity={0.14 + index * 0.025} toneMapped={false} /></mesh>
        </group>
      ))}
    </group>
  );
}
