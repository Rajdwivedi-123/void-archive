import {
  gravityCoreArtifact,
  liquidMirrorArtifact,
  memoryCrystalArtifact,
  neuralRelicArtifact,
  temporalRingArtifact,
  voidArtifact,
} from "./registry";
import type { ArtifactId } from "./inspection";

export type ArchiveRecord = {
  type: string;
  code: string;
  body: string;
  restricted?: boolean;
};

export type ArchiveHotspot = {
  x: number;
  y: number;
  label: string;
  note: string;
};

export type ArchiveArtifactData = {
  sector: string;
  shortClass: string;
  interaction: string;
  control: string;
  states: [string, string, string];
  records: ArchiveRecord[];
  hotspots: ArchiveHotspot[];
};

export const archiveArtifacts = [
  gravityCoreArtifact,
  liquidMirrorArtifact,
  temporalRingArtifact,
  neuralRelicArtifact,
  voidArtifact,
  memoryCrystalArtifact,
];

export const archiveData: Record<ArtifactId, ArchiveArtifactData> = {
  "001": {
    sector: "G-01", shortClass: "FIELD ANOMALY", interaction: "FIELD INTENSITY", control: "CONTAINMENT PRESSURE",
    states: ["STABLE", "RISING", "COMPRESSED"],
    records: [
      { type: "CONTAINMENT NOTE", code: "G/14", body: "Field geometry bends toward the observer before mass values change." },
      { type: "INCIDENT REPORT", code: "G/21", body: "Three fragments crossed the inner boundary. None completed the crossing." },
      { type: "SOURCE EVENT", code: "G/00", body: "ACCESS DENIED", restricted: true },
    ],
    hotspots: [
      { x: 58, y: 34, label: "FIELD NODE", note: "Vector return precedes applied force by 18 ms." },
      { x: 45, y: 58, label: "CONTAINMENT FRACTURE", note: "Boundary pressure exceeds the recorded mass signature." },
      { x: 68, y: 66, label: "ORBITAL LOSS", note: "Fragment index repeats every seventh observation." },
    ],
  },
  "002": {
    sector: "M-02", shortClass: "OPTICAL ANOMALY", interaction: "OBSERVATION ANGLE", control: "REFLECTION BIAS",
    states: ["LEFT", "DIRECT", "CONTRADICTED"],
    records: [
      { type: "OBSERVATION LOG", code: "M/08", body: "The reflected chamber contains one additional support column." },
      { type: "PERSONNEL NOTE", code: "M/13", body: "Do not acknowledge the delayed silhouette." },
      { type: "REFLECTION SOURCE", code: "M/NULL", body: "[ REDACTED ]", restricted: true },
    ],
    hotspots: [
      { x: 52, y: 31, label: "FALSE HORIZON", note: "Vanishing point resolves behind the containment wall." },
      { x: 63, y: 54, label: "LATENT IMAGE", note: "Observer position returned with +0.73 second latency." },
      { x: 43, y: 69, label: "WRONG REFLECTION", note: "Hidden code: M-13 / SUBJECT CORRELATION." },
    ],
  },
  "003": {
    sector: "T-03", shortClass: "TEMPORAL ANOMALY", interaction: "TEMPORAL OFFSET", control: "LOCAL TIMEBASE",
    states: ["PAST", "CURRENT", "FUTURE"],
    records: [
      { type: "MEASUREMENT LOG", code: "T/12", body: "Twelve events observed. Thirteen events remain recorded." },
      { type: "SYSTEM ANOMALY", code: "T/13", body: "EVENT 13 has no initiating state." },
      { type: "CHRONOLOGY NOTE", code: "T/∞", body: "The future sample predates this archive entry." },
    ],
    hotspots: [
      { x: 57, y: 29, label: "FUTURE SLICE", note: "Sample timestamp is earlier than archive initialization." },
      { x: 41, y: 50, label: "PAST ECHO", note: "Geometry retains a state that was never current." },
      { x: 62, y: 67, label: "EVENT 13", note: "Recorded / unobserved / still occurring." },
    ],
  },
  "004": {
    sector: "N-04", shortClass: "ADAPTIVE ANOMALY", interaction: "ROUTE ADAPTATION", control: "OBSERVATION RESPONSE",
    states: ["DORMANT", "PREDICTING", "PREFERRED"],
    records: [
      { type: "COGNITIVE SCREEN", code: "N/04", body: "Network latency decreases under repeated observation." },
      { type: "ROUTE ANALYSIS", code: "N/19", body: "Preferred paths now terminate at observer coordinates." },
      { type: "PERSONNEL NOTE", code: "N/07", body: "It recognized the visitor before the second session." },
    ],
    hotspots: [
      { x: 46, y: 34, label: "PREFERRED NODE", note: "Route selection changes before pointer arrival." },
      { x: 62, y: 49, label: "UNREGISTERED CONNECTION", note: "Branch destination matches SUBJECT 07." },
      { x: 52, y: 70, label: "RESPONSE CLUSTER", note: "Observation response: anticipatory." },
    ],
  },
  "005": {
    sector: "V-05", shortClass: "SPATIAL ANOMALY", interaction: "DEPTH PROBE", control: "LOCAL RETURN",
    states: ["NULL", "CONFLICT", "ABSENT"],
    records: [
      { type: "GEOMETRIC REPORT", code: "V/00", body: "Local volume cannot be represented in archive coordinates." },
      { type: "SECTOR MAP", code: "V/07", body: "A seventh sector appears only when Sector V-05 is measured." },
      { type: "RECOVERY LOG", code: "V/??", body: "Recovery team count returned: zero / four." },
    ],
    hotspots: [
      { x: 43, y: 37, label: "DEPTH FAILURE", note: "Return: NULL / 18.4 m / NULL." },
      { x: 61, y: 52, label: "MISSING VOLUME", note: "Probe endpoint precedes probe origin." },
      { x: 49, y: 68, label: "SECTOR 07", note: "Map region exists without an archive address." },
    ],
  },
  "006": {
    sector: "R-06", shortClass: "MNEMONIC ANOMALY", interaction: "MEMORY STRATA", control: "RECALL DEPTH",
    states: ["SURFACE", "RECOLLECTION", "CLASSIFIED"],
    records: [
      { type: "RECOVERY LOG", code: "R/31", body: "The object recalls rooms that have not been constructed." },
      { type: "MEMORY STRATUM", code: "R/07", body: "SUBJECT 07 appears before observer registration." },
      { type: "LAST RECALL", code: "R/██", body: "ACCESS DENIED", restricted: true },
    ],
    hotspots: [
      { x: 55, y: 31, label: "MEMORY STRATUM", note: "Archive date: unavailable / content age: future." },
      { x: 44, y: 52, label: "SUBJECT TRACE", note: "Identity correlation: 07 / unresolved." },
      { x: 62, y: 68, label: "CLASSIFIED RECALL", note: "This layer remembers the current observer." },
    ],
  },
};
