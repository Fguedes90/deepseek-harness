# Agent Note: Lazy-load the client fixture backend (and reconfirm the dev-only HMR chain)

Status: proposed

## Problem

`packages/client/connection/src/client/fixture.ts` is a 3,188-line, ~142 KB in-memory fake backend (`FixtureApiClient`, `createFixtureApi`, `createFixtureFaces`). It is statically imported at `packages/client/connection/src/client/index.ts:9` and instantiated only when the page URL carries the `fixture` switch (`index.ts:86-87`: `new URLSearchParams(pageLocation.search).has('fixture')`). Because a bundler cannot tree-shake a class that a runtime conditional references, the fixture is inlined into every browser bundle — it is present verbatim inside the shipped `lib/client.js` (the `lib/types/client/fixture.js` region) — even though end users never exercise it. Its real callers are the dev/test surfaces: `apps/web/stress-tests/reasoning-chunks.stress.ts` (boots with `?fixture`), `apps/web/tests/goal-bar.e2e.ts`, `apps/web/tests/assembled-boot.ts` (and its snapshot siblings), plus the connection package's own specs, which import the fixture directly from `../src/client/fixture.ts` (source path) and so are unaffected by the production entry.

Separately, `@deepseek-ai/dsh-client-hmr` is mounted unconditionally at `packages/bundle/web-app/cordis.patch.yml:142-143`. Its browser half opens a persistent `/plugins/events` SSE connection per tab and its host half stat-polls every graph row's client bundle (`packages/client/hmr/src/events.ts:16`, `packages/client/hmr/src/index.ts`) — for a capability only `pnpm run dev:web` uses. Both `packages/client/hmr/README.md` and `packages/bundle/web-app/README.md` document this as an intentional idle-in-prod design, so it is a reconfirm-or-dev-gate question, not a defect.

## Proposal

Convert the fixture's static import to a dynamic `import()` behind the existing `?fixture` check, so the 142 KB backend ships as a lazy chunk loaded only when a dev/test tab asks for it. Convert the adjacent HMR mount to an explicit "reconfirm or dev-gate" decision rather than an unexamined always-on row.

### Cost of the fixture lazy-load

- **`apply()` becomes async.** `packages/client/connection/src/client/index.ts` `apply()` (`index.ts:78-89`) currently builds `handle` synchronously with `fixture ? new FixtureApiClient() : undefined`. A dynamic import must be awaited before constructing the fixture client, so `apply` becomes `async` on the fixture branch. Cordis plugin `apply` supports async, and the loader already awaits plugin startup before consumers read `ctx.connection`, so timing from the boot pipeline is preserved; apps/web tests wait on UI selectors after mount, not on synchronous `ctx.connection` reads.
- **The client bundle splits.** The tsdown client config is a single-entry CJS bundle pinned to exactly `lib/client.js` (`packages/client/tsdown.client.ts` `clientConfig`). A dynamic relative `import('./fixture.ts')` does not trip the `dsh-client-bundle-purity` gate (that gate constrains only `@deepseek-ai` value imports), but it makes the bundler emit a second chunk the loader must fetch. The apps/web assembled-boot path loads the built bundle via `AppWebEntry`'s `ModuleLoader` (`loadBundle`) reading `lib/client.js`; that loader must resolve a relative chunk import, so the second chunk's file naming against the pinned `client.js` output and the loader's chunk resolution are the migration points to verify.
- **The package's own specs are unaffected** (they import the fixture from `../src/client/fixture.ts` directly).

### Adjacent question: reconfirm or dev-gate the always-on HMR chain

`dsh-client-hmr` costs a persistent `/plugins/events` SSE connection per production tab plus host-side stat polling for a capability only `pnpm run dev:web` uses. Both READMEs present this as intentional, so the note records two acceptable resolutions rather than a defect:
- **Reconfirm** — accept the idle chain as a deliberate always-on row (the README-documented stance), trading a small per-tab SSE + poll cost for a zero-config `dev:web` reload.
- **Dev-gate** — mount the row only when the dev watcher is present (or gate the browser half behind a `dev` flag), removing the production cost and making the dev-only nature explicit in the composition.

## Alternatives considered

- **Leave the static import as-is** — rejected as the status quo this note exists to remove: ~142 KB of fake backend ships in every end-user bundle for a dev-only transport.
- **Split the fixture to a separate package with no production import** — heavier than a dynamic import; it would move the file and its spec-imports and re-point the `tsconfig.client.json` entry list, when the goal is only to stop shipping it eagerly.
- **Delete the fixture** — rejected: it is the keyless transport for the assembled-browser snapshots and stress tests; deleting it would remove a large chunk of non-network web coverage with no replacement.
- **For HMR: leave it always-on without a decision** — rejected as the unexamined status quo; a reconfirm-or-dev-gate note forces the cost to be owned.

## Acceptance criteria

- The fixture is loaded via dynamic `import()` only when the `?fixture` check is true; `lib/client.js` no longer contains the fixture inline, and the lazy chunk loads in the assembled-boot and stress-test paths (those tests pass unchanged).
- `apply()` is async on the fixture branch, and the connection package's own specs plus `apps/web/tests/{assembled-boot,goal-bar}.e2e` and `apps/web/stress-tests/reasoning-chunks.stress.ts` still pass.
- The HMR chain either stays always-on with a recorded reconfirm decision or is dev-gated in the web-app composition.

## Risks

- An async `apply` and a split client bundle touch the boot path every web consumer shares; if the loader's chunk resolution is not handled, every client bundle boot fails — this is the one migration point that must be proven before merge.
- Dev-gating HMR could break `pnpm run dev:web` reload for developers who expect it always-on; the gate must keep the default dev experience intact.
