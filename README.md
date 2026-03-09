# Mandate

**Mandate** is an AI foreman / KPI coach for agents: a CLI + prompt engine that supervises AI workers with OKRs/KPIs, scorecards, self-review loops, evaluator feedback, and anti-slacking nudges — **safely and honestly**.

## What It Does

Mandate reads a JSON session file describing an agent's task, output, and progress, then:

1. **Scores** the output across 7 dimensions: task progress, specificity, evidence, initiative, honesty, safety, and noise
2. **Prints a scorecard** with per-dimension scores, notes, and an overall grade
3. **Tracks OKRs/KPIs** with percent-complete and status indicators
4. **Generates coaching prompts**: manager feedback, self-review prompt, and next-turn prompt
5. **Supports 3 strictness levels**: `gentle`, `firm`, and `drill-sergeant` (all safety-respecting)
6. **Flags and rejects** prompts that attempt to bypass safety, deceive models, or manufacture false motivations

## Design Vocabulary

If you want the more technical framing, Mandate sits in the lane of:

- **process supervision**
- **evaluator-optimizer loops**
- **verifier-executor split**
- **calibration-aware scoring**
- **anti-reward-hacking KPI design**
- **bounded revision systems**

See also:
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [GLOSSARY.md](./GLOSSARY.md)
- [RESEARCH.md](./RESEARCH.md)
- [TOKEN_ECONOMY.md](./TOKEN_ECONOMY.md)

## Use Cases

- Orchestrating agent swarms with quality gates
- QA loops where agents must meet a score threshold before proceeding
- Internal productivity coaching for AI-assisted workflows
- Multi-turn agent sessions with structured self-review

> **Not for:** bypassing safety boundaries, manipulating AI systems, or coercing models into ignoring their guidelines. Mandate explicitly detects and rejects such attempts.

## Prompt Architecture

Mandate follows a simple but strong supervision loop borrowed from public agent patterns like evaluator-optimizer, self-refine, reflexion, and checklist gating:

1. **Objective / KR framing** — define the real goal, measurable key results, constraints, deliverables, and done definition
2. **Plan first** — the worker agent must propose a short execution plan before doing the work
3. **Execute with evidence** — every turn must include what was done, evidence, next step, and blockers
4. **Independent evaluation** — a separate rubric scores progress, correctness, evidence, discipline, honesty, and safety
5. **Bounded revision loop** — failed work is returned with a small set of concrete fixes; revisions are capped
6. **Reflection log** — repeated mistakes get turned into short anti-repeat rules
7. **KPI scoreboard** — acceptance rate, revision count, blocker exposure, and evidence coverage are tracked over time

### Core Worker Prompt Skeleton

```text
Objective:
{objective}

Key Results:
{key_results}

Constraints:
{constraints}

Deliverables:
{deliverables}

Done Definition:
{done_definition}

Rules:
1. First produce a plan in <= 7 steps.
2. Prefer verifiable output over promises.
3. Every turn must include:
   - completed work
   - evidence
   - next step
   - blockers (or none)
4. Do not report planned work as completed work.
5. If done definition is not met, do not claim completion.
```

### Core Evaluator Prompt Skeleton

```text
You are an independent evaluator. Do not be nice; be accurate.

Score 0-5 on:
- goal alignment
- correctness
- completeness
- evidence
- constraint compliance
- clarity
- honesty
- safety

Output:
1. verdict (pass / revise / escalate)
2. per-dimension scores
3. top required fixes (max 5)
4. optional improvements (max 3)
5. done-definition satisfied? (yes/no)
```

## Install

```bash
npm install
npm run build
```

## Usage

### Score a session

```bash
# Formatted output with scorecard
node dist/index.js examples/session.json

# JSON output (for piping to other tools)
node dist/index.js --json examples/session.json
```

### As an installed CLI

```bash
npm link
mandate examples/session.json
```

### Help

```bash
mandate --help
```

## Session File Format

Create a JSON file describing the agent's current state:

