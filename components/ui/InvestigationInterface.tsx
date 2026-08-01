"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArtifactId } from "@/artifacts/inspection";
import type { RealitySnapshot } from "@/reality/realityTypes";
import { evidenceCatalog, type InvestigationProgress, type PuzzleId } from "@/game/investigation";

export type PuzzleResolution = {
  puzzle: PuzzleId;
  evidence: string;
  knowledge?: string;
  variant: string;
  falseLead?: string;
  memoryProfile?: string;
  solved?: boolean;
};

type PuzzleProps = {
  artifact: ArtifactId;
  primary: number;
  scanner: boolean;
  reducedMotion: boolean;
  progress: InvestigationProgress;
  session: RealitySnapshot;
  onPrimary: (value: number) => void;
  onScanner: (active: boolean) => void;
  onStart: (puzzle: PuzzleId) => void;
  onHypothesis: (hypothesis: string) => void;
  onResolve: (resolution: PuzzleResolution) => void;
};

const puzzleByArtifact: Record<ArtifactId, PuzzleId> = { "001": "gravity", "002": "mirror", "003": "temporal", "004": "neural", "005": "void", "006": "memory" };

export function ArtifactInvestigation(props: PuzzleProps) {
  const puzzle = puzzleByArtifact[props.artifact];
  const solved = props.progress.puzzlesSolved.includes(puzzle);
  const { onStart } = props;
  useEffect(() => { onStart(puzzle); }, [onStart, puzzle]);
  return (
    <div className="pointer-events-auto mt-4 border-t border-white/10 pt-4" data-artifact-puzzle={puzzle}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[7px] tracking-[.32em] text-white/34">INVESTIGATION / {puzzle.toUpperCase()}</p>
        <p className={`text-[7px] tracking-[.22em] ${solved ? "text-white/72" : "text-white/28"}`}>{solved ? "MODEL UPDATED" : "HYPOTHESIS OPEN"}</p>
      </div>
      <p className="mt-2 text-[6px] tracking-[.18em] text-white/22">OBSERVER EMPHASIS / {observerHint(props.session.archetype)}</p>
      {solved ? <SolvedState puzzle={puzzle} progress={props.progress} /> : <PuzzleBody {...props} puzzle={puzzle} />}
    </div>
  );
}

function observerHint(archetype: string) {
  if (archetype === "witness") return "DWELL RESPONSE / QUIET CHANGE AMPLIFIED";
  if (archetype === "chronologist") return "PRE-RESPONSE TIMESTAMPS EXPOSED";
  if (archetype === "cartographer") return "BOUNDARY DISCREPANCIES EMPHASIZED";
  if (archetype === "synaptic") return "ADAPTIVE ROUTE TOPOLOGY EMPHASIZED";
  if (archetype === "mnemonist") return "SESSION STRATA CONTEXT EXPOSED";
  return "CONTROL RESPONSE / FIELD REACTION AMPLIFIED";
}

function SolvedState({ puzzle, progress }: { puzzle: PuzzleId; progress: InvestigationProgress }) {
  const labels: Record<PuzzleId, string> = {
    gravity: "SENSOR B / DISTORTED BY FIELD", mirror: "ARCHIVE FEED / EVENT UNREGISTERED", temporal: "RECORD PRECEDES REQUEST",
    neural: "ADAPTATION RULE / ROUTE PREDICTED", void: "CENTRAL INTERVAL / NONLOCAL", memory: `RECONSTRUCTION / ${(progress.memoryProfile ?? "SESSION-SPECIFIC").toUpperCase()}`,
  };
  return <p className="mt-3 text-[8px] leading-5 tracking-[.2em] text-white/62">{labels[puzzle]}<br /><span className="text-white/25">CORRELATION AVAILABLE IN ARCHIVE</span></p>;
}

function PuzzleBody(props: PuzzleProps & { puzzle: PuzzleId }) {
  if (props.puzzle === "gravity") return <GravityPuzzle {...props} />;
  if (props.puzzle === "mirror") return <MirrorPuzzle {...props} />;
  if (props.puzzle === "temporal") return <TemporalPuzzle {...props} />;
  if (props.puzzle === "neural") return <NeuralPuzzle {...props} />;
  if (props.puzzle === "void") return <VoidPuzzle {...props} />;
  return <MemoryPuzzle {...props} />;
}

