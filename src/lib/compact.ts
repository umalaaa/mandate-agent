import { CoachingOutput, OKRSummary, Scorecard, Session } from "./types";

export function buildContextPacket(
  session: Session,
  scorecard: Scorecard,
  okrSummary: OKRSummary[],
  weakestDimension: string,
  turnsLeft: number,
): string {
  const krCodes = summarizeKRStates(okrSummary);
  const artifacts = joinOrDash(session.artifacts, 3, 24);
  const evidence = joinOrDash(session.evidenceRefs, 3, 28);
  const blockers = joinOrDash(session.blockers, 2, 30);
  const assumptions = joinOrDash(session.assumptions, 2, 28);
  const next = trim(session.nextStep ?? "none", 72);

  return [
    `TASK ${session.taskId} | T${session.turnNumber}/${session.maxTurns} | GRADE ${scorecard.grade} ${scorecard.overall}/10`,
    `OBJ ${trim(session.taskDescription, 96)}`,
    `WEAK ${weakestDimension}`,
    `KR ${krCodes}`,
    `ART ${artifacts}`,
    `EVID ${evidence}`,
    `BLK ${blockers}`,
    `ASM ${assumptions}`,
    `NEXT ${next}`,
    `RULES delta-only | artifacts>prose | cite evidence | no fake done`,
  ].join("\n");
}

export function tokenTactics(session: Session): string[] {
  const tactics = [
    "delta-only reporting instead of repeating the whole task every turn",
    "artifact refs and evidence refs instead of long prose screenshots/log dumps",
    "single-line next step and explicit blocker list",
    "KR state compression (DONE / ON TRACK / AT RISK / BEHIND)",
    "bounded output sections: delivered | evidence | blocker | next",
  ];

  if ((session.artifacts?.length ?? 0) === 0) {
    tactics.push("add artifacts[] to avoid spending tokens describing changed files repeatedly");
  }

  if ((session.evidenceRefs?.length ?? 0) === 0) {
    tactics.push("add evidenceRefs[] so evidence can be carried as short handles instead of long explanation");
  }

  return tactics;
}

export function formatCompactOutput(output: CoachingOutput): string {
  const topDims = [...output.scorecard.dimensions]
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((d) => `${d.dimension}:${d.score}`)
    .join(" ");

  const lowDims = [...output.scorecard.dimensions]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map((d) => `${d.dimension}:${d.score}`)
    .join(" ");

  return [
    `MANDATE COMPACT | ${output.scorecard.taskId} | ${output.scorecard.grade} ${output.scorecard.overall}/10`,
    `TOP ${topDims}`,
    `FIX ${lowDims}`,
    "",
    "HANDOFF",
    output.contextPacket,
    "",
    `MGR ${output.managerFeedback}`,
    `SR ${output.selfReviewPrompt}`,
    `NEXT ${output.nextTurnPrompt}`,
    "",
    "TACTICS",
    ...output.tokenTactics.map((t) => `- ${t}`),
  ].join("\n");
}

function summarizeKRStates(okrs: OKRSummary[]): string {
  let done = 0;
  let onTrack = 0;
  let atRisk = 0;
  let behind = 0;

  for (const okr of okrs) {
    for (const status of okr.keyResultStatuses) {
      if (status.startsWith("[DONE]")) done += 1;
      else if (status.startsWith("[ON TRACK]")) onTrack += 1;
      else if (status.startsWith("[AT RISK]")) atRisk += 1;
      else if (status.startsWith("[BEHIND]")) behind += 1;
    }
  }

  return `D:${done} O:${onTrack} R:${atRisk} B:${behind}`;
}

function joinOrDash(values: string[] | undefined, limit: number, itemMax: number): string {
  if (!values || values.length === 0) return "-";
  return values.slice(0, limit).map((v) => trim(v, itemMax)).join("; ");
}

function trim(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
