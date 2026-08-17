# Agent Note: Relocate the tool fixture out of the production entry

Status: proposed

## Problem

`packages/core/tools/src/testing.ts` defines `defineContentToolFixture` and `ContentToolFixtureOptions`, and the production entry `packages/core/tools/src/index.ts:107` re-exports both. The fixture is explicitly test-only surface (`@module dsh-tools/testing`, JSDoc "Product tools must declare domain-owned DTOs instead"), but re-exporting it from `index.ts` pulls it into the product package's public API and module graph, so importing `@deepseek-ai/dsh-tools` transitively includes test-only code.

Every consumer is a test. `rg 'defineContentToolFixture'` finds 37 distinct files, every one under a `**/tests/` directory (`.spec.ts`/`.e2e.ts`, plus the `coverage-cases.ts` test helpers in the hooks packages); zero product consumers exist.

The repository already has a home and a rule for this. [the `test-support/README.md` rule](../../../../packages/test-support/README.md) states: "A package moves out of `test-support/` when it gains a product contract and product consumers." `defineContentToolFixture` has no product contract and no product consumers, so by that rule it belongs in `test-support/`, as a separate testkit package — the precedent being `packages/test-support/agent-loop-testkit` (`@deepseek-ai/dsh-agent-loop-testkit`).

## Proposal

Move `defineContentToolFixture` and `ContentToolFixtureOptions` out of `packages/core/tools/src/testing.ts` and out of the `index.ts` re-export, into a new test-support package following the `agent-loop-testkit` shape (e.g. `packages/test-support/tool-testkit` exporting `@deepseek-ai/dsh-tool-testkit`). The fixture's dependency on `defineTool`, `ToolDefinition`, `DefineToolOptions`, and `ParameterSchemaSpec` from `dsh-tools` becomes a peerDependency, exactly as `agent-loop-testkit` peer-depends on `dsh-tools`.

`packages/test-support/README.md` decides between the two candidate homes: pure-test infrastructure lives in `test-support/`, and a `./testing` subpath on the product `dsh-tools` package would keep test-only surface inside a product package's export map and module graph, which the rule's placement of test infra in `test-support/` rejects. The new package is the rule-following destination.

### Mechanical migration

- Create the testkit package with the fixture module; add the `./invariant` companion if the fixture warrants one (it does not — it is a pure helper, so none).
- Remove `export { defineContentToolFixture, type ContentToolFixtureOptions } from './testing.ts'` from `packages/core/tools/src/index.ts:107`, and delete `packages/core/tools/src/testing.ts` (or keep the file only if the package's own suite needs it via a source import — it does not).
- Update all 37 consumer files to import from the new package instead of `@deepseek-ai/dsh-tools`; add the new package as a devDependency to each consumer's workspace package.
- Remove `@deepseek-ai/dsh-tools` from any consumer that imported it solely for the fixture (the specs import `ToolRuntime` too, so most keep `dsh-tools`; the import line alone changes).

## Alternatives considered

### Why not a `./testing` subpath on `dsh-tools`?

A `packages/core/tools/src/testing.ts` already exists and is close to a `./testing` export. But the [test-support rule](../../../../packages/test-support/README.md) places pure-test infrastructure in `test-support/`, and a subpath would keep test-only code coupled to the product package's module graph and public export map — the exact coupling the relocation removes. The subpath also does not give the fixture a devDependency boundary that makes its test-only status explicit to every consumer.

### Why not keep the re-export as-is?

Keeping `defineContentToolFixture` in the production entry is the status quo this note exists to remove: test-only code in the product public API, invisible to tree-shakers that cannot know the fixture is unreferenced by product code. It is not a defensible end state once a test-support home exists.

### Why not delete the fixture entirely?

It is load-bearing for the 37 test files that build deterministic tools over real registries; deleting it would force each spec to hand-roll a tool definition, duplicating the content-as-canonical-value contract in every package.

## Acceptance criteria

- `defineContentToolFixture`/`ContentToolFixtureOptions` are no longer exported from `@deepseek-ai/dsh-tools` and no `testing.ts` lives in the production package.
- The new test-support package exports them; every one of the 37 consumer files imports from it, and each consumer package carries it as a devDependency.
- `pnpm run test` for the affected packages (tools, agent-loop, context, acp, compaction, guard, hooks, host/apiproxy, llm-retry, plan-mode, tool-skill, spill-policy, subagent) passes with the relocated imports.

## Risks

- The mechanical migration touches 37 files across ~20 packages, so it is wide; each devDependency addition is small but must be consistent or the workspace build fails.
- The fixture is tightly coupled to `dsh-tools` types; if those types ever split, the testkit package inherits the same coupling `agent-loop-testkit` already accepts for `dsh-agent`.