function GravityPuzzle({ primary, scanner, session, onPrimary, onScanner, onHypothesis, onResolve }: PuzzleProps) {
  const [observed, setObserved] = useState<string[]>([]);
  const sample = (sensor: string) => { setObserved((current) => current.includes(sensor) ? current : [...current, sensor]); onHypothesis(`gravity:${sensor}`); };
  const ready = scanner && primary >= .62 && observed.length >= 2;
  const overdriven = primary > .91;
  return <div className="mt-3">
    <p className="text-[7px] leading-5 tracking-[.18em] text-white/34">Raise the physical field, enable the scanner, then compare vector movement—not only its number.</p>
    <div className="mt-3 grid grid-cols-3 gap-2">
      {["A", "B", "C"].map((sensor, index) => <button key={sensor} type="button" onClick={() => sample(sensor)} className="min-h-10 border border-white/10 text-[7px] tracking-[.2em] text-white/48">VECTOR {sensor}<span className="mt-1 block text-[6px] text-white/22">{observed.includes(sensor) ? (index === 1 ? `${(primary * 9.4).toFixed(2)} / ARC` : `${(6.1 + primary * index).toFixed(2)} / LINEAR`) : "UNSAMPLED"}</span></button>)}
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" onClick={() => onScanner(!scanner)} className="min-h-9 border border-white/10 px-3 text-[7px] tracking-[.18em] text-white/46">SCANNER / {scanner ? "ACTIVE" : "OFF"}</button>
      <button type="button" onClick={() => onPrimary(Math.min(1, primary + .16))} className="min-h-9 border border-white/10 px-3 text-[7px] tracking-[.18em] text-white/46">FIELD +</button>
      {overdriven && <button type="button" onClick={() => onResolve({ puzzle: "gravity", evidence: "G-EXCURSION", knowledge: "gravity-failure-record", variant: "excursion", falseLead: "all-sensors-reliable", solved: false })} className="min-h-9 border border-[#ad9b91]/20 px-3 text-[7px] tracking-[.18em] text-[#c1b1a7]/55">CONTROL REVOKED / LOG RETURN</button>}
    </div>
    {ready && <div className="mt-3 grid grid-cols-3 gap-2">{["A", "B", "C"].map((sensor) => <button key={sensor} type="button" onClick={() => sensor === "B" ? onResolve({ puzzle: "gravity", evidence: "G-FIELD", knowledge: "measurement-distrust", variant: session.archetype === "witness" ? "observed" : "intervened", falseLead: "all-sensors-reliable" }) : onHypothesis(`gravity:unsupported:${sensor}`)} className="min-h-9 border border-white/10 text-[7px] tracking-[.17em] text-white/42">ISOLATE {sensor}</button>)}</div>}
  </div>;
}

