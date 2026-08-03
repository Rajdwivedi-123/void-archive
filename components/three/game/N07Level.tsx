"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { NexusInteractionId } from "@/game/gameTypes";
import type { N07Area, N07LevelProgress } from "@/game/n07Level";

const areaOrder: N07Area[] = ["threshold", "reconstruction", "causal", "missing", "observer", "exterior"];

function Volume({ id, position, size = [2.4, 3, 2.1] }: { id: NexusInteractionId; position: [number, number, number]; size?: [number, number, number] }) {
  return <mesh position={position} userData={{ interactionId: id }}><boxGeometry args={size} /><meshBasicMaterial transparent opacity={.001} depthWrite={false} /></mesh>;
}

function Seam({ position, scale, opacity = .28 }: { position: [number, number, number]; scale: [number, number, number]; opacity?: number }) {
  return <mesh position={position}><boxGeometry args={scale} /><meshBasicMaterial color="#d7dfdd" transparent opacity={opacity} toneMapped={false} /></mesh>;
}

function Frame({ z, split = 0 }: { z: number; split?: number }) {
  return <group position={[split, 0, z]}>
    <mesh position={[-5.8, 3.4, 0]}><boxGeometry args={[.55, 7, .75]} /><meshStandardMaterial color="#090d0e" metalness={.94} roughness={.26} /></mesh>
    <mesh position={[5.8, 3.4, 0]}><boxGeometry args={[.55, 7, .75]} /><meshStandardMaterial color="#090d0e" metalness={.94} roughness={.26} /></mesh>
    <mesh position={[0, 6.75, 0]}><boxGeometry args={[12.2, .45, .75]} /><meshStandardMaterial color="#0b1011" metalness={.94} roughness={.25} /></mesh>
    <Seam position={[0, 6.48, .4]} scale={[8.5, .035, .03]} opacity={.24} />
  </group>;
}

function AreaShell({ z, length = 17, children }: { z: number; length?: number; children: React.ReactNode }) {
  return <group>
    <mesh position={[0, -.2, z]}><boxGeometry args={[22, .4, length]} /><meshPhysicalMaterial color="#080c0d" metalness={.93} roughness={.25} /></mesh>
    <mesh position={[-10.6, 4.3, z]}><boxGeometry args={[.5, 8.8, length]} /><meshStandardMaterial color="#070a0b" metalness={.9} roughness={.34} /></mesh>
    <mesh position={[10.6, 4.3, z]}><boxGeometry args={[.5, 8.8, length]} /><meshStandardMaterial color="#070a0b" metalness={.9} roughness={.34} /></mesh>
    {children}
  </group>;
}

