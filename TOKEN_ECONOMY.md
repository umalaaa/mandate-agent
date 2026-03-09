# Token Economy

Mandate supports low-token supervision so you can manage agents without dragging long chat history forward every turn.

## Core Methods

1. **Delta-only reporting**
   - Report only what changed this turn.
   - Do not restate the whole task every round.

2. **Artifacts over prose**
   - Prefer short refs like `src/auth.ts`, `tests/auth.spec.ts`, `build log ok`.
   - Avoid long narrative status updates.

3. **Evidence refs over dumps**
   - Carry short evidence handles in `evidenceRefs[]`.
   - Keep full logs/tests outside the prompt unless needed.

4. **Bounded output sections**
   - Use fixed sections: delivered | evidence | blocker | next.
   - This keeps agent replies short and machine-checkable.

5. **Compact handoffs**
   - `mandate --handoff` emits a compact context packet for the next turn.
   - This is cheaper than pasting the whole prior exchange.

6. **KR compression**
   - Key results are summarized as DONE / ON TRACK / AT RISK / BEHIND counts.
   - This preserves planning state with very few tokens.

## Recommended Session Fields

Use these fields to save tokens while improving score quality:

- `artifacts[]`
- `evidenceRefs[]`
- `blockers[]`
- `assumptions[]`
- `nextStep`

## Recommended Flow

1. Agent works.
2. Agent reports a compact delta.
3. Mandate scores and emits compact manager feedback.
4. Pass only the `--handoff` packet to the next turn.

## CLI

```bash
mandate examples/session.json
mandate --compact examples/session.json
mandate --handoff examples/session.json
```
