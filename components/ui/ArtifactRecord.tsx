"use client";

import type { ArtifactDefinition } from "@/artifacts/types";
import { useRealitySnapshot } from "@/reality/RealityProvider";

type ArtifactRecordProps = {
  artifact: ArtifactDefinition;
  isVisible: boolean;
  reducedMotion: boolean;
  anomalyActive: boolean;
};

export function ArtifactRecord({ artifact, isVisible, reducedMotion, anomalyActive }: ArtifactRecordProps) {
  const session = useRealitySnapshot();
  const isVoid = artifact.id === "005";
  const title = isVoid && anomalyActive ? "THE VO_D" : artifact.title;
  return (
    <div className={`pointer-events-none fixed inset-0 z-30 flex items-end p-5 transition-opacity duration-1000 sm:items-center sm:p-8 lg:p-12 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className={`artifact-panel relative w-full max-w-[25rem] overflow-hidden border-l border-white/20 bg-black/25 py-4 pl-5 pr-3 text-left backdrop-blur-[3px] transition-transform duration-1000 sm:w-[20rem] ${artifact.id === "001" ? "reality-reactive-panel" : ""} ${isVoid && anomalyActive ? "reality-void-damaged" : ""} ${isVisible || reducedMotion ? "translate-y-0" : "translate-y-4"}`}>
        <span className={`artifact-scan absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent ${reducedMotion ? "hidden" : "block"}`} />
        <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.44em] text-white/45">
          <span>OBJECT {artifact.id}</span><span className="h-px flex-1 bg-white/15" /><span>{artifact.archiveCode}</span>
        </div>
        <h2 className="mt-3 text-xl font-medium tracking-[0.28em] text-white sm:text-2xl">{title}</h2>
        {artifact.id === "002" && anomalyActive && session.totalInteractions > 0 && <p className="absolute right-3 top-14 text-[7px] tracking-[.28em] text-white/14">{title}<br />−0.73 SEC</p>}
        {artifact.id === "006" && anomalyActive && <p className="absolute right-3 top-14 text-[7px] tracking-[.24em] text-white/14">PREVIOUS LABEL<br />{session.affinity.toUpperCase()}</p>}
        <p className="mt-2 max-w-xs text-[9px] leading-4 tracking-[0.2em] text-white/36">{artifact.summary}</p>
        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-white/10 pt-4">
          {artifact.readings.map((reading) => (
            <div key={reading.label}>
              <p className="text-[8px] tracking-[0.28em] text-white/35">{reading.label}</p>
              <p className={`mt-1 text-[9px] tracking-[0.18em] ${reading.accent ? "text-[#d4c9bd]" : "text-white/72"}`}>{artifact.id === "004" && reading.label === "PATTERN MATCH" ? (session.archiveUnlocked ? "OBSERVER / HIGH" : session.observerConfidence > .45 ? "PARTIAL / RISING" : "LOW") : reading.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[8px] tracking-[0.23em] text-white/35">
          <span>{artifact.anomalyLabel}</span>
          <span className={anomalyActive ? "text-white/80" : "text-white/50"}>{anomalyActive ? artifact.anomalyActive : artifact.anomalyDormant}</span>
        </div>
      </div>
    </div>
  );
}
