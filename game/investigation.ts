export type EvidenceCategory =
  | "MEASUREMENT"
  | "ARCHIVE RECORD"
  | "OBSERVATION"
  | "SIGNAL TRACE"
  | "CONTAINMENT RESPONSE"
  | "TEMPORAL EVENT"
  | "SPATIAL CONTRADICTION"
  | "MEMORY FRAGMENT";

export type PuzzleId = "gravity" | "mirror" | "temporal" | "neural" | "void" | "memory";
export type InvestigationStage = "observation" | "contradiction" | "correlation" | "subject-identification" | "n07-vector";

export type EvidenceDefinition = {
  id: string;
  category: EvidenceCategory;
  label: string;
  detail: string;
  artifact?: string;
};

export type InvestigationProgress = {
  evidenceDiscovered: string[];
  evidenceConnections: string[];
  unsupportedConnections: string[];
  puzzlesStarted: PuzzleId[];
  puzzlesSolved: PuzzleId[];
  hypothesesTested: string[];
  knowledgeFlags: string[];
  falseLeadsDisproven: string[];
  puzzleVariants: Partial<Record<PuzzleId, string>>;
  memoryProfile: string | null;
  investigationStage: InvestigationStage;
};

export const evidenceCatalog: EvidenceDefinition[] = [
  { id: "G-FIELD", category: "MEASUREMENT", label: "FIELD VECTOR / B", detail: "Sensor B bends with the mass field. Its numeric return is not spatially reliable.", artifact: "001" },
  { id: "G-EXCURSION", category: "CONTAINMENT RESPONSE", label: "PREVIOUS MAXIMUM", detail: "Containment revoked control after the field crossed an unregistered prior maximum.", artifact: "001" },
  { id: "M-UNREGISTERED", category: "OBSERVATION", label: "IMPOSSIBLE FEED", detail: "One reflected chamber state has no corresponding event in the current observation.", artifact: "002" },
  { id: "T-13", category: "TEMPORAL EVENT", label: "EVENT 13 / PRE-RECORD", detail: "The record exists 04.731 seconds before the event that creates it. Location: N-07.", artifact: "003" },
  { id: "N-ROUTE", category: "SIGNAL TRACE", label: "UNAUTHORIZED ROUTE", detail: "The Relic anticipates a route that was not offered to the observer.", artifact: "004" },
  { id: "V-NONLOCAL", category: "SPATIAL CONTRADICTION", label: "MISSING WIDTH", detail: "Left and right boundaries resolve locally. The central interval returns outside the room.", artifact: "005" },
  { id: "M-FOREIGN", category: "MEMORY FRAGMENT", label: "UNOWNED RECALL", detail: "A memory stratum resolves correctly but does not belong to this session.", artifact: "006" },
  { id: "S-7A", category: "SIGNAL TRACE", label: "SIGNAL 7A", detail: "Origin is inside the facility at 43 m. Temporal offset: 04.731 seconds.", artifact: "SIGNAL" },
  { id: "R-07-FUTURE", category: "ARCHIVE RECORD", label: "SUBJECT 07 / FUTURE", detail: "The Subject 07 record was created after the current session timestamp.", artifact: "RECORD" },
  { id: "D-N00", category: "SPATIAL CONTRADICTION", label: "DEAD SECTOR RETURN", detail: "System statement: SECTOR EMPTY. Scanner statement: CONTAINMENT SIGNATURE ACTIVE.", artifact: "DEAD" },
  { id: "O-N07", category: "OBSERVATION", label: "N-07 APERTURE", detail: "The aperture is visible through the instrument but absent from the physical deck.", artifact: "DECK" },
  { id: "MS-DEPTH", category: "MEASUREMENT", label: "MISSING WALL DEPTH", detail: "The Maintenance Spine wall reports a traversable interval behind solid architecture.", artifact: "SPINE" },
  { id: "N07-TEMPORAL", category: "TEMPORAL EVENT", label: "N-07 / TEMPORAL VECTOR", detail: "Event 13 and Signal 7A share an impossible pre-response interval.", artifact: "N-07" },
  { id: "N07-SPATIAL", category: "SPATIAL CONTRADICTION", label: "N-07 / SPATIAL VECTOR", detail: "The Dead Sector and Void occupy the same missing interval by incompatible maps.", artifact: "N-07" },
  { id: "S07-CORRELATION", category: "ARCHIVE RECORD", label: "SUBJECT 07 / CORRELATION", detail: "Observer method, anomaly response, and an unowned memory resolve to one local subject index.", artifact: "07" },
];

