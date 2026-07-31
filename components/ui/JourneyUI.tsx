"use client";

import type { JourneyStage } from "@/utils/journey";
import type { RealitySnapshot } from "@/reality/realityTypes";

type JourneyUIProps = { stage: JourneyStage; snapshot: RealitySnapshot };

const firstTransitStages: JourneyStage[] = ["departure", "exit", "corridor", "deep-archive"];
const secondTransitStages: JourneyStage[] = ["object-two-departure", "measurement-passage"];
const thirdTransitStages: JourneyStage[] = ["object-three-departure", "bio-isolation-passage"];
const fourthTransitStages: JourneyStage[] = ["object-four-departure", "geometric-isolation-passage"];
const fifthTransitStages: JourneyStage[] = ["object-five-departure", "memory-recovery-passage"];

const systemEvents: Partial<Record<JourneyStage, { label: string; value: string }>> = {
  "object-two-inspection": { label: "REFLECTION SOURCE", value: "UNRESOLVED" },
  "object-three-inspection": { label: "RECORDED EVENT", value: "13 / UNOBSERVED" },
  "object-four-inspection": { label: "PATTERN MATCH", value: "OBSERVER" },
  "object-five-inspection": { label: "SECTOR MAP", value: "MISMATCH" },
  "object-six-inspection": { label: "SEQUENCE VALIDITY", value: "FAILED" },
};

export function JourneyUI({ stage, snapshot }: JourneyUIProps) {
  const firstTransit = firstTransitStages.includes(stage);
  const secondTransit = secondTransitStages.includes(stage);
  const thirdTransit = thirdTransitStages.includes(stage);
  const fourthTransit = fourthTransitStages.includes(stage);
  const fifthTransit = fifthTransitStages.includes(stage);
  const showTransit = firstTransit || secondTransit || thirdTransit || fourthTransit || fifthTransit;
  const systemEvent = systemEvents[stage];
  const transitCode = fifthTransit ? "V-05 → R-06" : fourthTransit ? "N-04 → V-05" : thirdTransit ? "T-03 → N-04" : secondTransit ? "M-02 → T-03" : "G-01 → M-02";
  const transitLabel = fifthTransit ? "MEMORY RECOVERY ACTIVE" : fourthTransit ? "GEOMETRIC ISOLATION ACTIVE" : thirdTransit ? "BIO-ISOLATION LINK ACTIVE" : secondTransit ? "CHRONOLOGY LINK ACTIVE" : "ARCHIVE LINK ACTIVE";
  const adaptiveNote = stage === "bio-isolation-passage"
    ? snapshot.temporalNeuralBranch === "causality" ? "CAUSAL TRACE / EVENT PRECEDES ENTRY" : "ANTICIPATORY TRACE / RELIC AWAITING INPUT"
    : stage === "geometric-isolation-passage"
      ? snapshot.neuralVoidBranch === "spatial-mismatch" ? `MEASURED RETURN / ${snapshot.measurements.returnDistance}` : snapshot.neuralVoidBranch === "structural" ? "STRUCTURAL TRACE / COGNITIVE ECHO" : "NO RESPONSE RECORDED"
      : null;
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-end p-5 sm:p-8 lg:p-12">
      {stage === "geometric-isolation-passage" && <div className="non-euclidean-ribs absolute inset-y-[12%] left-[18%] right-[18%] opacity-70"><p className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] tracking-[.34em] text-white/30">VISIBLE LENGTH / 18 M&nbsp;&nbsp;&nbsp; MEASURED RETURN / 43 M</p></div>}
      <div className={`absolute right-5 top-1/2 -translate-y-1/2 border-r border-white/18 py-3 pr-4 text-right transition-all duration-700 sm:right-8 lg:right-12 ${showTransit ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"}`}>
        <p className="text-[8px] tracking-[0.42em] text-white/35">TRANSIT</p>
        <p className="mt-2 text-[10px] tracking-[0.34em] text-white/72">{transitCode}</p>
        <p className="mt-2 text-[8px] tracking-[0.26em] text-white/34">{transitLabel}</p>
        {stage === "deep-archive" && <p className="mt-4 text-[8px] tracking-[0.3em] text-[#a99d94]/65">INCIDENT LOG / REDACTED</p>}
        {stage === "measurement-passage" && <p className="mt-4 text-[8px] tracking-[0.3em] text-[#9eafb2]/65">TIMEBASE / UNVERIFIED</p>}
        {stage === "bio-isolation-passage" && <p className="mt-4 text-[8px] tracking-[0.3em] text-[#a9aaa2]/65">COGNITIVE SCREEN / ARMED</p>}
        {stage === "geometric-isolation-passage" && <p className="mt-4 text-[8px] tracking-[0.3em] text-[#a9aaa2]/65">SPATIAL RETURN / EXTENDING</p>}
        {stage === "memory-recovery-passage" && <p className="mt-4 text-[8px] tracking-[0.3em] text-[#c2c3ba]/65">SPATIAL CONTINUITY / RESTORED</p>}
        {adaptiveNote && <p className="mt-4 max-w-56 text-[7px] leading-4 tracking-[0.24em] text-white/52">{adaptiveNote}</p>}
      </div>
      {[
        { visible: stage === "object-two-arrival", id: "002", title: "VISUAL ISOLATION", detail: "RECORD HANDSHAKE / PARTIAL" },
        { visible: stage === "object-three-arrival", id: "003", title: "MEASUREMENT LOCK", detail: "TIMEBASE DISAGREEMENT" },
        { visible: stage === "object-four-arrival", id: "004", title: "COGNITIVE ISOLATION", detail: "SPECIMEN RESPONSE / DETECTED" },
        { visible: stage === "object-five-arrival", id: "005", title: "GEOMETRIC ISOLATION", detail: "LOCAL VOLUME / UNRESOLVED" },
        { visible: stage === "object-six-arrival", id: "006", title: "OBSERVATIONAL VAULT", detail: "MNEMONIC RETURN / DETECTED" },
      ].map((arrival) => (
        <div key={arrival.id} className={`absolute bottom-32 left-5 border-l border-white/20 pl-4 transition-all duration-1000 sm:bottom-auto sm:left-8 sm:top-1/2 sm:-translate-y-1/2 lg:left-12 ${arrival.visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
          <p className="text-[8px] tracking-[0.42em] text-white/38">OBJECT {arrival.id}</p>
          <p className="mt-2 text-sm tracking-[0.32em] text-white/78">{arrival.title}</p>
          <p className="mt-3 text-[8px] tracking-[0.27em] text-white/34">{arrival.detail}</p>
        </div>
      ))}
      <div className={`absolute left-1/2 top-[18%] -translate-x-1/2 border-y border-white/10 px-5 py-3 text-center transition-all duration-1000 ${systemEvent ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}>
        <p className="text-[7px] tracking-[0.38em] text-white/28">ARCHIVE CORRELATION</p>
        <p className="mt-2 text-[8px] tracking-[0.3em] text-white/42">{systemEvent?.label ?? "ARCHIVE SIGNAL"}</p>
        <p className="mt-1.5 text-[9px] tracking-[0.32em] text-white/76">{systemEvent?.value ?? "PENDING"}</p>
      </div>
    </div>
  );
}
