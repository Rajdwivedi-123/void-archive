export type ExperienceMode = "nexus" | "observation" | "transition";

export type FacilityRoom = "nexus" | "record-vault" | "signal-room" | "dead-sector" | "observation-deck" | "maintenance-spine";

export type NexusInteractionId =
  | "observation-gate"
  | "archive-map"
  | "system-terminal"
  | "scanner-array"
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
  version: 4;
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
