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
import { FacilityTransition, ObservationInstrument, RecordSearch, SignalAnalysis } from "./FacilityInterface";
import { EvidenceNotice, type PuzzleResolution } from "./InvestigationInterface";
import { defaultNexusPose, type ExperienceMode, type FacilityClue, type FacilityProgress, type FacilityRoom, type NexusInteractionId, type PlayerPose } from "@/game/gameTypes";
import { clearFacilityProgress, createFacilityProgress, loadFacilityProgress, saveFacilityProgress, saveNexusCheckpoint } from "@/game/checkpoint";
import { facilityPoses } from "@/game/facilityTopology";
import { NexusControlStore } from "@/game/NexusControlStore";
import { connectionKey, createInvestigationProgress, deriveInvestigationStage, meaningfulConnections, type InvestigationProgress, type PuzzleId } from "@/game/investigation";

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
  const [facilityProgress, setFacilityProgress] = useState<FacilityProgress>(createFacilityProgress);
  const [facilityHydrated, setFacilityHydrated] = useState(false);
  const [facilityRoom, setFacilityRoom] = useState<FacilityRoom>("nexus");
  const [routeTransition, setRouteTransition] = useState(false);
  const [routeDestination, setRouteDestination] = useState<FacilityRoom>("nexus");
  const [facilityModal, setFacilityModal] = useState<"record" | "signal" | "instrument" | null>(null);
  const [evidenceNotice, setEvidenceNotice] = useState<string | null>(null);
  const [nexusControls] = useState(() => new NexusControlStore());
  const transitionTimerRef = useRef<number | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const lastCheckpointRef = useRef(0);
  const pendingInspectionRef = useRef<number | null>(null);
  const freezeTimerRef = useRef<number | null>(null);
  const evidenceTimerRef = useRef<number | null>(null);
  const resettingFacilityRef = useRef(false);
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
  const nexusActive = experienceMode === "nexus" && nexusEntered && !archiveOpen && !terminalOpen && !inspectedArtifact && !facilityModal && !routeTransition;
  const facilityObjective = facilityProgress.investigation.investigationStage === "n07-vector" ? "DIRECTIVE INVALID" : facilityProgress.investigation.investigationStage === "correlation" || facilityProgress.investigation.investigationStage === "subject-identification" ? "LOCATE UNREGISTERED SECTOR" : facilityProgress.investigation.investigationStage === "contradiction" ? "IDENTIFY SHARED CORRELATION" : facilityProgress.signalResult ? "VERIFY NONLOCAL ROUTE" : facilityProgress.recordSearches.length ? "LOCATE SIGNAL SOURCE" : "VERIFY ANOMALY NETWORK";

  useLenisScroll(reducedMotion || experienceMode !== "observation" || archiveOpen || Boolean(inspectedArtifact));

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const checkpoint = loadFacilityProgress();
      const forceIntro = new URLSearchParams(window.location.search).has("nexus-intro");
      const room = forceIntro ? "nexus" : checkpoint.location;
      setFacilityProgress(checkpoint);
      setFacilityRoom(room);
      setNexusPose(forceIntro ? defaultNexusPose : checkpoint.pose);
      if (!forceIntro && (room !== "nexus" || checkpoint.discoveredRooms.length > 1)) setNexusEntered(true);
      setFacilityHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!realitySession.returningVisitor || new URLSearchParams(window.location.search).has("nexus-intro")) return;
    const frame = window.requestAnimationFrame(() => setNexusEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, [realitySession.returningVisitor]);

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
    audio.syncScene({ stage: experienceMode === "observation" ? journeyStage : `facility-${facilityRoom}`, artifact: realityArtifact, inspecting: Boolean(inspectedId), control: inspectionPrimary, scanner: scannerActive || nexusScanner, archiveOpen: archiveOpen || terminalOpen || Boolean(facilityModal), freeze: freezeActive, mobile: tier === "mobile" });
  }, [archiveOpen, audio, experienceMode, facilityModal, facilityRoom, freezeActive, inspectedId, inspectionPrimary, journeyStage, nexusScanner, realityArtifact, scannerActive, terminalOpen, tier]);

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
    if (!archiveOpen && !inspectedArtifact && !terminalOpen && !facilityModal && experienceMode !== "nexus") return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [archiveOpen, experienceMode, facilityModal, inspectedArtifact, terminalOpen]);

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
    if (evidenceTimerRef.current) window.clearTimeout(evidenceTimerRef.current);
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
  const updateFacility = useCallback((update: (current: FacilityProgress) => FacilityProgress) => {
    setFacilityProgress((current) => {
      const next = update(current);
      saveFacilityProgress(next);
      return next;
    });
  }, []);
  const updateInvestigation = useCallback((update: (current: InvestigationProgress) => InvestigationProgress) => {
    updateFacility((current) => {
      const investigation = update(current.investigation);
      return { ...current, investigation: { ...investigation, investigationStage: deriveInvestigationStage(investigation) } };
    });
  }, [updateFacility]);
  const registerEvidence = useCallback((evidenceId: string, knowledge?: string, falseLead?: string) => {
    updateInvestigation((current) => {
      const added = !current.evidenceDiscovered.includes(evidenceId);
      return {
        ...current,
        evidenceDiscovered: added ? [...current.evidenceDiscovered, evidenceId] : current.evidenceDiscovered,
        knowledgeFlags: knowledge && !current.knowledgeFlags.includes(knowledge) ? [...current.knowledgeFlags, knowledge] : current.knowledgeFlags,
        falseLeadsDisproven: falseLead && !current.falseLeadsDisproven.includes(falseLead) ? [...current.falseLeadsDisproven, falseLead] : current.falseLeadsDisproven,
      };
    });
    setEvidenceNotice(evidenceId);
    if (evidenceTimerRef.current) window.clearTimeout(evidenceTimerRef.current);
    evidenceTimerRef.current = window.setTimeout(() => setEvidenceNotice(null), reducedMotion ? 1200 : 2600);
    audio.cueInteraction("subject");
  }, [audio, reducedMotion, updateInvestigation]);
  const travelTo = useCallback((room: FacilityRoom) => {
    if (!facilityHydrated || routeTransition || experienceMode !== "nexus") return;
    releasePointer();
    setFacilityModal(null);
    setTerminalOpen(false);
    setArchiveOpen(false);
    setNexusTarget(null);
    setRouteDestination(room);
    setRouteTransition(true);
    const pose = facilityPoses[room];
    transitionTimerRef.current = window.setTimeout(() => {
      setFacilityRoom(room);
      setNexusPose(pose);
      updateFacility((current) => ({ ...current, location: room, pose, discoveredRooms: current.discoveredRooms.includes(room) ? current.discoveredRooms : [...current.discoveredRooms, room] }));
      setRouteTransition(false);
      setNexusEntered(true);
    }, reducedMotion ? 120 : 560);
  }, [experienceMode, facilityHydrated, reducedMotion, releasePointer, routeTransition, updateFacility]);
  const addFacilityClue = useCallback((clue: FacilityClue, interaction: string) => {
    updateFacility((current) => ({
      ...current,
      n07Clues: current.n07Clues.includes(clue) ? current.n07Clues : [...current.n07Clues, clue],
      completedInteractions: current.completedInteractions.includes(interaction) ? current.completedInteractions : [...current.completedInteractions, interaction],
    }));
  }, [updateFacility]);
  const startObservation = useCallback(() => {
    if (experienceMode === "transition") return;
    releasePointer(); setArchiveOpen(false); setTerminalOpen(false); setNexusScanner(false); setReturningToNexus(false); setExperienceMode("transition"); setIntroComplete(false);
    audio.cueInteraction("inspect"); saveNexusCheckpoint("OBSERVATION_STARTED", nexusPose);
    updateFacility((current) => ({ ...current, location: "nexus", pose: nexusPose }));
    window.scrollTo({ top: 0, behavior: "auto" });
    transitionTimerRef.current = window.setTimeout(() => setExperienceMode("observation"), reducedMotion ? 180 : 950);
  }, [audio, experienceMode, nexusPose, reducedMotion, releasePointer, updateFacility]);
  const returnToNexus = useCallback(() => {
    releasePointer(); setArchiveOpen(false); setInspectedId(null); setReturningToNexus(true); setExperienceMode("transition");
    saveNexusCheckpoint(postJourney ? "OBSERVATION_COMPLETE" : "NEXUS", nexusPose);
    window.scrollTo({ top: 0, behavior: "auto" });
    transitionTimerRef.current = window.setTimeout(() => { setFacilityRoom("nexus"); setNexusPose(facilityPoses.nexus); updateFacility((current) => ({ ...current, location: "nexus", pose: facilityPoses.nexus })); setExperienceMode("nexus"); setNexusEntered(true); setIntroComplete(true); }, reducedMotion ? 180 : 850);
  }, [nexusPose, postJourney, reducedMotion, releasePointer, updateFacility]);
  const toggleNexusScanner = useCallback(() => { setNexusScanner((current) => { if (!current) audio.cueInteraction("scanner"); return !current; }); setTutorialVisible(false); }, [audio]);
  const handleNexusInteract = useCallback((target: NexusInteractionId) => {
    setTutorialVisible(false);
    if (target === "observation-gate") { startObservation(); return; }
    if (target === "archive-map") { releasePointer(); openArchive(); return; }
    if (target === "system-terminal") { releasePointer(); audio.cueInteraction("inspect"); setTerminalOpen(true); return; }
    if (target === "scanner-array") { toggleNexusScanner(); showNexusNotice("MEASUREMENT ARRAY / LOCAL LINK ESTABLISHED"); return; }
    if (target === "restricted-sector") { audio.cueInteraction("record"); showNexusNotice("N-06 / ACCESS RESTRICTED"); return; }
    if (target === "route-record-vault") { audio.cueInteraction("archive"); travelTo("record-vault"); return; }
    if (target === "route-signal-room") { audio.cueInteraction("scanner"); travelTo("signal-room"); return; }
    if (target === "route-observation-deck") { audio.cueInteraction("inspect"); travelTo("observation-deck"); return; }
    if (target === "route-maintenance-spine") { audio.cueInteraction("record"); travelTo("maintenance-spine"); return; }
    if (target === "route-dead-sector") { audio.cueInteraction("record"); travelTo("dead-sector"); return; }
    if (target === "return-nexus") { travelTo("nexus"); return; }
    if (target === "return-record-vault") { travelTo("record-vault"); return; }
    if (target === "return-signal-room") { travelTo("signal-room"); return; }
    if (target === "record-search") { releasePointer(); audio.cueInteraction("record"); setFacilityModal("record"); return; }
    if (target === "signal-analysis") { releasePointer(); audio.cueInteraction("scanner"); setFacilityModal("signal"); return; }
    if (target === "observation-instrument") { releasePointer(); audio.cueInteraction("inspect"); setFacilityModal("instrument"); return; }
    if (target === "dead-sector-scan") {
      if (!nexusScanner) { showNexusNotice("SCANNER REQUIRED / CONTAINMENT RETURN WITHHELD"); return; }
      addFacilityClue("dead-sector", "dead-sector-scan");
      updateFacility((current) => ({ ...current, deadSectorDiscovered: true }));
      reality.recordFacilityEvent("spatial", "dead-sector", "dead-sector");
      registerEvidence("D-N00", "sector-statement-unreliable", "sector-empty");
      audio.cueInteraction("scanner"); showNexusNotice("SECTOR N-00 / DECOMMISSIONED · SIGNATURE ACTIVE"); return;
    }
    if (target === "shortcut-control") {
      updateFacility((current) => ({ ...current, unlockedShortcuts: current.unlockedShortcuts.includes("signal-spine") ? current.unlockedShortcuts : [...current.unlockedShortcuts, "signal-spine"], completedInteractions: current.completedInteractions.includes("shortcut-control") ? current.completedInteractions : [...current.completedInteractions, "shortcut-control"] }));
      reality.recordFacilityEvent("intervention", "maintenance-spine");
      audio.cueInteraction("record"); showNexusNotice("SHORTCUT / NEXUS-SIGNAL ROUTE AVAILABLE"); return;
    }
    if (target === "hidden-passage") {
      if (!nexusScanner && !facilityProgress.signalResult) { showNexusNotice("WALL DEPTH / UNRESOLVED · SCANNER LINK REQUIRED"); return; }
      updateFacility((current) => ({ ...current, hiddenPassageDiscovered: true, completedInteractions: current.completedInteractions.includes("hidden-passage") ? current.completedInteractions : [...current.completedInteractions, "hidden-passage"] }));
      addFacilityClue("maintenance-marking", "hidden-passage");
      reality.recordFacilityEvent("spatial", "maintenance-spine", "maintenance-marking");
      registerEvidence("MS-DEPTH", "scanner-depth-route");
      audio.cueInteraction("scanner"); showNexusNotice("MISSING WALL DEPTH / PASSAGE CONFIRMED"); return;
    }
    if (target === "corridor-marker") {
      addFacilityClue("corridor-label", "corridor-marker");
      updateFacility((current) => ({ ...current, impossibleCorridorSeen: true }));
      reality.recordFacilityEvent("witness", "maintenance-spine", "corridor-label");
      showNexusNotice(facilityProgress.impossibleCorridorSeen ? "ROUTE LABEL / N-05" : "ROUTE LABEL / N-07 · PREVIOUS RETURN / N-05"); return;
    }
    if (target === "n07-gate") { setNexusScanner(true); audio.cueInteraction("scanner"); showNexusNotice("N-07 / LOCATION NONLOCAL · ACCESS ROUTE UNKNOWN"); return; }
    setNexusScanner(true); audio.cueInteraction("scanner"); showNexusNotice("ACTIVE SECTOR COUNT / 7 · INDEX RETURN / 01–06");
  }, [addFacilityClue, audio, facilityProgress.impossibleCorridorSeen, facilityProgress.signalResult, nexusScanner, openArchive, reality, registerEvidence, releasePointer, showNexusNotice, startObservation, toggleNexusScanner, travelTo, updateFacility]);
  const handleNexusPose = useCallback((pose: PlayerPose) => {
    setNexusPose(pose);
    if (!facilityHydrated || resettingFacilityRef.current) return;
    const now = performance.now();
    if (facilityRoom === "maintenance-spine" && facilityProgress.hiddenPassageDiscovered && !facilityProgress.impossibleCorridorSeen && Math.abs(pose.yaw) > 2.45) {
      addFacilityClue("corridor-label", "corridor-turn");
      updateFacility((current) => ({ ...current, impossibleCorridorSeen: true }));
      reality.recordFacilityEvent("witness", "maintenance-spine", "corridor-label");
      showNexusNotice("ROUTE LABEL / N-07 · PREVIOUS RETURN / N-05");
    }
    if (now - lastCheckpointRef.current > 1600) {
      lastCheckpointRef.current = now;
      saveNexusCheckpoint(postJourney ? "OBSERVATION_COMPLETE" : "NEXUS", pose);
      updateFacility((current) => ({ ...current, location: facilityRoom, pose }));
    }
  }, [addFacilityClue, facilityHydrated, facilityProgress.hiddenPassageDiscovered, facilityProgress.impossibleCorridorSeen, facilityRoom, postJourney, reality, showNexusNotice, updateFacility]);

  useEffect(() => {
    if (!terminalOpen && !facilityModal) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setTerminalOpen(false); setFacilityModal(null); } };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [facilityModal, terminalOpen]);

  const handleRecordSearch = useCallback((query: string, clue: boolean) => {
    updateFacility((current) => ({ ...current, recordSearches: current.recordSearches.includes(query) ? current.recordSearches : [...current.recordSearches, query], completedInteractions: current.completedInteractions.includes(`record:${query}`) ? current.completedInteractions : [...current.completedInteractions, `record:${query}`] }));
    if (clue) addFacilityClue("record-future", "record:SUBJECT 07");
    if (clue) registerEvidence("R-07-FUTURE", "future-subject-record");
    if (query === "EVENT 13" && realitySession.event13Discovered) registerEvidence("T-13", "offset-04.731");
    reality.recordFacilityEvent("record", "record-vault", clue ? "record-future" : undefined);
    audio.cueInteraction(query === "SUBJECT 07" ? "subject" : "record");
  }, [addFacilityClue, audio, reality, realitySession.event13Discovered, registerEvidence, updateFacility]);
  const handleSignalComplete = useCallback((result: string) => {
    updateFacility((current) => ({ ...current, signalResult: result, completedInteractions: current.completedInteractions.includes("signal-7a") ? current.completedInteractions : [...current.completedInteractions, "signal-7a"], unlockedShortcuts: current.unlockedShortcuts.includes("signal-spine") ? current.unlockedShortcuts : [...current.unlockedShortcuts, "signal-spine"] }));
    addFacilityClue("signal-7a", "signal-7a");
    registerEvidence("S-7A", "signal-7a-isolated");
    reality.recordFacilityEvent("signal", "signal-room", "signal-7a");
    audio.cueInteraction("subject");
    showNexusNotice("SIGNAL 7A / COMPONENT ISOLATED");
  }, [addFacilityClue, audio, reality, registerEvidence, showNexusNotice, updateFacility]);
  const handleObservationSighting = useCallback(() => {
    updateFacility((current) => ({ ...current, observationInstrumentUsed: true, completedInteractions: current.completedInteractions.includes("observation-sighting") ? current.completedInteractions : [...current.completedInteractions, "observation-sighting"] }));
    addFacilityClue("observation-sighting", "observation-sighting");
    registerEvidence("O-N07", "aperture-observed");
    reality.recordFacilityEvent("witness", "observation-deck", "observation-sighting");
    audio.cueInteraction("subject");
  }, [addFacilityClue, audio, reality, registerEvidence, updateFacility]);

  const handlePuzzleStart = useCallback((puzzle: PuzzleId) => {
    updateInvestigation((current) => current.puzzlesStarted.includes(puzzle) ? current : { ...current, puzzlesStarted: [...current.puzzlesStarted, puzzle] });
  }, [updateInvestigation]);
  const handleHypothesis = useCallback((hypothesis: string) => {
    updateInvestigation((current) => current.hypothesesTested.includes(hypothesis) ? current : { ...current, hypothesesTested: [...current.hypothesesTested, hypothesis].slice(-24) });
    audio.cueInteraction("record");
  }, [audio, updateInvestigation]);
  const handlePuzzleResolve = useCallback((resolution: PuzzleResolution) => {
    updateInvestigation((current) => ({
      ...current,
      puzzlesStarted: current.puzzlesStarted.includes(resolution.puzzle) ? current.puzzlesStarted : [...current.puzzlesStarted, resolution.puzzle],
      puzzlesSolved: resolution.solved === false || current.puzzlesSolved.includes(resolution.puzzle) ? current.puzzlesSolved : [...current.puzzlesSolved, resolution.puzzle],
      puzzleVariants: { ...current.puzzleVariants, [resolution.puzzle]: resolution.variant },
      memoryProfile: resolution.memoryProfile ?? current.memoryProfile,
    }));
    registerEvidence(resolution.evidence, resolution.knowledge, resolution.falseLead);
    const artifactIds: Record<PuzzleId, ArtifactId> = { gravity: "001", mirror: "002", temporal: "003", neural: "004", void: "005", memory: "006" };
    reality.recordControl(artifactIds[resolution.puzzle], .88);
    reality.recordFacilityEvent(resolution.puzzle === "void" ? "spatial" : resolution.puzzle === "gravity" || resolution.puzzle === "neural" ? "intervention" : "witness", `artifact-${artifactIds[resolution.puzzle]}`, resolution.evidence);
    showNexusNotice(resolution.puzzle === "gravity" ? "CONTAINMENT MODEL UPDATED" : resolution.puzzle === "temporal" ? "SEQUENCE REMAINS INVALID / CAUSAL MODEL ACCEPTED" : "ARCHIVE CORRELATION / CONFLICT REGISTERED");
  }, [reality, registerEvidence, showNexusNotice, updateInvestigation]);
  const handleEvidenceConnection = useCallback((a: string, b: string) => {
    const key = connectionKey(a, b);
    const match = meaningfulConnections[key];
    if (!match) {
      updateInvestigation((current) => current.unsupportedConnections.includes(key) ? current : { ...current, unsupportedConnections: [...current.unsupportedConnections, key].slice(-12), hypothesesTested: current.hypothesesTested.includes(`correlation:${key}`) ? current.hypothesesTested : [...current.hypothesesTested, `correlation:${key}`] });
      showNexusNotice("CORRELATION / UNSUPPORTED");
      audio.cueInteraction("record");
      return;
    }
    updateInvestigation((current) => ({ ...current, evidenceConnections: current.evidenceConnections.includes(key) ? current.evidenceConnections : [...current.evidenceConnections, key], knowledgeFlags: current.knowledgeFlags.includes(match.knowledge) ? current.knowledgeFlags : [...current.knowledgeFlags, match.knowledge] }));
    registerEvidence(match.evidence, match.knowledge);
    showNexusNotice("CORRELATION ACCEPTED / ARCHIVE MODEL UPDATED");
  }, [audio, registerEvidence, showNexusNotice, updateInvestigation]);

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
      <ArchiveMode open={archiveOpen} discoveredCount={experienceMode === "observation" ? discoveredCount : nexusDiscoveredCount} selectedId={selectedId} postJourney={postJourney} reducedMotion={reducedMotion} graphicsQuality={quality} investigation={facilityProgress.investigation} onClose={() => setArchiveOpen(false)} onSelect={setSelectedId} onRevisit={(id) => seekArtifact(id, false)} onInspect={(id) => seekArtifact(id, true)} onConnectEvidence={handleEvidenceConnection} />
      <InspectMode artifact={inspectedArtifact} primary={inspectionPrimary} scanner={scannerActive} reducedMotion={reducedMotion} investigation={facilityProgress.investigation} onPrimary={handlePrimary} onScanner={handleScanner} onPointer={handleInspectionPointer} onPuzzleStart={handlePuzzleStart} onHypothesis={handleHypothesis} onPuzzleResolve={handlePuzzleResolve} onExit={() => setInspectedId(null)} />
      <RealityEffects artifact={interactionHidden ? realityArtifact : stageArtifact(journeyStage)} primary={inspectionPrimary} freezeActive={freezeActive} reducedMotion={reducedMotion} />
      <SoundControl active={!isLoading && introComplete} mode={archiveOpen ? "archive" : inspectedArtifact ? "inspect" : experienceMode === "nexus" ? "nexus" : "journey"} />
      {experienceMode === "nexus" && <NexusHUD entered={nexusEntered} active={nexusActive} target={nexusTarget} scanner={nexusScanner} pointerLocked={pointerLocked} tier={tier} hasFinePointer={hasFinePointer} controls={nexusControls} session={realitySession} tutorialVisible={tutorialVisible} notice={nexusNotice} room={facilityRoom} progress={facilityProgress} objective={facilityObjective} onEnter={() => { setNexusEntered(true); setTutorialVisible(true); }} onBegin={startObservation} onArchive={openArchive} onSystem={() => { releasePointer(); setTerminalOpen(true); }} onInteract={() => { if (nexusTarget) handleNexusInteract(nexusTarget); }} onScanner={toggleNexusScanner} />}
      {experienceMode === "nexus" && facilityRoom !== "nexus" && !facilityModal && !archiveOpen && !terminalOpen && <button type="button" onClick={() => travelTo("nexus")} className="fixed bottom-20 left-1/2 z-[43] min-h-10 -translate-x-1/2 border border-white/10 bg-black/36 px-4 text-[7px] tracking-[.24em] text-white/34 backdrop-blur-sm">ACCESSIBILITY RETURN / NEXUS</button>}
      <NexusTerminal open={terminalOpen} session={realitySession} progress={facilityProgress} onClose={() => setTerminalOpen(false)} onArchive={() => { setTerminalOpen(false); openArchive(); }} />
      <RecordSearch open={facilityModal === "record"} progress={facilityProgress} session={realitySession} onClose={() => setFacilityModal(null)} onSearch={handleRecordSearch} />
      <SignalAnalysis open={facilityModal === "signal"} session={realitySession} complete={Boolean(facilityProgress.signalResult)} onClose={() => setFacilityModal(null)} onComplete={handleSignalComplete} />
      <ObservationInstrument open={facilityModal === "instrument"} session={realitySession} onClose={() => setFacilityModal(null)} onObserve={handleObservationSighting} />
      <EvidenceNotice evidenceId={evidenceNotice} />
      <FacilityTransition visible={routeTransition} room={routeDestination} />
      <NexusTransition visible={experienceMode === "transition"} returning={returningToNexus} />
      {process.env.NODE_ENV !== "production" && <ObserverDebugPanel />}
      {process.env.NODE_ENV !== "production" && <FacilityDebugPanel room={facilityRoom} progress={facilityProgress} onTravel={travelTo} onInteract={() => handleNexusInteract(facilityRoom === "record-vault" ? "record-search" : facilityRoom === "signal-room" ? "signal-analysis" : facilityRoom === "dead-sector" ? "dead-sector-scan" : facilityRoom === "observation-deck" ? "observation-instrument" : facilityRoom === "maintenance-spine" ? "hidden-passage" : "archive-map")} onCorridor={() => handleNexusInteract("corridor-marker")} onReset={() => { resettingFacilityRef.current = true; clearFacilityProgress(); const fresh = { ...createFacilityProgress(), epoch: Date.now() }; saveFacilityProgress(fresh, true); setFacilityProgress(fresh); setFacilityRoom("nexus"); setNexusPose(facilityPoses.nexus); window.setTimeout(() => { saveFacilityProgress(fresh, true); resettingFacilityRef.current = false; }, 120); }} onUnlock={() => updateFacility((current) => ({ ...current, signalResult: current.signalResult ?? "QA / ISOLATED", hiddenPassageDiscovered: true, unlockedShortcuts: ["signal-spine"], n07Clues: ["record-future", "signal-7a", "maintenance-marking"] }))} />}
      {process.env.NODE_ENV !== "production" && <InvestigationDebugPanel progress={facilityProgress.investigation} onInspect={(id) => seekArtifact(id, true)} onEvidence={(id) => registerEvidence(id)} onArchive={openArchive} onReset={() => updateInvestigation(() => createInvestigationProgress())} />}
      {process.env.NODE_ENV !== "production" && <output hidden data-nexus-diagnostics={JSON.stringify({ mode: experienceMode, journeyStage, entered: nexusEntered, active: nexusActive, target: nexusTarget, scanner: nexusScanner, terminal: terminalOpen, pointerLocked, room: facilityRoom, hydrated: facilityHydrated, routeTransition, facilityModal, progress: facilityProgress, investigation: facilityProgress.investigation, pose: nexusPose, controls: nexusControls.snapshot() })} />}
      <LoaderOverlay isVisible={isLoading} reducedMotion={reducedMotion} returningVisitor={realitySession.returningVisitor} />
      <ArchiveCanvas isSceneReady={!isLoading} reducedMotion={reducedMotion} scrollProgress={progressRef} inspection={inspectionRef} tier={tier} quality={quality} hasFinePointer={hasFinePointer} onIntroComplete={handleIntroComplete} mode={experienceMode} nexusActive={nexusActive} gateOpening={experienceMode === "transition" && !returningToNexus} nexusControls={nexusControls} nexusPose={nexusPose} discoveredCount={nexusDiscoveredCount} session={realitySession} facilityRoom={facilityRoom} facilityProgress={facilityProgress} facilityScanner={nexusScanner} onNexusTarget={setNexusTarget} onNexusInteract={handleNexusInteract} onNexusScanner={toggleNexusScanner} onNexusPose={handleNexusPose} onPointerLock={setPointerLocked} />
    </main>
  );
}

