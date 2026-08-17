# Agent Note: drop the Python Code Mode SDK codegen

Status: implemented

## Problem

The `py-types.ts` module in `@deepseek-ai/dsh-tools` exported `jsonSchemaToPy` and `renderToolsSdkPy`, the Python projection of the Code Mode tool SDK, reachable only when a `CodeRuntime` provider reports `language: 'python'`. The repository ships one provider, `dsh-code-runtime-worker-thread` (TypeScript); `language: 'python'` appears in zero `cordis.yml`, zero preset, zero app. The `python` rows of the language→renderer table (`SDK_RENDERERS` in `index.ts`) and the `run_code` schema-flavor table (`RUN_CODE_FLAVORS` in `code-mode.ts`) were therefore dead at runtime — the [language-dispatch note](../feature/2026-07-31-code-mode-language-dispatch.md) already recorded that no assembled application could select them.

## Decision

`py-types.ts` and its spec (`tests/py-types.spec.ts`) are deleted, and the `python` branch of both language tables is removed. Code Mode ships only the TypeScript SDK. An unknown runtime language still fails loud at the earliest resolvable point: `requireCodeRuntime` rejects any `language` not in `SDK_RENDERERS`, naming the known set, and `resolveFlavor` rejects any `language` not in `RUN_CODE_FLAVORS`, the same guard shape as before.

The dispatch mechanism is retained, not collapsed to a bare constant. `CodeSdkLanguage` narrows to `'typescript'` and both tables stay `Record<string, …>` with `satisfies Record<CodeSdkLanguage, …>`. The union is the load-bearing extension seam: adding a language later is adding a union member, two table rows, and a renderer — three parallel edits plus prose — exactly the "adding a row, not redesigning" contract the [language-dispatch note](../feature/2026-07-31-code-mode-language-dispatch.md) documents. `requireCodeRuntime`'s loud guard reads that same table to name the known languages, so one source of truth feeds both the assembly and the rejection. This follows the [Code Mode foundation note](../feature/2026-06-15-code-mode.md)'s decision that language and substrate are backend properties resolved at prompt assembly.

## Capability given up

A Python Code Mode SDK must be rebuilt with its runtime: a future `language: 'python'` backend ships its own renderer (a sibling of `ts-types.ts`) and re-adds the union member and two table rows. The deferred work the [language-dispatch note](../feature/2026-07-31-code-mode-language-dispatch.md) recorded as owed by that backend — binding exactly `tools` and `ToolCallError` and not the declared class names, binding the language to the request, and the CPython floor including the renderer's Unicode-table skew — remains that backend's to own.

## Alternatives considered

- **Collapse both tables to bare `typescript` constants.** Rejected: the `satisfies`-checked `Record<CodeSdkLanguage, …>` tables are the compile-time extension seam (a language added to one table and not the other fails `typecheck`) and the source the loud guard reads to name known languages. A bare constant would make adding a second language a redesign, reintroducing the coupling that currently prevents drift.
- **Keep the Python codegen for a future backend.** Rejected: it is dead code under the only shipped provider, and the pre-release stance prefers deleting over maintaining unreachable surface. This note and the language-dispatch note preserve the design rationale for a rebuild.

## Consequences

Bought: ~818 lines of source plus its spec and the Python branches of two dispatch tables are gone; Code Mode now presents exactly what ships (TypeScript), and the runtime docs no longer name a language no backend reports.

Cost: a deployment mounting a hypothetical `language: 'python'` runtime now rejects at assembly rather than presenting a Python SDK, and the Python SDK design recorded in the language-dispatch note is removed from production — it lives in that note and this one until a backend reintroduces it.
