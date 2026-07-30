"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { coreFragmentShader, coreVertexShader } from "./shaders/coreShaders";
import type { GravityMotionProps } from "./types";

export function CoreSphere({ activation, reducedMotion, scrollProgress }: GravityMotionProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
      uTime: { value: 0 },
      uActivation: { value: reducedMotion ? 1 : 0 },
      uScroll: { value: 0 },
      uMotion: { value: reducedMotion ? 0 : 1 },
      uCompression: { value: 0 },
  }), [reducedMotion]);

  useFrame(({ clock }, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
      materialRef.current.uniforms.uActivation.value = activation.current.core;
      materialRef.current.uniforms.uScroll.value = scrollProgress.current;
      materialRef.current.uniforms.uCompression.value = activation.current.compression;
    }
    if (coreRef.current && !reducedMotion) coreRef.current.rotation.y += delta * 0.035;
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.82, 6]} />
        <shaderMaterial ref={materialRef} vertexShader={coreVertexShader} fragmentShader={coreFragmentShader} uniforms={uniforms} />
      </mesh>
      <mesh scale={[0.48, 0.54, 0.5]}>
        <icosahedronGeometry args={[0.82, 3]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
}
