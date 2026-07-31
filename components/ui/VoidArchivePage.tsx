"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  return <RealityProvider><VoidArchiveExperience /></RealityProvider>;
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
  const pendingInspectionRef = useRef<number | null>(null);
  const freezeTimerRef = useRef<number | null>(null);
  const inspectionRef = useRef<InspectionControl>({ active: false, artifactId: null, primary: 0.5, pointerX: 0, pointerY: 0, scanner: false, observerConfidence: 0, sessionBias: 0, freezeActive: false });
  const reality = useReality();
  const realitySession = useRealitySnapshot();
  const reducedMotion = useReducedMotion();
  const { tier, hasFinePointer } = useDeviceProfile();
  const { progressRef, hasEnteredArtifact, journeyStage } = useArchiveScroll();
  const discoveredCount = useArchiveDiscovery(journeyStage);
  const inspectedArtifact = archiveArtifacts.find((artifact) => artifact.id === inspectedId) ?? null;
  const postJourney = archiveUnlocked || realitySession.archiveUnlocked || journeyStage === "session-complete";
  const realityArtifact = inspectedId ?? (archiveOpen ? selectedId : stageArtifact(journeyStage));

  useLenisScroll(reducedMotion || archiveOpen || Boolean(inspectedArtifact));

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
    reality.setContext(realityArtifact, archiveOpen ? "archive" : inspectedId ? "inspect" : "journey", reducedMotion, tier);
  }, [archiveOpen, inspectedId, reality, realityArtifact, reducedMotion, tier]);

  useEffect(() => {
    if (!inspectedId) return;
    reality.beginInspection(inspectedId);
    return () => reality.endInspection(inspectedId);
  }, [inspectedId, reality]);

  useEffect(() => {
    if (journeyStage !== "session-complete") return;
    const frame = window.requestAnimationFrame(() => { setArchiveUnlocked(true); reality.unlockArchive(); });
    return () => window.cancelAnimationFrame(frame);
  }, [journeyStage, reality]);

  useEffect(() => {
    if (journeyStage !== "memory-recovery-passage" || realitySession.realityFreezeSeen) return;
    const startFrame = window.requestAnimationFrame(() => { setFreezeActive(true); reality.setFreezeActive(true); });
    freezeTimerRef.current = window.setTimeout(() => {
      setFreezeActive(false);
      reality.setFreezeActive(false);
      reality.markFreezeSeen();
    }, reducedMotion ? 650 : 1450);
    return () => window.cancelAnimationFrame(startFrame);
  }, [journeyStage, reality, realitySession.realityFreezeSeen, reducedMotion]);

  useEffect(() => {
    if (!archiveOpen && !inspectedArtifact) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [archiveOpen, inspectedArtifact]);

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
    window.requestAnimationFrame(seek);
    if (inspectAfter) {
      pendingInspectionRef.current = window.setTimeout(() => {
        setInspectionPrimary(0.5);
        inspectionRef.current.pointerX = 0;
        inspectionRef.current.pointerY = 0;
        setInspectedId(id);
      }, reducedMotion ? 80 : 1450);
    }
  }, [reality, reducedMotion]);

  const handleInspectionPointer = useCallback((x: number, y: number) => {
    inspectionRef.current.pointerX = x;
    inspectionRef.current.pointerY = y;
  }, []);

  const handlePrimary = useCallback((value: number) => {
    if (!inspectedId) return;
    setInspectionPrimary(value);
    reality.recordControl(inspectedId, value);
  }, [inspectedId, reality]);

  const handleScanner = useCallback((active: boolean) => {
    setScannerActive(active);
    if (active && inspectedId === "005") reality.recordVoidProbe();
  }, [inspectedId, reality]);

  const interactionHidden = archiveOpen || Boolean(inspectedArtifact);
  const gravityRecordVisible = !interactionHidden && showInfo && (journeyStage === "observation" || journeyStage === "approach");
  const mirrorRecordVisible = !interactionHidden && (journeyStage === "object-two-activation" || journeyStage === "object-two-inspection");
  const temporalRecordVisible = !interactionHidden && (journeyStage === "object-three-activation" || journeyStage === "object-three-inspection");
  const neuralRecordVisible = !interactionHidden && (journeyStage === "object-four-activation" || journeyStage === "object-four-inspection");
  const voidRecordVisible = !interactionHidden && (journeyStage === "object-five-activation" || journeyStage === "object-five-inspection");
  const memoryRecordVisible = !interactionHidden && (journeyStage === "object-six-activation" || journeyStage === "object-six-inspection");

  return (
    <main className="journey-scroll-space relative overflow-x-hidden bg-[#030303] text-white" aria-label="VOID ARCHIVE interactive collection">
      <h1 className="sr-only">VOID ARCHIVE</h1>
      {!interactionHidden && <ArchiveHUD active={introComplete} stage={journeyStage} discoveredCount={discoveredCount} onSelectArtifact={(index) => seekArtifact(archiveArtifacts[index - 1].id, false)} />}
      <ArtifactRecord artifact={gravityCoreArtifact} isVisible={gravityRecordVisible} reducedMotion={reducedMotion} anomalyActive={hasEnteredArtifact} />
      <ArtifactRecord artifact={liquidMirrorArtifact} isVisible={mirrorRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-two-inspection"} />
      <ArtifactRecord artifact={temporalRingArtifact} isVisible={temporalRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-three-inspection"} />
      <ArtifactRecord artifact={neuralRelicArtifact} isVisible={neuralRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-four-inspection"} />
      <ArtifactRecord artifact={voidArtifact} isVisible={voidRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-five-inspection"} />
      <ArtifactRecord artifact={memoryCrystalArtifact} isVisible={memoryRecordVisible} reducedMotion={reducedMotion} anomalyActive={journeyStage === "object-six-inspection"} />
      {!interactionHidden && <JourneyUI stage={journeyStage} />}
      <ArchiveEnding stage={journeyStage} reducedMotion={reducedMotion} onOpenArchive={() => setArchiveOpen(true)} />
      <ArchiveCommand active={introComplete && !interactionHidden && journeyStage !== "session-complete"} discoveredCount={discoveredCount} onOpen={() => setArchiveOpen(true)} />
      <ArchiveMode open={archiveOpen} discoveredCount={discoveredCount} selectedId={selectedId} postJourney={postJourney} reducedMotion={reducedMotion} onClose={() => setArchiveOpen(false)} onSelect={setSelectedId} onRevisit={(id) => seekArtifact(id, false)} onInspect={(id) => seekArtifact(id, true)} />
      <InspectMode artifact={inspectedArtifact} primary={inspectionPrimary} scanner={scannerActive} reducedMotion={reducedMotion} onPrimary={handlePrimary} onScanner={handleScanner} onPointer={handleInspectionPointer} onExit={() => setInspectedId(null)} />
      <RealityEffects artifact={interactionHidden ? realityArtifact : stageArtifact(journeyStage)} primary={inspectionPrimary} freezeActive={freezeActive} reducedMotion={reducedMotion} />
      <LoaderOverlay isVisible={isLoading} reducedMotion={reducedMotion} />
      <ArchiveCanvas isSceneReady={!isLoading} reducedMotion={reducedMotion} scrollProgress={progressRef} inspection={inspectionRef} tier={tier} hasFinePointer={hasFinePointer} onIntroComplete={handleIntroComplete} />
    </main>
  );
}
