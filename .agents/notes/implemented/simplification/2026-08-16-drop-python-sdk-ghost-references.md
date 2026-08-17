# Agent Note: Drop Python SDK ghost references

Status: implemented

## Problem

The repository tree ships no Python SDK: `git ls-files python` is empty (the on-disk `python/` directory holds only stray `node_modules` residue, untracked), and no Python wheel, `pyproject.toml`, `pytest` suite, or Python runtime carrier exists in tracked source. Yet the prose corpus continued to describe a Python SDK as a live, tested, CI-required consumer: the root `AGENTS.md` "Repository layout" block listed a `python/` path, the `packages/sdk/protocol` module JSDoc asserted that "the Python SDK" drives the wire, roughly twenty implemented Agent Notes named the Python SDK / Python runtime closure / Python runtime manifest as currently shipped, and several process notes treated a required Python SDK unit suite and Python runtime validation as CI dependencies. Those sentences survived the code they described, so a reader following them would search for surfaces that do not exist.

## Decision

Correct the prose that asserts a shipped Python SDK, minimally and in place, leaving historical rationale and design record untouched. Concretely:

- **Root `AGENTS.md`**: the `python/` layout row is absent (already removed by the in-flight staged change); add the missing `apps/` row (the shipped CLI + web products and the user-selectable presets at `apps/cli/config/agent-presets/{standard,minimal,code,cordis}`); correct the `self-modification/` → `extensions/` and `support/` → `test-support/` package-group rows to the real tree per the [repository-naming ledger](../architecture/2026-08-11-repository-naming-contract-and-rename-ledger.md).
- **`packages/sdk/protocol/src/index.ts`** module JSDoc: the SDK client is the TypeScript client; the Python SDK reference is dropped.
- **Agent Notes** (20 files): every current-state claim that a Python SDK / Python runtime closure / Python runtime manifest is shipped, tested, or CI-required is corrected in place — removing the Python SDK from gate enumerations, shipped-composition lists, and required-CI dependency lists. Historical rationale (why a decision was made given a Python client existed), generic language mentions (`python` as a REPL or grammar name), future-backend design that explicitly records the backend does not exist yet, and policy examples are preserved verbatim.

### Correction scope

Corrected (current-state claims about shipped code):

- Provider/model consistency gates, `ctx.agents` wiring, session-log smokes, subprocess-seam composition, and package-regrouping scope no longer name the Python runtime/manifest.
- The owned-run boundary, semantic-session-checkpoints policy mounts, and minimal-preset composition no longer name Python SDK `run()` behavior, finish-reason observation, or a Python SDK tutorial entry point.
- The TS SDK note drops the Python runtime closure dependency-line clause; the max-output-tokens note drops the Python client name (the wire `maxTokens` and the TypeScript SDK remain).
- The persistent bash / str-replace-editor note now names the minimal preset (where those two tools actually ship) instead of the Python runtime closure.
- Four process notes (serial CI, larger-hosted runners, portable required CI, CI failover) drop the Python SDK unit suite / Python runtime validation from required-CI and dependency lists; the generated-third-party-notices note drops the Python runtime from the default loaders; the repository-naming ledger and SDK-toolchain-removal notes state the surviving consumer as the TypeScript SDK client.
- The goal-command note drops the Python SDK runtime-closure sentence.

Preserved (historical rationale / generic / future-backend / policy):

- The web-config-plane note's record that a past rename touched "python" files.
- The code-runtime portable-identifier seam note, which explicitly says "a Python backend does not exist yet".
- Code Mode's future-Python-backend rationale and the Python SDK renderer design, owned by the [Code Mode codegen drop](./2026-08-16-drop-python-code-mode-codegen.md).
- Generic language mentions (persistent-pty REPL, read-card grammar list) and the `PYTHONSTARTUP` env-var name.
- Policy examples (vendor-rescope naming rationale) and historical bug descriptions (documentation-site sidebar).
- Proposed and rejected notes, which record proposals, not shipped state.

### No feature note is fully superseded

Per the added-then-removed rule in `.agents/notes/README.md`, no feature-addition note qualifies for consolidation into this removal note. Every feature note that mentions the Python SDK describes a surface that still ships — the TypeScript SDK client and `dsh-sdk` subagent backend (`2026-07-27-typescript-sdk-and-sdk-subagent-backend.md`), the wire `maxTokens` cap (`2026-07-28-sdk-max-output-tokens.md`), the goal command (`2026-07-19-human-goal-command.md`), and Code Mode (`2026-06-15-code-mode.md`) — with the Python SDK appearing only as a co-consumer or historical motivation, never as the feature itself. The two notes whose subject is entirely the Python SDK client, [recursive Python SDK session notifications](../bug-fix/2026-07-24-recursive-python-sdk-session-notifications.md) and [owned-run finish reason reporting](../bug-fix/2026-08-11-owned-run-finish-reason.md), are **bug-fix** notes, not feature-addition notes, so the feature-note consolidation rule does not cover them; their rationale (Python SDK client behavior) is obsolete with the surface's absence, so there is no feature rationale to fold into this note, and they are preserved rather than deleted.

## Alternatives considered

- **Delete every note that names the Python SDK.** Rejected: it would erase the recorded rationale for decisions still in force (the TS SDK, the wire protocol, CI layout), and the implemented-note rule forbids rewriting a decision. Only current-state facts were corrected.
- **Consolidate and delete the two Python-SDK-only bug-fix notes into this one.** Rejected: they are bug-fix, not feature-addition, notes, so the feature-note consolidation rule does not apply, and nothing in their rationale is future guidance worth preserving as the owner of this removal.
- **Leave the stale CI claims in the process notes.** Rejected: they assert a required Python SDK CI contract that no longer exists, which is exactly the "live, tested, CI-required consumer" the removal corrects.

## Consequences

Bought: prose now matches the tree — no reader is directed to a Python SDK surface that does not exist, the root layout lists every real top-level path, and the SDK JSDoc names only the TypeScript client.

Cost: the Python SDK's design history (its client behavior, its runtime closure, its CI contracts) survives only in archived notes and the two preserved bug-fix notes; the `tool-cordis` catalog line requires a generator rerun (`pnpm run gen-tool-catalog`) to reflect that the cordis preset ships it; and the process notes no longer document a Python CI contract, which CI workflows must be aligned to by the CI-repair effort.
