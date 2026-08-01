"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { FacilityProgress, FacilityRoom, NexusInteractionId } from "@/game/gameTypes";
import type { RealitySnapshot } from "@/reality/realityTypes";
import { ArchiveNexus } from "./ArchiveNexus";

type WorldProps = {
  room: FacilityRoom;
  progress: FacilityProgress;
  reducedMotion: boolean;
  discoveredCount: number;
  session: RealitySnapshot;
  gateOpening: boolean;
  scanner: boolean;
};

function InteractionVolume({ id, position, size }: { id: NexusInteractionId; position: [number, number, number]; size: [number, number, number] }) {
  return <mesh position={position} userData={{ interactionId: id }}><boxGeometry args={size} /><meshBasicMaterial transparent opacity={.001} depthWrite={false} /></mesh>;
}

function Chamber({ floor = [24, 34], fog = 48, children }: { floor?: [number, number]; fog?: number; children: React.ReactNode }) {
  return <group>
    <color attach="background" args={["#010203"]} />
    <fog attach="fog" args={["#010203", 10, fog]} />
    <hemisphereLight color="#929fa2" groundColor="#030405" intensity={.52} />
    <ambientLight color="#728085" intensity={.27} />
    <directionalLight color="#d3d9d7" intensity={2.35} position={[-8, 18, 10]} />
    <mesh position={[0, -.23, -2]}><boxGeometry args={[floor[0], .46, floor[1]]} /><meshPhysicalMaterial color="#0d1113" metalness={.9} roughness={.28} /></mesh>
    {children}
  </group>;
}

function Edge({ position, scale, opacity = .28 }: { position: [number, number, number]; scale: [number, number, number]; opacity?: number }) {
  return <mesh position={position}><boxGeometry args={scale} /><meshBasicMaterial color="#b5c0c1" transparent opacity={opacity} toneMapped={false} /></mesh>;
}

function Portal({ id, position, rotation = 0, open = false }: { id: NexusInteractionId; position: [number, number, number]; rotation?: number; open?: boolean }) {
  return <group position={position} rotation={[0, rotation, 0]}>
    <mesh position={[-1.65, 2.9, 0]}><boxGeometry args={[1.35, 6, 1.2]} /><meshPhysicalMaterial color="#080b0c" metalness={.91} roughness={.27} /></mesh>
    <mesh position={[1.65, 2.9, 0]}><boxGeometry args={[1.35, 6, 1.2]} /><meshPhysicalMaterial color="#080b0c" metalness={.91} roughness={.27} /></mesh>
    <Edge position={[0, 5.8, .63]} scale={[3.9, .055, .04]} opacity={open ? .62 : .28} />
    <Edge position={[0, 3.1, .64]} scale={[.035, 4.2, .04]} opacity={open ? .54 : .17} />
    <InteractionVolume id={id} position={[0, 3, 1]} size={[4.3, 6, 2.2]} />
  </group>;
}

function RecordVault({ reducedMotion, progress, session }: { reducedMotion: boolean; progress: FacilityProgress; session: RealitySnapshot }) {
  const rails = useRef<THREE.Group>(null);
  useFrame((state) => { if (rails.current && !reducedMotion) rails.current.position.y = 10 + Math.sin(state.clock.elapsedTime * .22) * .55; state.invalidate(); });
  const slabs = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ x: (i % 6 - 2.5) * 2.5, y: 4 + (i % 5) * 3.1, z: -15 + Math.floor(i / 6) * 7.2, h: 2.1 + (i % 3) * .7 })), []);
  return <Chamber floor={[23, 37]} fog={55}>
    <spotLight color="#c3cdcd" intensity={15} position={[-5, 17, 7]} angle={.34} penumbra={.88} distance={44} />
    <spotLight color="#88979a" intensity={9} position={[8, 11, -8]} angle={.3} penumbra={.9} distance={34} />
    <pointLight color="#87979a" intensity={7} position={[0, 4, 3]} distance={15} />
    <group ref={rails}>{[-7.8, 0, 7.8].map((x) => <group key={x}><mesh position={[x, 0, -5]}><boxGeometry args={[.13, 30, .28]} /><meshStandardMaterial color="#262e30" metalness={.95} roughness={.2} /></mesh><Edge position={[x, 0, -4.8]} scale={[.025, 25, .025]} opacity={.3} /></group>)}</group>
    {slabs.map((slab, i) => <group key={i} position={[slab.x, slab.y, slab.z]} rotation={[0, (i % 2 ? -.04 : .035), 0]}><mesh><boxGeometry args={[1.45, slab.h, .08]} /><meshPhysicalMaterial color={i % 7 === 0 && session.archetype === "mnemonist" ? "#303638" : "#13191a"} metalness={.9} roughness={.24} emissive="#263033" emissiveIntensity={i % 4 === 0 ? .08 : .025} /></mesh><Edge position={[0, 0, .05]} scale={[.7, .02, .015]} opacity={i % 4 === 0 ? .55 : .18} /></group>)}
    <group position={[0, 0, 1.8]}>
      <mesh position={[0, 1.05, 0]} rotation={[-.16, 0, 0]}><boxGeometry args={[5.2, 2.1, 2.4]} /><meshPhysicalMaterial color="#0b0f10" metalness={.92} roughness={.24} /></mesh>
      <Edge position={[0, 2.1, -.42]} scale={[3.7, 1.05, .035]} opacity={.34 + progress.recordSearches.length * .035} />
      <InteractionVolume id="record-search" position={[0, 1.5, .3]} size={[5.4, 3, 3]} />
    </group>
    <Portal id="route-observation-deck" position={[-6.8, 0, -12.5]} rotation={.08} open={progress.discoveredRooms.includes("observation-deck")} />
    <Portal id="return-nexus" position={[7.2, 0, 10.8]} rotation={Math.PI} open />
    <mesh position={[0, 21, -19]}><boxGeometry args={[19, 1.1, 3]} /><meshStandardMaterial color="#060809" metalness={.88} roughness={.34} /></mesh>
  </Chamber>;
}

