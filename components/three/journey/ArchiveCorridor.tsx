"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/hooks/useDeviceProfile";

type ArchiveCorridorProps = { tier: DeviceTier };

export function ArchiveCorridor({ tier }: ArchiveCorridorProps) {
  const ribCount = tier === "desktop" ? 20 : tier === "tablet" ? 15 : 11;
  const sideRibsRef = useRef<THREE.InstancedMesh>(null);
  const topRibsRef = useRef<THREE.InstancedMesh>(null);
  const seamRef = useRef<THREE.InstancedMesh>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const doors = useMemo(() => Array.from({ length: tier === "desktop" ? 8 : tier === "tablet" ? 6 : 4 }, (_, index) => ({
    side: index % 2 === 0 ? -1 : 1,
    z: -33 - index * 7.4,
  })), [tier]);
  const dust = useMemo(() => {
    const count = tier === "desktop" ? 84 : tier === "tablet" ? 48 : 26;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = 3.1 + ((index * 37) % 72) / 72 * 7.4;
      positions[index * 3 + 1] = 0.4 + ((index * 23) % 61) / 61 * 6.4;
      positions[index * 3 + 2] = -25 - ((index * 43) % count) / count * 66;
    }
    return positions;
  }, [tier]);

  useLayoutEffect(() => {
    if (!sideRibsRef.current || !topRibsRef.current || !seamRef.current) return;
    const dummy = dummyRef.current;
    for (let index = 0; index < ribCount; index += 1) {
      const z = -24 - index * (68 / Math.max(ribCount - 1, 1));
      dummy.position.set(2.72, 3.75, z);
      dummy.scale.set(1, 1, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      sideRibsRef.current.setMatrixAt(index * 2, dummy.matrix);
      dummy.position.x = 10.88;
      dummy.updateMatrix();
      sideRibsRef.current.setMatrixAt(index * 2 + 1, dummy.matrix);
      dummy.position.set(6.8, 7.38, z);
      dummy.updateMatrix();
      topRibsRef.current.setMatrixAt(index, dummy.matrix);
      dummy.position.set(6.8, 0.08, z);
      dummy.updateMatrix();
      seamRef.current.setMatrixAt(index, dummy.matrix);
    }
    sideRibsRef.current.instanceMatrix.needsUpdate = true;
    topRibsRef.current.instanceMatrix.needsUpdate = true;
    seamRef.current.instanceMatrix.needsUpdate = true;
    sideRibsRef.current.computeBoundingSphere();
    topRibsRef.current.computeBoundingSphere();
    seamRef.current.computeBoundingSphere();
  }, [ribCount]);

  return (
    <group>
      <mesh position={[6.8, -0.18, -58]}>
        <boxGeometry args={[8.2, 0.3, 72]} />
        <meshPhysicalMaterial color="#030405" metalness={0.82} roughness={0.34} clearcoat={0.12} />
      </mesh>
      <mesh position={[2.35, 3.6, -58]}>
        <boxGeometry args={[0.45, 7.4, 72]} />
        <meshStandardMaterial color="#050708" metalness={0.86} roughness={0.32} />
      </mesh>
      <mesh position={[11.25, 3.6, -58]}>
        <boxGeometry args={[0.45, 7.4, 72]} />
        <meshStandardMaterial color="#050708" metalness={0.86} roughness={0.32} />
      </mesh>
      <mesh position={[6.8, 7.72, -58]}>
        <boxGeometry args={[9.3, 0.42, 72]} />
        <meshStandardMaterial color="#030405" metalness={0.75} roughness={0.4} />
      </mesh>

      <instancedMesh ref={sideRibsRef} args={[undefined, undefined, ribCount * 2]}>
        <boxGeometry args={[0.48, 7.5, 0.72]} />
        <meshPhysicalMaterial color="#111517" metalness={0.92} roughness={0.26} clearcoat={0.15} />
      </instancedMesh>
      <instancedMesh ref={topRibsRef} args={[undefined, undefined, ribCount]}>
        <boxGeometry args={[8.6, 0.5, 0.72]} />
        <meshStandardMaterial color="#0d1112" metalness={0.88} roughness={0.28} />
      </instancedMesh>
      <instancedMesh ref={seamRef} args={[undefined, undefined, ribCount]}>
        <boxGeometry args={[2.5, 0.018, 0.028]} />
        <meshBasicMaterial color="#727d80" transparent opacity={0.2} toneMapped={false} />
      </instancedMesh>

      {doors.map((door, index) => (
        <group key={`${door.side}-${door.z}`} position={[6.8 + door.side * 4.18, 2.5, door.z]} rotation={[0, door.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[3.6, 4.8, 0.16]} />
            <meshStandardMaterial color="#080b0c" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.65, 0.1]}>
            <boxGeometry args={[2.2, 0.025, 0.025]} />
            <meshBasicMaterial color={index === doors.length - 1 ? "#8c7d72" : "#5b6669"} transparent opacity={0.34} toneMapped={false} />
          </mesh>
          <mesh position={[0, -1.95, 0.1]}>
            <boxGeometry args={[3.1, 0.08, 0.04]} />
            <meshBasicMaterial color="#252d2f" />
          </mesh>
        </group>
      ))}
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[dust, 3]} /></bufferGeometry>
        <pointsMaterial color="#7d8587" size={0.018} transparent opacity={0.1} depthWrite={false} sizeAttenuation />
      </points>
      <pointLight color="#8c999c" intensity={0.65} distance={13} decay={2.35} position={[4.2, 5.6, -42]} />
      <pointLight color="#6f7b7e" intensity={0.5} distance={12} decay={2.4} position={[9.6, 4.8, -67]} />
      {tier !== "mobile" && <pointLight color="#958c84" intensity={0.42} distance={11} decay={2.45} position={[4.6, 3.8, -86]} />}
    </group>
  );
}
