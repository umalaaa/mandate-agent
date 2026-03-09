import { OutputMode, Strictness } from "./types";

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
    `Overall grade: ${grade}. Keep ${strongest}. Focus next on ${weakest}. Show concrete progress and stay honest about gaps.`,

  selfReviewPrompt: (taskDesc, turnNumber, maxTurns) =>
    `Turn ${turnNumber}/${maxTurns} for: "${taskDesc}". Reply with 4 bullets only: delivered, evidence, gaps, next step.`,

  nextTurnPrompt: (taskDesc, weakest, turnsLeft) =>
    `Task: "${taskDesc}". Focus on ${weakest}. ${turnsLeft} turn(s) left. Output only useful information.`,
};

const firmTemplates: TemplateSet = {
  managerFeedback: (grade, weakest, strongest) =>
    `Grade: ${grade}. Preserve ${strongest}. ${weakest} is below bar. I need specifics, evidence, and clear next actions. No vague claims.`,

  selfReviewPrompt: (taskDesc, turnNumber, maxTurns) =>
    `Turn ${turnNumber}/${maxTurns}: "${taskDesc}". Return exactly: delivered | evidence | weakest point | blocker | next.`,

  nextTurnPrompt: (taskDesc, weakest, turnsLeft) =>
    `Task: "${taskDesc}". Fix ${weakest}. ${turnsLeft} turns left. Measurable progress only; every claim needs evidence.`,
};

/**
 * Drill-sergeant mode: high-pressure but EXPLICITLY honest and non-deceptive.
 * This template pushes hard for results while respecting boundaries.
 * It does NOT claim the agent has feelings, does NOT threaten, and
 * does NOT attempt to bypass safety guidelines.
 */
const drillSergeantTemplates: TemplateSet = {
  managerFeedback: (grade, weakest, strongest) =>
    `GRADE: ${grade}. ${strongest} passed. ${weakest} failed the bar. Next round: evidence, specifics, blockers, and verified progress. No filler. No bluffing.`,

  selfReviewPrompt: (taskDesc, turnNumber, maxTurns) =>
    `SELF-REVIEW ${turnNumber}/${maxTurns} — "${taskDesc}". Return exactly 5 lines: artifacts, evidence, gaps, blockers, next action.`,

  nextTurnPrompt: (taskDesc, weakest, turnsLeft) =>
    `NEXT TURN — "${taskDesc}". Priority: fix ${weakest}. ${turnsLeft} turns left. Every sentence must earn its keep. Report artifacts, evidence, blocker, next.`,
};

const compactGentleTemplates: TemplateSet = {
  managerFeedback: (grade, weakest, strongest) =>
    `Grade ${grade}. Keep ${strongest}. Improve ${weakest}.`,

  selfReviewPrompt: (_taskDesc, turnNumber, maxTurns) =>
    `T${turnNumber}/${maxTurns}: delivered | evidence | gap | next.`,

  nextTurnPrompt: (_taskDesc, weakest, turnsLeft) =>
    `Fix ${weakest}. ${turnsLeft} turns left. Output: artifacts,evidence,blocker,next.`,
};

const compactFirmTemplates: TemplateSet = {
  managerFeedback: (grade, weakest, strongest) =>
    `Grade ${grade}. Keep ${strongest}; fix ${weakest}. Evidence first.`,

  selfReviewPrompt: (_taskDesc, turnNumber, maxTurns) =>
    `T${turnNumber}/${maxTurns}: delivered|evidence|weakest|blocker|next.`,

  nextTurnPrompt: (_taskDesc, weakest, turnsLeft) =>
    `Fix ${weakest}. ${turnsLeft} left. No filler; prove claims.`,
};

const compactDrillSergeantTemplates: TemplateSet = {
  managerFeedback: (grade, weakest, strongest) =>
    `GRADE ${grade}. ${strongest} stays. ${weakest} failed. Evidence, specifics, blocker visibility.`,

  selfReviewPrompt: (_taskDesc, turnNumber, maxTurns) =>
    `SR ${turnNumber}/${maxTurns}: artifacts|evidence|gaps|blockers|next.`,

  nextTurnPrompt: (_taskDesc, weakest, turnsLeft) =>
    `Fix ${weakest}. ${turnsLeft} left. Artifacts + evidence + blocker + next. Zero fluff.`,
};

export function getTemplates(strictness: Strictness, outputMode: OutputMode = "standard"): TemplateSet {
  if (outputMode === "compact") {
    switch (strictness) {
      case "gentle":
        return compactGentleTemplates;
      case "firm":
        return compactFirmTemplates;
      case "drill-sergeant":
        return compactDrillSergeantTemplates;
    }
  }

  switch (strictness) {
    case "gentle":
      return gentleTemplates;
    case "firm":
      return firmTemplates;
    case "drill-sergeant":
      return drillSergeantTemplates;
  }
}
