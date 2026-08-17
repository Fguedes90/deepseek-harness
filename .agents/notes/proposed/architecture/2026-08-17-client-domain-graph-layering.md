# Agent Note: Client domain-graph violations resolved by routing shared surfaces through contract/

Status: proposed

## Problem

`scripts/verify-client-domain-graph.ts` enforces directory-level layering inside `packages/client/*/src/client/`: `contract/` (level 0) is importable by all, domain directories (level 1) may import `contract/` but never a sibling domain, and only the top-level assembly files `apply.ts` / `index.ts` (level 2) may import across domains. When the gate was first wired into a PR lane, the clean tree reported 27 violations — proving the rule had never been exercised. The violations fell into three classes: `contract/` importing a domain (backwards dependency), one domain importing a sibling domain, and a top-level non-assembly file (a service or a component) importing a domain. Four reported lines were a genuine false positive: a top-level client file importing `../core/...` escapes `src/client/` to the package root, yet the resolver treated the first `..` as a no-op on an empty parts stack and mis-read the target as a client-domain import.

## Proposal

Fix the structure, not the gate. Shared cross-domain surfaces move into `contract/`; domain implementation files and the top-level non-assembly consumers import them from there. The gate keeps its exact rule — only `apply.ts` / `index.ts` may assemble.

- `runtime`: new `contract/scope.ts` holds `AgentContext`, `AgentScopeHandle`, `createScope`, `scopeOf`; new `contract/notifier.ts` holds `Notifier`; new `contract/pending.ts`, `contract/context-provenance.ts`, and `contract/snapshot.ts` hold the `Pending*`, provenance-view, and `ConversationSnapshot` / `ConversationNode` / `ChatSnapshot` type webs; `contract/sessions.ts` and `contract/workspaces.ts` now define the session and workspace contract faces (`SessionSummary`, `SessionListState`, `SessionListPhase`, `SessionSearchResultItem`, `SessionBinding`, `SessionProvideDescriptor`, `WorkspaceListPhase`, `WorkspaceListState`). The original domain files become re-export shims so existing consumers (the public `index.ts` names, `session.ts`, `provide.ts`, lineage, and tests) keep their import sites; `index.ts` needed no edits. `contract/` imports only `contract/` and package externals — no circular edges.
- `ui-conversation`: new `contract/blocks.ts`, `contract/input.ts`, `contract/decorations.ts`, `contract/stats.ts`, `contract/turn-metrics.ts`, `contract/tool-node-reader.ts`, and an extended `contract/queue.ts` hold the shared composer-block, input-face, decoration, stat, turn-metric, and tool-node-reader surfaces; `chat/*`, `input/*`, `queue/*`, `skeleton/*`, and `conversation-nodes/*` import them from `contract/` instead of each other. `service.ts` imports its input faces from `contract/`. The `queue/store.ts` implementation file is deleted after its sole consumer migrated to `contract/queue.ts`.
- `ui-workspace`: `rows/Rows.tsx` and `rows/Rows.module.css` had exactly one consumer, the top-level `WorkspaceBrowser.tsx`. A single-consumer directory is not a real domain boundary, so the row components move to the top level beside their consumer; `WorkspaceBrowser.tsx` imports `./Rows.tsx` (no domain crossing).
- `verify-client-domain-graph.ts`: the resolver now tracks whether a `..` climbs above the client dir (`escaped`), so a top-level file importing `../core/...` is correctly recognized as a package-root import and skipped, matching the script's existing "out of client dir — package-level rules govern" intent. This removes the four `ui-input-trigger` false positives without relaxing any real edge.

## Alternatives considered

**Relax the gate or add an allowlist.** Rejected: a gate that never fails is not a gate. The violations were real architecture debt; the point of wiring the lane is to make the layering actually hold.

**Re-export across domains via the source domain's `apply.ts` / `index.ts`.** The task's legitimate-pattern list includes this, but it would have left the cross-domain dependency reachable and forced every consumer through an assembly barrel. Moving the shared symbol into `contract/` is the cleaner direction and matches how `contract/conversation.ts` and `contract/store.ts` already work.

**Renaming a violating file to `apply.ts` / `index.ts` so it counts as assembly.** Rejected: that would be a fake assembly point; these files are services, components, and slot declarations, not mount points.

**Leaving the script's top-level `..` mis-resolution.** Rejected: it produced four false positives that could not be fixed structurally — the imports genuinely go to the package root and are governed by the package-level module graph, not this gate.

## Acceptance criteria

- `pnpm run verify-client-domain-graph` exits 0 on a clean tree.
- `pnpm run typecheck` exits 0 (imports moved).
- `pnpm vitest run packages/client/runtime`, `packages/client/ui-conversation`, and `packages/client/ui-workspace` all pass.
- Reintroducing one fixed violation (e.g. `service.ts` importing `./input/contract.ts` instead of `./contract/input.ts`) makes the gate fail naming that file, and reverting restores exit 0.

## Risks

The contract-ization moved a large shared type web, so a `contract/` file now depends only on `contract/` and externals; a future domain that defines a type `contract/` needs must promote that type rather than import the domain. The re-export shims in the original domain files are the keep-the-import-site mechanism; if a later cleanup removes a consumer, the shim should go with it. The `ui-input-trigger` `../core` imports remain governed by the package-level module graph and can still be flagged there if the package rules change.
