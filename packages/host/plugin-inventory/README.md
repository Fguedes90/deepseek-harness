# @deepseek-ai/dsh-host-plugin-inventory

Host projection of the current Cordis Loader tree plus the enablement override that edits it. `PluginInventoryGateway` registers the `pluginInventory` service and publishes two generated direct Remotes: `pluginInventory/list` and `pluginInventory/setEnabled`.

`list` reads `ctx.loader.entries()` directly and returns, in Loader order, only the rows composed one level below the root Include — exactly the entries whose id the profile's patch layer can bind an override to — with only their Loader entry id, module specifier, effective enablement, current root Fiber phase, and toggle classification. The phase is `pending`, `loading`, `active`, `failed`, or `unloading`; it is `null` when the entry has no live root Fiber.

Everything else the Loader carries is neither listed nor toggleable: group rows, the composing Include entry itself, nested-include children, and rows created at runtime through `ctx.loader.create` under a generated id that no file records. An override is recorded by row id inside the root Include's composed list, so a row anywhere else could never receive it, and the Include entry owns the whole composed tree, so disabling it would take down the surface that called it. A `setEnabled` request for such an entry rejects with `ENTRY_NOT_FOUND`.

`setEnabled(entryId, enabled)` acts in two planes: it updates the live Loader entry, then id-targeted upserts the override into the profile's `cordis.patch.yml` named by the required `patchPath` config, so the change survives a restart. A failed patch write rolls the live entry back and rethrows, so a rejected toggle changes nothing in either plane. The whole resolve, guard, update and write sequence is serialized per gateway, so concurrent toggles cannot leave the file recording a state the tree does not hold. The writer records `{ id, name, disabled }` keyed by the row's own Loader id, preserving the layer's comments and every neighbouring row verbatim, and serializes writes behind a file lock and atomic replacement. A request that would not change the entry's state returns the current snapshot without touching disk or emitting. On success the Remote emits `pluginInventory/changed(entryId, enabled)` and returns the refreshed snapshot.

Each entry publishes a `toggle` classification from the closed union `available`, `protected`, `inherited`, or `expression`, and `setEnabled` refuses any non-`available` row. `protected` entries carry a module in the fixed `PROTECTED_MODULES` set — the modules the browser needs to reach this Remote and undo the change, which covers the command channel from the browser to the Host, the Settings surface the request issues from, the services it is built out of (the `theme` the shell injects, the `locale` the tab injects, the `settings.plugins.tab` slot it registers into), and this projection itself — and cannot be disabled. `inherited` rows are stopped by a disabled ancestor group, and `expression` rows compute `disabled` from a `!!js` config expression. Refusals throw `PluginInventoryError` (a `HarnessError` subclass) with one closed code: `ENTRY_NOT_FOUND`, `PLUGIN_PROTECTED`, `TOGGLE_INHERITED`, `TOGGLE_EXPRESSION`, or `PATCH_WRITE_FAILED`.

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
