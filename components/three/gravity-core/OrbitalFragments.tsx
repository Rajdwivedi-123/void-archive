"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import type { GravityMotionProps } from "./types";

type FragmentData = {
  radius: number;
  angle: number;
  height: number;
  speed: number;
  scale: [number, number, number];
  rotation: [number, number, number];
  geometry: "octa" | "dodeca" | "tetra";
  primary: boolean;
};

type OrbitalFragmentsProps = GravityMotionProps & { tier: DeviceTier };

const artDirectedFragments: FragmentData[] = [
  { radius: 1.72, angle: 2.72, height: 0.64, speed: 0.026, scale: [0.22, 0.54, 0.13], rotation: [0.4, 0.2, 1.08], geometry: "octa", primary: true },
  { radius: 2.02, angle: 5.88, height: -0.38, speed: -0.019, scale: [0.38, 0.16, 0.13], rotation: [1.1, 0.28, 0.32], geometry: "tetra", primary: true },
  { radius: 1.43, angle: 0.52, height: 0.95, speed: 0.023, scale: [0.18, 0.42, 0.1], rotation: [0.18, 1.42, 0.64], geometry: "dodeca", primary: true },
  { radius: 2.2, angle: 2.46, height: 0.18, speed: 0.036, scale: [0.11, 0.22, 0.08], rotation: [0.7, 0.1, 1.25], geometry: "tetra", primary: false },
  { radius: 1.88, angle: 2.98, height: 1.12, speed: 0.031, scale: [0.09, 0.18, 0.08], rotation: [1.5, 0.5, 0.2], geometry: "octa", primary: false },
  { radius: 2.34, angle: 0.28, height: 0.36, speed: -0.028, scale: [0.16, 0.09, 0.08], rotation: [0.2, 1.1, 0.8], geometry: "dodeca", primary: false },
  { radius: 1.34, angle: 5.5, height: -0.86, speed: -0.035, scale: [0.08, 0.18, 0.06], rotation: [1.8, 0.4, 1.1], geometry: "tetra", primary: false },
  { radius: 2.18, angle: 5.72, height: -0.72, speed: -0.025, scale: [0.1, 0.11, 0.07], rotation: [0.6, 1.8, 0.1], geometry: "octa", primary: false },
  { radius: 1.62, angle: 3.26, height: 0.35, speed: 0.039, scale: [0.07, 0.16, 0.05], rotation: [1.1, 0.7, 1.8], geometry: "tetra", primary: false },
  { radius: 2.42, angle: 0.76, height: 1.18, speed: -0.021, scale: [0.09, 0.07, 0.05], rotation: [0.1, 1.4, 1.2], geometry: "dodeca", primary: false },
  { radius: 1.18, angle: 2.2, height: -0.54, speed: 0.042, scale: [0.06, 0.14, 0.045], rotation: [0.8, 0.2, 1.5], geometry: "octa", primary: false },
  { radius: 2.28, angle: 3.54, height: 0.76, speed: 0.027, scale: [0.08, 0.12, 0.05], rotation: [1.4, 1.1, 0.3], geometry: "tetra", primary: false },
];

export function OrbitalFragments({ activation, reducedMotion, scrollProgress, tier }: OrbitalFragmentsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const fragmentRefs = useRef<Array<THREE.Mesh | null>>([]);
  const forceToolsRef = useRef({
    inward: new THREE.Vector3(),
    up: new THREE.Vector3(0, 1, 0),
    targetQuaternion: new THREE.Quaternion(),
  });
  const count = tier === "desktop" ? 12 : tier === "tablet" ? 9 : 6;
  const fragments = useMemo(() => artDirectedFragments.slice(0, count), [count]);

  useFrame(({ clock }, delta) => {
    const progress = activation.current.fragments;
    const signaturePull = activation.current.compression;
    const spread = scrollProgress.current * 0.12;
    fragmentRefs.current.forEach((fragment, index) => {
      if (!fragment) return;
      const data = fragments[index];
      const time = reducedMotion ? 0 : clock.elapsedTime;
      const angle = data.angle + time * data.speed * progress;
      const proximityForce = THREE.MathUtils.clamp(1.72 / data.radius, 0.55, 1.35);
      const gravityResponse = data.primary ? proximityForce : proximityForce * (data.radius < 1.55 ? 0.62 : 0.24);
      const radius = data.radius + spread * (index % 2 ? 0.7 : -0.3) - signaturePull * 0.34 * gravityResponse;
      fragment.position.set(
        Math.cos(angle) * radius,
        data.height + Math.sin(angle * 1.45 + index * 0.6) * 0.055 * progress,
        Math.sin(angle) * radius * 0.68,
      );
      const reveal = 0.001 + progress * 0.999;
      const stretch = 1 + gravityResponse * (data.primary ? 0.055 : 0.012) + signaturePull * gravityResponse * (data.primary ? 0.24 : 0.075);
      fragment.scale.set(data.scale[0] * reveal, data.scale[1] * reveal * stretch, data.scale[2] * reveal);
      if (!reducedMotion) {
        fragment.rotation.x += delta * (0.026 + index * 0.002) * progress;
        fragment.rotation.y -= delta * (0.02 + (index % 3) * 0.008) * progress;
        if (data.primary || data.radius < 1.55) {
          const tools = forceToolsRef.current;
          tools.inward.copy(fragment.position).multiplyScalar(-1).normalize();
          tools.targetQuaternion.setFromUnitVectors(tools.up, tools.inward);
          fragment.quaternion.slerp(tools.targetQuaternion, (data.primary ? 0.012 : 0.004) + signaturePull * gravityResponse * 0.045);
        }
      }
    });
    if (groupRef.current) groupRef.current.rotation.z = -0.12 + scrollProgress.current * 0.035;
  });

  return (
    <group ref={groupRef}>
      {fragments.map((fragment, index) => (
        <mesh key={index} ref={(node) => { fragmentRefs.current[index] = node; }} rotation={fragment.rotation}>
          {fragment.geometry === "octa" && <octahedronGeometry args={[1, fragment.primary ? 1 : 0]} />}
          {fragment.geometry === "dodeca" && <dodecahedronGeometry args={[1, 0]} />}
          {fragment.geometry === "tetra" && <tetrahedronGeometry args={[1, fragment.primary ? 1 : 0]} />}
          <meshPhysicalMaterial
            color={fragment.primary ? (index === 1 ? "#777e81" : "#454b4e") : "#292e30"}
            metalness={0.96}
            roughness={fragment.primary ? 0.19 : 0.31}
            clearcoat={fragment.primary ? 0.45 : 0.12}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}
