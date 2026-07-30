"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { fieldFragmentShader, fieldVertexShader } from "./shaders/fieldShaders";
import type { GravityMotionProps } from "./types";

export function GravityField({ activation, reducedMotion, scrollProgress }: GravityMotionProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const innerMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const rippleRefs = useRef<Array<THREE.Mesh | null>>([]);
  const uniforms = useMemo(() => ({
      uTime: { value: 0 },
      uStrength: { value: reducedMotion ? 0.42 : 0 },
      uMotion: { value: reducedMotion ? 0 : 1 },
      uEvent: { value: 0 },
  }), [reducedMotion]);
  const innerUniforms = useMemo(() => ({
      uTime: { value: 0 },
      uStrength: { value: reducedMotion ? 0.5 : 0 },
      uMotion: { value: reducedMotion ? 0 : 1 },
      uEvent: { value: 0 },
  }), [reducedMotion]);
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
      materialRef.current.uniforms.uStrength.value = activation.current.field * (0.48 + scrollProgress.current * 0.16);
      materialRef.current.uniforms.uEvent.value = activation.current.compression;
    }
    if (innerMaterialRef.current) {
      innerMaterialRef.current.uniforms.uTime.value = clock.elapsedTime * 0.82;
      innerMaterialRef.current.uniforms.uStrength.value = activation.current.field * (1.12 + activation.current.compression * 0.74);
      innerMaterialRef.current.uniforms.uEvent.value = activation.current.compression;
    }
    rippleRefs.current.forEach((ripple, index) => {
      if (!ripple) return;
      const event = activation.current.compression;
      ripple.scale.setScalar(0.78 + event * (0.34 + index * 0.12));
      const rippleMaterial = ripple.material as THREE.MeshBasicMaterial;
      rippleMaterial.opacity = event * (index === 0 ? 0.18 : 0.1);
    });
  });

  return (
    <group>
      <mesh scale={[1.03, 0.96, 1.01]}>
        <sphereGeometry args={[2.34, 48, 32]} />
        <shaderMaterial ref={materialRef} vertexShader={fieldVertexShader} fragmentShader={fieldFragmentShader} uniforms={uniforms} transparent depthWrite={false} blending={THREE.NormalBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh scale={[1.04, 0.93, 1.08]} rotation={[0.12, -0.18, 0.06]}>
        <icosahedronGeometry args={[1.08, 5]} />
        <shaderMaterial ref={innerMaterialRef} vertexShader={fieldVertexShader} fragmentShader={fieldFragmentShader} uniforms={innerUniforms} transparent depthWrite={false} blending={THREE.NormalBlending} side={THREE.BackSide} />
      </mesh>
      {[0, 1].map((index) => (
        <mesh key={index} ref={(node) => { rippleRefs.current[index] = node; }} rotation={index === 0 ? [1.12, 0.2, 0.45] : [0.35, 1.24, -0.28]}>
          <torusGeometry args={[1.48 + index * 0.24, 0.012, 6, 96]} />
          <meshBasicMaterial color="#c0c8ca" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}
