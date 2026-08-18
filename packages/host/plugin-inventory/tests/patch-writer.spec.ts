import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderPatchDocument, writePluginPatch } from '../src/patch-writer.ts'

const tmp = (): string => mkdtempSync(join(tmpdir(), 'dsh-plugin-patch-'))

describe('renderPatchDocument', () => {
  it('starts a block sequence when the layer does not exist yet', () => {
    expect(renderPatchDocument(undefined, { id: 'probe', name: 'pkg', disabled: true })).toBe([
      '- id: probe',
      '  name: pkg',
      '  disabled: true',
      '',
    ].join('\n'))
  })

  it('keeps the comments and the empty-array template of a fresh profile', () => {
    const template = '# Your patch layer for this dsh profile.\n[]\n'
    expect(renderPatchDocument(template, { id: 'probe', name: 'pkg', disabled: true })).toBe([
      '# Your patch layer for this dsh profile.',
      '- id: probe',
      '  name: pkg',
      '  disabled: true',
      '',
    ].join('\n'))
  })

  it('adds the sequence to a layer that holds only comments', () => {
    expect(renderPatchDocument('# nothing configured yet\n', { id: 'probe', name: 'pkg', disabled: false })).toBe([
      '# nothing configured yet',
      '',
      '- id: probe',
      '  name: pkg',
      '  disabled: false',
      '',
    ].join('\n'))
  })

  it('updates the matching row in place and leaves comments and neighbours untouched', () => {
    const current = [
      '# top comment',
      '- id: other',
      '  # keep this note',
      '  config:',
      '    value: 1',
      '- id: probe',
      '  name: pkg',
      '  disabled: false',
      '',
    ].join('\n')
    expect(renderPatchDocument(current, { id: 'probe', name: 'pkg', disabled: true })).toBe([
      '# top comment',
      '- id: other',
      '  # keep this note',
      '  config:',
      '    value: 1',
      '- id: probe',
      '  name: pkg',
      '  disabled: true',
      '',
    ].join('\n'))
  })

  it('appends the module name to a row that only carried config overrides', () => {
    const current = '- id: probe\n  config:\n    value: 1\n'
    expect(renderPatchDocument(current, { id: 'probe', name: 'pkg', disabled: true })).toBe([
      '- id: probe',
      '  config:',
      '    value: 1',
      '  name: pkg',
      '  disabled: true',
      '',
    ].join('\n'))
  })

  it('refuses a layer that does not parse', () => {
    expect(() => renderPatchDocument('- id: probe\n   bad: [', { id: 'probe', name: 'pkg', disabled: true }))
      .toThrow(/PATCH_WRITE_FAILED|does not parse/)
  })

  it('refuses a layer that is not a top-level array', () => {
    expect(() => renderPatchDocument('id: probe\n', { id: 'probe', name: 'pkg', disabled: true }))
      .toThrow(/top-level YAML array/)
  })
})

describe('writePluginPatch', () => {
  it('creates the layer, then upserts into it', async () => {
    const patchPath = join(tmp(), 'profile', 'cordis.patch.yml')
    await writePluginPatch(patchPath, { id: 'probe', name: 'pkg', disabled: true })
    expect(readFileSync(patchPath, 'utf8')).toContain('disabled: true')

    await writePluginPatch(patchPath, { id: 'probe', name: 'pkg', disabled: false })
    const text = readFileSync(patchPath, 'utf8')
    expect(text).toContain('disabled: false')
    expect(text).not.toContain('disabled: true')
  })

  it('re-reads the layer inside the lock, so a concurrent edit is never resurrected', async () => {
    const patchPath = join(tmp(), 'cordis.patch.yml')
    await writePluginPatch(patchPath, { id: 'first', name: 'pkg-a', disabled: true })
    writeFileSync(patchPath, '- id: second\n  name: pkg-b\n  disabled: true\n')

    await writePluginPatch(patchPath, { id: 'first', name: 'pkg-a', disabled: true })
    const text = readFileSync(patchPath, 'utf8')
    expect(text).toContain('id: second')
    expect(text).toContain('id: first')
  })

  it('reports a destination it cannot create', async () => {
    const dir = tmp()
    const blocker = join(dir, 'blocker')
    writeFileSync(blocker, '')
    await expect(writePluginPatch(join(blocker, 'cordis.patch.yml'), { id: 'probe', name: 'pkg', disabled: true }))
      .rejects.toMatchObject({ code: 'PATCH_WRITE_FAILED' })
  })

  it('reports a destination it cannot read', async () => {
    const patchPath = join(tmp(), 'cordis.patch.yml')
    mkdirSync(patchPath)
    await expect(writePluginPatch(patchPath, { id: 'probe', name: 'pkg', disabled: true }))
      .rejects.toMatchObject({ code: 'PATCH_WRITE_FAILED' })
  })

  it('passes an unparsable layer through as the same failure class', async () => {
    const patchPath = join(tmp(), 'cordis.patch.yml')
    writeFileSync(patchPath, '- id: probe\n   bad: [\n')
    await expect(writePluginPatch(patchPath, { id: 'probe', name: 'pkg', disabled: true }))
      .rejects.toMatchObject({ code: 'PATCH_WRITE_FAILED' })
  })
})
