# Agent Note: Oxlint correctness ruleset mapped, gated, and declined with reasons

Status: proposed

## Problem

`.oxlintrc.json` switched the whole `correctness` category off and re-enabled rules only through explicit `overrides`. Any rule the installed Oxlint added to that category was born silently off: no record said which `correctness` rules the repository declined and why, and a category upgrade could widen the gap without any signal. Measuring the in-scope eslint `correctness` passivo with the category forced to `error` produced 125 findings across 8 rules — the silent-rot surface made concrete.

## Proposal

Enable the eslint `correctness` ruleset rule-by-rule, declining only the irreducible residue, and close the loop with an executable sensor so a future binary that adds a `correctness` rule must be mapped before it can pass CI.

- **Enabled as `error` (52 rules).** Every eslint `correctness` rule with zero in-scope residue, plus four whose residue was zeroed first: `no-useless-escape` (removed a redundant `\[` escape), `no-unsafe-finally` (four narrow `oxlint-disable-next-line` suppressions at the repository's guarded teardown idiom, where the guard provably preserves the primary failure over the cleanup one), `require-yield` and `no-sparse-arrays` (source-only overrides — their only residue is deliberate test/fixture shapes).
- **Declined with a one-line reason in `.oxlintrc.json` (3 rules).** `no-unsafe-optional-chaining` (tests assert presence via `x?.y` followed by a direct access; a miss must fail loudly, so the rule would force masking failures with chained `?.`), `no-control-regex` (text-processing code deliberately matches control characters; the pattern is the feature), `no-empty-static-block` (the TypeGraph syntax fixture preserves an empty static block for generator coverage). The reason sits beside each `"off"` so the decision and its rationale live together.
- **Executable sensor in `scripts/oxlint-contract.spec.ts`.** It runs the installed binary's `--rules --format json`, filters the eslint `correctness` set, and fails when a rule is neither enabled (`error`/`warn`) nor declined (`off`) anywhere in `.oxlintrc.json`, naming the unmapped rule. This reuses the spec's existing lane, so no new gate registration is needed.

## Acceptance criteria

`pnpm run lint` exits 0. `pnpm vitest run scripts/oxlint-contract.spec.ts` passes including the new sensor. Dropping one declined rule from `.oxlintrc.json` makes the sensor fail and name it; restoring it returns green. Every enabled rule was proven to catch its case by injecting a violation into a real file under `scripts/` and confirming `oxlint` exits 1 naming file and rule. `pnpm run typecheck` exits 0.

## Alternatives considered

### Why not enable the whole `correctness` category?

The category spans plugin scopes (typescript, unicorn, oxc) whose passivo is not zero, so a category-level `error` would fail. Enabling rule-by-rule keeps the bar high exactly where the passivo is clean and leaves the residue explicitly declined.

### Why scope the sensor to eslint `correctness` only?

The measured and triaged set is the eslint core `correctness` category (all 8 rules, all 125 findings); those rules run without any plugin-activation gate, so a new one is the real silent-rot risk. Plugin-scoped rules are individually curated in the same overrides and their activation is plugin-gated, so a category add there is not the same born-off-silently hazard. The sensor's `scope === 'eslint'` filter is documented at the call site and easy to widen.

### Why keep `no-dupe-class-members`, `no-with`, and `getter-return` enabled when their proof is not demonstrable?

They are green and mapped, but Oxlint 1.76.0 cannot emit them: duplicate class members and `with` are hard parse/semantic errors before the rule runs, and `getter-return` does not emit on any getter-without-return tested. Disabling them would forfeit future protection for no current gain; the record notes the limitation.

## Risks

The three enabled-but-inert rules are the main residual risk: they hold no signal in this Oxlint version, so their mapped status must not be read as proof they catch anything today. The sensor catches new rules only, not a rule that changes semantics while keeping its id. The declined reasons are a contract: an entry that stops being true reads as drift and should be re-triaged.
