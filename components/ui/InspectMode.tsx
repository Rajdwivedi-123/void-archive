"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { archiveData } from "@/artifacts/archiveData";
import type { ArtifactId } from "@/artifacts/inspection";
import type { ArtifactDefinition } from "@/artifacts/types";
import { useReality, useRealitySnapshot } from "@/reality/RealityProvider";

type InspectModeProps = {
  artifact: ArtifactDefinition | null;
  primary: number;
  scanner: boolean;
  reducedMotion: boolean;
  onPrimary: (value: number) => void;
  onScanner: (active: boolean) => void;
  onPointer: (x: number, y: number) => void;
  onExit: () => void;
};

function valueLabel(id: ArtifactId, value: number) {
  if (id === "001") return `${Math.round(42 + value * 41)}% / ${Math.round(1.8 + value * 2.7)} G`;
  if (id === "002") return `${value < .46 ? "−" : "+"}${Math.abs(Math.round((value - .5) * 36))}° / LATENCY ${(0.42 + value * .63).toFixed(2)} SEC`;
  if (id === "003") return value < .34 ? "PAST / −04.731 SEC" : value > .66 ? "FUTURE / +07.013 SEC" : "CURRENT / +00.000 SEC";
  if (id === "004") return value < .34 ? "ROUTE A / MONITORING" : value > .66 ? "ROUTE C / PREFERRED" : "ROUTE B / PREDICTING";
  if (id === "005") return "DEPTH RETURN / NULL";
  return value > .82 ? "STRATUM 07 / ACCESS DENIED" : `STRATUM ${String(Math.max(1, Math.ceil(value * 6))).padStart(2, "0")} / RECALLING`;
}

const spatialMeasure: Record<ArtifactId, string> = {
  "001": "FIELD RADIUS / 2.84 M",
  "002": "SURFACE OFFSET / 0.18 M",
  "003": "CAUSAL GAP / 7.013 S",
  "004": "NETWORK DEPTH / 14.2 M",
  "005": "BOUNDARY RETURN / NULL",
  "006": "REFRACTION DEPTH / 1.62 M",
};