function MirrorPuzzle({ primary, session, onPrimary, onHypothesis, onResolve }: PuzzleProps) {
  const [sampled, setSampled] = useState(false);
  const move = (value: number) => { onPrimary(value); setSampled(true); };
  const archiveImpossible = sampled && primary > .62;
  return <div className="mt-3">
    <p className="text-[7px] leading-5 tracking-[.18em] text-white/34">Move the observation baseline. Current and delayed feeds must react; an unregistered feed cannot.</p>
    <div className="mt-3 flex gap-2"><button type="button" onClick={() => move(.18)} className="min-h-9 flex-1 border border-white/10 text-[7px] tracking-[.18em] text-white/45">MOVE LEFT</button><button type="button" onClick={() => move(.82)} className="min-h-9 flex-1 border border-white/10 text-[7px] tracking-[.18em] text-white/45">MOVE RIGHT</button></div>
    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[6px] tracking-[.15em] text-white/30"><p className="border border-white/8 py-3">DIRECT<br /><span className="text-white/58">{primary > .5 ? "RIGHT" : "LEFT"}</span></p><p className="border border-white/8 py-3">REFLECTION<br /><span className="text-white/58">{primary > .5 ? "LEFT / +.73" : "RIGHT / +.73"}</span></p><p className="border border-white/8 py-3">ARCHIVE<br /><span className="text-[#bbaaa0]/60">APERTURE / {session.seed.slice(0, 3)}</span></p></div>
    {sampled && <div className="mt-3 grid grid-cols-3 gap-2">{["DIRECT", "REFLECTION", "ARCHIVE"].map((feed) => <button key={feed} type="button" onClick={() => feed === "ARCHIVE" && archiveImpossible ? onResolve({ puzzle: "mirror", evidence: "M-UNREGISTERED", knowledge: "unregistered-feed", variant: session.returningVisitor ? "memory-replay" : "first-observation" }) : onHypothesis(`mirror:${feed.toLowerCase()}`)} className="min-h-9 border border-white/10 text-[6px] tracking-[.14em] text-white/44">MARK UNREGISTERED<br />{feed}</button>)}</div>}
  </div>;
}

function TemporalPuzzle({ session, onPrimary, onHypothesis, onResolve }: PuzzleProps) {
  const events = ["RECORD CREATED", "REQUEST SUBMITTED", "AUTHORIZATION RECEIVED", "DOOR OPENED"];
  const [sequence, setSequence] = useState<string[]>([]);
  const choose = (event: string) => { onPrimary(event === "RECORD CREATED" || event === "DOOR OPENED" ? 1 : event === "REQUEST SUBMITTED" ? 0 : .5); setSequence((current) => current.includes(event) ? current : [...current, event]); };
  const submit = () => {
    const correct = sequence.join("|") === events.join("|");
    if (correct) onResolve({ puzzle: "temporal", evidence: "T-13", knowledge: "offset-04.731", variant: session.archetype === "chronologist" ? "pre-response" : "future-preview" });
    else { onHypothesis(`temporal:${sequence.join(">")}`); setSequence([]); }
  };
  return <div className="mt-3"><p className="text-[7px] leading-5 tracking-[.18em] text-white/34">The future state responds before authorization. Select causal order, not timestamp order.</p><p className="mt-2 text-[6px] tracking-[.18em] text-white/24">PREVIEW / DOOR OPEN · RESPONSE / +04.731 · RECORD / −04.731</p><div className="mt-3 grid grid-cols-2 gap-2">{events.map((event) => <button disabled={sequence.includes(event)} key={event} onClick={() => choose(event)} type="button" className="min-h-10 border border-white/10 px-2 text-[6px] tracking-[.14em] text-white/46 disabled:text-white/14">{event}</button>)}</div><p className="mt-3 min-h-5 text-[6px] tracking-[.16em] text-white/35">{sequence.map((event, i) => `${i + 1}/${event}`).join("  →  ") || "SEQUENCE / UNFORMED"}</p><div className="mt-2 flex gap-2"><button type="button" onClick={() => setSequence([])} className="min-h-9 border border-white/8 px-3 text-[6px] tracking-[.16em] text-white/30">RESET</button><button disabled={sequence.length !== 4} type="button" onClick={submit} className="min-h-9 flex-1 border border-white/12 text-[7px] tracking-[.18em] text-white/48 disabled:text-white/14">TEST CAUSAL MODEL</button></div></div>;
}

function NeuralPuzzle({ session, onPrimary, onHypothesis, onResolve }: PuzzleProps) {
  const [route, setRoute] = useState<string[]>([]);
  const [observed, setObserved] = useState(false);
  const select = (node: string) => {
    onPrimary(node === "A" ? 0 : node === "B" ? .5 : 1);
    const next = [...route, node].slice(-3); setRoute(next);
    if (next.length < 3) return;
    const quick = next.join("") === "ACB"; const patient = observed && next.join("") === "BAC";
    if (quick || patient) onResolve({ puzzle: "neural", evidence: "N-ROUTE", knowledge: "neural-route-pattern", variant: quick ? "adaptive-intervention" : "observed-pattern" });
    else { onHypothesis(`neural:${next.join("")}`); setRoute(next.slice(1)); }
  };
  const anticipated = route.at(-1) ?? (session.archetype === "synaptic" ? "A" : "B");
  return <div className="mt-3"><p className="text-[7px] leading-5 tracking-[.18em] text-white/34">Repeated routes are occluded. Either outrun the prediction or observe the adaptation before routing.</p><div className="relative mt-3 h-16 border-y border-white/8"><div className="absolute left-[12%] top-1/2 h-2 w-2 rotate-45 border border-white/30" /><div className="absolute left-[48%] top-[24%] h-2 w-2 rotate-45 border border-white/30" /><div className="absolute left-[82%] top-[62%] h-2 w-2 rotate-45 border border-white/30" /><div className="absolute inset-x-[13%] top-1/2 h-px bg-white/10" /><p className="absolute right-2 top-2 text-[6px] tracking-[.18em] text-white/25">RELIC ANTICIPATES / {anticipated}</p></div><div className="mt-3 grid grid-cols-3 gap-2">{["A", "B", "C"].map((node) => <button key={node} onClick={() => select(node)} type="button" className="min-h-10 border border-white/10 text-[7px] tracking-[.2em] text-white/46">ROUTE {node}</button>)}</div><div className="mt-3 flex items-center justify-between"><p className="text-[6px] tracking-[.17em] text-white/28">TRACE / {route.join(" → ") || "NONE"}</p><button onClick={() => { setObserved(true); setRoute([]); }} type="button" className="min-h-9 border border-white/10 px-3 text-[6px] tracking-[.16em] text-white/38">OBSERVE PATTERN</button></div></div>;
}

function VoidPuzzle({ scanner, onScanner, onHypothesis, onResolve }: PuzzleProps) {
  const [scans, setScans] = useState<string[]>([]);
  const scan = (point: string) => { if (!scanner) return; setScans((current) => current.includes(point) ? current : [...current, point]); };
  const ready = scans.length === 3;
  return <div className="mt-3"><p className="text-[7px] leading-5 tracking-[.18em] text-white/34">Scan the room as intervals. The map total is not the sum of its visible boundaries.</p><button onClick={() => onScanner(!scanner)} type="button" className="mt-3 min-h-9 border border-white/10 px-3 text-[7px] tracking-[.18em] text-white/46">SPATIAL PROBE / {scanner ? "ACTIVE" : "OFF"}</button><div className="mt-3 grid grid-cols-3 gap-2">{[["LEFT","6.2 M"],["CENTER","NULL"],["RIGHT","5.8 M"]].map(([point,value]) => <button key={point} onClick={() => scan(point)} type="button" className="min-h-12 border border-white/10 text-[7px] tracking-[.16em] text-white/44">{point}<span className="mt-1 block text-[6px] text-white/24">{scans.includes(point) ? value : "UNSCANNED"}</span></button>)}</div>{ready && <div className="mt-3 grid grid-cols-3 gap-2">{["LEFT", "CENTER", "RIGHT"].map((point) => <button key={point} type="button" onClick={() => point === "CENTER" ? onResolve({ puzzle: "void", evidence: "V-NONLOCAL", knowledge: "nonlocal-boundary", variant: "interval-map", falseLead: "sector-empty" }) : onHypothesis(`void:${point.toLowerCase()}`)} className="min-h-9 border border-white/10 text-[6px] tracking-[.14em] text-white/42">MARK NONLOCAL<br />{point}</button>)}</div>}</div>;
}

function MemoryPuzzle({ progress, session, onPrimary, onHypothesis, onResolve }: PuzzleProps) {
  const route = progress.knowledgeFlags.includes("n07-spatial-vector") ? "SPATIAL" : progress.knowledgeFlags.includes("n07-temporal-vector") ? "TEMPORAL" : session.affinity.toUpperCase();
  const correct = `${session.archetype.toUpperCase()} / ${route}`;
  const options = useMemo(() => [correct, `WITNESS / ${session.affinity.toUpperCase()}`, `CHRONOLOGIST / SPATIAL`].filter((value, index, all) => all.indexOf(value) === index), [correct, session.affinity]);
  return <div className="mt-3"><p className="text-[7px] leading-5 tracking-[.18em] text-white/34">Reconstruct the stratum that matches this run. The foreign layer resolves only against the actual observer method and N-07 vector.</p><div className="mt-3 border-y border-white/8 py-3 text-[6px] leading-5 tracking-[.17em] text-white/30"><p>PRIMARY METHOD / {session.archetype.toUpperCase()}</p><p>N-07 VECTOR / {route}</p><p>VISIT EMPHASIS / {(session.visitOrder[0] ?? "UNRECORDED")}</p><p>EVENT 13 / {session.event13Discovered ? "PRESENT" : "UNRESOLVED"}</p></div><div className="mt-3 space-y-2">{options.map((option) => <button key={option} type="button" onClick={() => { if (option === correct) { onPrimary(.9); onResolve({ puzzle: "memory", evidence: "M-FOREIGN", knowledge: "session-memory-reconstructed", variant: route.toLowerCase(), memoryProfile: correct }); } else onHypothesis(`memory:${option}`); }} className="block min-h-10 w-full border-l border-white/12 px-3 text-left text-[7px] tracking-[.17em] text-white/44">ISOLATE / {option}</button>)}</div></div>;
}

export function InvestigationBoard({ progress, session, onConnect }: { progress: InvestigationProgress; session: RealitySnapshot; onConnect: (a: string, b: string) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const evidence = evidenceCatalog.filter((entry) => progress.evidenceDiscovered.includes(entry.id));
  const choose = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 2 ? [current[1], id] : [...current, id]);
  const submit = () => { if (selected.length === 2) { onConnect(selected[0], selected[1]); setSelected([]); } };
  const subjectIdentified = progress.knowledgeFlags.includes("subject-07-identified");
  return <div className="mx-auto max-w-6xl" data-investigation-board>
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[8px] tracking-[.42em] text-white/28">ARCHIVE CORRELATION / OBSERVER-SHAPED MODEL</p><h3 className="mt-4 text-2xl tracking-[.28em] sm:text-4xl">INVESTIGATION FIELD</h3><p className="mt-4 max-w-2xl text-[9px] leading-5 tracking-[.2em] text-white/36">Select two observations and propose a relationship. Records remain evidence, not authority.</p></div><div className="border-l border-white/12 pl-4 text-[7px] leading-5 tracking-[.2em] text-white/30"><p>STAGE / {progress.investigationStage.replaceAll("-", " ").toUpperCase()}</p><p>METHOD / {session.archetype.toUpperCase()}</p><p>DIRECTIVE / {directiveFor(progress)}</p></div></div>
    <div className="relative mt-8 min-h-0 overflow-hidden border-y border-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,.025),transparent_48%)] p-4 sm:min-h-[27rem] sm:p-7">
      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{progress.evidenceConnections.map((key, index) => { const [a,b]=key.split("|"); const ai=evidence.findIndex((item)=>item.id===a); const bi=evidence.findIndex((item)=>item.id===b); if(ai<0||bi<0)return null; const pa=nodePosition(ai,evidence.length); const pb=nodePosition(bi,evidence.length); return <line key={key} x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} stroke="rgba(210,218,218,.32)" strokeWidth=".2" strokeDasharray={index%2?"1 2":"0"} />; })}</svg>
      {evidence.length === 0 && <p className="absolute left-1/2 top-1/2 -translate-x-1/2 text-[8px] tracking-[.3em] text-white/24">NO CONFLICTS REGISTERED</p>}
      <div className="grid gap-2 sm:hidden">{evidence.map((entry)=>{const active=selected.includes(entry.id);return <button key={entry.id} type="button" onClick={()=>choose(entry.id)} className={`min-h-16 border-l p-3 text-left ${active?"border-white/70 bg-white/[.06]":"border-white/18 bg-black/30"}`}><span className="text-[6px] tracking-[.2em] text-white/24">{entry.category}</span><span className="mt-2 block text-[8px] tracking-[.16em] text-white/66">{entry.label}</span></button>})}</div>
      {evidence.map((entry,index)=>{const [x,y]=nodePosition(index,evidence.length);const active=selected.includes(entry.id);return <button key={entry.id} type="button" onClick={()=>choose(entry.id)} className={`absolute hidden w-44 -translate-x-1/2 -translate-y-1/2 border-l p-3 text-left transition-colors sm:block ${active?"border-white/70 bg-white/[.06]":"border-white/18 bg-black/30 hover:border-white/42"}`} style={{left:`${x}%`,top:`${y}%`}}><span className="text-[6px] tracking-[.22em] text-white/24">{entry.category}</span><span className="mt-2 block text-[8px] tracking-[.18em] text-white/66">{entry.label}</span><span className="mt-2 block text-[6px] leading-4 tracking-[.14em] text-white/26">{entry.detail}</span></button>})}
    </div>
    <div className="mt-5 flex flex-wrap items-center gap-3"><p className="mr-auto text-[7px] tracking-[.2em] text-white/32">CORRELATION / {selected.map((id)=>evidenceCatalog.find((item)=>item.id===id)?.label).join(" ↔ ") || "SELECT TWO OBSERVATIONS"}</p><button disabled={selected.length!==2} onClick={submit} type="button" className="min-h-11 border border-white/16 px-5 text-[8px] tracking-[.23em] text-white/56 disabled:text-white/16">PROPOSE CORRELATION</button></div>
    <div className="mt-8 grid gap-5 border-t border-white/8 pt-6 sm:grid-cols-2"><div><p className="text-[7px] tracking-[.3em] text-white/28">UNRESOLVED</p><p className="mt-3 text-[8px] leading-6 tracking-[.18em] text-white/38">{progress.evidenceConnections.length ? "Accepted lines still terminate at an unregistered sector." : "No cross-sector relationship has been accepted."}<br />Unsupported proposals remain retryable and carry no penalty.</p></div><div className="border-l border-white/12 pl-4"><p className="text-[7px] tracking-[.3em] text-white/28">SUBJECT 07</p><p className="mt-3 text-[8px] leading-6 tracking-[.18em] text-white/48">OBSERVER CLASS / {session.archetype.toUpperCase()}<br />PRIMARY METHOD / {session.affinity.toUpperCase()}<br />DOMINANT CORRELATION / {progress.knowledgeFlags.includes("n07-spatial-vector") ? "SPATIAL" : progress.knowledgeFlags.includes("n07-temporal-vector") ? "TEMPORAL" : "UNRESOLVED"}<br />N-07 DISCOVERY VECTOR / {progress.investigationStage === "n07-vector" ? "PARTIAL" : "WITHHELD"}<br />UNRESOLVED MEMORY / {subjectIdentified ? "NOT CURRENT SESSION" : "REDACTED"}</p></div></div>
  </div>;
}

