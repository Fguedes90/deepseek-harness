import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CATEGORY_ORDER, PLUGIN_CATALOG, categoryOf } from '../src/client/catalog.ts'
import { summariesEn, summariesPt, summariesZh } from '../src/client/plugin-summaries.ts'

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

describe('PLUGIN_CATALOG', () => {
  it('describes every row the shipped web surface composes', () => {
    const composed = moduleSpecifiers(BASE_COMPOSITION, WEB_COMPOSITION)
    expect([...composed].filter(name => !Object.hasOwn(PLUGIN_CATALOG, name))).toEqual([])
  })

  it('describes nothing neither shipped composition carries', () => {
    const composed = moduleSpecifiers(BASE_COMPOSITION, WEB_COMPOSITION)
    expect(Object.keys(PLUGIN_CATALOG).filter(name => !composed.has(name))).toEqual([])
  })

  it('is checked against a set that rejects a name no bundle row carries', () => {
    expect(moduleSpecifiers(BASE_COMPOSITION, WEB_COMPOSITION).has('@deepseek-ai/dsh-not-a-bundle-row')).toBe(false)
  })

  it('carries a subpath row under its literal specifier', () => {
    // A subpath entry is a distinct row with its own copy, not a duplicate of its package.
    expect(categoryOf('@deepseek-ai/dsh-web-app/startup')).toBe('system')
    expect(categoryOf('@deepseek-ai/dsh-tool-subagent-control/list-agents')).toBe('tools')
  })

  it('groups a specifier outside the catalog under other', () => {
    expect(categoryOf('@fixture/third-party-plugin')).toBe('other')
  })

  it('claims only categories the render order lists, and never other', () => {
    for (const [name, category] of Object.entries(PLUGIN_CATALOG)) {
      expect(CATEGORY_ORDER, name).toContain(category)
      expect(category, name).not.toBe('other')
    }
  })

  it('keeps every dictionary on the same non-empty sentence per row', () => {
    for (const name of Object.keys(PLUGIN_CATALOG) as (keyof typeof summariesZh)[]) {
      expect(summariesZh[name].length, name).toBeGreaterThan(0)
      expect(summariesEn[name].length, name).toBeGreaterThan(0)
      expect(summariesPt[name].length, name).toBeGreaterThan(0)
    }
  })

  it('keeps every pt summary within the one-sentence copy budget', () => {
    for (const name of Object.keys(PLUGIN_CATALOG) as (keyof typeof summariesZh)[]) {
      const sentence = summariesPt[name]
      expect(Array.from(sentence).length, name).toBeLessThanOrEqual(90)
      expect(sentence.endsWith('.'), name).toBe(false)
    }
  })
})
