# @deepseek-ai/dsh-client-ui-settings-plugin-inventory

**Plugin list** tab for Web Settings. The browser plugin registers one localized `settings.plugins.tab` contribution with id `all`; the Plugins section owns the navigation entry and tab chrome. It performs no Remote read during plugin activation. Selecting the tab for the first time mounts it and lazily calls `ctx.remote.pluginInventory.list()` through [`api-remotes`](../../api/remotes/README.md).

The tab renders a searchable two-column catalog of compact disclosure cards, grouped into task-shaped category sections (`chat`, `tools`, `data`, `interface`, `system`, and a fallback for undescribed rows). Each collapsed card uses the short module name as its title, a one-sentence user-facing summary derived from the package's own README, an enable/disable checkbox, and a small effective-enablement tag; enabled entries also show a colored root-fiber status dot. Expanding one card reveals its Loader-tree entry id, its exact module specifier, the effective configuration, and, for enabled entries, Cordis status. Disabled entries omit the redundant unmounted runtime state. The entry id remains the React key, disclosure identity, detail value, and a search target; it is never classified by string shape. Search matches the module specifier, entry id, category label, and the localized summary, so it works in the displayed language. Loading, empty, no-match, and generic failure states stay local to the mounted component, and a failed read can be retried without exposing transport details. The registration uses `ctx.slots.inject()`, so it follows late tab declaration, redeclaration, locale changes, and teardown without importing the section owner.

## Catalog copy

The category of a plugin and its summaries live in client-only data files, never in the Host payload: `src/client/catalog.ts` claims one `PluginCategory` per module specifier the shipped `base` and `web-app` profiles compose, and `src/client/plugin-summaries.ts` carries the Simplified Chinese, English, and Brazilian Portuguese sentences, all type-checked against the catalog keys (`pt` is the incrementally translated language: namespaces without a `pt` dictionary fall back to `en`, so the tab's PT copy rides the platform chain rather than a per-package exception). `locales.ts` merges those summaries under the `summary.` key prefix into the same namespace the tab already registers. New copy is mandatory per composed row: `tests/catalog.client.spec.ts` fails when a composed specifier has no catalog entry or a catalog key no profile composes, so an added plugin cannot ship without a user-facing description. A row outside the catalog (a custom profile or third-party plugin) renders without a summary and groups under the `other` category.

## Enable / disable toggle

Each `available` row carries a checkbox that toggles the plugin at runtime and persists the change to the profile's patch file through the Host `pluginInventory.setEnabled` Remote. The tab applies the returned snapshot in place and then re-reads once when the forwarded `pluginInventory/changed` event arrives, so a successful toggle triggers one redundant `list()` call that converges the tab with edits made from any other surface. The tab receives both handles through the injected face: `setEnabled` wraps the Remote and unwraps its result, while `subscribe` wraps `ctx.remote.$on('pluginInventory/changed', …)` and returns the disposer that stops the listener on teardown. Disabling an enabled plugin is gated by a `RiskConfirmation` dialog (from `ui-primitives`) whose confirm action stays locked until the risk is acknowledged; enabling a disabled plugin applies immediately. A rejected mutation surfaces a localized `mutationError` alert and leaves the previous snapshot intact; a successful toggle clears `pending` and updates the row.

The remaining toggle states are read-only:

- `protected` — the browser UI depends on this plugin, so it cannot be disabled from this tab.
- `inherited` — a disabled ancestor group, not this row, controls enablement.
- `expression` — enablement is computed by a config expression; editing it here would destroy that rule.

Non-`available` rows render their checkbox disabled with an explanatory `aria-description` drawn from the matching locale key.

## Model Experience

None, as this package only visualizes a Host-owned deployment snapshot in browser Settings and registers nothing model-facing.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

- **One snapshot per Settings mount, retry, or forwarded change** — the tab re-reads on `pluginInventory/changed` but does not poll or refetch on reconnect; switching tabs preserves the current snapshot, while reopening Settings obtains a new one.
- **Toggle limited to `available` rows** — protected, inherited, and expression-driven entries are surfaced read-only; local search does not add provenance or current-browser activation diagnosis, and category summaries cover only rows the shipped profiles compose.
