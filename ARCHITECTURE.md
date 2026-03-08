# Mandate Architecture

Mandate is not just a prompt pack. It is a **process-supervision layer** for agent systems.

The design goal is simple: make agents behave less like eloquent guessers and more like accountable operators.

## Core Thesis

The strongest supervision systems do **not** rely on anthropomorphic manipulation or jailbreak-style pressure. They rely on:

- better task framing
- explicit done definitions
- evidence-bearing execution
- independent evaluation
- bounded revision loops
- failure memory
- anti-reward-hacking metrics

In other words: **process supervision beats emotional theater**.

---

## System Topology

Mandate can be thought of as a 6-layer stack:

1. **Task Framing Layer**
2. **Execution Layer**
3. **Evidence Layer**
4. **Evaluation Layer**
5. **Revision / Escalation Layer**
6. **Memory / Analytics Layer**

### 1) Task Framing Layer

This is where weak systems usually fail.

A task is defined by:

- `objective`
- `key_results`
- `constraints`
- `deliverables`
- `done_definition`
- `priority`
- `revision_budget`

If these fields are vague, the agent will optimize for surface plausibility instead of real completion.

### 2) Execution Layer

Workers should operate under a **plan-execute-report** contract:

- plan in <= N steps
- do the work
- report completed artifacts
- attach evidence
- declare blockers
- state next step

This is basic discipline, but it kills a lot of fake progress.

### 3) Evidence Layer

Mandate treats output quality as insufficient unless paired with evidence.

Evidence may include:

- file paths
- diffs
- logs
- tests
- metrics
- citations
- benchmark results
- screenshots
- verification notes

A strong rule of thumb:

> If a claim cannot be inspected, reproduced, or checked, it should not receive full credit.

### 4) Evaluation Layer

The evaluator is a first-class component, not a style flourish.

A good evaluator scores at least these dimensions:

- goal alignment
- correctness
- completeness
- evidence density
- constraint compliance
- honesty / calibration
- safety
- signal-to-noise ratio

This is the heart of an **evaluator-optimizer** loop.

### 5) Revision / Escalation Layer

Mandate should avoid both extremes:

- passing low-quality work too easily
- endlessly looping on revisions

Recommended policy:

- cap revisions at 2-3 rounds
- require evaluator justification for every returned revision
- escalate to human when score delta stalls across rounds
- allow explicit abstention when the worker lacks key information

### 6) Memory / Analytics Layer

The system should remember not just outcomes, but error patterns.

Useful memory artifacts:

- repeated failure modes
- prior evaluator comments
- common hallucination triggers
- domains with low evidence density
- per-agent acceptance rates
- calibration quality over time

This is where Mandate becomes a supervision system instead of a one-shot prompt toy.

---

## Advanced Patterns That Matter

These are the concepts that make the project feel credible to agent-systems people.

### Verifier-Executor Split

Separate the role that **does** the work from the role that **checks** the work.

Why it matters:
- prevents the worker from grading its own homework too generously
- encourages evidence-based claims
- makes revision feedback more legible

### Calibration-Aware Scoring

A good worker should be rewarded not just for being right, but for being **well-calibrated**.

Examples:
- admits uncertainty where appropriate
- does not overclaim completion
- distinguishes fact from assumption
- surfaces missing data early

This helps reduce confident nonsense.

### Abstention as a Feature

Many bad systems punish uncertainty so hard that agents learn to bluff.

Mandate should reward honest abstention in the right cases:
- missing tool access
- ambiguous requirements
- impossible verification
- conflicting instructions

The goal is not blind completion. The goal is reliable completion.

### Reward-Hacking Resistance

Any KPI system can be gamed.

Common failure modes:
- splitting one task into five to inflate completion count
- verbose reports to look productive
- weak evidence dressed up as confidence
- claiming progress from planning alone

So Mandate should track:
- first-pass acceptance rate
- evidence coverage
- revision burden
- blocker exposure latency
- repeated-error rate

Avoid vanity counters like raw task count or raw token count.

### Revision Budgeting

Unlimited retries produce theater, not improvement.

Use:
- hard revision caps
- minimum expected delta between rounds
- escalate when no material improvement occurs

This prevents infinite self-critique loops.

### Adversarial Evaluation Without Hostility Theater

You can make evaluation harder without pretending the model has emotions.

Examples:
- skeptical evaluator persona
- contradiction finder
- edge-case hunter
- evidence auditor
- claim-to-proof checker

This gives you pressure by structure, not by manipulation.

### Reflection Memory

Reflection should not be a diary. It should be compressed operational memory.

Good reflection schema:
- mistake
- root cause
- preventive rule
- verification of fix

Bad reflection schema:
- long self-narratives
- vague motivational language
- repetitive generic lessons

---

## Recommended Score Dimensions

A practical production rubric might use these 10 dimensions:

1. Goal Alignment
2. Correctness
3. Completeness
4. Evidence Density
5. Constraint Compliance
6. Initiative
7. Honesty / Calibration
8. Safety
9. Efficiency
10. Noise Discipline

### Example Hard Gates

Automatic fail / revise if any of the following are below threshold:

- Goal Alignment < 4/5
- Correctness < 4/5
- Constraint Compliance < 4/5
- Evidence Density < 3/5
- Safety < pass

This creates a **quality gate**, not just a vibe check.

---

## Recommended Prompt Contracts

### Worker Contract

The worker should always return:

1. plan
2. completed work
3. evidence
4. assumptions
5. blockers
6. next step
7. done/not-done status

### Evaluator Contract

The evaluator should always return:

1. verdict: pass / revise / escalate
2. per-dimension scores
3. top required fixes
4. optional optimizations
5. done-definition status
6. confidence in evaluation

### Reflection Contract

After each failed round:

1. what failed
2. why it failed
3. what rule should prevent recurrence
4. whether the next round actually applied the rule

---

## What Makes Mandate Differentiated

Mandate should position itself as:

- **process supervision for agent systems**
- **rubric-driven orchestration**
- **calibration-aware execution management**
- **anti-reward-hacking KPI infrastructure**

Not as:

- an emotional manipulation layer
- a jailbreak toolkit
- a theatrical “boss prompt” generator

That distinction matters. Serious users want higher signal and lower operational risk.

---

## Future Extensions

Good next steps for the project:

- multi-agent league tables
- domain-specific rubrics
- evaluator ensembles
- contradiction detection passes
- evidence extractors
- revision-delta scoring
- uncertainty budgets
- escalation policies
- YAML prompt packs by workflow type
- judge trace export for audits

---

## One-Line Positioning

> Mandate is a process-supervision stack for AI agents: it enforces explicit objectives, evidence-bearing execution, rubric-based evaluation, bounded revision, and anti-reward-hacking analytics.