function InvestigationDebugPanel({ progress, onInspect, onEvidence, onArchive, onReset }: { progress: InvestigationProgress; onInspect: (id: ArtifactId) => void; onEvidence: (id: string) => void; onArchive: () => void; onReset: () => void }) {
  const [hidden, setHidden] = useState(false);
  const enabled = useSyncExternalStore(
    () => () => undefined,
    () => process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("investigation-qa"),
    () => false,
  );
  if (!enabled || hidden) return null;
  const artifacts: ArtifactId[] = ["001", "002", "003", "004", "005", "006"];
  return <aside className="fixed right-3 top-3 z-[73] w-52 border border-white/20 bg-black/92 p-3 text-white" aria-label="Investigation QA controls">
    <p className="text-[7px] tracking-[.27em] text-white/42">INVESTIGATION QA / DEV ONLY</p>
    <p className="mt-2 text-[7px] tracking-[.16em] text-white/60">{progress.puzzlesSolved.length} SOLVED · {progress.evidenceDiscovered.length} EVIDENCE</p>
    <div className="mt-3 grid grid-cols-3 gap-1">{artifacts.map((id) => <button key={id} onClick={() => onInspect(id)} type="button" className="min-h-8 border border-white/12 text-[6px] tracking-[.14em] text-white/48">PUZZLE {id}</button>)}</div>
    <div className="mt-2 grid grid-cols-2 gap-1"><button type="button" onClick={() => { onEvidence("T-13"); onEvidence("S-7A"); }} className="min-h-8 border border-white/12 text-[6px] tracking-[.13em] text-white/48">TEMPORAL ROUTE</button><button type="button" onClick={() => { onEvidence("V-NONLOCAL"); onEvidence("D-N00"); }} className="min-h-8 border border-white/12 text-[6px] tracking-[.13em] text-white/48">SPATIAL ROUTE</button></div>
    <div className="mt-2 flex gap-1"><button type="button" onClick={onArchive} className="min-h-8 flex-1 border border-white/12 text-[6px] tracking-[.14em] text-white/48">BOARD</button><button type="button" onClick={onReset} className="min-h-8 border border-white/12 px-2 text-[6px] tracking-[.14em] text-white/48">RESET</button><button type="button" onClick={() => setHidden(true)} className="min-h-8 border border-white/12 px-2 text-[6px] tracking-[.14em] text-white/48">HIDE</button></div>
  </aside>;
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

function FacilityDebugPanel({ room, progress, onTravel, onInteract, onCorridor, onReset, onUnlock }: { room: FacilityRoom; progress: FacilityProgress; onTravel: (room: FacilityRoom) => void; onInteract: () => void; onCorridor: () => void; onReset: () => void; onUnlock: () => void }) {
  const [hidden, setHidden] = useState(false);
  const enabled = useSyncExternalStore(
    () => () => undefined,
    () => process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("facility-qa"),
    () => false,
  );
  if (!enabled || hidden) return null;
  const rooms: FacilityRoom[] = ["nexus", "record-vault", "signal-room", "dead-sector", "observation-deck", "maintenance-spine"];
  return <aside className="fixed right-3 top-1/2 z-[72] max-w-56 -translate-y-1/2 border border-white/20 bg-black/90 p-3 text-white" aria-label="Facility QA controls">
    <p className="text-[7px] tracking-[.28em] text-white/42">FACILITY QA / DEV ONLY</p>
    <p className="mt-2 text-[7px] tracking-[.18em] text-white/64">{room.toUpperCase()} · {progress.n07Clues.length} CLUES</p>
    <div className="mt-3 grid grid-cols-2 gap-1">{rooms.map((target) => <button key={target} type="button" onClick={() => onTravel(target)} className="min-h-8 border border-white/12 px-2 text-[6px] tracking-[.14em] text-white/48">{target.replaceAll("-", " ").toUpperCase()}</button>)}</div>
    <button type="button" onClick={onInteract} className="mt-2 min-h-8 w-full border border-white/14 px-2 text-[6px] tracking-[.14em] text-white/56">OPEN CURRENT INTERACTION</button>
    {room === "maintenance-spine" && <button type="button" onClick={onCorridor} className="mt-1 min-h-8 w-full border border-white/14 px-2 text-[6px] tracking-[.14em] text-white/56">TRIGGER CORRIDOR EVENT</button>}
    <div className="mt-1 flex gap-1"><button type="button" onClick={onUnlock} className="min-h-8 flex-1 border border-white/12 px-2 text-[6px] tracking-[.14em] text-white/48">UNLOCK ROUTES</button><button type="button" onClick={onReset} className="min-h-8 border border-white/12 px-2 text-[6px] tracking-[.14em] text-white/48">RESET</button><button type="button" onClick={() => setHidden(true)} className="min-h-8 border border-white/12 px-2 text-[6px] tracking-[.14em] text-white/48">HIDE QA</button></div>
  </aside>;
}
