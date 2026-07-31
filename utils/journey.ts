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
  | "object-four-inspection"
  | "object-four-departure"
  | "geometric-isolation-passage"
  | "object-five-arrival"
  | "object-five-activation"
  | "object-five-inspection"
  | "object-five-departure"
  | "memory-recovery-passage"
  | "object-six-arrival"
  | "object-six-activation"
  | "object-six-inspection";

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
  { stage: "object-two-departure", start: 0.57 },
  { stage: "measurement-passage", start: 0.585 },
  { stage: "object-three-arrival", start: 0.61 },
  { stage: "object-three-activation", start: 0.635 },
  { stage: "object-three-inspection", start: 0.67 },
  { stage: "object-three-departure", start: 0.705 },
  { stage: "bio-isolation-passage", start: 0.715 },
  { stage: "object-four-arrival", start: 0.735 },
  { stage: "object-four-activation", start: 0.76 },
  { stage: "object-four-inspection", start: 0.795 },
  { stage: "object-four-departure", start: 0.82 },
  { stage: "geometric-isolation-passage", start: 0.83 },
  { stage: "object-five-arrival", start: 0.85 },
  { stage: "object-five-activation", start: 0.875 },
  { stage: "object-five-inspection", start: 0.9 },
  { stage: "object-five-departure", start: 0.915 },
  { stage: "memory-recovery-passage", start: 0.925 },
  { stage: "object-six-arrival", start: 0.94 },
  { stage: "object-six-activation", start: 0.96 },
  { stage: "object-six-inspection", start: 0.982 },
];

export function getJourneyStage(progress: number): JourneyStage {
  for (let index = journeyThresholds.length - 1; index >= 0; index -= 1) {
    if (progress >= journeyThresholds[index].start) return journeyThresholds[index].stage;
  }
  return "observation";
}
