import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as yaml from 'js-yaml'
import { describe, expect, it } from 'vitest'
import { gatesForMode, type Mode } from './run-gates.ts'

const root = resolve(import.meta.dirname, '..')
const runnerPrivatePnpmDestination = '${{ runner.temp }}/setup-pnpm'

describe('CI workflow', () => {
  it('isolates every pnpm action setup destination per runner', () => {
    const workflow: unknown = yaml.load(readFileSync(resolve(root, '.github/workflows/ci.yml'), 'utf8'))
    if (!isRecord(workflow) || !isRecord(workflow.jobs)) throw new TypeError('CI workflow must define jobs')

    const setups = Object.entries(workflow.jobs).flatMap(([jobName, job]) => {
      if (!isRecord(job) || !Array.isArray(job.steps)) return []
      return job.steps.flatMap((step) => {
        if (!isRecord(step) || typeof step.uses !== 'string' || !step.uses.startsWith('pnpm/action-setup@')) return []
        return [{ jobName, step }]
      })
    })

    expect(setups.length).toBeGreaterThan(0)
    for (const { jobName, step } of setups) {
      expect(step, `${jobName} must not share pnpm/action-setup's default destination`).toMatchObject({
        with: { dest: runnerPrivatePnpmDestination },
      })
    }
  })

  it('runs every blocking lane on standard hosted runners and aggregates all of them', () => {
    const workflow = loadWorkflow('.github/workflows/ci.yml')
    if (!isRecord(workflow.jobs)
      || !isRecord(workflow.jobs.windows)
      || !isRecord(workflow.jobs['windows-native'])
      || !isRecord(workflow.jobs['wine-apt-cache'])
      || !isRecord(workflow.jobs['node-24'])
      || !isRecord(workflow.jobs['node-24-coverage'])
      || !isRecord(workflow.jobs['node-24-consumers'])
      || !isRecord(workflow.jobs['all-checks-passed'])) {
      throw new TypeError('CI workflow must define windows, windows-native, wine-apt-cache, node-24, node-24-coverage, node-24-consumers, and all-checks-passed jobs')
    }

    const windows = workflow.jobs.windows
    const windowsNative = workflow.jobs['windows-native']
    const wineAptCache = workflow.jobs['wine-apt-cache']
    const node24 = workflow.jobs['node-24']
    const node24Coverage = workflow.jobs['node-24-coverage']
    const node24Consumers = workflow.jobs['node-24-consumers']
    const aggregate = workflow.jobs['all-checks-passed']
    if (!Array.isArray(windows.steps) || !Array.isArray(aggregate.needs)) {
      throw new TypeError('Windows job must define steps and the aggregate must define needs')
    }
    const commandSteps = windows.steps.filter((step): step is Record<string, unknown> & { run: string } => (
      isRecord(step) && typeof step.run === 'string'
    ))

    // Required PR job: Wine on ubuntu-latest, runs wine-windows-gates.sh.
    expect(windows['runs-on']).toBe('ubuntu-latest')
    expect(windows.name).toBe('windows node 24 / wine blocking')
    expect(windows.if).toBe("github.event_name == 'pull_request'")
    expect(commandSteps.some(step => step.run.includes('wine-windows-gates.sh'))).toBe(true)

    // windows-native: required native job on a standard hosted Windows runner.
    expect(windowsNative['runs-on']).toBe('windows-latest')
    expect(windowsNative.name).toBe('windows node 24 / native complete')
    expect(windowsNative.if).toBe("github.event_name == 'pull_request'")
    const nativeCommandSteps = (windowsNative.steps as unknown[]).filter((step): step is Record<string, unknown> & { run: string } => (
      isRecord(step) && typeof step.run === 'string'
    ))
    expect(nativeCommandSteps.map(step => step.run)).toContain('pnpm run check:ci:windows-complete')

    // wine-apt-cache: main-only, seeds the Wine apt cache.
    expect(wineAptCache.if).toBe("github.event_name == 'push' && github.ref == 'refs/heads/main'")
    expect(wineAptCache['runs-on']).toBe('ubuntu-latest')

    // No self-hosted pools anywhere: every worker and the verdict job run on
    // standard hosted runners.
    for (const [jobName, job] of [['node-24', node24], ['node-24-coverage', node24Coverage], ['node-24-consumers', node24Consumers]] as const) {
      expect({ job: jobName, runsOn: job['runs-on'] }).toEqual({ job: jobName, runsOn: 'ubuntu-latest' })
    }
    expect(aggregate['runs-on']).toBe('ubuntu-latest')

    // Aggregate requires every blocking lane, native Windows included — a job
    // left out of `needs` would be a gate that never blocks.
    for (const name of ['node-24', 'node-24-coverage', 'node-24-consumers', 'node-compat', 'windows', 'windows-native']) {
      expect(aggregate.needs).toContain(name)
    }
  })

  it('exempts push from cancellation, so one main merge does not cancel the running drill', () => {
    const workflow = loadWorkflow('.github/workflows/ci.yml')
    if (!isRecord(workflow.jobs) || !isRecord(workflow.concurrency)) {
      throw new TypeError('CI workflow must define jobs and a workflow-level concurrency block')
    }

    // Cancellation applies to the whole superseded RUN, so this has to be
    // decided at workflow level and gated on the event. Only push is exempt —
    // a push must not cancel a pull-request verdict mid-flight. The negated
    // form is load-bearing: `== 'pull_request'` would also stop cancelling
    // any future dispatch event by accident.
    expect(workflow.concurrency['cancel-in-progress']).toBe("${{ github.event_name != 'push' }}")

    // What bounds the cost of exempting push: a main push may only carry the
    // Wine apt-cache seeder. Any job reachable on push would start accumulating
    // uncancelled runs, so the set is pinned here.
    //
    // Classification is an exact allowlist of the conditions in use, not a
    // substring match: `always() && github.event_name == 'pull_request'`
    // mentions `pull_request` yet is NOT push-reachable, so matching on the
    // event name alone would silently misclassify it as gated.
    const NOT_PUSH_REACHABLE = new Set([
      "github.event_name == 'pull_request'",
      "always() && github.event_name == 'pull_request'",
    ])
    const pushReachable = Object.entries(workflow.jobs)
      .filter(([, job]) => {
        if (!isRecord(job)) return false
        if (job.if === undefined) return true // unconditional: runs on every event
        if (job.if === false) return false // `if: false` parses as a boolean
        if (typeof job.if !== 'string') return true // unrecognized shape: surface it
        return !NOT_PUSH_REACHABLE.has(job.if.trim())
      })
      .map(([name]) => name)
      .sort()
    expect(pushReachable).toEqual(['wine-apt-cache'])
  })

  it('keeps supported LSP source under native Windows coverage', () => {
    const config = readFileSync(resolve(root, 'vitest.config.ts'), 'utf8')

    expect(config).not.toContain('packages/lsp/lsp-stdio/src/connection.ts')
    expect(config).not.toContain('packages/lsp/lsp-stdio/src/index.ts')
    expect(config).not.toContain('packages/lsp/lsp-stdio/src/instance.ts')
  })

  it('keeps every Vitest project process-isolated on native Windows', () => {
    const config = readFileSync(resolve(root, 'vitest.config.ts'), 'utf8')

    expect(config).not.toContain("pool: process.platform === 'win32' ? 'threads' : 'forks'")
    expect(config.match(/pool: 'forks'/g)).toHaveLength(2)
  })

  it('runs every defined gate in a CI workflow lane (no orphan gates)', () => {
    // Gate construction resolves the pnpm entrypoint, which only a package
    // script exports; pin it so this sensor reads the graph under any runner
    // invocation instead of throwing when run through `pnpm exec vitest`.
    const previousEntrypoint = process.env.npm_execpath
    process.env.npm_execpath ||= resolve(root, 'node_modules/pnpm/bin/pnpm.cjs')
    try {
      assertNoOrphanGates()
    } finally {
      if (previousEntrypoint === undefined) Reflect.deleteProperty(process.env, 'npm_execpath')
    }
  })
})

