import type { JourneyStage } from "@/utils/journey";
import { liquidMirrorArtifact, neuralRelicArtifact, temporalRingArtifact, voidArtifact } from "@/artifacts/registry";

type ArchiveHUDProps = { active: boolean; stage: JourneyStage };

export function ArchiveHUD({ active, stage }: ArchiveHUDProps) {
  const objectTwoActive = stage.startsWith("object-two");
  const objectThreeActive = stage.startsWith("object-three");
  const objectFourActive = stage.startsWith("object-four");
  const objectFiveActive = stage.startsWith("object-five");
  const approachingFive = stage === "object-four-departure" || stage === "geometric-isolation-passage" || objectFiveActive;
  const approachingFour = !approachingFive && (stage === "object-three-departure" || stage === "bio-isolation-passage" || objectFourActive);
  const approachingThree = !approachingFour && !approachingFive && (stage === "object-two-departure" || stage === "measurement-passage" || objectThreeActive);
  const approachingTwo = !approachingThree && !approachingFour && !approachingFive && (stage === "deep-archive" || objectTwoActive);
  const inTransit = ["departure", "exit", "corridor", "deep-archive", "object-two-departure", "measurement-passage", "object-three-departure", "bio-isolation-passage", "object-four-departure", "geometric-isolation-passage"].includes(stage);
  const activeIndex = approachingFive ? 5 : approachingFour ? 4 : approachingThree ? 3 : approachingTwo ? 2 : 1;
  const containment = objectFiveActive ? voidArtifact.containment : objectFourActive ? neuralRelicArtifact.containment : objectThreeActive ? temporalRingArtifact.containment : objectTwoActive ? liquidMirrorArtifact.containment : "CONTAINMENT";
  const sector = objectFiveActive ? "SECTOR V-05  /  SPATIAL RETURN NULL" : objectFourActive ? "SECTOR N-04  /  ADAPTATION LIVE" : objectThreeActive ? "SECTOR T-03  /  CHRONOLOGY LIVE" : objectTwoActive ? "SECTOR M-02  /  OBSERVATION LIVE" : `SECTOR G-01  /  FIELD LOCK ${active ? "NOMINAL" : "PENDING"}`;
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
            {[1, 2, 3, 4, 5, 6].map((index) => <span key={index} className={index === activeIndex ? "text-white" : "text-white/22"}>0{index}</span>)}
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="max-w-[13rem] border-l border-white/15 pl-3">
          <p className="flex items-center gap-2 font-semibold text-white/82">
            <span className={`h-1 w-1 rounded-full ${active ? "status-pulse bg-white/75" : "bg-white/25"}`} />
            {inTransit ? "ARCHIVE LINK / ACTIVE" : `${containment} / ${active ? "ACTIVE" : "STANDBY"}`}
          </p>
          <p className="mt-2 text-[9px] leading-5 tracking-[0.26em] text-white/38">{inTransit ? approachingFive ? "DEPTH 05  /  GEOMETRIC ISOLATION" : approachingFour ? "DEPTH 04  /  BIO-ISOLATION" : approachingThree ? "DEPTH 03  /  MEASUREMENT PASSAGE" : "DEPTH 02  /  ACCESS RESTRICTED" : sector}</p>
        </div>
        <div className="text-right text-white/44">
          <p>{stage.endsWith("inspection") ? "HOLD" : "SCROLL"}</p>
          <p className="mt-2 text-xs">{objectFiveActive ? "05" : objectFourActive ? "04" : objectThreeActive ? "03" : objectTwoActive ? "02" : "↓"}</p>
        </div>
      </div>
    </div>
  );
}
