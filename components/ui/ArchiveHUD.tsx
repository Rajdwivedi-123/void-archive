export function ArchiveHUD() {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-4 text-[11px] uppercase tracking-[0.35em] text-white/80 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">VOID ARCHIVE</p>
          <p className="mt-1 text-[10px] tracking-[0.28em] text-white/55">
            IMPOSSIBLE COLLECTION
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">INDEX</p>
          <p className="mt-1 text-[10px] tracking-[0.28em] text-white/55">
            01 / 06
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="max-w-[12rem]">
          <p className="font-semibold text-white">ARCHIVE STATUS / ONLINE</p>
          <p className="mt-2 text-[10px] leading-5 tracking-[0.28em] text-white/55">
            LOW-THRUST SYSTEMS • ENVIRONMENTAL CALIBRATION • SAFE
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">SCROLL</p>
          <p className="mt-2 text-[10px] tracking-[0.28em] text-white/55">▼</p>
        </div>
      </div>
    </div>
  );
}
