import type { ArtifactId } from "@/artifacts/inspection";

export type ArtifactVoice = { frequency: number; filter: number; gain: number; pan: number };

export const artifactVoices: Record<ArtifactId, ArtifactVoice> = {
  "001": { frequency: 148, filter: 620, gain: .085, pan: -.18 },
  "002": { frequency: 286, filter: 1800, gain: .06, pan: .22 },
  "003": { frequency: 516, filter: 2200, gain: .05, pan: -.08 },
  "004": { frequency: 194, filter: 1450, gain: .07, pan: .28 },
  "005": { frequency: 48, filter: 145, gain: .016, pan: 0 },
  "006": { frequency: 332, filter: 2400, gain: .078, pan: .12 },
};
