/**
 * Id-targeted upsert into the profile's user patch layer.
 *
 * The Loader's own `EntryTree.update()` persists through the containing tree,
 * which for a booted harness is the root Include: it rewrites the composed
 * entry list — every bundle row, materialized — over the leaf `cordis.yml`.
 * A user override belongs in the layer the user owns, so this module edits
 * `cordis.patch.yml` directly and leaves the composition alone.
 *
 * @module @deepseek-ai/dsh-host-plugin-inventory/patch-writer
 */

import { mkdir, readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { Document, isMap, isSeq, parseDocument } from 'yaml'
import { withFileLock, writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { errorChain } from '@deepseek-ai/dsh-llm'
import { PluginInventoryError } from './error.ts'

/** One enablement override, as the patch layer records it. */
export interface PluginPatchRow {
  /** The composed row's own Loader id, without any tree prefix. */
  readonly id: string
  /**
   * The module specifier the id must still resolve to. `applyEntryPatches`
   * skips a patch whose `name` disagrees with the row it matched, so an
   * override left behind by a composition change can never disable a
   * different plugin that inherited the id.
   */
  readonly name: string
  /** The literal `disabled` value to record. */
  readonly disabled: boolean
}

/**
 * Render the patch document with one row's `disabled` set, editing the parsed
 * tree so comments and every untouched row survive verbatim.
 * @param text - the current document text, `undefined` while the file is absent.
 * @param row - the override to record.
 * @returns the text to persist.
 * @throws {PluginInventoryError} `PATCH_WRITE_FAILED` when the existing file is
 * not a YAML sequence, which is the only shape a patch layer may have.
 */
export function renderPatchDocument(text: string | undefined, row: PluginPatchRow): string {
  const document = text === undefined ? new Document([]) : parseDocument(text)
  if (document.errors.length > 0) {
    throw new PluginInventoryError(
      `the profile patch layer does not parse: ${document.errors.map(error => error.message).join('; ')}`,
      'PATCH_WRITE_FAILED',
    )
  }
  // A comments-only file parses to no contents at all.
  if (document.contents === null) {
    document.contents = document.createNode([])
  }
  const seq = document.contents
  if (!isSeq(seq)) {
    throw new PluginInventoryError(
      'the profile patch layer must be a top-level YAML array of loader patch entries',
      'PATCH_WRITE_FAILED',
    )
  }
  seq.flow = false
  const existing = seq.items.find(item => isMap(item) && item.get('id') === row.id)
  if (isMap(existing)) {
    existing.set('name', row.name)
    existing.set('disabled', row.disabled)
  } else {
    seq.add(document.createNode({ id: row.id, name: row.name, disabled: row.disabled }))
  }
  return document.toString()
}

/**
 * Record one enablement override in the profile's patch layer, serialized
 * against every other writer of that file.
 * @param patchPath - absolute path of the profile's `cordis.patch.yml`.
 * @param row - the override to record.
 * @throws {PluginInventoryError} `PATCH_WRITE_FAILED` when the file cannot be
 * read, parsed, or replaced.
 */
export async function writePluginPatch(patchPath: string, row: PluginPatchRow): Promise<void> {
  try {
    // The writer lock's exclusive create needs the parent to exist; 0700
    // because the harness home holds user-private data.
    await mkdir(dirname(patchPath), { recursive: true, mode: 0o700 })
    await withFileLock(patchPath, async () => {
      // Read inside the lock: the composed layer on disk may have moved since
      // this process last read it, and an override must never resurrect a
      // state another writer or a hand edit just replaced.
      let text: string | undefined
      try {
        text = await readFile(patchPath, 'utf8')
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      }
      await writeFileAtomic(patchPath, renderPatchDocument(text, row), { mode: 0o600, dirMode: 0o700 })
    })
  } catch (cause) {
    if (cause instanceof PluginInventoryError) throw cause
    throw new PluginInventoryError(
      `failed to record the enablement override for ${row.id} in ${patchPath}: ${errorChain(cause)}`,
      'PATCH_WRITE_FAILED',
      { cause },
    )
  }
}
