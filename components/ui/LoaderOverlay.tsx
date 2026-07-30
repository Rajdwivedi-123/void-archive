"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

type LoaderOverlayProps = {
  isVisible: boolean;
  reducedMotion: boolean;
};

export function LoaderOverlay({
  isVisible,
  reducedMotion,
}: LoaderOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !contentRef.current || !barRef.current) return;

    if (isVisible) {
      gsap.set(overlayRef.current, { opacity: 1, pointerEvents: "auto" });
      gsap.set(contentRef.current, { opacity: 1, y: 0 });
      gsap.set(barRef.current, { xPercent: reducedMotion ? 0 : -100 });

      if (!reducedMotion) {
        gsap.to(barRef.current, {
          xPercent: 100,
          duration: 1.1,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(contentRef.current, { opacity: 0, y: -12, duration: 0.45 })
      .to(overlayRef.current, { opacity: 0, duration: 0.7 }, "-=0.2")
      .set(overlayRef.current, { pointerEvents: "none" }, ">-0.1");
  }, [isVisible, reducedMotion]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030303] text-white"
    >
      <div ref={contentRef} className="flex flex-col items-center text-center">
        <p className="text-[11px] uppercase tracking-[0.6em] text-white/55">
          INITIALIZING ARCHIVE
        </p>
        <h1 className="mt-6 text-4xl font-semibold tracking-[0.28em] sm:text-5xl lg:text-6xl">
          VOID ARCHIVE
        </h1>
        <div className="mt-8 h-px w-32 overflow-hidden rounded-full bg-white/20">
          <div
            ref={barRef}
            className={`h-full w-full bg-white/90 ${reducedMotion ? "translate-x-0" : "archive-progress-bar"}`}
            style={reducedMotion ? { transform: "translateX(0%)" } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
