# @deepseek-ai/dsh-host-plugin-inventory

Host projection of the current Cordis Loader tree plus the enablement override that edits it. `PluginInventoryGateway` registers the `pluginInventory` service and publishes two generated direct Remotes: `pluginInventory/list` and `pluginInventory/setEnabled`.

`list` reads `ctx.loader.entries()` directly, skips structural group rows, and returns the remaining entries in Loader order with only their Loader entry id, module specifier, effective enablement, current root Fiber phase, and toggle classification. The phase is `pending`, `loading`, `active`, `failed`, or `unloading`; it is `null` when the entry has no live root Fiber.

`setEnabled(entryId, enabled)` acts in two planes: it updates the live Loader entry, then id-targeted upserts the override into the profile's `cordis.patch.yml` named by the required `patchPath` config, so the change survives a restart. The Loader change lands before the write; a refused write leaves the running tree diverging from disk, which the raised `PATCH_WRITE_FAILED` reports. The writer records `{ id, name, disabled }` keyed by the row's own Loader id, preserving the layer's comments and every neighbouring row verbatim, and serializes writes behind a file lock and atomic replacement. A request that would not change the entry's state returns the current snapshot without touching disk or emitting. On success the Remote emits `pluginInventory/changed(entryId, enabled)` and returns the refreshed snapshot.

Each entry publishes a `toggle` classification from the closed union `available`, `protected`, `inherited`, or `expression`, and `setEnabled` refuses any non-`available` row. `protected` entries carry a module in the fixed `PROTECTED_MODULES` set — the modules the browser needs to reach this Remote and undo the change — and cannot be disabled. `inherited` rows are stopped by a disabled ancestor group, and `expression` rows compute `disabled` from a `!!js` config expression. Refusals throw `PluginInventoryError` (a `HarnessError` subclass) with one closed code: `ENTRY_NOT_FOUND`, `PLUGIN_PROTECTED`, `TOGGLE_INHERITED`, `TOGGLE_EXPRESSION`, or `PATCH_WRITE_FAILED`.

The snapshot is intentionally point-in-time: Loader remains the sole lifecycle authority, while this package owns no cache, history, or provenance model. Its public payload types live under `./types`, and Typert generates the Host and Client Remote artifacts exposed by `./typert` and `./remote`.

The service is Remote-only and deliberately declares no same-process Cordis `Context` merge. Client packages consume it through the explicit [`api-remotes`](../../api/remotes/README.md) assembly rather than importing the Host implementation.

## Model Experience

None, as this Host-only inventory projection registers no prompt, tool, message, or provider request.

#### KV Cache effect

None; this package never assembles model input.

## Known Limitations and Deferred Work

- **Point-in-time state only** — `list` returns no durable failure history; a missing root Fiber is reported as `null`, regardless of why no live root exists.
- **No provenance** — the service does not identify which bundle, profile, or override introduced an entry.
- **No add or remove** — `setEnabled` toggles an existing entry's enablement; it does not add or remove plugins.
