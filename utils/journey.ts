export type JourneyStage =
  | "observation"
  | "approach"
  | "departure"
  | "exit"
  | "corridor"
  | "deep-archive"
  | "object-two-arrival"
  | "object-two-activation"
  | "object-two-inspection"
  | "object-two-departure"
  | "measurement-passage"
  | "object-three-arrival"
  | "object-three-activation"
  | "object-three-inspection"
  | "object-three-departure"
  | "bio-isolation-passage"
  | "object-four-arrival"
  | "object-four-activation"
  | "object-four-inspection";

export const journeyThresholds: Array<{ stage: JourneyStage; start: number }> = [
  { stage: "observation", start: 0 },
  { stage: "approach", start: 0.055 },
  { stage: "departure", start: 0.12 },
  { stage: "exit", start: 0.2 },
  { stage: "corridor", start: 0.27 },
  { stage: "deep-archive", start: 0.37 },
  { stage: "object-two-arrival", start: 0.43 },
  { stage: "object-two-activation", start: 0.48 },
  { stage: "object-two-inspection", start: 0.54 },
  { stage: "object-two-departure", start: 0.61 },
  { stage: "measurement-passage", start: 0.64 },
  { stage: "object-three-arrival", start: 0.68 },
  { stage: "object-three-activation", start: 0.72 },
  { stage: "object-three-inspection", start: 0.78 },
  { stage: "object-three-departure", start: 0.84 },
  { stage: "bio-isolation-passage", start: 0.865 },
  { stage: "object-four-arrival", start: 0.9 },
  { stage: "object-four-activation", start: 0.925 },
  { stage: "object-four-inspection", start: 0.965 },
];

export function getJourneyStage(progress: number): JourneyStage {
  for (let index = journeyThresholds.length - 1; index >= 0; index -= 1) {
    if (progress >= journeyThresholds[index].start) return journeyThresholds[index].stage;
  }
  return "observation";
}
