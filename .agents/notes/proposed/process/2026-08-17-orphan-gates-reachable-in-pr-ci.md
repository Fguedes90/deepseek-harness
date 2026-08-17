# Agent Note: Orphan gates reachable in PR CI

Status: proposed

## Problem

A quality gate that no pull-request workflow runs is not a gate: it can be red on a clean `master` head indefinitely because nobody's merge verdict ever observes it. The codebase already treats enforced gates over prose guidelines as the reliable path ([Mechanical quality gates over prose guidelines](../../implemented/process/2026-06-11-quality-gates.md)); this record extends that principle to the gate topology itself. `scripts/run-gates.ts` defined gates in modes that no workflow invoked, so the category existed undetected. Three static leaves were reachable only through the local `check:all` aggregate or the `hygiene` script, which no CI workflow runs. Any future gate added to a local-only mode would silently join the same category unless a sensor made the gap loud.

## Proposal

`ciSharedStaticGates()` is the natural home for static gates that need no built `lib/` tree: it feeds the required `ci-static` lane (`node-24` job) and the Windows observational lanes. Three static leaves move there: `rescope-vendor:check`, `verify-vendored-links`, and `verify-client-domain-graph`. All three scan source, manifests, and the lockfile directly and do not import built artifacts, so the static lane executes them without a build step. `verify-vendored-links` also joins `hygieneLeafGates()` so the local `check:all` aggregate stays the complete hygiene set.

`scripts/ci-workflow.spec.ts` gains a sensor that closes the category: it derives the set of reached modes from the `run:` commands in `.github/workflows/ci.yml` and `.github/workflows/docs-pages.yml`, maps those to `gatesForMode` output, and compares it with the union of every gate across every mode. The `windows` job runs `wine-windows-gates.sh`, which executes the `ci-windows-blocking` surfaces, and `ci-consumers` nests the `ci-lint-contracts-ready` mode through its lint-and-duplication gate; both count as reached. `node-compat`'s matrix runs a 22.19 leg and a 26 leg, so both branches' gates are reachable even though `gatesForMode` returns only one branch under the test runner's own Node major.

The difference is asserted empty. Two gates are legitimately absent from PR CI and sit in a small explicit allowlist: `typert-contracts` (the same host compile `build:lib:host` runs in the required consumers lane via the `build` gate) and `test` (required `ci-coverage` instruments the same suites, so a bare `test` gate in a required lane would only re-run them).

## Acceptance criteria

Every gate defined in `gatesForMode` for any mode is either run by a workflow-invoked lane or listed in the sensor's allowlist with a reason that still holds. `pnpm vitest run scripts/ci-workflow.spec.ts` passes. Adding a gate to a mode no workflow invokes fails the spec and names the gate; removing it restores green. `pnpm run check:ci:static` and `pnpm run typecheck` run to completion.

## Alternatives considered

### Why not leave the sensor to list reached modes by hand?

A hardcoded reached-mode list rots silently when a lane is renamed or removed, which would let the very orphans the sensor exists to catch pass through. Deriving the set from the workflows' `run:` commands keeps the sensor honest: a mode is reached only when a workflow fact currently makes it so. The transitive and version-gated cases (`ci-lint-contracts-ready` via `ci-consumers`, the `node-compat` matrix branches) are documented because they cannot be read directly off a single `run:` line.

### Why not wire the allowlisted gates into a required lane?

`typert-contracts` duplicates the host compile already performed by the required consumers `build` gate, and `test` re-runs the suites required `ci-coverage` instruments. Adding either to a second lane would cost wall-clock time and duplicate work for no new signal, which the no-duplication rule for gates forbids. An allowlist with a concrete reason is cheaper and safer than a redundant execution.

## Risks

The sensor compares gate identities, so a check that changes meaning while keeping the same id, or a mode that adds a gate which another required lane already covers under a different id, stays silent. The allowlist is the escape hatch: it must stay small and every entry must state a reason, so an entry without a durable justification reads as drift. The three wired gates also run in the Windows observational lanes, where a platform-only failure is reported as observational rather than blocking; that is existing architecture, not a reduction in the required Linux verdict.