function nodePosition(index: number, total: number): [number, number] {
  if (total <= 1) return [50, 50];
  const angle = -Math.PI / 2 + index / total * Math.PI * 2;
  return [50 + Math.cos(angle) * 37, 50 + Math.sin(angle) * 34];
}

function directiveFor(progress: InvestigationProgress) {
  if (progress.investigationStage === "n07-vector") return "DIRECTIVE INVALID";
  if (progress.investigationStage === "subject-identification") return "LOCATE UNREGISTERED SECTOR";
  if (progress.investigationStage === "correlation") return "LOCATE UNREGISTERED SECTOR";
  if (progress.investigationStage === "contradiction") return "IDENTIFY SHARED CORRELATION";
  return "VERIFY ANOMALY NETWORK";
}

export function EvidenceNotice({ evidenceId }: { evidenceId: string | null }) {
  if (!evidenceId) return null;
  const evidence = evidenceCatalog.find((entry) => entry.id === evidenceId);
  return <div className="pointer-events-none fixed bottom-24 left-1/2 z-[65] w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 border-l border-white/32 bg-black/76 px-5 py-4 text-white backdrop-blur-md" role="status"><p className="text-[7px] tracking-[.34em] text-white/35">ARCHIVE CORRELATION</p><p className="mt-2 text-[9px] tracking-[.22em] text-white/72">NEW CONFLICT REGISTERED</p><p className="mt-2 text-[7px] tracking-[.18em] text-white/34">{evidence?.label ?? evidenceId}</p></div>;
}
