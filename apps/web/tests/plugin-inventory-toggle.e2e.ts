// Web e2e scenario: the plugin list in Plugins settings disables a running
// plugin and turns it back on — the acknowledgement gate, the runtime Loader
// effect, and the override recorded in the profile's own patch layer. Zero
// model calls: the whole round trip is client state, the real Remote, and the
// two files the Host owns, so a stray stream would fail loud on the open llm
// seam.
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import type { Browser, Page } from 'playwright'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, expect, it, onTestFailed } from 'vitest'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import {
  assertFixtureInventory, captureStableAria, compareOrRefreshGolden,
  launchWebScaffold, watchConsole, webSnapshotMode, type WebScaffold,
} from './scaffold.ts'
import { ZH_BROWSER_LOCALE, saveFailureShot } from './support.ts'

const SNAPSHOT_DIR = fileURLToPath(new URL('./snapshots/plugin-inventory-toggle', import.meta.url))
const TAB_EXPECTED = join(SNAPSHOT_DIR, 'tab.expected.md')
const MODE = webSnapshotMode()

// The row under test: the repeated-tool-call reminder is a leaf of the shipped
// composition — it only listens on the agent loop, so no other row injects it
// and no client surface reads it. Its mount state is observable here without
// being load-bearing for anything this scenario touches.
const ENTRY_ID = 'repeat-tool-reminder'

describe('web e2e: plugin enablement', () => {
  let scaffold: WebScaffold
  let browser: Browser
  let page: Page
  let tripwire: ReturnType<typeof watchConsole>

  beforeAll(async () => {
    scaffold = await launchWebScaffold({})
    const executablePath = process.env.DSH_PLAYWRIGHT_EXECUTABLE_PATH
    browser = await chromium.launch(executablePath === undefined ? {} : { executablePath })
    // Product default Chinese locale: the golden pins the registered
    // dictionary rather than a test-local translation callback.
    page = await browser.newPage({ viewport: { width: 1680, height: 1000 }, locale: ZH_BROWSER_LOCALE })
    tripwire = watchConsole(page)
    await page.goto(scaffold.baseUrl, { waitUntil: 'load' })
    await page.waitForSelector('[class*="frame"]', { timeout: 30_000 })
  }, 120_000)

  afterAll(async () => {
    await browser?.close()
    await scaffold?.close()
  })

  /** Open the settings dialog on the Plugins section's inventory tab. */
  async function openInventory() {
    const dialog = page.getByRole('dialog', { name: '设置' })
    if (await dialog.count() === 0) {
      await page.getByRole('button', { name: '设置', exact: true }).click()
      await dialog.waitFor({ timeout: 10_000 })
      await dialog.getByRole('button', { name: '插件', exact: true }).click()
      await dialog.getByRole('tab', { name: '插件列表', exact: true }).click()
    }
    await expect
      .poll(() => dialog.getByRole('tab', { name: '插件列表', exact: true }).getAttribute('aria-selected'), { timeout: 5_000 })
      .toBe('true')
    return dialog
  }

  /** The profile patch layer as the Host has written it so far. */
  async function patchLayer(): Promise<string> {
    return readFile(scaffold.profilePatchPath, 'utf8').catch(() => '')
  }

  /** The live Loader entry for the row under test, found by its own configured id. */
  function entry() {
    for (const candidate of scaffold.ctx.loader.entries()) {
      if (candidate.options.id === ENTRY_ID) return candidate
    }
    throw new Error(`web e2e: the composed tree has no ${ENTRY_ID} row`)
  }

  /** Whether the live Loader tree still runs the row under test. */
  function mounted(): boolean {
    return entry().fiber !== undefined
  }

  it('disables a running plugin behind an acknowledgement and records the override', async () => {
    onTestFailed(() => saveFailureShot(page, 'web-e2e-plugin-inventory-disable'))
    const dialog = await openInventory()
    await dialog.getByRole('searchbox', { name: '搜索插件' }).fill(ENTRY_ID)

    // The composed row carries its include's tree prefix; its own configured
    // id is the tail.
    const card = dialog.locator(`li[data-plugin-entry$=":${ENTRY_ID}"]`)
    await card.waitFor({ timeout: 10_000 })
    await expect.poll(() => dialog.locator('li[data-plugin-entry]').count(), { timeout: 5_000 }).toBe(1)
    expect(await card.getByText('已启用', { exact: true }).count()).toBe(1)
    expect(mounted()).toBe(true)

    const snapshot = await captureStableAria(page, '[role="dialog"]', scaffold.workspaceCwd)
    await compareOrRefreshGolden(TAB_EXPECTED, snapshot, MODE)

    // `click`, not `uncheck`: the disable path holds the box checked until the
    // acknowledgement resolves, so Playwright's state-change assertion in
    // `uncheck` would fail on the deliberate delay.
    await card.getByRole('checkbox', { name: '插件开关' }).click()
    const confirmation = page.getByRole('dialog', { name: '停用插件？' })
    await confirmation.waitFor({ timeout: 10_000 })
    const disable = confirmation.getByRole('button', { name: '停用', exact: true })
    // Nothing has crossed the wire yet: the acknowledgement is the decision.
    expect(await disable.isDisabled()).toBe(true)
    expect(await patchLayer()).not.toContain(ENTRY_ID)
    expect(mounted()).toBe(true)

    await confirmation.getByRole('checkbox', { name: '我了解停用的影响。' }).check()
    await disable.click()

    // Runtime first: the Loader disposes the row's Fiber for this live
    // process, and the card reports the new state from the returned snapshot.
    await expect.poll(() => mounted(), { timeout: 10_000 }).toBe(false)
    await expect.poll(() => card.getByText('已停用', { exact: true }).count(), { timeout: 10_000 }).toBe(1)
    expect(await card.getByRole('checkbox', { name: '插件开关' }).isChecked()).toBe(false)
    // Persistence second: the override lands in the profile's own patch layer,
    // which the next boot composes over the shipped bundles.
    await expect.poll(async () => (await patchLayer()).includes('disabled: true'), { timeout: 10_000 }).toBe(true)
    expect(await patchLayer()).toContain(`id: ${ENTRY_ID}`)
    expect(tripwire.pageErrors).toEqual([])
  }, 60_000)

  it('turns the plugin back on without a second acknowledgement', async () => {
    onTestFailed(() => saveFailureShot(page, 'web-e2e-plugin-inventory-enable'))
    const dialog = await openInventory()
    await dialog.getByRole('searchbox', { name: '搜索插件' }).fill(ENTRY_ID)
    const card = dialog.locator(`li[data-plugin-entry$=":${ENTRY_ID}"]`)
    await card.getByRole('checkbox', { name: '插件开关' }).click()

    // Re-enabling destroys nothing, so it applies straight through.
    expect(await page.getByRole('dialog', { name: '停用插件？' }).count()).toBe(0)
    await expect.poll(() => mounted(), { timeout: 10_000 }).toBe(true)
    await expect.poll(() => card.getByText('已启用', { exact: true }).count(), { timeout: 10_000 }).toBe(1)
    // The row stays in the layer, now recording the enablement it holds.
    await expect.poll(async () => (await patchLayer()).includes('disabled: false'), { timeout: 10_000 }).toBe(true)
    expect(tripwire.pageErrors).toEqual([])
  }, 60_000)

  it('keeps its snapshot inventory closed', async () => {
    expect(tripwire.warnings).toEqual([])
    await assertFixtureInventory(SNAPSHOT_DIR, ['tab.expected.md'])
  })
})
