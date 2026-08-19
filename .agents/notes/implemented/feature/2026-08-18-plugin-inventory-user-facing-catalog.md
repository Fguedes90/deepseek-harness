# Agent Note: User-facing plugin catalog in the inventory tab

Status: implemented

## Problem

The plugin-inventory Settings tab listed every composed plugin by its short module name — `dsh-agent-loop`, `dsh-session-projection-cache`, `dsh-client-ui-settings-plugins` — which tells a user nothing about what a plugin does, in one language only, in a flat two-column list with no grouping. The `package.json` descriptions were 128/128 in engineering register ("ctx.approval", "seam", "fiber swap") and English only, and the `packages/<group>/` taxonomy is a capability-seam grouping, not a task-shaped one a user reads (`guard/`, `extensions/`, `host/`+`client/` split one visible feature).

## Decision

Product copy lives entirely on the client, never in the Host payload or the wire. Three data files in `@deepseek-ai/dsh-client-ui-settings-plugin-inventory` describe every row the shipped `base` and `web-app` profiles compose:

- `src/client/catalog.ts` — `PLUGIN_CATALOG` maps each module specifier to one of five authored categories (`chat`, `tools`, `data`, `interface`, `system`) plus `CATEGORY_ORDER` and `categoryOf()`, which returns `other` for a specifier the catalog does not describe (a custom profile or third-party plugin).
- `src/client/plugin-summaries.ts` — `summariesZh` and `summariesEn`, one user-facing sentence per catalog module, both `satisfies Record<CatalogModule, string>` so the compiler rejects a missing or surplus key.
- `src/client/locales.ts` — the existing chrome dictionaries plus the summaries merged under the `summary.` prefix, so `ctx.locale.register(NS, { zh, en })` and the `LocaleRuntime` re-render path are unchanged.

The tab groups rows by category in `CATEGORY_ORDER`, preserving each group's Loader order, and renders each card's one-line summary under the title. `matches()` now also matches the localized summary and category label, so search works in the displayed language. The card's `aria-label` stays `title, status, configuration`, and a single `[data-plugin-count]` still carries the filtered total; the per-section counts are plain `<span>`s and every row stays mounted, so the `settings-chrome` e2e counts stay truthful.

**Copy, not engineering text.** Every sentence derives from its package's own README first paragraph and `description`, states an observable effect for the person using the app (pure plumbing describes what breaks without it), ends without a trailing period, is `≤ 90` (English) or `≤ 34` (Chinese) characters, and avoids a ban list of engineering vocabulary (`ctx.`, seam, fiber, waterfall, Remote, Loader, projection, provider, capability, plugin-spine, Typert, event vocabulary).

**The gate is the payback for 128 × 2 phrases.** `tests/catalog.client.spec.ts` copies the host `protected.spec.ts` composition parser over the two shipped `cordis.patch.yml` files and fails when a composed specifier has no catalog entry or a catalog key no profile composes, plus a non-vacuity check against a name no bundle row carries. A new plugin that ships without a user-facing description is a red test on the next run; the compiler already guarantees a summary for its category key.

## Alternatives considered

**Add category + copy to the Host payload.** The Host already enumerates service/loader state; category and user text are product data, not Loader state, so they would pollute the snapshot and the wire for rows that carry them, and require a Host change for every copy edit. Client-only data keeps the payload's shape stable and edits cheap.

**Passthrough `package.json.description`.** The descriptions are 0/128 in user register and English only, so this delivers the current state — no grouping, no Chinese, still engineering vocabulary — for free. It also ties rendered copy to a field nobody is disciplined about.

**Group only, no per-row copy.** Cheaper, but keeps the "what does this do" gap: a group titled 工具 next to a row named `dsh-tool-str-replace-editor` still tells the user nothing about the tool. The per-row sentence is the feature.

## Consequences

The tab now says what each plugin does in both shipped languages and groups rows into task-shaped sections, with undescribed third-party rows under 其他/Other without a summary. New copy is enforced: `tests/catalog.client.spec.ts` turns a composed plugin without a description into a red test, and the summaries' type-check rejects key drift. The cost is a large authored data set (128 rows × category + zh + en) whose truth is only as good as the packages' READMEs; the derivation rule and the coverage gate keep it from drifting, but a wrong README still yields a wrong sentence. The data files are covered by import in `test:coverage`, and the two fixture paths (known `cordis-plugin-hmr` row vs undescribed third-party rows) exercise `categoryOf`, `summary` rendering, and the summary-based search.