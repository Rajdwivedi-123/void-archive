export type ExperienceMode = "nexus" | "observation" | "transition";

export type NexusInteractionId =
  | "observation-gate"
  | "archive-map"
  | "system-terminal"
  | "scanner-array"
  | "restricted-sector"
  | "event-seven";

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
