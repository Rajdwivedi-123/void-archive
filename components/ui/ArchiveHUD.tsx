import type { JourneyStage } from "@/utils/journey";
import { liquidMirrorArtifact, memoryCrystalArtifact, neuralRelicArtifact, temporalRingArtifact, voidArtifact } from "@/artifacts/registry";

type ArchiveHUDProps = { active: boolean; stage: JourneyStage };

const transitStages: JourneyStage[] = [
  "departure", "exit", "corridor", "deep-archive",
  "object-two-departure", "measurement-passage",
  "object-three-departure", "bio-isolation-passage",
  "object-four-departure", "geometric-isolation-passage",
  "object-five-departure", "memory-recovery-passage",
];

export function ArchiveHUD({ active, stage }: ArchiveHUDProps) {
  const objectTwoActive = stage.startsWith("object-two");
  const objectThreeActive = stage.startsWith("object-three");
  const objectFourActive = stage.startsWith("object-four");
  const objectFiveActive = stage.startsWith("object-five");
  const objectSixActive = stage.startsWith("object-six");
  const ending = stage === "archive-resolution" || stage === "session-complete";
  const approachingSix = ending || stage === "object-five-departure" || stage === "memory-recovery-passage" || objectSixActive;
  const approachingFive = !approachingSix && (stage === "object-four-departure" || stage === "geometric-isolation-passage" || objectFiveActive);
  const approachingFour = !approachingFive && !approachingSix && (stage === "object-three-departure" || stage === "bio-isolation-passage" || objectFourActive);
  const approachingThree = !approachingFour && !approachingFive && !approachingSix && (stage === "object-two-departure" || stage === "measurement-passage" || objectThreeActive);
  const approachingTwo = !approachingThree && !approachingFour && !approachingFive && !approachingSix && (stage === "deep-archive" || objectTwoActive);
  const inTransit = transitStages.includes(stage);
  const activeIndex = approachingSix ? 6 : approachingFive ? 5 : approachingFour ? 4 : approachingThree ? 3 : approachingTwo ? 2 : 1;
  const containment = objectSixActive ? memoryCrystalArtifact.containment : objectFiveActive ? voidArtifact.containment : objectFourActive ? neuralRelicArtifact.containment : objectThreeActive ? temporalRingArtifact.containment : objectTwoActive ? liquidMirrorArtifact.containment : "CONTAINMENT";
  const sector = ending
    ? "OBSERVER FILE / LOCAL"
    : objectSixActive ? "SECTOR R-06  /  RECALL IN PROGRESS"
      : objectFiveActive ? "SECTOR V-05  /  SPATIAL RETURN NULL"
        : objectFourActive ? "SECTOR N-04  /  ADAPTATION LIVE"
          : objectThreeActive ? "SECTOR T-03  /  CHRONOLOGY LIVE"
            : objectTwoActive ? "SECTOR M-02  /  OBSERVATION LIVE"
              : `SECTOR G-01  /  FIELD LOCK ${active ? "NOMINAL" : "PENDING"}`;

  return (
    <div className={`pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-4 text-[10px] uppercase tracking-[0.34em] text-white/72 transition-opacity duration-[1400ms] sm:p-6 lg:p-8 ${stage === "session-complete" ? "opacity-[0.35]" : "opacity-100"}`}>
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="border-l border-white/20 pl-3">
          <p className="font-semibold text-white/90">VOID ARCHIVE</p>
          <p className="mt-1.5 text-[8px] tracking-[0.18em] text-white/42 sm:text-[9px] sm:tracking-[0.28em]">{ending ? "SESSION RECORD" : inTransit ? "DEEP SECTOR TRANSIT" : "IMPOSSIBLE COLLECTION"}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white/52">SEQUENCE</p>
          <div className="mt-2 flex items-center text-[8px] tracking-[0.16em] sm:tracking-[0.2em]">
            {[1, 2, 3, 4, 5, 6].map((index) => {
              const isPast = index < activeIndex;
              const isCurrent = index === activeIndex;
              const numberTone = ending ? "text-white/58" : isCurrent ? "text-white" : isPast ? "text-white/36" : "text-white/16";
              const lineTone = ending ? "bg-white/30" : index < activeIndex ? "bg-white/20" : "bg-white/8";
              return (
                <span key={index} className="flex items-center">
                  <span className={`transition-colors duration-1000 ${numberTone}`}>0{index}</span>
                  {index < 6 && <span className={`archive-index-line mx-1.5 h-px w-2.5 transition-colors duration-1000 sm:mx-2 sm:w-4 ${lineTone}`} />}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="max-w-[14rem] border-l border-white/15 pl-3">
          <p className="flex items-center gap-2 font-semibold text-white/82">
            <span className={`h-1 w-1 rounded-full ${active && !ending ? "status-pulse bg-white/75" : "bg-white/35"}`} />
            {ending ? "ARCHIVE LINK / LOCAL" : inTransit ? "ARCHIVE LINK / ACTIVE" : `${containment} / ${active ? "ACTIVE" : "STANDBY"}`}
          </p>
          <p className="mt-2 text-[9px] leading-5 tracking-[0.26em] text-white/38">{inTransit ? approachingSix ? "DEPTH 06  /  MEMORY RECOVERY" : approachingFive ? "DEPTH 05  /  GEOMETRIC ISOLATION" : approachingFour ? "DEPTH 04  /  BIO-ISOLATION" : approachingThree ? "DEPTH 03  /  MEASUREMENT PASSAGE" : "DEPTH 02  /  ACCESS RESTRICTED" : sector}</p>
        </div>
        <div className="text-right text-white/44">
          <p>{ending ? "RECORD" : stage.endsWith("inspection") ? "HOLD" : "SCROLL"}</p>
          <p className="mt-2 text-xs">{ending ? "07" : objectSixActive ? "06" : objectFiveActive ? "05" : objectFourActive ? "04" : objectThreeActive ? "03" : objectTwoActive ? "02" : "↓"}</p>
        </div>
      </div>
    </div>
  );
}
