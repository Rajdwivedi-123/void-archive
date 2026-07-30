import type { JourneyStage } from "@/utils/journey";

type ArchiveHUDProps = { active: boolean; stage: JourneyStage };

export function ArchiveHUD({ active, stage }: ArchiveHUDProps) {
  const approachingTwo = stage === "deep-archive" || stage === "object-two";
  const inTransit = ["departure", "exit", "corridor", "deep-archive"].includes(stage);
  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-4 text-[10px] uppercase tracking-[0.34em] text-white/72 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="border-l border-white/20 pl-3">
          <p className="font-semibold text-white/90">VOID ARCHIVE</p>
          <p className="mt-1.5 text-[8px] tracking-[0.18em] text-white/42 sm:text-[9px] sm:tracking-[0.28em]">{inTransit ? "DEEP SECTOR TRANSIT" : "IMPOSSIBLE COLLECTION"}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white/65">INDEX</p>
          <div className="mt-2 flex items-center gap-1.5 text-[8px] tracking-[0.16em] sm:gap-2 sm:tracking-[0.2em]">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <span key={index} className={index === 1 && !approachingTwo ? "text-white" : index === 2 && approachingTwo ? "text-white" : "text-white/22"}>0{index}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="max-w-[13rem] border-l border-white/15 pl-3">
          <p className="flex items-center gap-2 font-semibold text-white/82">
            <span className={`h-1 w-1 rounded-full ${active ? "status-pulse bg-white/75" : "bg-white/25"}`} />
            {inTransit ? "ARCHIVE LINK / ACTIVE" : `CONTAINMENT / ${active ? "ACTIVE" : "STANDBY"}`}
          </p>
          <p className="mt-2 text-[9px] leading-5 tracking-[0.26em] text-white/38">{inTransit ? "DEPTH 02  /  ACCESS RESTRICTED" : `SECTOR G-01  /  FIELD LOCK ${active ? "NOMINAL" : "PENDING"}`}</p>
        </div>
        <div className="text-right text-white/44">
          <p>{stage === "object-two" ? "LIMIT" : "SCROLL"}</p>
          <p className="mt-2 text-xs">{stage === "object-two" ? "02" : "↓"}</p>
        </div>
      </div>
    </div>
  );
}
