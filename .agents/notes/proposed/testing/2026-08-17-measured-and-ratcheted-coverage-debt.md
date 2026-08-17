# Agent Note: Measured and ratcheted coverage debt

Status: proposed

## Problem

`vitest.config.ts` `coverage.exclude` accumulated ~73 entries, about 60 of them marked `TODO(gui): cover and remove`. An entry in `exclude` makes a file invisible: not instrumented, absent from every report, undetected when the debt is paid. The list grew 15% in two weeks with two commits titled literally `ci: skip` — an open pressure valve in the repo's strongest gate (global per-file 100%).

The obvious fix does not work. A vitest glob threshold does NOT exempt a file from the global `thresholds.perFile:100`: moving a debt file out of `exclude` into `thresholds` still fails on the global threshold (verified empirically with vitest 4 — `ERROR: Coverage for lines (33.33%) does not meet global threshold (100%) for src/b.ts`). So sub-100% debt cannot live in the main gate at all.

## Proposal

Split coverage into two executions from one config (switched by `DSH_COVERAGE_DEBT_LANE`):

1. **Main gate** (`test:coverage`, unchanged standard): global per-file 100%. `exclude` holds only permanent, justified entries (types/bin/worker, oxlint-contract probe residue, api/remotes generated imports, typert generator, platform-conditioned spreads). Debt globs are excluded here only so the 100% gate stays reachable — they are no longer invisible, because the debt lane measures them.
2. **Coverage-debt lane** (`DSH_COVERAGE_DEBT_LANE=1 vitest run --coverage`, `coverage-debt` gate): `coverage.include` is the debt globs only, global floor 0 (debt files pass the aggregate), plus one per-file glob threshold per debt file at its real measured value. It FAILS when a debt file drops below its locked value.
3. **Ratchet** (`scripts/verify-coverage-debt.ts`, `verify-coverage-debt` gate): reads the lane's `coverage/debt/coverage-summary.json`. Fails when real > declared (raise the number by reviewed edit; debt only ratchets up), fails when a file hits 100% (delete the entry — it returns to the global 100% regime), and fails on dead or duplicated/contained debt globs. No autoUpdate.

`scripts/coverage-debt.ts` is the single source of truth consumed by both the config and the ratchet, so the gate and the ratchet cannot drift.

## Plan

- Rewrite the `coverage` block in `vitest.config.ts` with the `debtLane` branch; classify each former exclude entry PERMANENTE / DÍVIDA / MORTA; delete MORTA (`packages/self-modification` — renamed to `packages/extensions/`).
- Measure every debt file's real coverage via the debt lane; write the numbers into `scripts/coverage-debt.ts`.
- Enumerate debt entries from the MAIN gate's `coverage-summary.json`, never from a scoped-include lane report: a file absent from a scoped report is uninstrumented, not covered, and reading absence as 100% drops it from the table while leaving it below the global threshold.
- Add `coverage-debt` and `coverage-debt-ratchet` gates to `coverageGates()` in `run-gates.ts`; add `verify-coverage-debt` package script.

## Acceptance criteria

- `pnpm run test:coverage` EXIT=0 and `pnpm exec tsx scripts/verify-coverage-debt.ts` EXIT=0 with real measured numbers.
- Ratchet fails when a declared value is lowered (real > declared), when a file reaches 100% still declared, and when a dead/duplicate glob is present.
- Removing a covering test line still fails the main coverage gate.
- `pnpm run typecheck` EXIT=0.

## Alternatives considered

**Per-file glob thresholds inside the main gate.** Rejected empirically: a glob threshold narrows a file's requirement but does not exempt it from `thresholds.perFile`, so a sub-100% file fails the global threshold regardless (§ Problem).

**Keep `exclude`, add a review rule.** Rejected: an excluded file is uninstrumented, so no gate can observe when the debt grows or when it is paid. The valve stays open and only the review discipline changes.

**`thresholds.autoUpdate`.** Rejected: it rewrites the declared numbers to whatever the run measured, which makes a coverage drop self-approving — the opposite of a ratchet.

## Risks

The debt lane runs the full test suite a second time (scoped instrumentation), roughly doubling coverage-lane wall clock. Acceptable: it is the only honest measurement of debt, and the ratchet is what closes the valve. Files at exactly 0% (never imported) will surface as "real 100% is false" — they must be deleted, not bolted to a test.
