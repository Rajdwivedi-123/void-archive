"use client";

type ArtifactInfoProps = {
  isVisible: boolean;
  reducedMotion: boolean;
  isScrolled: boolean;
};

const readings = [
  ["STATUS", "UNSTABLE"],
  ["CLASS", "GRAVITATIONAL ANOMALY"],
  ["ORIGIN", "UNKNOWN"],
  ["CONTAINMENT", "ACTIVE"],
];

export function ArtifactInfo({ isVisible, reducedMotion, isScrolled }: ArtifactInfoProps) {
  return (
    <div className={`pointer-events-none fixed inset-0 z-30 flex items-end p-5 transition-opacity duration-1000 sm:items-center sm:p-8 lg:p-12 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className={`artifact-panel relative w-full max-w-[25rem] overflow-hidden border-l border-white/20 bg-black/20 py-4 pl-5 pr-3 text-left backdrop-blur-[2px] transition-transform duration-1000 sm:w-[20rem] ${isVisible || reducedMotion ? "translate-y-0" : "translate-y-4"}`}>
        <span className={`artifact-scan absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent ${reducedMotion ? "hidden" : "block"}`} />
        <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.44em] text-white/45">
          <span>OBJECT 001</span><span className="h-px flex-1 bg-white/15" /><span>VA-001/G</span>
        </div>
        <h2 className="mt-3 text-xl font-medium tracking-[0.28em] text-white sm:text-2xl">GRAVITY CORE</h2>
        <p className="mt-2 max-w-xs text-[9px] leading-4 tracking-[0.2em] text-white/36">
          MASS SIGNATURE EXCEEDS CONTAINMENT MODEL. SOURCE EVENT REDACTED.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-white/10 pt-4">
          {readings.map(([label, value]) => (
            <div key={label}>
              <p className="text-[8px] tracking-[0.32em] text-white/35">{label}</p>
              <p className={`mt-1 text-[9px] tracking-[0.2em] ${label === "STATUS" ? "text-[#d4c9bd]" : "text-white/72"}`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[8px] tracking-[0.25em] text-white/35">
          <span>FIELD DEVIATION</span><span className={isScrolled ? "text-white/80" : "text-white/50"}>{isScrolled ? "RISING  +0.083" : "RISING  +0.021"}</span>
        </div>
      </div>
    </div>
  );
}
