"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type CameraRigProps = {
  reducedMotion: boolean;
  introComplete: boolean;
};

export function CameraRig({ reducedMotion, introComplete }: CameraRigProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport, pointer } = useThree();

  const basePosition = useMemo(() => new THREE.Vector3(0.15, 1.7, 8.2), []);

  useFrame((state) => {
    if (!groupRef.current) return;

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
      basePosition.z,
      introComplete ? 0.05 : 0.02,
    );

    state.camera.position.copy(groupRef.current.position);
    state.camera.lookAt(0.05, 1.18, 0);
  });

  return <group ref={groupRef} position={[0.15, 1.7, 8.2]} />;
}
