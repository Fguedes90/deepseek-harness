// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PluginInventorySettingsTab } from '../src/client/PluginInventorySettingsTab.tsx'
import type {
  PluginInventorySettingsTabInjected,
  PluginInventorySettingsTabProps,
} from '../src/client/PluginInventorySettingsTab.tsx'
import { en, pt, summaryKey, type PluginInventoryLocaleKey } from '../src/client/locales.ts'

afterEach(cleanup)

type Snapshot = Awaited<ReturnType<PluginInventorySettingsTabInjected['list']>>
const t = ((key: PluginInventoryLocaleKey): string => en[key]) as PluginInventorySettingsTabProps['t']
const ptT = ((key: PluginInventoryLocaleKey): string => pt[key]) as PluginInventorySettingsTabProps['t']

function props(
  list: PluginInventorySettingsTabInjected['list'],
  overrides: Partial<Pick<PluginInventorySettingsTabInjected, 'setEnabled' | 'subscribe'>>
    & { t?: PluginInventorySettingsTabProps['t'] } = {},
): PluginInventorySettingsTabProps {
  return {
    t,
    list,
    setEnabled: async () => SNAPSHOT,
    subscribe: () => () => {},
    ...overrides,
  } as PluginInventorySettingsTabProps
}

const SNAPSHOT = {
  entries: [
    { entryId: '8a1b2c3d', moduleName: '@deepseek-ai/cordis-plugin-hmr', enabled: true, fiberPhase: 'active', toggle: 'available' },
    { entryId: 'pending', moduleName: 'cordis:pending-name', enabled: true, fiberPhase: 'pending', toggle: 'available' },
    { entryId: 'loading', moduleName: '@fixture/loading-name', enabled: true, fiberPhase: 'loading', toggle: 'available' },
    { entryId: 'failed', moduleName: '@fixture/failed-name', enabled: true, fiberPhase: 'failed', toggle: 'available' },
    { entryId: 'unloading', moduleName: '@fixture/unloading-name', enabled: true, fiberPhase: 'unloading', toggle: 'available' },
    { entryId: 'unobserved', moduleName: '@fixture/unobserved-name', enabled: true, fiberPhase: null, toggle: 'protected' },
    { entryId: 'disabled-entry', moduleName: '@deepseek-ai/dsh-host-directory-picker-native', enabled: false, fiberPhase: null, toggle: 'available' },
    { entryId: 'inherited-entry', moduleName: '@deepseek-ai/cordis-plugin-group', enabled: false, fiberPhase: null, toggle: 'inherited' },
    { entryId: 'expression-entry', moduleName: '@fixture/expression-name', enabled: false, fiberPhase: null, toggle: 'expression' },
  ],
} as unknown as Snapshot

/** Locate the enable checkbox of one inventory row by its entry id. */
function checkboxOf(entryId: string): HTMLInputElement {
  const li = document.querySelector(`[data-plugin-entry="${entryId}"]`)
  if (!li) throw new Error(`no row for ${entryId}`)
  const control = li.querySelector('input[type="checkbox"]')
  if (!(control instanceof HTMLInputElement)) throw new Error(`no checkbox for ${entryId}`)
  return control
}

