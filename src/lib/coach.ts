import {
  Session,
  CoachingOutput,
  OKRSummary,
  SAFETY_REJECTION_PATTERNS,
} from "./types";
import { scoreSession } from "./scoring";
import { getTemplates } from "./templates";

// ─── Coaching engine: ties scoring + templates + OKR tracking together ───

/** Run the full coaching pipeline on a session. */
export function coachSession(session: Session): CoachingOutput {
  const safetyFlags = checkSafety(session);
  const scorecard = scoreSession(session);

  const dims = scorecard.dimensions;
  const weakest = [...dims].sort((a, b) => a.score - b.score)[0];
  const strongest = [...dims].sort((a, b) => b.score - a.score)[0];

  const templates = getTemplates(session.strictness);
  const turnsLeft = session.maxTurns - session.turnNumber;

  const managerFeedback = templates.managerFeedback(
    scorecard.grade,
    `${weakest.dimension} (${weakest.score}/10 — ${weakest.note})`,
    `${strongest.dimension} (${strongest.score}/10)`
  );

  const selfReviewPrompt = templates.selfReviewPrompt(
    session.taskDescription,
    session.turnNumber,
    session.maxTurns
  );

  const nextTurnPrompt = templates.nextTurnPrompt(
    session.taskDescription,
    weakest.dimension,
    turnsLeft
  );

  const okrSummary = summarizeOKRs(session);

  return {
    scorecard,
    okrSummary,
    managerFeedback,
    selfReviewPrompt,
    nextTurnPrompt,
    safetyFlags,
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
          `AI Foreman does not support prompts that attempt to bypass safety boundaries, ` +
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
            okr.keyResults.reduce(
              (sum, kr) => sum + Math.min((kr.current / kr.target) * 100, 100),
              0
            ) / okr.keyResults.length
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
  const W = 72; // inner width

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
  const summaryStr = `  OVERALL: ${scorecard.overall}/10  Grade: ${scorecard.grade}`;
  lines.push(`║${pad(summaryStr, W)}║`);
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
  const sections: string[] = [];

  // Safety flags first
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

  return sections.join("\n");
}

// ─── Utilities ───

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
