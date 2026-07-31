"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRealitySnapshot } from "@/reality/RealityProvider";
import type { ArtifactId } from "@/artifacts/inspection";
import { ArchiveAudioEngine } from "./audioEngine";
import type { ArchiveAudioContextValue, ArchiveAudioScene, ObserverAudioProfile } from "./audioTypes";

const AUDIO_PREFERENCE_KEY = "void-archive.audio.preferred.v1";
const preferenceEvent = "void-archive-audio-preference";

function subscribePreference(listener: () => void) {
  window.addEventListener("storage", listener); window.addEventListener(preferenceEvent, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(preferenceEvent, listener); };
}
function readPreference() { try { return localStorage.getItem(AUDIO_PREFERENCE_KEY) === "on"; } catch { return false; } }
function writePreference(enabled: boolean) { try { localStorage.setItem(AUDIO_PREFERENCE_KEY, enabled ? "on" : "off"); window.dispatchEvent(new Event(preferenceEvent)); } catch { /* preference is optional */ } }

const AudioContextValue = createContext<ArchiveAudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const engineRef = useRef<ArchiveAudioEngine | null>(null);
  const sceneRef = useRef<ArchiveAudioScene | null>(null);
  const reality = useRealitySnapshot();
  const preferenceRemembered = useSyncExternalStore(subscribePreference, readPreference, () => false);
  const profile: ObserverAudioProfile = useMemo(() => ({
    archetype: reality.archetype, affinity: reality.affinity, observerConfidence: reality.observerConfidence,
    returningVisitor: reality.returningVisitor, n07Route: reality.n07Route, event13Discovered: reality.event13Discovered,
  }), [reality.affinity, reality.archetype, reality.event13Discovered, reality.n07Route, reality.observerConfidence, reality.returningVisitor]);
  const profileRef = useRef(profile);

  const engine = useCallback(() => {
    if (!engineRef.current) engineRef.current = new ArchiveAudioEngine();
    return engineRef.current;
  }, []);
  const activate = useCallback(async () => {
    const audioEngine = engine();
    if (sceneRef.current) audioEngine.updateScene(sceneRef.current, profileRef.current);
    await audioEngine.activate(profileRef.current);
    writePreference(true); setEnabled(true);
  }, [engine]);
  const mute = useCallback(() => { engineRef.current?.mute(); writePreference(false); setEnabled(false); }, []);
  const toggle = useCallback(() => { if (enabled) mute(); else void activate(); }, [activate, enabled, mute]);
  const syncScene = useCallback((scene: ArchiveAudioScene) => { sceneRef.current = scene; engineRef.current?.updateScene(scene, profileRef.current); }, []);
  const cueInteraction = useCallback<ArchiveAudioContextValue["cueInteraction"]>((kind) => engineRef.current?.cueInteraction(kind), []);
  const cueControl = useCallback((artifact: ArtifactId, value: number) => engineRef.current?.cueControl(artifact, value), []);
  const diagnostics = useCallback(() => engineRef.current?.diagnostics() ?? {
    contextState: "uninitialized", active: false, masterGain: 0, ambienceGain: 0, artifactGain: 0,
    interactionGain: 0, transitionGain: 0, ambienceFilterHz: 0, limiterReductionDb: 0, connectedToDestination: false,
    currentArtifact: null, persistentSources: 0, transientSources: 0,
  }, []);

  useEffect(() => { if (sceneRef.current) engineRef.current?.updateScene(sceneRef.current, profile); }, [profile]);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => () => engineRef.current?.mute(), []);
  const value = useMemo<ArchiveAudioContextValue>(() => ({ enabled, preferenceRemembered, activate, mute, toggle, syncScene, cueInteraction, cueControl, diagnostics }), [activate, cueControl, cueInteraction, diagnostics, enabled, mute, preferenceRemembered, syncScene, toggle]);
  return <AudioContextValue.Provider value={value}>{children}</AudioContextValue.Provider>;
}

export function useArchiveAudio() {
  const value = useContext(AudioContextValue);
  if (!value) throw new Error("AudioProvider is missing");
  return value;
}
