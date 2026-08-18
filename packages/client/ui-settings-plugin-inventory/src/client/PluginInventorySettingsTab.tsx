import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import type { PluginInventorySnapshot } from '@deepseek-ai/dsh-api-remotes/client'
import {
  IconChevronDownOutline14,
  IconSearchOutline16,
  RiskConfirmation,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { PluginInventoryLocaleKey } from './locales.ts'
import css from './PluginInventorySettingsTab.module.css'

/** Registration-side Remote face used by the section. */
export interface PluginInventorySettingsTabInjected {
  /** Read a current Host inventory snapshot. */
  list: () => Promise<PluginInventorySnapshot>
  /** Persist an enable/disable toggle and resolve with the fresh snapshot. */
  setEnabled: (entryId: PluginInventoryEntry['entryId'], enabled: boolean) => Promise<PluginInventorySnapshot>
  /** Run a listener whenever the Host reports an external enablement change. */
  subscribe: (listener: () => void) => () => void
}

type PluginInventoryEntry = PluginInventorySnapshot['entries'][number]
type PluginInventoryToggle = PluginInventoryEntry['toggle']
type PluginFiberPhase = PluginInventoryEntry['fiberPhase']

/** Full component props assembled by the Settings slot renderer. */
export type PluginInventorySettingsTabProps =
  PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<'settings.pluginInventory'>
  & InjectFace<PluginInventorySettingsTabInjected>

type ViewState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly snapshot: PluginInventorySnapshot }

const PHASE_KEYS = {
  pending: 'pending',
  loading: 'loadingPhase',
  active: 'active',
  failed: 'failed',
  unloading: 'unloading',
} satisfies Record<Exclude<PluginFiberPhase, null>, PluginInventoryLocaleKey>

/** Mark an unreachable closed-union branch as a compile-time exhaustiveness check. */
/* v8 ignore start -- closed-union exhaustiveness: the default branch is unreachable, so this throw never runs. */
function assertNever(value: never): never {
  throw new Error(`unreachable toggle state: ${String(value)}`)
}
/* v8 ignore stop */

/** Localized rationale for one row's toggle state, or null when toggleable. */
function toggleReasonKey(toggle: PluginInventoryToggle): PluginInventoryLocaleKey | null {
  switch (toggle) {
    case 'available': return null
    case 'protected': return 'toggleProtected'
    case 'inherited': return 'toggleInherited'
    case 'expression': return 'toggleExpression'
    /* v8 ignore next -- closed union; every member handled above */
    default: return assertNever(toggle)
  }
}

/** Localized accessible label for one root Fiber phase. */
function phaseLabel(
  phase: PluginFiberPhase,
  t: PluginInventorySettingsTabProps['t'],
): string {
  return phase === null ? t('unobserved') : t(PHASE_KEYS[phase])
}

/** Compact a module specifier without guessing whether its Loader id was generated. */
function moduleShortName(moduleName: string): string {
  const unscoped = moduleName.startsWith('@') ? moduleName.slice(moduleName.indexOf('/') + 1) : moduleName
  return unscoped
    .replace(/^cordis:/, '')
    .replace(/^cordis-plugin-/, '')
    .replace(/^dsh-(?:host-|client-)?/, '')
}

/** Whether an inventory row matches the local catalog query. */
function matches(entry: PluginInventoryEntry, normalizedQuery: string): boolean {
  if (normalizedQuery.length === 0) return true
  return [entry.moduleName, entry.entryId]
    .some(value => value.toLocaleLowerCase().includes(normalizedQuery))
}