function ThresholdPassage({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <AreaShell z={9} length={14}>
    <Frame z={14} /><Frame z={9} split={-.12} /><Frame z={4} split={.18} />
    <pointLight color="#aab6b7" intensity={4.5} position={[0, 3, 10]} distance={11} />
    <mesh position={[0, 3.1, 3.75]}><boxGeometry args={[8.8, 6.2, .12]} /><meshBasicMaterial color="#b7c1bf" transparent opacity={.055} /></mesh>
    <Seam position={[0, 3.1, 3.84]} scale={[.035, 5.1, .02]} opacity={.7} />
    <Volume id="n07-cross-threshold" position={[0, 2.8, 3.2]} size={[7.5, 5.5, 2]} />
  </AreaShell>;
}

function ReconstructedArchive({ visible, vector, solved, returning }: { visible: boolean; vector: N07LevelProgress["vector"]; solved: boolean; returning: boolean }) {
  const baseRotation = vector === "temporal" ? .12 : vector === "spatial" ? -.24 : vector === "mnemonic" ? .05 : -.08;
  const rotation = baseRotation * (returning ? -1.35 : 1);
  if (!visible) return null;
  return <AreaShell z={-2} length={18}>
    <pointLight color="#9aa9aa" intensity={5.5} position={[-5, 4, 1]} distance={15} />
    <spotLight color="#d2d9d7" intensity={8} position={[6, 10, 1]} angle={.28} penumbra={.9} distance={25} />
    {[-7, -3.5, 0, 3.5, 7].map((x, i) => <group key={x} position={[x, 0, -3 + (i % 2) * 2]} rotation={[0, rotation * (i - 2), 0]}>
      <mesh position={[0, 2.2, 0]}><boxGeometry args={[1.6, 4.4, .18]} /><meshPhysicalMaterial color={i === 2 ? "#273033" : "#111719"} metalness={.92} roughness={.23} transparent opacity={i === 2 ? .72 : 1} /></mesh>
      <Seam position={[0, 2.2, .11]} scale={[.8, .025, .02]} opacity={i === 2 ? .65 : .2} />
    </group>)}
    {vector === "temporal" && [-.7, 0, .7].map((z, i) => <mesh key={z} position={[0, 4.8, -1 + z]} rotation={[Math.PI / 2, i * .18, 0]}><torusGeometry args={[2.5 + i * .45, .045, 8, 64]} /><meshBasicMaterial color="#c4cdcb" transparent opacity={.34 - i * .08} toneMapped={false} /></mesh>)}
    {vector === "spatial" && <group position={[0, 3.2, -2]} rotation={[0, 0, -.2]}><Seam position={[0, 0, 0]} scale={[8.5, .04, .03]} opacity={.42} /><Seam position={[1.8, 0, 0]} scale={[.04, 5.5, .03]} opacity={.32} /></group>}
    {vector === "mnemonic" && [-1.2, 0, 1.2].map((x, i) => <mesh key={x} position={[x, 4.2, -2.8 - i * .32]}><planeGeometry args={[3.8, 5.5]} /><meshBasicMaterial color="#aeb9b8" transparent opacity={.04 + i * .025} depthWrite={false} /></mesh>)}
    {vector === "adaptive" && <group position={[0, 4.2, -2.5]}>{Array.from({ length: 7 }, (_, i) => <Seam key={i} position={[(i - 3) * .8, Math.sin(i * 1.4) * 1.5, 0]} scale={[.04, 1.4 + (i % 3), .03]} opacity={.18 + i * .045} />)}</group>}
    <group position={[-4, 0, -7.2]}><mesh position={[0, 2.5, 0]}><boxGeometry args={[3.6, 5, .45]} /><meshStandardMaterial color="#101617" metalness={.9} roughness={.28} /></mesh><Seam position={[0, 2.7, .26]} scale={[2.3, .04, .02]} opacity={.26} /><Volume id="n07-topology-visible" position={[0, 2.4, .7]} size={[3.8, 4.8, 2]} /></group>
    <group position={[4, 0, -7.2]}><mesh position={[0, 2.5, 0]}><boxGeometry args={[3.6, 5, .18]} /><meshBasicMaterial color="#010202" transparent opacity={.92} /></mesh><Seam position={[0, 2.6, .12]} scale={[.025, 3.9, .02]} opacity={solved ? .86 : .5} /><Volume id="n07-topology-missing" position={[0, 2.4, .7]} size={[3.8, 4.8, 2]} /></group>
    {returning && <group position={[0, .08, -8.4]} rotation={[-Math.PI / 2, 0, -.18]}>{[1.6, 2.8, 4].map((radius, index) => <mesh key={radius}><ringGeometry args={[radius, radius + .025, 48]} /><meshBasicMaterial color="#c2cdcb" transparent opacity={.36 - index * .08} toneMapped={false} /></mesh>)}</group>}
  </AreaShell>;
}

function CausalCorridor({ visible, count }: { visible: boolean; count: number }) {
  const events: { id: NexusInteractionId; x: number }[] = [
    { id: "n07-causal-pre", x: -6 }, { id: "n07-causal-signal", x: -2 }, { id: "n07-causal-containment", x: 2 }, { id: "n07-causal-arrival", x: 6 },
  ];
  if (!visible) return null;
  return <AreaShell z={-19} length={17}>
    <Frame z={-12} /><Frame z={-19} /><Frame z={-26} />
    <pointLight color="#87989b" intensity={4} position={[0, 3, -18]} distance={14} />
    {events.map((event, i) => <group key={event.id} position={[event.x, 0, -20]}>
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[.55, .9, 3, 8]} /><meshPhysicalMaterial color={i < count ? "#303a3c" : "#0c1112"} metalness={.95} roughness={.2} emissive="#788588" emissiveIntensity={i < count ? .14 : .025} /></mesh>
      <mesh position={[0, 3.15, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.7 + i * .08, .035, 6, 40]} /><meshBasicMaterial color="#c0cac9" transparent opacity={i === count ? .65 : .2} toneMapped={false} /></mesh>
      <Volume id={event.id} position={[0, 2, .5]} />
    </group>)}
    <Seam position={[0, .05, -20]} scale={[16, .03, .04]} opacity={.32} />
  </AreaShell>;
}