function SignalRoom({ reducedMotion, progress, session }: { reducedMotion: boolean; progress: FacilityProgress; session: RealitySnapshot }) {
  const dish = useRef<THREE.Group>(null);
  const wave = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!reducedMotion && dish.current) dish.current.rotation.z += delta * .055;
    if (!reducedMotion && wave.current) wave.current.rotation.y = Math.sin(state.clock.elapsedTime * .34) * .22;
    state.invalidate();
  });
  return <Chamber floor={[25, 34]} fog={48}>
    <spotLight color="#c8d1d0" intensity={11} position={[0, 18, 2]} angle={.24} penumbra={.9} distance={42} />
    <pointLight color="#718184" intensity={4.5} position={[-6, 3, -6]} distance={17} />
    <group ref={dish} position={[0, 9.5, -8]} rotation={[Math.PI / 2.45, 0, 0]}>
      {[3.2, 4.7, 6.3].map((r, i) => <mesh key={r} rotation={[i * .26, i * .4, 0]}><torusGeometry args={[r, i === 1 ? .13 : .055, 10, 88]} /><meshPhysicalMaterial color={i === 1 ? "#748083" : "#202729"} metalness={.94} roughness={.2} emissive="#465154" emissiveIntensity={.06} /></mesh>)}
      <mesh><coneGeometry args={[2.1, 5, 48, 1, true]} /><meshBasicMaterial color="#8c999a" transparent opacity={.055} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    </group>
    <group ref={wave} position={[0, 4.4, -1]}>
      {Array.from({ length: 28 }, (_, i) => { const x = (i - 13.5) * .38; const y = Math.sin(i * .82) * (session.archetype === "synaptic" ? 1.15 : .72); return <Edge key={i} position={[x, y, 0]} scale={[.24, .035, .035]} opacity={i % 4 === 0 ? .62 : .28} />; })}
    </group>
    <group position={[0, 0, 2.8]}>
      <mesh position={[0, 1, 0]} rotation={[-.18, 0, 0]}><boxGeometry args={[5.5, 2, 2.4]} /><meshPhysicalMaterial color="#0a0d0e" metalness={.92} roughness={.25} /></mesh>
      <Edge position={[0, 2.05, -.45]} scale={[4.1, .85, .03]} opacity={progress.signalResult ? .42 : .18} />
      <InteractionVolume id="signal-analysis" position={[0, 1.5, .3]} size={[5.7, 3.2, 3]} />
    </group>
    <Portal id="route-maintenance-spine" position={[-7.3, 0, -10.8]} rotation={.08} open={progress.unlockedShortcuts.includes("signal-spine")} />
    <Portal id="return-nexus" position={[7.4, 0, 10.2]} rotation={Math.PI} open />
  </Chamber>;
}

