"use client";

import { useEffect, useState } from "react";
import { archiveArtifacts, archiveData } from "@/artifacts/archiveData";
import type { ArtifactId } from "@/artifacts/inspection";

type ArchiveSection = "index" | "connections" | "sectors" | "system";

type ArchiveModeProps = {
  open: boolean;
  discoveredCount: number;
  selectedId: ArtifactId;
  postJourney: boolean;
  reducedMotion: boolean;
  onClose: () => void;
  onSelect: (id: ArtifactId) => void;
  onRevisit: (id: ArtifactId) => void;
  onInspect: (id: ArtifactId) => void;
};

const mapPositions = [
  [11, 64], [27, 35], [45, 55], [61, 27], [77, 60], [91, 38],
] as const;

export function ArchiveCommand({
  active,
  discoveredCount,
  onOpen,
}: {
  active: boolean;
  discoveredCount: number;
  onOpen: () => void;
}) {
  return (
    <button
      className={`fixed bottom-7 right-5 z-[42] min-h-11 border border-white/16 bg-black/35 px-4 text-[9px] tracking-[0.32em] text-white/62 backdrop-blur-sm transition-all hover:border-white/38 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:bottom-8 sm:right-8 ${active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
      onClick={onOpen}
      type="button"
      aria-label={`Open archive. ${discoveredCount} of 6 artifacts discovered.`}
      aria-hidden={!active}
      tabIndex={active ? 0 : -1}
    >
      ARCHIVE <span className="ml-3 text-white/32">{String(discoveredCount).padStart(2, "0")}/06</span>
    </button>
  );
}

export function ArchiveMode({
  open,
  discoveredCount,
  selectedId,
  postJourney,
  reducedMotion,
  onClose,
  onSelect,
  onRevisit,
  onInspect,
}: ArchiveModeProps) {
  const [section, setSection] = useState<ArchiveSection>("index");
  const [recordIndex, setRecordIndex] = useState(0);
  const selectedArtifact = archiveArtifacts.find((artifact) => artifact.id === selectedId) ?? archiveArtifacts[0];
  const selectedData = archiveData[selectedArtifact.id];

  const selectArtifact = (id: ArtifactId) => {
    setRecordIndex(0);
    onSelect(id);
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  return (
    <section
      aria-hidden={!open}
      inert={!open}
      aria-label="Interactive archive"
      data-archive-mode
      className={`fixed inset-0 z-[46] overflow-hidden bg-black/72 text-white backdrop-blur-[5px] transition-all ${reducedMotion ? "duration-0" : "duration-700"} ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:18vw_100%] opacity-50" />
      <div className="relative flex h-full min-h-0 flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-12 lg:py-9">
        <header className="flex shrink-0 items-start justify-between border-b border-white/12 pb-5">
          <div className="border-l border-white/28 pl-4">
            <p className="text-[9px] tracking-[0.5em] text-white/42">VOID ARCHIVE / LOCAL ACCESS</p>
            <h2 className="mt-3 text-lg font-medium tracking-[0.34em] sm:text-2xl">ARCHIVE MODE</h2>
          </div>
          <div className="flex items-center gap-5">
            <p className="hidden text-right text-[8px] leading-5 tracking-[0.28em] text-white/34 sm:block">
              ACCESS / {postJourney ? "OBSERVER 07" : "PROVISIONAL"}<br />INDEX / {String(discoveredCount).padStart(2, "0")} OF 06
            </p>
            <button className="min-h-11 border-l border-white/20 pl-4 text-[9px] tracking-[0.3em] text-white/55 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" onClick={onClose} type="button">CLOSE</button>
          </div>
        </header>

        <nav className="flex shrink-0 gap-5 overflow-x-auto border-b border-white/8 py-4 text-[8px] tracking-[0.28em] text-white/35" aria-label="Archive sections">
          {(["index", "connections", "sectors", "system"] as ArchiveSection[]).map((item) => (
            <button key={item} className={`min-h-10 whitespace-nowrap border-b transition-colors ${section === item ? "border-white/55 text-white/85" : "border-transparent hover:text-white/65"}`} onClick={() => setSection(item)} type="button">
              {item === "index" ? "ARTIFACT INDEX" : item.toUpperCase()}
            </button>
          ))}
          <button className="ml-auto hidden min-h-10 whitespace-nowrap text-white/45 hover:text-white sm:block" onClick={onClose} type="button">RESUME JOURNEY</button>
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-5 sm:py-7">
          {section === "index" && (
            <div className="grid min-h-full gap-8 lg:grid-cols-[17rem_1fr] lg:gap-14">
              <div className="border-r-0 border-white/10 lg:border-r lg:pr-7">
                <p className="mb-4 text-[8px] tracking-[0.38em] text-white/28">DISCOVERED SECTORS</p>
                <div className="grid gap-px border-y border-white/10 sm:grid-cols-2 lg:grid-cols-1">
                  {archiveArtifacts.map((artifact, index) => {
                    const discovered = index < discoveredCount;
                    const current = selectedId === artifact.id;
                    return (
                      <button
                        key={artifact.id}
                        className={`group min-h-[4.8rem] border-b border-white/7 px-2 py-3 text-left transition-colors ${discovered ? "hover:bg-white/[0.035]" : "cursor-not-allowed opacity-25"}`}
                        disabled={!discovered}
                        onClick={() => selectArtifact(artifact.id)}
                        type="button"
                      >
                        <span className={`text-[9px] tracking-[0.3em] ${current ? "text-white" : "text-white/38"}`}>{artifact.id}</span>
                        <span className={`ml-4 text-[10px] tracking-[0.24em] ${current ? "text-white/88" : "text-white/58"}`}>{discovered ? artifact.title : "RESTRICTED"}</span>
                        <span className="mt-2 block pl-10 text-[7px] tracking-[0.22em] text-white/27">{discovered ? archiveData[artifact.id].shortClass : "SECTOR UNOBSERVED"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <article className="relative max-w-4xl pb-8" aria-live="polite">
                <p className="text-[8px] tracking-[0.42em] text-white/31">{selectedData.sector} / {selectedArtifact.archiveCode}</p>
                <h3 className="mt-5 text-3xl font-medium tracking-[0.24em] text-white/92 sm:text-5xl">{selectedArtifact.title}</h3>
                <p className="mt-4 max-w-2xl text-[9px] leading-5 tracking-[0.2em] text-white/38">{selectedArtifact.summary}</p>
                <div className="mt-8 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-4 border-y border-white/10 py-5 sm:grid-cols-3">
                  {selectedArtifact.readings.slice(0, 6).map((reading) => (
                    <div key={reading.label}><p className="text-[7px] tracking-[0.25em] text-white/28">{reading.label}</p><p className="mt-2 text-[9px] tracking-[0.2em] text-white/68">{reading.value}</p></div>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button className="min-h-11 border border-white/24 px-5 text-[9px] tracking-[0.27em] text-white/78 hover:border-white/55 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" onClick={() => onInspect(selectedArtifact.id)} type="button">INSPECT ARTIFACT</button>
                  <button className="min-h-11 border border-white/10 px-5 text-[9px] tracking-[0.27em] text-white/48 hover:border-white/32 hover:text-white/75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" onClick={() => onRevisit(selectedArtifact.id)} type="button">RETURN TO SECTOR</button>
                </div>

                <div className="mt-10 grid gap-5 sm:grid-cols-[15rem_1fr]">
                  <div>
                    <p className="mb-3 text-[8px] tracking-[0.36em] text-white/28">CLASSIFIED RECORDS</p>
                    {selectedData.records.map((record, index) => (
                      <button key={record.code} className={`block min-h-11 w-full border-t border-white/8 text-left text-[8px] tracking-[0.22em] ${recordIndex === index ? "text-white/78" : "text-white/34 hover:text-white/58"}`} onClick={() => setRecordIndex(index)} type="button">{record.type} / {record.code}</button>
                    ))}
                  </div>
                  <div className="border-l border-white/14 py-2 pl-5">
                    <p className="text-[8px] tracking-[0.34em] text-white/30">{selectedData.records[recordIndex].type}</p>
                    <p className={`mt-4 max-w-lg text-[10px] leading-6 tracking-[0.2em] ${selectedData.records[recordIndex].restricted ? "text-[#b9aaa0]/65" : "text-white/58"}`}>{selectedData.records[recordIndex].body}</p>
                  </div>
                </div>
              </article>
            </div>
          )}

          {section === "connections" && <ConnectionMap discoveredCount={discoveredCount} onSelect={(id) => { selectArtifact(id); setSection("index"); }} />}
          {section === "sectors" && <SectorMap discoveredCount={discoveredCount} onSelect={(id) => { selectArtifact(id); setSection("index"); }} />}
          {section === "system" && <SystemPanel discoveredCount={discoveredCount} postJourney={postJourney} />}
        </div>
      </div>
    </section>
  );
}

function ConnectionMap({ discoveredCount, onSelect }: { discoveredCount: number; onSelect: (id: ArtifactId) => void }) {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-[8px] tracking-[0.42em] text-white/28">ARCHIVE CORRELATION / LIVE MODEL</p>
      <h3 className="mt-4 text-2xl tracking-[0.28em] sm:text-4xl">CONNECTION FIELD</h3>
      <p className="mt-4 max-w-xl text-[9px] leading-5 tracking-[0.2em] text-white/36">Relationships resolve only after direct observation. Cross-sector causality remains unverified.</p>
      <div className="relative mt-9 aspect-[16/8] min-h-[19rem] border-y border-white/10">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((index) => <line key={index} x1={mapPositions[index][0]} y1={mapPositions[index][1]} x2={mapPositions[index + 1][0]} y2={mapPositions[index + 1][1]} stroke="rgba(220,228,228,.28)" strokeWidth=".18" opacity={index + 1 < discoveredCount ? 1 : .2} />)}
          <line x1="45" y1="55" x2="91" y2="38" stroke="rgba(220,228,228,.26)" strokeDasharray="1.2 1.8" strokeWidth=".15" opacity={discoveredCount === 6 ? 1 : .12} />
          <line x1="27" y1="35" x2="77" y2="60" stroke="rgba(174,159,151,.18)" strokeDasharray=".8 2.2" strokeWidth=".12" opacity={discoveredCount >= 5 ? 1 : .1} />
        </svg>
        {archiveArtifacts.map((artifact, index) => {
          const discovered = index < discoveredCount;
          return <button key={artifact.id} disabled={!discovered} onClick={() => onSelect(artifact.id)} type="button" className={`absolute -translate-x-1/2 -translate-y-1/2 text-left ${discovered ? "group" : "opacity-20"}`} style={{ left: `${mapPositions[index][0]}%`, top: `${mapPositions[index][1]}%` }}><span className="block h-3 w-3 border border-white/40 bg-black transition-transform group-hover:rotate-45" /><span className="mt-2 block whitespace-nowrap text-[8px] tracking-[0.24em] text-white/62">{artifact.id}</span><span className="hidden whitespace-nowrap text-[7px] tracking-[0.18em] text-white/28 sm:block">{discovered ? artifact.title : "UNRESOLVED"}</span></button>;
        })}
        {discoveredCount === 6 && <p className="absolute bottom-[8%] left-[58%] text-[7px] tracking-[0.25em] text-white/32">003 ↕ 006 / CORRELATION UNRESOLVED</p>}
      </div>
    </div>
  );
}

function SectorMap({ discoveredCount, onSelect }: { discoveredCount: number; onSelect: (id: ArtifactId) => void }) {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-[8px] tracking-[0.42em] text-white/28">SPATIAL INDEX / NON-EUCLIDEAN PROJECTION</p>
      <h3 className="mt-4 text-2xl tracking-[0.28em] sm:text-4xl">SECTOR MAP</h3>
      <div className="relative mt-9 min-h-[25rem] overflow-hidden border-y border-white/10 py-8">
        <div className="absolute left-[9%] right-[9%] top-1/2 h-px bg-white/15" />
        <div className="absolute left-[70%] top-[18%] h-[65%] w-px rotate-[14deg] bg-white/10" />
        <div className="grid h-full grid-cols-2 gap-x-14 gap-y-6 sm:grid-cols-3">
          {archiveArtifacts.map((artifact, index) => {
            const discovered = index < discoveredCount;
            const corrupted = artifact.id === "005";
            return <button key={artifact.id} disabled={!discovered} onClick={() => onSelect(artifact.id)} type="button" className={`relative min-h-28 border-l pl-4 text-left transition-colors ${corrupted ? "translate-x-3 border-[#aa9a91]/40 sm:-translate-y-3" : "border-white/18"} ${discovered ? "hover:border-white/55" : "opacity-20"}`}><span className="text-[8px] tracking-[0.3em] text-white/30">SECTOR {archiveData[artifact.id].sector}</span><span className="mt-3 block text-[11px] tracking-[0.24em] text-white/70">{discovered ? artifact.title : "INACCESSIBLE"}</span><span className="mt-4 block h-px w-12 bg-white/18" /><span className="mt-2 block text-[7px] tracking-[0.2em] text-white/25">DEPTH {String(index + 1).padStart(2, "0")} / {corrupted ? "COORDINATES CONFLICT" : "MAP RETURN NOMINAL"}</span></button>;
          })}
        </div>
        {discoveredCount >= 5 && <div className="absolute bottom-4 right-[8%] border-l border-[#aa9a91]/30 pl-3 text-[7px] tracking-[0.25em] text-[#b4a49a]/45">SECTOR 07<br />ADDRESS IMPOSSIBLE</div>}
      </div>
    </div>
  );
}

function SystemPanel({ discoveredCount, postJourney }: { discoveredCount: number; postJourney: boolean }) {
  const rows = [
    ["ARCHIVE STATUS", `${discoveredCount} ANOMALIES CONTAINED`], ["ACTIVE SECTORS", String(discoveredCount).padStart(2, "0")],
    ["OBSERVER STATUS", postJourney ? "TRACKED / 07" : "PROVISIONAL"], ["SESSION", "LOCAL"],
    ["RENDER STATUS", "NOMINAL"], ["AUDIO BUS", "STANDBY / NO ASSET LINK"],
  ];
  return <div className="mx-auto max-w-3xl"><p className="text-[8px] tracking-[0.42em] text-white/28">ARCHIVE OPERATING LAYER</p><h3 className="mt-4 text-2xl tracking-[0.28em] sm:text-4xl">SYSTEM</h3><div className="mt-10 border-y border-white/10">{rows.map(([label, value]) => <div key={label} className="grid min-h-16 grid-cols-[1fr_1.25fr] items-center border-b border-white/7 text-[8px] tracking-[0.24em]"><span className="text-white/29">{label}</span><span className="text-white/68">{value}</span></div>)}</div><p className="mt-7 text-[8px] leading-5 tracking-[0.22em] text-white/26">SOUND REMAINS DISABLED UNTIL A USER-INITIATED ASSET BUS IS AVAILABLE. NO AUDIO AUTOPLAY IS PERMITTED.</p></div>;
}
