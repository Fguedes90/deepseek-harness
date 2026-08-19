# Agent Note: Portuguese as an incrementally shipped locale

Status: implemented

## Problem

Adding another language to the browser client's locale registry while the other ~38 namespaces ship `zh` + `en` only was incoherent: the lookup chain fell back to `zh`, so a Portuguese user with `pt` selected but only this feature translated would see the rest of the app in **Chinese** — worse than the `zh` default today. A coherent option needed the *platform* to decide the fallback per locale.

## Decision

Make `pt` an incrementally translated language in `@deepseek-ai/dsh-client-locale`:

- `LOCALE_IDS` grows to `['zh', 'en', 'pt']` (`locale-settings.ts`); `LOCALES` adds `{ id: 'pt', label: 'Português' }`. `detectBrowserLocale` already matches the `pt-BR` primary subtag onto `pt`, so a Portuguese browser lands there with no push.
- The lookup chain becomes active → per-locale fallback → historical `zh` last resort, via a new `LOCALE_FALLBACK` map (`pt → en`, `en → zh`, `zh → zh`). A partial-PT namespace resolves through `en`, never straight to `zh` (which is the whole point of the chain redesign); the chain dedupes on revisit so the self-fallbacks cannot loop.
- The typed `register` overload changes from `Record<LocaleId, LocaleDictOf<N>>` (all locales required) to `{ zh: …; en: …; pt?: … }`: `zh`/`en` stay mandatory at every call site (preserving the historical bilingual-balance contract), while `pt` is optional because a namespace that ships no `pt` must not force a whole-app translation wave.

The plugin-inventory feature is the first fully-`pt` namespace: `plugin-summaries.ts` gains `summariesPt` (128 sentences ported from the verified English fact, `≤ 90` codepoints, one sentence, no trailing period) and `locales.ts` adds the `chromePt` tab chrome plus the `pt` dictionary, registered via `ctx.locale.register(NS, { zh, en, pt })`. Every other namespace falls back to `en` for `pt`.

## Alternatives considered

**Remove `zh`.** No — `en` is type-checked against `chromeZh`, goldens run the app in `zh`, and the whole-app bilingual contract is load-bearing.

**Translate all ~38 namespaces to `pt` now.** That is the end-state, but it forces a full synchronous translation wave the moment `LocaleId` grows. Optional `pt` behind a per-locale `pt → en` fallback lets languages land namespace-by-namespace with no broken intermediate state.

**Register `pt` as required.** Same as translating everything now — any one authorization still pending breaks the whole build.

## Consequences

A Portuguese browser (or a `Português` language-row choice) renders this feature fully in PT and the rest of the app in English — never mixed back into Chinese. New namespaces add `pt` at their own pace; until then they are readable via `en`. The 128×branch ring of the lookup chain is covered in `packages/client/locale/tests/locale.client.spec.ts` (active-wins, en-fallback, zh-last-resort, no-pt-namespace, browser provisional `pt`). The pt copy budget is gated permanently in `tests/catalog.client.spec.ts` (non-empty per row, `≤ 90` codepoints, no trailing `.`), so a drifting PT sentence turns red on the next coverage run. `chromePt` is `satisfies Record<keyof typeof chromeZh, string>`, so a chrome key added in one language is compile-checked across all three. The cost is a third authored data set whose truth mirrors the packages' READMEs like the existing zh/en sets.