/**
 * Closed failure taxonomy of the plugin inventory's mutation path.
 * @module @deepseek-ai/dsh-host-plugin-inventory/error
 */

import { HarnessError } from '@deepseek-ai/dsh-llm'

/**
 * Every way `pluginInventory/setEnabled` refuses a request.
 *
 * - `ENTRY_NOT_FOUND` — no live Loader entry carries the requested id.
 * - `PLUGIN_PROTECTED` — disabling the entry would cut the browser command
 *   channel or the settings surface that issued the request.
 * - `TOGGLE_INHERITED` — a disabled ancestor group owns the entry's state.
 * - `TOGGLE_EXPRESSION` — the row's `disabled` field is a `!!js` expression.
 * - `PATCH_WRITE_FAILED` — the Loader applied the change but the profile patch
 *   layer could not record it, so the change would not survive a restart.
 */
export type PluginInventoryErrorCode =
  | 'ENTRY_NOT_FOUND'
  | 'PLUGIN_PROTECTED'
  | 'TOGGLE_INHERITED'
  | 'TOGGLE_EXPRESSION'
  | 'PATCH_WRITE_FAILED'

/** Typed plugin-inventory failure whose `code` is one closed taxonomy member. */
export class PluginInventoryError extends HarnessError {
  declare readonly code: PluginInventoryErrorCode

  // The base stores the value; this signature narrows its open string code.
  // oxlint-disable-next-line typescript/no-useless-constructor
  constructor(message: string, code: PluginInventoryErrorCode, options?: ErrorOptions) {
    super(message, code, options)
  }
}
