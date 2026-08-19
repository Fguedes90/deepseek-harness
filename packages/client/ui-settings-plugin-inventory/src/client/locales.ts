/** Copy dictionaries for the plugin inventory Settings section. */

import type { CatalogModule, PluginCategory } from './catalog.ts'
import { summariesEn, summariesPt, summariesZh } from './plugin-summaries.ts'

/** Simplified Chinese tab chrome and key source of truth for every non-summary key. */
const chromeZh = {
  tab: '插件列表',
  loading: '正在读取插件…',
  error: '暂时无法读取插件。',
  retry: '重试',
  search: '搜索插件',
  catalog: '插件列表',
  empty: '暂无插件。',
  emptySearch: '没有匹配的插件。',
  enabledTag: '已启用',
  disabledTag: '已停用',
  configuration: '配置状态',
  cordis: 'Cordis 状态',
  module: '模块名',
  unobserved: '未挂载',
  pending: '等待依赖',
  loadingPhase: '加载中',
  active: '已挂载',
  failed: '挂载失败',
  unloading: '卸载中',
  toggleLabel: '插件开关',
  toggleProtected: '浏览器界面依赖此插件，无法停用。',
  toggleInherited: '由上级分组停用，不由本行控制。',
  toggleExpression: '启用状态由配置表达式计算，在此修改会破坏该规则。',
  saving: '正在应用…',
  mutationError: '更改未能应用。',
  confirmTitle: '停用插件？',
  confirmDescription: '停用后插件会立即停止，并在重启后保持停用。',
  confirmAcknowledge: '我了解停用的影响。',
  confirmCancel: '取消',
  confirmDisable: '停用',
  'category.chat': '对话与模型',
  'category.tools': '工具',
  'category.data': '会话与数据',
  'category.interface': '界面',
  'category.system': '系统与运行时',
  'category.other': '其他',
} satisfies Record<string, string>

/** English tab chrome checked against the Chinese key set. */
const chromeEn = {
  tab: 'Plugin list',
  loading: 'Reading plugins…',
  error: 'Plugins are temporarily unavailable.',
  retry: 'Retry',
  search: 'Search plugins',
  catalog: 'Plugin list',
  empty: 'No plugins are available.',
  emptySearch: 'No matching plugins.',
  enabledTag: 'Enabled',
  disabledTag: 'Disabled',
  configuration: 'Configuration',
  cordis: 'Cordis status',
  module: 'Module',
  unobserved: 'Not mounted',
  pending: 'Waiting for dependencies',
  loadingPhase: 'Loading',
  active: 'Mounted',
  failed: 'Mount failed',
  unloading: 'Unloading',
  toggleLabel: 'Enable this plugin',
  toggleProtected: 'This plugin cannot be disabled because the browser UI depends on it.',
  toggleInherited: 'Disabled by an ancestor group, not by this row.',
  toggleExpression: 'Enablement is computed by a config expression; editing it here would destroy that rule.',
  saving: 'Applying…',
  mutationError: 'The change could not be applied.',
  confirmTitle: 'Disable plugin?',
  confirmDescription: 'Disabling stops the plugin immediately and it stays off after restart.',
  confirmAcknowledge: 'I understand the impact of disabling.',
  confirmCancel: 'Cancel',
  confirmDisable: 'Disable',
  'category.chat': 'Chat & model',
  'category.tools': 'Tools',
  'category.data': 'Sessions & data',
  'category.interface': 'Interface',
  'category.system': 'System & runtime',
  'category.other': 'Other',
} satisfies Record<keyof typeof chromeZh, string>

/** Brazilian Portuguese tab chrome checked against the Chinese key set. */
const chromePt = {
  tab: 'Lista de plugins',
  loading: 'Lendo plugins…',
  error: 'Plugins temporariamente indisponíveis.',
  retry: 'Tentar novamente',
  search: 'Pesquisar plugins',
  catalog: 'Lista de plugins',
  empty: 'Nenhum plugin disponível.',
  emptySearch: 'Nenhum plugin corresponde à busca.',
  enabledTag: 'Ativado',
  disabledTag: 'Desativado',
  configuration: 'Estado da configuração',
  cordis: 'Estado do Cordis',
  module: 'Módulo',
  unobserved: 'Não montado',
  pending: 'Aguardando dependências',
  loadingPhase: 'Carregando',
  active: 'Montado',
  failed: 'Falha na montagem',
  unloading: 'Desmontando',
  toggleLabel: 'Ativar este plugin',
  toggleProtected: 'Este plugin não pode ser desativado porque a interface do navegador depende dele.',
  toggleInherited: 'Desativado por um grupo ancestral, não por esta linha.',
  toggleExpression: 'A ativação é calculada por uma expressão de configuração; editá-la aqui destruiria essa regra.',
  saving: 'Aplicando…',
  mutationError: 'A alteração não pôde ser aplicada.',
  confirmTitle: 'Desativar plugin?',
  confirmDescription: 'Desativar interrompe o plugin imediatamente e ele permanece desligado após reiniciar.',
  confirmAcknowledge: 'Entendo o impacto de desativar.',
  confirmCancel: 'Cancelar',
  confirmDisable: 'Desativar',
  'category.chat': 'Chat e modelo',
  'category.tools': 'Ferramentas',
  'category.data': 'Sessões e dados',
  'category.interface': 'Interface',
  'category.system': 'Sistema e runtime',
  'category.other': 'Outros',
} satisfies Record<keyof typeof chromeZh, string>

/** Locale key carrying one category's section heading. */
export type CategoryKey = `category.${PluginCategory}`

/** Locale key carrying one catalog plugin's user-facing summary. */
export type SummaryKey = `summary.${CatalogModule}`

/** Plugin inventory locale key union: tab chrome plus one summary per catalog plugin. */
export type PluginInventoryLocaleKey = keyof typeof chromeZh | SummaryKey

/**
 * Namespace one language's summaries under the `summary.` key prefix.
 * @param map - one summary per catalog module specifier.
 * @returns the same sentences keyed by their locale key.
 */
function prefixed(map: Record<CatalogModule, string>): Record<SummaryKey, string> {
  // `Object.fromEntries` always widens its key type to `string`, so the mapped result is
  // asserted back to the exact key union the typed input already guarantees.
  return Object.fromEntries(
    Object.entries(map).map(([moduleName, summary]) => [`summary.${moduleName}`, summary]),
  ) as Record<SummaryKey, string>
}

/** Simplified Chinese dictionary registered for this namespace. */
export const zh: Record<PluginInventoryLocaleKey, string> = { ...chromeZh, ...prefixed(summariesZh) }

/** English dictionary registered for this namespace. */
export const en: Record<PluginInventoryLocaleKey, string> = { ...chromeEn, ...prefixed(summariesEn) }

/** Brazilian Portuguese dictionary registered for this namespace. */
export const pt: Record<PluginInventoryLocaleKey, string> = { ...chromePt, ...prefixed(summariesPt) }

/**
 * Locale key of one catalog plugin's summary.
 * @param moduleName - a module specifier the catalog describes.
 * @returns the `summary.`-prefixed key both dictionaries carry.
 */
export function summaryKey(moduleName: CatalogModule): SummaryKey {
  return `summary.${moduleName}`
}

/**
 * Locale key of one category's section heading.
 * @param category - a category id from `CATEGORY_ORDER`.
 * @returns the `category.`-prefixed key both dictionaries carry.
 */
export function categoryKey(category: PluginCategory): CategoryKey {
  return `category.${category}`
}
