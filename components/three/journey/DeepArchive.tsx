"use client";

import type { DeviceTier } from "@/hooks/useDeviceProfile";

type DeepArchiveProps = { tier: DeviceTier };

export function DeepArchive({ tier }: DeepArchiveProps) {
  const distantBays = tier === "mobile" ? [-4, 16] : [-8, -1.5, 15.5, 22];
  return (
    <group>
      <mesh position={[6.8, -0.25, -118]}>
        <boxGeometry args={[42, 0.4, 52]} />
        <meshStandardMaterial color="#020303" metalness={0.7} roughness={0.45} />
      </mesh>
      <mesh position={[6.8, 10, -138]}>
        <boxGeometry args={[44, 22, 1.6]} />
        <meshStandardMaterial color="#010202" metalness={0.66} roughness={0.5} />
      </mesh>
      {distantBays.map((x, index) => (
        <group key={x} position={[x, 5.2, -126 - (index % 2) * 5]}>
          <mesh>
            <boxGeometry args={[5.2, 10.5, 0.8]} />
            <meshStandardMaterial color="#050708" metalness={0.82} roughness={0.34} />
          </mesh>
          <mesh position={[0, 0, 0.46]}>
            <boxGeometry args={[3.7, 7.8, 0.1]} />
            <meshBasicMaterial color="#010202" />
          </mesh>
          <mesh position={[index % 2 ? 1.7 : -1.7, 1.1, 0.54]}>
            <boxGeometry args={[0.025, 3.2, 0.025]} />
            <meshBasicMaterial color="#5c676a" transparent opacity={0.2} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[-3.4, 2.8, -111]} rotation={[0.15, 0.2, -0.4]} scale={[0.8, 1.8, 0.45]}>
        <dodecahedronGeometry args={[1.25, 0]} />
        <meshStandardMaterial color="#080a0b" metalness={0.8} roughness={0.38} />
      </mesh>
      <mesh position={[16.5, 4.4, -121]} rotation={[0.4, -0.25, 0.3]} scale={[1.8, 0.55, 0.5]}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshStandardMaterial color="#060809" metalness={0.82} roughness={0.34} />
      </mesh>
    </group>
  );
}