export function InspectMode({ artifact, primary, scanner, reducedMotion, onPrimary, onScanner, onPointer, onExit }: InspectModeProps) {
  const [activeHotspot, setActiveHotspot] = useState(0);
  const [futureAnnounced, setFutureAnnounced] = useState(false);
  const temporalTimerRef = useRef<number | null>(null);
  const session = useRealitySnapshot();
  const reality = useReality();
  const coordinatesRef = useRef<HTMLSpanElement>(null);
  const returnRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!artifact) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [artifact, onExit]);
  useEffect(() => () => { if (temporalTimerRef.current) window.clearTimeout(temporalTimerRef.current); }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setFutureAnnounced(false));
    return () => cancelAnimationFrame(frame);
  }, [artifact]);
  useEffect(() => {
    if (!artifact || !anchorRef.current) return;
    let frame = 0;
    const update = () => {
      if (anchorRef.current) {
        anchorRef.current.style.transform = `translate3d(${reality.runtime.projectedX * innerWidth}px,calc(${reality.runtime.projectedY * innerHeight}px - 100%),0)`;
        const withinFrame = reality.runtime.projectedX > .03 && reality.runtime.projectedX < .97
          && reality.runtime.projectedY > .05 && reality.runtime.projectedY < .95;
        anchorRef.current.style.opacity = withinFrame ? "1" : "0";
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [artifact, reality]);
  if (!artifact) return null;
  const data = archiveData[artifact.id];
  const showPrimaryLabel = artifact.id !== "001";
  const title = artifact.id === "005" ? "THE VO_D" : artifact.title;

  const selectTemporalState = (index: number) => {
    if (index !== 2 || reducedMotion) { setFutureAnnounced(index === 2); onPrimary(index / 2); return; }
    setFutureAnnounced(true);
    if (temporalTimerRef.current) window.clearTimeout(temporalTimerRef.current);
    temporalTimerRef.current = window.setTimeout(() => onPrimary(1), 420);
  };

  const handlePointer = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    onPointer(x, y);
    if (coordinatesRef.current) coordinatesRef.current.textContent = `${(x * 18.7).toFixed(2)} / ${(y * 13.4).toFixed(2)} / ${artifact.id === "005" ? "NULL" : (Math.abs(x - y) * 4.2).toFixed(2)}`;
    if (returnRef.current && artifact.id === "005") returnRef.current.textContent = Math.abs(x + y) > .85 ? "18.4 M / CONFLICT" : Math.abs(x - y) < .22 ? "NULL" : "−03.7 M / NULL";
  };

  return (
    <section
      className={`fixed inset-0 z-[44] overflow-hidden text-white reality-inspect reality-inspect-${artifact.id}`}
      data-inspect-mode={artifact.id}
      aria-label={`${artifact.title} inspection mode`}
      onPointerMove={handlePointer}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(0,0,0,.34)_82%)]" />
      <div ref={anchorRef} data-diegetic-anchor className="pointer-events-none absolute left-0 top-0 z-[2] h-12 w-px -translate-y-full bg-gradient-to-t from-white/28 to-transparent transition-opacity duration-200">
        <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full border border-white/30" />
        <span className="absolute left-3 top-0 whitespace-nowrap border-l border-white/14 pl-2 text-[6px] tracking-[0.24em] text-white/32 sm:text-[7px]">{spatialMeasure[artifact.id]}</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-8 lg:p-10">
        <div className="border-l border-white/25 pl-4">
          <p className="text-[8px] tracking-[0.42em] text-white/35">INSPECT MODE / {artifact.id === "005" ? "N-__" : data.sector}</p>
          <h2 className={`mt-3 text-base tracking-[0.3em] text-white/88 sm:text-xl ${artifact.id === "001" ? "reality-reactive-panel" : ""}`}>{title}</h2>
          <p className="mt-2 text-[8px] tracking-[0.24em] text-white/30">{data.interaction}</p>
          {artifact.id === "002" && session.totalInteractions > 1 && <p className="mt-3 text-[7px] tracking-[0.24em] text-white/24">REFLECTION SOURCE / OBSERVER HISTORY<br />SOURCE TIMESTAMP / {session.seed}</p>}
          {artifact.id === "003" && futureAnnounced && (reducedMotion || primary < .99) && <p className="mt-3 text-[7px] tracking-[0.28em] text-white/65">FUTURE STATUS / CONFIRMED<br /><span className="text-white/28">{reducedMotion ? "CURRENT GEOMETRY / PAST RETURN" : "PHYSICAL STATE / PENDING"}</span></p>}
          {artifact.id === "004" && <p className="mt-3 text-[7px] tracking-[0.24em] text-white/38">PATTERN MATCH / {session.archiveUnlocked ? "OBSERVER / HIGH" : session.observerConfidence > .45 ? "PARTIAL / RISING" : "LOW / ACQUIRING"}<br />AFFINITY / {session.affinity.toUpperCase()}</p>}
        </div>
        <button className="pointer-events-auto min-h-11 border-l border-white/20 pl-4 text-[9px] tracking-[0.28em] text-white/55 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" onClick={onExit} type="button">RETURN / JOURNEY</button>
      </div>

      {data.hotspots.map((hotspot, index) => (
        <button
          key={hotspot.label}
          className={`group absolute z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${activeHotspot === index ? "border-white/65 bg-white/10" : "border-white/20 hover:border-white/55"}`}
          style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
          onClick={() => setActiveHotspot(index)}
          type="button"
          aria-label={hotspot.label}
        >
          <span className="absolute left-1/2 top-1/2 h-px w-10 -translate-y-1/2 bg-white/18" />
          <span className={`absolute left-9 top-1/2 hidden -translate-y-1/2 whitespace-nowrap text-[7px] tracking-[0.24em] text-white/52 sm:block ${scanner ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}>{hotspot.label}</span>
        </button>
      ))}

      <div className="pointer-events-none absolute inset-x-5 bottom-5 grid items-end gap-4 sm:inset-x-8 sm:bottom-8 sm:grid-cols-[1fr_19rem] lg:inset-x-10 lg:bottom-10">
        <div className={`max-w-md border-l border-white/16 bg-black/25 py-3 pl-4 backdrop-blur-[2px] ${artifact.id === "005" ? "reality-void-damaged" : artifact.id === "001" ? "reality-reactive-panel" : ""}`}>
          <p className="text-[7px] tracking-[0.36em] text-white/28">{data.hotspots[activeHotspot].label}</p>
          <p className="mt-2 text-[9px] leading-5 tracking-[0.18em] text-white/58">{data.hotspots[activeHotspot].note}</p>
        </div>
        <div className="pointer-events-auto border-t border-white/15 bg-black/38 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-[7px] tracking-[0.28em] text-white/30"><span>{data.control}</span><span>{reducedMotion ? "STATIC" : "LIVE"}</span></div>
          {artifact.id === "001" ? (
            <div className="mt-4 flex items-center gap-5">
              <input className="archive-range archive-range-field" aria-label={data.control} max="1" min="0" step="0.01" type="range" value={primary} onChange={(event) => onPrimary(Number(event.target.value))} />
              <div><p className="text-[8px] tracking-[0.22em] text-white/66">{valueLabel(artifact.id, primary)}</p><p className="mt-3 text-[7px] leading-5 tracking-[0.2em] text-white/25">FIELD LIMIT<br />CONTROLLED</p></div>
            </div>
          ) : artifact.id === "004" || artifact.id === "005" ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {data.states.map((state, index) => <button key={state} className={`min-h-10 border text-[7px] tracking-[0.18em] ${Math.round(primary * 2) === index ? "border-white/40 text-white/75" : "border-white/9 text-white/30 hover:border-white/25"}`} onClick={() => onPrimary(index / 2)} type="button">{state}</button>)}
            </div>
          ) : artifact.id === "003" ? (
            <div className="mt-4 grid grid-cols-3 gap-2">{data.states.map((state, index) => <button key={state} className={`min-h-10 border text-[7px] tracking-[0.18em] ${(index === 2 && futureAnnounced) || Math.round(primary * 2) === index ? "border-white/45 text-white/80" : "border-white/9 text-white/30"}`} onClick={() => selectTemporalState(index)} type="button">{state}</button>)}</div>
          ) : (
            <input className="archive-range mt-5 w-full" aria-label={data.control} max="1" min="0" step="0.01" type="range" value={primary} onChange={(event) => onPrimary(Number(event.target.value))} />
          )}
          {showPrimaryLabel && <p className="mt-4 min-h-5 text-[8px] tracking-[0.22em] text-white/66">{valueLabel(artifact.id, primary)}</p>}
          <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3 text-[7px] tracking-[0.22em] text-white/28"><span>COORD / <span ref={coordinatesRef}>00.00 / 00.00 / 00.00</span></span><button className={scanner ? "text-white/78" : "text-white/36 hover:text-white/60"} onClick={() => onScanner(!scanner)} type="button">SCANNER / {scanner ? "ACTIVE" : "OFF"}</button></div>
          {artifact.id === "005" && <p className="mt-2 text-[7px] tracking-[0.22em] text-[#b3a69e]/55">PROBE RETURN / <span ref={returnRef}>NULL</span></p>}
          {artifact.id === "006" && (
            <div className="memory-trace-grid mt-4 border-y border-white/8 py-3 text-[7px] leading-5 tracking-[0.2em] text-white/35">
              <p className="text-white/58">OBSERVATION MEMORY / SESSION TRACE AVAILABLE</p>
              <p>GRAVITY EXCURSION / {session.maxGravityIntensity > .72 ? "RECORDED" : "NOMINAL"}</p>
              <p>TEMPORAL OFFSET / {Math.max(...session.temporalExploration) > 1 ? "OBSERVED" : "INCOMPLETE"}</p>
              <p>NEURAL RESPONSE / {session.neuralAdaptation > .5 ? "ADAPTED" : "MONITORING"}</p>
              <p>SPATIAL LOSS / {session.voidProbeCount ? "UNRESOLVED" : "UNMEASURED"}</p>
              {session.event13Discovered && <p className="text-[#c1b4aa]/65">EVENT 13 / MEMORY ORDER +1</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
