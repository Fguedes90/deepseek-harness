import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context, type Plugin } from '@deepseek-ai/cordis'
import Loader, { type EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import Include, { type PatchOptions } from '@deepseek-ai/cordis-plugin-include'
import Group from '@deepseek-ai/cordis-plugin-group'
import { remoteMethods } from '@deepseek-ai/dsh-typert-protocol'
import { parse } from 'yaml'
import PluginInventoryGateway from '../src/index.ts'
import type { PluginEntryId } from '../src/types.ts'

const contexts: Context[] = []

afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
})

const activePlugin: Plugin.Function = () => {}
const pendingPlugin: Plugin.Object = {
  inject: ['neverReady'],
  apply() {},
}

const PROTECTED_MODULE = '@deepseek-ai/dsh-host-webserver'

interface Harness {
  ctx: Context
  inventory: PluginInventoryGateway
  patchPath: string
}

async function harness(patchPath?: string): Promise<Harness> {
  // Compose exactly like a real boot: a leaf config file plus a patch layer,
  // a root Include that materializes both, and rows created inside that
  // Include's subtree so their full ids are `include:<localId>` — the only
  // shape an override in the patch layer can bind to next boot.
  const dir = mkdtempSync(join(tmpdir(), 'dsh-plugin-inventory-'))
  const leafPath = join(dir, 'cordis.yml')
  const bootPatchPath = join(dir, 'cordis.patch.yml')
  writeFileSync(leafPath, '[]\n')
  writeFileSync(bootPatchPath, '[]\n')
  // The gateway's own write destination starts absent, so a no-op toggle can
  // be proven to leave no file behind and the first write is a fresh layer.
  const resolved = patchPath ?? join(dir, 'gateway.patch.yml')

  const ctx = new Context()
  contexts.push(ctx)
  ctx.baseUrl = `${pathToFileURL(dir).href}/`
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = Include
  ctx.loader.builtins.group = Group
  // Every specifier the tree names resolves here, so a row can carry a real
  // protected module name without importing the package behind it.
  const modules: Record<string, Plugin> = {
    'cordis:active': activePlugin,
    'cordis:pending': pendingPlugin,
    'cordis:group': Group,
    [PROTECTED_MODULE]: activePlugin,
  }
  const patches = (parse(readFileSync(bootPatchPath, 'utf8')) ?? []) as PatchOptions[]
  await ctx.loader.create({
    id: 'include',
    name: 'cordis:include',
    config: { path: pathToFileURL(leafPath).href, patches },
  } as Omit<EntryOptions, 'id'>)
  // Rows inside the Include resolve through its own tree, not the loader's.
  ctx.loader.resolve('include').subtree!.import = (name: string): Plugin | Promise<Plugin> =>
    Promise.resolve(modules[name] ?? activePlugin)

  await ctx.plugin(PluginInventoryGateway, { patchPath: resolved })
  const inventory = ctx.get('pluginInventory') as PluginInventoryGateway
  return { ctx, inventory, patchPath: resolved }
}

/** Create one row in the composing Include's root group, returning its full id. */
const create = async (
  ctx: Context, options: Partial<EntryOptions> & { name: string },
): Promise<PluginEntryId> => {
  const subtree = ctx.loader.resolve('include').subtree!
  return (await subtree.root.create(options)) as PluginEntryId
}

/** Remove one row from the composing Include's root group by its full id. */
const remove = async (ctx: Context, fullId: PluginEntryId): Promise<void> => {
  const subtree = ctx.loader.resolve('include').subtree!
  await subtree.root.remove(fullId.split(':').pop()!)
}

/** Create one row inside a nested group of the composing Include, returning its full id. */
const createIn = async (
  ctx: Context, groupId: PluginEntryId, options: Partial<EntryOptions> & { name: string },
): Promise<PluginEntryId> => {
  const subtree = ctx.loader.resolve('include').subtree!
  return (await subtree.resolveGroup(groupId.split(':').pop()!).create(options)) as PluginEntryId
}

