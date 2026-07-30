"use client";

type ArtifactInfoProps = {
  isVisible: boolean;
  reducedMotion: boolean;
};

export function ArtifactInfo({ isVisible, reducedMotion }: ArtifactInfoProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-30 flex items-end justify-center p-6 transition-all duration-700 sm:p-10 ${isVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div
        className={`max-w-sm rounded-[24px] border border-white/10 bg-black/45 px-5 py-4 text-left backdrop-blur-sm ${reducedMotion ? "translate-y-0" : "translate-y-3"}`}
      >
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/45">
          OBJECT 001
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[0.3em] text-white">
          GRAVITY CORE
        </h2>
        <div className="mt-4 space-y-1 text-[10px] uppercase tracking-[0.35em] text-white/60">
          <p>STATUS • UNCLASSIFIED</p>
          <p>ORIGIN • UNKNOWN</p>
        </div>
      </div>
    </div>
  );
}
