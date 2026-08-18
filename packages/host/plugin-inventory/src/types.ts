/**
 * Client-safe type surface of the plugin inventory: the entry-id brand, the
 * projected entry payloads, and the seam's Cordis event declaration. Types
 * only — no runtime code, and nothing here reaches a Host-only symbol, so a
 * Client compilation face reads exactly the signatures the Host emits.
 *
 * @module @deepseek-ai/dsh-host-plugin-inventory/types
 */

import type { Branded } from '@deepseek-ai/dsh-brand'

/** Stable Loader-tree identity of one configured plugin entry. */
export type PluginEntryId = Branded<'PluginEntryId'>

/** Lifecycle state of an entry's root Fiber, or null when it has no live root Fiber. */
export type PluginFiberPhase =
  | 'pending'
  | 'loading'
  | 'active'
  | 'failed'
  | 'unloading'
  | null

/**
 * Whether a trusted client may change this entry's configured enablement, and
 * what blocks it when it may not. Closed union: a consumer switching on it
 * ends in `assertNever`.
 *
 * - `available` — the enablement this row owns is editable in its current direction.
 * - `protected` — the entry is enabled and its module carries the browser
 *   command channel or the settings surface itself, so disabling it would cut
 *   the connection that could undo the change.
 * - `inherited` — the row's own `disabled` flag is not what stops it; a
 *   disabled ancestor group does, and clearing this row would change nothing.
 * - `expression` — enablement is computed by a `!!js` config expression, and a
 *   literal override would destroy that rule.
 */
export type PluginToggleState = 'available' | 'protected' | 'inherited' | 'expression'

/** One non-group Loader entry exposed to trusted clients. */
export interface PluginInventoryEntry {
  readonly entryId: PluginEntryId
  /** Exact module specifier imported by the Loader entry. */
  readonly moduleName: string
  /** Effective Loader enablement, including disabled ancestor groups. */
  readonly enabled: boolean
  readonly fiberPhase: PluginFiberPhase
  /** Whether `pluginInventory/setEnabled` accepts this entry right now. */
  readonly toggle: PluginToggleState
}

/** Point-in-time inventory returned by the plugin inventory Remote. */
export interface PluginInventorySnapshot {
  readonly entries: readonly PluginInventoryEntry[]
}

declare module '@deepseek-ai/cordis' {
  interface Events {
    /**
     * One entry's configured enablement changed through the inventory Remote.
     * Emitted after the Loader applied the change and the profile patch layer
     * persisted it, so a listener that re-reads the inventory observes the new
     * state. Never emitted for a rejected or no-op request.
     * @param entryId - the Loader entry whose enablement changed.
     * @param enabled - the entry's new configured enablement.
     * @mode emit
     */
    'pluginInventory/changed'(entryId: PluginEntryId, enabled: boolean): void
  }
}
