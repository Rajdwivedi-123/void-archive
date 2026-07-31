"use client";

import { useEffect, useState } from "react";
import { useArchiveAudio } from "@/audio/useArchiveAudio";
import type { AudioDiagnostics } from "@/audio/audioTypes";

function AudioDiagnosticsProbe({ read }: { read: () => AudioDiagnostics }) {
  const [snapshot, setSnapshot] = useState(read);
  useEffect(() => {
    const interval = window.setInterval(() => setSnapshot(read()), 250);
    return () => window.clearInterval(interval);
  }, [read]);
  return <output hidden data-void-audio-diagnostics={JSON.stringify(snapshot)} />;
}

export function SoundControl({ active, mode }: { active: boolean; mode: "nexus" | "journey" | "archive" | "inspect" }) {
  const audio = useArchiveAudio();
  const placement = mode === "archive" ? "bottom-3 left-16 sm:bottom-8 sm:left-20" : mode === "nexus" ? "bottom-5 left-1/2 -translate-x-1/2 sm:bottom-8" : "left-1/2 top-16 -translate-x-1/2 sm:top-8";
  return (
    <div className={`fixed z-[49] transition-all ${placement} ${active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>
      <button
        type="button"
        aria-label={audio.enabled ? "Sound on. Mute spatial audio." : "Sound off. Enable spatial audio."}
        aria-pressed={audio.enabled}
        className="min-h-11 border border-white/16 bg-black/40 px-4 text-left text-[8px] tracking-[.3em] text-white/62 backdrop-blur-sm hover:border-white/38 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        onClick={audio.toggle}
      >
        <span className="text-white/34">SOUND</span><span className="ml-3 text-white/78">{audio.enabled ? "ON" : "OFF"}</span>
      </button>
      {!audio.enabled && audio.preferenceRemembered && <p className="mt-2 pl-1 text-[6px] tracking-[.22em] text-white/24">SPATIAL AUDIO READY / TAP TO RESUME</p>}
      {process.env.NODE_ENV !== "production" && <AudioDiagnosticsProbe read={audio.diagnostics} />}
    </div>
  );
}
