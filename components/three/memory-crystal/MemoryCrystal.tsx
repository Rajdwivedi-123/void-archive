"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { sampleArtifactLifecycle } from "@/artifacts/lifecycle";
import { memoryCrystalArtifact } from "@/artifacts/registry";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import {
  crystalFragmentShader,
  crystalVertexShader,
  memoryPlaneFragmentShader,
  memoryPlaneVertexShader,
} from "./shaders/memoryShaders";
import type { InspectionControlRef } from "@/artifacts/inspection";

type MemoryCrystalProps = {
  tier: DeviceTier;
  reducedMotion: boolean;
  hasFinePointer: boolean;
  scrollProgress: MutableRefObject<number>;
  inspection: InspectionControlRef;
};

type MemoryLayer = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  depth: number;
};

function createMemoryMonolithGeometry() {
  const sides = 7;
  const sections = [
    { y: -3.6, x: -0.22, z: 0.06, rx: 0.72, rz: 0.6 },
    { y: -2.25, x: 0.05, z: -0.04, rx: 1.18, rz: 0.83 },
    { y: -0.55, x: -0.14, z: 0.1, rx: 1.02, rz: 0.74 },
    { y: 1.25, x: 0.18, z: -0.08, rx: 1.25, rz: 0.88 },
    { y: 2.72, x: -0.12, z: 0.05, rx: 0.88, rz: 0.68 },
    { y: 3.75, x: 0.14, z: -0.12, rx: 0.25, rz: 0.2 },
  ];
  const positions: number[] = [];
  const indices: number[] = [];
  sections.forEach((section, sectionIndex) => {
    for (let side = 0; side < sides; side += 1) {
      const angle = (side / sides) * Math.PI * 2 + sectionIndex * 0.13;
      const irregularity = 1 + Math.sin(side * 2.71 + sectionIndex * 1.37) * 0.11;
      positions.push(
        section.x + Math.cos(angle) * section.rx * irregularity,
        section.y,
        section.z + Math.sin(angle) * section.rz * irregularity,
      );
    }
  });
  for (let section = 0; section < sections.length - 1; section += 1) {
    for (let side = 0; side < sides; side += 1) {
      const nextSide = (side + 1) % sides;
      const a = section * sides + side;
      const b = section * sides + nextSide;
      const c = (section + 1) * sides + nextSide;
      const d = (section + 1) * sides + side;
      indices.push(a, b, d, b, c, d);
    }
  }
  const bottomCenter = positions.length / 3;
  positions.push(sections[0].x, sections[0].y, sections[0].z);
  const topCenter = positions.length / 3;
  const last = sections[sections.length - 1];
  positions.push(last.x, last.y, last.z);
  for (let side = 0; side < sides; side += 1) {
    const nextSide = (side + 1) % sides;
    indices.push(bottomCenter, nextSide, side);
    const topOffset = (sections.length - 1) * sides;
    indices.push(topCenter, topOffset + side, topOffset + nextSide);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const monolithGeometry = createMemoryMonolithGeometry();
const memoryPlaneGeometry = new THREE.PlaneGeometry(2.35, 1.42, 12, 7);

const memoryLayers: MemoryLayer[] = [
  { position: [-0.12, -2.3, 0.28], rotation: [0.04, -0.2, -0.03], scale: [0.72, 0.68, 1], depth: 0.12 },
  { position: [0.08, -1.15, 0.08], rotation: [-0.03, 0.22, 0.04], scale: [0.83, 0.62, 1], depth: 0.28 },
  { position: [-0.14, 0.05, 0.34], rotation: [0.02, -0.31, -0.02], scale: [0.92, 0.7, 1], depth: 0.44 },
  { position: [0.16, 1.18, -0.02], rotation: [-0.05, 0.36, 0.025], scale: [0.82, 0.65, 1], depth: 0.58 },
  { position: [-0.1, 2.12, 0.2], rotation: [0.03, -0.18, -0.04], scale: [0.62, 0.55, 1], depth: 0.7 },
  { position: [0.12, 0.55, -0.4], rotation: [0.08, 0.52, 0.06], scale: [0.68, 0.5, 1], depth: 0.84 },
  { position: [-0.05, -0.45, -0.5], rotation: [-0.06, -0.56, -0.08], scale: [0.58, 0.48, 1], depth: 0.96 },
];

const fractureCurves = [
  [[-0.58, -3.15, 0.64], [-0.25, -1.82, 0.78], [-0.5, -0.62, 0.72]],
  [[0.44, -2.15, 0.7], [0.16, -0.72, 0.84], [0.42, 0.36, 0.72]],
  [[-0.72, -0.65, 0.62], [-0.38, 0.48, 0.83], [-0.62, 1.62, 0.68]],
  [[0.68, 0.08, 0.61], [0.4, 1.18, 0.82], [0.18, 2.42, 0.56]],
  [[-0.35, 1.55, 0.58], [-0.08, 2.28, 0.67], [-0.12, 3.18, 0.36]],
  [[0.14, -2.9, -0.62], [-0.2, -1.58, -0.78], [0.04, -0.32, -0.7]],
  [[-0.28, 0.28, -0.68], [0.05, 1.25, -0.82], [-0.18, 2.3, -0.59]],
] as Array<Array<[number, number, number]>>;

const fractureGeometries = fractureCurves.map((points, index) => {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
  return new THREE.TubeGeometry(curve, 22, index % 3 === 0 ? 0.018 : 0.01, 4, false);
});

const smoothRange = (value: number, from: number, to: number) => THREE.MathUtils.smoothstep(value, from, to);

export function MemoryCrystal({ tier, reducedMotion, hasFinePointer, scrollProgress, inspection }: MemoryCrystalProps) {
  const rootRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Group>(null);
  const outerMaterialRefs = useRef<Array<THREE.ShaderMaterial | null>>([]);
  const layerRefs = useRef<Array<THREE.Mesh | null>>([]);
  const layerMaterialRefs = useRef<Array<THREE.ShaderMaterial | null>>([]);
  const fractureMaterialRefs = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const signatureRef = useRef<THREE.Mesh>(null);
  const signatureMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const memoryLightRef = useRef<THREE.PointLight>(null);
  const pointerRef = useRef(new THREE.Vector2());
  const timeRef = useRef(0);
  const timeScaleRef = useRef(1);
  const { pointer } = useThree();
  const quality = memoryCrystalArtifact.quality[tier];
  const layerCount = quality.memoryLayers ?? 3;
  const fractureCount = quality.memoryFractures ?? 3;

  const outerUniforms = useMemo(() => Array.from({ length: 3 }, () => ({
    uTime: { value: 0 },
    uActivation: { value: 0 },
    uRecall: { value: 0 },
    uOpacity: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
  })), []);
  const layerUniforms = useMemo(() => memoryLayers.slice(0, layerCount).map((layer) => ({
    uTime: { value: 0 },
    uActivation: { value: 0 },
    uDepth: { value: layer.depth },
    uRecall: { value: 0 },
    uSignature: { value: 0 },
    uOpacity: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
  })), [layerCount]);
  const signatureUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uActivation: { value: 0 },
    uDepth: { value: 0.92 },
    uRecall: { value: 0 },
    uSignature: { value: 1 },
    uOpacity: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
  }), []);

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    const progress = scrollProgress.current;
    const lifecycle = sampleArtifactLifecycle(memoryCrystalArtifact, progress);
    const inspecting = inspection.current.active && inspection.current.artifactId === "006";
    const activation = Math.max(lifecycle.activation, inspecting ? 1 : 0);
    const inspectionAmount = Math.max(lifecycle.inspection, inspecting ? 1 : 0);
    const recallIn = smoothRange(progress, 0.963, 0.968);
    const recallOut = smoothRange(progress, 0.972, 0.976);
    const recall = Math.max(recallIn * (1 - recallOut), inspecting ? inspection.current.primary : 0);
    const pointerEnabled = tier === "desktop" && hasFinePointer && !reducedMotion;
    pointerRef.current.x = THREE.MathUtils.damp(pointerRef.current.x, inspecting ? inspection.current.pointerX : pointerEnabled ? pointer.x : 0, 2.2, delta);
    pointerRef.current.y = THREE.MathUtils.damp(pointerRef.current.y, inspecting ? inspection.current.pointerY : pointerEnabled ? pointer.y : 0, 2.2, delta);
    timeScaleRef.current = THREE.MathUtils.damp(timeScaleRef.current, reducedMotion ? 0 : recall > 0.35 ? 0.025 : 1, 3.4, delta);
    timeRef.current += delta * timeScaleRef.current;

    outerMaterialRefs.current.forEach((material) => {
      if (!material) return;
      material.uniforms.uTime.value = timeRef.current;
      material.uniforms.uActivation.value = activation;
      material.uniforms.uRecall.value = reducedMotion ? lifecycle.inspection * 0.35 : recall;
      material.uniforms.uOpacity.value = lifecycle.visible * (0.44 + lifecycle.activation * 0.42);
      material.uniforms.uPointer.value.copy(pointerRef.current).multiplyScalar(quality.pointerStrength);
    });

    layerMaterialRefs.current.forEach((material, index) => {
      if (!material) return;
      const staged = THREE.MathUtils.clamp(activation * 1.8 - index * 0.12, 0, 1);
      const stratumFocus = inspecting ? Math.max(0, 1 - Math.abs(memoryLayers[index].depth - inspection.current.primary) * 3.2) : 1;
      const sessionBias = inspection.current.sessionBias;
      const missingSpatialLayer = sessionBias > .72 && sessionBias < .9 && index === Math.min(2, layerCount - 1);
      material.uniforms.uTime.value = timeRef.current + index * 1.7;
      material.uniforms.uActivation.value = staged;
      material.uniforms.uRecall.value = reducedMotion ? lifecycle.inspection * 0.45 : recall;
      material.uniforms.uOpacity.value = missingSpatialLayer ? .025 : inspecting ? 0.18 + stratumFocus * 0.72 : 0.48 + inspectionAmount * 0.34;
      material.uniforms.uPointer.value.copy(pointerRef.current).multiplyScalar(quality.pointerStrength);
      const layer = layerRefs.current[index];
      if (layer) {
        const contradiction = index % 2 ? -1 : 1;
        layer.position.x = memoryLayers[index].position[0] + pointerRef.current.x * memoryLayers[index].depth * 0.055 * contradiction;
        const temporalMisorder = sessionBias > .32 && sessionBias < .54 ? (index % 2 ? -.08 : .08) : 0;
        layer.position.z = memoryLayers[index].position[2] + inspectionAmount * (index - layerCount / 2) * 0.018 + temporalMisorder + (inspecting ? (memoryLayers[index].depth - inspection.current.primary) * 0.32 : 0);
        layer.scale.x = memoryLayers[index].scale[0] * (sessionBias < .12 ? .92 : 1);
        layer.rotation.y = memoryLayers[index].rotation[1] + pointerRef.current.x * 0.025 * contradiction;
      }
    });

    fractureMaterialRefs.current.forEach((material, index) => {
      if (!material) return;
      const staged = THREE.MathUtils.clamp(lifecycle.entry * 2.2 - index * 0.13, 0, 1);
      const glint = reducedMotion ? 0.4 : Math.sin(timeRef.current * 0.42 + index * 1.8) * 0.5 + 0.5;
      material.opacity = staged * (0.035 + lifecycle.activation * (0.11 + glint * 0.12) + recall * 0.18);
    });

    if (signatureMaterialRef.current) {
      signatureMaterialRef.current.uniforms.uTime.value = timeRef.current;
      const classified = inspecting ? THREE.MathUtils.smoothstep(inspection.current.primary, 0.78, 0.94) : 0;
      signatureMaterialRef.current.uniforms.uActivation.value = reducedMotion ? inspectionAmount * 0.62 : Math.max(recall, classified);
      signatureMaterialRef.current.uniforms.uRecall.value = reducedMotion ? inspectionAmount * 0.45 : recall;
      signatureMaterialRef.current.uniforms.uOpacity.value = inspecting ? classified * 0.94 : reducedMotion ? 0.32 * lifecycle.inspection : recall * 0.92;
    }
    if (signatureRef.current) {
      signatureRef.current.visible = inspecting ? inspection.current.primary > 0.74 : reducedMotion ? lifecycle.inspection > 0.02 : recall > 0.01;
      signatureRef.current.position.x = -0.18 + pointerRef.current.x * -0.06;
    }
    if (memoryLightRef.current) {
      memoryLightRef.current.intensity = activation * (0.1 + inspectionAmount * 0.42 + recall * 0.3);
    }

    rootRef.current.visible = lifecycle.visible > 0.001 || inspecting;
    rootRef.current.scale.setScalar(0.9 + lifecycle.entry * 0.1);
    if (crystalRef.current) {
      crystalRef.current.rotation.y = THREE.MathUtils.damp(crystalRef.current.rotation.y, -0.12 + lifecycle.inspection * 0.035, 2.4, delta);
      crystalRef.current.position.y = THREE.MathUtils.damp(crystalRef.current.position.y, lifecycle.entry * 0.12, 2.1, delta);
    }
  });

  const bodies = [
    { position: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number], rotation: [0.02, -0.08, -0.035] as [number, number, number] },
    { position: [1.48, -0.65, -0.18] as [number, number, number], scale: [0.28, 0.72, 0.46] as [number, number, number], rotation: [-0.03, 0.22, 0.04] as [number, number, number] },
    { position: [-1.25, 1.1, -0.34] as [number, number, number], scale: [0.22, 0.48, 0.36] as [number, number, number], rotation: [0.06, -0.28, -0.025] as [number, number, number] },
  ];

  return (
    <group ref={rootRef} position={[4.2, 4.65, -350]} visible={false}>
      <group ref={crystalRef}>
        {bodies.slice(0, tier === "mobile" ? 2 : 3).map((body, index) => (
          <group key={index} position={body.position} scale={body.scale} rotation={body.rotation}>
            <mesh>
              <primitive attach="geometry" object={monolithGeometry} />
              {tier === "mobile" ? (
                <meshStandardMaterial
                  color={index === 0 ? "#aab4b0" : "#717b77"}
                  roughness={0.3}
                  metalness={0.12}
                  transparent
                  opacity={0.36}
                  depthWrite={false}
                  side={THREE.BackSide}
                />
              ) : (
                <meshPhysicalMaterial
                  color={index === 0 ? "#b3bcb8" : "#77817d"}
                  roughness={0.18}
                  metalness={0.08}
                  transmission={tier === "tablet" ? 0.52 : 0.68}
                  thickness={1.05}
                  ior={1.38}
                  attenuationColor="#85908c"
                  attenuationDistance={4.8}
                  transparent
                  opacity={0.3}
                  depthWrite={false}
                  side={THREE.BackSide}
                />
              )}
            </mesh>
            <mesh renderOrder={3}>
              <primitive attach="geometry" object={monolithGeometry} />
              <shaderMaterial
                ref={(material) => { outerMaterialRefs.current[index] = material; }}
                vertexShader={crystalVertexShader}
                fragmentShader={crystalFragmentShader}
                uniforms={outerUniforms[index]}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}

        {memoryLayers.slice(0, layerCount).map((layer, index) => (
          <mesh
            key={index}
            ref={(mesh) => { layerRefs.current[index] = mesh; }}
            position={layer.position}
            rotation={layer.rotation}
            scale={layer.scale}
            renderOrder={2}
          >
            <primitive attach="geometry" object={memoryPlaneGeometry} />
            <shaderMaterial
              ref={(material) => { layerMaterialRefs.current[index] = material; }}
              vertexShader={memoryPlaneVertexShader}
              fragmentShader={memoryPlaneFragmentShader}
              uniforms={layerUniforms[index]}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}

        <mesh ref={signatureRef} position={[-0.18, 0.42, 0.58]} rotation={[0.03, -0.72, -0.035]} scale={[1.18, 1.38, 1]} visible={false} renderOrder={5}>
          <primitive attach="geometry" object={memoryPlaneGeometry} />
          <shaderMaterial
            ref={signatureMaterialRef}
            vertexShader={memoryPlaneVertexShader}
            fragmentShader={memoryPlaneFragmentShader}
            uniforms={signatureUniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {fractureGeometries.slice(0, fractureCount).map((geometry, index) => (
          <mesh key={index} renderOrder={4}>
            <primitive attach="geometry" object={geometry} />
            <meshBasicMaterial
              ref={(material) => { fractureMaterialRefs.current[index] = material; }}
              color={index % 3 === 0 ? "#ecece4" : "#9ba6a3"}
              transparent
              opacity={0}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
        ))}

        <mesh position={[0.18, -0.25, -0.18]} rotation={[0.04, -0.1, 0.025]} scale={[0.24, 1.75, 0.2]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#111615" metalness={0.72} roughness={0.36} transparent opacity={0.76} />
        </mesh>
        <pointLight ref={memoryLightRef} color="#e6e6dc" intensity={0} distance={7} decay={2.35} position={[0.3, 0.7, 1.15]} />
      </group>
    </group>
  );
}
