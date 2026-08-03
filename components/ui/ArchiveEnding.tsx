"use client";

import type { JourneyStage } from "@/utils/journey";
import type { ConsequenceState } from "@/game/consequenceTypes";
import { resolveFacilityMutations } from "@/game/facilityMutations";

type ArchiveEndingProps = {
  stage: JourneyStage;
  reducedMotion: boolean;
  onOpenArchive: () => void;
  consequences: ConsequenceState;
};

export function ArchiveEnding({ stage, reducedMotion, onOpenArchive, consequences }: ArchiveEndingProps) {
  const resolving = stage === "archive-resolution";
  const complete = stage === "session-complete";
  const visible = resolving || complete;
  const mutations = resolveFacilityMutations(consequences);
  const ending = consequences.endingCommit?.type ?? (consequences.memoryRestorationCommitted ? "subject-07" : "protocol");
  const minimal = ending === "protocol";
  const n07 = ending === "n07-vector" || ending === "archive-anomaly";

  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden px-6 transition-all ${reducedMotion ? "duration-0" : "duration-[1400ms]"} ${complete ? "bg-black/55 opacity-100" : resolving ? "bg-black/25 opacity-100" : "bg-black/0 opacity-0"}`}
    >
      <div className={`archive-ending-grid absolute inset-0 transition-opacity duration-[1800ms] ${complete ? "opacity-25" : "opacity-0"}`} />
      <div className="relative w-full max-w-[38rem] text-center uppercase">
        <div className={`mx-auto h-px bg-gradient-to-r from-transparent via-white/25 to-transparent transition-all duration-[1600ms] ${visible ? "w-full opacity-100" : "w-0 opacity-0"}`} />
        <p className="mt-6 text-[8px] tracking-[0.48em] text-white/36">RECALL SEQUENCE / CLOSED</p>
        <div className={`transition-all duration-[1500ms] ${complete ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <p className="mt-7 text-[9px] tracking-[0.44em] text-white/46">ARCHIVE SYSTEM NOTICE</p>
          <p className="mt-4 text-base font-medium tracking-[0.36em] text-white/90 sm:text-xl">{minimal ? "OBSERVATION COMPLETE" : n07 ? "LOCATION RESOLVED" : "OBSERVER RECORD CREATED"}</p>
          <div className="mx-auto mt-6 grid max-w-[25rem] grid-cols-2 gap-5 border-y border-white/10 py-4 text-left text-[8px] tracking-[0.3em]">
            <p className="text-white/32">{minimal ? "ANOMALIES VERIFIED" : n07 ? "N-07 VECTOR" : "SUBJECT INDEX"}<br /><span className="mt-2 inline-block text-white/78">{minimal ? "6 / 6" : n07 ? (consequences.n07DiscoveryRoute ?? "PARTIAL").toUpperCase() : "07"}</span></p>
            <p className="text-white/32">{minimal ? "SECTORS OBSERVED" : n07 ? "ACCESS" : "FACILITY RESPONSE"}<br /><span className="mt-2 inline-block text-white/78">{minimal ? "6 / 7" : n07 ? "UNRESOLVED" : mutations.responseLabels.length ? "MUTATING" : "OBSERVING"}</span></p>
          </div>
          <p className="mt-10 text-[11px] tracking-[0.5em] text-white/82">VOID ARCHIVE</p>
          <p className="mx-auto mt-3 max-w-[22rem] text-[8px] leading-4 tracking-[0.22em] text-white/28 sm:max-w-none sm:text-[7px] sm:tracking-[0.36em]">{minimal ? "SESSION TERMINATED / CORRELATION STATUS INCOMPLETE" : n07 ? "MAP TOPOLOGY ALIGNED / FACILITY STATE ALTERED" : `PRIMARY METHOD / ${consequences.observerArchetype.toUpperCase()} · N-07 / ${(consequences.n07DiscoveryRoute ?? "UNRESOLVED").toUpperCase()}`}</p>
          <button
            className="pointer-events-auto mt-7 min-h-11 border border-white/20 px-6 text-[8px] tracking-[0.34em] text-white/64 transition-colors hover:border-white/48 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            onClick={onOpenArchive}
            tabIndex={complete ? 0 : -1}
            type="button"
          >
            OPEN ARCHIVE
          </button>
        </div>
      </div>
    </div>
  );
}