export const meaningfulConnections: Record<string, { evidence: string; knowledge: string }> = {
  "S-7A|T-13": { evidence: "N07-TEMPORAL", knowledge: "n07-temporal-vector" },
  "D-N00|V-NONLOCAL": { evidence: "N07-SPATIAL", knowledge: "n07-spatial-vector" },
  "M-FOREIGN|R-07-FUTURE": { evidence: "S07-CORRELATION", knowledge: "subject-07-identified" },
  "M-UNREGISTERED|O-N07": { evidence: "N07-SPATIAL", knowledge: "aperture-feed-linked" },
  "MS-DEPTH|S-7A": { evidence: "N07-SPATIAL", knowledge: "signal-route-code" },
};

export function createInvestigationProgress(): InvestigationProgress {
  return {
    evidenceDiscovered: [], evidenceConnections: [], unsupportedConnections: [], puzzlesStarted: [], puzzlesSolved: [], hypothesesTested: [],
    knowledgeFlags: [], falseLeadsDisproven: [], puzzleVariants: {}, memoryProfile: null, investigationStage: "observation",
  };
}

export function connectionKey(a: string, b: string) { return [a, b].sort().join("|"); }

export function deriveInvestigationStage(progress: InvestigationProgress): InvestigationStage {
  if (progress.knowledgeFlags.includes("n07-temporal-vector") || progress.knowledgeFlags.includes("n07-spatial-vector")) return "n07-vector";
  if (progress.knowledgeFlags.includes("subject-07-identified")) return "subject-identification";
  if (progress.evidenceConnections.length > 0) return "correlation";
  if (progress.evidenceDiscovered.length >= 2 || progress.puzzlesSolved.length > 0) return "contradiction";
  return "observation";
}

export function sanitizeInvestigation(saved?: Partial<InvestigationProgress>): InvestigationProgress {
  const fallback = createInvestigationProgress();
  const unique = (value: unknown, limit: number) => Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string"))].slice(-limit) : [];
  const puzzleIds: PuzzleId[] = ["gravity", "mirror", "temporal", "neural", "void", "memory"];
  const progress: InvestigationProgress = {
    ...fallback,
    ...saved,
    evidenceDiscovered: unique(saved?.evidenceDiscovered, 32),
    evidenceConnections: unique(saved?.evidenceConnections, 16),
    unsupportedConnections: unique(saved?.unsupportedConnections, 12),
    puzzlesStarted: unique(saved?.puzzlesStarted, 6).filter((id): id is PuzzleId => puzzleIds.includes(id as PuzzleId)),
    puzzlesSolved: unique(saved?.puzzlesSolved, 6).filter((id): id is PuzzleId => puzzleIds.includes(id as PuzzleId)),
    hypothesesTested: unique(saved?.hypothesesTested, 24),
    knowledgeFlags: unique(saved?.knowledgeFlags, 24),
    falseLeadsDisproven: unique(saved?.falseLeadsDisproven, 12),
    puzzleVariants: saved?.puzzleVariants ?? {},
    memoryProfile: typeof saved?.memoryProfile === "string" ? saved.memoryProfile : null,
  };
  progress.investigationStage = deriveInvestigationStage(progress);
  return progress;
}
