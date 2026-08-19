import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PROTECTED_MODULES } from '../src/protected.ts'

const BASE_COMPOSITION = '../../../bundle/base/cordis.patch.yml'
const WEB_COMPOSITION = '../../../bundle/web-app/cordis.patch.yml'

/** Module specifiers of every row the given shipped composition files carry. */
function moduleSpecifiers(...files: string[]): ReadonlySet<string> {
  const modules = new Set<string>()
  for (const relative of files) {
    const text = readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8')
    for (const match of text.matchAll(/^\s*-?\s*name:\s*['"]?([^'"\s]+)['"]?\s*$/gm)) {
      modules.add(match[1]!)
    }
  }
  return modules
}

describe('PROTECTED_MODULES', () => {
  it('names only rows the shipped web surface actually composes', () => {
    const composed = moduleSpecifiers(BASE_COMPOSITION, WEB_COMPOSITION)
    expect([...PROTECTED_MODULES].filter(name => !composed.has(name))).toEqual([])
  })

  it('is checked against a set that rejects a name no bundle row carries', () => {
    expect(moduleSpecifiers(BASE_COMPOSITION, WEB_COMPOSITION).has('@deepseek-ai/dsh-not-a-bundle-row')).toBe(false)
  })

  it('covers the whole path a browser needs to undo its own change', () => {
    for (const name of [
      '@deepseek-ai/dsh-host-webserver',
      '@deepseek-ai/dsh-api-gateway',
      '@deepseek-ai/dsh-host-plugin-inventory',
      '@deepseek-ai/dsh-client-ui-settings-plugin-inventory',
      '@deepseek-ai/dsh-web-app/startup',
      '@deepseek-ai/dsh-client-ui-theme',
      '@deepseek-ai/dsh-client-locale',
      '@deepseek-ai/dsh-client-ui-settings-plugins',
    ]) {
      expect(PROTECTED_MODULES.has(name)).toBe(true)
    }
  })

  it('protects the rows the web tab depends on to render its own undo affordance', () => {
    // Each specifier must still be composed by the shipped web surface, then
    // be protected — a rename or a move into an unprotected layer cannot
    // silently leave the undo affordance disableable.
    const webRows = moduleSpecifiers(WEB_COMPOSITION)
    const loadBearing = [
      // The shell renders nothing without this service it injects into the
      // protected ui-layout; the tab cannot even draw its toggle without it.
      '@deepseek-ai/dsh-client-ui-theme',
      // The tab registers its strings into this service it injects; without
      // it no tab mounts, so there is no surface to undo a disable from.
      '@deepseek-ai/dsh-client-locale',
      // Owns the settings.plugins.tab slot the inventory tab registers into
      // and the plugin settings section the toggle is issued from.
      '@deepseek-ai/dsh-client-ui-settings-plugins',
    ]
    for (const name of loadBearing) {
      expect(webRows.has(name)).toBe(true)
      expect(PROTECTED_MODULES.has(name)).toBe(true)
    }
  })
})
