# Agent Note: The staged lint lane cannot judge type-aware suppressions

Status: implemented

## Problem

The pre-commit `lint (staged)` job runs `scripts/run-oxlint.ts --config .oxlintrc.staged.json` over the staged files. That config sets `"typeAware": false` (`.oxlintrc.staged.json:5`) so the hook stays fast and project-free, while the repository config sets `"reportUnusedDisableDirectives": "error"` (`.oxlintrc.json:8`) and is inherited by the staged config through `"extends": ["./.oxlintrc.json"]`.

The two settings contradict each other. A `// oxlint-disable-next-line typescript/no-misused-promises` comment suppresses a rule that only exists in the type-aware lane; with type awareness off, no diagnostic is produced at that line, so the directive is reported as unused and the hook fails the commit. The suppression is not removable — the repo-wide type-aware `pnpm run lint` needs it and is green with it.

Observed while committing an unrelated deletion: `packages/core/tools/src/index.ts:969` failed the hook with `Unused oxlint-disable directive (no problems were reported)` while `pnpm run lint` passed on the same tree.

The blast radius is not one line. 86 files carry `oxlint-disable` comments, and the rules they suppress are dominated by type-aware ones — 23 `no-unnecessary-condition`, 22 `prefer-promise-reject-errors`, 14 `unbound-method`, 14 `no-misused-promises`, 6 `require-await`, plus the `no-unsafe-*` family. Staging any of those files fails the hook, so the practical outcome is that developers pass `--no-verify` and lose the whitespace and vendor-manifest jobs with it.

## Decision

The staged lane does not inherit `reportUnusedDisableDirectives` from the repository config. `.oxlintrc.staged.json` sets it to `"off"` explicitly at the same `options` nesting level as `typeAware` (`.oxlintrc.staged.json:6`). The config format has no comment mechanism, so the reason lives in this note and in the spec case that pins the setting: unused-directive detection is only sound when every rule the directives reference is enabled, which the staged lane's `typeAware: false` cannot guarantee.

The signal is not lost. Unused suppressions are still an error in the repository config (`.oxlintrc.json:8`), which runs in CI (`ci.yml` `check:ci:static`) and in `pnpm run lint`, where the type-aware rules are active and the judgement is correct.

## Verification

The behavior is pinned by `scripts/oxlint-contract.spec.ts`, whose 15 cases pass under `pnpm exec vitest run scripts/oxlint-contract.spec.ts --testTimeout 30000` (the default 5s timeout is too short for the two `--fix` double-pass cases).

- The `keeps type-aware suppression judgement out of the staged lane` case asserts `.oxlintrc.staged.json` carries `options.reportUnusedDisableDirectives: "off"` and that a probe file whose only annotation is `// oxlint-disable-next-line typescript/no-misused-promises` lints clean (exit 0, no `Unused oxlint-disable directive`). The case fails if the staged lane ever re-enables the option.
- The existing `accepts an ignored-only staged selection` and `keeps staged validation project-free while preserving source rules` cases did not assert the inherited setting; they are unchanged.
- Direct probe: `pnpm exec tsx scripts/run-oxlint.ts --config .oxlintrc.staged.json packages/core/tools/src/index.ts` (carries the type-aware suppression at line 969) exits 0 with no `Unused oxlint-disable directive` line.
- The sound signal survived where it applies: injecting `// oxlint-disable-next-line eqeqeq` above a clean line in that file produced `packages/core/tools/src/index.ts:969:5: error: Unused oxlint-disable directive (no problems were reported).` and `:970:5: error: Unused oxlint-disable directive` under `pnpm run lint:contracts-ready` (exit 1); reverting the injection made the same run exit 0.

## Alternatives considered

- **Enable `typeAware` in the staged config.** Rejected: it requires the TypeScript project graph for the whole repository on every commit, which is the cost the staged lane exists to avoid.
- **Rewrite the suppressions as file-level `oxlint-disable` blocks.** Rejected: file-level directives are also reported as unused, and they widen the suppression from one line to one file.
- **Keep the failure and treat `--no-verify` as the workflow.** Rejected: a hook that must be bypassed to commit ordinary changes stops being a checkpoint, and the bypass silently drops the whitespace and vendor-manifest jobs that share it.
- **Filter the diagnostic inside `scripts/run-oxlint.ts` for staged invocations.** Rejected: it hides a real diagnostic class behind a wrapper instead of configuring the lane honestly, and `scripts/oxlint-contract.spec.ts` would then pin wrapper behavior rather than the linter's.

## Consequences

- A suppression for a rule that exists in *both* lanes and has become unused goes unreported at commit time; it surfaces at the pre-push and CI boundary (`pnpm run lint`, `check:ci:static`) where the type-aware judgement is correct. The feedback is later, not absent.
- The staged lane's contract is explicit and pinned: it validates formatting and non-type-aware rules, and never treats a directive as unused while it cannot evaluate every referenced rule.
