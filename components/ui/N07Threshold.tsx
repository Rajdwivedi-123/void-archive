"use client";

import { useMemo, useState } from "react";
import type { ConsequenceEnding, EndingCommit, N07ApproachVector, N07FinalAction } from "@/game/consequenceTypes";
import type { N07AccessEvaluation } from "@/game/n07Access";

const vectorCopy: Record<N07ApproachVector, { label: string; reading: string }> = {
  temporal: { label: "PRE-RESPONSE", reading: "Treat Event 13 as a reply received before the threshold was questioned." },
  spatial: { label: "MISSING INTERVAL", reading: "Treat the Void and Dead Sector as one address represented by incompatible maps." },
  mnemonic: { label: "FOREIGN RECALL", reading: "Treat the restored memory as evidence left by an earlier traversal of this threshold." },
  adaptive: { label: "ANTICIPATED ROUTE", reading: "Treat the Relic's prediction as a route authored by the observer response itself." },
};

export function N07Threshold({ open, evaluation, archetype, onClose, onResolve }: { open: boolean; evaluation: N07AccessEvaluation; archetype: string; onClose: () => void; onResolve: (commit: EndingCommit) => void }) {
  const interpretations = useMemo(() => (Object.entries(evaluation.strengths) as [N07ApproachVector, number][]).filter(([, score]) => score > 0).sort((a, b) => b[1] - a[1]).slice(0, 3), [evaluation]);
  const [vector, setVector] = useState<N07ApproachVector>(evaluation.vector);
  if (!open) return null;
  const resolve = (action: N07FinalAction) => {
    let type: ConsequenceEnding = evaluation.eligibleEndings.includes("subject-07") ? "subject-07" : "protocol";
    if (action !== "reject" && evaluation.eligibleEndings.includes("n07-vector")) type = "n07-vector";
    if (action === "commit" && evaluation.eligibleEndings.includes("archive-anomaly") && vector === evaluation.vector) type = "archive-anomaly";
    onResolve({ type, vector, action, archetype, keyEvidence: evaluation.keyEvidence, facilityState: action === "reject" ? "THRESHOLD REFUSED / FACILITY OBSERVING" : evaluation.facilityState, sessionMarker: Date.now() });
  };
  return <section className="fixed inset-0 z-[68] grid place-items-center overflow-y-auto bg-[#010203]/88 p-4 backdrop-blur-md" aria-label="N-07 threshold calibration">
    <div className="w-full max-w-4xl border border-white/16 bg-[#030506]/96 p-5 text-white shadow-[0_0_100px_rgba(175,184,181,.08)] sm:p-8">
      <div className="flex items-start justify-between border-b border-white/10 pb-5"><div><p className="text-[7px] tracking-[.42em] text-white/34">NONLOCAL THRESHOLD / EVIDENCE INTERPRETATION</p><h2 className="mt-3 text-xl tracking-[.34em] sm:text-3xl">N-07 ALIGNMENT</h2></div><button type="button" onClick={onClose} className="min-h-11 border border-white/12 px-4 text-[7px] tracking-[.25em] text-white/42">WITHDRAW</button></div>
      <div className="mt-7 grid gap-3 sm:grid-cols-3">{interpretations.map(([id, strength]) => <button type="button" key={id} onClick={() => setVector(id)} className={`min-h-36 border p-4 text-left transition-colors ${vector === id ? "border-white/50 bg-white/[.055]" : "border-white/10 bg-black/20 hover:border-white/25"}`}><span className="text-[7px] tracking-[.28em] text-white/32">VECTOR {id.toUpperCase()} / {strength}</span><span className="mt-3 block text-[9px] tracking-[.22em] text-white/78">{vectorCopy[id].label}</span><span className="mt-4 block text-[8px] leading-5 tracking-[.13em] text-white/38">{vectorCopy[id].reading}</span></button>)}</div>
      <div className="mt-7 grid gap-px border-y border-white/10 py-px sm:grid-cols-2"><p className="p-4 text-[7px] leading-6 tracking-[.2em] text-white/34">ACCESS TIER / {evaluation.tier}<br />PRIMARY METHOD / {archetype.toUpperCase()}<br />MODEL / {evaluation.facilityState}</p><p className="p-4 text-[7px] leading-6 tracking-[.2em] text-white/34">EVIDENCE / {evaluation.keyEvidence.length}<br />UNRESOLVED / {evaluation.unresolvedEvidence.length}<br />SELECTED / {vector.toUpperCase()}</p></div>
      <p className="mt-6 text-center text-[7px] tracking-[.3em] text-white/28">FINAL RESPONSE / ONE COMMITMENT WILL BE PRESERVED</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3"><Action label="COMMIT" detail="ENTER THE INTERPRETATION" onClick={() => resolve("commit")} /><Action label="REJECT" detail="REFUSE THE THRESHOLD" onClick={() => resolve("reject")} /><Action label="CONTINUE" detail="LEAVE THE QUESTION OPEN" onClick={() => resolve("continue")} /></div>
    </div>
  </section>;
}

