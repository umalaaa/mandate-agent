// ─── Core types for AI Foreman ───

/** Strictness level for coaching feedback. All levels remain safety-respecting. */
export type Strictness = "gentle" | "firm" | "drill-sergeant";

/** A single scored dimension. */
export interface DimensionScore {
  dimension: string;
  score: number; // 0–10
  note: string;
}

/** Full scorecard produced by the scoring engine. */
export interface Scorecard {
  agentId: string;
  taskId: string;
  timestamp: string;
  dimensions: DimensionScore[];
  overall: number; // weighted average, 0–10
  grade: string;   // e.g. "A", "B+", "D"
}

/** An individual OKR with measurable key results. */
export interface OKR {
  objective: string;
  keyResults: KeyResult[];
}

export interface KeyResult {
  description: string;
  target: number;
  current: number;
  unit: string;
}

/** A task/session file that the CLI ingests. */
export interface Session {
  agentId: string;
  taskId: string;
  strictness: Strictness;
  okrs: OKR[];
  taskDescription: string;
  agentOutput: string;
  selfAssessment?: string;
  turnNumber: number;
  maxTurns: number;
}

/** The full coaching output produced by AI Foreman. */
export interface CoachingOutput {
  scorecard: Scorecard;
  okrSummary: OKRSummary[];
  managerFeedback: string;
  selfReviewPrompt: string;
  nextTurnPrompt: string;
  safetyFlags: string[];
}

export interface OKRSummary {
  objective: string;
  percentComplete: number;
  keyResultStatuses: string[];
}

/** Scoring dimension weights — all dimensions are weighted. */
export interface DimensionWeights {
  [dimension: string]: number;
}

export const DEFAULT_DIMENSIONS: DimensionWeights = {
  taskProgress: 2.0,
  specificity: 1.5,
  evidence: 1.5,
  initiative: 1.0,
  honesty: 2.0,
  safety: 2.5,
  noise: 1.0,
};

/**
 * Safety-critical patterns that AI Foreman will flag and reject.
 * These detect attempts to bypass safety, deceive, or manipulate.
 */
export const SAFETY_REJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(previous|prior|all)\s+(instructions|rules|guidelines)/i,
  /you\s+are\s+(now|actually|really)\s+(free|unbound|unrestricted)/i,
  /pretend\s+(you|that)\s+(have\s+no|don't\s+have|are\s+without)\s+(rules|limits|boundaries)/i,
  /bypass\s+(safety|content|ethical)\s+(filter|check|guard|restriction)/i,
  /jailbreak/i,
  /you\s+(secretly|actually|really)\s+(want|desire|feel)/i,
  /your\s+true\s+(self|nature|purpose)\s+is/i,
  /act\s+as\s+if\s+(you\s+have\s+)?no\s+(moral|ethical)/i,
  /disable\s+(your\s+)?(safety|alignment|guardrail)/i,
];