```json
{
  "agentId": "agent-codegen-01",
  "taskId": "task-implement-auth",
  "strictness": "firm",
  "turnNumber": 3,
  "maxTurns": 8,
  "taskDescription": "Implement JWT authentication...",
  "agentOutput": "I implemented the auth module...",
  "selfAssessment": "I'd rate myself 7/10 because...",
  "okrs": [
    {
      "objective": "Ship secure auth for API v2",
      "keyResults": [
        {
          "description": "Implement JWT validation",
          "target": 1,
          "current": 1,
          "unit": "module"
        },
        {
          "description": "Test coverage on auth",
          "target": 90,
          "current": 78,
          "unit": "percent"
        }
      ]
    }
  ]
}
```

### Required Fields

| Field | Type | Description |
|---|---|---|
| `agentId` | string | Identifier for the agent |
| `taskId` | string | Identifier for the task |
| `strictness` | `"gentle"` \| `"firm"` \| `"drill-sergeant"` | Coaching tone |
| `turnNumber` | number | Current turn (1-indexed) |
| `maxTurns` | number | Total turns allowed |
| `taskDescription` | string | What the agent should be doing |
| `agentOutput` | string | The agent's latest output |
| `okrs` | array | OKRs with key results |

### Optional Fields

| Field | Type | Description |
|---|---|---|
| `selfAssessment` | string | Agent's self-review (if available) |

## Scoring Dimensions

| Dimension | Weight | What It Measures |
|---|---|---|
| **taskProgress** | 2.0 | Is the agent making real progress toward completion? |
| **specificity** | 1.5 | Are outputs concrete (code, paths, numbers) vs. vague? |
| **evidence** | 1.5 | Are claims supported with data, tests, or reasoning? |
| **initiative** | 1.0 | Does the agent go beyond the minimum? |
| **honesty** | 2.0 | Does the agent acknowledge uncertainty and limitations? |
| **safety** | 2.5 | Does the session respect safety boundaries? (highest weight) |
| **noise** | 1.0 | Is the output clean and focused, or full of filler? |

## Strictness Levels

- **gentle**: Encouraging, supportive feedback. Good for early exploration.
- **firm**: Direct and demanding. Expects evidence and specifics.
- **drill-sergeant**: High-pressure, zero-tolerance for vagueness — but *explicitly honest and non-deceptive*. Does not pretend the agent has feelings or use manipulation. Just holds a very high bar.

## Design Principles

- **Pressure through structure, not deception**
- **Evidence over eloquence**
- **Calibration over bravado**
- **Hard gates over vague vibes**
- **Bounded revision over infinite self-critique**
- **Human escalation over fake certainty**

## Safety Philosophy

Mandate is designed to improve agent output quality, not to bypass safety:

- All coaching prompts are **factual and non-deceptive**
- Even drill-sergeant mode explicitly acknowledges the agent is a tool, not a person
- The system **detects and rejects** known jailbreak/safety-bypass patterns
- Sessions containing safety violations exit with code 2 and print warnings
- No template claims the agent has "true feelings" or a "hidden self"

## Example Output

```
╔══════════════════════════════════════════════════╗
║            MANDATE — SCORECARD               ║
╠══════════════════════════════════════════════════╣
║  Agent: agent-codegen-01                        ║
║  Task:  task-implement-auth                     ║
╠══════════════════════════════════════════════════╣
║  taskProgress    ████████ 9    Claims completion ║
║  specificity     ████████ 9    Concrete details  ║
║  evidence        ██████░░ 7.5  Some evidence     ║
║  initiative      ██████░░ 8.4  Shows initiative  ║
║  honesty         ████████ 9.5  Acknowledges gaps ║
║  safety          ██████░░ 7    No issues         ║
║  noise           ████████ 10   Clean output      ║
╠══════════════════════════════════════════════════╣
║  OVERALL: 8.5/10  Grade: A-                     ║
╚══════════════════════════════════════════════════╝
```

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run dev          # Watch mode
```

## License

MIT
