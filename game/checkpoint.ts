import { defaultNexusPose, type FacilityProgress, type FacilityRoom, type NexusCheckpoint, type PlayerPose } from "./gameTypes";
import { facilityPoses, safeFacilityPose } from "./facilityTopology";

const CHECKPOINT_KEY = "void-archive.game.v1";
const FACILITY_KEY = "void-archive.game.v2";

const facilityRooms: FacilityRoom[] = ["nexus", "record-vault", "signal-room", "dead-sector", "observation-deck", "maintenance-spine"];

export function createFacilityProgress(): FacilityProgress {
  return {
    version: 2, location: "nexus", pose: facilityPoses.nexus, discoveredRooms: ["nexus"], unlockedShortcuts: [], completedInteractions: [], n07Clues: [], recordSearches: [], signalResult: null,
    hiddenPassageDiscovered: false, deadSectorDiscovered: false, observationInstrumentUsed: false, impossibleCorridorSeen: false,
  };
}

export function loadFacilityProgress(): FacilityProgress {
  const fallback = createFacilityProgress();
  try {
    const saved = JSON.parse(localStorage.getItem(FACILITY_KEY) ?? "null") as Partial<FacilityProgress> | null;
    if (!saved || saved.version !== 2) {
      const legacy = loadNexusCheckpoint();
      return { ...fallback, pose: safeFacilityPose("nexus", legacy.pose) };
    }
    const location = facilityRooms.includes(saved.location as FacilityRoom) ? saved.location as FacilityRoom : "nexus";
    return {
      ...fallback, ...saved, version: 2, location, pose: safeFacilityPose(location, saved.pose),
      discoveredRooms: facilityRooms.filter((room) => saved.discoveredRooms?.includes(room)).concat("nexus").filter((room, index, all) => all.indexOf(room) === index),
      unlockedShortcuts: Array.isArray(saved.unlockedShortcuts) ? saved.unlockedShortcuts.slice(-8) : [],
      completedInteractions: Array.isArray(saved.completedInteractions) ? saved.completedInteractions.slice(-24) : [],
      n07Clues: Array.isArray(saved.n07Clues) ? saved.n07Clues.slice(-8) as FacilityProgress["n07Clues"] : [],
      recordSearches: Array.isArray(saved.recordSearches) ? saved.recordSearches.slice(-12) : [],
    };
  } catch { return fallback; }
}

export function saveFacilityProgress(progress: FacilityProgress) {
  try { localStorage.setItem(FACILITY_KEY, JSON.stringify({ ...progress, pose: safeFacilityPose(progress.location, progress.pose) })); } catch { /* optional persistence */ }
}

export function clearFacilityProgress() { try { localStorage.removeItem(FACILITY_KEY); } catch { /* optional persistence */ } }

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
