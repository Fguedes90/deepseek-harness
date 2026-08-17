# Agent Note: Demote web-search-exa to a test dependency

Status: proposed

## Problem

`@deepseek-ai/dsh-web-search-exa` (`packages/web/web-search-exa`) has no cordis mount in any shipped bundle: a search of `packages/bundle` for `web-search-exa` returns nothing. Its only production-corpus reference is a `devDependencies` entry in `packages/web/tool-web/package.json`, consumed solely by that package's own real-network integration test `packages/web/tool-web/tests/integration.spec.ts`, which mounts the Exa provider (`ctx.plugin(WebSearchExa, { apiKey: 'exa-key', baseURL: 'https://api.exa.test' })`) with the network boundary stubbed. Meanwhile the one provider actually wired into a shipped surface is `web-search-deepseek` (`searchProvider: deepseek-official` in `packages/bundle/base/cordis.patch.yml:407-413`). Exa's own `exa.e2e.ts` self-skips without `$EXA_API_KEY`.

This PR deletes the sibling `@deepseek-ai/dsh-web-search-perplexity` outright (see the [drop-unmounted-provider-packages note](../../implemented/simplification/2026-08-16-drop-unmounted-provider-packages.md)), so the two unmounted search providers diverge in treatment and that divergence deserves a recorded rationale.

## Proposal

Confirm the current state as the minimal correct move, then gate full deletion on a test migration.

The demotion to `devDependencies` is already complete: `@deepseek-ai/dsh-web-search-exa` sits in the `devDependencies` block of `packages/web/tool-web/package.json`, not `dependencies`, and the only consumer is the integration spec. No further change is required to reach the minimal correct dependency posture.

What remains undecided is full deletion. The precondition for it: `packages/web/tool-web/tests/integration.spec.ts` must first move its search half from the Exa provider to `web-search-deepseek` or to a local stub provider, because that integration test is the seam's only real search-provider coverage besides the shipped DeepSeek provider. Once the test no longer imports Exa, delete the package, its `devDependencies` entry, its own tests, and the `knip.json` workspace entry for `packages/web/web-search-exa`.

### Why Exa gets a different verdict than Perplexity

Perplexity is referenced by nothing — no bundle, no test, no dependency — so deleting it outright loses no coverage. Exa is referenced by the integration spec, which is the shipped seam's sole non-DeepSeek real-network search integration; deleting Exa before that test migrates would silently remove that coverage. The demotion to a devDependency (already true) is the minimal state that keeps the coverage while confirming the provider is not a production dependency.

## Alternatives considered

- **Delete Exa outright now** — rejected because it would remove the integration spec's search coverage before a replacement exists; the spec would have to migrate in the same change, widening blast radius and forcing the test rewrite before the package is proven unnecessary.
- **Mount Exa as a production provider** — rejected because the shipped surface already selects `deepseek-official`; mounting a second provider with no product consumer re-creates the very "unmounted provider" problem this note removes.
- **Move the integration test off Exa first, then delete** — this is the proposed precondition made into a single change. It is the eventual path but is heavier than the current minimal state, so it is deferred until a maintainer wants the package gone.

## Acceptance criteria

- `packages/web/tool-web/package.json` keeps `@deepseek-ai/dsh-web-search-exa` in `devDependencies` (unchanged).
- Full deletion, when it happens: the integration spec imports `deepseek` or a stub provider, the package tree, the devDependency, and the `knip.json` entry for `packages/web/web-search-exa` are removed, and the `tool-web` integration suite stays green.

## Risks

- Keeping Exa as a devDependency indefinitely lets a provider with no production consumer linger; its real-network e2e still needs `$EXA_API_KEY` and self-skips otherwise, so CI never exercises it.
- Migrating the integration test to DeepSeek couples the seam's test coverage to the one provider a real key exercises; if that is undesirable, the stub-provider route keeps coverage deterministic.
