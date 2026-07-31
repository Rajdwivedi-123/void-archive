import type { ArtifactId } from "@/artifacts/inspection";
import type { DeviceTier } from "@/hooks/useDeviceProfile";

export type RealityMode = "journey" | "archive" | "inspect";
export type ObserverAffinity = "gravity" | "optical" | "temporal" | "adaptive" | "spatial" | "mnemonic";

export type RealitySession = {
  version: 2;
  seed: string;
  archiveUnlocked: boolean;
  event13Discovered: boolean;
  maxGravityIntensity: number;
  mirrorObservationDepth: number;
  temporalExploration: [number, number, number];
  neuralAdaptation: number;
  voidProbeCount: number;
  memoryRecallDepth: number;
  recordsOpened: string[];
  revisits: Partial<Record<ArtifactId, number>>;
  inspectionMs: Partial<Record<ArtifactId, number>>;
  totalInteractions: number;
  realityFreezeSeen: boolean;
};

export type PointerSample = { x: number; y: number; at: number };

export type RealityRuntime = {
  activeArtifact: ArtifactId | null;
  mode: RealityMode;
  reducedMotion: boolean;
  qualityTier: DeviceTier;
  pointer: PointerSample;
  pointerHistory: PointerSample[];
  freezeActive: boolean;
  projectedX: number;
  projectedY: number;
};

export type RealitySnapshot = RealitySession & {
  affinity: ObserverAffinity;
  observerConfidence: number;
};

export type RealityStore = {
  runtime: RealityRuntime;
  getSnapshot: () => RealitySnapshot;
  subscribe: (listener: () => void) => () => void;
  hydrate: () => void;
  setContext: (artifact: ArtifactId | null, mode: RealityMode, reducedMotion: boolean, tier: DeviceTier) => void;
  recordPointer: (sample: PointerSample) => void;
  setProjection: (x: number, y: number) => void;
  beginInspection: (id: ArtifactId) => void;
  endInspection: (id: ArtifactId) => void;
  revisit: (id: ArtifactId) => void;
  openRecord: (id: ArtifactId, code: string) => void;
  recordControl: (id: ArtifactId, value: number) => void;
  recordVoidProbe: () => void;
  unlockArchive: () => void;
  markFreezeSeen: () => void;
  setFreezeActive: (active: boolean) => void;
};
