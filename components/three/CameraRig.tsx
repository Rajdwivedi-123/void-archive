"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/hooks/useDeviceProfile";

type CameraRigProps = {
  reducedMotion: boolean;
  introComplete: boolean;
  scrollProgress: MutableRefObject<number>;
  tier: DeviceTier;
};

export function CameraRig({ reducedMotion, introComplete, scrollProgress, tier }: CameraRigProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport, pointer } = useThree();

  const hasCapturedRef = useRef(false);
  const basePosition = useMemo(() => new THREE.Vector3(tier === "mobile" ? 0 : 0.12, 2.2, tier === "mobile" ? 9.6 : 8.62), [tier]);

  useFrame((state) => {
    if (!groupRef.current || !introComplete) return;
    if (!hasCapturedRef.current) {
      groupRef.current.position.copy(state.camera.position);
      hasCapturedRef.current = true;
    }

    const responsive =
      viewport.width > 7 ? 0.045 : viewport.width > 4 ? 0.03 : 0.012;
    const targetX =
      reducedMotion || !introComplete ? 0 : pointer.x * responsive;
    const targetY =
      reducedMotion || !introComplete ? 0 : pointer.y * responsive * 0.45;

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      introComplete ? 0.05 : 0.02,
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      basePosition.y + targetY,
      introComplete ? 0.05 : 0.02,
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      basePosition.z - scrollProgress.current * (tier === "mobile" ? 0.3 : 0.72),
      introComplete ? 0.05 : 0.02,
    );

    state.camera.position.copy(groupRef.current.position);
    state.camera.lookAt(tier === "mobile" ? 0 : 0.18, 2.4 + scrollProgress.current * 0.08, -0.16);
  });

  return <group ref={groupRef} position={[0.15, 1.7, 8.2]} />;
}
