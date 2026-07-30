"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import { CoreSphere } from "./CoreSphere";
import { GravityCoreLights } from "./GravityCoreLights";
import { GravityField } from "./GravityField";
import { GravityParticles } from "./GravityParticles";
import { GravityRings } from "./GravityRings";
import { OrbitalFragments } from "./OrbitalFragments";
import type { ActivationState } from "./types";

type GravityCoreProps = {
  active: boolean;
  reducedMotion: boolean;
  scrollProgress: React.MutableRefObject<number>;
  tier: DeviceTier;
  hasFinePointer: boolean;
};

const stableState: ActivationState = {
  outer: 1,
  orbitals: 1,
  core: 1,
  energy: 1,
  fragments: 1,
  field: 1,
  debris: 1,
  light: 1,
  compression: 0,
  sweep: 0,
};

export function GravityCore({ active, reducedMotion, scrollProgress, tier, hasFinePointer }: GravityCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const activation = useRef<ActivationState>(reducedMotion ? { ...stableState } : {
    outer: 0,
    orbitals: 0,
    core: 0,
    energy: 0,
    fragments: 0,
    field: 0,
    debris: 0,
    light: 0,
    compression: 0,
    sweep: 0,
  });
  const { pointer } = useThree();

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      Object.assign(activation.current, stableState);
      return;
    }

    const durationScale = tier === "mobile" ? 0.68 : tier === "tablet" ? 0.84 : 1;
    const timeline = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    timeline
      .to(activation.current, { outer: 1, light: 0.32, duration: 1.65 * durationScale })
      .to(activation.current, { orbitals: 1, duration: 2.15 * durationScale }, "-=0.55")
      .to(activation.current, { core: 1, light: 0.7, duration: 1.45 * durationScale }, "-=1.4")
      .to(activation.current, { energy: 1, duration: 1.5 * durationScale }, "-=0.85")
      .to(activation.current, { fragments: 1, duration: 1.85 * durationScale }, "-=1.05")
      .to(activation.current, { field: 1, light: 1, duration: 1.7 * durationScale }, "-=1.2")
      .to(activation.current, { debris: 1, duration: 1.5 * durationScale }, "-=1.15")
      .to(activation.current, { compression: 1, light: 0.24, duration: 0.82 * durationScale, ease: "power3.in" }, "+=0.35")
      .to(activation.current, { sweep: 1, duration: 1.28 * durationScale, ease: "power2.inOut" }, "<+0.08")
      .to(activation.current, { compression: 0, light: 1, duration: 1.65 * durationScale, ease: "power3.out" }, ">-0.24")
      .set(activation.current, { sweep: 0 });
    return () => { timeline.kill(); };
  }, [active, reducedMotion, tier]);

  useFrame(() => {
    if (!groupRef.current) return;
    const pointerEnabled = active && hasFinePointer && tier === "desktop" && !reducedMotion;
    const pointerX = pointerEnabled ? pointer.x * 0.045 : 0;
    const pointerY = pointerEnabled ? pointer.y * 0.025 : 0;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -0.07 + pointerX, 0.025);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointerY, 0.025);
    groupRef.current.position.x = tier === "mobile" ? 0 : 0.48;
    groupRef.current.position.y = 2.58 + scrollProgress.current * 0.08;
    const baseScale = tier === "mobile" ? 0.7 : tier === "tablet" ? 0.84 : 1;
    groupRef.current.scale.setScalar(baseScale * (1 + scrollProgress.current * 0.035));
  });

  const motionProps = { activation, reducedMotion, scrollProgress };
  return (
    <group ref={groupRef} position={[0.48, 2.58, 0]}>
      <GravityRings {...motionProps} />
      <CoreSphere {...motionProps} />
      <OrbitalFragments {...motionProps} tier={tier} />
      <GravityParticles {...motionProps} tier={tier} />
      <GravityField {...motionProps} />
      <GravityCoreLights activation={activation} reducedMotion={reducedMotion} />

      <group position={[0, -2.82, 0]}>
        <mesh>
          <cylinderGeometry args={[1.16, 1.42, 0.18, 64]} />
          <meshPhysicalMaterial color="#111315" metalness={0.9} roughness={0.22} clearcoat={0.35} />
        </mesh>
        <mesh position={[0, 0.105, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.72, 1.08, 64]} />
          <meshBasicMaterial color="#737c80" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.72, 1.08, 0.32, 48]} />
          <meshStandardMaterial color="#08090a" metalness={0.78} roughness={0.34} />
        </mesh>
      </group>
    </group>
  );
}
