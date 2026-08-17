# Contributing

This repository is a personal working copy of DeepSeek Harness with a single maintainer. Issues and pull requests opened by other people are not monitored here; take them to the upstream project instead.

## Working agreement

Changes land through a pull request against `main`, never by pushing to `main` directly, so the `all checks passed` verdict on [CI](.github/workflows/ci.yml) gates every merge. Configure `main` as a protected branch requiring that check.

Before publishing a branch, run the checks that cover the changed surface — [dsh-pre-push-checks](.agents/skills/dsh-pre-push-checks/SKILL.md) selects them; the git hooks in [lefthook.yml](lefthook.yml) are a fast local checkpoint, not a substitute. Dependent branches use GitHub's native stacks per [dsh-merging-stacked-prs](.agents/skills/dsh-merging-stacked-prs/SKILL.md).

Every non-trivial change carries an Agent Note in the same pull request; [.agents/notes/README.md](.agents/notes/README.md) owns that rule and the file format. [AGENTS.md](AGENTS.md) is the binding work contract for the repository, read together with the nearest `AGENTS.md` above any file you touch.

Labels, milestones, and GitHub Projects are optional here: nothing in CI reads them.

## Ecosystem

Plugins live outside this repository. Associate a plugin project with the `dsh-plugin` GitHub topic so others can discover it.
