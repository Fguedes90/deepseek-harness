/**
 * Project the `vendor/` source surface onto the forks this repository's owner
 * controls, so local modifications exist as real commits instead of only the
 * prose log in `vendor/README.md`. The repository stays the source of truth;
 * each fork's `dsh` branch is the durable carrier of the modifications and is
 * derived, never authoritative.
 *
 * Only `src/` is projected. The `dsh` branch must mean "upstream baseline plus
 * our changes to the files we actually vendored": upstream files this
 * repository does not touch (tests, build config) stay intact so the branch
 * stays rebaseable onto a newer upstream, and the harness's own packaging
 * (`package.json`, `tsconfig.json`, `README.md`, `LICENSE`, version bumps) never
 * reaches the fork. This matches the sync procedure in `vendor/README.md` and
 * the measured modification diff.
 *
 * `export` builds, per clone, a commit on the fork's `dsh` branch: it resets
 * the branch to the package's pinned baseline SHA (from the manifest), replaces
 * the mapped `src/` with the vendored files projected into the fork's layout
 * with the `@deepseek-ai` rescope undone, and commits. `--push` pushes that
 * branch; without it the branch is left local and the push command is printed.
 * `verify` asserts the current `vendor/` `src/` projects byte-identically to
 * the `dsh` branches (the exit mode a gate would consume). `import` copies the
 * reconciled `dsh` `src/` back into `vendor/`, reapplying the rescope, and
 * refuses to run over uncommitted `vendor/` work.
 *
 * The direction-aware name rewrite is delegated to `rewriteRescopeText` in
 * `rescope-vendor.ts`, which owns the name mapping and its generic skips; this
 * script only decides which files are text (UTF-8) and which direction to run.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { rewriteRescopeText } from './rescope-vendor.ts'

const root = resolve(import.meta.dirname, '..')

/** Root under which every fork clone lives; `vendor/README.md` names the three. */
const CLONE_ROOT = join(homedir(), 'repos', 'cordis-workspace')

/** The fork branch that carries the vendored modifications. */
const BRANCH = 'dsh'

/** One vendored package's projection target and pinned upstream baseline. */
interface VendoredPackage {
  /** Directory under `vendor/`. */
  readonly dir: string
  /** Clone key under {@link CLONE_ROOT}. */
  readonly clone: string
  /** Path inside the clone the package's `src/` projects onto; `''` is the clone root. */
  readonly upstreamPath: string
  /** The fork commit the `dsh` branch is rebuilt from. */
  readonly baseline: string
}

/**
 * The vendored-manifest contract, mirroring the table in `vendor/README.md`.
 * All seven Cordis packages share one baseline because they were vendored from
 * one monorepo snapshot.
 */
const PACKAGES: readonly VendoredPackage[] = [
  { dir: 'cordis', clone: 'cordis', upstreamPath: 'packages/core', baseline: '56b3d4f725681cf4556c1a8695a709cc3b6eed74' },
  { dir: 'loader', clone: 'cordis', upstreamPath: 'packages/loader', baseline: '56b3d4f725681cf4556c1a8695a709cc3b6eed74' },
  { dir: 'include', clone: 'cordis', upstreamPath: 'packages/include', baseline: '56b3d4f725681cf4556c1a8695a709cc3b6eed74' },
  { dir: 'group', clone: 'cordis', upstreamPath: 'packages/group', baseline: '56b3d4f725681cf4556c1a8695a709cc3b6eed74' },
  { dir: 'timer', clone: 'cordis', upstreamPath: 'packages/timer', baseline: '56b3d4f725681cf4556c1a8695a709cc3b6eed74' },
  { dir: 'hmr', clone: 'cordis', upstreamPath: 'packages/hmr', baseline: '56b3d4f725681cf4556c1a8695a709cc3b6eed74' },
  { dir: 'logger-console', clone: 'cordis', upstreamPath: 'packages/logger-console', baseline: '56b3d4f725681cf4556c1a8695a709cc3b6eed74' },
  { dir: 'cosmokit', clone: 'cosmokit', upstreamPath: '', baseline: '02e691c5aa7f37f6e0b1cee7ee8f4a21c2e34507' },
  { dir: 'schemastery', clone: 'schemastery', upstreamPath: 'packages/core', baseline: '9e1f54f8ff785a4e51a022922999634205b61e1f' },
]

/** The three fork clones, keyed by {@link VendoredPackage.clone}. */
const CLONES: Record<string, string> = {
  cordis: join(CLONE_ROOT, 'cordis'),
  cosmokit: join(CLONE_ROOT, 'cosmokit'),
  schemastery: join(CLONE_ROOT, 'schemastery'),
}

