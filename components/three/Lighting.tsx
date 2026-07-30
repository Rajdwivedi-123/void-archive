"use client";

import { useMemo } from "react";
import * as THREE from "three";

type LightingProps = {
  reducedMotion: boolean;
};

export function Lighting({ reducedMotion }: LightingProps) {
  const ambient = useMemo(() => new THREE.Color("#0b0b0b"), []);

  return (
    <>
      <ambientLight color={ambient} intensity={0.45} />
      <directionalLight
        color="#f1e8dc"
        intensity={reducedMotion ? 0.7 : 1.15}
        position={[6, 8, 6]}
        castShadow={false}
      />
      <spotLight
        color="#f6efe6"
        intensity={reducedMotion ? 0.6 : 1}
        position={[0, 8, -6]}
        angle={0.28}
        penumbra={0.35}
        distance={28}
        castShadow={false}
      />
      <pointLight color="#b3a79b" intensity={0.8} position={[-3, 4, 3]} />
      <pointLight color="#59504a" intensity={0.45} position={[2, 2.2, 1]} />
      <hemisphereLight color="#f5efe5" groundColor="#050505" intensity={0.35} />
    </>
  );
}