function MissingSector({ visible, route, secret }: { visible: boolean; route: N07LevelProgress["route"]; secret: boolean }) {
  if (!visible) return null;
  return <AreaShell z={-38} length={18}>
    <pointLight color="#718184" intensity={3.4} position={[0, 2, -33]} distance={12} />
    <mesh position={[0, 3.4, -38]}><cylinderGeometry args={[4.7, 6.2, 7, 12, 1, true]} /><meshPhysicalMaterial color="#090d0e" metalness={.94} roughness={.28} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, 3.3, -39]}><sphereGeometry args={[2.3, 32, 20]} /><meshBasicMaterial color="#000000" /></mesh>
    <group position={[-5.7, 0, -43]} rotation={[0, .15, 0]}><Frame z={0} /><Seam position={[0, 3.2, .45]} scale={[.035, 4.8, .03]} opacity={route === "archive-model" ? .8 : .26} /><Volume id="n07-route-model" position={[0, 2.8, 1]} size={[5, 5.5, 2]} /></group>
    <group position={[5.7, 0, -43]} rotation={[0, -.15, 0]}><Frame z={0} /><Seam position={[0, 3.2, .45]} scale={[2.9, .035, .03]} opacity={route === "contradiction" ? .8 : .26} /><Volume id="n07-route-contradiction" position={[0, 2.8, 1]} size={[5, 5.5, 2]} /></group>
    <group position={[8.8, 1.4, -34.5]} rotation={[0, -.55, 0]}><mesh><boxGeometry args={[.18, 2.8, 2.1]} /><meshStandardMaterial color="#101718" metalness={.95} roughness={.2} /></mesh><Seam position={[-.1, 0, 0]} scale={[.02, 1.8, 1.2]} opacity={secret ? .65 : .18} /><Volume id="n07-secret" position={[-.7, 0, 0]} size={[1.8, 3, 2.5]} /></group>
  </AreaShell>;
}

function ObserverChamber({ visible, choice, route, reducedMotion }: { visible: boolean; choice: N07LevelProgress["observerChoice"]; route: N07LevelProgress["route"]; reducedMotion: boolean }) {
  const echo = useRef<THREE.Group>(null);
  useFrame((state) => { if (echo.current && !reducedMotion) echo.current.rotation.y = Math.sin(state.clock.elapsedTime * .2) * .08; });
  if (!visible) return null;
  return <AreaShell z={-57} length={17}>
    <spotLight color="#d0d7d5" intensity={10} position={[0, 12, -52]} angle={.25} penumbra={.95} distance={28} />
    <group ref={echo} position={[route === "contradiction" ? 1.1 : 0, 4.2, -59]} rotation={[0, 0, route === "contradiction" ? -.14 : 0]}>{[2.1, 3.8, 5.6].map((r, i) => <mesh key={r} rotation={[Math.PI / 2 + i * .32, i * .5, 0]}><torusGeometry args={[r, .055 + i * .018, 8, 64]} /><meshBasicMaterial color="#aab6b6" transparent opacity={.4 - i * .08} toneMapped={false} /></mesh>)}</group>
    <group position={[-3.4, 0, -53]}><mesh position={[0, 1.25, 0]}><boxGeometry args={[2.8, 2.5, 1.8]} /><meshPhysicalMaterial color="#101617" metalness={.94} roughness={.22} /></mesh><Seam position={[0, 1.7, .92]} scale={[1.7, .55, .02]} opacity={choice === "direct" ? .7 : .3} /><Volume id="n07-observer-direct" position={[0, 1.5, .7]} /></group>
    <group position={[3.4, 0, -53]}><mesh position={[0, 1.25, 0]}><boxGeometry args={[2.8, 2.5, 1.8]} /><meshPhysicalMaterial color="#101617" metalness={.94} roughness={.22} /></mesh><Seam position={[0, 1.7, .92]} scale={[1.7, .08, .02]} opacity={choice === "wait" ? .7 : .3} /><Volume id="n07-observer-wait" position={[0, 1.5, .7]} /></group>
    {choice && <group position={[0, 0, -64]}><Frame z={0} /><Volume id="n07-traversal" position={[0, 2.8, 1]} size={[7, 5.5, 2]} /></group>}
  </AreaShell>;
}

