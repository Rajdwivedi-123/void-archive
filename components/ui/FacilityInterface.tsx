"use client";

import { useMemo, useState } from "react";
import type { FacilityProgress, FacilityRoom } from "@/game/gameTypes";
import type { RealitySnapshot } from "@/reality/realityTypes";

type RecordQuery = "VA-001" | "SUBJECT 07" | "EVENT 13" | "SIGNAL 7A" | "SECTOR N-07" | "DEAD SECTOR" | "OBJECT 005" | "ARCHIVE INITIALIZATION";

export function RecordSearch({ open, progress, session, onClose, onSearch }: { open: boolean; progress: FacilityProgress; session: RealitySnapshot; onClose: () => void; onSearch: (query: string, clue: boolean) => void }) {
  const [query, setQuery] = useState<RecordQuery>("VA-001");
  if (!open) return null;
  const progressed = session.archiveUnlocked || session.returningVisitor || progress.n07Clues.length >= 2;
  const investigation = progress.investigation;
  const result = query === "VA-001"
    ? { code: "CONTAINMENT / G-14", status: "VERIFIED", body: "Field geometry displaced before the first registered mass event." }
    : query === "SUBJECT 07"
      ? progressed ? { code: "OBSERVER RECORD / 07", status: "RECORD EXISTS", body: investigation.knowledgeFlags.includes("subject-07-identified") ? `CREATION TIME / FUTURE RELATIVE TO CURRENT SESSION · OBSERVER CLASS / ${session.archetype.toUpperCase()} · PRIMARY METHOD / ${session.affinity.toUpperCase()} · N-07 VECTOR / ${investigation.knowledgeFlags.includes("n07-spatial-vector") ? "SPATIAL" : investigation.knowledgeFlags.includes("n07-temporal-vector") ? "TEMPORAL" : "UNRESOLVED"} · UNRESOLVED MEMORY / NOT CURRENT SESSION` : "CREATION TIME / FUTURE RELATIVE TO CURRENT SESSION · ARCHIVE RESPONSE / OBSERVER MATCH PARTIAL" } : { code: "SUBJECT INDEX", status: "NO RECORD", body: "QUERY RETURN / NULL" }
      : query === "EVENT 13"
        ? session.event13Discovered || session.archetype === "chronologist" ? { code: "EVENT SEQUENCE / 13", status: "OBSERVER-DEPENDENT", body: `${session.archetype.toUpperCase()} TRACE / EVENT PRECEDES OBSERVATION` } : { code: "EVENT SEQUENCE", status: "INSUFFICIENT CLEARANCE", body: "TEMPORAL RECORD / REDACTED" }
        : query === "SIGNAL 7A"
          ? investigation.evidenceDiscovered.includes("S-7A") ? { code: "TRANSMISSION / 7A", status: "INTERNAL SOURCE", body: "DISTANCE / 43 M · TEMPORAL OFFSET / 04.731 SEC · FACILITY ORIGIN / DISPUTED" } : { code: "TRANSMISSION / 7A", status: "TRACE INCOMPLETE", body: "RECEIVER ANALYSIS REQUIRED" }
          : query === "DEAD SECTOR"
            ? investigation.evidenceDiscovered.includes("D-N00") ? { code: "SECTOR N-00", status: "SECTOR EMPTY", body: "SCANNER ADDENDUM / CONTAINMENT SIGNATURE ACTIVE · SYSTEM STATEMENT DISPROVEN" } : { code: "SECTOR N-00", status: "DECOMMISSIONED", body: "NO ACTIVE CONTAINMENT REGISTERED" }
            : query === "OBJECT 005"
              ? investigation.evidenceDiscovered.includes("V-NONLOCAL") ? { code: "OBJECT 005 / SPATIAL", status: "BOUNDARY NONLOCAL", body: "VISIBLE WIDTH / 12.0 M · ARCHIVE WIDTH / 18.4 M · MISSING INTERVAL / N-07 VECTOR" } : { code: "OBJECT 005 / SPATIAL", status: "OBJECT CONTAINED", body: "GEOMETRY RETURN / NOMINAL" }
              : query === "ARCHIVE INITIALIZATION"
                ? investigation.knowledgeFlags.includes("offset-04.731") ? { code: "INITIALIZATION / T-0", status: "PERMISSION GRANTED", body: "ARCHIVE CREATED / 04.731 SEC AFTER FIRST RECORD · FIRST RECORD / EVENT 13" } : { code: "INITIALIZATION / T-0", status: "KNOWLEDGE LOCK", body: "ENTERED TEMPORAL MODEL DOES NOT MATCH ARCHIVE OFFSET" }
                : { code: "SECTOR N-07", status: progress.n07Clues.length >= 3 || investigation.investigationStage === "n07-vector" ? "LOCATION NONLOCAL" : "ACCESS REDACTED", body: progress.n07Clues.length >= 3 || investigation.investigationStage === "n07-vector" ? "PHYSICAL ROUTE DISAGREES WITH ARCHIVE MAP" : "COORDINATE FIELD / WITHHELD" };
  const choose = (next: RecordQuery) => { setQuery(next); onSearch(next, next === "SUBJECT 07" && progressed); };
  return <section className="fixed inset-0 z-[52] flex items-center justify-center bg-black/78 p-4 text-white backdrop-blur-md" aria-label="Record Vault search terminal">
    <div className="w-full max-w-5xl border border-white/14 bg-[#040607]/95 p-5 sm:p-8">
      <header className="flex items-start justify-between border-b border-white/10 pb-5"><div><p className="text-[7px] tracking-[.45em] text-white/32">RECORD VAULT / SEARCH NODE</p><h2 className="mt-3 text-xl tracking-[.3em] sm:text-3xl">ARCHIVE QUERY</h2></div><button type="button" onClick={onClose} className="min-h-11 border-l border-white/18 pl-4 text-[8px] tracking-[.26em] text-white/56">ESC / BACK</button></header>
      <div className="grid gap-7 py-7 md:grid-cols-[15rem_1fr]">
        <nav className="max-h-[55vh] space-y-1 overflow-y-auto">{(["VA-001", "SUBJECT 07", "EVENT 13", "SIGNAL 7A", "SECTOR N-07", "DEAD SECTOR", "OBJECT 005", "ARCHIVE INITIALIZATION"] as RecordQuery[]).map((item) => <button key={item} type="button" onClick={() => choose(item)} className={`block min-h-11 w-full border-l px-4 text-left text-[8px] tracking-[.25em] ${query === item ? "border-white/54 text-white/82" : "border-white/10 text-white/34"}`}>{item}</button>)}</nav>
        <article className="min-h-72 border border-white/8 p-6"><p className="text-[7px] tracking-[.34em] text-white/28">{result.code}</p><p className="mt-7 text-sm tracking-[.28em] text-white/78">{result.status}</p><p className="mt-5 max-w-xl text-[9px] leading-7 tracking-[.2em] text-white/42">{result.body}</p><div className="mt-10 h-px w-full bg-white/8" /><p className="mt-5 text-[7px] tracking-[.24em] text-white/18">OBSERVER PROFILE / {session.archetype.toUpperCase()} · INDEX DEPTH / {progress.recordSearches.length + 1}</p></article>
      </div>
    </div>
  </section>;
}

