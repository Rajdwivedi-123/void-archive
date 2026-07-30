import type { ArtifactDefinition } from "./types";

export const gravityCoreArtifact: ArtifactDefinition = {
  id: "001",
  archiveCode: "VA-001/G",
  title: "GRAVITY CORE",
  classification: "GRAVITATIONAL ANOMALY",
  status: "UNSTABLE",
  origin: "UNKNOWN",
  containment: "ACTIVE",
  summary: "MASS SIGNATURE EXCEEDS CONTAINMENT MODEL. SOURCE EVENT REDACTED.",
  readings: [
    { label: "STATUS", value: "UNSTABLE", accent: true },
    { label: "CLASS", value: "GRAVITATIONAL ANOMALY" },
    { label: "ORIGIN", value: "UNKNOWN" },
    { label: "CONTAINMENT", value: "ACTIVE" },
  ],
  anomalyLabel: "FIELD DEVIATION",
  anomalyDormant: "RISING  +0.021",
  anomalyActive: "RISING  +0.083",
  lifecycle: { visibleFrom: 0, entryFrom: 0, activationFrom: 0.02, inspectionFrom: 0.1, exitAfter: 0.31 },
  camera: { entryAt: 0, inspectionAt: 0.18, exitAt: 0.34 },
  quality: {
    desktop: { membraneSegments: 0, reflectionLayers: 0, pointerStrength: 1 },
    tablet: { membraneSegments: 0, reflectionLayers: 0, pointerStrength: 0 },
    mobile: { membraneSegments: 0, reflectionLayers: 0, pointerStrength: 0 },
  },
  reducedMotion: { activationScale: 0, surfaceMotion: 0, pointerEnabled: false },
};

export const liquidMirrorArtifact: ArtifactDefinition = {
  id: "002",
  archiveCode: "VA-002/M",
  title: "LIQUID MIRROR",
  classification: "OPTICAL ANOMALY",
  status: "OBSERVATIONAL",
  origin: "UNRESOLVED",
  containment: "VISUAL ISOLATION",
  summary: "REFLECTED SPACE DIVERGES FROM CURRENT OBSERVATION. SUBJECT CORRELATION INCOMPLETE.",
  readings: [
    { label: "STATUS", value: "OBSERVATIONAL", accent: true },
    { label: "CLASS", value: "OPTICAL ANOMALY" },
    { label: "ORIGIN", value: "UNRESOLVED" },
    { label: "CONTAINMENT", value: "VISUAL ISOLATION" },
    { label: "REFLECTION LATENCY", value: "+0.73 SEC", accent: true },
    { label: "SUBJECT MATCH", value: "FAILED", accent: true },
  ],
  anomalyLabel: "RETURN IMAGE",
  anomalyDormant: "RECORD LOCKED",
  anomalyActive: "PARTIAL / NONLOCAL",
  lifecycle: { visibleFrom: 0.82, entryFrom: 0.86, activationFrom: 0.9, inspectionFrom: 0.955, exitAfter: 1.08 },
  camera: { entryAt: 0.84, inspectionAt: 0.955, exitAt: 1.08 },
  quality: {
    desktop: { membraneSegments: 56, reflectionLayers: 3, pointerStrength: 1 },
    tablet: { membraneSegments: 40, reflectionLayers: 2, pointerStrength: 0.45 },
    mobile: { membraneSegments: 28, reflectionLayers: 1, pointerStrength: 0 },
  },
  reducedMotion: { activationScale: 0.35, surfaceMotion: 0, pointerEnabled: false },
};
