"use client";

import type { JourneyStage } from "@/utils/journey";

type JourneyUIProps = { stage: JourneyStage };

const firstTransitStages: JourneyStage[] = ["departure", "exit", "corridor", "deep-archive"];
const secondTransitStages: JourneyStage[] = ["object-two-departure", "measurement-passage"];
const thirdTransitStages: JourneyStage[] = ["object-three-departure", "bio-isolation-passage"];
const fourthTransitStages: JourneyStage[] = ["object-four-departure", "geometric-isolation-passage"];
const fifthTransitStages: JourneyStage[] = ["object-five-departure", "memory-recovery-passage"];

export function JourneyUI({ stage }: JourneyUIProps) {
  const firstTransit = firstTransitStages.includes(stage);
  const secondTransit = secondTransitStages.includes(stage);
  const thirdTransit = thirdTransitStages.includes(stage);
  const fourthTransit = fourthTransitStages.includes(stage);
  const fifthTransit = fifthTransitStages.includes(stage);
  const showTransit = firstTransit || secondTransit || thirdTransit || fourthTransit || fifthTransit;
  const transitCode = fifthTransit ? "V-05 → R-06" : fourthTransit ? "N-04 → V-05" : thirdTransit ? "T-03 → N-04" : secondTransit ? "M-02 → T-03" : "G-01 → M-02";
  const transitLabel = fifthTransit ? "MEMORY RECOVERY ACTIVE" : fourthTransit ? "GEOMETRIC ISOLATION ACTIVE" : thirdTransit ? "BIO-ISOLATION LINK ACTIVE" : secondTransit ? "CHRONOLOGY LINK ACTIVE" : "ARCHIVE LINK ACTIVE";
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-end p-5 sm:p-8 lg:p-12">
      <div className={`absolute right-5 top-1/2 -translate-y-1/2 border-r border-white/18 py-3 pr-4 text-right transition-all duration-700 sm:right-8 lg:right-12 ${showTransit ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"}`}>
        <p className="text-[8px] tracking-[0.42em] text-white/35">TRANSIT</p>
        <p className="mt-2 text-[10px] tracking-[0.34em] text-white/72">{transitCode}</p>
        <p className="mt-2 text-[8px] tracking-[0.26em] text-white/34">{transitLabel}</p>
        {stage === "deep-archive" && <p className="mt-4 text-[8px] tracking-[0.3em] text-[#a99d94]/65">INCIDENT LOG / REDACTED</p>}
        {stage === "measurement-passage" && <p className="mt-4 text-[8px] tracking-[0.3em] text-[#9eafb2]/65">TIMEBASE / UNVERIFIED</p>}
        {stage === "bio-isolation-passage" && <p className="mt-4 text-[8px] tracking-[0.3em] text-[#a9aaa2]/65">COGNITIVE SCREEN / ARMED</p>}
        {stage === "geometric-isolation-passage" && <p className="mt-4 text-[8px] tracking-[0.3em] text-[#a9aaa2]/65">SPATIAL RETURN / NULL</p>}
        {stage === "memory-recovery-passage" && <p className="mt-4 text-[8px] tracking-[0.3em] text-[#c2c3ba]/65">SPATIAL CONTINUITY / RESTORED</p>}
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
    </div>
  );
}
