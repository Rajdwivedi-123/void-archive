"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type CameraRigProps = {
  reducedMotion: boolean;
};

export function CameraRig({ reducedMotion }: CameraRigProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport, pointer } = useThree();

  const basePosition = useMemo(() => new THREE.Vector3(0, 0.6, 7.6), []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const responsive =
      viewport.width > 7 ? 0.12 : viewport.width > 4 ? 0.08 : 0.04;
    const targetX = reducedMotion ? 0 : pointer.x * responsive;
    const targetY = reducedMotion ? 0.18 : pointer.y * responsive * 0.45 + 0.18;

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      0.06,
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.06,
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      basePosition.z,
      0.06,
    );

    state.camera.position.copy(
      groupRef.current.position.clone().add(new THREE.Vector3(0, 0, 0)),
    );
    state.camera.lookAt(0, 0.8, 0);
  });

  return <group ref={groupRef} position={[0, 0.6, 7.6]} />;
}