export function SignalAnalysis({ open, session, complete, onClose, onComplete }: { open: boolean; session: RealitySnapshot; complete: boolean; onClose: () => void; onComplete: (result: string) => void }) {
  const target = useMemo(() => session.archetype === "chronologist" ? [.62, .44] : session.archetype === "cartographer" ? [.48, .68] : session.archetype === "synaptic" ? [.71, .58] : [.55, .52], [session.archetype]);
  const [phase, setPhase] = useState(.22);
  const [band, setBand] = useState(.52);
  const [offset, setOffset] = useState(.14);
  if (!open) return null;
  const aligned = Math.abs(phase - target[0]) < .09 && Math.abs(band - target[1]) < .09 && Math.abs(offset - .47) < .09;
  const result = session.archetype === "chronologist" ? "TEMPORAL SIGNATURE / EVENT 13" : session.archetype === "synaptic" ? "NEURAL PATTERN / ROUTED" : session.archetype === "mnemonist" ? "MEMORY RESONANCE / PRE-SESSION" : "N-07 COORDINATE / CONTRADICTORY";
  return <section className="fixed inset-0 z-[52] flex items-center justify-center bg-black/78 p-4 text-white backdrop-blur-md" aria-label="Signal 7A analysis">
    <div className="w-full max-w-4xl border border-white/14 bg-[#040607]/95 p-5 sm:p-8">
      <header className="flex items-start justify-between border-b border-white/10 pb-5"><div><p className="text-[7px] tracking-[.45em] text-white/32">SIGNAL ROOM / RECEIVER 7A</p><h2 className="mt-3 text-xl tracking-[.3em] sm:text-3xl">SIGNAL ANALYSIS</h2></div><button type="button" onClick={onClose} className="min-h-11 border-l border-white/18 pl-4 text-[8px] tracking-[.26em] text-white/56">ESC / BACK</button></header>
      <div className="py-7"><div className="grid gap-4 text-[7px] tracking-[.24em] text-white/34 sm:grid-cols-3"><p>ORIGIN<br /><span className="mt-2 block text-white/68">INSIDE FACILITY</span></p><p>DISTANCE<br /><span className="mt-2 block text-white/68">43 M</span></p><p>SOURCE<br /><span className="mt-2 block text-white/68">UNRESOLVED</span></p></div>
        <div className="relative mt-10 h-32 overflow-hidden border-y border-white/8">{Array.from({ length: 18 }, (_, i) => <span key={i} className="absolute top-1/2 h-px bg-white/35" style={{ left: `${i * 6}%`, width: "4%", transform: `translateY(${Math.sin(i * .9 + phase * 8) * band * 42}px)` }} />)}<div className="absolute inset-y-0 left-1/2 w-px bg-white/26" /></div>
        <div className="mt-8 grid gap-5 sm:grid-cols-3"><SignalControl label="PHASE" value={phase} setValue={setPhase} /><SignalControl label="FREQUENCY BAND" value={band} setValue={setBand} /><SignalControl label="TEMPORAL OFFSET" value={offset} setValue={setOffset} /></div>
        <button type="button" disabled={!aligned || complete} onClick={() => onComplete(result)} className="mt-8 min-h-12 border border-white/20 px-6 text-[8px] tracking-[.29em] text-white/68 disabled:text-white/18">{complete ? result : aligned ? "ISOLATE COMPONENT" : "ALIGN BANDS"}</button>
      </div>
    </div>
  </section>;
}