function DeadSector({ reducedMotion, progress }: { reducedMotion: boolean; progress: FacilityProgress }) {
  const dust = useMemo(() => Array.from({ length: reducedMotion ? 20 : 48 }, (_, i) => [((i * 47) % 173) / 9 - 9.2, .5 + ((i * 31) % 97) / 11, -13 + ((i * 67) % 211) / 9] as [number, number, number]), [reducedMotion]);
  return <Chamber floor={[22, 31]} fog={36}>
    <spotLight color="#aeb8b8" intensity={7.5} position={[-6, 13, 7]} angle={.28} penumbra={.92} distance={31} />
    <pointLight color="#526064" intensity={3.5} position={[7, 2, -8]} distance={15} />
    <pointLight color="#718083" intensity={3.2} position={[0, 6, -4]} distance={13} />
    <group position={[0, 0, -5.7]}>
      <mesh position={[0, 3.5, 0]}><cylinderGeometry args={[4.7, 5.6, 7, 12, 1, true]} /><meshPhysicalMaterial color="#090c0d" metalness={.92} roughness={.32} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, .03, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.8, 5.4, 12]} /><meshBasicMaterial color="#20282a" transparent opacity={.4} /></mesh>
      <mesh position={[0, .05, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[4.7, 4.78, 12]} /><meshBasicMaterial color="#9aa6a7" transparent opacity={.18} toneMapped={false} /></mesh>
      {[-2.3, 2.3].map((x) => <Edge key={x} position={[x, 3.2, 2.55]} scale={[.045, 5.4, .03]} opacity={.14} />)}
      <InteractionVolume id="dead-sector-scan" position={[0, 2.5, 3.6]} size={[7.5, 5, 2]} />
    </group>
    {dust.map((position, i) => <mesh key={i} position={position}><sphereGeometry args={[i % 5 === 0 ? .025 : .012, 4, 3]} /><meshBasicMaterial color="#a8b1af" transparent opacity={.12} /></mesh>)}
    <Portal id={progress.hiddenPassageDiscovered ? "route-maintenance-spine" : "return-nexus"} position={[0, 0, 9.6]} rotation={Math.PI} open />
    <group position={[-7.6, 2.7, -1.2]}><Edge position={[0, 0, 0]} scale={[.05, 4.6, .04]} opacity={.2} /><Edge position={[.45, 1.8, 0]} scale={[.65, .05, .04]} opacity={.18} /></group>
  </Chamber>;
}

function ObservationDeck({ progress }: { progress: FacilityProgress }) {
  return <Chamber floor={[28, 24]} fog={96}>
    <hemisphereLight color="#8a9799" groundColor="#010202" intensity={.42} />
    <spotLight color="#d1d8d6" intensity={11} position={[0, 16, 6]} angle={.38} penumbra={.9} distance={68} />
    <pointLight color="#849396" intensity={9} position={[0, 18, -38]} distance={42} />
    <pointLight color="#a1adae" intensity={5} position={[15, 8, -28]} distance={26} />
    <mesh position={[0, 4.2, -9.4]}><boxGeometry args={[26, 8.5, .7]} /><meshPhysicalMaterial color="#071011" metalness={.78} roughness={.2} transparent opacity={.14} /></mesh>
    {[-11.2, 11.2].map((x) => <mesh key={x} position={[x, 7, -9]}><boxGeometry args={[1.1, 15, 1.1]} /><meshStandardMaterial color="#080b0c" metalness={.9} roughness={.3} /></mesh>)}
    <group position={[0, -12, -48]}>
      {[-17, -7, 5, 15].map((x, i) => <mesh key={x} position={[x, 12 + i * 4, -i * 5]}><boxGeometry args={[5 + i, 32 + i * 7, 5]} /><meshStandardMaterial color="#111719" metalness={.86} roughness={.36} emissive="#263033" emissiveIntensity={.035 + i * .008} /></mesh>)}
      <group position={[0, 26, 3]}>{[4, 7, 10].map((r, i) => <mesh key={r} rotation={[Math.PI / 2 + i * .35, i * .5, 0]}><torusGeometry args={[r, .09, 8, 72]} /><meshBasicMaterial color="#596669" transparent opacity={.22 - i * .04} /></mesh>)}</group>
      {[-21, -12, -2, 9, 22].map((x, i) => <Edge key={x} position={[x, 26 + i * 5, 3 - i * 4]} scale={[.045, 22 + i * 5, .045]} opacity={.13 + i * .025} />)}
    </group>
    <Edge position={[0, .12, -8.7]} scale={[23, .045, .04]} opacity={.42} />
    <group position={[0, 0, 1]}>
      <mesh position={[0, 1.25, 0]}><cylinderGeometry args={[.6, 1.25, 2.5, 8]} /><meshPhysicalMaterial color="#101516" metalness={.93} roughness={.23} /></mesh>
      <mesh position={[0, 2.7, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.1, .06, 8, 48]} /><meshBasicMaterial color="#aab5b5" transparent opacity={.52} toneMapped={false} /></mesh>
      <InteractionVolume id="observation-instrument" position={[0, 2, 0]} size={[3.2, 4, 3.2]} />
    </group>
    {progress.observationInstrumentUsed && <group position={[6.8, 8.8, -30]}><mesh><torusGeometry args={[2.4, .08, 8, 72]} /><meshBasicMaterial color="#b8aaa3" transparent opacity={.32} toneMapped={false} /></mesh><Edge position={[0, 0, 0]} scale={[.03, 9, .03]} opacity={.25} /></group>}
    <Portal id="return-record-vault" position={[-9, 0, 8.2]} rotation={Math.PI} open />
    <Portal id="return-nexus" position={[9, 0, 8.2]} rotation={Math.PI} open />
  </Chamber>;
}

