/** Projection of the current Cordis Loader plugin entries, and the enablement override that edits it. */

import type { Context, FiberState } from '@deepseek-ai/cordis'
import { isJsExpr, type Entry } from '@deepseek-ai/cordis-plugin-loader'
import z from '@deepseek-ai/schemastery'
import { assertNever } from '@deepseek-ai/dsh-llm'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
// Typert-generated ./typert and ./remote artifacts import Zod at runtime.
import type {} from 'zod'
import { PluginInventoryError } from './error.ts'
import { writePluginPatch } from './patch-writer.ts'
import { PROTECTED_MODULES } from './protected.ts'
import type {
  PluginEntryId,
  PluginFiberPhase,
  PluginInventoryEntry,
  PluginInventorySnapshot,
  PluginToggleState,
} from './types.ts'

export type * from './types.ts'
export { PluginInventoryError, type PluginInventoryErrorCode } from './error.ts'
export { PROTECTED_MODULES } from './protected.ts'
export { renderPatchDocument, writePluginPatch, type PluginPatchRow } from './patch-writer.ts'

/** Brand an existing Loader-tree entry id at the owning boundary. */
function pluginEntryId(value: string): PluginEntryId {
  return value as PluginEntryId
}

/** Runtime mirror: FiberState is a cross-package const enum. */
const FIBER_STATE = {
  PENDING: 0 as FiberState.PENDING,
  LOADING: 1 as FiberState.LOADING,
  ACTIVE: 2 as FiberState.ACTIVE,
  FAILED: 3 as FiberState.FAILED,
  DISPOSED: 4 as FiberState.DISPOSED,
  UNLOADING: 5 as FiberState.UNLOADING,
} as const

/** Complete public projection of Cordis Fiber states. */
const FIBER_PHASE = {
  [FIBER_STATE.PENDING]: 'pending',
  [FIBER_STATE.LOADING]: 'loading',
  [FIBER_STATE.ACTIVE]: 'active',
  [FIBER_STATE.FAILED]: 'failed',
  [FIBER_STATE.DISPOSED]: null,
  [FIBER_STATE.UNLOADING]: 'unloading',
} as const satisfies Record<FiberState, PluginFiberPhase>

/**
 * Classify what a toggle request for this entry would do, in the direction the
 * entry's current state leaves open. A protected entry that is already
 * disabled reports `available`, because re-enabling it restores the channel
 * the guard exists to keep.
 * @param entry - the live Loader entry.
 * @returns the closed toggle state published with the entry.
 */
function toggleStateOf(entry: Entry): PluginToggleState {
  if (isJsExpr(entry.options.disabled)) return 'expression'
  // The row's own flag is clear, yet the entry is off: an ancestor group owns
  // the state, and writing `disabled: false` here would change nothing.
  if (entry.disabled && !entry.options.disabled) return 'inherited'
  if (!entry.disabled && PROTECTED_MODULES.has(entry.options.name)) return 'protected'
  return 'available'
}

/** Required launcher fact: which file records this deployment's user overrides. */
export interface Config {
  /**
   * Absolute path of the profile's own `cordis.patch.yml`. Profile-scoped
   * deliberately: an entry id is an artifact of one profile's composition, so
   * recording it in the machine-global home layer would apply it to profiles
   * that never had the row. The web bundle wires the launcher's `dshPatchPath`
   * slot here; a composition that mounts this gateway without it fails
   * validation at load rather than discovering it has nowhere to write on the
   * first toggle.
   */
  readonly patchPath: string
}

/** Remote service exposing the Loader's current non-group entry state and its user overrides. */
export class PluginInventoryGateway extends TypertRemoteService {
  static inject = ['loader']

  /** Loader validation for the required override destination. */
  static Config: z<Config> = z.object({
    patchPath: z.string().required(),
  })

  private readonly patchPath: string

  /**
   * @param ctx - Host context carrying the Loader service.
   * @param config - Required profile patch-layer destination.
   */
  constructor(ctx: Context, config: Config) {
    super(ctx, 'pluginInventory')
    this.patchPath = config.patchPath
  }

  /**
   * Read the Loader directly on every call. Cordis's internal plugin/status
   * events already maintain Entry.fiber and Fiber.state, so a second cache
   * would only add another lifecycle truth to keep synchronized.
   * @returns Current non-group Loader entries in Loader order.
   */
  @Remote('list')
  list(): PluginInventorySnapshot {
    const entries: PluginInventoryEntry[] = []
    for (const entry of this.ctx.loader.entries()) {
      if (entry.options.group) continue
      entries.push({
        entryId: pluginEntryId(entry.id),
        moduleName: entry.options.name,
        enabled: !entry.disabled,
        fiberPhase: entry.fiber === undefined ? null : FIBER_PHASE[entry.fiber.state],
        toggle: toggleStateOf(entry),
      })
    }
    return { entries }
  }

  /**
   * Set one entry's configured enablement, applying it to the running tree and
   * recording it in the profile's patch layer so it survives a restart.
   *
   * The Loader change lands first: a refused write leaves a tree that no
   * longer matches disk, which the raised failure reports, whereas writing
   * first would persist an override the running process rejected.
   * @param entryId - the Loader entry to change.
   * @param enabled - the enablement to configure.
   * @returns the whole inventory as it stands after the change.
   * @throws {PluginInventoryError} `ENTRY_NOT_FOUND`, `PLUGIN_PROTECTED`,
   * `TOGGLE_INHERITED`, `TOGGLE_EXPRESSION`, or `PATCH_WRITE_FAILED`.
   */
  @Remote('setEnabled')
  async setEnabled(entryId: PluginEntryId, enabled: boolean): Promise<PluginInventorySnapshot> {
    const entry = this.resolveEntry(entryId)
    const state = toggleStateOf(entry)
    switch (state) {
      case 'expression':
        throw new PluginInventoryError(
          `entry ${entryId} computes "disabled" from a config expression; a literal override would destroy that rule`,
          'TOGGLE_EXPRESSION',
        )
      case 'inherited':
        throw new PluginInventoryError(
          `entry ${entryId} is disabled by an ancestor group, not by its own configuration`,
          'TOGGLE_INHERITED',
        )
      case 'protected':
        // Reached only while the entry is enabled, so the request can only be
        // a disable; enabling a protected entry classifies as `available`.
        throw new PluginInventoryError(
          `entry ${entryId} (${entry.options.name}) carries the channel this request arrived on and cannot be disabled`,
          'PLUGIN_PROTECTED',
        )
      case 'available':
        break
      /* v8 ignore next 2 -- PluginToggleState is closed; this retains compile-time exhaustiveness. */
      default:
        return assertNever(state, 'PluginToggleState')
    }
    if (!entry.disabled === enabled) return this.list()

    await entry.update({ disabled: !enabled })
    await writePluginPatch(this.patchPath, {
      id: entry.options.id,
      name: entry.options.name,
      disabled: !enabled,
    })
    this.ctx.emit('pluginInventory/changed', entryId, enabled)
    return this.list()
  }

  /** Resolve a client-supplied entry id against the live tree. */
  private resolveEntry(entryId: PluginEntryId): Entry {
    let entry: Entry
    try {
      entry = this.ctx.loader.resolve(entryId)
    } catch (cause) {
      throw new PluginInventoryError(`no loader entry ${entryId}`, 'ENTRY_NOT_FOUND', { cause })
    }
    if (entry.options.group) {
      throw new PluginInventoryError(`loader entry ${entryId} is a group, not a plugin`, 'ENTRY_NOT_FOUND')
    }
    return entry
  }
}

export default PluginInventoryGateway