/**
 * Run one Git subprocess and return its exact stdout bytes, throwing on a
 * non-zero exit so a failure aborts loudly instead of skipping a package.
 * @param cwd - Repository root used as Git's working directory.
 * @param args - Arguments following the `git` executable.
 * @param operation - Human-readable operation for failure diagnostics.
 * @returns The exact stdout bytes.
 * @throws Error when Git cannot start or exits unsuccessfully.
 */
function git(cwd: string, args: readonly string[], operation: string): Buffer {
  const result = spawnSync('git', ['-C', cwd, ...args], { encoding: 'buffer', maxBuffer: 1 << 26 })
  if (result.error) throw new Error(`${operation} failed: ${result.error.message}`, { cause: result.error })
  if (result.status !== 0) {
    const stderr = result.stderr.toString('utf8').trim()
    throw new Error(`${operation} failed with status ${String(result.status)}: ${stderr}`)
  }
  return result.stdout
}

/**
 * Run one Git subprocess returning its exit status, for predicates where a
 * non-zero exit is a normal outcome (branch existence, staged-diff emptiness).
 * @param cwd - Repository root used as Git's working directory.
 * @param args - Arguments following the `git` executable.
 * @returns The process exit status, or -1 when Git could not start.
 */
function gitCode(cwd: string, args: readonly string[]): number {
  const result = spawnSync('git', ['-C', cwd, ...args], { encoding: 'buffer' })
  return result.error ? -1 : (result.status ?? -1)
}

/** True when a buffer decodes cleanly as UTF-8 text. */
function isUtf8Text(buffer: Buffer): boolean {
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buffer)
    return true
  } catch {
    return false
  }
}

/**
 * Transform one vendored source file's bytes for one direction, through
 * {@link rewriteRescopeText} (which owns the mapping and skips). Non-UTF-8
 * binaries are copied untouched rather than corrupted by a text rewrite.
 * @param file - Repository-relative vendored path, e.g. `vendor/cordis/src/context.ts`.
 * @param buffer - The file's exact bytes.
 * @param reverse - True for export (scoped -> upstream), false for import
 *   (upstream -> scoped).
 * @returns The transformed bytes.
 */
function transformVendor(file: string, buffer: Buffer, reverse: boolean): Buffer {
  if (!isUtf8Text(buffer)) return buffer
  const rewritten = rewriteRescopeText(file, buffer.toString('utf8'), reverse)
  return Buffer.from(rewritten.text, 'utf8')
}

/** One clone's projected tree: clone key -> mapped path -> exact bytes. */
type Projection = Map<string, Map<string, Buffer>>

/**
 * Build the fork-layout projection of the current `vendor/` source surface:
 * every tracked `src/` file of each package placed under its upstream path with
 * the rescope undone.
 * @returns Per-clone maps of repository-relative (clone) path to exact bytes.
 */
function buildProjection(): Projection {
  const projection: Projection = new Map()
  for (const pkg of PACKAGES) {
    const srcDir = `vendor/${pkg.dir}/src`
    const files = git(root, ['ls-files', '-z', '--', srcDir], `git ls-files ${srcDir}`)
      .toString('utf8')
      .split('\0')
      .filter(Boolean)
    if (files.length === 0) throw new Error(`${srcDir} has no tracked files; cannot project an empty source surface`)
    let cloneTree = projection.get(pkg.clone)
    if (cloneTree === undefined) {
      cloneTree = new Map()
      projection.set(pkg.clone, cloneTree)
    }
    for (const file of files) {
      const rel = file.slice(`${srcDir}/`.length)
      const target = pkg.upstreamPath === '' ? `src/${rel}` : `${pkg.upstreamPath}/src/${rel}`
      cloneTree.set(target, transformVendor(`vendor/${pkg.dir}/src/${rel}`, readFileSync(join(root, file)), true))
    }
  }
  return projection
}

/**
 * Resolve a package's baseline SHA in its clone, verifying it is a commit and
 * that the package's upstream path exists in it.
 * @param clone - The clone path.
 * @param pkg - The package whose baseline to validate.
 * @returns The resolved 40-hex commit SHA.
 */
function resolveBaseline(clone: string, pkg: VendoredPackage): string {
  if (gitCode(clone, ['rev-parse', '--verify', '--quiet', `${pkg.baseline}^{commit}`]) !== 0) {
    throw new Error(`${pkg.clone}: baseline ${pkg.baseline} for ${pkg.dir} does not resolve to a commit`)
  }
  if (pkg.upstreamPath !== '' && gitCode(clone, ['cat-file', '-e', `${pkg.baseline}:${pkg.upstreamPath}`]) !== 0) {
    throw new Error(`${pkg.clone}: upstream path ${pkg.upstreamPath} is absent at baseline ${pkg.baseline}`)
  }
  return pkg.baseline
}

