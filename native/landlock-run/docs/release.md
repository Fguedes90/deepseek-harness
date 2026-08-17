# Pack rehearsal

`native/landlock-run` is consumed by the harness through `workspace:*`, not the npm registry, so it has no publish pipeline. The surviving release scripts (`pack-release.mjs`, `verify-packed-install.mjs`) back the pack rehearsal: `landlock-run.yml` packs the launcher family and rehearses the consumer path from the tarballs, so a packaging regression fails in CI instead of shipping.

## Preflight

```sh
pnpm install --frozen-lockfile
pnpm --dir native/landlock-run build:ts
pnpm --dir native/landlock-run typecheck
pnpm --dir native/landlock-run test:entry
```

On a Linux host, also rehearse the pack path locally:

```sh
pnpm --dir native/landlock-run build:native
pnpm --dir native/landlock-run test:launcher
node native/landlock-run/scripts/pack-release.mjs native/landlock-run/.release/npm --current-platform-only
node native/landlock-run/scripts/verify-packed-install.mjs native/landlock-run/.release/npm --current-platform-only
```

Manual local fallback (current platform's packages only) — always through `pack-release.mjs`, never `pnpm pack` directly (pnpm's pack path strips the launcher's executable bit; see [packaging.md](packaging.md)):

```sh
node native/landlock-run/scripts/pack-release.mjs native/landlock-run/dist/npm --current-platform-only
node native/landlock-run/scripts/verify-packed-install.mjs native/landlock-run/dist/npm --current-platform-only
```