function assertNoOrphanGates(): void {
  // Reached modes = the run-gates modes the workflows actually invoke,
  // derived from the `run:` commands in ci.yml and docs-pages.yml rather
  // than assumed. A gate that exists only in a mode no workflow runs is a
  // gate that never blocks, which is the failure this test exists to catch.
  const reached = collectReachedModes()
  expect(reached.size).toBeGreaterThan(0)

  const reachable = new Set<string>()
  for (const mode of reached) {
    for (const gate of gatesForMode(mode)) reachable.add(gate.id)
  }

  // node-compat's CI matrix runs both a 22.19 leg (which adds the built
  // workspace/web trees and the CLI lazy-search startup smoke) and a 26
  // leg; gatesForMode under the test runner's own Node major returns only
  // one branch, so fold the other branch's gates in.
  if (reached.has('node-compat')) {
    for (const id of ['build', 'build:web', 'cli-lazy-search-startup-smoke']) reachable.add(id)
  }

  const defined = new Set<string>()
  for (const mode of ALL_MODES) {
    for (const gate of gatesForMode(mode)) defined.add(gate.id)
  }

  // Gates deliberately absent from required PR CI. Keep this as small as
  // possible: a gate added to a local-only aggregate must either be covered
  // by a workflow lane or land here with a reason that still holds.
  const legitimateNonPrGates: Record<string, string> = {
    'typert-contracts': 'Dedicated Host Typert contract-generation gate of the local ci-primary aggregate; the same host compile (build:lib:host) already runs in the required consumers lane via the build gate, so PR CI needs no second copy.',
    'test': 'check-all bare vitest run; required ci-coverage instruments the same suites (test:coverage), so a bare test gate in a required lane would only re-run them.',
  }

  const orphans = [...defined].filter(id => !reachable.has(id) && !(id in legitimateNonPrGates))
  expect(
    orphans,
    `gates defined in run-gates.ts but not run by any CI workflow lane: ${orphans.join(', ')}`,
  ).toEqual([])
}