/**
 * Clear every mapped `src/` in a worktree so `git add -A` stages a clean
 * replace (including deletions of upstream `src/` files this repo removed,
 * e.g. the HMR locales) while leaving non-source files untouched.
 * @param cloneKey - The clone key, selecting the package set.
 * @param worktree - The worktree whose mapped `src/` directories to clear.
 */
function clearMappedSrc(cloneKey: string, worktree: string): void {
  for (const pkg of PACKAGES.filter(candidate => candidate.clone === cloneKey)) {
    const srcPath = pkg.upstreamPath === '' ? join('src') : join(pkg.upstreamPath, 'src')
    rmSync(join(worktree, srcPath), { recursive: true, force: true })
  }
}

/** The commit message naming the source repository and the projected packages. */
function commitMessage(pkgs: readonly VendoredPackage[]): string {
  return `deepseek-harness vendored modifications: ${pkgs.map(pkg => pkg.dir).join(', ')}`
}

/**
 * List the files present on a branch under a set of paths (or the whole tree
 * when the paths are empty), filtered to `src/` files only.
 * @param clone - The clone path.
 * @param branch - The branch to list from.
 * @param paths - Directories to list; empty lists the whole tree.
 * @returns The `src/` files present, as repository-relative paths.
 */
function listBranchSrcFiles(clone: string, branch: string, paths: readonly string[]): Set<string> {
  const args = ['ls-tree', '-r', '-z', '--name-only', branch]
  if (paths.length > 0) args.push('--', ...paths)
  const all = git(clone, args, `git ls-tree ${branch}`).toString('utf8').split('\0').filter(Boolean)
  return new Set(all.filter(path => path.startsWith('src/') || path.includes('/src/')))
}

/** Assert a clone directory exists and is a Git repository. */
function assertClone(cloneKey: string, clone: string): void {
  if (!existsSync(join(clone, '.git'))) throw new Error(`${cloneKey}: clone not found at ${clone}`)
}

/**
 * Export `vendor/`'s `src/` onto each fork's `dsh` branch.
 * @param push - True to push the branches to `origin`; false to leave them
 *   local and print the push command.
 */
function exportCommand(push: boolean): void {
  const projection = buildProjection()
  for (const [cloneKey, clone] of Object.entries(CLONES)) {
    assertClone(cloneKey, clone)
    const pkgs = PACKAGES.filter(pkg => pkg.clone === cloneKey)
    const [first] = pkgs
    if (first === undefined) throw new Error(`${cloneKey}: clone maps to no vendored package`)
    const baseline = resolveBaseline(clone, first)
    const dirty = git(clone, ['status', '--porcelain'], `git status ${cloneKey}`).toString('utf8')
    if (dirty.trim() !== '') throw new Error(`${cloneKey}: clone working tree is dirty; refusing to overwrite it`)
    const worktree = mkdtempSync(join(tmpdir(), `vendor-fork-${cloneKey}-`))
    try {
      git(clone, ['worktree', 'add', '-B', BRANCH, worktree, baseline], `git worktree add ${cloneKey} ${BRANCH}`)
      clearMappedSrc(cloneKey, worktree)
      for (const [path, buffer] of projection.get(cloneKey) ?? new Map<string, Buffer>()) {
        const target = join(worktree, path)
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, buffer)
      }
      git(worktree, ['add', '-A'], `git add ${cloneKey}`)
      if (gitCode(worktree, ['diff', '--cached', '--quiet']) === 0) {
        console.log(`${cloneKey}: sem mudanças — ${BRANCH} content already matches the projection`)
      } else {
        git(worktree, ['commit', '-m', commitMessage(pkgs)], `git commit ${cloneKey}`)
        const head = git(worktree, ['rev-parse', BRANCH], `git rev-parse ${cloneKey} ${BRANCH}`).toString('utf8').trim()
        console.log(`${cloneKey}: committed ${BRANCH}@${head.slice(0, 12)} (${pkgs.map(pkg => pkg.dir).join(', ')})`)
      }
      if (push) {
        git(clone, ['push', '--force-with-lease', 'origin', BRANCH], `git push ${cloneKey}`)
        console.log(`${cloneKey}: pushed ${BRANCH}`)
      } else {
        console.log(`  push with: git -C ${clone} push --force-with-lease origin ${BRANCH}`)
      }
    } finally {
      try {
        git(clone, ['worktree', 'remove', '--force', worktree], `git worktree remove ${cloneKey}`)
      } catch {
        // Cleanup must never mask the primary error; the temp dir is under
        // $TMPDIR and harmless if removal fails.
      }
    }
  }
}

