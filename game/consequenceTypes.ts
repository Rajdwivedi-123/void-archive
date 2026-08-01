import type { FacilityRoom } from "./gameTypes";

export type SignalResolution = "temporal" | "spatial" | "neural";
export type NeuralStrategy = "intervention" | "observation";
export type N07DiscoveryRoute = "temporal" | "spatial" | "memory";
export type ConsequenceEnding = "minimal" | "subject-07" | "n07-vector";

export type ConsequenceState = {
  gravityOverdrive: boolean;
  gravityStabilized: boolean;
  mirrorImpossibleFeedSelected: boolean | null;
  temporalSequenceChoice: string | null;
  event13Resolved: boolean;
  neuralStrategy: NeuralStrategy | null;
  neuralPredictionTriggered: boolean;
  voidBoundaryExposed: boolean;
  voidProbeDepth: number;
  memoryReconstructionType: string | null;
  memoryRestorationCommitted: boolean;
  signal7aResolution: SignalResolution | null;
  deadSectorInvestigated: boolean;
  hiddenPassageUsed: boolean;
  n07DiscoveryRoute: N07DiscoveryRoute | null;
  acceptedCorrelations: string[];
  rejectedCorrelations: string[];
  optionalRoomsVisited: FacilityRoom[];
  minimalCompletion: boolean;
  observerArchetype: string;
  committedEnding: ConsequenceEnding | null;
  returningEcho: "gravity" | "mirror" | "void" | "memory" | null;
};

export type FacilityMutations = {
  gravityBent: boolean;
  containmentAligned: boolean;
  mirrorRouteGhost: "reliable" | "false" | null;
  temporalEarlyResponse: boolean;
  neuralPrediction: boolean;
  voidAbsence: boolean;
  memoryGhost: boolean;
  recoveredRecord: boolean;
  signalTopology: SignalResolution | null;
  routeVariant: "maintenance" | "causal" | "observation" | null;
  deadSectorState: "active" | "silent" | "unresolved";
  rareTopology: boolean;
  ending: ConsequenceEnding;
  activeSectorCount: "6 / 7" | "7 / 7";
  responseLabels: string[];
};
