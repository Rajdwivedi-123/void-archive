"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
import { commitPuzzleConsequence, createConsequenceState, signalResolutionFor, withVisitedRoom } from "@/game/consequences";
import { resolveFacilityMutations } from "@/game/facilityMutations";
import type { ConsequenceState, EndingCommit, SignalResolution } from "@/game/consequenceTypes";
import { evaluateN07Access } from "@/game/n07Access";
import { N07Ending, N07Threshold } from "./N07Threshold";
import { N07Completion, N07LevelHUD } from "./N07LevelInterface";
import { n07AreaPoses, n07CausalOrder, type N07Area, type N07CausalEvent } from "@/game/n07Level";

function stageArtifact(stage: string): ArtifactId | null {
  if (stage.startsWith("object-two")) return "002";
  if (stage.startsWith("object-three")) return "003";
  if (stage.startsWith("object-four")) return "004";
  if (stage.startsWith("object-five")) return "005";
  if (stage.startsWith("object-six")) return "006";
  if (["observation", "approach", "activation", "inspection"].includes(stage)) return "001";
  return null;
}

type N07QaScenario = "tier-0" | "tier-2" | "temporal" | "spatial" | "mnemonic" | "adaptive" | "protocol-ending" | "subject-ending" | "vector-ending" | "anomaly-ending";

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
  const [thresholdOpen, setThresholdOpen] = useState(false);
  const [n07EndingVisible, setN07EndingVisible] = useState(false);
  const [n07CompletionVisible, setN07CompletionVisible] = useState(false);
  const [qaReturning, setQaReturning] = useState(false);
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
  const n07Access = useMemo(() => evaluateN07Access(facilityProgress, realitySession.returningVisitor || qaReturning), [facilityProgress, qaReturning, realitySession.returningVisitor]);
  const nexusActive = (experienceMode === "nexus" || experienceMode === "n07") && nexusEntered && !archiveOpen && !terminalOpen && !inspectedArtifact && !facilityModal && !routeTransition && !thresholdOpen && !n07EndingVisible && !n07CompletionVisible;
  const facilityObjective = facilityProgress.consequences.endingCommit ? "OBSERVATION CONTINUES" : n07Access.thresholdReady ? "APPROACH N-07 THRESHOLD" : n07Access.alignmentReady ? "COMPLETE N-07 ALIGNMENT" : facilityProgress.investigation.investigationStage === "n07-vector" ? "VERIFY ACCESS VECTOR" : facilityProgress.investigation.investigationStage === "correlation" || facilityProgress.investigation.investigationStage === "subject-identification" ? "LOCATE UNREGISTERED SECTOR" : facilityProgress.investigation.investigationStage === "contradiction" ? "IDENTIFY SHARED CORRELATION" : facilityProgress.signalResult ? "VERIFY NONLOCAL ROUTE" : facilityProgress.recordSearches.length ? "LOCATE SIGNAL SOURCE" : facilityProgress.completedInteractions.includes("scanner-array") ? "ENTER SIGNAL ROOM" : "TRACE SIGNAL 7A";

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
    reality.setContext(realityArtifact, archiveOpen ? "archive" : inspectedId ? "inspect" : terminalOpen ? "terminal" : experienceMode === "nexus" || experienceMode === "n07" ? "nexus" : "journey", reducedMotion, tier);
  }, [archiveOpen, experienceMode, inspectedId, reality, realityArtifact, reducedMotion, terminalOpen, tier]);

  useEffect(() => {
    audio.syncScene({ stage: experienceMode === "observation" ? journeyStage : experienceMode === "n07" ? `n07-${facilityProgress.n07.area}` : `facility-${facilityRoom}`, artifact: realityArtifact, inspecting: Boolean(inspectedId), control: inspectionPrimary, scanner: scannerActive || nexusScanner, archiveOpen: archiveOpen || terminalOpen || Boolean(facilityModal), freeze: freezeActive, mobile: tier === "mobile" });
  }, [archiveOpen, audio, experienceMode, facilityModal, facilityProgress.n07.area, facilityRoom, freezeActive, inspectedId, inspectionPrimary, journeyStage, nexusScanner, realityArtifact, scannerActive, terminalOpen, tier]);

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
  const updateFacility = useCallback((update: (current: FacilityProgress) => FacilityProgress, replace = false) => {
    setFacilityProgress((current) => {
      const next = update(current);
      saveFacilityProgress(next, replace);
      return next;
    });
  }, []);
  const updateInvestigation = useCallback((update: (current: InvestigationProgress) => InvestigationProgress) => {
    updateFacility((current) => {
      const investigation = update(current.investigation);
      return { ...current, investigation: { ...investigation, investigationStage: deriveInvestigationStage(investigation) } };
    });
  }, [updateFacility]);
  useEffect(() => {
    if (!facilityHydrated) return;
    const frame = window.requestAnimationFrame(() => updateFacility((current) => {
      const echo = current.consequences.returningEcho ?? (realitySession.returningVisitor ? current.consequences.voidBoundaryExposed ? "void" : current.consequences.gravityOverdrive ? "gravity" : current.consequences.mirrorImpossibleFeedSelected !== null ? "mirror" : current.consequences.memoryRestorationCommitted ? "memory" : null : null);
      if (current.consequences.observerArchetype === realitySession.archetype && current.consequences.returningEcho === echo) return current;
      return { ...current, consequences: { ...current.consequences, observerArchetype: realitySession.archetype, returningEcho: echo } };
    }));
    return () => window.cancelAnimationFrame(frame);
  }, [facilityHydrated, realitySession.archetype, realitySession.returningVisitor, updateFacility]);
  useEffect(() => {
    if (!facilityHydrated || experienceMode !== "observation" || journeyStage !== "session-complete" || facilityProgress.consequences.committedEnding) return;
    const derived = resolveFacilityMutations(facilityProgress.consequences);
    const observationEnding = derived.ending === "subject-07" ? "subject-07" : "protocol";
    const frame = window.requestAnimationFrame(() => updateFacility((current) => ({ ...current, consequences: { ...current.consequences, minimalCompletion: observationEnding === "protocol", committedEnding: observationEnding } })));
    return () => window.cancelAnimationFrame(frame);
  }, [experienceMode, facilityHydrated, facilityProgress.consequences, journeyStage, updateFacility]);
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
      updateFacility((current) => ({ ...current, location: room, pose, discoveredRooms: current.discoveredRooms.includes(room) ? current.discoveredRooms : [...current.discoveredRooms, room], consequences: withVisitedRoom(current.consequences, room) }));
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
  const toggleNexusScanner = useCallback(() => { setNexusScanner((current) => { if (!current) audio.cueInteraction("scanner"); return !current; }); }, [audio]);
  const moveWithinN07 = useCallback((area: N07Area, message: string) => {
    const pose = n07AreaPoses[area];
    setNexusPose(pose);
    setNexusTarget(null);
    updateFacility((current) => ({ ...current, n07: { ...current.n07, area, checkpointPose: pose } }));
    showNexusNotice(message);
  }, [showNexusNotice, updateFacility]);
  const handleN07Interact = useCallback((target: NexusInteractionId) => {
    const progress = facilityProgress.n07;
    if (experienceMode !== "n07") { setExperienceMode("n07"); setNexusEntered(true); }
    if (target === "n07-cross-threshold") { audio.cueInteraction("record"); moveWithinN07("reconstruction", "THRESHOLD CROSSED / ARCHIVE GEOMETRY RECONSTRUCTING"); return; }
    if (target === "n07-topology-visible") { audio.cueInteraction("reset"); showNexusNotice("VISIBLE ROUTE / INTERNALLY CONSISTENT · DESTINATION ABSENT"); return; }
    if (target === "n07-topology-missing") {
      updateFacility((current) => ({ ...current, n07: { ...current.n07, topologySolved: true } }));
      audio.cueInteraction("scanner"); moveWithinN07("causal", "TOPOLOGY ACCEPTED / MISSING INTERVAL IS THE ROUTE"); return;
    }
    const causalByTarget: Partial<Record<NexusInteractionId, N07CausalEvent>> = { "n07-causal-pre": "pre-record", "n07-causal-signal": "signal-response", "n07-causal-containment": "containment-change", "n07-causal-arrival": "observer-arrival" };
    const causalEvent = causalByTarget[target];
    if (causalEvent) {
      const expected = n07CausalOrder[progress.causalSequence.length];
      if (causalEvent !== expected) {
        updateFacility((current) => ({ ...current, n07: { ...current.n07, causalSequence: [], causalSolved: false } }));
        audio.cueInteraction("reset"); showNexusNotice("CAUSAL ORDER REJECTED / SEQUENCE RETURNED SAFELY"); return;
      }
      const sequence = [...progress.causalSequence, causalEvent];
      updateFacility((current) => ({ ...current, n07: { ...current.n07, causalSequence: sequence, causalSolved: sequence.length === n07CausalOrder.length } }));
      audio.cueInteraction(sequence.length === n07CausalOrder.length ? "subject" : "record");
      if (sequence.length === n07CausalOrder.length) moveWithinN07("missing", "EVENT 13 RECONSTRUCTED / EFFECT PRECEDES ARRIVAL"); else showNexusNotice(`EVENT 13 / ${sequence.length} OF 4 LOCKED`);
      return;
    }
    if (target === "n07-route-model" || target === "n07-route-contradiction") {
      const route = target === "n07-route-model" ? "archive-model" : "contradiction";
      updateFacility((current) => ({ ...current, n07: { ...current.n07, route } }));
      audio.cueInteraction(route === "contradiction" ? "scanner" : "archive");
      moveWithinN07("observer", route === "contradiction" ? "CONTRADICTION ROUTE / UNREGISTERED DEPTH" : "ARCHIVE MODEL ROUTE / REGISTERED DEPTH"); return;
    }
    if (target === "n07-secret") {
      updateFacility((current) => ({ ...current, n07: { ...current.n07, secretFound: true } }));
      audio.cueInteraction("record"); showNexusNotice("DEEP RECORD / THIS TRAVERSAL WAS FILED BEFORE ENTRY"); return;
    }
    if (target === "n07-observer-direct" || target === "n07-observer-wait") {
      const choice = target === "n07-observer-wait" ? "wait" : "direct";
      updateFacility((current) => ({ ...current, n07: { ...current.n07, observerSolved: true, observerChoice: choice } }));
      audio.cueInteraction(choice === "wait" ? "record" : "subject"); showNexusNotice(choice === "wait" ? "PREDICTION EXPIRED / UNAUTHORED RESPONSE" : "PREDICTION CONFIRMED / OBSERVER INCLUDED"); return;
    }
    if (target === "n07-traversal") {
      updateFacility((current) => ({ ...current, n07: { ...current.n07, traversalComplete: true } }));
      audio.cueInteraction("subject"); moveWithinN07("exterior", "UNSTABLE INTERVAL CROSSED / EXTERIOR MODEL ACTIVE"); return;
    }
    if (target === "n07-final-stabilize" || target === "n07-final-preserve") {
      const finalAction = target === "n07-final-stabilize" ? "stabilize" : "preserve";
      updateFacility((current) => ({ ...current, n07: { ...current.n07, finalAction, completed: true } }), true);
      audio.cueInteraction(finalAction === "preserve" ? "record" : "subject"); releasePointer(); setN07CompletionVisible(true); return;
    }
    if (target === "n07-return") setN07CompletionVisible(true);
  }, [audio, experienceMode, facilityProgress.n07, moveWithinN07, releasePointer, showNexusNotice, updateFacility]);
  const handleNexusInteract = useCallback((target: NexusInteractionId) => {
    if (target.startsWith("n07-") && target !== "n07-gate") { handleN07Interact(target); return; }
    if (facilityProgress.consequences.neuralStrategy === "observation" && !facilityProgress.consequences.neuralPredictionTriggered && ["system-terminal", "signal-analysis", "record-search"].includes(target)) {
      updateFacility((current) => ({ ...current, consequences: { ...current.consequences, neuralPredictionTriggered: true } }));
      audio.cueInteraction("subject");
      showNexusNotice(`NEURAL ROUTE / ${target.replaceAll("-", " ").toUpperCase()} PRESELECTED`);
    }
    if (target === "observation-gate") { startObservation(); return; }
    if (target === "archive-map") { releasePointer(); openArchive(); return; }
    if (target === "system-terminal") { releasePointer(); audio.cueInteraction("inspect"); setTerminalOpen(true); return; }
    if (target === "scanner-array") {
      toggleNexusScanner();
      updateFacility((current) => ({ ...current, completedInteractions: current.completedInteractions.includes("scanner-array") ? current.completedInteractions : [...current.completedInteractions, "scanner-array"] }));
      audio.cueInteraction("scanner");
      showNexusNotice("SIGNAL 7A DETECTED / RETURN 43 M · SOURCE INSIDE FACILITY");
      return;
    }
    if (target === "restricted-sector") { audio.cueInteraction("record"); showNexusNotice("N-06 / ACCESS RESTRICTED"); return; }
    if (target === "route-record-vault") { audio.cueInteraction("archive"); travelTo("record-vault"); return; }
    if (target === "route-signal-room") { audio.cueInteraction("scanner"); if (facilityProgress.consequences.hiddenPassageUsed) { showNexusNotice("MAIN SIGNAL ROUTE / DISPLACED · MAINTENANCE APPROACH AVAILABLE"); travelTo("maintenance-spine"); } else travelTo("signal-room"); return; }
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
      updateFacility((current) => ({ ...current, deadSectorDiscovered: true, consequences: { ...current.consequences, deadSectorInvestigated: true } }));
      reality.recordFacilityEvent("spatial", "dead-sector", "dead-sector");
      registerEvidence("D-N00", "sector-statement-unreliable", "sector-empty");
      audio.cueInteraction("scanner"); showNexusNotice("SECTOR N-00 / DECOMMISSIONED · SIGNATURE ACTIVE"); return;
    }
    if (target === "shortcut-control") {
      updateFacility((current) => ({ ...current, unlockedShortcuts: current.unlockedShortcuts.includes("signal-spine") ? current.unlockedShortcuts : [...current.unlockedShortcuts, "signal-spine"], completedInteractions: current.completedInteractions.includes("shortcut-control") ? current.completedInteractions : [...current.completedInteractions, "shortcut-control"], consequences: { ...current.consequences, hiddenPassageUsed: true } }));
      reality.recordFacilityEvent("intervention", "maintenance-spine");
      audio.cueInteraction("record"); showNexusNotice("SHORTCUT / NEXUS-SIGNAL ROUTE AVAILABLE"); return;
    }
    if (target === "hidden-passage") {
      if (!nexusScanner && !facilityProgress.signalResult) { showNexusNotice("WALL DEPTH / UNRESOLVED · SCANNER LINK REQUIRED"); return; }
      updateFacility((current) => ({ ...current, hiddenPassageDiscovered: true, completedInteractions: current.completedInteractions.includes("hidden-passage") ? current.completedInteractions : [...current.completedInteractions, "hidden-passage"], consequences: { ...current.consequences, hiddenPassageUsed: true, n07DiscoveryRoute: current.consequences.n07DiscoveryRoute ?? "spatial" } }));
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
    if (target === "n07-gate") {
      setNexusScanner(true); audio.cueInteraction(n07Access.thresholdReady ? "subject" : "scanner");
      if (facilityProgress.n07.completed) {
        const returnPose = n07AreaPoses.reconstruction;
        releasePointer(); setNexusPose(returnPose); setExperienceMode("n07");
        updateFacility((current) => ({ ...current, n07: { ...current.n07, area: "reconstruction", checkpointPose: returnPose, returnVisits: current.n07.returnVisits + 1 } }));
        showNexusNotice("RETURN VECTOR / PREVIOUS ROUTE INVERTED · ALTERNATE SEAM ACTIVE"); return;
      }
      if (facilityProgress.n07.entered) { releasePointer(); setNexusPose(facilityProgress.n07.checkpointPose); setExperienceMode("n07"); showNexusNotice("PERSISTED N-07 CHECKPOINT RESTORED"); return; }
      if (facilityProgress.consequences.endingCommit) { releasePointer(); setN07EndingVisible(true); return; }
      if (!n07Access.thresholdReady) { showNexusNotice(`N-07 / ${n07Access.facilityState} · REQUIRED / ${n07Access.unresolvedEvidence[0] ?? "ADDITIONAL CORRELATION"}`); return; }
      releasePointer(); setThresholdOpen(true); return;
    }
    setNexusScanner(true); audio.cueInteraction("scanner"); showNexusNotice("ACTIVE SECTOR COUNT / 7 · INDEX RETURN / 01–06");
  }, [addFacilityClue, audio, facilityProgress.consequences.endingCommit, facilityProgress.consequences.hiddenPassageUsed, facilityProgress.consequences.neuralPredictionTriggered, facilityProgress.consequences.neuralStrategy, facilityProgress.impossibleCorridorSeen, facilityProgress.n07.checkpointPose, facilityProgress.n07.completed, facilityProgress.n07.entered, facilityProgress.signalResult, handleN07Interact, n07Access, nexusScanner, openArchive, reality, registerEvidence, releasePointer, showNexusNotice, startObservation, toggleNexusScanner, travelTo, updateFacility]);
  const commitN07Ending = useCallback((commit: EndingCommit) => {
    const enterLevel = commit.action !== "reject" && n07Access.tier >= 4;
    updateFacility((current) => ({ ...current, completedInteractions: current.completedInteractions.includes("n07-threshold") ? current.completedInteractions : [...current.completedInteractions, "n07-threshold"], consequences: { ...current.consequences, committedEnding: commit.type, endingCommit: commit, n07ThresholdResolved: true, minimalCompletion: commit.type === "protocol" }, n07: enterLevel ? { ...current.n07, entered: true, vector: commit.vector ?? n07Access.vector, area: "threshold", checkpointPose: n07AreaPoses.threshold } : current.n07 }), true);
    setThresholdOpen(false); audio.cueInteraction(commit.type === "archive-anomaly" ? "record" : "subject");
    if (enterLevel) { setNexusPose(n07AreaPoses.threshold); setExperienceMode("n07"); setNexusEntered(true); showNexusNotice("N-07 / PHYSICAL BOUNDARY DEPTH CONFIRMED"); }
    else setN07EndingVisible(true);
  }, [audio, n07Access.tier, n07Access.vector, showNexusNotice, updateFacility]);
  const runN07Qa = useCallback((scenario: N07QaScenario) => {
    if (scenario === "tier-0") { updateFacility((current) => ({ ...createFacilityProgress(), epoch: current.epoch }), true); setN07EndingVisible(false); return; }
    updateFacility((current) => {
      const c = createConsequenceState();
      const base: FacilityProgress = {
        ...current,
        location: "nexus",
        signalResult: "QA / N-07 CALIBRATION",
        n07Clues: ["record-future", "signal-7a", "maintenance-marking"],
        discoveredRooms: ["nexus", "record-vault", "signal-room", "dead-sector", "observation-deck", "maintenance-spine"],
        investigation: {
          ...current.investigation,
          evidenceDiscovered: ["T-13", "S-7A", "V-NONLOCAL", "D-N00", "M-FOREIGN", "R-07-FUTURE", "N-ROUTE"],
          evidenceConnections: scenario === "tier-2" ? [] : ["S-7A|T-13"],
          knowledgeFlags: scenario === "tier-2" ? [] : ["n07-temporal-vector"],
          puzzlesSolved: scenario === "tier-2" ? ["temporal"] : ["gravity", "mirror", "temporal", "neural", "void", "memory"],
          investigationStage: scenario === "tier-2" ? "contradiction" : "n07-vector",
        },
        consequences: {
          ...c,
          event13Resolved: true,
          temporalSequenceChoice: "pre-response",
          optionalRoomsVisited: ["record-vault", "signal-room", "dead-sector", "observation-deck", "maintenance-spine"],
          observerArchetype: realitySession.archetype,
        },
      };
      if (scenario === "tier-2") return base;
      const vector = scenario === "spatial" ? "spatial" : scenario === "mnemonic" ? "mnemonic" : scenario === "adaptive" ? "adaptive" : "temporal";
      const endingType = scenario === "protocol-ending" ? "protocol" : scenario === "subject-ending" ? "subject-07" : scenario === "vector-ending" ? "n07-vector" : scenario === "anomaly-ending" ? "archive-anomaly" : null;
      const consequences: ConsequenceState = {
        ...base.consequences,
        event13Resolved: vector === "temporal" || scenario === "anomaly-ending",
        signal7aResolution: vector === "adaptive" ? "neural" : vector === "spatial" ? "spatial" : "temporal",
        voidBoundaryExposed: vector === "spatial" || scenario === "anomaly-ending",
        voidProbeDepth: vector === "spatial" || scenario === "anomaly-ending" ? 3 : 0,
        deadSectorInvestigated: vector === "spatial" || scenario === "anomaly-ending",
        memoryRestorationCommitted: vector === "mnemonic" || scenario === "anomaly-ending" || scenario === "subject-ending",
        neuralStrategy: vector === "adaptive" || scenario === "anomaly-ending" ? "observation" : null,
        neuralPredictionTriggered: vector === "adaptive" || scenario === "anomaly-ending",
        n07DiscoveryRoute: vector === "mnemonic" ? "memory" : vector === "adaptive" ? "temporal" : vector,
        acceptedCorrelations: scenario === "anomaly-ending" ? ["S-7A|T-13", "D-N00|V-NONLOCAL", "M-FOREIGN|R-07-FUTURE"] : vector === "spatial" ? ["D-N00|V-NONLOCAL"] : vector === "mnemonic" ? ["M-FOREIGN|R-07-FUTURE"] : ["S-7A|T-13"],
        committedEnding: endingType,
        endingCommit: endingType ? { type: endingType, vector, action: scenario === "protocol-ending" ? "continue" : "commit", archetype: realitySession.archetype, keyEvidence: ["QA / DETERMINISTIC SCENARIO"], facilityState: endingType === "archive-anomaly" ? "TOPOLOGY UNSTABLE" : "THRESHOLD COHERENT", sessionMarker: Date.now() } : null,
        n07ThresholdResolved: Boolean(endingType),
      };
      return { ...base, consequences };
    }, true);
    setFacilityRoom("nexus"); setNexusPose({ position: [-8, 1.72, -7.5], yaw: 0, pitch: .12 });
    if (scenario.endsWith("ending")) setN07EndingVisible(true);
  }, [realitySession.archetype, updateFacility]);
  const handleNexusPose = useCallback((pose: PlayerPose) => {
    setNexusPose(pose);
    if (!facilityHydrated || resettingFacilityRef.current) return;
    const now = performance.now();
    if (experienceMode === "n07") {
      const expected = n07AreaPoses[facilityProgress.n07.area];
      if (Math.abs(pose.position[2] - expected.position[2]) > 12) return;
      if (now - lastCheckpointRef.current > 1200) {
        lastCheckpointRef.current = now;
        updateFacility((current) => ({ ...current, n07: { ...current.n07, checkpointPose: pose } }));
      }
      return;
    }
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
  }, [addFacilityClue, experienceMode, facilityHydrated, facilityProgress.hiddenPassageDiscovered, facilityProgress.impossibleCorridorSeen, facilityProgress.n07.area, facilityRoom, postJourney, reality, showNexusNotice, updateFacility]);

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
    const signalResolution = signalResolutionFor(result);
    updateFacility((current) => ({ ...current, signalResult: result, completedInteractions: current.completedInteractions.includes("signal-7a") ? current.completedInteractions : [...current.completedInteractions, "signal-7a"], unlockedShortcuts: current.unlockedShortcuts.includes("signal-spine") ? current.unlockedShortcuts : [...current.unlockedShortcuts, "signal-spine"], consequences: { ...current.consequences, signal7aResolution: signalResolution, n07DiscoveryRoute: current.consequences.n07DiscoveryRoute ?? (signalResolution === "temporal" ? "temporal" : signalResolution === "spatial" ? "spatial" : null) } }));
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
    if (hypothesis === "mirror:direct" || hypothesis === "mirror:reflection") updateFacility((current) => ({ ...current, consequences: { ...current.consequences, mirrorImpossibleFeedSelected: false } }));
    audio.cueInteraction("record");
  }, [audio, updateFacility, updateInvestigation]);
  const handlePuzzleResolve = useCallback((resolution: PuzzleResolution) => {
    updateInvestigation((current) => ({
      ...current,
      puzzlesStarted: current.puzzlesStarted.includes(resolution.puzzle) ? current.puzzlesStarted : [...current.puzzlesStarted, resolution.puzzle],
      puzzlesSolved: resolution.solved === false || current.puzzlesSolved.includes(resolution.puzzle) ? current.puzzlesSolved : [...current.puzzlesSolved, resolution.puzzle],
      puzzleVariants: { ...current.puzzleVariants, [resolution.puzzle]: resolution.variant },
      memoryProfile: resolution.memoryProfile ?? current.memoryProfile,
    }));
    updateFacility((current) => ({ ...current, consequences: commitPuzzleConsequence(current.consequences, resolution.puzzle, resolution.variant, resolution.solved !== false, resolution.memoryProfile) }));
    registerEvidence(resolution.evidence, resolution.knowledge, resolution.falseLead);
    const artifactIds: Record<PuzzleId, ArtifactId> = { gravity: "001", mirror: "002", temporal: "003", neural: "004", void: "005", memory: "006" };
    reality.recordControl(artifactIds[resolution.puzzle], .88);
    reality.recordFacilityEvent(resolution.puzzle === "void" ? "spatial" : resolution.puzzle === "gravity" || resolution.puzzle === "neural" ? "intervention" : "witness", `artifact-${artifactIds[resolution.puzzle]}`, resolution.evidence);
    showNexusNotice(resolution.puzzle === "gravity" ? "CONTAINMENT MODEL UPDATED" : resolution.puzzle === "temporal" ? "SEQUENCE REMAINS INVALID / CAUSAL MODEL ACCEPTED" : "ARCHIVE CORRELATION / CONFLICT REGISTERED");
  }, [reality, registerEvidence, showNexusNotice, updateFacility, updateInvestigation]);
  const handleEvidenceConnection = useCallback((a: string, b: string) => {
    const key = connectionKey(a, b);
    const match = meaningfulConnections[key];
    if (!match) {
      updateInvestigation((current) => current.unsupportedConnections.includes(key) ? current : { ...current, unsupportedConnections: [...current.unsupportedConnections, key].slice(-12), hypothesesTested: current.hypothesesTested.includes(`correlation:${key}`) ? current.hypothesesTested : [...current.hypothesesTested, `correlation:${key}`] });
      updateFacility((current) => current.consequences.rejectedCorrelations.includes(key) ? current : { ...current, consequences: { ...current.consequences, rejectedCorrelations: [...current.consequences.rejectedCorrelations, key].slice(-16) } });
      showNexusNotice("CORRELATION / UNSUPPORTED");
      audio.cueInteraction("record");
      return;
    }
    updateInvestigation((current) => ({ ...current, evidenceConnections: current.evidenceConnections.includes(key) ? current.evidenceConnections : [...current.evidenceConnections, key], knowledgeFlags: current.knowledgeFlags.includes(match.knowledge) ? current.knowledgeFlags : [...current.knowledgeFlags, match.knowledge] }));
    updateFacility((current) => ({ ...current, consequences: { ...current.consequences, acceptedCorrelations: current.consequences.acceptedCorrelations.includes(key) ? current.consequences.acceptedCorrelations : [...current.consequences.acceptedCorrelations, key], n07DiscoveryRoute: key === "S-7A|T-13" ? "temporal" : key === "D-N00|V-NONLOCAL" || key === "M-UNREGISTERED|O-N07" || key === "MS-DEPTH|S-7A" ? "spatial" : current.consequences.n07DiscoveryRoute } }));
    registerEvidence(match.evidence, match.knowledge);
    showNexusNotice("CORRELATION ACCEPTED / ARCHIVE MODEL UPDATED");
  }, [audio, registerEvidence, showNexusNotice, updateFacility, updateInvestigation]);

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
      {experienceMode === "observation" && <ArchiveEnding stage={journeyStage} reducedMotion={reducedMotion} onOpenArchive={openArchive} consequences={facilityProgress.consequences} />}
      {experienceMode === "observation" && !interactionHidden && journeyStage !== "memory-recovery-passage" && <button type="button" onClick={returnToNexus} className={`fixed bottom-8 right-5 z-[43] min-h-11 border bg-black/48 px-4 text-[7px] tracking-[.25em] backdrop-blur-sm sm:right-8 ${journeyStage === "session-complete" ? "border-white/28 text-white/76" : "border-white/12 text-white/38"}`}>{journeyStage === "session-complete" ? "RETURN TO NEXUS" : "NEXUS"}</button>}
      <ArchiveCommand active={introComplete && !interactionHidden && journeyStage !== "session-complete"} discoveredCount={discoveredCount} onOpen={openArchive} />
      <ArchiveMode open={archiveOpen} discoveredCount={experienceMode === "observation" ? discoveredCount : nexusDiscoveredCount} selectedId={selectedId} postJourney={postJourney} reducedMotion={reducedMotion} graphicsQuality={quality} investigation={facilityProgress.investigation} consequences={facilityProgress.consequences} n07Access={n07Access} n07Progress={facilityProgress.n07} onClose={() => setArchiveOpen(false)} onSelect={setSelectedId} onRevisit={(id) => seekArtifact(id, false)} onInspect={(id) => seekArtifact(id, true)} onConnectEvidence={handleEvidenceConnection} onResetObserver={() => { clearFacilityProgress(); const fresh = { ...createFacilityProgress(), epoch: Date.now() }; saveFacilityProgress(fresh, true); setFacilityProgress(fresh); setFacilityRoom("nexus"); setNexusPose(facilityPoses.nexus); setExperienceMode("nexus"); setN07CompletionVisible(false); setN07EndingVisible(false); }} />
      <InspectMode artifact={inspectedArtifact} primary={inspectionPrimary} scanner={scannerActive} reducedMotion={reducedMotion} investigation={facilityProgress.investigation} onPrimary={handlePrimary} onScanner={handleScanner} onPointer={handleInspectionPointer} onPuzzleStart={handlePuzzleStart} onHypothesis={handleHypothesis} onPuzzleResolve={handlePuzzleResolve} onExit={() => setInspectedId(null)} />
      <RealityEffects artifact={interactionHidden ? realityArtifact : stageArtifact(journeyStage)} primary={inspectionPrimary} freezeActive={freezeActive} reducedMotion={reducedMotion} />
      <SoundControl active={!isLoading && introComplete} mode={archiveOpen ? "archive" : inspectedArtifact ? "inspect" : experienceMode === "nexus" || experienceMode === "n07" ? "nexus" : "journey"} />
      {experienceMode === "nexus" && <NexusHUD entered={nexusEntered} active={nexusActive} target={nexusTarget} scanner={nexusScanner} pointerLocked={pointerLocked} tier={tier} hasFinePointer={hasFinePointer} controls={nexusControls} session={realitySession} tutorialVisible={tutorialVisible} notice={nexusNotice} room={facilityRoom} progress={facilityProgress} objective={facilityObjective} onEnter={() => { setNexusEntered(true); setTutorialVisible(true); }} onBegin={startObservation} onArchive={openArchive} onSystem={() => { releasePointer(); setTerminalOpen(true); }} onInteract={() => { if (nexusTarget) handleNexusInteract(nexusTarget); }} onScanner={toggleNexusScanner} />}
      {experienceMode === "n07" && <N07LevelHUD progress={facilityProgress.n07} target={nexusTarget} tier={tier} controls={nexusControls} notice={nexusNotice} onInteract={() => { if (nexusTarget) handleNexusInteract(nexusTarget); }} />}
      {experienceMode === "nexus" && facilityRoom !== "nexus" && !facilityModal && !archiveOpen && !terminalOpen && <button type="button" onClick={() => travelTo("nexus")} className="fixed bottom-20 left-1/2 z-[43] min-h-10 -translate-x-1/2 border border-white/10 bg-black/36 px-4 text-[7px] tracking-[.24em] text-white/34 backdrop-blur-sm">ACCESSIBILITY RETURN / NEXUS</button>}
      <NexusTerminal open={terminalOpen} session={realitySession} progress={facilityProgress} onClose={() => setTerminalOpen(false)} onArchive={() => { setTerminalOpen(false); openArchive(); }} />
      <RecordSearch open={facilityModal === "record"} progress={facilityProgress} session={realitySession} onClose={() => setFacilityModal(null)} onSearch={handleRecordSearch} />
      <SignalAnalysis open={facilityModal === "signal"} session={realitySession} complete={Boolean(facilityProgress.signalResult)} onClose={() => setFacilityModal(null)} onComplete={handleSignalComplete} />
      <ObservationInstrument open={facilityModal === "instrument"} session={realitySession} onClose={() => setFacilityModal(null)} onObserve={handleObservationSighting} />
      {thresholdOpen && <N07Threshold open evaluation={n07Access} archetype={facilityProgress.consequences.observerArchetype} onClose={() => setThresholdOpen(false)} onResolve={commitN07Ending} />}
      <N07Ending commit={n07EndingVisible ? facilityProgress.consequences.endingCommit : null} returning={n07Access.returningVariant} onContinue={() => setN07EndingVisible(false)} onArchive={() => { setN07EndingVisible(false); openArchive(); }} />
      {n07CompletionVisible && <N07Completion progress={facilityProgress.n07} onReturn={() => { setN07CompletionVisible(false); setExperienceMode("nexus"); setFacilityRoom("nexus"); setNexusPose(facilityPoses.nexus); updateFacility((current) => ({ ...current, location: "nexus", pose: facilityPoses.nexus, n07: { ...current.n07, returnVisits: current.n07.returnVisits + 1 } })); showNexusNotice("NEXUS MODEL UPDATED / N-07 ROUTE RETAINED"); }} />}
      <EvidenceNotice evidenceId={evidenceNotice} />
      <FacilityTransition visible={routeTransition} room={routeDestination} />
      <NexusTransition visible={experienceMode === "transition"} returning={returningToNexus} />
      {process.env.NODE_ENV !== "production" && <ObserverDebugPanel />}
      {process.env.NODE_ENV !== "production" && <N07DebugPanel onScenario={runN07Qa} returning={qaReturning} onReturning={() => setQaReturning((current) => !current)} onThreshold={() => setThresholdOpen(true)} onLevelAction={handleNexusInteract} />}
      {process.env.NODE_ENV !== "production" && <FacilityDebugPanel room={facilityRoom} progress={facilityProgress} onTravel={travelTo} onInteract={() => handleNexusInteract(facilityRoom === "record-vault" ? "record-search" : facilityRoom === "signal-room" ? "signal-analysis" : facilityRoom === "dead-sector" ? "dead-sector-scan" : facilityRoom === "observation-deck" ? "observation-instrument" : facilityRoom === "maintenance-spine" ? "hidden-passage" : "archive-map")} onCorridor={() => handleNexusInteract("corridor-marker")} onReset={() => { resettingFacilityRef.current = true; clearFacilityProgress(); const fresh = { ...createFacilityProgress(), epoch: Date.now() }; saveFacilityProgress(fresh, true); setFacilityProgress(fresh); setFacilityRoom("nexus"); setNexusPose(facilityPoses.nexus); window.setTimeout(() => { saveFacilityProgress(fresh, true); resettingFacilityRef.current = false; }, 120); }} onUnlock={() => updateFacility((current) => ({ ...current, signalResult: current.signalResult ?? "QA / ISOLATED", hiddenPassageDiscovered: true, unlockedShortcuts: ["signal-spine"], n07Clues: ["record-future", "signal-7a", "maintenance-marking"] }))} />}
      {process.env.NODE_ENV !== "production" && <InvestigationDebugPanel progress={facilityProgress.investigation} onInspect={(id) => seekArtifact(id, true)} onEvidence={(id) => registerEvidence(id)} onArchive={openArchive} onReset={() => updateInvestigation(() => createInvestigationProgress())} />}
      {process.env.NODE_ENV !== "production" && <ConsequenceDebugPanel state={facilityProgress.consequences} onSet={(consequences) => updateFacility((current) => ({ ...current, consequences }))} onArchive={openArchive} onRoom={travelTo} />}
      {process.env.NODE_ENV !== "production" && <output hidden data-nexus-diagnostics={JSON.stringify({ mode: experienceMode, journeyStage, entered: nexusEntered, active: nexusActive, target: nexusTarget, scanner: nexusScanner, terminal: terminalOpen, pointerLocked, room: facilityRoom, hydrated: facilityHydrated, routeTransition, facilityModal, progress: facilityProgress, investigation: facilityProgress.investigation, pose: nexusPose, controls: nexusControls.snapshot() })} />}
      <LoaderOverlay isVisible={isLoading} reducedMotion={reducedMotion} returningVisitor={realitySession.returningVisitor} />
      <ArchiveCanvas isSceneReady={!isLoading} reducedMotion={reducedMotion} scrollProgress={progressRef} inspection={inspectionRef} tier={tier} quality={quality} hasFinePointer={hasFinePointer} onIntroComplete={handleIntroComplete} mode={experienceMode} nexusActive={nexusActive} gateOpening={experienceMode === "transition" && !returningToNexus} nexusControls={nexusControls} nexusPose={nexusPose} discoveredCount={nexusDiscoveredCount} session={realitySession} facilityRoom={facilityRoom} facilityProgress={facilityProgress} facilityScanner={nexusScanner} nexusTarget={nexusTarget} onNexusTarget={setNexusTarget} onNexusInteract={handleNexusInteract} onNexusScanner={toggleNexusScanner} onNexusPose={handleNexusPose} onPointerLock={setPointerLocked} />
    </main>
  );
}