function SignalControl({ label, value, setValue }: { label: string; value: number; setValue: (value: number) => void }) {
  return <div className="border-l border-white/12 pl-4"><div className="flex justify-between text-[7px] tracking-[.25em] text-white/34"><span>{label}</span><span>{value.toFixed(2)}</span></div><input aria-label={label} type="range" min="0" max="1" step="0.02" value={value} onChange={(event) => setValue(Number(event.target.value))} className="mt-5 w-full accent-white" /><div className="mt-3 flex gap-2"><button type="button" aria-label={`Decrease ${label}`} onClick={() => setValue(Math.max(0, value - .05))} className="min-h-9 border border-white/10 px-4 text-[9px] text-white/45">−</button><button type="button" aria-label={`Increase ${label}`} onClick={() => setValue(Math.min(1, value + .05))} className="min-h-9 border border-white/10 px-4 text-[9px] text-white/45">+</button></div></div>;
}

export function ObservationInstrument({ open, session, onClose, onObserve }: { open: boolean; session: RealitySnapshot; onClose: () => void; onObserve: () => void }) {
  if (!open) return null;
  return <section className="fixed inset-0 z-[52] bg-black/88 p-5 text-white sm:p-10" aria-label="Observation Deck instrument">
    <div className="relative h-full overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_67%_44%,rgba(180,190,190,.09),transparent_18%),linear-gradient(#030505,#000)]">
      <div className="absolute inset-y-[12%] left-[14%] w-px bg-white/20" /><div className="absolute inset-x-[10%] top-1/2 h-px bg-white/14" />
      <div className="absolute left-[67%] top-[44%] h-40 w-24 -translate-x-1/2 -translate-y-1/2 border border-white/20 opacity-75"><div className="absolute -inset-5 border border-white/8" /><div className="absolute left-1/2 top-[-45%] h-[190%] w-px bg-white/20" /></div>
      <div className="absolute left-6 top-6 text-[7px] leading-6 tracking-[.3em] text-white/38">NONLOCAL OBSERVATION / ACTIVE<br />AZIMUTH / 07.13<br />OBSERVER / {session.archetype.toUpperCase()}</div>
      <div className="absolute bottom-7 left-6"><p className="text-[8px] tracking-[.33em] text-white/70">N-07 APERTURE / VISUAL RETURN</p><p className="mt-3 text-[7px] tracking-[.24em] text-white/28">PHYSICAL COORDINATE / ABSENT</p><button type="button" onClick={onObserve} className="mt-6 min-h-11 border border-white/18 px-5 text-[8px] tracking-[.26em] text-white/58">RECORD SIGHTING</button></div>
      <button type="button" onClick={onClose} className="absolute right-6 top-6 min-h-11 border-l border-white/18 pl-4 text-[8px] tracking-[.26em] text-white/52">ESC / EXIT</button>
    </div>
  </section>;
}

export function FacilityTransition({ visible, room }: { visible: boolean; room: FacilityRoom }) {
  const names: Record<FacilityRoom, string> = { nexus: "ARCHIVE NEXUS", "record-vault": "RECORD VAULT", "signal-room": "SIGNAL ROOM", "dead-sector": "DEAD SECTOR", "observation-deck": "OBSERVATION DECK", "maintenance-spine": "MAINTENANCE SPINE" };
  return <div className={`pointer-events-none fixed inset-0 z-[54] flex items-center justify-center bg-black text-center text-white transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`} aria-hidden={!visible}><div><p className="text-[7px] tracking-[.45em] text-white/28">FACILITY ROUTE / TRANSFERRING</p><p className="mt-5 text-xl tracking-[.31em] text-white/76 sm:text-3xl">{names[room]}</p></div></div>;
}
