/**
 * Typecheck Markdown `ts` fences against the workspace API. `ignore-check` fences are reported as
 * opt-outs; generated catalog fragments and source-equivalence blocks are skipped here because their
 * owning gates verify them. A build-coordinated mode consumes existing declarations without emit.
 */

import { execFileSync } from 'node:child_process'
import { globSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import ts from 'typescript'
import { builtDeclarationPath } from './doc-typecheck-paths.ts'
import { markdownFences } from './markdown.ts'
import { isArchivedAgentNotePath } from './repo-files.ts'

const root = resolve(import.meta.dirname, '..')

/**
 * Opt-out ceiling for `ts ignore-check` fences. Follows the doc-budgets ratchet
 * contract (scripts/doc-budgets.manifest.json, docs/AGENTS.md#wordcount-budgets):
 * the count must equal the ceiling — exceeding it demands making blocks compile,
 * dropping below it demands lowering the ceiling in the same change — so the
 * opt-out number only ever shrinks. Raise only with justification; a stale
 * ceiling is a budget bug.
 */
const IGNORE_CEILING = 76

/**
 * TypeScript-fence ownership. `check` compiles; `ignore` is an unchecked sketch
 * counted in the opt-out ratio; the catalog and type-equivalence variants are
 * excluded from that ratio because their owning gates verify them.
 */
type BlockKind = 'check' | 'ignore' | 'type-equiv' | 'cordis-catalog' | 'persistence-catalog' | 'config-catalog'

/** One extracted code block. */
interface Block {
  file: string
  /** 1-based line of the opening fence. */
  line: number
  kind: BlockKind
  code: string
}

/** The info-string → kind table this gate tracks. */
const KIND_BY_INFO: Record<string, BlockKind> = {
  'ts': 'check',
  'ts ignore-check': 'ignore',
  'ts type-equiv': 'type-equiv',
  'ts public-api': 'type-equiv',
  'ts cordis-catalog': 'cordis-catalog',
  'ts persistence-catalog': 'persistence-catalog',
  'ts config-catalog': 'config-catalog',
}

/**
 * Non-TypeScript info-strings the gate accepts without compiling: a bare fence
 * (no language is not a misspelled one) plus other languages the gate never
 * type-checks. Anything outside `KIND_BY_INFO` and this allowlist fails the
 * gate naming its file and line, so a new or misspelled fence needs an explicit
 * decision instead of silent skipping. Canonical spellings only: `markdown`
 * (not `md`) and `ts` (not `typescript`) — those spellings are deliberately
 * absent so re-introducing them is caught.
 */
const ALLOWED_UNCHECKED_LANG: Record<string, true> = {
  '': true,
  yaml: true,
  json: true,
  jsonc: true,
  markdown: true,
  text: true,
  sh: true,
  js: true,
  mermaid: true,
  toml: true,
  sql: true,
}

/** A fence whose info-string the gate neither compiles nor explicitly allows. */
interface UnrecognizedFence {
  file: string
  line: number
  info: string
}

/** Extract every recognized TypeScript fence from one Markdown file. */
function extractBlocks(absPath: string): Block[] {
  const file = relative(root, absPath)
  return markdownFences(readFileSync(absPath, 'utf8')).flatMap((fence) => {
    const kind = KIND_BY_INFO[fence.info]
    return kind === undefined ? [] : [{ file, line: fence.line, kind, code: fence.code }]
  })
}

/** Fences the gate neither recognizes as TypeScript nor allowlists, so it can reject them. */
function unrecognizedFences(absPath: string): UnrecognizedFence[] {
  const file = relative(root, absPath)
  return markdownFences(readFileSync(absPath, 'utf8')).flatMap(fence =>
    KIND_BY_INFO[fence.info] === undefined && ALLOWED_UNCHECKED_LANG[fence.info] !== true
      ? [{ file, line: fence.line, info: fence.info }]
      : [],
  )
}

const configHost: ts.ParseConfigFileHost = {
  ...ts.sys,
  getCurrentDirectory: () => root,
  onUnRecoverableConfigFileDiagnostic(diagnostic) {
    throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
  },
}

/**
 * Load host-aggregate settings and redirect workspace aliases to declarations
 * from the coordinated build. Doc fragments speak the host vocabulary; the host
 * aggregate (never the root solution — it has no compilerOptions) carries the
 * workspace paths via tsconfig.base.json.
 */
function builtTypeCompilerOptions(): ts.CompilerOptions {
  const configPath = join(root, 'tsconfig.host.json')
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, configHost)
  if (!parsed) throw new Error(`doc-typecheck: cannot parse ${configPath}`)
  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, '\n')).join('\n'))
  }
  if (parsed.options.paths === undefined) throw new Error('doc-typecheck: host tsconfig has no workspace paths')
  const paths = Object.fromEntries(Object.entries(parsed.options.paths).map(([specifier, candidates]) => [
    specifier,
    candidates.map(builtDeclarationPath),
  ]))
  const options: ts.CompilerOptions = {
    ...parsed.options,
    paths,
    noEmit: true,
    composite: false,
    incremental: false,
    declaration: false,
    declarationMap: false,
    sourceMap: false,
    noUnusedLocals: false,
    noUnusedParameters: false,
  }
  delete options.tsBuildInfoFile
  return options
}

