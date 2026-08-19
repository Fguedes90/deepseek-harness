/** Product category and user-facing grouping for every plugin the shipped profiles compose. */

/** Task-shaped grouping a user reads, as opposed to the engineering package group. */
export type PluginCategory = 'chat' | 'tools' | 'data' | 'interface' | 'system' | 'other'

/** Category a catalog row may claim; `other` is reserved for rows this package does not describe. */
export type AuthoredCategory = Exclude<PluginCategory, 'other'>

/**
 * Category of each module specifier the shipped `base` and `web-app` profiles compose.
 *
 * A row belongs to `chat` when losing it changes what the assistant says or decides, to
 * `tools` when losing it removes a tool the model calls, to `data` when it stores or moves
 * the user's data, to `interface` when it changes what appears on screen, and to `system`
 * otherwise. `tests/catalog.spec.ts` fails when a composed specifier is missing here or a
 * key here is composed by neither profile, so a new plugin cannot ship without its copy.
 */
export const PLUGIN_CATALOG = {
  '@deepseek-ai/cordis-plugin-timer'                     : 'system',
  '@deepseek-ai/cordis-plugin-hmr'                       : 'system',
  '@deepseek-ai/dsh-llm'                                 : 'chat',
  '@deepseek-ai/dsh-session'                             : 'data',
  '@deepseek-ai/dsh-typert-registry'                     : 'system',
  '@deepseek-ai/dsh-typert-loader'                       : 'system',
  '@deepseek-ai/dsh-api-gateway'                         : 'system',
  '@deepseek-ai/dsh-session-title'                       : 'data',
  '@deepseek-ai/dsh-session-title-first-prompt-llm'      : 'data',
  '@deepseek-ai/dsh-user-questions'                      : 'tools',
  '@deepseek-ai/dsh-agent'                               : 'chat',
  '@deepseek-ai/dsh-agent-default-model'                 : 'chat',
  '@deepseek-ai/dsh-jobs-local'                          : 'tools',
  '@deepseek-ai/dsh-llm-retry'                           : 'system',
  '@deepseek-ai/dsh-settings-file'                       : 'data',
  '@deepseek-ai/dsh-credentials-local'                   : 'data',
  '@deepseek-ai/dsh-llm-pi-ai'                           : 'chat',
  '@deepseek-ai/dsh-session-persistence-jsonl'           : 'data',
  '@deepseek-ai/dsh-attachment-local'                    : 'data',
  '@deepseek-ai/dsh-session-query-sqlite'                : 'data',
  '@deepseek-ai/dsh-session-projection'                  : 'system',
  '@deepseek-ai/dsh-session-telemetry-otel'              : 'system',
  '@deepseek-ai/dsh-subprocess-local'                    : 'system',
  '@deepseek-ai/dsh-sandbox-local'                       : 'system',
  '@deepseek-ai/dsh-sandbox-policy'                      : 'system',
  '@deepseek-ai/dsh-bash-sandbox'                        : 'system',
  '@deepseek-ai/dsh-pwsh-sandbox'                        : 'system',
  '@deepseek-ai/dsh-user-approval'                       : 'system',
  '@deepseek-ai/dsh-permission-presets'                  : 'system',
  '@deepseek-ai/dsh-shell-env'                           : 'tools',
  '@deepseek-ai/dsh-tool-bash'                           : 'tools',
  '@deepseek-ai/dsh-tool-pwsh'                           : 'tools',
  '@deepseek-ai/dsh-tool-jobs'                           : 'tools',
  '@deepseek-ai/dsh-fs-observation-policy'               : 'system',
  '@deepseek-ai/dsh-tool-fs'                             : 'tools',
  '@deepseek-ai/dsh-tool-fs-search'                      : 'tools',
  '@deepseek-ai/dsh-agent-instructions'                  : 'chat',
  '@deepseek-ai/dsh-skill'                               : 'tools',
  '@deepseek-ai/dsh-skill-filesystem'                    : 'tools',
  '@deepseek-ai/dsh-skill-badge'                         : 'tools',
  '@deepseek-ai/dsh-tool-skill'                          : 'tools',
  '@deepseek-ai/dsh-commands'                            : 'system',
  '@deepseek-ai/dsh-command-feedback'                    : 'data',
  '@deepseek-ai/dsh-goal'                                : 'chat',
  '@deepseek-ai/dsh-goal-round-driver'                   : 'chat',
  '@deepseek-ai/dsh-command-goal'                        : 'chat',
  '@deepseek-ai/dsh-plan-mode'                           : 'chat',
  '@deepseek-ai/dsh-token-meter'                         : 'chat',
  '@deepseek-ai/dsh-compaction-basic'                    : 'chat',
  '@deepseek-ai/dsh-command-compact'                     : 'chat',
  '@deepseek-ai/dsh-subagent'                            : 'tools',
  '@deepseek-ai/dsh-subagent-spawn-in-process'           : 'tools',
  '@deepseek-ai/dsh-subagent-fork-in-process'            : 'tools',
  '@deepseek-ai/dsh-tool-subagent-control'               : 'tools',
  '@deepseek-ai/dsh-tool-subagent-control/list-agents'   : 'tools',
  '@deepseek-ai/dsh-tool-subagent'                       : 'tools',
  '@deepseek-ai/dsh-tool-subagent-report'                : 'tools',
  '@deepseek-ai/dsh-workflow-worker-thread'              : 'tools',
  '@deepseek-ai/dsh-tool-workflow'                       : 'tools',
  '@deepseek-ai/dsh-tool-call-timeout-policy'            : 'system',
  '@deepseek-ai/dsh-spill-local'                         : 'data',
  '@deepseek-ai/dsh-spill-policy'                        : 'data',
  '@deepseek-ai/dsh-session-checkpoint-policy'           : 'system',
  '@deepseek-ai/dsh-compaction-tool-result-pruner'       : 'chat',
  '@deepseek-ai/dsh-tool-todo'                           : 'tools',
  '@deepseek-ai/dsh-tool-goal'                           : 'tools',
  '@deepseek-ai/dsh-tool-ralph'                          : 'tools',
  '@deepseek-ai/dsh-tool-str-replace-editor'             : 'tools',
  '@deepseek-ai/dsh-repeat-tool-reminder'                : 'system',
  '@deepseek-ai/dsh-web'                                 : 'tools',
  '@deepseek-ai/dsh-web-search-deepseek'                 : 'tools',
  '@deepseek-ai/dsh-tool-web'                            : 'tools',
  '@deepseek-ai/dsh-tools'                               : 'tools',
  '@deepseek-ai/dsh-system-prompt'                       : 'chat',
  '@deepseek-ai/dsh-agent-loop'                          : 'chat',
  '@deepseek-ai/dsh-fs-sandbox'                          : 'system',
  '@deepseek-ai/dsh-llm-deepseek'                        : 'chat',
  '@deepseek-ai/dsh-code-runtime-worker-thread'          : 'system',
  '@deepseek-ai/dsh-storage'                             : 'data',
  '@deepseek-ai/dsh-storage-json'                        : 'data',
  '@deepseek-ai/dsh-storage-domain'                      : 'data',
  '@deepseek-ai/dsh-message-feedback'                    : 'data',
  '@deepseek-ai/dsh-session-log-export'                  : 'data',
  '@deepseek-ai/dsh-workspace'                           : 'data',
  '@deepseek-ai/dsh-session-projection-cache'            : 'system',
  '@deepseek-ai/dsh-session-stats'                       : 'system',
  '@deepseek-ai/dsh-host-directory-picker-auto'          : 'system',
  '@deepseek-ai/dsh-host-plugin-inventory'               : 'system',
  '@deepseek-ai/dsh-host-apiproxy'                       : 'system',
  '@deepseek-ai/dsh-cordis-host-runner'                  : 'system',
  '@deepseek-ai/dsh-web-app/startup'                     : 'system',
  '@deepseek-ai/dsh-host-webserver'                      : 'system',
  '@deepseek-ai/dsh-web-app'                             : 'system',
  '@deepseek-ai/dsh-client-hmr'                          : 'interface',
  '@deepseek-ai/dsh-client-modules'                      : 'interface',
  '@deepseek-ai/dsh-client-connection'                   : 'interface',
  '@deepseek-ai/dsh-api-remotes'                         : 'system',
  '@deepseek-ai/dsh-client-runtime'                      : 'interface',
  '@deepseek-ai/dsh-cordis-client-runner'                : 'system',
  '@deepseek-ai/dsh-client-ui-theme'                     : 'interface',
  '@deepseek-ai/dsh-client-locale'                       : 'interface',
  '@deepseek-ai/dsh-client-ui-layout'                    : 'interface',
  '@deepseek-ai/dsh-client-ui-sidebar'                   : 'interface',
  '@deepseek-ai/dsh-client-ui-settings'                  : 'interface',
  '@deepseek-ai/dsh-client-ui-settings-general'          : 'interface',
  '@deepseek-ai/dsh-client-ui-settings-models'           : 'interface',
  '@deepseek-ai/dsh-client-ui-settings-plugin-inventory' : 'interface',
  '@deepseek-ai/dsh-client-ui-conversation'              : 'interface',
  '@deepseek-ai/dsh-client-ui-tool'                      : 'interface',
  '@deepseek-ai/dsh-client-ui-cordis'                    : 'interface',
  '@deepseek-ai/dsh-client-ui-workflow-run'              : 'interface',
  '@deepseek-ai/dsh-client-ui-deliverables'              : 'interface',
  '@deepseek-ai/dsh-client-ui-workspace'                 : 'interface',
  '@deepseek-ai/dsh-client-ui-input-trigger'             : 'interface',
  '@deepseek-ai/dsh-client-ui-commands'                  : 'interface',
  '@deepseek-ai/dsh-client-ui-skill'                     : 'interface',
  '@deepseek-ai/dsh-client-ui-subagent'                  : 'interface',
  '@deepseek-ai/dsh-client-ui-jobs'                      : 'interface',
  '@deepseek-ai/dsh-client-ui-goal'                      : 'interface',
  '@deepseek-ai/dsh-client-ui-message-feedback'          : 'interface',
  '@deepseek-ai/dsh-client-ui-model-selection'           : 'interface',
  '@deepseek-ai/dsh-client-ui-permission-presets'        : 'interface',
  '@deepseek-ai/dsh-client-ui-agent-preset'              : 'interface',
  '@deepseek-ai/dsh-client-ui-settings-plugins'          : 'interface',
  '@deepseek-ai/dsh-client-ui-plan'                      : 'interface',
  '@deepseek-ai/dsh-client-ui-user-questions'            : 'interface',
  '@deepseek-ai/dsh-client-ui-trajectory'                : 'interface',
  '@deepseek-ai/dsh-agent-presets'                       : 'chat',
} as const satisfies Record<string, AuthoredCategory>

/** Module specifier this package describes in `plugin-summaries.ts`. */
export type CatalogModule = keyof typeof PLUGIN_CATALOG

/** Render order of the category sections, most user-facing first. */
export const CATEGORY_ORDER: readonly PluginCategory[] = ['chat', 'tools', 'data', 'interface', 'system', 'other']

/**
 * Whether this package describes the given module specifier.
 * @param moduleName - a module specifier from an inventory row.
 * @returns true when the catalog carries a category and summaries for it.
 */
export function isCatalogModule(moduleName: string): moduleName is CatalogModule {
  return Object.hasOwn(PLUGIN_CATALOG, moduleName)
}

/**
 * Category one inventory row groups under.
 *
 * A custom profile or a third-party plugin reaches the tab as an undescribed row: it groups
 * under `other` and renders without a summary rather than borrowing another row's copy.
 * @param moduleName - a module specifier from an inventory row.
 * @returns the authored category, or `other` for a specifier outside the catalog.
 */
export function categoryOf(moduleName: string): PluginCategory {
  return isCatalogModule(moduleName) ? PLUGIN_CATALOG[moduleName] : 'other'
}
