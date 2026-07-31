"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArchiveCanvas } from "../three/ArchiveCanvas";
import { ArchiveHUD } from "./ArchiveHUD";
import { ArtifactRecord } from "./ArtifactRecord";
import { LoaderOverlay } from "./LoaderOverlay";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceProfile } from "@/hooks/useDeviceProfile";
import { useArchiveScroll } from "@/hooks/useArchiveScroll";
import { JourneyUI } from "./JourneyUI";
import { gravityCoreArtifact, liquidMirrorArtifact, memoryCrystalArtifact, neuralRelicArtifact, temporalRingArtifact, voidArtifact } from "@/artifacts/registry";
import { ArchiveEnding } from "./ArchiveEnding";
import { ArchiveCommand, ArchiveMode } from "./ArchiveMode";
import { InspectMode } from "./InspectMode";
import { useArchiveDiscovery } from "@/hooks/useArchiveDiscovery";
import { archiveArtifacts } from "@/artifacts/archiveData";
import type { ArtifactId, InspectionControl } from "@/artifacts/inspection";
import { RealityProvider, useReality, useRealitySnapshot } from "@/reality/RealityProvider";
import { RealityEffects } from "./RealityEffects";
import { useGraphicsQuality } from "@/hooks/useGraphicsQuality";
import { AudioProvider } from "@/audio/AudioProvider";
import { useArchiveAudio } from "@/audio/useArchiveAudio";
import { SoundControl } from "./SoundControl";
import { NexusHUD, NexusTerminal, NexusTransition } from "./NexusInterface";
import { defaultNexusPose, type ExperienceMode, type NexusInteractionId, type PlayerPose } from "@/game/gameTypes";
import { loadNexusCheckpoint, saveNexusCheckpoint } from "@/game/checkpoint";
import { NexusControlStore } from "@/game/NexusControlStore";

function stageArtifact(stage: string): ArtifactId | null {
  if (stage.startsWith("object-two")) return "002";
  if (stage.startsWith("object-three")) return "003";
  if (stage.startsWith("object-four")) return "004";
  if (stage.startsWith("object-five")) return "005";
  if (stage.startsWith("object-six")) return "006";
  if (["observation", "approach", "activation", "inspection"].includes(stage)) return "001";
  return null;
}

export function VoidArchivePage() {
  return <RealityProvider><AudioProvider><VoidArchiveExperience /></AudioProvider></RealityProvider>;
}

