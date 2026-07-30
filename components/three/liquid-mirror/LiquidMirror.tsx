"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import { liquidMirrorArtifact } from "@/artifacts/registry";
import { sampleArtifactLifecycle } from "@/artifacts/lifecycle";
import { liquidMirrorFragmentShader, liquidMirrorVertexShader } from "./shaders/liquidMirrorShaders";

type LiquidMirrorProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
  hasFinePointer: boolean;
  scrollProgress: MutableRefObject<number>;
};

export function LiquidMirror({ tier, reducedMotion, hasFinePointer, scrollProgress }: LiquidMirrorProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const lastProgressRef = useRef(scrollProgress.current);
  const echoRef = useRef(0);
  const surfacePointerRef = useRef(new THREE.Vector2());
  const reflectedPointerRef = useRef(new THREE.Vector2());
  const { pointer } = useThree();
  const quality = liquidMirrorArtifact.quality[tier];
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uReveal: { value: 0 },
    uActivation: { value: 0 },
    uReflection: { value: 0 },
    uInstability: { value: 0 },
    uInspection: { value: 0 },
    uSurfaceMotion: { value: reducedMotion ? liquidMirrorArtifact.reducedMotion.surfaceMotion : 1 },
    uEcho: { value: 0 },
    uLayers: { value: quality.reflectionLayers },
    uPointer: { value: new THREE.Vector2() },
    uReflectionOffset: { value: new THREE.Vector2() },
  }), [quality.reflectionLayers, reducedMotion]);

  useFrame((_, delta) => {
    if (!materialRef.current || !groupRef.current) return;
    const progress = scrollProgress.current;
    const lifecycle = sampleArtifactLifecycle(liquidMirrorArtifact, progress);
    const motionScale = reducedMotion ? liquidMirrorArtifact.reducedMotion.surfaceMotion : 1;
    timeRef.current += delta * motionScale;

    const pointerEnabled = hasFinePointer && tier === "desktop" && !reducedMotion;
    const targetX = pointerEnabled ? pointer.x * quality.pointerStrength : 0;
    const targetY = pointerEnabled ? pointer.y * quality.pointerStrength : 0;
    surfacePointerRef.current.x = THREE.MathUtils.damp(surfacePointerRef.current.x, targetX, 5.5, delta);
    surfacePointerRef.current.y = THREE.MathUtils.damp(surfacePointerRef.current.y, targetY, 5.5, delta);
    reflectedPointerRef.current.x = THREE.MathUtils.damp(reflectedPointerRef.current.x, -targetX, 1.15, delta);
    reflectedPointerRef.current.y = THREE.MathUtils.damp(reflectedPointerRef.current.y, targetY * 0.45, 0.9, delta);

    const velocity = Math.min(Math.abs(progress - lastProgressRef.current) / Math.max(delta, 0.001), 0.8);
    echoRef.current = THREE.MathUtils.damp(echoRef.current, velocity * 1.6, reducedMotion ? 12 : 0.72, delta);
    lastProgressRef.current = progress;

    const activation = lifecycle.activation;
    materialRef.current.uniforms.uTime.value = timeRef.current;
    materialRef.current.uniforms.uReveal.value = reducedMotion ? lifecycle.visible : THREE.MathUtils.smoothstep(activation, 0.02, 0.34);
    materialRef.current.uniforms.uActivation.value = activation;
    materialRef.current.uniforms.uReflection.value = THREE.MathUtils.smoothstep(activation, 0.3, 0.7);
    materialRef.current.uniforms.uInstability.value = THREE.MathUtils.smoothstep(activation, 0.58, 0.95);
    materialRef.current.uniforms.uInspection.value = lifecycle.inspection;
    materialRef.current.uniforms.uEcho.value = echoRef.current;
    materialRef.current.uniforms.uPointer.value.copy(surfacePointerRef.current);
    materialRef.current.uniforms.uReflectionOffset.value.copy(reflectedPointerRef.current).addScalar((progress - 0.94) * 0.42);

    groupRef.current.visible = lifecycle.visible > 0.001;
    groupRef.current.scale.setScalar(0.94 + lifecycle.entry * 0.06);
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, -0.035 + lifecycle.inspection * 0.055, 4.2, delta);
  });

  return (
    <group ref={groupRef} position={[4.72, 3.2, -115.72]} visible={false}>
      <mesh scale={[1, 1, 1]}>
        <planeGeometry args={[4.15, 6.15, quality.membraneSegments, quality.membraneSegments]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={liquidMirrorVertexShader}
          fragmentShader={liquidMirrorFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
