"use client";

import type { JourneyStage } from "@/utils/journey";

type JourneyUIProps = { stage: JourneyStage };

const transitStages: JourneyStage[] = ["departure", "exit", "corridor", "deep-archive"];

export function JourneyUI({ stage }: JourneyUIProps) {
  const showTransit = transitStages.includes(stage);
  const showArrival = stage === "object-two-arrival";
  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-end p-5 sm:p-8 lg:p-12">
      <div className={`absolute right-5 top-1/2 -translate-y-1/2 border-r border-white/18 py-3 pr-4 text-right transition-all duration-700 sm:right-8 lg:right-12 ${showTransit ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"}`}>
        <p className="text-[8px] tracking-[0.42em] text-white/35">TRANSIT</p>
        <p className="mt-2 text-[10px] tracking-[0.34em] text-white/72">G-01 → G-02</p>
        <p className="mt-2 text-[8px] tracking-[0.26em] text-white/34">ARCHIVE LINK ACTIVE</p>
        {stage === "deep-archive" && <p className="mt-4 text-[8px] tracking-[0.3em] text-[#a99d94]/65">INCIDENT LOG / REDACTED</p>}
      </div>
      <div className={`absolute bottom-32 left-5 border-l border-white/20 pl-4 transition-all duration-1000 sm:bottom-auto sm:left-8 sm:top-1/2 sm:-translate-y-1/2 lg:left-12 ${showArrival ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        <p className="text-[8px] tracking-[0.42em] text-white/38">OBJECT 002</p>
        <p className="mt-2 text-sm tracking-[0.32em] text-white/78">VISUAL ISOLATION</p>
        <p className="mt-3 text-[8px] tracking-[0.27em] text-white/34">RECORD HANDSHAKE / PARTIAL</p>
      </div>
    </div>
  );
}
