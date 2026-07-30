"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { ActivationState } from "./types";
import type { MutableRefObject } from "react";

type GravityCoreLightsProps = {
  activation: MutableRefObject<ActivationState>;
  reducedMotion: boolean;
};

export function GravityCoreLights({ activation, reducedMotion }: GravityCoreLightsProps) {
  const rimRef = useRef<THREE.PointLight>(null);
  const coreRef = useRef<THREE.PointLight>(null);
  const keyRef = useRef<THREE.RectAreaLight>(null);
  const edgeRef = useRef<THREE.RectAreaLight>(null);

  useFrame(({ clock }) => {
    const pulse = reducedMotion ? 1 : 0.94 + Math.sin(clock.elapsedTime * 0.58) * 0.06;
    if (rimRef.current) rimRef.current.intensity = activation.current.light * 5.8 * pulse;
    if (coreRef.current) coreRef.current.intensity = activation.current.energy * 0.72 * pulse;
    if (keyRef.current) keyRef.current.intensity = 4.3 + activation.current.light * 2.5;
    if (edgeRef.current) edgeRef.current.intensity = 2.2 + activation.current.light * 1.2;
  });

  return (
    <>
      <pointLight ref={rimRef} color="#dce3e5" intensity={0} distance={5.8} decay={2.3} position={[-2.2, 1.45, 1.7]} />
      <pointLight ref={coreRef} color="#91a0a5" intensity={0} distance={2.8} decay={2.5} position={[0.05, 0.05, 0.48]} />
      <rectAreaLight ref={keyRef} color="#e8eceb" intensity={6.8} width={0.34} height={3.6} position={[2.75, 1.4, 2.2]} rotation={[-0.2, -0.86, 0.04]} />
      <rectAreaLight ref={edgeRef} color="#7e8b90" intensity={3.4} width={0.22} height={2.4} position={[-2.65, -0.7, 1.1]} rotation={[0.18, 1.12, -0.1]} />
    </>
  );
}
