import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context, type Plugin } from '@deepseek-ai/cordis'
import Loader, { type EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import Group from '@deepseek-ai/cordis-plugin-group'
import { remoteMethods } from '@deepseek-ai/dsh-typert-protocol'
import PluginInventoryGateway from '../src/index.ts'
import type { PluginEntryId } from '../src/types.ts'

/** Create one Loader row, keeping the branded id the Remote takes. */
const create = (
  ctx: Context, options: Partial<EntryOptions> & { name: string }, parent?: string,
): Promise<PluginEntryId> =>
  ctx.loader.create(options, parent) as Promise<PluginEntryId>

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
  const ctx = new Context()
  contexts.push(ctx)
  await ctx.plugin(Loader)
  // Every specifier the tree names resolves here, so a row can carry a real
  // protected module name without importing the package behind it.
  const modules: Record<string, Plugin> = {
    'cordis:active': activePlugin,
    'cordis:pending': pendingPlugin,
    'cordis:group': Group,
    [PROTECTED_MODULE]: activePlugin,
  }
  ctx.loader.import = (name: string): Promise<Plugin> => Promise.resolve(modules[name] ?? activePlugin)
  const resolved = patchPath ?? join(mkdtempSync(join(tmpdir(), 'dsh-plugin-inventory-')), 'cordis.patch.yml')
  await ctx.plugin(PluginInventoryGateway, { patchPath: resolved })
  const inventory = ctx.get('pluginInventory') as PluginInventoryGateway
  return { ctx, inventory, patchPath: resolved }
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
    await create(ctx, { name: 'cordis:active', group: true })

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

    await ctx.loader.remove(pendingId)
    expect(inventory.list().entries.some(entry => entry.entryId === pendingId)).toBe(false)
  })

  it('classifies what each entry lets a client change', async () => {
    const { ctx, inventory } = await harness()
    const protectedId = await create(ctx, { name: PROTECTED_MODULE })
    const groupId = await create(ctx, { name: 'cordis:group', group: true, config: [] })
    const inheritedId = await create(ctx, { name: 'cordis:active' }, groupId)
    await ctx.loader.update(groupId, { disabled: true })
    const expressionId = await create(ctx, {
      name: 'cordis:active',
      disabled: { __jsExpr: 'false' } as unknown as boolean,
    })

    const byId = new Map(inventory.list().entries.map(entry => [entry.entryId, entry]))
    expect(byId.get(protectedId)?.toggle).toBe('protected')
    expect(byId.get(inheritedId)).toMatchObject({ enabled: false, toggle: 'inherited' })
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
    const groupId = await create(ctx, { name: 'cordis:active', group: true })
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
    const id = await create(ctx, { name: 'cordis:active' }, groupId)
    await ctx.loader.update(groupId, { disabled: true })
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

  it('reports a patch layer it cannot write, after the tree already changed', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-plugin-inventory-'))
    const blocker = join(dir, 'blocker')
    writeFileSync(blocker, '')
    const { ctx, inventory } = await harness(join(blocker, 'cordis.patch.yml'))
    const id = await create(ctx, { id: 'probe', name: 'cordis:active' })

    await expect(inventory.setEnabled(id, false))
      .rejects.toMatchObject({ code: 'PATCH_WRITE_FAILED' })
    expect(ctx.loader.resolve(id).fiber).toBeUndefined()
  })
})
