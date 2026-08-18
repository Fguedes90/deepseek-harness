import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PROTECTED_MODULES } from '../src/protected.ts'

/** Module specifiers of every row the shipped web surface composes. */
function webBundleModules(): ReadonlySet<string> {
  const modules = new Set<string>()
  for (const relative of ['../../../bundle/base/cordis.patch.yml', '../../../bundle/web-app/cordis.patch.yml']) {
    const text = readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8')
    for (const match of text.matchAll(/^\s*-?\s*name:\s*['"]?([^'"\s]+)['"]?\s*$/gm)) {
      modules.add(match[1]!)
    }
  }
  return modules
}

describe('PROTECTED_MODULES', () => {
  it('names only rows the shipped web surface actually composes', () => {
    const composed = webBundleModules()
    expect([...PROTECTED_MODULES].filter(name => !composed.has(name))).toEqual([])
  })

  it('is checked against a set that rejects a name no bundle row carries', () => {
    expect(webBundleModules().has('@deepseek-ai/dsh-not-a-bundle-row')).toBe(false)
  })

  it('covers the whole path a browser needs to undo its own change', () => {
    for (const name of [
      '@deepseek-ai/dsh-host-webserver',
      '@deepseek-ai/dsh-api-gateway',
      '@deepseek-ai/dsh-host-plugin-inventory',
      '@deepseek-ai/dsh-client-ui-settings-plugin-inventory',
      '@deepseek-ai/dsh-web-app/startup',
    ]) {
      expect(PROTECTED_MODULES.has(name)).toBe(true)
    }
  })
})
