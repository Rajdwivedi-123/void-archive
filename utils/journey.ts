export type JourneyStage =
  | "observation"
  | "approach"
  | "departure"
  | "exit"
  | "corridor"
  | "deep-archive"
  | "object-two-arrival"
  | "object-two-activation"
  | "object-two-inspection";

export const journeyThresholds: Array<{ stage: JourneyStage; start: number }> = [
  { stage: "observation", start: 0 },
  { stage: "approach", start: 0.1 },
  { stage: "departure", start: 0.23 },
  { stage: "exit", start: 0.38 },
  { stage: "corridor", start: 0.5 },
  { stage: "deep-archive", start: 0.75 },
  { stage: "object-two-arrival", start: 0.84 },
  { stage: "object-two-activation", start: 0.9 },
  { stage: "object-two-inspection", start: 0.955 },
];

export function getJourneyStage(progress: number): JourneyStage {
  for (let index = journeyThresholds.length - 1; index >= 0; index -= 1) {
    if (progress >= journeyThresholds[index].start) return journeyThresholds[index].stage;
  }
  return "observation";
}
