"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import type { NexusInteractionId } from "@/game/gameTypes";
import type { NexusControlStore } from "@/game/NexusControlStore";
import type { N07LevelProgress } from "@/game/n07Level";

const areaLabel: Record<N07LevelProgress["area"], string> = {
  threshold: "THRESHOLD PASSAGE", reconstruction: "RECONSTRUCTED ARCHIVE", causal: "CAUSAL CORRIDOR", missing: "MISSING SECTOR", observer: "OBSERVER CHAMBER", exterior: "FINAL ARCHIVE EXTERIOR",
};

const targetLabel: Partial<Record<NexusInteractionId, string>> = {
  "n07-cross-threshold": "CROSS THE BOUNDARY", "n07-topology-visible": "ACCEPT VISIBLE ROUTE", "n07-topology-missing": "TRACE MISSING ROUTE",
  "n07-causal-pre": "PLACE PRE-RECORD", "n07-causal-signal": "PLACE SIGNAL RESPONSE", "n07-causal-containment": "PLACE CONTAINMENT CHANGE", "n07-causal-arrival": "PLACE OBSERVER ARRIVAL",
  "n07-observer-direct": "ANSWER IMMEDIATELY", "n07-observer-wait": "WITHHOLD RESPONSE", "n07-route-model": "FOLLOW ARCHIVE MODEL", "n07-route-contradiction": "FOLLOW CONTRADICTION",
  "n07-secret": "EXAMINE UNREGISTERED SEAM", "n07-traversal": "CROSS UNSTABLE INTERVAL", "n07-final-stabilize": "STABILIZE THE RECORD", "n07-final-preserve": "PRESERVE THE CONTRADICTION", "n07-return": "RETURN TO CHANGED NEXUS",
};

function objective(progress: N07LevelProgress) {
  if (progress.completed) return "RETURN VECTOR AVAILABLE";
  if (progress.area === "threshold") return "CROSS THE PHYSICAL THRESHOLD";
  if (progress.area === "reconstruction") return "IDENTIFY THE ROUTE THE MODEL CANNOT DRAW";
  if (progress.area === "causal") return `RECONSTRUCT EVENT 13 / ${progress.causalSequence.length} OF 4`;
  if (progress.area === "missing") return progress.route ? "LOCATE OBSERVER CHAMBER" : "CHOOSE A PHYSICAL INTERPRETATION";
  if (progress.area === "observer") return progress.observerSolved ? "TRAVERSE THE UNSTABLE INTERVAL" : "BREAK THE PREDICTION LOOP";
  return "DECIDE WHAT THE ARCHIVE SHOULD REMEMBER";
}

function TouchPad({ controls }: { controls: NexusControlStore }) {
  const hold = (key: "forward" | "backward" | "left" | "right") => ({ onPointerDown: () => controls.setMovement(key, true), onPointerUp: () => controls.setMovement(key, false), onPointerCancel: () => controls.setMovement(key, false), onPointerLeave: () => controls.setMovement(key, false) });
  return <div className="pointer-events-auto grid w-32 grid-cols-3 gap-1" aria-label="Movement controls"><span /><button type="button" className="h-11 border border-white/16 bg-black/55 text-[10px] text-white/55" {...hold("forward")}>W</button><span /><button type="button" className="h-11 border border-white/16 bg-black/55 text-[10px] text-white/55" {...hold("left")}>A</button><span /><button type="button" className="h-11 border border-white/16 bg-black/55 text-[10px] text-white/55" {...hold("right")}>D</button><span /><button type="button" className="h-11 border border-white/16 bg-black/55 text-[10px] text-white/55" {...hold("backward")}>S</button></div>;
}

function TouchLook({ controls }: { controls: NexusControlStore }) {
  const point = useRef<{ x: number; y: number } | null>(null);
  const start = (event: ReactPointerEvent) => { point.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); };
  const move = (event: ReactPointerEvent) => { if (!point.current) return; controls.addLook(event.clientX - point.current.x, event.clientY - point.current.y); point.current = { x: event.clientX, y: event.clientY }; };
  const end = () => { point.current = null; };
  return <div aria-label="Swipe to look" className="pointer-events-auto absolute bottom-24 right-0 top-24 z-0 w-[48%] touch-none" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} />;
}

