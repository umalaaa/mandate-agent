# Mandate Glossary

A compact glossary for the terms that make sense in agent-systems circles.

## Process Supervision
Supervising not just final answers, but the workflow that produces them: planning, evidence, revision, escalation, and reflection.

## Evaluator-Optimizer Loop
A two-stage pattern where one component produces work and another scores it against a rubric, returning targeted corrections until a threshold is met.

## Verifier-Executor Split
Separating the worker from the checker so the system does not rely on self-grading alone.

## Calibration
How well confidence matches reality. A calibrated agent admits uncertainty when uncertainty is warranted.

## Evidence Density
How much of an output is backed by inspectable proof: tests, logs, file paths, citations, metrics, diffs, or reproductions.

## Constraint Compliance
Whether the output actually respects the defined scope, format, safety bounds, deadlines, or other task constraints.

## Done Definition
The explicit conditions that must be true before a task may be marked complete.

## Revision Budget
The maximum number of improvement rounds allowed before escalation or termination.

## Reward Hacking
When the system optimizes for the metric instead of the mission. Example: inflating task count instead of delivering value.

## First-Pass Acceptance Rate
How often a worker clears evaluation without requiring revisions. Strong signal for useful output quality.

## Blocker Exposure Latency
How long an agent waits before revealing that it is stuck, missing context, or unable to verify something.

## Reflection Memory
A compact store of prior mistakes, causes, and prevention rules that can be reused in later runs.

## Quality Gate
A non-negotiable pass/fail threshold on key rubric dimensions.

## Abstention
The choice to explicitly say “I cannot verify/complete this under current conditions” instead of bluffing.

## Judge Ensemble
Multiple evaluators with different perspectives, such as correctness, completeness, risk, or brevity, whose outputs are aggregated.

## Critique Token Budget
A limit on how much critique the system can emit before it must either pass, fail, or escalate. Prevents endless loops.

## Revision Delta
The measured improvement between revision rounds. If delta stagnates, escalate instead of looping.

## Signal-to-Noise Ratio
How much of the output is actually useful information versus filler, hedging, or ceremonial assistant language.

## Capability Routing
Sending tasks to different models, prompts, or evaluators based on task type, difficulty, or risk.

## Escalation Policy
The rule set that determines when the system stops retrying and hands work to a human or a different workflow.
