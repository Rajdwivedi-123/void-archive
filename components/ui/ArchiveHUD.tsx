type ArchiveHUDProps = { active: boolean };

export function ArchiveHUD({ active }: ArchiveHUDProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-4 text-[10px] uppercase tracking-[0.34em] text-white/72 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="border-l border-white/20 pl-3">
          <p className="font-semibold text-white/90">VOID ARCHIVE</p>
          <p className="mt-1.5 text-[9px] tracking-[0.28em] text-white/42">IMPOSSIBLE COLLECTION</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white/82">INDEX</p>
          <p className="mt-1.5 text-[9px] tracking-[0.28em] text-white/42">01 / 06</p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="max-w-[13rem] border-l border-white/15 pl-3">
          <p className="flex items-center gap-2 font-semibold text-white/82">
            <span className={`h-1 w-1 rounded-full ${active ? "status-pulse bg-white/75" : "bg-white/25"}`} />
            CONTAINMENT / {active ? "ACTIVE" : "STANDBY"}
          </p>
          <p className="mt-2 text-[9px] leading-5 tracking-[0.26em] text-white/38">SECTOR G-01&nbsp;&nbsp; / &nbsp;&nbsp;FIELD LOCK {active ? "NOMINAL" : "PENDING"}</p>
        </div>
        <div className="text-right text-white/44">
          <p>SCROLL</p>
          <p className="mt-2 text-xs">↓</p>
        </div>
      </div>
    </div>
  );
}