function ArchiveExterior({ visible, completed }: { visible: boolean; completed: boolean }) {
  const towers = useMemo(() => Array.from({ length: 13 }, (_, i) => ({ x: (i % 2 ? 1 : -1) * (7 + (i % 4) * 3.2), y: 5 + (i % 5) * 3.1, z: -72 - i * 2.7 })), []);
  if (!visible) return null;
  return <group>
    <color attach="background" args={["#010202"]} /><fog attach="fog" args={["#010202", 12, 75]} />
    <mesh position={[0, -.2, -75]}><boxGeometry args={[40, .4, 30]} /><meshPhysicalMaterial color="#070a0b" metalness={.9} roughness={.32} /></mesh>
    <hemisphereLight color="#859395" groundColor="#010202" intensity={.35} /><directionalLight color="#d7dcd9" intensity={2.8} position={[-12, 22, -55]} />
    {towers.map((tower, i) => <mesh key={i} position={[tower.x, tower.y, tower.z]}><boxGeometry args={[3.5 + (i % 3), tower.y * 2, 4]} /><meshStandardMaterial color="#0b1011" metalness={.9} roughness={.34} emissive="#455052" emissiveIntensity={.018} /></mesh>)}
    <group position={[0, 0, -77]}><mesh position={[0, 1.5, 0]}><cylinderGeometry args={[1.2, 2.1, 3, 7]} /><meshPhysicalMaterial color="#141b1d" metalness={.95} roughness={.2} /></mesh><Seam position={[0, 2.25, 1.55]} scale={[1.4, .06, .03]} opacity={.58} /></group>
    {!completed && <><Volume id="n07-final-stabilize" position={[-2.5, 1.6, -75]} /><Volume id="n07-final-preserve" position={[2.5, 1.6, -75]} /></>}
    {completed && <Volume id="n07-return" position={[0, 2.2, -72]} size={[5.5, 4.5, 2.5]} />}
  </group>;
}

export function N07Level({ progress, reducedMotion }: { progress: N07LevelProgress; reducedMotion: boolean }) {
  const current = areaOrder.indexOf(progress.area);
  const visible = (area: N07Area) => Math.abs(areaOrder.indexOf(area) - current) <= 1;
  return <group>
    <color attach="background" args={["#010203"]} /><fog attach="fog" args={["#010203", 9, reducedMotion ? 38 : 48]} />
    <ambientLight color="#657174" intensity={.2} /><hemisphereLight color="#7d898b" groundColor="#010202" intensity={.34} />
    <ThresholdPassage visible={visible("threshold")} />
    <ReconstructedArchive visible={visible("reconstruction")} vector={progress.vector} solved={progress.topologySolved} returning={progress.returnVisits > 0} />
    <CausalCorridor visible={visible("causal")} count={progress.causalSequence.length} />
    <MissingSector visible={visible("missing")} route={progress.route} secret={progress.secretFound} />
    <ObserverChamber visible={visible("observer")} choice={progress.observerChoice} route={progress.route} reducedMotion={reducedMotion} />
    <ArchiveExterior visible={visible("exterior")} completed={progress.completed} />
  </group>;
}
