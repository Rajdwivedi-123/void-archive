"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import { liquidMirrorFragmentShader, liquidMirrorVertexShader } from "./shaders/liquidMirrorShaders";

type ObjectTwoTeaserProps = {
  reducedMotion: boolean;
  scrollProgress: MutableRefObject<number>;
};

export function ObjectTwoTeaser({ reducedMotion, scrollProgress }: ObjectTwoTeaserProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uReveal: { value: 0 } }), []);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    if (!reducedMotion) timeRef.current += delta;
    const reveal = THREE.MathUtils.smoothstep(scrollProgress.current, 0.86, 0.98);
    materialRef.current.uniforms.uTime.value = timeRef.current;
    materialRef.current.uniforms.uReveal.value = reveal;
  });

  return (
    <group position={[4.72, 3.1, -116]}>
      <mesh scale={[0.72, 1.35, 1]}>
        <circleGeometry args={[1.78, 72]} />
        <shaderMaterial ref={materialRef} vertexShader={liquidMirrorVertexShader} fragmentShader={liquidMirrorFragmentShader} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-2.05, 0, -0.25]}><boxGeometry args={[0.32, 7.2, 0.55]} /><meshPhysicalMaterial color="#171b1d" metalness={0.94} roughness={0.22} clearcoat={0.16} /></mesh>
      <mesh position={[2.05, 0, -0.25]}><boxGeometry args={[0.32, 7.2, 0.55]} /><meshPhysicalMaterial color="#171b1d" metalness={0.94} roughness={0.22} clearcoat={0.16} /></mesh>
      <mesh position={[0, 3.45, -0.25]}><boxGeometry args={[4.4, 0.32, 0.55]} /><meshStandardMaterial color="#111416" metalness={0.9} roughness={0.28} /></mesh>
      <mesh position={[0, -3.45, -0.25]}><boxGeometry args={[4.4, 0.32, 0.55]} /><meshStandardMaterial color="#111416" metalness={0.9} roughness={0.28} /></mesh>
      <pointLight color="#aab5b8" intensity={1.2} distance={7} decay={2.4} position={[-2.8, 1.8, 2]} />
    </group>
  );
}