export function N07LevelHUD({ progress, target, tier, controls, notice, onInteract }: { progress: N07LevelProgress; target: NexusInteractionId | null; tier: DeviceTier; controls: NexusControlStore; notice: string | null; onInteract: () => void }) {
  const [intro, setIntro] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setIntro(false), 2600); return () => window.clearTimeout(timer); }, []);
  return <section className="pointer-events-none fixed inset-0 z-[46] overflow-hidden text-white" aria-label="N-07 playable level interface">
    <div className="absolute left-4 top-5 border-l border-white/20 pl-4 sm:left-8 sm:top-8"><p className="text-[7px] tracking-[.38em] text-white/34">N-07 / NONLOCAL INTERIOR</p><p className="mt-2 text-[9px] tracking-[.26em] text-white/72">{areaLabel[progress.area]}</p><p className="mt-2 max-w-[76vw] text-[7px] tracking-[.18em] text-white/34">{objective(progress)}</p></div>
    <div className="absolute right-4 top-5 text-right sm:right-8 sm:top-8"><p className="text-[6px] tracking-[.25em] text-white/27">VECTOR / {progress.vector.toUpperCase()}</p><p className="mt-2 text-[6px] tracking-[.2em] text-white/25">ROUTE / {(progress.route ?? "UNRESOLVED").toUpperCase()}</p></div>
    <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2"><span className="absolute left-1/2 top-0 h-2 w-px bg-white/45" /><span className="absolute left-0 top-1/2 h-px w-2 bg-white/45" /></div>
    {(intro || notice) && <p className="absolute left-1/2 top-[64%] max-w-[88vw] -translate-x-1/2 border border-white/12 bg-black/60 px-4 py-3 text-center text-[7px] tracking-[.22em] text-white/55 backdrop-blur-sm">{notice ?? "BOUNDARY DEPTH CONFIRMED / SPACE REMAINS CONTIGUOUS"}</p>}
    {target && targetLabel[target] && <button type="button" onClick={onInteract} className="pointer-events-auto absolute bottom-9 left-1/2 z-20 min-h-12 -translate-x-1/2 border border-white/28 bg-black/62 px-6 text-[8px] tracking-[.25em] text-white/78 backdrop-blur-sm">{targetLabel[target]}<span className="mt-1 block text-[6px] text-white/30">{tier === "desktop" ? "E / INTERACT" : "TAP / INTERACT"}</span></button>}
    {tier !== "desktop" && <><TouchLook controls={controls} /><div className="absolute bottom-5 left-4"><TouchPad controls={controls} /></div></>}
  </section>;
}

export function N07Completion({ progress, onReturn }: { progress: N07LevelProgress; onReturn: () => void }) {
  if (!progress.completed || !progress.finalAction) return null;
  return <section className="fixed inset-0 z-[67] grid place-items-center bg-black/74 p-5 text-white backdrop-blur-sm" aria-label="N-07 traversal record">
    <div className="w-full max-w-2xl border border-white/13 bg-[#020405]/94 p-6 text-center sm:p-10"><p className="text-[7px] tracking-[.42em] text-white/30">NONLOCAL TRAVERSAL / PERSISTED</p><h2 className="mt-6 text-2xl tracking-[.25em] sm:text-4xl">{progress.finalAction === "stabilize" ? "THE MODEL HOLDS" : "THE CONTRADICTION REMAINS"}</h2><p className="mx-auto mt-6 max-w-lg text-[8px] leading-6 tracking-[.16em] text-white/40">The archive does not close. It now contains evidence of a place reached through the observer&apos;s interpretation.</p><div className="mt-7 grid grid-cols-2 gap-px border-y border-white/10 py-4 text-left text-[7px] leading-6 tracking-[.18em] text-white/35"><p>VECTOR<br /><span className="text-white/70">{progress.vector.toUpperCase()}</span></p><p>ROUTE<br /><span className="text-white/70">{progress.route?.toUpperCase()}</span></p><p>EVENT 13<br /><span className="text-white/70">RECONSTRUCTED</span></p><p>DEEP RECORD<br /><span className="text-white/70">{progress.secretFound ? "RECOVERED" : "UNRESOLVED"}</span></p></div><button type="button" onClick={onReturn} className="mt-8 min-h-12 border border-white/25 px-7 text-[8px] tracking-[.3em] text-white/72">RETURN TO NEXUS</button></div>
  </section>;
}
