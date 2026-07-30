"use client";

import { useMemo } from "react";
import * as THREE from "three";

type LightingProps = {
  reducedMotion: boolean;
};

export function Lighting({ reducedMotion }: LightingProps) {
  const ambient = useMemo(() => new THREE.Color("#121212"), []);

  return (
    <>
      <ambientLight color={ambient} intensity={0.65} />
      <directionalLight
        color="#f3f0ea"
        intensity={reducedMotion ? 1.1 : 1.45}
        position={[4, 6, 6]}
        castShadow={false}
      />
      <pointLight color="#bcb2a5" intensity={1.2} position={[-3, 2, 3]} />
      <hemisphereLight color="#f7f2eb" groundColor="#060606" intensity={0.8} />
    </>
  );
}
