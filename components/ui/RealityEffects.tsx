"use client";

import { useEffect, useRef } from "react";
import type { ArtifactId } from "@/artifacts/inspection";
import { useReality, useRealitySnapshot } from "@/reality/RealityProvider";

type RealityEffectsProps = {
  artifact: ArtifactId | null;
  primary: number;
  freezeActive: boolean;
  reducedMotion: boolean;
};

export function RealityEffects({ artifact, primary, freezeActive, reducedMotion }: RealityEffectsProps) {
  const store = useReality();
  const session = useRealitySnapshot();
  const echoRef = useRef<HTMLDivElement>(null);
  const temporalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.realityArtifact = artifact ?? "none";
    root.style.setProperty("--reality-intensity", primary.toFixed(3));
    root.toggleAttribute("data-reality-freeze", freezeActive);
    return () => {
      root.dataset.realityArtifact = "none";
      root.removeAttribute("data-reality-freeze");
    };
  }, [artifact, freezeActive, primary]);

  useEffect(() => {
    if ((artifact !== "002" && artifact !== "003") || innerWidth < 700 || reducedMotion) return;
    let frame = 0;
    const render = () => {
      const history = store.runtime.pointerHistory;
      const current = store.runtime.pointer;
      const delayed = history[Math.max(0, history.length - 8)] ?? current;
      if (echoRef.current) echoRef.current.style.transform = `translate3d(${delayed.x * innerWidth}px,${delayed.y * innerHeight}px,0)`;
      if (temporalRef.current) {
        const previous = history[Math.max(0, history.length - 3)] ?? current;
        const anticipation = primary > .66 ? 1.8 : primary < .34 ? -.9 : .55;
        const x = current.x + (current.x - previous.x) * anticipation;
        const y = current.y + (current.y - previous.y) * anticipation;
        temporalRef.current.style.transform = `translate3d(${x * innerWidth}px,${y * innerHeight}px,0)`;
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [artifact, primary, reducedMotion, store]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[43] overflow-hidden" aria-hidden="true" data-reality-layer>
      {artifact === "001" && (
        <div className="reality-gravity-field absolute inset-0">
          <svg className="absolute bottom-[18%] right-[5%] h-20 w-[24rem] max-w-[58vw]" viewBox="0 0 400 80" preserveAspectRatio="none">
            <path d={`M 0 40 C 110 40, ${170 + primary * 28} ${40 + primary * 25}, 220 40 S 330 40, 400 40`} fill="none" stroke="rgba(226,226,220,.26)" strokeWidth="1" />
          </svg>
          <i className="reality-gravity-dot left-[18%] top-[42%]" /><i className="reality-gravity-dot left-[74%] top-[31%]" /><i className="reality-gravity-dot left-[81%] top-[69%]" />
        </div>
      )}
      {artifact === "002" && <div ref={echoRef} className="reality-observer-echo absolute left-0 top-0"><span /><p>PREVIOUS OBSERVATION<br />{session.seed}</p></div>}
      {artifact === "003" && !reducedMotion && <div ref={temporalRef} className={`reality-temporal-cursor absolute left-0 top-0 ${primary > .66 ? "is-future" : primary < .34 ? "is-past" : ""}`}><span /><p>{primary > .66 ? "T+04.731" : primary < .34 ? "T−04.731" : "T+00.018"}</p></div>}
      {artifact === "005" && <div className="reality-void-occlusion absolute left-[34%] top-[18%] h-[58%] w-[45%]"><span className="absolute left-[8%] top-[18%]">COORD / NULL</span><span className="absolute bottom-[12%] right-[7%]">N-__ / RETURN LOST</span></div>}
      {freezeActive && <div className="reality-freeze absolute inset-0 flex items-center justify-center"><div><p>ARCHIVE TIMEBASE</p><strong>{session.affinity === "adaptive" ? "NEURAL SIGNAL REMAINS" : "MNEMONIC SIGNAL REMAINS"}</strong><span>REALITY HOLD / 00.000</span></div></div>}
    </div>
  );
}
