# Agent Note: Collapse the Typert client-face analysis and emission path

Status: proposed

## Problem

A bloat survey proposed deleting the generator's independent Client-face path from `packages/typert/generator` — the `faces: ['host', 'client']` branching, the `tsconfig.client.json` program construction, the `isDualFacePackage` / `hostExportSubpaths` / `clientExportSubpaths` dual-registration, the `./client/typert` emission in `workspace.ts`/`emitter.ts`, and the `CrossFaceLink` model. The survey's premise was that only the generator's own tests (`type-model.spec.ts`, `remote-model.spec.ts`, fixtures) exercise client-face analysis, dual-face packages, and `CrossFaceLink`; the only deliberate exception was `packages/api/remotes` and its `typert.remote-client.*` Remote projection.

That premise is false. A wired production script depends on the client-face analysis path end to end, and cutting it would break that script and the committed artifact it produces.

### The entanglement: `gen-cordis-inspect-catalog`

`scripts/gen-cordis-inspect-catalog.ts` (wired as `pnpm run gen-cordis-inspect-catalog`, `package.json:106`) destructures `{ projector, model }` from `projectCordisCatalog(root, CORDIS_CATALOG_POLICY, 'client')`.

With `targetFace = 'client'`, `projectCordisCatalog` (`packages/typert/generator/src/cordis-catalog.ts:365-388`) drives the exact analysis path the cut targets:

- `WorkspaceAnalyzer({ root, faces: ['client'] }).discoverPackages()` — the `faces` filtering and `isDualFacePackage` / `clientExportSubpaths` registration (`analyzer.ts:455-494`),
- `WorkspaceAnalyzer({ root, faces: ['client'] }).analyzeInBatches()` — the client program construction off `tsconfig.client.json` (`analyzer.ts:300-331`),
- `indexSourceDeclarations()` — the `SourceDeclarationModel.face === 'client'` indexing,
- `workspace.faces.find(candidate => candidate.face === 'client')` — the client `FaceModel` the projector renders.

The output is a committed, runtime-imported artifact, not a test fixture. `gen-cordis-inspect-catalog.ts:10` sets `CLIENT_OUT = 'packages/extensions/cordis-client-runner/src/client/api-catalog.ts'`, and that 972-line file is imported by `packages/extensions/cordis-client-runner/src/client/providers.ts:7` (`import { queryEventApi, queryServiceApi } from './api-catalog.ts'`) → `index.ts`. `cordis-client-runner` is a shipped extension in `tsconfig.client.json`, bundled into the Web app via `packages/bundle/web-app/cordis.patch.yml` and `web-app/package.json`. So `gen-cordis-inspect-catalog` is a production consumer of the client-face **analysis** path (it needs neither the `./client/typert` emission nor `CrossFaceLink`, but it needs everything else the cut targets).

## Proposal

Do not cut the generic client-face path yet. First sever `gen-cordis-inspect-catalog`'s dependence on the client-face analysis, then re-evaluate the cut on the residual dead surface.

The client-runner API catalog is currently derived from the full client aggregate (`tsconfig.client.json` program, dual-registration, client `FaceModel`). To move it off that path:

1. **Derive the client catalog from host-side data instead.** `projectCordisCatalog` with the default `'host'` face already produces the identical `CordisCatalogModel` shape (the `clientModel()` narrow in `gen-cordis-inspect-catalog.ts:40-60` filters services/events by allow-lists and strips host-only methods, independent of which face produced the underlying model). If the host model carries the same `service.methods`/`event` contracts the client narrow needs, `gen-cordis-inspect-catalog` can run `projectCordisCatalog(root, policy)` (host face) and apply `clientModel()` — eliminating the need for a client aggregate, dual-registration, and the client `FaceModel`. The host model is already emitted and `verify-cordis-api`-gated, so freshness parity is preserved. This needs a check that every name in `CLIENT_EVENTS` and the per-service client method allow-lists is present in the host model.
2. **Only then re-run the survey cut.** The client-face analysis surface that survives step 1 (`faces` branching, `tsconfig.client.json` program construction, `isDualFacePackage`/`clientExportSubpaths` dual-registration, `SourceDeclarationModel.face`, client `FaceModel`) becomes genuinely dead once no wired script drives it, and can be removed together with the `./client/typert` emission and `CrossFaceLink`.

