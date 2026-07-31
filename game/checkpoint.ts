import { defaultNexusPose, type NexusCheckpoint, type PlayerPose } from "./gameTypes";

const CHECKPOINT_KEY = "void-archive.game.v1";

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
