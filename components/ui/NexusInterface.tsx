"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { FacilityProgress, FacilityRoom, NexusInteractionId } from "@/game/gameTypes";
import type { NexusControlStore } from "@/game/NexusControlStore";
import type { DeviceTier } from "@/hooks/useDeviceProfile";
import type { RealitySnapshot } from "@/reality/realityTypes";
import { resolveFacilityMutations } from "@/game/facilityMutations";

const interactionCopy: Record<NexusInteractionId, { title: string; action: string; measure: string }> = {
  "observation-gate": { title: "OBSERVATION PROTOCOL", action: "BEGIN OBSERVATION", measure: "SECTOR ACCESS / 01–06" },
  "archive-map": { title: "ARCHIVE MAP INSTALLATION", action: "OPEN ARCHIVE", measure: "SPATIAL INDEX / PARTIAL" },
  "system-terminal": { title: "SYSTEM NODE", action: "OPEN TERMINAL", measure: "LOCAL STATUS / AVAILABLE" },
  "scanner-array": { title: "MEASUREMENT ARRAY", action: "TOGGLE SCANNER", measure: "COORDINATE RETURN / STABLE" },
  "restricted-sector": { title: "N-06 CONTAINMENT", action: "VERIFY ACCESS", measure: "ACCESS / RESTRICTED" },
  "event-seven": { title: "UNINDEXED STRUCTURE", action: "MEASURE", measure: "ACTIVE SECTOR COUNT / 7" },
  "route-record-vault": { title: "RECORD ACCESS", action: "ENTER VAULT", measure: "ROUTE / OPTIONAL" },
  "route-signal-room": { title: "SIGNAL ANALYSIS", action: "ENTER SIGNAL ROOM", measure: "SIGNAL 7A / UNRESOLVED" },
  "route-dead-sector": { title: "UNINDEXED PASSAGE", action: "ENTER DEAD SECTOR", measure: "LOCATION / NOT PRESENT" },
  "route-observation-deck": { title: "ARCHIVE OVERLOOK", action: "ENTER OBSERVATION DECK", measure: "VERTICAL RETURN / UNBOUNDED" },
  "route-maintenance-spine": { title: "LOWER UTILITY ROUTE", action: "ENTER MAINTENANCE SPINE", measure: "ROUTE / CONDITIONAL" },
  "return-nexus": { title: "NEXUS LINK", action: "RETURN TO NEXUS", measure: "ROUTE / STABLE" },
  "return-record-vault": { title: "RECORD ACCESS", action: "RETURN TO VAULT", measure: "ROUTE / STABLE" },
  "return-signal-room": { title: "SIGNAL ACCESS", action: "RETURN TO SIGNAL ROOM", measure: "ROUTE / STABLE" },
  "record-search": { title: "VAULT SEARCH TERMINAL", action: "SEARCH RECORDS", measure: "INDEX DEPTH / CONDITIONAL" },
  "signal-analysis": { title: "SIGNAL 7A RECEIVER", action: "ANALYZE SIGNAL", measure: "ORIGIN / INSIDE FACILITY" },
  "dead-sector-scan": { title: "EMPTY CONTAINMENT", action: "SCAN CHAMBER", measure: "CONTAINMENT SIGNATURE / ACTIVE" },
  "observation-instrument": { title: "NONLOCAL OBSERVATION", action: "USE INSTRUMENT", measure: "VISIBLE STRUCTURE / UNINDEXED" },
  "shortcut-control": { title: "ROUTE CONTROL", action: "UNLOCK SHORTCUT", measure: "NEXUS-SIGNAL / DORMANT" },
  "hidden-passage": { title: "WALL DEPTH MISMATCH", action: "VERIFY PASSAGE", measure: "PHYSICAL DEPTH / +4.3 M" },
  "n07-gate": { title: "N-07", action: "VERIFY ACCESS", measure: "LOCATION / NONLOCAL" },
  "corridor-marker": { title: "ROUTE IDENTIFIER", action: "OBSERVE LABEL", measure: "LABEL RETURN / INCONSISTENT" },
};

const roomNames: Record<FacilityRoom, string> = {
  nexus: "ARCHIVE NEXUS", "record-vault": "RECORD VAULT", "signal-room": "SIGNAL ROOM", "dead-sector": "DEAD SECTOR", "observation-deck": "OBSERVATION DECK", "maintenance-spine": "MAINTENANCE SPINE",
};

