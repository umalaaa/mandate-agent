#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { Session } from "./lib/types";
import { coachSession, formatFullOutput } from "./lib/coach";

// ─── AI Foreman CLI ───

const USAGE = `
AI Foreman — AI Agent Supervisor & Coach

Usage:
  ai-foreman <session.json>            Score and coach an agent session
  ai-foreman --help                    Show this help message
  ai-foreman --json <session.json>     Output results as JSON

Options:
  --json     Output raw JSON instead of formatted text
  --help     Show help

Example:
  ai-foreman examples/session.json
  ai-foreman --json examples/session.json
`;

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(USAGE);
    process.exit(0);
  }

  const jsonMode = args.includes("--json");
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
  const output = coachSession(session);

  if (jsonMode) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log(formatFullOutput(output));
  }

  // Exit with non-zero if safety flags were raised
  if (output.safetyFlags.length > 0) {
    process.exit(2);
  }
}

main();
