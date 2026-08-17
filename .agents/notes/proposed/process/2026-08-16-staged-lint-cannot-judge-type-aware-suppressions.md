# Agent Note: The staged lint lane cannot judge type-aware suppressions

Status: proposed

## Problem

The pre-commit `lint (staged)` job runs `scripts/run-oxlint.ts --config .oxlintrc.staged.json` over the staged files. That config sets `"typeAware": false` (`.oxlintrc.staged.json:5`) so the hook stays fast and project-free, while the repository config sets `"reportUnusedDisableDirectives": "error"` (`.oxlintrc.json:8`) and is inherited by the staged config through `"extends": ["./.oxlintrc.json"]`.

The two settings contradict each other. A `// oxlint-disable-next-line typescript/no-misused-promises` comment suppresses a rule that only exists in the type-aware lane; with type awareness off, no diagnostic is produced at that line, so the directive is reported as unused and the hook fails the commit. The suppression is not removable — the repo-wide type-aware `pnpm run lint` needs it and is green with it.

Observed while committing an unrelated deletion: `packages/core/tools/src/index.ts:969` failed the hook with `Unused oxlint-disable directive (no problems were reported)` while `pnpm run lint` passed on the same tree.

The blast radius is not one line. 86 files carry `oxlint-disable` comments, and the rules they suppress are dominated by type-aware ones — 23 `no-unnecessary-condition`, 22 `prefer-promise-reject-errors`, 14 `unbound-method`, 14 `no-misused-promises`, 6 `require-await`, plus the `no-unsafe-*` family. Staging any of those files fails the hook, so the practical outcome is that developers pass `--no-verify` and lose the whitespace and vendor-manifest jobs with it.

## Proposal

Stop inheriting `reportUnusedDisableDirectives` into the type-unaware lane. Set it to `"off"` in `.oxlintrc.staged.json` explicitly, with a comment naming the reason: unused-directive detection is only sound when every rule the directives reference is enabled.

The signal is not lost. Unused suppressions are still an error in the repository config, which runs in CI (`ci.yml` `check:ci:static`) and in `pnpm run lint`, where the type-aware rules are active and the judgement is correct.

## Alternatives considered

- **Enable `typeAware` in the staged config.** Rejected: it requires the TypeScript project graph for the whole repository on every commit, which is the cost the staged lane exists to avoid.
- **Rewrite the suppressions as file-level `oxlint-disable` blocks.** Rejected: file-level directives are also reported as unused, and they widen the suppression from one line to one file.
- **Keep the failure and treat `--no-verify` as the workflow.** Rejected: a hook that must be bypassed to commit ordinary changes stops being a checkpoint, and the bypass silently drops the whitespace and vendor-manifest jobs that share it.
- **Filter the diagnostic inside `scripts/run-oxlint.ts` for staged invocations.** Rejected: it hides a real diagnostic class behind a wrapper instead of configuring the lane honestly, and `scripts/oxlint-contract.spec.ts` would then pin wrapper behavior rather than the linter's.

## Acceptance criteria

- Staging a file whose only lint annotation is a type-aware suppression commits with hooks enabled.
- `pnpm run lint` still fails when a genuinely unused suppression is introduced (inject one, observe red naming the file, revert, observe green).
- `pnpm exec vitest run scripts/oxlint-contract.spec.ts` passes, including the staged-selection cases.

## Risks

- A suppression for a rule that exists in *both* lanes and has become unused now goes unreported until the full lint runs. That is the pre-push and CI boundary rather than the commit boundary, so the feedback is later, not absent.
- `scripts/oxlint-contract.spec.ts` currently asserts the staged config's inherited behavior in the `accepts an ignored-only staged selection` and `keeps staged validation project-free while preserving source rules` cases; both need re-reading against the new setting rather than mechanical updating.
