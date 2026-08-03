import { defaultNexusPose, type FacilityProgress, type FacilityRoom, type NexusCheckpoint, type PlayerPose } from "./gameTypes";
import { facilityPoses, safeFacilityPose } from "./facilityTopology";
import { createInvestigationProgress, sanitizeInvestigation } from "./investigation";
import { createConsequenceState, sanitizeConsequences } from "./consequences";
import { createN07LevelProgress, sanitizeN07Level } from "./n07Level";
import { createNexusGameplayProgress, sanitizeNexusGameplay } from "./nexusGameplay";

const CHECKPOINT_KEY = "void-archive.game.v1";
const FACILITY_KEY = "void-archive.game.v2";
const PHASE15_LEGACY_KEY = "void-archive.game.v3";
const INVESTIGATION_KEY = "void-archive.game.v4";
const CONSEQUENCE_KEY = "void-archive.game.v5";
const N07_LEVEL_KEY = "void-archive.game.v6";
const NEXUS_GAMEPLAY_KEY = "void-archive.game.v7";

const facilityRooms: FacilityRoom[] = ["nexus", "record-vault", "signal-room", "dead-sector", "observation-deck", "maintenance-spine"];

export function createFacilityProgress(): FacilityProgress {
  return {
    version: 7, epoch: 0, location: "nexus", pose: facilityPoses.nexus, discoveredRooms: ["nexus"], unlockedShortcuts: [], completedInteractions: [], n07Clues: [], recordSearches: [], signalResult: null,
    hiddenPassageDiscovered: false, deadSectorDiscovered: false, observationInstrumentUsed: false, impossibleCorridorSeen: false,
    investigation: createInvestigationProgress(),
    consequences: createConsequenceState(),
    n07: createN07LevelProgress(),
    nexusGameplay: createNexusGameplayProgress(),
  };
}

export function loadFacilityProgress(): FacilityProgress {
  const fallback = createFacilityProgress();
  try {
    const saved = JSON.parse(localStorage.getItem(NEXUS_GAMEPLAY_KEY) ?? localStorage.getItem(N07_LEVEL_KEY) ?? localStorage.getItem(CONSEQUENCE_KEY) ?? localStorage.getItem(INVESTIGATION_KEY) ?? localStorage.getItem(PHASE15_LEGACY_KEY) ?? localStorage.getItem(FACILITY_KEY) ?? "null") as Partial<FacilityProgress> | null;
    const savedVersion = (saved as { version?: number } | null)?.version;
    if (!saved || (savedVersion !== 2 && savedVersion !== 3 && savedVersion !== 4 && savedVersion !== 5 && savedVersion !== 6 && savedVersion !== 7)) {
      const legacy = loadNexusCheckpoint();
      return { ...fallback, pose: safeFacilityPose("nexus", legacy.pose) };
    }
    const location = facilityRooms.includes(saved.location as FacilityRoom) ? saved.location as FacilityRoom : "nexus";
    const investigation = sanitizeInvestigation(saved.investigation);
    if (savedVersion === 2) {
      const clueEvidence: Record<string, string> = { "record-future": "R-07-FUTURE", "signal-7a": "S-7A", "dead-sector": "D-N00", "observation-sighting": "O-N07", "maintenance-marking": "MS-DEPTH" };
      const migratedEvidence = (saved.n07Clues ?? []).map((clue) => clueEvidence[clue]).filter(Boolean);
      investigation.evidenceDiscovered = [...new Set([...investigation.evidenceDiscovered, ...migratedEvidence])];
      investigation.investigationStage = investigation.evidenceDiscovered.length >= 2 ? "contradiction" : "observation";
    }
    return {
      ...fallback, ...saved, version: 7, epoch: Number.isFinite(saved.epoch) ? saved.epoch as number : 0, location, pose: safeFacilityPose(location, saved.pose),
      discoveredRooms: facilityRooms.filter((room) => saved.discoveredRooms?.includes(room)).concat("nexus").filter((room, index, all) => all.indexOf(room) === index),
      unlockedShortcuts: Array.isArray(saved.unlockedShortcuts) ? saved.unlockedShortcuts.slice(-8) : [],
      completedInteractions: Array.isArray(saved.completedInteractions) ? saved.completedInteractions.slice(-24) : [],
      n07Clues: Array.isArray(saved.n07Clues) ? saved.n07Clues.slice(-8) as FacilityProgress["n07Clues"] : [],
      recordSearches: Array.isArray(saved.recordSearches) ? saved.recordSearches.slice(-12) : [],
      investigation,
      consequences: sanitizeConsequences(saved.consequences),
      n07: sanitizeN07Level(saved.n07, sanitizeConsequences(saved.consequences).endingCommit?.vector ?? "adaptive"),
      nexusGameplay: sanitizeNexusGameplay(saved.nexusGameplay),
    };
  } catch { return fallback; }
}

export function saveFacilityProgress(progress: FacilityProgress, replace = false) {
  try {
    const stored = JSON.parse(localStorage.getItem(NEXUS_GAMEPLAY_KEY) ?? "null") as Partial<FacilityProgress> | null;
    const incomingEpoch = Number.isFinite(progress.epoch) ? progress.epoch : 0;
    if (!replace && Number.isFinite(stored?.epoch) && (stored?.epoch ?? 0) > incomingEpoch) return;
    localStorage.setItem(NEXUS_GAMEPLAY_KEY, JSON.stringify({ ...progress, version: 7, epoch: incomingEpoch, pose: safeFacilityPose(progress.location, progress.pose), consequences: sanitizeConsequences(progress.consequences), n07: sanitizeN07Level(progress.n07, progress.consequences.endingCommit?.vector ?? "adaptive"), nexusGameplay: sanitizeNexusGameplay(progress.nexusGameplay) }));
  } catch { /* optional persistence */ }
}

export function clearFacilityProgress() { try { localStorage.removeItem(NEXUS_GAMEPLAY_KEY); localStorage.removeItem(N07_LEVEL_KEY); localStorage.removeItem(CONSEQUENCE_KEY); localStorage.removeItem(INVESTIGATION_KEY); localStorage.removeItem(PHASE15_LEGACY_KEY); localStorage.removeItem(FACILITY_KEY); } catch { /* optional persistence */ } }

export function loadNexusCheckpoint(): NexusCheckpoint {
  const fallback: NexusCheckpoint = { version: 1, checkpoint: "NEXUS", pose: defaultNexusPose };
  try {
    const parsed = JSON.parse(localStorage.getItem(CHECKPOINT_KEY) ?? "null") as Partial<NexusCheckpoint> | null;
    if (!parsed || parsed.version !== 1 || !parsed.pose || !Array.isArray(parsed.pose.position)) return fallback;
    const [x, , z] = parsed.pose.position;
    if (![x, z, parsed.pose.yaw, parsed.pose.pitch].every(Number.isFinite)) return fallback;
    return {
      version: 1,
      checkpoint: parsed.checkpoint === "OBSERVATION_COMPLETE" ? "OBSERVATION_COMPLETE" : "NEXUS",
      pose: { position: [Math.max(-13.5, Math.min(13.5, x)), 1.72, Math.max(-16.5, Math.min(15, z))], yaw: parsed.pose.yaw, pitch: parsed.pose.pitch },
    };
  } catch { return fallback; }
}

export function saveNexusCheckpoint(checkpoint: NexusCheckpoint["checkpoint"], pose: PlayerPose) {
  try { localStorage.setItem(CHECKPOINT_KEY, JSON.stringify({ version: 1, checkpoint, pose } satisfies NexusCheckpoint)); } catch { /* optional persistence */ }
}
