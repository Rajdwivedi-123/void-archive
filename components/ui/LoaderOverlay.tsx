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
    const overlay = overlayRef.current;
    const content = contentRef.current;
    const bar = barRef.current;
    gsap.killTweensOf([overlay, content, bar]);

    if (isVisible) {
      gsap.set(overlay, { opacity: 1, pointerEvents: "auto" });
      gsap.set(content, { opacity: 1, y: 0 });
      gsap.set(bar, { xPercent: reducedMotion ? 0 : -100 });

      if (!reducedMotion) {
        const progressTween = gsap.to(bar, {
          xPercent: 100,
          duration: 1.1,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
        return () => {
          progressTween.kill();
        };
      }
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(content, { opacity: 0, y: -12, duration: 0.45 })
      .to(overlay, { opacity: 0, duration: 0.7 }, "-=0.2")
      .set(overlay, { pointerEvents: "none" }, ">-0.1");
    return () => {
      tl.kill();
    };
  }, [isVisible, reducedMotion]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030303] text-white"
      role="status"
      aria-live="polite"
      aria-hidden={!isVisible}
    >
      <div ref={contentRef} className="flex flex-col items-center text-center">
        <p className="text-[11px] uppercase tracking-[0.6em] text-white/55">
          INITIALIZING ARCHIVE
        </p>
        <p className="mt-6 text-4xl font-semibold tracking-[0.28em] sm:text-5xl lg:text-6xl">
          VOID ARCHIVE
        </p>
        <p className="mt-3 text-[8px] tracking-[0.42em] text-white/30">SIX SECTORS / SECURE LINK</p>
        <div className="mt-8 h-px w-36 overflow-hidden rounded-full bg-white/20">
          <div
            ref={barRef}
            className="h-full w-full bg-white/90"
            style={reducedMotion ? { transform: "translateX(0%)" } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
