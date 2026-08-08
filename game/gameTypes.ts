export type ExperienceMode = "nexus" | "observation" | "transition" | "n07";
export type PlayableSpace = FacilityRoom | "n07";

export type FacilityRoom = "nexus" | "record-vault" | "signal-room" | "dead-sector" | "observation-deck" | "maintenance-spine";

export type NexusInteractionId =
  | "observation-gate"
  | "archive-map"
  | "system-terminal"
  | "scanner-array"
  | "nexus-scan-north"
  | "nexus-scan-east"
  | "nexus-scan-west"
  | "array-component-a"
  | "array-component-b"
  | "array-component-c"
  | "relay-alpha"
  | "relay-beta"
  | "relay-gamma"
  | "topology-current"
  | "topology-recorded"
  | "nexus-ledge"
  | "signal-echo-north"
  | "signal-echo-east"
  | "signal-echo-west"
  | "restricted-sector"
  | "event-seven"
  | "route-record-vault"
  | "route-signal-room"
  | "route-dead-sector"
  | "route-observation-deck"
  | "route-maintenance-spine"
  | "return-nexus"
  | "return-record-vault"
  | "return-signal-room"
  | "record-search"
  | "signal-analysis"
  | "dead-sector-scan"
  | "observation-instrument"
  | "shortcut-control"
  | "hidden-passage"
  | "n07-gate"
  | "n07-cross-threshold"
  | "n07-topology-visible"
  | "n07-topology-missing"
  | "n07-stillness-seam"
  | "n07-reflection-route"
  | "n07-trace-sync"
  | "n07-trace-diverge"
  | "n07-future-self"
  | "n07-evidence-event"
  | "n07-evidence-signal"
  | "n07-evidence-void"
  | "n07-evidence-memory"
  | "n07-bridge-supported"
  | "n07-bridge-contradictory"
  | "n07-failure-anchor-1"
  | "n07-failure-anchor-2"
  | "n07-failure-anchor-3"
  | "n07-observer-direct"
  | "n07-observer-wait"
  | "n07-route-model"
  | "n07-route-contradiction"
  | "n07-traversal"
  | "n07-exterior-scan-archive"
  | "n07-exterior-scan-horizon"
  | "n07-exterior-scan-observer"
  | "n07-exterior-window"
  | "n07-exterior-measure"
  | "n07-interpret-sector"
  | "n07-interpret-archive"
  | "n07-interpret-observer"
  | "n07-interpret-event"
  | "n07-final-stabilize"
  | "n07-final-preserve"
  | "n07-return"
  | "corridor-marker";

export type PlayerPose = {
  position: [number, number, number];
  yaw: number;
  pitch: number;
};

export type NexusControls = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  lookX: number;
  lookY: number;
};

export type NexusCheckpoint = {
  version: 1;
  checkpoint: "NEXUS" | "OBSERVATION_STARTED" | "OBSERVATION_COMPLETE";
  pose: PlayerPose;
};

export type FacilityClue = "record-future" | "signal-7a" | "dead-sector" | "observation-sighting" | "maintenance-marking" | "corridor-label";

export type FacilityProgress = {
  version: 8;
  epoch: number;
  location: FacilityRoom;
  pose: PlayerPose;
  discoveredRooms: FacilityRoom[];
  unlockedShortcuts: string[];
  completedInteractions: string[];
  n07Clues: FacilityClue[];
  recordSearches: string[];
  signalResult: string | null;
  hiddenPassageDiscovered: boolean;
  deadSectorDiscovered: boolean;
  observationInstrumentUsed: boolean;
  impossibleCorridorSeen: boolean;
  investigation: import("./investigation").InvestigationProgress;
  consequences: import("./consequenceTypes").ConsequenceState;
  n07: import("./n07Level").N07LevelProgress;
  nexusGameplay: import("./nexusGameplay").NexusGameplayProgress;
};

export const defaultNexusPose: PlayerPose = {
  position: [0.8, 1.72, 13.5],
  yaw: 0,
  pitch: 0.09,
};

export const createNexusControls = (): NexusControls => ({
  forward: false,
  backward: false,
  left: false,
  right: false,
  sprint: false,
  lookX: 0,
  lookY: 0,
});
