# @deepseek-ai/dsh-client-ui-settings-plugin-inventory

**Plugin list** tab for Web Settings. The browser plugin registers one localized `settings.plugins.tab` contribution with id `all`; the Plugins section owns the navigation entry and tab chrome. It performs no Remote read during plugin activation. Selecting the tab for the first time mounts it and lazily calls `ctx.remote.pluginInventory.list()` through [`api-remotes`](../../api/remotes/README.md).

The tab renders a searchable two-column catalog of compact disclosure cards. Each collapsed card uses the short module name as its title, an enable/disable checkbox, and a small effective-enablement tag; enabled entries also show a colored root-fiber status dot. Expanding one card reveals its Loader-tree entry id without a redundant field label, followed by the effective configuration and, for enabled entries, Cordis status. Disabled entries omit the redundant unmounted runtime state. The entry id remains the React key, disclosure identity, detail value, and an additional search target; it is never classified by string shape. Loading, empty, no-match, and generic failure states stay local to the mounted component, and a failed read can be retried without exposing transport details. The registration uses `ctx.slots.inject()`, so it follows late tab declaration, redeclaration, locale changes, and teardown without importing the section owner.

## Enable / disable toggle

Each `available` row carries a checkbox that toggles the plugin at runtime and persists the change to the profile's patch file through the Host `pluginInventory.setEnabled` Remote. The returned snapshot is applied in place, so a toggle never triggers a second `list()` call. The tab receives both handles through the injected face: `setEnabled` wraps the Remote and unwraps its result, while `subscribe` wraps `ctx.remote.$on('pluginInventory/changed', …)` and returns the disposer that stops the listener on teardown. Disabling an enabled plugin is gated by a `RiskConfirmation` dialog (from `ui-primitives`) whose confirm action stays locked until the risk is acknowledged; enabling a disabled plugin applies immediately. A rejected mutation surfaces a localized `mutationError` alert and leaves the previous snapshot intact. A successful toggle clears `pending` and updates the row; the tab re-reads the snapshot when the Host emits the forwarded `pluginInventory/changed` event, converging with edits made from any other surface.

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
- **Toggle limited to `available` rows** — protected, inherited, and expression-driven entries are surfaced read-only; local search does not add provenance, current-browser activation diagnosis, or grouping by source.
