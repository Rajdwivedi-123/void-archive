"use client";

import { useRealitySnapshot } from "@/reality/RealityProvider";
import type { DeviceTier } from "@/hooks/useDeviceProfile";

export function AdaptivePassages({ tier }: { tier: DeviceTier }) {
  const observer = useRealitySnapshot();
  const mobile = tier === "mobile";
  return (
    <group>
      <group position={[5.8, 3.65, -195]} rotation={[0, -0.48, 0]}>
        {observer.temporalNeuralBranch === "causality" ? (
          [-1.4, 0, 1.4].slice(0, mobile ? 2 : 3).map((x, index) => <mesh key={x} position={[x, .4 - index * .3, index * .7]}><torusGeometry args={[.46 + index * .16, .016, 5, 48, Math.PI * 1.55]} /><meshBasicMaterial color="#bdc5bf" transparent opacity={.1 + index * .035} toneMapped={false} /></mesh>)
        ) : (
          [-1.8, -.6, .6, 1.8].slice(0, mobile ? 2 : 4).map((x, index) => <mesh key={x} position={[x, index % 2 ? .7 : -.4, index * .55]} rotation={[0, 0, index % 2 ? .35 : -.28]}><planeGeometry args={[.022, 2.8]} /><meshBasicMaterial color="#b7c3bc" transparent opacity={.09 + index * .02} toneMapped={false} /></mesh>)
        )}
      </group>
      <group position={[0, 4.25, -250]}>
        {observer.neuralVoidBranch === "spatial-mismatch" && [-6.1, 6.1].map((x) => <mesh key={x} position={[x, 0, -7]}><boxGeometry args={[.035, 7.8, .035]} /><meshBasicMaterial color="#bcc3be" transparent opacity={.12} toneMapped={false} /></mesh>)}
        {observer.neuralVoidBranch === "structural" && [-4, -1.35, 1.35, 4].slice(0, mobile ? 2 : 4).map((x, index) => <mesh key={x} position={[x, .5, -5 - index * 1.8]} rotation={[0, 0, index % 2 ? .14 : -.14]}><planeGeometry args={[.018, 4.4]} /><meshBasicMaterial color="#aeb8b1" transparent opacity={.08} toneMapped={false} /></mesh>)}
      </group>
    </group>
  );
}
