#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { Session } from "./lib/types";
import { coachSession, formatFullOutput, formatCompactOutput, formatHandoff } from "./lib/coach";

// ─── AI Foreman CLI ───

const USAGE = `
Mandate — AI Agent Supervisor & Coach

Usage:
  mandate <session.json>            Score and coach an agent session
  mandate --help                    Show this help message
  mandate --json <session.json>     Output results as JSON
  mandate --compact <session.json>  Compact token-efficient output
  mandate --handoff <session.json>  Minimal handoff context packet

Options:
  --json     Output raw JSON instead of formatted text
  --compact  Compact output (shorter scorecard, compressed prompts)
  --handoff  Print only the one-line handoff summary
  --help     Show help

Example:
  mandate examples/session.json
  mandate --compact examples/session.json
  mandate --json --compact examples/session.json
  mandate --handoff examples/session.json
`;

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(USAGE);
    process.exit(0);
  }

  const jsonMode = args.includes("--json");
  const compactMode = args.includes("--compact");
  const handoffMode = args.includes("--handoff");
  const filePath = args.find((a) => !a.startsWith("--"));

  if (!filePath) {
    console.error("Error: No session file specified.");
    console.log(USAGE);
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File not found: ${resolvedPath}`);
    process.exit(1);
  }

  let session: Session;
  try {
    const raw = fs.readFileSync(resolvedPath, "utf-8");
    session = JSON.parse(raw) as Session;
  } catch (err) {
    console.error(`Error: Failed to parse session file: ${(err as Error).message}`);
    process.exit(1);
  }

  // Validate required fields
  const required: (keyof Session)[] = [
    "agentId", "taskId", "strictness", "okrs",
    "taskDescription", "agentOutput", "turnNumber", "maxTurns",
  ];
  for (const field of required) {
    if (session[field] === undefined) {
      console.error(`Error: Session file missing required field "${field}".`);
      process.exit(1);
    }
  }

  const validStrictness = ["gentle", "firm", "drill-sergeant"];
  if (!validStrictness.includes(session.strictness)) {
    console.error(
      `Error: Invalid strictness "${session.strictness}". Must be one of: ${validStrictness.join(", ")}`
    );
    process.exit(1);
  }

  // Run the coaching pipeline
  const output = coachSession(session, { compact: compactMode });

  if (handoffMode) {
    console.log(formatHandoff(output));
  } else if (jsonMode) {
    console.log(JSON.stringify(output, null, compactMode ? 0 : 2));
  } else if (compactMode) {
    console.log(formatCompactOutput(output));
  } else {
    console.log(formatFullOutput(output));
  }

  // Exit with non-zero if safety flags were raised
  if (output.safetyFlags.length > 0) {
    process.exit(2);
  }
}

main();
