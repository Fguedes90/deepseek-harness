# native/

Native source and public packages maintained with DeepSeek Harness. The [`landlock-run/` workspace](landlock-run/README.md) owns the Landlock self-restrict-then-exec launcher consumed by the harness, including its architecture, three-package npm family, platform support, development workflow, and [pack rehearsal](landlock-run/docs/release.md).

## Workspace and release boundary

`landlock-run/` and its packages belong to the repository's root pnpm workspace and lockfile. Harness consumers use the current workspace entry package during development and CI, so a launcher contract change and its consumer update can land and be tested together.

The main repository's `Landlock Run` workflow builds and tests each supported architecture, then packs the three npm tarballs and rehearses the consumer path from them. The entry package retains platform packages as npm optional dependencies, so npm installs only the package matching the user's operating system and CPU.