function VoidArchiveExperience() {
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<ArtifactId>("001");
  const [inspectedId, setInspectedId] = useState<ArtifactId | null>(null);
  const [inspectionPrimary, setInspectionPrimary] = useState(0.5);
  const [scannerActive, setScannerActive] = useState(false);
  const [archiveUnlocked, setArchiveUnlocked] = useState(false);
  const [freezeActive, setFreezeActive] = useState(false);
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>("nexus");
  const [nexusEntered, setNexusEntered] = useState(false);
  const [nexusTarget, setNexusTarget] = useState<NexusInteractionId | null>(null);
  const [nexusScanner, setNexusScanner] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [nexusPose, setNexusPose] = useState<PlayerPose>(defaultNexusPose);
  const [tutorialVisible, setTutorialVisible] = useState(true);
  const [nexusNotice, setNexusNotice] = useState<string | null>(null);
  const [returningToNexus, setReturningToNexus] = useState(false);
  const [nexusControls] = useState(() => new NexusControlStore());
  const transitionTimerRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const lastCheckpointRef = useRef(0);
  const pendingInspectionRef = useRef<number | null>(null);
  const freezeTimerRef = useRef<number | null>(null);
  const inspectionRef = useRef<InspectionControl>({ active: false, artifactId: null, primary: 0.5, pointerX: 0, pointerY: 0, scanner: false, observerConfidence: 0, sessionBias: 0, freezeActive: false });
  const reality = useReality();
  const audio = useArchiveAudio();
  const realitySession = useRealitySnapshot();
  const reducedMotion = useReducedMotion();
  const { tier, hasFinePointer } = useDeviceProfile();
  const { quality } = useGraphicsQuality(tier, reducedMotion);
  const { progressRef, hasEnteredArtifact, journeyStage } = useArchiveScroll();
  const discoveredCount = useArchiveDiscovery(journeyStage);
  const inspectedArtifact = archiveArtifacts.find((artifact) => artifact.id === inspectedId) ?? null;
  const postJourney = archiveUnlocked || realitySession.archiveUnlocked || journeyStage === "session-complete";
  const realityArtifact = inspectedId ?? (archiveOpen ? selectedId : experienceMode === "observation" ? stageArtifact(journeyStage) : null);
  const nexusDiscoveredCount = Math.max(discoveredCount, new Set(realitySession.visitOrder).size, postJourney ? 6 : 1);
  const nexusActive = experienceMode === "nexus" && nexusEntered && !archiveOpen && !terminalOpen && !inspectedArtifact;

  useLenisScroll(reducedMotion || experienceMode !== "observation" || archiveOpen || Boolean(inspectedArtifact));

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const checkpoint = loadNexusCheckpoint();
      const forceIntro = new URLSearchParams(window.location.search).has("nexus-intro");
      setNexusPose(forceIntro ? defaultNexusPose : checkpoint.pose);
      if (checkpoint.checkpoint === "OBSERVATION_COMPLETE" && !forceIntro) setNexusEntered(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setIsLoading(false);
      },
      reducedMotion ? 650 : 1600,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!introComplete) return;
    const timer = window.setTimeout(() => setShowInfo(true), reducedMotion ? 0 : 720);
    return () => window.clearTimeout(timer);
  }, [introComplete, reducedMotion]);

  useEffect(() => {
    inspectionRef.current.active = Boolean(inspectedId);
    inspectionRef.current.artifactId = inspectedId;
    inspectionRef.current.primary = inspectionPrimary;
    inspectionRef.current.scanner = scannerActive;
    inspectionRef.current.observerConfidence = realitySession.observerConfidence;
    inspectionRef.current.sessionBias = ["gravity", "optical", "temporal", "adaptive", "spatial", "mnemonic"].indexOf(realitySession.affinity) / 5;
    inspectionRef.current.freezeActive = freezeActive;
  }, [freezeActive, inspectedId, inspectionPrimary, realitySession.affinity, realitySession.observerConfidence, scannerActive]);

  useEffect(() => {
    reality.setContext(realityArtifact, archiveOpen ? "archive" : inspectedId ? "inspect" : terminalOpen ? "terminal" : experienceMode === "nexus" ? "nexus" : "journey", reducedMotion, tier);
  }, [archiveOpen, experienceMode, inspectedId, reality, realityArtifact, reducedMotion, terminalOpen, tier]);

  useEffect(() => {
    audio.syncScene({ stage: experienceMode === "observation" ? journeyStage : "archive-nexus", artifact: realityArtifact, inspecting: Boolean(inspectedId), control: inspectionPrimary, scanner: scannerActive || nexusScanner, archiveOpen: archiveOpen || terminalOpen, freeze: freezeActive, mobile: tier === "mobile" });
  }, [archiveOpen, audio, experienceMode, freezeActive, inspectedId, inspectionPrimary, journeyStage, nexusScanner, realityArtifact, scannerActive, terminalOpen, tier]);

  useEffect(() => {
    if (!inspectedId) return;
    reality.beginInspection(inspectedId);
    return () => reality.endInspection(inspectedId);
  }, [inspectedId, reality]);

  useEffect(() => {
    if (experienceMode !== "observation" || journeyStage !== "session-complete") return;
    const frame = window.requestAnimationFrame(() => { setArchiveUnlocked(true); reality.unlockArchive(); audio.cueInteraction("subject"); });
    return () => window.cancelAnimationFrame(frame);
  }, [audio, experienceMode, journeyStage, reality]);

  useEffect(() => {
    if (experienceMode !== "observation" || journeyStage !== "memory-recovery-passage" || realitySession.realityFreezeSeen) return;
    const startFrame = window.requestAnimationFrame(() => { setFreezeActive(true); reality.setFreezeActive(true); });
    freezeTimerRef.current = window.setTimeout(() => {
      setFreezeActive(false);
      reality.setFreezeActive(false);
      reality.markFreezeSeen();
    }, reducedMotion ? 650 : 1450);
    return () => window.cancelAnimationFrame(startFrame);
  }, [experienceMode, journeyStage, reality, realitySession.realityFreezeSeen, reducedMotion]);

  useEffect(() => {
    if (!archiveOpen && !inspectedArtifact && !terminalOpen && experienceMode !== "nexus") return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [archiveOpen, experienceMode, inspectedArtifact, terminalOpen]);

  useEffect(() => {
    if (!inspectedArtifact) return;
    const syncInspectionPosition = () => {
      const range = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const target = inspectedArtifact.id === "001" ? 0.1 : inspectedArtifact.camera.inspectionAt;
      window.scrollTo({ top: range * target, behavior: "auto" });
    };
    const frame = window.requestAnimationFrame(syncInspectionPosition);
    window.addEventListener("resize", syncInspectionPosition);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", syncInspectionPosition);
    };
  }, [inspectedArtifact]);

  useEffect(() => () => {
    if (pendingInspectionRef.current) window.clearTimeout(pendingInspectionRef.current);
    if (freezeTimerRef.current) window.clearTimeout(freezeTimerRef.current);
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
  }, []);

  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);
  const seekArtifact = useCallback((id: ArtifactId, inspectAfter: boolean) => {
    const artifact = archiveArtifacts.find((entry) => entry.id === id);
    if (!artifact) return;
    if (pendingInspectionRef.current) window.clearTimeout(pendingInspectionRef.current);
    setArchiveOpen(false);
    setInspectedId(null);
    setSelectedId(id);
    setScannerActive(false);
    reality.revisit(id);
    const seek = () => {
      const range = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const target = id === "001" ? 0.1 : artifact.camera.inspectionAt;
      window.scrollTo({ top: range * target, behavior: reducedMotion ? "auto" : "smooth" });
    };
    if (experienceMode !== "observation") {
      setExperienceMode("observation");
      setIntroComplete(false);
      window.setTimeout(seek, 120);
    } else window.requestAnimationFrame(seek);
    if (inspectAfter) {
      pendingInspectionRef.current = window.setTimeout(() => {
        setInspectionPrimary(0.5);
        inspectionRef.current.pointerX = 0;
        inspectionRef.current.pointerY = 0;
        setInspectedId(id);
        audio.cueInteraction("inspect");
      }, reducedMotion ? 80 : 1450);
    }
  }, [audio, experienceMode, reality, reducedMotion]);

  const handleInspectionPointer = useCallback((x: number, y: number) => {
    inspectionRef.current.pointerX = x;
    inspectionRef.current.pointerY = y;
  }, []);

  const handlePrimary = useCallback((value: number) => {
    if (!inspectedId) return;
    setInspectionPrimary(value);
    reality.recordControl(inspectedId, value);
    audio.cueControl(inspectedId, value);
  }, [audio, inspectedId, reality]);

  const handleScanner = useCallback((active: boolean) => {
    setScannerActive(active);
    if (active) audio.cueInteraction("scanner");
    if (active && inspectedId === "005") reality.recordVoidProbe();
  }, [audio, inspectedId, reality]);

  const openArchive = useCallback(() => { audio.cueInteraction("archive"); setArchiveOpen(true); }, [audio]);

  const releasePointer = useCallback(() => { if (document.pointerLockElement) void document.exitPointerLock(); }, []);
  const showNexusNotice = useCallback((message: string) => {
    setNexusNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNexusNotice(null), 2600);
  }, []);
  const startObservation = useCallback(() => {
    if (experienceMode === "transition") return;
    releasePointer(); setArchiveOpen(false); setTerminalOpen(false); setNexusScanner(false); setReturningToNexus(false); setExperienceMode("transition"); setIntroComplete(false);
    audio.cueInteraction("inspect"); saveNexusCheckpoint("OBSERVATION_STARTED", nexusPose);
    window.scrollTo({ top: 0, behavior: "auto" });
    transitionTimerRef.current = window.setTimeout(() => setExperienceMode("observation"), reducedMotion ? 180 : 950);
  }, [audio, experienceMode, nexusPose, reducedMotion, releasePointer]);
  const returnToNexus = useCallback(() => {
    releasePointer(); setArchiveOpen(false); setInspectedId(null); setReturningToNexus(true); setExperienceMode("transition");
    saveNexusCheckpoint(postJourney ? "OBSERVATION_COMPLETE" : "NEXUS", nexusPose);
    window.scrollTo({ top: 0, behavior: "auto" });
    transitionTimerRef.current = window.setTimeout(() => { setExperienceMode("nexus"); setNexusEntered(true); setIntroComplete(true); }, reducedMotion ? 180 : 850);
  }, [nexusPose, postJourney, reducedMotion, releasePointer]);
  const toggleNexusScanner = useCallback(() => { setNexusScanner((current) => { if (!current) audio.cueInteraction("scanner"); return !current; }); setTutorialVisible(false); }, [audio]);
  const handleNexusInteract = useCallback((target: NexusInteractionId) => {
    setTutorialVisible(false);
    if (target === "observation-gate") { startObservation(); return; }
    if (target === "archive-map") { releasePointer(); openArchive(); return; }
    if (target === "system-terminal") { releasePointer(); audio.cueInteraction("inspect"); setTerminalOpen(true); return; }
    if (target === "scanner-array") { toggleNexusScanner(); showNexusNotice("MEASUREMENT ARRAY / LOCAL LINK ESTABLISHED"); return; }
    if (target === "restricted-sector") { audio.cueInteraction("record"); showNexusNotice("N-06 / ACCESS RESTRICTED"); return; }
    setNexusScanner(true); audio.cueInteraction("scanner"); showNexusNotice("ACTIVE SECTOR COUNT / 7 · INDEX RETURN / 01–06");
  }, [audio, openArchive, releasePointer, showNexusNotice, startObservation, toggleNexusScanner]);
  const handleNexusPose = useCallback((pose: PlayerPose) => {
    setNexusPose(pose);
    const now = performance.now();
    if (now - lastCheckpointRef.current > 1600) { lastCheckpointRef.current = now; saveNexusCheckpoint(postJourney ? "OBSERVATION_COMPLETE" : "NEXUS", pose); }
  }, [postJourney]);

  useEffect(() => {
    if (!terminalOpen) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setTerminalOpen(false); };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [terminalOpen]);

  const interactionHidden = archiveOpen || Boolean(inspectedArtifact) || experienceMode !== "observation";
  const gravityRecordVisible = !interactionHidden && showInfo && (journeyStage === "observation" || journeyStage === "approach");
  const mirrorRecordVisible = !interactionHidden && (journeyStage === "object-two-activation" || journeyStage === "object-two-inspection");
  const temporalRecordVisible = !interactionHidden && (journeyStage === "object-three-activation" || journeyStage === "object-three-inspection");
  const neuralRecordVisible = !interactionHidden && (journeyStage === "object-four-activation" || journeyStage === "object-four-inspection");
  const voidRecordVisible = !interactionHidden && (journeyStage === "object-five-activation" || journeyStage === "object-five-inspection");
  const memoryRecordVisible = !interactionHidden && (journeyStage === "object-six-activation" || journeyStage === "object-six-inspection");

  return (
    <main className={`${experienceMode === "observation" ? "journey-scroll-space" : "h-[100svh]"} relative overflow-x-hidden bg-[#030303] text-white`} aria-label="VOID ARCHIVE interactive collection" data-experience-mode={experienceMode}>
      <h1 className="sr-only">VOID ARCHIVE</h1>
      {!interactionHidden && <ArchiveHUD active={introComplete} stage={journeyStage} discoveredCount={discoveredCount} onSelectArtifact={(index) => seekArtifact(archiveArtifacts[index - 1].id, false)} />}
      <ArtifactRecord artifact={gravityCoreArtifact} isVisible={gravityRecordVisible} reducedMotion={reducedMotion} anomalyActive={hasEnteredArtifact} />
      <ArtifactRecord artifact={liquidMirrorArtifact} isVisible={mirrorRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-two-inspection"} />
      <ArtifactRecord artifact={temporalRingArtifact} isVisible={temporalRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-three-inspection"} />
      <ArtifactRecord artifact={neuralRelicArtifact} isVisible={neuralRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-four-inspection"} />
      <ArtifactRecord artifact={voidArtifact} isVisible={voidRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-five-inspection"} />
      <ArtifactRecord artifact={memoryCrystalArtifact} isVisible={memoryRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-six-inspection"} />
      {!interactionHidden && <JourneyUI stage={journeyStage} snapshot={realitySession} />}
      {experienceMode === "observation" && <ArchiveEnding stage={journeyStage} reducedMotion={reducedMotion} onOpenArchive={openArchive} />}
      {experienceMode === "observation" && !interactionHidden && journeyStage !== "memory-recovery-passage" && <button type="button" onClick={returnToNexus} className={`fixed bottom-8 right-5 z-[43] min-h-11 border bg-black/48 px-4 text-[7px] tracking-[.25em] backdrop-blur-sm sm:right-8 ${journeyStage === "session-complete" ? "border-white/28 text-white/76" : "border-white/12 text-white/38"}`}>{journeyStage === "session-complete" ? "RETURN TO NEXUS" : "NEXUS"}</button>}
      <ArchiveCommand active={introComplete && !interactionHidden && journeyStage !== "session-complete"} discoveredCount={discoveredCount} onOpen={openArchive} />
      <ArchiveMode open={archiveOpen} discoveredCount={experienceMode === "observation" ? discoveredCount : nexusDiscoveredCount} selectedId={selectedId} postJourney={postJourney} reducedMotion={reducedMotion} graphicsQuality={quality} onClose={() => setArchiveOpen(false)} onSelect={setSelectedId} onRevisit={(id) => seekArtifact(id, false)} onInspect={(id) => seekArtifact(id, true)} />
      <InspectMode artifact={inspectedArtifact} primary={inspectionPrimary} scanner={scannerActive} reducedMotion={reducedMotion} onPrimary={handlePrimary} onScanner={handleScanner} onPointer={handleInspectionPointer} onExit={() => setInspectedId(null)} />
      <RealityEffects artifact={interactionHidden ? realityArtifact : stageArtifact(journeyStage)} primary={inspectionPrimary} freezeActive={freezeActive} reducedMotion={reducedMotion} />
      <SoundControl active={!isLoading && introComplete} mode={archiveOpen ? "archive" : inspectedArtifact ? "inspect" : experienceMode === "nexus" ? "nexus" : "journey"} />
      {experienceMode === "nexus" && <NexusHUD entered={nexusEntered} active={nexusActive} target={nexusTarget} scanner={nexusScanner} pointerLocked={pointerLocked} tier={tier} hasFinePointer={hasFinePointer} controls={nexusControls} session={realitySession} tutorialVisible={tutorialVisible} notice={nexusNotice} onEnter={() => { setNexusEntered(true); setTutorialVisible(true); }} onBegin={startObservation} onArchive={openArchive} onSystem={() => { releasePointer(); setTerminalOpen(true); }} onInteract={() => { if (nexusTarget) handleNexusInteract(nexusTarget); }} onScanner={toggleNexusScanner} />}
      <NexusTerminal open={terminalOpen} session={realitySession} onClose={() => setTerminalOpen(false)} onArchive={() => { setTerminalOpen(false); openArchive(); }} />
      <NexusTransition visible={experienceMode === "transition"} returning={returningToNexus} />
      <ObserverDebugPanel />
      {process.env.NODE_ENV !== "production" && <output hidden data-nexus-diagnostics={JSON.stringify({ mode: experienceMode, journeyStage, entered: nexusEntered, active: nexusActive, target: nexusTarget, scanner: nexusScanner, terminal: terminalOpen, pointerLocked, pose: nexusPose, controls: nexusControls.snapshot() })} />}
      <LoaderOverlay isVisible={isLoading} reducedMotion={reducedMotion} returningVisitor={realitySession.returningVisitor} />
      <ArchiveCanvas isSceneReady={!isLoading} reducedMotion={reducedMotion} scrollProgress={progressRef} inspection={inspectionRef} tier={tier} quality={quality} hasFinePointer={hasFinePointer} onIntroComplete={handleIntroComplete} mode={experienceMode} nexusActive={nexusActive} gateOpening={experienceMode === "transition" && !returningToNexus} nexusControls={nexusControls} nexusPose={nexusPose} discoveredCount={nexusDiscoveredCount} session={realitySession} onNexusTarget={setNexusTarget} onNexusInteract={handleNexusInteract} onNexusScanner={toggleNexusScanner} onNexusPose={handleNexusPose} onPointerLock={setPointerLocked} />
    </main>
  );
}

function ObserverDebugPanel() {
  const reality = useReality();
  const session = useRealitySnapshot();
  const enabled = useSyncExternalStore(
    () => () => undefined,
    () => process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("observer-debug"),
    () => false,
  );
  if (!enabled) return null;
  return (
    <aside className="fixed bottom-3 left-3 z-[70] max-w-[calc(100vw-6rem)] border border-white/20 bg-black/90 p-3 text-white" aria-label="Observer debug controls">
      <p className="text-[7px] tracking-[.3em] text-white/45">OBSERVER MODEL / DEV ONLY</p>
      <p className="mt-2 text-[8px] tracking-[.2em]">{session.archetype.toUpperCase()} · {Math.round(session.observerConfidence * 100)}% · {session.n07Route ?? "NO ROUTE"}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {(["interventionist", "witness", "chronologist", "cartographer", "synaptic", "mnemonist"] as const).map((profile) => (
          <button key={profile} type="button" className="min-h-8 border border-white/15 px-2 text-[6px] tracking-[.16em] text-white/55 hover:text-white" onClick={() => reality.applyDebugProfile(profile)}>SIMULATE {profile.toUpperCase()}</button>
        ))}
      </div>
    </aside>
  );
}
