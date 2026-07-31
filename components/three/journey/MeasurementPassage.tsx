"use client";

import type { DeviceTier } from "@/hooks/useDeviceProfile";

type MeasurementPassageProps = { tier: DeviceTier };

export function MeasurementPassage({ tier }: MeasurementPassageProps) {
  const ticks = tier === "mobile" ? [-148, -156] : [-144, -148, -152, -156, -160];
  return (
    <group>
      <mesh position={[11.5, -0.02, -146]}>
        <boxGeometry args={[7.2, 0.22, 38]} />
        <meshStandardMaterial color="#020404" metalness={0.86} roughness={0.34} />
      </mesh>
      <mesh position={[7.8, 3.6, -146]}>
        <boxGeometry args={[0.28, 7.3, 38]} />
        <meshStandardMaterial color="#040607" metalness={0.84} roughness={0.31} />
      </mesh>
      <mesh position={[15.2, 3.6, -146]}>
        <boxGeometry args={[0.28, 7.3, 38]} />
        <meshStandardMaterial color="#040607" metalness={0.84} roughness={0.31} />
      </mesh>
      {ticks.map((z, index) => (
        <group key={z} position={[11.5, 0.08, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5.8, 0.018]} />
            <meshBasicMaterial color="#7d8b8e" transparent opacity={index % 2 === 0 ? 0.18 : 0.09} toneMapped={false} />
          </mesh>
          <mesh position={[index % 2 ? -2.25 : 2.25, 2.9, 0]}>
            <boxGeometry args={[0.025, 5.4, 0.025]} />
            <meshBasicMaterial color="#8f9b9d" transparent opacity={0.16} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