function ConsequenceDebugPanel({ state, onSet, onArchive, onRoom }: { state: ConsequenceState; onSet: (state: ConsequenceState) => void; onArchive: () => void; onRoom: (room: FacilityRoom) => void }) {
  const [hidden, setHidden] = useState(false);
  const [endingPreview, setEndingPreview] = useState(false);
  const enabled = useSyncExternalStore(
    () => () => undefined,
    () => process.env.NODE_ENV !== "production" && new URLSearchParams(location.search).has("consequence-qa"),
    () => false,
  );
  if (!enabled || hidden) return null;
  const scenario = (run: "minimal" | "intervention" | "cartographer" | "chronologist") => {
    const next = createConsequenceState();
    if (run === "minimal") onSet({ ...next, minimalCompletion: true, committedEnding: "protocol", observerArchetype: "witness" });
    if (run === "intervention") onSet({ ...next, gravityOverdrive: true, neuralStrategy: "intervention", neuralPredictionTriggered: true, signal7aResolution: "neural", memoryRestorationCommitted: true, observerArchetype: "interventionist", committedEnding: "subject-07" });
    if (run === "cartographer") onSet({ ...next, voidBoundaryExposed: true, voidProbeDepth: 3, deadSectorInvestigated: true, signal7aResolution: "spatial", n07DiscoveryRoute: "spatial", acceptedCorrelations: ["D-N00|V-NONLOCAL"], observerArchetype: "cartographer", committedEnding: "n07-vector" });
    if (run === "chronologist") onSet({ ...next, gravityStabilized: true, mirrorImpossibleFeedSelected: true, temporalSequenceChoice: "pre-response", event13Resolved: true, neuralStrategy: "observation", neuralPredictionTriggered: true, voidBoundaryExposed: true, voidProbeDepth: 3, memoryReconstructionType: "FOREIGN RETURN", memoryRestorationCommitted: true, signal7aResolution: "temporal", n07DiscoveryRoute: "temporal", acceptedCorrelations: ["S-7A|T-13", "D-N00|V-NONLOCAL", "M-FOREIGN|R-07-FUTURE"], observerArchetype: "chronologist", committedEnding: "archive-anomaly" });
  };
  const setSignal = (signal7aResolution: SignalResolution) => onSet({ ...state, signal7aResolution, n07DiscoveryRoute: signal7aResolution === "temporal" ? "temporal" : signal7aResolution === "spatial" ? "spatial" : state.n07DiscoveryRoute });
  return <><aside className="fixed left-3 top-3 z-[74] w-64 border border-white/20 bg-black/92 p-3 text-white" aria-label="Consequence QA controls"><p className="text-[7px] tracking-[.27em] text-white/42">CONSEQUENCE QA / DEV ONLY</p><p className="mt-2 text-[7px] tracking-[.16em] text-white/60">{state.committedEnding?.toUpperCase() ?? "LIVE"} · {state.signal7aResolution?.toUpperCase() ?? "NO SIGNAL"}</p><div className="mt-3 grid grid-cols-2 gap-1">{(["minimal", "intervention", "cartographer", "chronologist"] as const).map((run) => <button key={run} type="button" onClick={() => scenario(run)} className="min-h-8 border border-white/12 text-[6px] tracking-[.13em] text-white/48">RUN / {run.toUpperCase()}</button>)}</div><div className="mt-2 grid grid-cols-2 gap-1"><button type="button" onClick={() => onSet({ ...state, gravityStabilized: true, gravityOverdrive: false })} className="min-h-8 border border-white/12 text-[6px] text-white/48">GRAVITY STABLE</button><button type="button" onClick={() => onSet({ ...state, gravityOverdrive: true, gravityStabilized: false })} className="min-h-8 border border-white/12 text-[6px] text-white/48">GRAVITY OVERDRIVE</button><button type="button" onClick={() => onSet({ ...state, mirrorImpossibleFeedSelected: true })} className="min-h-8 border border-white/12 text-[6px] text-white/48">MIRROR CORRECT</button><button type="button" onClick={() => onSet({ ...state, mirrorImpossibleFeedSelected: false })} className="min-h-8 border border-white/12 text-[6px] text-white/48">MIRROR FALSE</button><button type="button" onClick={() => onSet({ ...state, event13Resolved: true, temporalSequenceChoice: "pre-response" })} className="min-h-8 border border-white/12 text-[6px] text-white/48">EVENT 13</button><button type="button" onClick={() => onSet({ ...state, neuralStrategy: state.neuralStrategy === "intervention" ? "observation" : "intervention", neuralPredictionTriggered: true })} className="min-h-8 border border-white/12 text-[6px] text-white/48">NEURAL ROUTE</button><button type="button" onClick={() => onSet({ ...state, voidBoundaryExposed: true, voidProbeDepth: 3 })} className="min-h-8 border border-white/12 text-[6px] text-white/48">VOID EXPOSED</button><button type="button" onClick={() => onSet({ ...state, memoryRestorationCommitted: true, memoryReconstructionType: "QA RESTORATION" })} className="min-h-8 border border-white/12 text-[6px] text-white/48">MEMORY WRITEBACK</button></div><div className="mt-2 grid grid-cols-3 gap-1">{(["temporal", "spatial", "neural"] as SignalResolution[]).map((signal) => <button key={signal} type="button" onClick={() => setSignal(signal)} className="min-h-8 border border-white/12 text-[6px] text-white/48">{signal.toUpperCase()}</button>)}</div><div className="mt-2 flex gap-1"><button type="button" onClick={onArchive} className="min-h-8 flex-1 border border-white/12 text-[6px] text-white/48">RESPONSE MAP</button><button type="button" onClick={() => setEndingPreview((current) => !current)} className="min-h-8 border border-white/12 px-2 text-[6px] text-white/48">ENDING</button><button type="button" onClick={() => onRoom("nexus")} className="min-h-8 border border-white/12 px-2 text-[6px] text-white/48">NEXUS</button><button type="button" onClick={() => setHidden(true)} className="min-h-8 border border-white/12 px-2 text-[6px] text-white/48">HIDE</button></div></aside>{endingPreview && <ArchiveEnding stage="session-complete" reducedMotion consequences={state} onOpenArchive={() => { setEndingPreview(false); onArchive(); }} />}</>;
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

function N07DebugPanel({ onScenario, returning, onReturning, onThreshold, onLevelAction }: { onScenario: (scenario: N07QaScenario) => void; returning: boolean; onReturning: () => void; onThreshold: () => void; onLevelAction: (target: NexusInteractionId) => void }) {
  const [hidden, setHidden] = useState(false);
  const enabled = useSyncExternalStore(
    () => () => undefined,
    () => process.env.NODE_ENV !== "production" && (new URLSearchParams(location.search).has("n07-qa") || new URLSearchParams(location.search).has("n07-level-qa")),
    () => false,
  );
  if (!enabled || hidden) return null;
  const tiers: N07QaScenario[] = ["tier-0", "tier-2", "temporal", "spatial", "mnemonic", "adaptive"];
  const endings: N07QaScenario[] = ["protocol-ending", "subject-ending", "vector-ending", "anomaly-ending"];
  const levelActions: [string, NexusInteractionId][] = [["REOPEN GATE", "n07-gate"], ["CROSS", "n07-cross-threshold"], ["TOPOLOGY", "n07-topology-missing"], ["EVENT 1", "n07-causal-pre"], ["EVENT 2", "n07-causal-signal"], ["EVENT 3", "n07-causal-containment"], ["EVENT 4", "n07-causal-arrival"], ["MODEL ROUTE", "n07-route-model"], ["CONTRADICTION", "n07-route-contradiction"], ["SECRET", "n07-secret"], ["ACT NOW", "n07-observer-direct"], ["WAIT", "n07-observer-wait"], ["TRAVERSE", "n07-traversal"], ["STABILIZE", "n07-final-stabilize"], ["PRESERVE", "n07-final-preserve"]];
  return <aside className="fixed right-3 top-3 z-[76] w-64 border border-white/20 bg-black/92 p-3 text-white" aria-label="N-07 QA controls">
    <p className="text-[7px] tracking-[.27em] text-white/42">N-07 QA / DEV ONLY</p>
    <div className="mt-3 grid grid-cols-2 gap-1">{tiers.map((scenario) => <button key={scenario} type="button" onClick={() => onScenario(scenario)} className="min-h-8 border border-white/12 text-[6px] tracking-[.13em] text-white/48">{scenario.replaceAll("-", " ").toUpperCase()}</button>)}</div>
    <p className="mt-3 text-[6px] tracking-[.2em] text-white/28">ENDING SPACES</p>
    <div className="mt-2 grid grid-cols-2 gap-1">{endings.map((scenario) => <button key={scenario} type="button" onClick={() => onScenario(scenario)} className="min-h-8 border border-white/12 text-[6px] tracking-[.13em] text-white/48">{scenario.replace("-ending", "").toUpperCase()}</button>)}</div>
    <div className="mt-2 flex gap-1"><button type="button" onClick={onThreshold} className="min-h-8 flex-1 border border-white/12 text-[6px] text-white/48">THRESHOLD UI</button><button type="button" onClick={onReturning} className={`min-h-8 border px-2 text-[6px] ${returning ? "border-white/45 text-white" : "border-white/12 text-white/48"}`}>RETURNING</button><button type="button" onClick={() => setHidden(true)} className="min-h-8 border border-white/12 px-2 text-[6px] text-white/48">HIDE</button></div>
    {typeof location !== "undefined" && new URLSearchParams(location.search).has("n07-level-qa") && <><p className="mt-3 text-[6px] tracking-[.2em] text-white/28">PLAYABLE LEVEL / DETERMINISTIC</p><div className="mt-2 grid grid-cols-2 gap-1">{levelActions.map(([label, action]) => <button key={action} type="button" onClick={() => onLevelAction(action)} className="min-h-8 border border-white/12 text-[6px] tracking-[.13em] text-white/48">{label}</button>)}</div></>}
  </aside>;
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