type NexusHudProps = {
  entered: boolean;
  active: boolean;
  target: NexusInteractionId | null;
  scanner: boolean;
  pointerLocked: boolean;
  tier: DeviceTier;
  hasFinePointer: boolean;
  controls: NexusControlStore;
  session: RealitySnapshot;
  tutorialVisible: boolean;
  notice: string | null;
  room: FacilityRoom;
  progress: FacilityProgress;
  objective: string;
  onEnter: () => void;
  onBegin: () => void;
  onArchive: () => void;
  onSystem: () => void;
  onInteract: () => void;
  onScanner: () => void;
};

export function NexusHUD({ entered, active, target, scanner, pointerLocked, tier, hasFinePointer, controls, session, tutorialVisible, notice, room, progress, objective, onEnter, onBegin, onArchive, onSystem, onInteract, onScanner }: NexusHudProps) {
  const mutations = resolveFacilityMutations(progress.consequences);
  const look = useRef<{ x: number; y: number } | null>(null);
  const [usedControls, setUsedControls] = useState({ move: false, look: false, interact: false, scanner: false, release: false });
  const touch = tier !== "desktop" || !hasFinePointer;
  const markUsed = useCallback((control: keyof typeof usedControls) => setUsedControls((current) => current[control] ? current : { ...current, [control]: true }), []);
  useEffect(() => {
    if (!entered || !active || touch) return;
    const onKey = (event: KeyboardEvent) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) markUsed("move");
      if (event.code === "KeyE" && target) markUsed("interact");
      if (event.code === "KeyQ") markUsed("scanner");
      if (event.code === "Escape" && pointerLocked) markUsed("release");
    };
    const onMouse = (event: MouseEvent) => { if (pointerLocked && (event.movementX || event.movementY)) markUsed("look"); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousemove", onMouse);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousemove", onMouse); };
  }, [active, entered, markUsed, pointerLocked, target, touch]);
  const setMove = (key: "forward" | "backward" | "left" | "right", value: boolean) => { if (value) markUsed("move"); controls.setMovement(key, value); };
  const lookStart = (event: ReactPointerEvent) => { look.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); };
  const lookMove = (event: ReactPointerEvent) => {
    if (!look.current) return;
    controls.addLook(event.clientX - look.current.x, event.clientY - look.current.y);
    markUsed("look");
    look.current = { x: event.clientX, y: event.clientY };
  };
  const lookEnd = () => { look.current = null; };

  return (
    <div className={`fixed inset-0 z-30 text-white ${active ? "pointer-events-none" : ""}`} data-nexus-ui>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-8 lg:p-10">
        <div className="border-l border-white/24 pl-4">
          <p className="text-[8px] tracking-[.46em] text-white/38">VOID ARCHIVE</p>
          <p className="mt-2 text-[11px] tracking-[.32em] text-white/82">{roomNames[room]}</p>
          <p className="mt-3 max-w-64 text-[7px] tracking-[.26em] text-white/34">ARCHIVE DIRECTIVE<br /><span className="mt-1 inline-block text-white/72">{objective}</span><br />ROOM INDEX / {String(progress.discoveredRooms.length).padStart(2, "0")}</p>
        </div>
        <div className="text-right text-[7px] leading-5 tracking-[.25em] text-white/32">
          <p>{session.returningVisitor ? "OBSERVER 07 DETECTED" : "OBSERVER / UNREGISTERED"}</p>
          <p>SECTORS / 01–06</p>
          <p className={mutations.rareTopology ? "text-[#c1b2a8]/62" : "text-white/18"}>ACTIVE COUNT / {mutations.activeSectorCount}</p>
          {mutations.temporalEarlyResponse && <p className="text-white/28">RESPONSE / PRE-AUTHORIZED</p>}
        </div>
      </div>

      {entered && <>
        <div className={`pointer-events-none absolute left-1/2 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all ${target ? "scale-150 border-white/80 bg-white/20" : "border-white/38"}`} aria-hidden="true" />
        {target && <div className="pointer-events-none absolute left-1/2 top-[calc(50%+1.4rem)] -translate-x-1/2 text-center">
          <p className="text-[7px] tracking-[.3em] text-white/42">{interactionCopy[target].title}</p>
          <p className="mt-2 text-[8px] tracking-[.34em] text-white/82"><span className="border border-white/25 px-2 py-1">{touch ? "TAP / INTERACT" : "E / INTERACT"}</span></p>
          <p className="mt-3 text-[6px] tracking-[.28em] text-white/42">{interactionCopy[target].action}</p>
        </div>}
        {scanner && <div className="pointer-events-none absolute inset-4 border border-white/[.07] sm:inset-7">
          <div className="absolute left-3 top-3 border-l border-white/28 pl-3 text-[7px] leading-5 tracking-[.26em] text-white/42">SCANNER / ACTIVE<br />{target ? interactionCopy[target].measure : "RETURN / NO LOCAL ANOMALY"}</div>
          <div className="absolute bottom-3 right-3 text-right text-[6px] leading-4 tracking-[.24em] text-white/24">AZ 00.42 / EL 01.72<br />FIELD RESOLUTION / LOW</div>
        </div>}
        {notice && <div className="pointer-events-none absolute bottom-28 left-1/2 -translate-x-1/2 border-l border-white/25 bg-black/45 px-4 py-3 text-center text-[7px] tracking-[.26em] text-white/58 backdrop-blur-sm">{notice}</div>}
        {tutorialVisible && !touch && <div className="pointer-events-none absolute bottom-9 left-9 text-[7px] leading-6 tracking-[.28em] text-white/34">
          {!usedControls.move && <p className="transition-opacity">WASD / MOVE</p>}
          {!usedControls.look && <p className="transition-opacity">MOUSE / LOOK</p>}
          {!usedControls.interact && <p className="transition-opacity">E / INTERACT</p>}
          {!usedControls.scanner && <p className="transition-opacity">Q / SCANNER</p>}
          {!usedControls.release && <p className="transition-opacity">ESC / RELEASE</p>}
        </div>}
        {!touch && !pointerLocked && active && <p className="pointer-events-none absolute bottom-9 left-1/2 -translate-x-1/2 text-[7px] tracking-[.3em] text-white/34">CLICK WORLD / CAPTURE MOUSE</p>}
        <div className="pointer-events-auto absolute right-5 top-28 z-20 flex gap-1 opacity-55 transition-opacity hover:opacity-100 focus-within:opacity-100 sm:right-8 sm:top-32"><span className="self-center pr-2 text-[6px] tracking-[.24em] text-white/28">ACCESS</span>{room === "nexus" && <button type="button" aria-label="Accessibility shortcut: Begin Observation Protocol" onClick={onBegin} className="min-h-9 border border-white/10 bg-black/24 px-2 text-[6px] tracking-[.2em] text-white/38">OBSERVE</button>}<button type="button" aria-label="Accessibility shortcut: Open Nexus archive" onClick={onArchive} className="min-h-9 border border-white/10 bg-black/24 px-2 text-[6px] tracking-[.2em] text-white/34">ARCHIVE</button><button type="button" aria-label="Accessibility shortcut: Open Nexus system terminal" onClick={onSystem} className="min-h-9 border border-white/10 bg-black/24 px-2 text-[6px] tracking-[.2em] text-white/34">SYSTEM</button></div>
        <button type="button" onClick={() => { markUsed("scanner"); onScanner(); }} className="pointer-events-auto absolute bottom-5 right-5 z-20 min-h-11 border border-white/14 bg-black/36 px-4 text-[7px] tracking-[.25em] text-white/52 sm:bottom-8 sm:right-8">SCANNER / {scanner ? "ACTIVE" : "OFF"}</button>
      </>}

      {touch && entered && active && <>
        <div className="pointer-events-auto absolute bottom-5 left-5 grid h-28 w-28 grid-cols-3 grid-rows-3 gap-1 opacity-70">
          <button aria-label="Move forward" className="col-start-2 border border-white/12 bg-black/20 text-[11px] text-white/45" onClick={() => controls.pulseMovement("forward")} onPointerDown={() => setMove("forward", true)} onPointerUp={() => setMove("forward", false)} onPointerCancel={() => setMove("forward", false)}>↑</button>
          <button aria-label="Move left" className="row-start-2 border border-white/12 bg-black/20 text-[11px] text-white/45" onClick={() => controls.pulseMovement("left")} onPointerDown={() => setMove("left", true)} onPointerUp={() => setMove("left", false)} onPointerCancel={() => setMove("left", false)}>←</button>
          <button aria-label="Move backward" className="col-start-2 row-start-2 border border-white/12 bg-black/20 text-[11px] text-white/45" onClick={() => controls.pulseMovement("backward")} onPointerDown={() => setMove("backward", true)} onPointerUp={() => setMove("backward", false)} onPointerCancel={() => setMove("backward", false)}>↓</button>
          <button aria-label="Move right" className="col-start-3 row-start-2 border border-white/12 bg-black/20 text-[11px] text-white/45" onClick={() => controls.pulseMovement("right")} onPointerDown={() => setMove("right", true)} onPointerUp={() => setMove("right", false)} onPointerCancel={() => setMove("right", false)}>→</button>
        </div>
        <div aria-label="Swipe to look" className="pointer-events-auto absolute bottom-20 right-0 top-24 w-[48%] touch-none" onPointerDown={lookStart} onPointerMove={lookMove} onPointerUp={lookEnd} onPointerCancel={lookEnd} />
        {target && <button type="button" onClick={() => { markUsed("interact"); onInteract(); }} className="pointer-events-auto absolute bottom-20 right-5 min-h-12 border border-white/22 bg-black/48 px-5 text-[8px] tracking-[.28em] text-white/74">INTERACT</button>}
      </>}

      {!entered && room === "nexus" && <div className="pointer-events-auto absolute inset-0 flex items-end bg-gradient-to-t from-black/82 via-black/10 to-black/25 p-5 sm:items-center sm:p-10">
        <section className="w-full max-w-xl border-l border-white/28 bg-black/38 px-6 py-7 backdrop-blur-[3px] sm:px-9 sm:py-9">
          <p className="text-[8px] tracking-[.5em] text-white/36">VOID ARCHIVE</p>
          <h2 className="mt-5 text-2xl font-medium tracking-[.28em] text-white/92 sm:text-4xl">ARCHIVE NEXUS</h2>
          <div className="mt-7 grid grid-cols-2 gap-5 border-y border-white/10 py-5 text-[7px] leading-5 tracking-[.28em]"><p className="text-white/28">CLEARANCE<br /><span className="text-white/72">OBSERVER</span></p><p className="text-white/28">ARCHIVE STATUS<br /><span className="text-white/72">UNSTABLE</span></p></div>
          {session.returningVisitor && <p className="mt-5 text-[7px] tracking-[.28em] text-white/48">OBSERVER 07 DETECTED / CHECKPOINT RESTORED</p>}
          <button type="button" onClick={onEnter} className="mt-7 min-h-14 w-full border border-white/42 bg-white/[.055] px-5 text-[9px] tracking-[.34em] text-white/92">ENTER NEXUS</button>
          <div className="mt-3 flex flex-wrap items-center gap-1 opacity-60"><span className="mr-2 text-[6px] tracking-[.24em] text-white/28">OPTIONAL DIRECT ACCESS</span><button type="button" onClick={onBegin} className="min-h-9 border border-white/10 px-3 text-[6px] tracking-[.21em] text-white/46">OBSERVE</button><button type="button" onClick={onArchive} className="min-h-9 border border-white/10 px-3 text-[6px] tracking-[.21em] text-white/40">ARCHIVE</button><button type="button" onClick={onSystem} className="min-h-9 border border-white/10 px-3 text-[6px] tracking-[.21em] text-white/40">SYSTEM</button></div>
          <p className="mt-6 text-[7px] leading-5 tracking-[.22em] text-white/24">MOVE THROUGH THE HALL. APPROACH ARCHITECTURE TO INTERACT.<br />OBSERVATION PROTOCOL REMAINS AVAILABLE INSIDE THE NEXUS.</p>
        </section>
      </div>}
    </div>
  );
}