/** Compile Markdown blocks as virtual files against declarations from the coordinated build. */
function compileBlocksAgainstBuiltTypes(blocks: Block[]): readonly ts.Diagnostic[] {
  const options = builtTypeCompilerOptions()
  const sources = new Map<string, string>()
  for (const [index, block] of blocks.entries()) {
    const fileName = resolve(root, '.doc-typecheck', `block-${index}.ts`)
    sources.set(fileName, block.code.endsWith('\n') ? block.code : `${block.code}\n`)
  }

  const baseHost = ts.createCompilerHost(options, true)
  const host: ts.CompilerHost = {
    ...baseHost,
    fileExists(fileName) {
      return sources.has(resolve(fileName)) || baseHost.fileExists(fileName)
    },
    readFile(fileName) {
      return sources.get(resolve(fileName)) ?? baseHost.readFile(fileName)
    },
    getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile) {
      const source = sources.get(resolve(fileName))
      if (source !== undefined) return ts.createSourceFile(fileName, source, languageVersion, true)
      return baseHost.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile)
    },
    writeFile() {
      throw new Error('doc-typecheck: noEmit compilation attempted to write output')
    },
  }
  const program = ts.createProgram([...sources.keys()], options, host)
  return ts.getPreEmitDiagnostics(program)
}

/** Render compiler diagnostics with virtual block paths mapped back to Markdown. */
function formatDiagnostics(diagnostics: readonly ts.Diagnostic[], blocks: Block[]): string {
  const formatted = ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: fileName => fileName,
    getCurrentDirectory: () => root,
    getNewLine: () => ts.sys.newLine,
  })
  return remapBlockPaths(formatted, blocks)
}

/**
 * Reuse the Host aggregate references from a temp project one directory below
 * root. Generated Client API examples opt out because their declarations do
 * not exist until Host tsdown has run.
 */
function workspaceReferences(): { path: string }[] {
  const file = join(root, 'tsconfig.host.json')
  // Parse with TypeScript's own JSONC reader: a regex comment stripper corrupts the `/*/` path
  // candidate in the workspace wildcard.
  const result = ts.readConfigFile(file, path => readFileSync(path, 'utf8'))
  if (result.error) {
    throw new Error(`doc-typecheck: cannot read ${file}: ${ts.flattenDiagnosticMessageText(result.error.messageText, '\n')}`)
  }
  // `config` is typed `any` by the TS API; narrow it to the one field read here.
  const { references } = result.config as { references: { path: string }[] }
  return references.map(({ path }) => ({
    path: path.startsWith('./') ? `../${path.slice(2)}` : `../${path}`,
  }))
}

/** The standalone temp project used when no coordinated build owns declaration freshness. */
function tempTsconfig(): string {
  return JSON.stringify({
    extends: '../tsconfig.host.json',
    compilerOptions: {
      noUnusedLocals: false,
      noUnusedParameters: false,
      tsBuildInfoFile: './tsconfig.tsbuildinfo',
    },
    include: ['block-*.ts'],
    references: workspaceReferences(),
  })
}