function loadWorkflow(path: string): Record<string, unknown> {
  const workflow: unknown = yaml.load(readFileSync(resolve(root, path), 'utf8'))
  if (!isRecord(workflow)) throw new TypeError(`${path} must define a workflow`)
  return workflow
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Every aggregate a developer can select from the gate runner. */
const ALL_MODES: readonly Mode[] = [
  'ci-primary',
  'ci-linux-primary',
  'ci-static',
  'ci-lint-contracts-ready',
  'ci-coverage',
  'ci-snapshot',
  'ci-artifacts',
  'ci-consumers',
  'ci-windows-blocking',
  'ci-windows-complete',
  'ci-windows-observational',
  'node-compat',
  'check-all',
  'doc-sync',
]

/**
 * Maps a `pnpm run <script>` command that invokes the gate runner to the Mode
 * that script selects. Scripts that run the gate runner through another path
 * (wine-windows-gates.sh, or a gate that nests a second mode) are handled in
 * collectReachedModes.
 */
const RUN_GATES_SCRIPT_TO_MODE: Record<string, Mode> = {
  'check:ci:static': 'ci-static',
  'check:ci:coverage': 'ci-coverage',
  'check:ci:consumers': 'ci-consumers',
  'check:ci:windows-complete': 'ci-windows-complete',
  'check:node-compat': 'node-compat',
  'doc-sync': 'doc-sync',
}

/**
 * Modes that a workflow actually invokes, derived from the `run:` commands in
 * ci.yml and docs-pages.yml. A mode is reached only when one of these facts
 * holds, so the set stays honest when lanes are renamed or removed.
 */
function collectReachedModes(): Set<Mode> {
  const reached = new Set<Mode>()
  for (const path of ['.github/workflows/ci.yml', '.github/workflows/docs-pages.yml']) {
    const workflow = loadWorkflow(path)
    if (!isRecord(workflow.jobs)) continue
    for (const job of Object.values(workflow.jobs)) {
      if (!isRecord(job) || !Array.isArray(job.steps)) continue
      for (const step of job.steps) {
        if (!isRecord(step) || typeof step.run !== 'string') continue
        const run = step.run
        // The `windows` job runs wine-windows-gates.sh, which executes exactly
        // the ci-windows-blocking surfaces (workspace build, production site).
        if (run.includes('wine-windows-gates.sh')) reached.add('ci-windows-blocking')
        for (const [script, mode] of Object.entries(RUN_GATES_SCRIPT_TO_MODE)) {
          if (new RegExp(`pnpm run ${script}(?:\\s|$)`).test(run)) reached.add(mode)
        }
      }
    }
  }
  // ci-consumers' lint-and-duplication gate invokes the ci-lint-contracts-ready
  // mode (check:ci:lint:contracts-ready), so that lane is reached transitively.
  if (reached.has('ci-consumers')) reached.add('ci-lint-contracts-ready')
  return reached
}