function Action({ label, detail, onClick }: { label: string; detail: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="min-h-16 border border-white/16 px-4 text-[8px] tracking-[.28em] text-white/68 hover:border-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{label}<span className="mt-2 block text-[6px] tracking-[.18em] text-white/28">{detail}</span></button>;
}

const endingText: Record<ConsequenceEnding, { eyebrow: string; title: string; detail: string }> = {
  protocol: { eyebrow: "PROTOCOL CLOSURE", title: "OBSERVATION COMPLETE", detail: "The required record is complete. The unresolved sector remains outside the accepted model." },
  "subject-07": { eyebrow: "OBSERVER CORRELATION", title: "SUBJECT INDEX / 07", detail: "The archive files the observer as part of the evidence. Observation continues in both directions." },
  "n07-vector": { eyebrow: "NONLOCAL RESOLUTION", title: "N-07 / VECTOR ACCEPTED", detail: "The route resolves as an interpretation, not a chamber. The facility preserves the chosen approach." },
  "archive-anomaly": { eyebrow: "UNREGISTERED ARCHIVE STATE", title: "THE RECORD PRECEDES THE OBSERVER", detail: "No single route contains the return. The archive recognizes a traversal it cannot place in this session." },
};

export function N07Ending({ commit, returning, onContinue, onArchive }: { commit: EndingCommit | null; returning: boolean; onContinue: () => void; onArchive: () => void }) {
  if (!commit) return null;
  const copy = endingText[commit.type];
  return <section className={`fixed inset-0 z-[67] grid place-items-center overflow-hidden bg-black/78 p-6 text-white backdrop-blur-sm n07-ending-${commit.type}`} aria-label="Committed archive ending">
    <div className="absolute inset-[8%] border border-white/[.04]" /><div className="absolute left-1/2 top-0 h-full w-px -skew-x-6 bg-white/[.07]" />
    <div className="relative w-full max-w-2xl text-center"><p className="text-[7px] tracking-[.34em] text-white/32 sm:tracking-[.48em]">{copy.eyebrow}</p><h2 className="mt-6 text-xl tracking-[.22em] text-white/92 sm:text-4xl sm:tracking-[.3em]">{copy.title}</h2><p className="mx-auto mt-7 max-w-lg text-[9px] leading-6 tracking-[.1em] text-white/42 sm:tracking-[.19em]">{copy.detail}</p>{returning && <p className="mt-5 text-[7px] tracking-[.16em] text-[#c0b2aa]/55 sm:tracking-[.28em]">PREVIOUS COMMITMENT RECOGNIZED / SESSION ORDER CONFLICT</p>}<div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-px border-y border-white/10 py-4 text-left text-[7px] leading-6 tracking-[.16em] text-white/36 sm:tracking-[.2em]"><p>VECTOR<br /><span className="text-white/72">{commit.vector?.toUpperCase() ?? "PROTOCOL"}</span></p><p>FINAL RESPONSE<br /><span className="text-white/72">{commit.action.toUpperCase()}</span></p><p>OBSERVER<br /><span className="text-white/72">{commit.archetype.toUpperCase()}</span></p><p>FACILITY<br /><span className="text-white/72">{commit.facilityState}</span></p></div><div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row"><button type="button" onClick={onContinue} className="min-h-11 border border-white/24 px-6 text-[8px] tracking-[.3em] text-white/72">CONTINUE IN NEXUS</button><button type="button" onClick={onArchive} className="min-h-11 border border-white/10 px-6 text-[8px] tracking-[.3em] text-white/42">OPEN ARCHIVE</button></div></div>
  </section>;
}
