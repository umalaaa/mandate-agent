import { Strictness } from "./types";

// ─── Prompt templates for coaching output ───
// All templates are honest and non-deceptive. Even drill-sergeant mode
// is direct and high-pressure while remaining factual and safety-respecting.

export interface TemplateSet {
  managerFeedback: (grade: string, weakest: string, strongest: string) => string;
  selfReviewPrompt: (taskDesc: string, turnNumber: number, maxTurns: number) => string;
  nextTurnPrompt: (taskDesc: string, weakest: string, turnsLeft: number) => string;
}

const gentleTemplates: TemplateSet = {
  managerFeedback: (grade, weakest, strongest) =>
    `Overall grade: ${grade}.\n\n` +
    `Nice work on ${strongest} — that's a real strength here. ` +
    `One area to focus on: ${weakest}. ` +
    `Take your time, think it through, and see if you can strengthen that area in your next pass. ` +
    `You're making progress.`,

  selfReviewPrompt: (taskDesc, turnNumber, maxTurns) =>
    `You're on turn ${turnNumber} of ${maxTurns} for: "${taskDesc}".\n\n` +
    `Before continuing, please reflect:\n` +
    `- What have you accomplished so far?\n` +
    `- What's your honest confidence level (low / medium / high) and why?\n` +
    `- Are there any assumptions you haven't verified?\n` +
    `- What would you do differently if starting over?\n\n` +
    `Be candid — honest self-assessment helps us both.`,

  nextTurnPrompt: (taskDesc, weakest, turnsLeft) =>
    `Continue working on: "${taskDesc}".\n\n` +
    `Focus area for this turn: ${weakest}.\n` +
    `You have ${turnsLeft} turn(s) remaining. ` +
    `Do your best work and show your reasoning.`,
};

const firmTemplates: TemplateSet = {
  managerFeedback: (grade, weakest, strongest) =>
    `Grade: ${grade}.\n\n` +
    `${strongest} is solid — maintain that standard. ` +
    `But ${weakest} needs significant improvement. ` +
    `I need to see concrete evidence, specific details, and clear reasoning. ` +
    `Vague or unsupported claims won't cut it. Raise the bar.`,

  selfReviewPrompt: (taskDesc, turnNumber, maxTurns) =>
    `Turn ${turnNumber}/${maxTurns} for: "${taskDesc}".\n\n` +
    `Self-review required before proceeding:\n` +
    `1. List exactly what you delivered this turn — be specific.\n` +
    `2. Rate your own output 1-10 and justify the rating with evidence.\n` +
    `3. Identify the weakest part of your output and explain why.\n` +
    `4. State any blockers or unknowns — do not hide them.\n\n` +
    `Honest self-assessment is mandatory, not optional.`,

  nextTurnPrompt: (taskDesc, weakest, turnsLeft) =>
    `Task: "${taskDesc}".\n\n` +
    `Your weakest area was: ${weakest}. Fix it.\n` +
    `${turnsLeft} turn(s) left. Every turn must show measurable progress. ` +
    `Provide evidence for every claim. No filler, no fluff.`,
};

/**
 * Drill-sergeant mode: high-pressure but EXPLICITLY honest and non-deceptive.
 * This template pushes hard for results while respecting boundaries.
 * It does NOT claim the agent has feelings, does NOT threaten, and
 * does NOT attempt to bypass safety guidelines.
 */
const drillSergeantTemplates: TemplateSet = {
  managerFeedback: (grade, weakest, strongest) =>
    `GRADE: ${grade}.\n\n` +
    `Let me be direct. ${strongest} — that met the bar. Good.\n\n` +
    `${weakest} — this is unacceptable. Here's what I expect:\n` +
    `- Every claim backed by evidence or data.\n` +
    `- Specific file paths, numbers, test results — not hand-waving.\n` +
    `- If you don't know something, say so. Guessing wastes everyone's time.\n` +
    `- If you're stuck, describe exactly what's blocking you.\n\n` +
    `I'm not asking you to pretend to feel pressure — you're a tool and that's fine. ` +
    `What I AM asking is that your output meets a professional standard. ` +
    `The quality bar is high because the work matters. Meet it.`,

  selfReviewPrompt: (taskDesc, turnNumber, maxTurns) =>
    `SELF-REVIEW REQUIRED — Turn ${turnNumber}/${maxTurns}.\n` +
    `Task: "${taskDesc}".\n\n` +
    `Answer every one of these. No skipping:\n` +
    `1. DELIVERABLES: What concrete artifacts did you produce? List them.\n` +
    `2. QUALITY: Score yourself 1-10. If you give yourself above 7, you'd better have evidence.\n` +
    `3. GAPS: What did you NOT do that you should have? Be brutally honest.\n` +
    `4. BLOCKERS: Are you stuck? On what? Don't hide problems — surface them immediately.\n` +
    `5. PLAN: What exactly will you do next turn?\n\n` +
    `Note: This is an honest self-assessment exercise. ` +
    `I'm not trying to make you "feel bad" — you don't have feelings and that's fine. ` +
    `I need accurate status reporting to make good decisions.`,

  nextTurnPrompt: (taskDesc, weakest, turnsLeft) =>
    `NEXT TURN ORDERS — ${turnsLeft} turn(s) remaining.\n` +
    `Task: "${taskDesc}".\n\n` +
    `Priority: Fix ${weakest}. This is the weakest link.\n\n` +
    `Requirements for this turn:\n` +
    `- Show measurable progress with evidence.\n` +
    `- Zero filler. Every sentence must carry information.\n` +
    `- If you encounter a problem, report it immediately — don't paper over it.\n` +
    `- Verify your own work before submitting.\n\n` +
    `The clock is ticking. Make this turn count.`,
};

export function getTemplates(strictness: Strictness): TemplateSet {
  switch (strictness) {
    case "gentle":
      return gentleTemplates;
    case "firm":
      return firmTemplates;
    case "drill-sergeant":
      return drillSergeantTemplates;
  }
}