/** Render the current Loader inventory with an enable/disable toggle per row. */
export function PluginInventorySettingsTab({
  list,
  setEnabled,
  subscribe,
  t,
}: PluginInventorySettingsTabProps): ReactNode {
  const catalogId = useId()
  const [request, setRequest] = useState(0)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<PluginInventoryEntry['entryId'] | null>(null)
  const [state, setState] = useState<ViewState>({ status: 'loading' })
  // In-flight toggle entry ids, so concurrent toggles keep their own per-row
  // saving tag and disabled state instead of sharing one slot that the first
  // resolution would clear for every row.
  const [pending, setPending] = useState<ReadonlySet<PluginInventoryEntry['entryId']>>(() => new Set())
  const [confirming, setConfirming] = useState<PluginInventoryEntry['entryId'] | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [mutationError, setMutationError] = useState(false)
  const [failedEntry, setFailedEntry] = useState<PluginInventoryEntry['entryId'] | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    let current = true
    void Promise.resolve().then(() => list()).then(
      (snapshot) => { if (current) setState({ status: 'ready', snapshot }) },
      () => { if (current) setState({ status: 'error' }) },
    )
    return () => { current = false }
  }, [list, request])

  // Re-read when the Host reports an external enablement change, without
  // depending on a render-scoped callback identity.
  useEffect(() => {
    const reload = (): void => { setRequest(value => value + 1) }
    return subscribe(reload)
  }, [subscribe])

  useEffect(() => () => { mounted.current = false }, [])

  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredEntries = useMemo(
    () => state.status === 'ready'
      ? state.snapshot.entries.filter(entry => matches(entry, normalizedQuery))
      : [],
    [normalizedQuery, state],
  )

  useEffect(() => {
    if (expanded !== null && !filteredEntries.some(entry => entry.entryId === expanded)) {
      setExpanded(null)
    }
  }, [expanded, filteredEntries])

  const retry = (): void => {
    setState({ status: 'loading' })
    setRequest(value => value + 1)
  }

  const applyToggle = (entryId: PluginInventoryEntry['entryId'], enabled: boolean): void => {
    const settle = (): void => {
      setPending((current) => {
        const next = new Set(current)
        next.delete(entryId)
        return next
      })
    }
    setMutationError(false)
    setFailedEntry(null)
    setPending(current => new Set(current).add(entryId))
    void Promise.resolve().then(() => setEnabled(entryId, enabled)).then(
      (snapshot) => {
        if (!mounted.current) return
        settle()
        setState({ status: 'ready', snapshot })
      },
      () => {
        if (!mounted.current) return
        settle()
        setFailedEntry(entryId)
        setMutationError(true)
      },
    )
  }

  const confirmDisable = (): void => {
    /* v8 ignore next -- RiskConfirmation renders only while confirming is set, so the confirm action cannot see a null id. */
    if (confirming === null) return
    const entryId = confirming
    setConfirming(null)
    setAcknowledged(false)
    applyToggle(entryId, false)
  }

  const cancelConfirmation = (): void => {
    setConfirming(null)
    setAcknowledged(false)
  }

  return (
    <div className={css.section} aria-busy={state.status === 'loading'}>
      {state.status === 'loading' ? <p className={css.status}>{t('loading')}</p> : null}
      {state.status === 'error' ? (
        <div className={css.failure}>
          <p role="alert">{t('error')}</p>
          <button type="button" onClick={retry}>{t('retry')}</button>
        </div>
      ) : null}
      {mutationError ? (
        <div className={css.mutationFailure} role="alert">{t('mutationError')}</div>
      ) : null}
      {state.status === 'ready' ? (
        <div className={css.catalog}>
          <label className={css.search}>
            <IconSearchOutline16 aria-hidden="true" />
            <span className={css.visuallyHidden}>{t('search')}</span>
            <input
              type="search"
              value={query}
              placeholder={t('search')}
              aria-label={t('search')}
              onChange={(event) => { setQuery(event.currentTarget.value) }}
            />
          </label>
          <div className={css.catalogHeading}>
            <h3>{t('catalog')}</h3>
            <span data-plugin-count={filteredEntries.length}>{filteredEntries.length}</span>
          </div>
          {state.snapshot.entries.length === 0 ? <p className={css.status}>{t('empty')}</p> : null}
          {state.snapshot.entries.length > 0 && filteredEntries.length === 0
            ? <p className={css.status}>{t('emptySearch')}</p>
            : null}
          {filteredEntries.length > 0 ? (
            <ul className={css.cards}>
              {filteredEntries.map((entry) => {
                const status = phaseLabel(entry.fiberPhase, t)
                const title = moduleShortName(entry.moduleName)
                const configuration = t(entry.enabled ? 'enabledTag' : 'disabledTag')
                const open = expanded === entry.entryId
                const detailId = `${catalogId}-details-${encodeURIComponent(entry.entryId)}`
                const reason = toggleReasonKey(entry.toggle)
                const isPending = pending.has(entry.entryId)
                const controlDisabled = reason !== null || isPending
                return (
                  <li
                    className={css.card}
                    key={entry.entryId}
                    data-plugin-entry={entry.entryId}
                    data-open={open ? 'true' : undefined}
                    data-saving={isPending ? 'true' : undefined}
                    data-failed={failedEntry === entry.entryId ? 'true' : undefined}
                  >
                    <input
                      className={css.toggle}
                      type="checkbox"
                      checked={entry.enabled}
                      disabled={controlDisabled}
                      aria-label={t('toggleLabel')}
                      aria-description={reason === null ? undefined : t(reason)}
                      aria-busy={isPending ? 'true' : undefined}
                      onChange={() => {
                        /* v8 ignore next -- non-available rows render a disabled control, which cannot raise a change event. */
                        if (reason !== null) return
                        if (entry.enabled) {
                          setAcknowledged(false)
                          setConfirming(entry.entryId)
                        } else {
                          applyToggle(entry.entryId, true)
                        }
                      }}
                    />
                    <button
                      className={css.cardContent}
                      type="button"
                      aria-expanded={open}
                      aria-controls={detailId}
                      aria-label={entry.enabled ? `${title}, ${status}, ${configuration}` : `${title}, ${configuration}`}
                      onClick={() => {
                        setExpanded(current => current === entry.entryId ? null : entry.entryId)
                      }}
                    >
                      <strong className={css.cardTitle} title={entry.moduleName}>{title}</strong>
                      <span className={css.cardTrailing}>
                        {entry.enabled ? (
                          <span
                            className={css.statusDot}
                            data-phase={entry.fiberPhase ?? 'unobserved'}
                            role="img"
                            aria-label={status}
                            title={status}
                          />
                        ) : null}
                        <span className={css.configTag} data-enabled={entry.enabled ? 'true' : 'false'}>
                          {configuration}
                        </span>
                        {isPending ? <span className={css.savingTag}>{t('saving')}</span> : null}
                        <IconChevronDownOutline14 className={css.chevron} size={12} aria-hidden="true" />
                      </span>
                    </button>
                    {open ? (
                      <div className={css.cardDetails} id={detailId}>
                        <code className={css.entryValue} data-loader-entry>{entry.entryId}</code>
                        <dl className={css.details}>
                          <div>
                            <dt>{t('configuration')}</dt>
                            <dd>{configuration}</dd>
                          </div>
                          {entry.enabled ? (
                            <div>
                              <dt>{t('cordis')}</dt>
                              <dd>{status}</dd>
                            </div>
                          ) : null}
                        </dl>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      ) : null}
      <RiskConfirmation
        open={confirming !== null}
        title={t('confirmTitle')}
        description={t('confirmDescription')}
        acknowledgeLabel={t('confirmAcknowledge')}
        cancelLabel={t('confirmCancel')}
        confirmLabel={t('confirmDisable')}
        acknowledged={acknowledged}
        disabled={pending.size !== 0}
        onAcknowledgedChange={setAcknowledged}
        onCancel={cancelConfirmation}
        onConfirm={confirmDisable}
      />
    </div>
  )
}