function MaintenanceSpine({ progress, reducedMotion, scanner }: { progress: FacilityProgress; reducedMotion: boolean; scanner: boolean }) {
  const ribs = useRef<THREE.Group>(null);
  useFrame((state) => { if (ribs.current && !reducedMotion) ribs.current.position.y = Math.sin(state.clock.elapsedTime * .4) * .025; state.invalidate(); });
  return <Chamber floor={[9, 39]} fog={42}>
    <pointLight color="#879396" intensity={3.5} position={[0, 2, 7]} distance={15} />
    <pointLight color="#687578" intensity={2.4} position={[0, 2, -12]} distance={14} />
    <group ref={ribs}>{Array.from({ length: 13 }, (_, i) => <group key={i} position={[0, 0, 12 - i * 2.55]}><mesh position={[-3.25, 2.5, 0]}><boxGeometry args={[.45, 5.2, .65]} /><meshPhysicalMaterial color="#101517" metalness={.9} roughness={.27} /></mesh><mesh position={[3.25, 2.5, 0]}><boxGeometry args={[.45, 5.2, .65]} /><meshPhysicalMaterial color="#101517" metalness={.9} roughness={.27} /></mesh><mesh position={[0, 5, 0]}><boxGeometry args={[6.9, .38, .65]} /><meshPhysicalMaterial color="#101517" metalness={.9} roughness={.27} /></mesh>{i % 3 === 0 && <Edge position={[0, 4.76, .34]} scale={[4.8, .035, .025]} opacity={.3} />}</group>)}</group>
    <group position={[-2.2, 0, -5.8]}><mesh position={[0, 1.2, 0]}><boxGeometry args={[1.4, 2.4, 1.6]} /><meshPhysicalMaterial color="#0b0f10" metalness={.92} roughness={.24} /></mesh><Edge position={[0, 1.6, .82]} scale={[.7, .45, .03]} opacity={progress.unlockedShortcuts.includes("signal-spine") ? .46 : .18} /><InteractionVolume id="shortcut-control" position={[0, 1.3, .5]} size={[2.2, 2.8, 2.4]} /></group>
    <group position={[2.75, 2.4, -12.6]}><mesh><boxGeometry args={[.34, 4.8, 4.2]} /><meshPhysicalMaterial color="#070a0b" metalness={.9} roughness={.31} /></mesh>{(scanner || progress.signalResult) && <InteractionVolume id="hidden-passage" position={[-.55, 0, 0]} size={[1.5, 4.8, 4.4]} />}</group>
    <group position={[0, 4.3, 2.2]}><Edge position={[0, 0, 0]} scale={[progress.impossibleCorridorSeen ? 2.1 : 1.45, .055, .03]} opacity={.42} /><InteractionVolume id="corridor-marker" position={[0, -1.2, 0]} size={[4.5, 3.2, 1.6]} /></group>
    <Portal id="return-signal-room" position={[0, 0, 13]} rotation={Math.PI} open />
    {progress.hiddenPassageDiscovered && <Portal id="route-dead-sector" position={[0, 0, -18.2]} open />}
  </Chamber>;
}

export function ArchiveFacility({ room, progress, reducedMotion, discoveredCount, session, gateOpening, scanner }: WorldProps) {
  if (room === "nexus") return <ArchiveNexus reducedMotion={reducedMotion} discoveredCount={discoveredCount} session={session} gateOpening={gateOpening} progress={progress} />;
  if (room === "record-vault") return <RecordVault reducedMotion={reducedMotion} progress={progress} session={session} />;
  if (room === "signal-room") return <SignalRoom reducedMotion={reducedMotion} progress={progress} session={session} />;
  if (room === "dead-sector") return <DeadSector reducedMotion={reducedMotion} progress={progress} />;
  if (room === "observation-deck") return <ObservationDeck progress={progress} />;
  return <MaintenanceSpine progress={progress} reducedMotion={reducedMotion} scanner={scanner} />;
}
