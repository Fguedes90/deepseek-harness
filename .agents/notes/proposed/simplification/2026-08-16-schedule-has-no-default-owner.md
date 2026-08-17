# Agent Note: Schedule has no default owner

Status: proposed

## Problem

`@deepseek-ai/dsh-schedule` (`packages/schedule/schedule`) is a complete durable-reminder engine: 2,003 source lines and 2,270 test lines across `domain.ts` (807), `runtime.ts` (324), `tools.ts` (467), `types.ts` (221), plus `invariant.ts`, `persistence.ts`, `transaction.ts`, and `index.ts`. It registers the model-facing `schedule_create`/`schedule_list`/`schedule_delete` tools, owns a `ScheduleRuntime`, persists a durable `schedule/change` event folded from the session log, and ships its own transaction and persistence modules and an invariant companion.

Yet no shipped composition mounts it. It is absent from `packages/bundle/base/cordis.patch.yml`, `packages/bundle/headless/cordis.patch.yml`, and `packages/bundle/web-app/cordis.patch.yml` (the only "schedule" token there is the unrelated `scheduledDelayMillis` telemetry tunable), and absent from all four `apps/cli/config/agent-presets/{code,cordis,minimal,standard}/agent.cordis.yml`, each of which mounts `tool-goal`, `plan-mode`, `workflow-worker-thread`, `tool-ralph`, `tool-todo`, and `tool-jobs` explicitly. Its only production reachability is the opt-in overlay `examples/web-schedule/cordis.yml` (a nine-line patch applied as `dsh web --patch examples/web-schedule/cordis.yml`) and an unused `dependencies` line for `@deepseek-ai/dsh-schedule` in `apps/cli/package.json:68`. `apps/web/tests/schedule-after.e2e.ts` (545 lines) exercises the engine end to end, keyless, through that overlay.

So a substantial, tested engine ships with no owning decision about how it reaches users. The [harness-level-loop note](../../implemented/feature/2026-07-16-harness-level-loop.md) records "No time scheduler — interval `/loop`, cron, proactive maintenance, and cloud or desktop scheduling are outside this decision", so the question is deliberately not owned there; no other note owns it either. The cost of leaving it undecided is that every future reader must rediscover the gap, the unused CLI dependency looks like an accident, and no surface reflects an intentional stance.

## Proposal

Resolve the three-way product decision and record it as an Agent Note that owns the question. The three candidate resolutions:

1. **Default-wire it into a shipped profile** — mount the plugin and tools in a base or web-app bundle and/or one agent preset, so `schedule_create`/`schedule_list`/`schedule_delete` reach the model in a shipped surface.
2. **Record it as deliberately opt-in-only** — keep `examples/web-schedule/cordis.yml` as the mounted reference and the CLI dependency as the dependency a custom composition needs, and state that shipped surfaces deliberately do not mount Schedule. This is the precedent the [session-search decision](../../implemented/feature/2026-08-02-session-search-not-shipped-default.md) set for a capable tool family the product chose not to default.
3. **Delete the package** — remove `packages/schedule/schedule`, the CLI dependency, the overlay, and the e2e, treating the engine as not worth the shipped surface it would claim.

This note does not pick; the evidence each option needs and the cost of not deciding are below.

### Evidence each option needs

- **Default-wire:** a product owner names the shipped surface (TUI/Web/headless or a preset), and the tool-roster and prompt-delta against the current twenty-tool base are measured; the durable-reminder follow-up must be shown not to conflict with the goal-round driver's ownership of the idle continuation turn (Schedule queues a follow-up when a root agent is idle, the same quiescent point the goal driver uses).
- **Opt-in-only:** the CLI dependency is confirmed genuinely unused by any shipped composition (it is — see the absence above), and `examples/web-schedule/cordis.yml` plus the e2e are declared the kept reference, mirroring how the ACP `session-query.cordis.yml` example and its snapshot pin the session-search stance.
- **Delete:** the durable-reminder capability is confirmed unwanted as a product direction (contradicting the harness-level-loop note's "It belongs with a scheduler rather than either goal family" deferral), and the e2e is removed with it.

## Alternatives considered

- **Leave it undecided** — rejected as the status quo this note exists to close: an unowned engine, an accidental-looking dependency, and no intentional stance for readers to rely on.
- **Fold the decision into the harness-level-loop note** — rejected because that note records a decision that explicitly excludes scheduling; appending a later three-way product call would edit it into a different decision, which the note-format rules forbid. A new note that cross-links it is the correct home.
- **Delete now, decide later** — rejected because deletion is irreversible and the harness-level-loop note names scheduling as a live direction; deleting first and reconsidering later discards a tested engine to save a decision that recording opt-in-only already settles cheaply.

## Acceptance criteria

- A decision is recorded with an explicit owner and a chosen option from the three above.
- If opt-in-only: the CLI dependency and `examples/web-schedule/cordis.yml` remain, the e2e remains green, and the note states the kept reference explicitly (the session-search shape).
- If default-wire or delete: the code, dependency, overlay, and e2e change together in one change, and this note moves to `implemented/` describing what shipped.

## Risks

- **Default-wire** risks changing every shipped surface's tool roster and prompt, which is a product-surface decision that needs product buy-in; it also makes Schedule's idle-time follow-up compete with the goal-round driver for the quiescent continuation.
- **Delete** risks throwing away a complete, tested capability that the harness-level-loop note explicitly defers to a scheduler; reintroducing it later is a full rebuild.
- **Opt-in-only** risks the capability staying invisible enough that no one exercises it outside the e2e, but that is exactly the session-search precedent's accepted trade-off.