describe('PluginInventorySettingsTab', () => {
  it('renders the Portuguese copy when the active locale is pt', async () => {
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT, { t: ptT })} />)
    const search = await screen.findByRole('searchbox', { name: pt.search })
    expect(screen.getByRole('heading', { name: pt.catalog })).toBeTruthy()
    // A catalog row exposes its pt summary; an undescribed row shows none.
    expect(screen.getByText(pt[summaryKey('@deepseek-ai/cordis-plugin-hmr')])).toBeTruthy()
    fireEvent.change(search, { target: { value: 'não existe' } })
    expect(screen.getByText(pt.emptySearch)).toBeTruthy()
  })

  it('renders runtime status only for enabled plugins', async () => {
    const deferred = Promise.withResolvers<Snapshot>()
    const list = vi.fn(() => deferred.promise)
    const view = render(<PluginInventorySettingsTab {...props(list)} />)
    expect(screen.getByText(en.loading)).toBeTruthy()

    await act(async () => { deferred.resolve(SNAPSHOT) })
    expect(list).toHaveBeenCalledOnce()
    expect(screen.getByRole('searchbox', { name: en.search })).toBeTruthy()
    expect(screen.getByRole('heading', { name: en.catalog })).toBeTruthy()
    expect(view.container.querySelector('[data-plugin-count]')?.textContent).toBe('9')
    expect(screen.getAllByRole('listitem')).toHaveLength(9)
    expect(screen.getAllByText(en.enabledTag)).toHaveLength(6)
    expect(screen.getAllByText(en.disabledTag)).toHaveLength(3)
    for (const value of [
      'Mounted',
      'Waiting for dependencies',
      'Loading',
      'Mount failed',
      'Unloading',
      'Not mounted',
    ]) {
      expect(screen.getByRole('img', { name: value })).toBeTruthy()
    }
    const active = screen.getByRole('button', { name: 'hmr, Mounted, Enabled' })
    expect(active.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(active)
    expect(active.getAttribute('aria-expanded')).toBe('true')
    expect(view.container.querySelector('[data-loader-entry]')?.textContent).toBe('8a1b2c3d')
    expect(screen.getByText(en.configuration)).toBeTruthy()
    expect(screen.getByText(en.cordis)).toBeTruthy()
    fireEvent.click(active)
    expect(view.container.querySelector('[data-loader-entry]')).toBeNull()

    fireEvent.click(active)
    fireEvent.change(screen.getByRole('searchbox', { name: en.search }), {
      target: { value: 'disabled-entry' },
    })
    expect(view.container.querySelector('[data-loader-entry]')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'directory-picker-native, Disabled' }))
    expect(screen.getAllByText(en.disabledTag)).toHaveLength(2)
    expect(screen.queryByText(en.cordis)).toBeNull()
    expect(screen.queryByText(en.unobserved)).toBeNull()
  })

  it('filters by module name or Loader entry id', async () => {
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT)} />)
    const search = await screen.findByRole('searchbox', { name: en.search })

    fireEvent.change(search, { target: { value: 'disabled-entry' } })
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('directory-picker-native')).toBeTruthy()

    fireEvent.change(search, { target: { value: 'cordis-plugin-hmr' } })
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('hmr')).toBeTruthy()

    fireEvent.change(search, { target: { value: 'not-a-plugin' } })
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText(en.emptySearch)).toBeTruthy()
  })

  it('renders a summary for catalog rows and none for undescribed rows', async () => {
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT)} />)
    await screen.findByRole('searchbox', { name: en.search })

    // Only `@deepseek-ai/cordis-plugin-hmr` is described by the catalog; every
    // `@fixture/*` and native host row is an undescribed third-party plugin.
    const summary: PluginInventoryLocaleKey = 'summary.@deepseek-ai/cordis-plugin-hmr'
    expect(screen.getByText(en[summary])).toBeTruthy()
    // The compact card clamps the sentence; hovering it reveals the full text.
    expect(screen.getByText(en[summary]).getAttribute('title')).toBe(en[summary])
    const trailing = screen.getByRole('button', { name: 'directory-picker-native, Disabled' })
    expect(trailing.textContent).not.toContain(en[summary])
  })

  it('groups undescribed rows under the other category and search matches summaries', async () => {
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT)} />)
    const search = await screen.findByRole('searchbox', { name: en.search })

    // The catalog row lands under System; the eight fixture rows under Other.
    expect(screen.getByRole('heading', { name: /^System & runtime/ })).toBeTruthy()
    const other = screen.getByRole('heading', { name: /^Other/ })
    expect(other.textContent).toContain('8')

    // Search the localized summary text of the one described row.
    fireEvent.change(search, { target: { value: 'Reloads changed code automatically' } })
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('hmr')).toBeTruthy()
  })

  it('shows a generic failure and retries into the empty state', async () => {
    const list = vi.fn<PluginInventorySettingsTabInjected['list']>()
      .mockRejectedValueOnce(new Error('private transport detail'))
      .mockResolvedValueOnce({ entries: [] })
    render(<PluginInventorySettingsTab {...props(list)} />)

    expect((await screen.findByRole('alert')).textContent).toBe(en.error)
    expect(screen.queryByText('private transport detail')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: en.retry }))
    await waitFor(() => { expect(list).toHaveBeenCalledTimes(2) })
    expect(await screen.findByText(en.empty)).toBeTruthy()
  })

  it('contains a synchronous Remote failure and ignores a result after unmount', async () => {
    const syncFailure = vi.fn(() => { throw new Error('namespace unavailable') }) as PluginInventorySettingsTabInjected['list']
    const failed = render(<PluginInventorySettingsTab {...props(syncFailure)} />)
    expect((await screen.findByRole('alert')).textContent).toBe(en.error)
    failed.unmount()

    const deferred = Promise.withResolvers<Snapshot>()
    const pending = render(<PluginInventorySettingsTab {...props(() => deferred.promise)} />)
    pending.unmount()
    await act(async () => { deferred.resolve(SNAPSHOT) })

    const deferredFailure = Promise.withResolvers<Snapshot>()
    const pendingFailure = render(<PluginInventorySettingsTab {...props(() => deferredFailure.promise)} />)
    pendingFailure.unmount()
    await act(async () => { deferredFailure.reject(new Error('late failure')) })
  })

  it('applies the returned snapshot in place to update the toggled row', async () => {
    const list = vi.fn<PluginInventorySettingsTabInjected['list']>().mockResolvedValue(SNAPSHOT)
    const enabled = {
      ...SNAPSHOT,
      entries: SNAPSHOT.entries.map(entry =>
        entry.entryId === 'disabled-entry' ? { ...entry, enabled: true } : entry),
    } as Snapshot
    const setEnabled = vi.fn<PluginInventorySettingsTabInjected['setEnabled']>()
      .mockResolvedValue(enabled)
    render(<PluginInventorySettingsTab {...props(list, { setEnabled })} />)
    await screen.findByRole('searchbox', { name: en.search })

    expect(screen.queryByText(en.confirmTitle)).toBeNull()
    fireEvent.click(checkboxOf('disabled-entry'))

    await waitFor(() => { expect(setEnabled).toHaveBeenCalledOnce() })
    expect(setEnabled).toHaveBeenCalledWith('disabled-entry', true)
    expect(screen.queryByText(en.confirmTitle)).toBeNull()
    await waitFor(() => { expect(checkboxOf('disabled-entry').checked).toBe(true) })
    // `subscribe` is a never-firing no-op here, so the forwarded-change reload
    // path is not exercised (it is covered by the dedicated reload test); this
    // only proves applying the resolved snapshot needs no fresh read.
    expect(list).toHaveBeenCalledTimes(1)
  })

  it('exposes the saving state while a toggle is pending', async () => {
    const deferred = Promise.withResolvers<Snapshot>()
    const setEnabled = vi.fn<PluginInventorySettingsTabInjected['setEnabled']>()
      .mockReturnValue(deferred.promise)
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT, { setEnabled })} />)
    await screen.findByRole('searchbox', { name: en.search })

    fireEvent.click(checkboxOf('disabled-entry'))
    expect(checkboxOf('disabled-entry').disabled).toBe(true)
    expect(screen.getByText(en.saving)).toBeTruthy()
    expect(checkboxOf('disabled-entry').getAttribute('aria-busy')).toBe('true')

    await act(async () => {
      deferred.resolve({
        ...SNAPSHOT,
        entries: SNAPSHOT.entries.map(entry =>
          entry.entryId === 'disabled-entry' ? { ...entry, enabled: true } : entry),
      })
    })
    expect(screen.queryByText(en.saving)).toBeNull()
    expect(checkboxOf('disabled-entry').disabled).toBe(false)
  })

  it('keeps each row\'s saving state independent while toggles overlap', async () => {
    const snapshot = {
      entries: [
        { entryId: 'a', moduleName: '@fixture/a', enabled: false, fiberPhase: null, toggle: 'available' },
        { entryId: 'b', moduleName: '@fixture/b', enabled: false, fiberPhase: null, toggle: 'available' },
      ],
    } as unknown as Snapshot
    const first = Promise.withResolvers<Snapshot>()
    const second = Promise.withResolvers<Snapshot>()
    const setEnabled = vi.fn<PluginInventorySettingsTabInjected['setEnabled']>()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    render(<PluginInventorySettingsTab {...props(async () => snapshot, { setEnabled })} />)
    await screen.findByRole('searchbox', { name: en.search })

    fireEvent.click(checkboxOf('a'))
    fireEvent.click(checkboxOf('b'))
    expect(checkboxOf('a').disabled).toBe(true)
    expect(checkboxOf('b').disabled).toBe(true)
    expect(screen.getAllByText(en.saving)).toHaveLength(2)

    // Resolving only row a must not clear row b's in-flight state.
    await act(async () => {
      first.resolve({
        ...snapshot,
        entries: snapshot.entries.map(entry =>
          entry.entryId === 'a' ? { ...entry, enabled: true } : entry),
      })
    })
    expect(checkboxOf('a').disabled).toBe(false)
    expect(checkboxOf('b').disabled).toBe(true)
    expect(screen.getAllByText(en.saving)).toHaveLength(1)

    await act(async () => {
      second.resolve({
        ...snapshot,
        entries: snapshot.entries.map(entry =>
          entry.entryId === 'b' ? { ...entry, enabled: true } : entry),
      })
    })
    expect(checkboxOf('b').disabled).toBe(false)
    expect(screen.queryByText(en.saving)).toBeNull()
  })

  it('gates a disable behind RiskConfirmation until acknowledged and confirmed', async () => {
    const setEnabled = vi.fn<PluginInventorySettingsTabInjected['setEnabled']>()
      .mockResolvedValue(SNAPSHOT)
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT, { setEnabled })} />)
    await screen.findByRole('searchbox', { name: en.search })

    fireEvent.click(checkboxOf('8a1b2c3d'))
    expect(screen.getByText(en.confirmTitle)).toBeTruthy()
    expect(setEnabled).not.toHaveBeenCalled()

    const confirm = screen.getByRole('button', { name: en.confirmDisable })
    expect((confirm as HTMLButtonElement).disabled).toBe(true)
    const acknowledge = screen.getByRole('checkbox', { name: en.confirmAcknowledge })
    fireEvent.click(acknowledge)
    expect((confirm as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(confirm)
    await waitFor(() => { expect(setEnabled).toHaveBeenCalledOnce() })
    expect(setEnabled).toHaveBeenCalledWith('8a1b2c3d', false)
    expect(screen.queryByText(en.confirmTitle)).toBeNull()
  })

  it('cancelling the confirmation calls nothing', async () => {
    const setEnabled = vi.fn<PluginInventorySettingsTabInjected['setEnabled']>()
      .mockResolvedValue(SNAPSHOT)
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT, { setEnabled })} />)
    await screen.findByRole('searchbox', { name: en.search })

    fireEvent.click(checkboxOf('8a1b2c3d'))
    fireEvent.click(screen.getByRole('button', { name: en.confirmCancel }))
    expect(screen.queryByText(en.confirmTitle)).toBeNull()
    expect(setEnabled).not.toHaveBeenCalled()
  })

  it('renders non-available toggle states as disabled controls with their rationale', async () => {
    render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT)} />)
    await screen.findByRole('searchbox', { name: en.search })

    const protectedCheckbox = checkboxOf('unobserved')
    expect(protectedCheckbox.disabled).toBe(true)
    expect(protectedCheckbox.getAttribute('aria-description')).toBe(en.toggleProtected)

    const inheritedCheckbox = checkboxOf('inherited-entry')
    expect(inheritedCheckbox.disabled).toBe(true)
    expect(inheritedCheckbox.getAttribute('aria-description')).toBe(en.toggleInherited)

    const expressionCheckbox = checkboxOf('expression-entry')
    expect(expressionCheckbox.disabled).toBe(true)
    expect(expressionCheckbox.getAttribute('aria-description')).toBe(en.toggleExpression)
  })

  it('surfaces a rejected toggle as a mutation alert and keeps the previous snapshot', async () => {
    const list = vi.fn<PluginInventorySettingsTabInjected['list']>().mockResolvedValue(SNAPSHOT)
    const setEnabled = vi.fn<PluginInventorySettingsTabInjected['setEnabled']>()
      .mockRejectedValue(new Error('pluginInventory.setEnabled failed: PATCH_WRITE_FAILED: unwritable'))
    render(<PluginInventorySettingsTab {...props(list, { setEnabled })} />)
    await screen.findByRole('searchbox', { name: en.search })

    fireEvent.click(checkboxOf('disabled-entry'))
    expect((await screen.findByRole('alert')).textContent).toBe(en.mutationError)
    expect(checkboxOf('disabled-entry').checked).toBe(false)
    expect(screen.getAllByText(en.disabledTag).length).toBeGreaterThan(0)
    expect(list).toHaveBeenCalledTimes(1)
  })

  it('reloads when the Host reports an external enablement change', async () => {
    const list = vi.fn<PluginInventorySettingsTabInjected['list']>().mockResolvedValue(SNAPSHOT)
    let listener: (() => void) | undefined
    const subscribe = vi.fn<PluginInventorySettingsTabInjected['subscribe']>((fn) => {
      listener = fn
      return () => {}
    })
    render(<PluginInventorySettingsTab {...props(list, { subscribe })} />)
    await screen.findByRole('searchbox', { name: en.search })
    expect(list).toHaveBeenCalledTimes(1)
    expect(subscribe).toHaveBeenCalledOnce()

    await act(async () => { listener?.() })
    await waitFor(() => { expect(list).toHaveBeenCalledTimes(2) })
  })

  it('ignores a successful toggle resolution after unmount', async () => {
    const deferred = Promise.withResolvers<Snapshot>()
    const setEnabled = vi.fn<PluginInventorySettingsTabInjected['setEnabled']>().mockReturnValue(deferred.promise)
    const view = render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT, { setEnabled })} />)
    await screen.findByRole('searchbox', { name: en.search })

    fireEvent.click(checkboxOf('disabled-entry'))
    view.unmount()
    await act(async () => { deferred.resolve(SNAPSHOT) })
  })

  it('ignores a rejected toggle resolution after unmount', async () => {
    const deferred = Promise.withResolvers<Snapshot>()
    const setEnabled = vi.fn<PluginInventorySettingsTabInjected['setEnabled']>().mockReturnValue(deferred.promise)
    const view = render(<PluginInventorySettingsTab {...props(async () => SNAPSHOT, { setEnabled })} />)
    await screen.findByRole('searchbox', { name: en.search })

    fireEvent.click(checkboxOf('disabled-entry'))
    view.unmount()
    await act(async () => { deferred.reject(new Error('late failure')) })
  })
})
