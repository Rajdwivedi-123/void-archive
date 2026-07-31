"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type { ArtifactId } from "@/artifacts/inspection";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import { createSession, deriveSnapshot, loadSession, saveSession } from "./sessionState";
import type { PointerSample, RealityMode, RealitySession, RealitySnapshot, RealityStore } from "./realityTypes";

function makeStore(): RealityStore {
  let session: RealitySession = createSession();
  let snapshot = deriveSnapshot(session);
  let activeInspection: { id: ArtifactId; at: number } | null = null;
  const listeners = new Set<() => void>();
  const runtime = {
    activeArtifact: null,
    mode: "journey" as RealityMode,
    reducedMotion: false,
    qualityTier: "desktop" as DeviceTier,
    pointer: { x: .5, y: .5, at: 0 },
    pointerHistory: [] as PointerSample[],
    freezeActive: false,
    projectedX: .5,
    projectedY: .5,
    projectedVisible: true,
  };
  const publish = (next: RealitySession) => {
    session = next;
    snapshot = deriveSnapshot(session);
    saveSession(session);
    listeners.forEach((listener) => listener());
  };
  const patch = (values: Partial<RealitySession>) => publish({ ...session, ...values });
  return {
    runtime,
    getSnapshot: () => snapshot,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    hydrate: () => publish(loadSession()),
    setContext: (activeArtifact, mode, reducedMotion, qualityTier) => Object.assign(runtime, { activeArtifact, mode, reducedMotion, qualityTier }),
    recordPointer: (sample) => { runtime.pointer = sample; runtime.pointerHistory.push(sample); if (runtime.pointerHistory.length > 24) runtime.pointerHistory.shift(); },
    setProjection: (projectedX, projectedY, projectedVisible) => Object.assign(runtime, { projectedX, projectedY, projectedVisible }),
    beginInspection: (id) => { activeInspection = { id, at: performance.now() }; },
    endInspection: (id) => {
      if (!activeInspection || activeInspection.id !== id) return;
      const elapsed = Math.min(120000, performance.now() - activeInspection.at);
      activeInspection = null;
      patch({ inspectionMs: { ...session.inspectionMs, [id]: (session.inspectionMs[id] ?? 0) + elapsed } });
    },
    revisit: (id) => patch({ revisits: { ...session.revisits, [id]: (session.revisits[id] ?? 0) + 1 }, totalInteractions: session.totalInteractions + 1 }),
    openRecord: (id, code) => {
      const key = `${id}:${code}`;
      patch({ recordsOpened: session.recordsOpened.includes(key) ? session.recordsOpened : [...session.recordsOpened, key].slice(-24), totalInteractions: session.totalInteractions + 1 });
    },
    recordControl: (id, value) => {
      const common = { totalInteractions: session.totalInteractions + 1 };
      if (id === "001") patch({ ...common, maxGravityIntensity: Math.max(session.maxGravityIntensity, value) });
      if (id === "002") patch({ ...common, mirrorObservationDepth: Math.max(session.mirrorObservationDepth, Math.abs(value - .5) * 2) });
      if (id === "003") {
        const index = value < .34 ? 0 : value > .66 ? 2 : 1;
        const temporalExploration = [...session.temporalExploration] as [number, number, number];
        temporalExploration[index] += 1;
        patch({ ...common, temporalExploration, event13Discovered: session.event13Discovered || index === 2 && temporalExploration[2] >= 1 });
      }
      if (id === "004") patch({ ...common, neuralAdaptation: Math.max(session.neuralAdaptation, Math.min(1, value * .72 + snapshot.observerConfidence * .28)) });
      if (id === "005") patch(common);
      if (id === "006") patch({ ...common, memoryRecallDepth: Math.max(session.memoryRecallDepth, value) });
    },
    recordVoidProbe: () => patch({ voidProbeCount: session.voidProbeCount + 1, totalInteractions: session.totalInteractions + 1 }),
    unlockArchive: () => patch({ archiveUnlocked: true }),
    markFreezeSeen: () => patch({ realityFreezeSeen: true }),
    setFreezeActive: (active) => { runtime.freezeActive = active; },
  };
}

const RealityContext = createContext<RealityStore | null>(null);

export function RealityProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  useEffect(() => {
    store.hydrate();
  }, [store]);
  useEffect(() => {
    let last = 0;
    const pointer = (event: PointerEvent) => {
      if (event.timeStamp - last < 48 || innerWidth < 700) return;
      last = event.timeStamp;
      store.recordPointer({ x: event.clientX / innerWidth, y: event.clientY / innerHeight, at: event.timeStamp });
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    return () => window.removeEventListener("pointermove", pointer);
  }, [store]);
  return <RealityContext.Provider value={store}>{children}</RealityContext.Provider>;
}

export function useReality() {
  const store = useContext(RealityContext);
  if (!store) throw new Error("RealityProvider is missing");
  return store;
}

export function useRealitySnapshot() {
  const store = useReality();
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot) as RealitySnapshot;
}