## Alternatives considered

- **Cut now and regenerate the client catalog from host data in the same change** — the natural end state, but it couples two risky changes (a generator refactor that must produce byte-identical client output, plus a large deletion) into one cut. The host-derivation is independently verifiable (`gen-cordis-inspect-catalog` output must not change); the deletion should land after that is proven, not in the same commit.
- **Delete `cordis-client-runner`'s Inspect catalog surface instead** — changes product behavior (the model-facing Inspect contract and the Web surface that consumes it) and is a separate product decision, not a dead-surface cleanup. Rejected for this note.
- **Cut only the provably-dead tail now** (`CrossFaceLink`, the `./client/typert` emission) and leave the analysis path — rejected because it leaves the task's target surface half-removed and still requires the entangled `isDualFacePackage`/`clientExportSubpaths` machinery that only the client analysis uses; the survey's cut was scoped as one coherent deletion.

## Acceptance criteria

- `gen-cordis-inspect-catalog` regenerates `packages/extensions/cordis-client-runner/src/client/api-catalog.ts` byte-identically (or a confirmed, reviewed delta) from the host face, with `verify-cordis-api` still green and `providers.ts` still importing a correct catalog.
- `rg 'projectCordisCatalog\\([^)]*, [^)]*\\x27client\\x27' packages scripts` returns no wired producer driving the client face.
- After that, the cut lands and the note moves to `implemented/`: `rg 'CrossFaceLink|isDualFacePackage|clientExportSubpaths|tsconfig.client.json' packages/typert` returns only what `api/remotes`' Remote projection genuinely needs, and `packages/api/remotes` and `typert.remote-client.*` are untouched.

## Risks

- **Cost of deferral (measured):** the dead surface stays until the unblock lands — roughly **190 source lines** across the generator's five `src` files: `CrossFaceLink` machinery (`analyzer.ts:762-809` collect, `2420-2443` record, `3106-3111` compare, ~78 lines), the `model.ts` cross-face types (`167-187`, `320-326`, ~28 lines), the `./client/typert` emission and its export validation (`workspace.ts:74-91`, `tsdown-plugin.ts:135-137`, ~20 lines), and the client-side analysis branches that only `gen-cordis-inspect-catalog` keeps alive (`analyzer.ts:293-349` and `455-494` client halves, `cordis-catalog.ts:365-388` targetFace, ~60 lines). The entangled analysis path cannot be measured as pure deletion because it is shared with the host path inside the same loop; the ~60-line figure is the client-specific branching within those regions.
- **Risk if cut now:** breaking `gen-cordis-inspect-catalog` silently ships a stale/empty `cordis-client-runner` Inspect catalog into the Web app — no test catches it because the catalog is generated and freshness-gated, not unit-tested.
- The `api/remotes` Remote projection and its `typert.remote-client.*` emission are unaffected by this proposal either way; they are host-face (`emitter.ts:124-126`) and survive.

## Related

- [Typert remote method calls](../../implemented/architecture/2026-08-02-typert-remote-method-calls.md) — the `remote-client` projection the exception keeps alive.
- [api-remotes generated contract build](../../implemented/process/2026-08-08-api-remotes-generated-contract-build.md) — how the dual-face analyzer seeds the Remote projection.
- [cordis web dynamic packages](../architecture/2026-08-08-cordis-web-dynamic-packages.md) — `cordis-client-runner`'s role as the browser-side consumer of the Inspect catalog.
