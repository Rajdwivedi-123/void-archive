import type { ArtifactId } from "@/artifacts/inspection";
import type { DeviceTier } from "@/hooks/useDeviceProfile";

export type RealityMode = "nexus" | "journey" | "archive" | "terminal" | "inspect";
export type ObserverAffinity = "gravity" | "optical" | "temporal" | "adaptive" | "spatial" | "mnemonic";
export type ObserverArchetype = "interventionist" | "witness" | "chronologist" | "cartographer" | "synaptic" | "mnemonist";
export type ObservationQuality = "partial" | "coherent" | "interrupted" | "extended";
export type N07Route = "temporal" | "void" | "archive" | "memory" | null;

export type AffinityScores = {
  gravityAffinity: number;
  opticalAffinity: number;
  temporalAffinity: number;
  neuralAffinity: number;
  spatialAffinity: number;
  mnemonicAffinity: number;
};

export type RealitySession = {
  version: 3;
  seed: string;
  archiveUnlocked: boolean;
  returningVisitor: boolean;
  completedRuns: number;
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
  controlCounts: Partial<Record<ArtifactId, number>>;
  visitOrder: ArtifactId[];
  archiveViews: number;
  connectionViews: number;
  pointerMotion: number;
  totalInteractions: number;
  realityFreezeSeen: boolean;
  n07Route: N07Route;
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
  projectedVisible: boolean;
};

export type RealitySnapshot = RealitySession & {
  affinity: ObserverAffinity;
  affinities: AffinityScores;
  archetype: ObserverArchetype;
  observerConfidence: number;
  observationQuality: ObservationQuality;
  temporalNeuralBranch: "causality" | "anticipation";
  neuralVoidBranch: "structural" | "spatial-mismatch" | "quiet";
  recallOrder: ArtifactId[];
  measurements: { drift: string; phase: string; returnDistance: string; mnemonicIndex: string };
};

export type DebugProfile = ObserverArchetype;

export type RealityStore = {
  runtime: RealityRuntime;
  getSnapshot: () => RealitySnapshot;
  subscribe: (listener: () => void) => () => void;
  hydrate: () => void;
  setContext: (artifact: ArtifactId | null, mode: RealityMode, reducedMotion: boolean, tier: DeviceTier) => void;
  recordPointer: (sample: PointerSample) => void;
  setProjection: (x: number, y: number, visible: boolean) => void;
  beginInspection: (id: ArtifactId) => void;
  endInspection: (id: ArtifactId) => void;
  revisit: (id: ArtifactId) => void;
  openRecord: (id: ArtifactId, code: string) => void;
  recordControl: (id: ArtifactId, value: number) => void;
  recordVoidProbe: () => void;
  recordArchiveView: (section: "index" | "connections" | "sectors" | "system") => void;
  unlockArchive: () => void;
  markFreezeSeen: () => void;
  setFreezeActive: (active: boolean) => void;
  resetTrace: () => void;
  applyDebugProfile: (profile: DebugProfile) => void;
};
