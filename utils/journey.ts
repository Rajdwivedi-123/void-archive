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
  | "object-three-inspection";

export const journeyThresholds: Array<{ stage: JourneyStage; start: number }> = [
  { stage: "observation", start: 0 },
  { stage: "approach", start: 0.07 },
  { stage: "departure", start: 0.15 },
  { stage: "exit", start: 0.25 },
  { stage: "corridor", start: 0.34 },
  { stage: "deep-archive", start: 0.48 },
  { stage: "object-two-arrival", start: 0.55 },
  { stage: "object-two-activation", start: 0.59 },
  { stage: "object-two-inspection", start: 0.65 },
  { stage: "object-two-departure", start: 0.73 },
  { stage: "measurement-passage", start: 0.79 },
  { stage: "object-three-arrival", start: 0.85 },
  { stage: "object-three-activation", start: 0.89 },
  { stage: "object-three-inspection", start: 0.94 },
];

export function getJourneyStage(progress: number): JourneyStage {
  for (let index = journeyThresholds.length - 1; index >= 0; index -= 1) {
    if (progress >= journeyThresholds[index].start) return journeyThresholds[index].stage;
  }
  return "observation";
}
