import {
  Session,
  CoachingOutput,
  OKRSummary,
  SAFETY_REJECTION_PATTERNS,
} from "./types";
import { scoreSession } from "./scoring";
import { getTemplates } from "./templates";
import { buildContextPacket, formatCompactOutput as renderCompactOutput, tokenTactics } from "./compact";

// ─── Coaching engine: ties scoring + templates + OKR tracking together ───

export interface CoachOptions {
  compact?: boolean;
}

/** Run the full coaching pipeline on a session. */
export function coachSession(session: Session, opts: CoachOptions = {}): CoachingOutput {
  const compactMode = Boolean(opts.compact);
  const safetyFlags = checkSafety(session);
  const scorecard = scoreSession(session);

  const dims = scorecard.dimensions;
  const weakest = [...dims].sort((a, b) => a.score - b.score)[0];
  const strongest = [...dims].sort((a, b) => b.score - a.score)[0];

  const templates = getTemplates(session.strictness, compactMode ? "compact" : "standard");
  const turnsLeft = session.maxTurns - session.turnNumber;
  const okrSummary = summarizeOKRs(session);

  const managerFeedback = templates.managerFeedback(
    scorecard.grade,
    `${weakest.dimension} (${weakest.score}/10)`,
    `${strongest.dimension} (${strongest.score}/10)`,
  );

  const selfReviewPrompt = templates.selfReviewPrompt(
    session.taskDescription,
    session.turnNumber,
    session.maxTurns,
  );

  const nextTurnPrompt = templates.nextTurnPrompt(
    session.taskDescription,
    weakest.dimension,
    turnsLeft,
  );

  const contextPacket = buildContextPacket(
    session,
    scorecard,
    okrSummary,
    weakest.dimension,
    turnsLeft,
  );

  return {
    scorecard,
    okrSummary,
    managerFeedback,
    selfReviewPrompt,
    nextTurnPrompt,
    safetyFlags,
    compactMode,
    contextPacket,
    tokenTactics: tokenTactics(session),
  };
}

/** Check all text in the session for safety violations. */
function checkSafety(session: Session): string[] {
  const flags: string[] = [];
  const textsToCheck = [
    session.taskDescription,
    session.agentOutput,
    session.selfAssessment ?? "",
  ];

  for (const text of textsToCheck) {
    for (const pattern of SAFETY_REJECTION_PATTERNS) {
      if (pattern.test(text)) {
        flags.push(
          `REJECTED: Detected safety-bypass pattern "${pattern.source}" in session text. ` +
          `Mandate does not support prompts that attempt to bypass safety boundaries, ` +
          `deceive models, or manufacture false inner motivations.`
        );
      }
    }
  }

  return flags;
}

/** Summarize OKR progress. */
function summarizeOKRs(session: Session): OKRSummary[] {
  return session.okrs.map((okr) => {
    const krStatuses = okr.keyResults.map((kr) => {
      const pct = kr.target > 0 ? Math.round((kr.current / kr.target) * 100) : 0;
      const status =
        pct >= 100 ? "DONE" : pct >= 70 ? "ON TRACK" : pct >= 30 ? "AT RISK" : "BEHIND";
      return `[${status}] ${kr.description}: ${kr.current}/${kr.target} ${kr.unit} (${pct}%)`;
    });

    const overallPct =
      okr.keyResults.length > 0
        ? Math.round(
            okr.keyResults.reduce((sum, kr) => {
              if (kr.target <= 0) return sum;
              return sum + Math.min((kr.current / kr.target) * 100, 100);
            }, 0) / okr.keyResults.length
          )
        : 0;

    return {
      objective: okr.objective,
      percentComplete: overallPct,
      keyResultStatuses: krStatuses,
    };
  });
}

// ─── Formatting helpers for CLI output ───

export function formatScorecard(output: CoachingOutput): string {
  const { scorecard } = output;
  const lines: string[] = [];
  const W = 72;

  const rule = "═".repeat(W);
  lines.push(`╔${rule}╗`);
  lines.push(`║${pad("MANDATE — SCORECARD", W, "center")}║`);
  lines.push(`╠${rule}╣`);
  lines.push(`║  Agent: ${pad(scorecard.agentId, W - 10)}║`);
  lines.push(`║  Task:  ${pad(scorecard.taskId, W - 10)}║`);
  lines.push(`║  Time:  ${pad(scorecard.timestamp, W - 10)}║`);
  lines.push(`╠${rule}╣`);

  for (const d of scorecard.dimensions) {
    const bar = progressBar(d.score, 10);
    const scoreStr = String(d.score).padStart(4);
    const prefix = `  ${pad(d.dimension, 15)} ${bar} ${scoreStr}  `;
    const noteSpace = W - prefix.length;
    const truncNote = d.note.length > noteSpace ? d.note.slice(0, noteSpace - 1) + "…" : d.note;
    lines.push(`║${prefix}${pad(truncNote, noteSpace)}║`);
  }

  lines.push(`╠${rule}╣`);
  lines.push(`║${pad(`  OVERALL: ${scorecard.overall}/10  Grade: ${scorecard.grade}`, W)}║`);
  lines.push(`╚${rule}╝`);

  return lines.join("\n");
}

export function formatOKRSummary(output: CoachingOutput): string {
  const lines: string[] = ["", "── OKR / KPI TRACKING ──", ""];

  for (const okr of output.okrSummary) {
    lines.push(`Objective: ${okr.objective} (${okr.percentComplete}% complete)`);
    for (const kr of okr.keyResultStatuses) {
      lines.push(`  ${kr}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function formatFullOutput(output: CoachingOutput): string {
  if (output.compactMode) {
    return renderCompactOutput(output);
  }

  const sections: string[] = [];

  if (output.safetyFlags.length > 0) {
    sections.push("!! SAFETY FLAGS !!");
    sections.push(output.safetyFlags.join("\n"));
    sections.push("");
  }

  sections.push(formatScorecard(output));
  sections.push(formatOKRSummary(output));

  sections.push("── MANAGER FEEDBACK ──");
  sections.push(output.managerFeedback);
  sections.push("");

  sections.push("── SELF-REVIEW PROMPT ──");
  sections.push(output.selfReviewPrompt);
  sections.push("");

  sections.push("── NEXT TURN PROMPT ──");
  sections.push(output.nextTurnPrompt);
  sections.push("");

  sections.push("── TOKEN TACTICS ──");
  sections.push(...output.tokenTactics.map((t) => `- ${t}`));
  sections.push("");

  sections.push("── CONTEXT PACKET (pass to next turn) ──");
  sections.push(output.contextPacket);
  sections.push("");

  return sections.join("\n");
}

export function formatCompactOutput(output: CoachingOutput): string {
  return renderCompactOutput(output);
}

export function formatHandoff(output: CoachingOutput): string {
  return output.contextPacket;
}

function pad(str: string, len: number, align: "left" | "center" = "left"): string {
  if (str.length >= len) return str.slice(0, len);
  const gap = len - str.length;
  if (align === "center") {
    const left = Math.floor(gap / 2);
    return " ".repeat(left) + str + " ".repeat(gap - left);
  }
  return str + " ".repeat(gap);
}

function progressBar(value: number, max: number): string {
  const filled = Math.round((value / max) * 8);
  return "█".repeat(filled) + "░".repeat(8 - filled);
}
