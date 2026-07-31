"use client";

import type { DeviceTier } from "@/hooks/useDeviceProfile";

type MemoryRecoveryPassageProps = { tier: DeviceTier };

export function MemoryRecoveryPassage({ tier }: MemoryRecoveryPassageProps) {
  const frames = tier === "mobile" ? [-5.4, 5.4] : [-7.1, -5.2, 5.2, 7.1];
  const lightCount = tier === "mobile" ? 4 : 7;
  return (
    <group position={[1.4, 0, -318]}>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[16.5, 0.22, 41]} />
        <meshStandardMaterial color="#020403" metalness={0.76} roughness={0.34} />
      </mesh>
      {frames.map((x, index) => (
        <group key={x} position={[x, 5.4, -1.5 + index * 1.1]}>
          <mesh>
            <boxGeometry args={[0.095, 10.8, 0.12]} />
            <meshStandardMaterial color="#121715" metalness={0.86} roughness={0.28} />
          </mesh>
          <mesh position={[-x * 0.5, 5.25, 0]}>
            <boxGeometry args={[Math.abs(x), 0.075, 0.1]} />
            <meshStandardMaterial color="#161c19" metalness={0.88} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: lightCount }, (_, index) => (
        <group key={index} position={[-4.2 + (index % 3) * 4.2, 3.1 + (index % 2) * 2.3, 14 - index * 5.2]}>
          <mesh>
            <planeGeometry args={[0.035, index % 2 ? 3.8 : 2.6]} />
            <meshBasicMaterial color={index > 3 ? "#d6d8cf" : "#737d78"} transparent opacity={0.06 + index * 0.009} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -0.04]}>
            <planeGeometry args={[0.28, index % 2 ? 3.2 : 2.15]} />
            <meshBasicMaterial color="#88928d" transparent opacity={0.012} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {[-4.8, -1.7, 1.55, 4.7].map((x, index) => (
        <mesh key={x} position={[x, 0.04, 6 - index * 5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.018, 11]} />
          <meshBasicMaterial color="#aeb5af" transparent opacity={0.045 + index * 0.012} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
