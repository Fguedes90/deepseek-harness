/** Verify and re-seal the frozen Agent Note archive. */

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { AGENT_NOTE_CLASSES, agentNoteRoot } from './agent-note-tree.ts'
import {
  parseArchiveManifest,
  renderArchiveManifest,
  validateArchiveArtifacts,
  validateArchiveManifestExtension,
  type ArchiveManifest,
} from './archived-agent-notes.ts'

const args = process.argv.slice(2)
const writeMode = args.length === 1 && args[0] === '--write'
if (args.length > 0 && !writeMode) {
  console.error('verify-archived-agent-notes: usage: tsx scripts/verify-archived-agent-notes.ts [--write]')
  process.exit(1)
}

const archiveRoot = resolve(agentNoteRoot, 'archived')
const manifestPath = resolve(archiveRoot, 'manifest.json')
const repoRoot = resolve(agentNoteRoot, '../..')
const manifestRepoPath = '.agents/notes/archived/manifest.json'
const errors: string[] = []
const allowedRootFiles = new Set(['AGENTS.md', 'manifest.json'])
const kinds = new Set<string>()

if (!existsSync(resolve(archiveRoot, 'AGENTS.md'))) errors.push('archived/AGENTS.md is required')
const artifacts = new Map<string, Buffer>()
for (const entry of readdirSync(archiveRoot, { withFileTypes: true })) {
  if (entry.isFile()) {
    if (!allowedRootFiles.has(entry.name)) errors.push(`archived/${entry.name}: unexpected root file`)
    continue
  }
  if (!entry.isDirectory()) {
    errors.push(`archived/${entry.name}: only regular files and kind directories are allowed`)
    continue
  }
  if (!(AGENT_NOTE_CLASSES as readonly string[]).includes(entry.name)) {
    errors.push(`archived/${entry.name}/: unknown Agent Note kind`)
    continue
  }
  kinds.add(entry.name)
  for (const child of readdirSync(resolve(archiveRoot, entry.name), { withFileTypes: true })) {
    const rel = `${entry.name}/${child.name}`
    if (!child.isFile()) {
      errors.push(`${rel}: archived kind directories contain regular files only`)
      continue
    }
    artifacts.set(rel, readFileSync(resolve(archiveRoot, rel)))
  }
}
for (const kind of AGENT_NOTE_CLASSES) {
  if (!kinds.has(kind)) errors.push(`archived/${kind}/: required kind directory is missing`)
}
errors.push(...validateArchiveArtifacts(artifacts))

function runGit(args: string[]): string {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' })
  if (result.error !== undefined) throw result.error
  if (result.status !== 0) throw new Error(result.stderr.trim() || `git exited with status ${result.status}`)
  return result.stdout
}

function readBaselineManifest(ref: string): ArchiveManifest {
  runGit(['cat-file', '-e', `${ref}^{commit}`])
  const manifestEntry = runGit(['ls-tree', '--name-only', ref, '--', manifestRepoPath]).trim()
  if (manifestEntry === '') return { version: 1, files: {} }
  return parseArchiveManifest(runGit(['show', `${ref}:${manifestRepoPath}`]))
}

// The committed-baseline extension ratchet runs only in CI, where the base ref is the
// merge base the reviewer diffed against. Local runs compare the working manifest
// against current artifacts (a closed invariant), so a deliberate regeneration such as
// a whole-class removal is allowed to rewrite the sealed set without tripping over the
// pre-change baseline still on disk.
const baselineRef = process.env.DSH_ARCHIVE_BASE_REF
let baseline: ArchiveManifest | null = null
if (baselineRef !== undefined) {
  try {
    baseline = readBaselineManifest(baselineRef)
  } catch (error: unknown) {
    errors.push(`archived/manifest.json: cannot read baseline ${JSON.stringify(baselineRef)}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

let manifest: ArchiveManifest = { version: 1, files: {} }
if (existsSync(manifestPath)) {
  try {
    manifest = parseArchiveManifest(readFileSync(manifestPath, 'utf8'))
  } catch (error: unknown) {
    errors.push(`archived/manifest.json: ${error instanceof Error ? error.message : String(error)}`)
  }
} else if (!writeMode) {
  errors.push('archived/manifest.json is required; seal new artifacts with `pnpm run verify-archived-agent-notes --write`')
}

if (errors.length > 0) {
  console.error('verify-archived-agent-notes: archive rules violated:')
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}

// Recompute the sealed set from the artifacts actually present, so a whole-class removal
// regenerates rather than appends to a stale baseline. Hash matches (membership) and the
// committed-baseline extension ratchet below remain the hard guards.
const recomputed: Record<string, string> = {}
for (const [path, content] of [...artifacts].sort(([left], [right]) => left.localeCompare(right))) {
  recomputed[path] = recomputeHash(content)
}

function recomputeHash(content: Buffer): string {
  // sha256 must match the algorithm used by archived-agent-notes.ts archiveContentHash.
  return `sha256:${createHash('sha256').update(content).digest('hex')}`
}

if (writeMode) {
  const removed: string[] = []
  const changed: string[] = []
  const added: string[] = []
  for (const path of Object.keys(manifest.files)) {
    if (recomputed[path] === undefined) removed.push(path)
    else if (manifest.files[path] !== recomputed[path]) changed.push(path)
  }
  for (const path of Object.keys(recomputed)) {
    if (manifest.files[path] === undefined) added.push(path)
  }
  if (removed.length > 0) console.log(`verify-archived-agent-notes: ${removed.length} sealed artifact(s) removed by regeneration (${removed.join(', ')})`)
  if (changed.length > 0) console.log(`verify-archived-agent-notes: ${changed.length} sealed artifact(s) re-hashed (content edited)`)
  if (added.length > 0) console.log(`verify-archived-agent-notes: ${added.length} new artifact(s) sealed`)
  const rendered = renderArchiveManifest(recomputed)
  if (readFileSync(manifestPath, 'utf8') !== rendered) writeFileSync(manifestPath, rendered)
  console.log(`verify-archived-agent-notes: manifest regenerated with ${Object.keys(recomputed).length} sealed artifact(s).`)
} else {
  // Closed membership invariant: every artifact is sealed, no seal dangles, no hash drifts.
  for (const [path, hash] of Object.entries(manifest.files)) {
    const content = artifacts.get(path)
    if (content === undefined) errors.push(`${path}: sealed artifact is missing from the archive`)
    else if (recomputeHash(content) !== hash) errors.push(`${path}: sealed content hash changed`)
  }
  for (const [path] of [...artifacts].sort(([left], [right]) => left.localeCompare(right))) {
    if (manifest.files[path] === undefined) errors.push(`${path}: archived artifact is not sealed in manifest.json`)
  }
  if (baseline !== null) errors.push(...validateArchiveManifestExtension(baseline, manifest))
}

if (errors.length > 0) {
  console.error('verify-archived-agent-notes: archive rules violated:')
  for (const error of errors) console.error(`  ${error}`)
  process.exit(1)
}

if (!writeMode) {
  console.log(`verify-archived-agent-notes: ${artifacts.size} frozen artifact(s) checked across ${kinds.size} kind(s).`)
}