/**
 * Assert the current `vendor/` `src/` projects byte-identically to the `dsh`
 * branches. Exits 1 naming every divergent file, or with a message when no
 * branch exists.
 */
function verifyCommand(): void {
  const projection = buildProjection()
  const divergences: string[] = []
  for (const [cloneKey, clone] of Object.entries(CLONES)) {
    assertClone(cloneKey, clone)
    if (gitCode(clone, ['rev-parse', '--verify', '--quiet', `refs/heads/${BRANCH}`]) !== 0) {
      console.error(`verify: ${cloneKey} has no ${BRANCH} branch — export has never run`)
      process.exitCode = 1
      return
    }
    const paths = PACKAGES.filter(pkg => pkg.clone === cloneKey).map(pkg => pkg.upstreamPath).filter(path => path !== '')
    const branchFiles = listBranchSrcFiles(clone, BRANCH, paths)
    const cloneTree = projection.get(cloneKey) ?? new Map<string, Buffer>()
    for (const path of branchFiles) {
      const expected = cloneTree.get(path)
      if (expected === undefined) {
        divergences.push(`${cloneKey}:${path} present on ${BRANCH} but not in the vendor src projection`)
        continue
      }
      const actual = git(clone, ['show', `${BRANCH}:${path}`], `git show ${cloneKey} ${path}`)
      if (!actual.equals(expected)) divergences.push(`${cloneKey}:${path} differs from the vendor src projection`)
    }
    for (const path of cloneTree.keys()) {
      if (!branchFiles.has(path)) divergences.push(`${cloneKey}:${path} in the vendor src projection but absent from ${BRANCH}`)
    }
  }
  if (divergences.length > 0) {
    for (const divergence of divergences) console.error(`verify: ${divergence}`)
    process.exitCode = 1
    return
  }
  console.log('verify: vendor src projection matches every dsh branch')
}

/**
 * Import the reconciled `dsh` `src/` back into `vendor/`, reapplying the
 * rescope. Aborts over uncommitted `vendor/` changes so the import cannot
 * overwrite local work.
 */
function importCommand(): void {
  const dirty = git(root, ['status', '--porcelain', '--', 'vendor/'], 'git status vendor/').toString('utf8')
  if (dirty.trim() !== '') {
    console.error('import: vendor/ has uncommitted changes; aborting to avoid overwriting local work')
    process.exitCode = 1
    return
  }
  for (const [cloneKey, clone] of Object.entries(CLONES)) {
    assertClone(cloneKey, clone)
    if (gitCode(clone, ['rev-parse', '--verify', '--quiet', `refs/heads/${BRANCH}`]) !== 0) {
      console.error(`import: ${cloneKey} has no ${BRANCH} branch — run export first`)
      process.exitCode = 1
      return
    }
    for (const pkg of PACKAGES.filter(candidate => candidate.clone === cloneKey)) {
      const paths = pkg.upstreamPath === '' ? [] : [pkg.upstreamPath]
      const branchFiles = listBranchSrcFiles(clone, BRANCH, paths)
      const rels = new Set<string>()
      for (const path of branchFiles) {
        const rel = pkg.upstreamPath === ''
          ? path.slice('src/'.length)
          : path.slice(pkg.upstreamPath.length + '/src/'.length)
        rels.add(rel)
        const vendorFile = `vendor/${pkg.dir}/src/${rel}`
        const transformed = transformVendor(vendorFile, git(clone, ['show', `${BRANCH}:${path}`], `git show ${cloneKey} ${path}`), false)
        const target = join(root, vendorFile)
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, transformed)
      }
      const tracked = git(root, ['ls-files', '-z', '--', `vendor/${pkg.dir}/src`], `git ls-files vendor/${pkg.dir}/src`)
        .toString('utf8')
        .split('\0')
        .filter(Boolean)
      for (const file of tracked) {
        const rel = file.slice(`vendor/${pkg.dir}/src/`.length)
        if (!rels.has(rel)) {
          rmSync(join(root, file), { force: true })
          console.log(`import: removed vendor/${pkg.dir}/src/${rel} (absent from ${cloneKey} ${BRANCH})`)
        }
      }
      console.log(`import: projected ${cloneKey} ${BRANCH} into vendor/${pkg.dir}/src`)
    }
  }
}

function main(): void {
  const args = process.argv.slice(2)
  const command = args[0]
  if (command === 'export') {
    exportCommand(args.includes('--push'))
  } else if (command === 'verify') {
    verifyCommand()
  } else if (command === 'import') {
    importCommand()
  } else {
    console.error('usage: vendor-fork <export|verify|import> [--push]')
    process.exitCode = 1
  }
}

// Importing this module for its helpers must not run a command.
if (process.argv[1] !== undefined && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  main()
}
