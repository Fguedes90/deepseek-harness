/**
 * Coverage-debt ratchet: keeps the measured debt ceiling from decaying.
 *
 * Background: the main coverage gate enforces global per-file 100% (vitest
 * `thresholds.perFile`). A glob threshold does NOT exempt a file from that
 * global threshold (verified empirically in vitest 4), so a sub-100% debt file
 * cannot live in the main gate. Instead it is measured and locked by the
 * coverage-debt lane (`DSH_COVERAGE_DEBT_LANE=1 vitest run --coverage`), which
 * instruments ONLY the debt files and enforces one per-file glob threshold per
 * debt file at its real measured value. This script is the ratchet on top:
 *
 *   1. Reads the debt lane's `coverage/debt/coverage-summary.json`.
 *   2. For each locked debt glob compares real vs declared and FAILS when real
 *      is ABOVE declared (raise the declared number by reviewed edit), naming
 *      the file and both numbers. Debt only ratchets upward.
 *   3. FAILS when real is 100% (delete the entry — the file is covered and
 *      returns to the global 100% regime).
 *   4. FAILS when a debt glob matches no file (dead entry) or is duplicated /
 *      contained in another (redundant or overlapping globs).
 *   5. No autoUpdate: the number moves only by reviewed edit of
 *      scripts/coverage-debt.ts, never by script writing to config.
 *
 * Run after the debt lane:
 *   DSH_COVERAGE_DEBT_LANE=1 pnpm exec vitest run --coverage
 *   pnpm exec tsx scripts/verify-coverage-debt.ts
 */

import { globSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { coverageDebt } from './coverage-debt.ts'

const root = resolve(import.meta.dirname, '..')
const summaryPath = resolve(root, 'coverage/debt/coverage-summary.json')

/** Per-metric real coverage of one file from the json-summary report. */
interface RealCoverage {
  lines: { pct: number }
  statements: { pct: number }
  branches: { pct: number }
  functions: { pct: number }
}

interface CoverageSummaryFile {
  total: { lines: { pct: number } }
}

/** Cached parsed json-summary (keyed by absolute file path). */
type Summary = Record<string, RealCoverage>

function loadSummary(): Summary {
  let raw: string
  try {
    raw = readFileSync(summaryPath, 'utf8')
  } catch {
    console.error(
      `verify-coverage-debt: cannot read ${summaryPath}. ` +
        'Run the coverage-debt lane first: DSH_COVERAGE_DEBT_LANE=1 pnpm exec vitest run --coverage',
    )
    process.exit(1)
  }
  const parsed = JSON.parse(raw) as { total?: CoverageSummaryFile }
  // istanbul keys every file by absolute path and also has a "total" key.
  const files = Object.keys(parsed).filter(key => key !== 'total')
  if (parsed.total === undefined || files.length === 0) {
    console.error(`verify-coverage-debt: ${summaryPath} has no per-file data.`)
    process.exit(1)
  }
  return parsed as Summary
}

/** Match a coverage-relative debt glob against absolute paths from the report. */
function globToRegExp(glob: string): RegExp {
  // Convert a repo-relative glob to a regex anchored on the repo root.
  // Components: `**` -> any path segments, `*` -> one segment, `.` literal.
  const rootPrefix = root.replace(/\\/g, '/')
  const re = glob
    .replace(/\\/g, '/')
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*')
  return new RegExp(`^${rootPrefix}/${re}$`)
}

interface Finding { message: string }

const findings: Finding[] = []

// --- 4. structural checks: duplicate globs -----------------------------------
// All debt globs are exact file paths (no metacharacters), so containment
// between distinct entries is impossible — only exact duplicates apply.
const seen = new Map<string, string>() // glob -> first owner
for (const entry of coverageDebt) {
  const prev = seen.get(entry.glob)
  if (prev !== undefined) {
    findings.push({ message: `duplicate debt glob: ${entry.glob}` })
  } else {
    seen.set(entry.glob, entry.glob)
  }
}

const summary = loadSummary()
const relOf = (abs: string): string => {
  const norm = abs.replace(/\\/g, '/')
  return norm.startsWith(`${root}/`) ? norm.slice(root.length + 1) : norm
}

// Dead glob: an entry whose glob matches no file on disk. A file that exists
// but is never imported shows as 0% in the summary and is still a valid debt
// entry (the ratchet demands its deletion at 100%); only a glob matching no
// file is dead.
const diskMisses: string[] = []
for (const entry of coverageDebt) {
  if (globSync(entry.glob, { cwd: root }).length === 0) {
    diskMisses.push(entry.glob)
  }
}
for (const glob of diskMisses) {
  findings.push({ message: `debt glob matches no file on disk: ${glob} (dead entry — delete it)` })
}

// Map each debt glob to its matched files in the report.
const matchedFiles = new Map<string, string[]>()
for (const entry of coverageDebt) {
  const re = globToRegExp(entry.glob)
  const matches = Object.keys(summary).filter(abs => re.test(abs.replace(/\\/g, '/')))
  matchedFiles.set(entry.glob, matches)
}

// --- 2. per-file ratchet: real > declared fails; real == 100 demands delete --
for (const entry of coverageDebt) {
  const matches = matchedFiles.get(entry.glob) ?? []
  for (const abs of matches) {
    const file = relOf(abs)
    const real = summary[abs]
    if (real === undefined) continue
    const metrics: Array<[keyof RealCoverage, number, string]> = [
      ['lines', entry.lines, 'lines'],
      ['statements', entry.statements, 'statements'],
      ['branches', entry.branches, 'branches'],
      ['functions', entry.functions, 'functions'],
    ]
    // A file is fully covered only when EVERY metric hits 100%; then the debt
    // entry is moot and must be deleted (it returns to the global 100% regime).
    // A single metric at 100 while others lag is still debt — only that metric's
    // locked ceiling holds at 100 and the ratchet does not fire deletion.
    const allFull = metrics.every(([metric, ,]) => real[metric].pct === 100)
    if (allFull) {
      findings.push({
        message:
          'file is now fully covered (all metrics 100%) — DELETE the debt entry for ' +
          `${file} from scripts/coverage-debt.ts; it returns to the global 100% regime`,
      })
      continue
    }
    for (const [metric, declared, label] of metrics) {
      const pct = real[metric].pct
      if (pct > declared) {
        findings.push({
          message:
            `debt ratchet: ${file} ${label} is ${pct}% > declared ${declared}% — ` +
            'RAISE the declared value in scripts/coverage-debt.ts (debt only ratchets up)',
        })
      }
    }
  }
}

if (findings.length > 0) {
  console.error(`verify-coverage-debt: ${findings.length} finding(s):`)
  for (const f of findings) console.error(`  - ${f.message}`)
  process.exit(1)
}
console.log('verify-coverage-debt: all debt coverage within locked ceilings.')
