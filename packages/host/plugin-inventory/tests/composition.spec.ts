import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { Context, type Plugin } from '@deepseek-ai/cordis'
import Loader, { type EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import Include, { type PatchOptions } from '@deepseek-ai/cordis-plugin-include'
import Group from '@deepseek-ai/cordis-plugin-group'
import { parse } from 'yaml'
import PluginInventoryGateway from '../src/index.ts'
import type { PluginEntryId } from '../src/types.ts'

const LEAF_CONFIG = [
  '# the bundle layer, owned by the installation',
  '- id: probe',
  '  name: cordis:probe',
  '',
].join('\n')

const PATCH_TEMPLATE = '# Your patch layer for this dsh profile.\n[]\n'

/** Counts the writes the Include tree would make back to the bundle config. */
class CountingInclude extends Include {
  static writes = 0

  override write(): void {
    CountingInclude.writes += 1
    super.write()
  }
}

const contexts: Context[] = []

afterEach(async () => {
  await Promise.all(contexts.splice(0).map(ctx => ctx.fiber.dispose()))
  CountingInclude.writes = 0
})

const probePlugin: Plugin.Function = () => {}

interface Booted {
  ctx: Context
  inventory: PluginInventoryGateway
}

async function boot(dir: string, patchPath: string): Promise<Booted> {
  const ctx = new Context()
  contexts.push(ctx)
  ctx.baseUrl = `${pathToFileURL(dir).href}/`
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = CountingInclude
  ctx.loader.builtins.group = Group
  ctx.loader.builtins.probe = probePlugin
  const text = readFileSync(patchPath, 'utf8')
  const patches = (parse(text) ?? []) as PatchOptions[]
  await ctx.loader.create({
    id: 'include',
    name: 'cordis:include',
    config: { path: pathToFileURL(join(dir, 'cordis.yml')).href, patches },
  } as Omit<EntryOptions, 'id'>)
  await ctx.plugin(PluginInventoryGateway, { patchPath })
  return { ctx, inventory: ctx.get('pluginInventory') as PluginInventoryGateway }
}

describe('enablement over a real bundle-plus-patch composition', () => {
  it('records the override in the profile layer, never in the composed bundle file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-plugin-composition-'))
    const configPath = join(dir, 'cordis.yml')
    const patchPath = join(dir, 'cordis.patch.yml')
    writeFileSync(configPath, LEAF_CONFIG)
    writeFileSync(patchPath, PATCH_TEMPLATE)

    const first = await boot(dir, patchPath)
    const probe = first.inventory.list().entries.find(entry => entry.moduleName === 'cordis:probe')
    expect(probe).toMatchObject({ entryId: 'include:probe', enabled: true, toggle: 'available' })

    await first.inventory.setEnabled(probe!.entryId, false)
    expect(first.ctx.loader.resolve('include:probe').fiber).toBeUndefined()
    expect(readFileSync(configPath, 'utf8')).toBe(LEAF_CONFIG)
    expect(CountingInclude.writes).toBe(0)
    expect(readFileSync(patchPath, 'utf8')).toBe([
      '# Your patch layer for this dsh profile.',
      '- id: probe',
      '  name: cordis:probe',
      '  disabled: true',
      '',
    ].join('\n'))

    await contexts.splice(0).at(0)!.fiber.dispose()

    const second = await boot(dir, patchPath)
    expect(second.inventory.list().entries.find(entry => entry.moduleName === 'cordis:probe'))
      .toMatchObject({ entryId: 'include:probe', enabled: false, fiberPhase: null, toggle: 'available' })

    await second.inventory.setEnabled('include:probe' as PluginEntryId, true)
    expect(second.ctx.loader.resolve('include:probe').fiber).toBeDefined()
    expect(readFileSync(configPath, 'utf8')).toBe(LEAF_CONFIG)
    expect(CountingInclude.writes).toBe(0)

    const third = await boot(dir, patchPath)
    expect(third.inventory.list().entries.find(entry => entry.moduleName === 'cordis:probe'))
      .toMatchObject({ enabled: true })
  })

  it('keeps the composing Include and runtime rows out of the projection', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-plugin-composition-'))
    writeFileSync(join(dir, 'cordis.yml'), LEAF_CONFIG)
    const patchPath = join(dir, 'cordis.patch.yml')
    writeFileSync(patchPath, PATCH_TEMPLATE)

    const booted = await boot(dir, patchPath)
    const runtimeId = await booted.ctx.loader.create({ name: 'cordis:probe' })

    const listed = booted.inventory.list().entries.map(entry => entry.entryId)
    expect(listed).toEqual(['include:probe'])

    await expect(booted.inventory.setEnabled('include' as PluginEntryId, false))
      .rejects.toMatchObject({ code: 'ENTRY_NOT_FOUND' })
    await expect(booted.inventory.setEnabled(runtimeId as PluginEntryId, false))
      .rejects.toMatchObject({ code: 'ENTRY_NOT_FOUND' })
    expect(booted.ctx.loader.resolve('include').fiber).toBeDefined()
  })
})