/** Compile blocks through project references for the standalone command. */
function compileBlocksStandalone(blocks: Block[]): string | undefined {
  const tmp = mkdtempSync(join(root, '.doc-typecheck-'))
  try {
    writeFileSync(join(tmp, 'tsconfig.json'), tempTsconfig())
    for (const [index, block] of blocks.entries()) {
      writeFileSync(join(tmp, `block-${index}.ts`), block.code.endsWith('\n') ? block.code : `${block.code}\n`)
    }
    try {
      // Invoke tsc's JS entry through Node instead of a platform-specific shell shim.
      execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-b', join(tmp, 'tsconfig.json')], {
        cwd: root,
        stdio: 'pipe',
      })
      return undefined
    } catch (error: unknown) {
      const failed = error as { stdout?: Buffer; stderr?: Buffer }
      return remapBlockPaths(`${failed.stdout?.toString() ?? ''}${failed.stderr?.toString() ?? ''}`, blocks)
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

/** Map virtual or temporary block paths back to their owning Markdown fences. */
function remapBlockPaths(output: string, blocks: Block[]): string {
  return output.replace(/(?:[^\s:()]*[/\\])?block-(\d+)\.ts\((\d+),(\d+)\)/g, (_match, index: string, line: string, column: string) => {
    const block = blocks[Number(index)]
    if (!block) return `block-${index}.ts(${line},${column})`
    return `${block.file} (block at line ${block.line}, +${line}:${column})`
  })
}

const markdownGlobs = ['README.md', '.agents/notes/**/*.md', 'docs/**/*.md', 'packages/*/*.md', 'packages/*/*/*.md']

const files: string[] = []
for (const pattern of markdownGlobs) {
  for (const match of globSync(pattern, { cwd: root })) {
    if (!isArchivedAgentNotePath(match)) files.push(resolve(root, match))
  }
}
files.sort()

const unrecognized = files.flatMap(unrecognizedFences)
if (unrecognized.length > 0) {
  console.error('doc-typecheck: unrecognized fence info-string(s) — use a compiled `ts` variant or an allowlisted language, or add a deliberate allowlist entry:\n')
  for (const fence of unrecognized) {
    console.error(`  ${fence.file}:${fence.line} (info-string ${JSON.stringify(fence.info)})`)
  }
  console.error('\nAllowlisted unchecked languages: yaml, json, jsonc, markdown, text, sh, js, mermaid, toml, sql (a bare fence is an unlabelled block, not an error).')
  process.exit(1)
}

const extracted = files.flatMap(extractBlocks)
const all = extracted
const checked = all.filter(b => b.kind === 'check')
const ignored = all.filter(b => b.kind === 'ignore')
// Only compile-eligible fences belong in the opt-out ratio; every other skipped
// kind has an independent verifier named in the BlockKind rules above.
const ratioDenominator = checked.length + ignored.length

if (checked.length === 0) {
  console.log('doc-typecheck: no ts code blocks to check.')
  process.exit(0)
}

const useBuiltTypes = process.env.DSH_DOC_TYPECHECK_USE_BUILD_OUTPUT === '1'
const compilationError = useBuiltTypes
  ? (() => {
    const diagnostics = compileBlocksAgainstBuiltTypes(checked)
    return diagnostics.length === 0 ? undefined : formatDiagnostics(diagnostics, checked)
  })()
  : compileBlocksStandalone(checked)
if (compilationError !== undefined) {
  console.error('doc-typecheck: documentation code blocks failed to compile.\n')
  console.error(compilationError)
  process.exit(1)
}

const ratio = ignored.length / ratioDenominator
const skipped = all.length - ratioDenominator
console.log(`doc-typecheck: ${checked.length} block(s) compiled, ${ignored.length} ignored (${(ratio * 100).toFixed(0)}% opt-out, ceiling ${IGNORE_CEILING}), ${skipped} type-equiv/catalog (checked elsewhere).`)

// The ignore-check count must equal the ceiling: exceeding it demands making
// blocks compile, dropping below it demands lowering the ceiling here, so the
// opt-out number only ever shrinks instead of accruing as credit.
if (ignored.length > IGNORE_CEILING) {
  console.error(`doc-typecheck: ${ignored.length} ts ignore-check blocks exceed the ${IGNORE_CEILING}-block ceiling. Make ${ignored.length - IGNORE_CEILING} of them compile (convert to \`ts\` and fix what keeps them sketches) or delete them; to accept the opt-out instead, raise IGNORE_CEILING with justification.`)
  process.exit(1)
}
if (ignored.length < IGNORE_CEILING) {
  console.error(`doc-typecheck: ${ignored.length} ts ignore-check blocks are below the ${IGNORE_CEILING}-block ceiling. Lower IGNORE_CEILING to ${ignored.length} in the same change so the opt-out number can only shrink.`)
  process.exit(1)
}
// Guard against the escape hatch becoming the norm even at the ceiling.
if (ratioDenominator >= 4 && ratio > 0.5) {
  console.error(`doc-typecheck: too many blocks opt out of checking (${ignored.length}/${ratioDenominator}). Make them compile or delete them.`)
  process.exit(1)
}
