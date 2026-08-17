# Agent Note: doc-typecheck fence allowlist and opt-out ceiling

Status: proposed

## Problem

`scripts/doc-typecheck.ts` had two silent escape hatches that let doc fences drift without a gate verdict. First, `KIND_BY_INFO` recognized only seven info-strings, all starting with `ts`; `extractBlocks` returned `[]` for any other info-string, so an unrecognized fence (a typo such as `` ```tsx `` or ` ```TS `, a new language, or the non-canonical `typescript`/`md`) was dropped without a trace. The corpus in fact carried three such silently-ignored spellings: `ts ignore` (1, a misspelling of `ts ignore-check`), `typescript` (2), and `md` (2, alongside 52 `markdown`). Second, the `ts ignore-check` opt-out was unbounded: the script printed `79 ignored (49% opt-out)` and failed only when the opt-out *ratio* exceeded 50%, so the absolute number of unchecked sketches could grow indefinitely as long as checked blocks grew alongside.

## Proposal

`scripts/doc-typecheck.ts` now fails on any fence whose info-string is neither a recognized `ts*` variant nor an explicit allowlisted non-TypeScript language, naming the file and line. The allowlist covers `yaml`, `json`, `jsonc`, `markdown`, `text`, `sh`, `js`, `mermaid`, `toml`, `sql`, and bare (unlabelled) fences; everything else is rejected. Canonical spellings are enforced by omission: `md` and `typescript` are absent from the allowlist and from `KIND_BY_INFO`, so re-introducing either fails until the fence is rewritten to `markdown` or `ts`. The corpus was normalized accordingly: `ts ignore` → `ts ignore-check`, both `typescript` → `ts` (one needed a `declare function sha256` and an `export {}` module marker to compile as checked), and both `md` → `markdown`.

The opt-out is now a ratchet: a `IGNORE_CEILING` constant (currently 76) must equal the `ts ignore-check` count exactly. Exceeding it fails demanding that blocks compile or be deleted; falling below it fails demanding the ceiling be lowered in the same change, so the number only shrinks and cannot accrue as credit. Four self-contained declaration blocks (retention library's `Omitted`/retention-strategy types, the spill `Config`, and the Code Mode generated-SDK declaration) were converted from `ts ignore-check` to checked `ts` (adding an `export {}` module marker where a block was a bare global-script declaration), lowering the ceiling from the pre-change opt-out count. This mirrors the `verify-doc-budgets` ratchet contract from `scripts/doc-budgets.manifest.json`.

## Acceptance criteria

`pnpm run doc-typecheck` exits 0 and prints the count and ceiling (`87 block(s) compiled, 76 ignored (47% opt-out, ceiling 76)`). Proofs by class, reverted between runs: an unknown `` ```tsx `` fence fails naming file and line; a new `ts ignore-check` block beyond the ceiling fails with a cover-or-lower message; a count below the ceiling fails demanding the ceiling be lowered; and a `ts` block with a real type error is still caught. `pnpm exec tsx scripts/run-oxlint.ts scripts/doc-typecheck.ts`, `pnpm run typecheck`, and `pnpm vitest run scripts/doc-typecheck-paths.spec.ts` all exit 0.

## Alternatives considered

### Why not recognize `typescript` in `KIND_BY_INFO` instead of normalizing it?

A single canonical spelling keeps the corpus consistent and makes `typescript` a signal, not a second accepted spelling. Recognizing both would let the two spellings drift and hide which one a reader should use. Normalizing to `ts` and rejecting the alternate is the same decision `markdown`/`md` makes.

### Why an inline `IGNORE_CEILING` instead of a `doc-budgets.manifest.json` entry?

The doc-budgets manifest maps doc paths to word ceilings and is consumed by `countWords`; a single global opt-out counter does not fit that schema. The ratchet *contract* — count must equal ceiling, raising needs justification, lowering shrinks the number — is reused verbatim as the pattern, with the ceiling versioned in the script.

### Why not lower the gate's compile model to isolate every block?

Colliding global-script declarations (two `` ```ts `` blocks each declaring `Config`) surfaced only because checked blocks compile in one program. Isolating every block as a module would be a broader behavioral change to all 87 checked blocks for marginal benefit; the converted declaration blocks instead get an explicit `export {}` module marker where needed. A future pass could make module isolation the default.

## Risks

The allowlist is a hardcoded table in the script; adding a new non-TypeScript language requires a deliberate script edit, which is the intended friction. `IGNORE_CEILING` must be lowered in the same change as any block conversion, or the gate goes red — that is the designed ratchet, not a defect. Converting a `ts ignore-check` block to `ts` that later fails to compile against the host declarations turns the opt-out into a hard compile error, so conversions should be validated by `pnpm run doc-typecheck`.