describe('PluginInventoryGateway', () => {
  it('publishes the read and the enablement Remote under the pluginInventory namespace', async () => {
    const { inventory } = await harness()
    expect(inventory.typertRemote).toMatchObject({
      serviceKey: 'pluginInventory',
      namespace: 'pluginInventory',
    })
    expect(remoteMethods(inventory)).toEqual([
      { method: 'list', invocation: { kind: 'direct' } },
      { method: 'setEnabled', invocation: { kind: 'direct' } },
    ])
  })

  it('projects current non-group Loader entries without a second cache', async () => {
    const { ctx, inventory } = await harness()
    const activeId = await create(ctx, { name: 'cordis:active' })
    const pendingId = await create(ctx, { name: 'cordis:pending' })
    const disabledId = await create(ctx, {
      name: 'cordis:not-installed',
      disabled: true,
    })
    await create(ctx, { name: 'cordis:group', group: true, config: [] })

    const snapshot = inventory.list()
    expect(snapshot.entries).toHaveLength(3)
    expect(snapshot.entries).toEqual(expect.arrayContaining([
      {
        entryId: activeId,
        moduleName: 'cordis:active',
        enabled: true,
        fiberPhase: 'active',
        toggle: 'available',
      },
      {
        entryId: pendingId,
        moduleName: 'cordis:pending',
        enabled: true,
        fiberPhase: 'pending',
        toggle: 'available',
      },
      {
        entryId: disabledId,
        moduleName: 'cordis:not-installed',
        enabled: false,
        fiberPhase: null,
        toggle: 'available',
      },
    ]))

    await ctx.loader.update(activeId, { disabled: true })
    expect(inventory.list().entries.find(entry => entry.entryId === activeId)).toEqual({
      entryId: activeId,
      moduleName: 'cordis:active',
      enabled: false,
      fiberPhase: null,
      toggle: 'available',
    })

    await remove(ctx, pendingId)
    expect(inventory.list().entries.some(entry => entry.entryId === pendingId)).toBe(false)
  })

  it('classifies what each entry lets a client change', async () => {
    const { ctx, inventory } = await harness()
    const protectedId = await create(ctx, { name: PROTECTED_MODULE })
    await create(ctx, { name: 'cordis:group', group: true, config: [] })
    const expressionId = await create(ctx, {
      name: 'cordis:active',
      disabled: { __jsExpr: 'false' } as unknown as boolean,
    })

    const byId = new Map(inventory.list().entries.map(entry => [entry.entryId, entry]))
    expect(byId.get(protectedId)?.toggle).toBe('protected')
    expect(byId.get(expressionId)).toMatchObject({ enabled: true, toggle: 'expression' })
  })

  it('reports a protected entry as available again once it is off', async () => {
    const { ctx, inventory } = await harness()
    const id = await create(ctx, { name: PROTECTED_MODULE, disabled: true })
    expect(inventory.list().entries.find(entry => entry.entryId === id)?.toggle).toBe('available')
  })

  it('applies a disable to the running tree, records it, and announces it', async () => {
    const { ctx, inventory, patchPath } = await harness()
    const changed = vi.fn()
    ctx.on('pluginInventory/changed', changed)
    const id = await create(ctx, { id: 'probe', name: 'cordis:active' })

    const snapshot = await inventory.setEnabled(id, false)
    expect(snapshot.entries.find(entry => entry.entryId === id)).toMatchObject({
      enabled: false,
      fiberPhase: null,
    })
    expect(ctx.loader.resolve(id).fiber).toBeUndefined()
    expect(changed).toHaveBeenCalledWith(id, false)
    expect(readFileSync(patchPath, 'utf8')).toBe([
      '- id: probe',
      '  name: cordis:active',
      '  disabled: true',
      '',
    ].join('\n'))

    await inventory.setEnabled(id, true)
    expect(ctx.loader.resolve(id).fiber).toBeDefined()
    expect(changed).toHaveBeenLastCalledWith(id, true)
    expect(readFileSync(patchPath, 'utf8')).toContain('disabled: false')
  })

  it('leaves the tree and the patch layer alone when the entry already matches', async () => {
    const { ctx, inventory, patchPath } = await harness()
    const changed = vi.fn()
    ctx.on('pluginInventory/changed', changed)
    const id = await create(ctx, { id: 'probe', name: 'cordis:active' })

    await expect(inventory.setEnabled(id, true)).resolves.toEqual(inventory.list())
    expect(changed).not.toHaveBeenCalled()
    expect(() => readFileSync(patchPath, 'utf8')).toThrow()
  })

  it('refuses an id no live entry carries', async () => {
    const { inventory } = await harness()
    await expect(inventory.setEnabled('absent' as PluginEntryId, false))
      .rejects.toMatchObject({ code: 'ENTRY_NOT_FOUND' })
  })

  it('refuses a group row, which carries no plugin of its own', async () => {
    const { ctx, inventory } = await harness()
    const groupId = await create(ctx, { name: 'cordis:group', group: true, config: [] })
    await expect(inventory.setEnabled(groupId, false))
      .rejects.toMatchObject({ code: 'ENTRY_NOT_FOUND' })
  })

  it('refuses to disable the channel the request arrived on', async () => {
    const { ctx, inventory } = await harness()
    const id = await create(ctx, { name: PROTECTED_MODULE })
    await expect(inventory.setEnabled(id, false))
      .rejects.toMatchObject({ code: 'PLUGIN_PROTECTED' })
  })

  it('refuses a row whose state an ancestor group owns', async () => {
    const { ctx, inventory } = await harness()
    const groupId = await create(ctx, { name: 'cordis:group', group: true, config: [] })
    const id = await createIn(ctx, groupId, { name: 'cordis:active' })
    await ctx.loader.update(groupId, { disabled: true })

    expect(inventory.list().entries.find(entry => entry.entryId === id))
      .toMatchObject({ enabled: false, toggle: 'inherited' })
    await expect(inventory.setEnabled(id, true))
      .rejects.toMatchObject({ code: 'TOGGLE_INHERITED' })
  })

  it('refuses a row whose enablement a config expression computes', async () => {
    const { ctx, inventory } = await harness()
    const id = await create(ctx, {
      name: 'cordis:active',
      disabled: { __jsExpr: 'false' } as unknown as boolean,
    })
    await expect(inventory.setEnabled(id, false))
      .rejects.toMatchObject({ code: 'TOGGLE_EXPRESSION' })
  })

  it('rolls the tree back when the patch write fails, and a later retry still writes', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-plugin-inventory-'))
    const blocker = join(dir, 'blocker')
    writeFileSync(blocker, '')
    const { ctx, inventory } = await harness(join(blocker, 'cordis.patch.yml'))
    const id = await create(ctx, { id: 'probe', name: 'cordis:active' })

    await expect(inventory.setEnabled(id, false))
      .rejects.toMatchObject({ code: 'PATCH_WRITE_FAILED' })
    // Rollback: the rejection changes nothing — the tree is back where it
    // started and the projection still reports the row enabled.
    expect(ctx.loader.resolve(id).fiber).toBeDefined()
    expect(inventory.list().entries.find(entry => entry.entryId === id))
      .toMatchObject({ enabled: true })

    // The destination recovers; a retry performs the write rather than
    // answering the still-enabled state with a false no-op.
    rmSync(blocker)
    mkdirSync(blocker)
    await inventory.setEnabled(id, false)
    expect(ctx.loader.resolve(id).fiber).toBeUndefined()
    expect(readFileSync(join(blocker, 'cordis.patch.yml'), 'utf8')).toContain('disabled: true')
  })

  it('serializes concurrent toggles so the live tree and the patch file agree', async () => {
    const { ctx, inventory, patchPath } = await harness()
    const id = await create(ctx, { id: 'probe', name: 'cordis:active' })

    // Two toggles in flight without awaiting the first. Serialized, the last
    // one wins in both places: the tree ends enabled and the patch layer
    // records `disabled: false`.
    const disable = inventory.setEnabled(id, false)
    const enable = inventory.setEnabled(id, true)
    await Promise.all([disable, enable])

    expect(ctx.loader.resolve(id).fiber).toBeDefined()
    expect(inventory.list().entries.find(entry => entry.entryId === id))
      .toMatchObject({ enabled: true })
    // The last toggle (enable) wins in both places: the file holds exactly the
    // enabled row, never a stale `disabled: true` from the first in-flight call.
    expect(readFileSync(patchPath, 'utf8')).toBe([
      '- id: probe',
      '  name: cordis:active',
      '  disabled: false',
      '',
    ].join('\n'))
  })
})