export function NexusTerminal({ open, session, progress, onClose, onArchive }: { open: boolean; session: RealitySnapshot; progress: FacilityProgress; onClose: () => void; onArchive: () => void }) {
  const [tab, setTab] = useState<"status" | "index" | "map" | "session">("status");
  const mutations = resolveFacilityMutations(progress.consequences);
  if (!open) return null;
  return (
    <section className="fixed inset-0 z-[48] flex items-center justify-center bg-black/72 p-4 text-white backdrop-blur-md" aria-label="Nexus system terminal">
      <div className="w-full max-w-4xl border border-white/14 bg-[#050707]/95 p-5 sm:p-8">
        <header className="flex items-start justify-between border-b border-white/12 pb-5"><div><p className="text-[8px] tracking-[.45em] text-white/34">SYSTEM NODE / NEXUS LOCAL</p><h2 className="mt-3 text-xl tracking-[.3em] sm:text-3xl">ARCHIVE SYSTEM</h2></div><button type="button" onClick={onClose} className="min-h-11 border-l border-white/20 pl-4 text-[8px] tracking-[.26em] text-white/58">ESC / BACK</button></header>
        <nav className="flex gap-5 overflow-x-auto border-b border-white/8 py-4">{(["status", "index", "map", "session"] as const).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`min-h-10 text-[8px] tracking-[.27em] ${tab === item ? "text-white" : "text-white/32"}`}>{item.toUpperCase()}</button>)}</nav>
        <div className="min-h-72 py-7">
          {tab === "status" && <div className="grid gap-6 sm:grid-cols-3"><TerminalMetric label="ARCHIVE STATUS" value={mutations.rareTopology ? "TOPOLOGY UNSTABLE" : "UNSTABLE"} /><TerminalMetric label="ACTIVE SECTOR COUNT" value={mutations.activeSectorCount} muted /><TerminalMetric label="INDEXED SECTORS" value="01–06" /><TerminalMetric label="OBSERVATION" value={session.archiveUnlocked ? "COMPLETE" : "AVAILABLE"} /><TerminalMetric label="NEXUS RETURN" value={mutations.gravityBent ? "MISALIGNED" : "STABLE"} /><TerminalMetric label="LOCAL GEOMETRY" value={mutations.voidAbsence ? "INCOMPLETE / NULL" : "NOMINAL"} /></div>}
          {tab === "index" && <div className="space-y-3">{[1,2,3,4,5,6].map((index) => <div key={index} className="flex justify-between border-b border-white/8 py-3 text-[8px] tracking-[.25em]"><span className="text-white/56">N-{String(index).padStart(2,"0")}</span><span className={index === 1 || index <= session.visitOrder.length ? "text-white/62" : "text-white/22"}>{index === 1 ? "OBSERVATION ACCESS" : index <= session.visitOrder.length ? "OBSERVED / RESTRICTED" : "UNRESOLVED"}</span></div>)}</div>}
          {tab === "map" && <div><p className="max-w-xl text-[9px] leading-6 tracking-[.22em] text-white/44">PHYSICAL NEXUS INSTALLATION AND ARCHIVE SECTOR MODEL SHARE SIX REGISTERED COORDINATES. FACILITY ROUTES ARE APPENDED ONLY AFTER PHYSICAL DISCOVERY.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{progress.discoveredRooms.map((room) => <p key={room} className="border-l border-white/12 pl-3 text-[7px] tracking-[.23em] text-white/48">{room.toUpperCase().replaceAll("-", " ")}</p>)}{progress.n07Clues.length > 0 && <p className="border-l border-white/18 pl-3 text-[7px] tracking-[.23em] text-white/32">N-07 / LOCATION UNRESOLVED</p>}</div><p className="mt-5 text-[7px] tracking-[.22em] text-white/24">SHORTCUTS / {progress.unlockedShortcuts.length} · UNRESOLVED ROUTES / {progress.hiddenPassageDiscovered ? 1 : 2}</p><button type="button" onClick={onArchive} className="mt-7 min-h-11 border border-white/20 px-5 text-[8px] tracking-[.27em] text-white/68">OPEN DETAILED MAP</button></div>}
          {tab === "session" && <div className="grid gap-6 sm:grid-cols-2"><TerminalMetric label="OBSERVER" value={session.returningVisitor ? "SUBJECT 07" : "UNREGISTERED"} /><TerminalMetric label="PROFILE" value={session.archetype.toUpperCase()} /><TerminalMetric label="DISCOVERIES" value={`${session.visitOrder.length} / 6 · ${progress.discoveredRooms.length} ROOMS`} /><TerminalMetric label="EVENT 13" value={session.event13Discovered ? "RECORDED" : "UNRESOLVED"} /><TerminalMetric label="N-07 CLUE ROUTES" value={String(progress.n07Clues.length)} /><TerminalMetric label="SIGNAL 7A" value={progress.signalResult ? "ISOLATED" : "UNRESOLVED"} /></div>}
        </div>
      </div>
    </section>
  );
}

function TerminalMetric({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) { return <div className="border-l border-white/14 pl-4"><p className="text-[7px] tracking-[.27em] text-white/27">{label}</p><p className={`mt-3 text-[10px] tracking-[.24em] ${muted ? "text-white/24" : "text-white/72"}`}>{value}</p></div>; }

export function NexusTransition({ visible, returning }: { visible: boolean; returning: boolean }) {
  return <div className={`pointer-events-none fixed inset-0 z-[55] flex items-center justify-center bg-black text-center text-white transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`} aria-hidden={!visible}><div><p className="text-[8px] tracking-[.48em] text-white/34">{returning ? "NEXUS LINK / RESTORING" : "OBSERVATION CONTROL"}</p><p className="mt-5 text-xl tracking-[.32em] text-white/82 sm:text-3xl">{returning ? "RETURN TO ARCHIVE NEXUS" : "OBSERVATION PROTOCOL"}</p><p className="mt-4 text-[7px] tracking-[.3em] text-white/26">{returning ? "PLAYER CONTROL / PENDING" : "SECTOR ACCESS / 01–06"}</p></div></div>;
}
