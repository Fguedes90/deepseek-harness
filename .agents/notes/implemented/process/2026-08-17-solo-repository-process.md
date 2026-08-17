# Agent Note: Solo repository process

Status: implemented

## Problem

This repository is a personal copy of DeepSeek Harness at `Fguedes90/deepseek-harness` with one contributor, and its process inherited an organization's control plane. Three inherited facts were inert or actively broken here.

Push-triggered lanes keyed on `master`, a branch this copy does not have: [CI](../../../../.github/workflows/ci.yml), the Pages deployment, the sandbox reference, and the Landlock matrix never ran after a merge, and the documentation site never published.

The Issue-management control plane addressed an organization that this copy cannot reach. Its policy resolved `deepseek-harness/deepseek-harness`, ProjectV2 number 1, and the `dsh-issue-management` lifecycle actor, and it enforced on every pull request: at least one same-repository Issue reference, exactly one `kind/*` label, at least one `area/*` label, Priority parity with each resolved Issue, a Han-script Issue title, a collapsed `<details>` body under a 50-unit visible ceiling, and a Project status drawn from a fixed seven-status set. None of those Project fields, labels, or actors exist here, so the required check failed every pull request for missing infrastructure rather than for a defect. The label taxonomy and the review-webhook status commands existed only to feed that Project.

Contributor-facing text also described the upstream project's posture: a Chinese pull-request template demanding a linked Issue, a `CONTRIBUTING.md` declining external pull requests on behalf of a team, and a GitHub Actions contract naming self-hosted Windows pools and a `master` standby lane that this copy does not define.

## Decision

Push-triggered workflows key on `main`, the repository's live default branch. The `wine-apt-cache` seeder and the exemption of `push` from run cancellation keep their existing shapes and follow the rename; [ci-workflow.spec.ts](../../../../scripts/ci-workflow.spec.ts) pins the new ref.

The Issue-management control plane is deleted, not reconfigured: the `Issue policy` workflow, `.github/issue-management/`, and the five Issue forms with their `config.yml` are gone, and the `test:issue-management` script and its gate entries in `check-all` and the shared static CI lane are removed with them. Pull-request metadata carries no required structure. Labels, milestones, Projects, and Issue references remain available and remain unread by CI, so a label may be applied for personal filing without any gate depending on the name. `kind/*` and `area/*` carry no repository meaning, and no reserved-alias list survives.

Contributor-facing text states this repository's own posture in English. [CONTRIBUTING.md](../../../../CONTRIBUTING.md) records the single-maintainer working agreement: changes land through a pull request against protected `main`, gated by `all checks passed`, with local evidence selected by [dsh-pre-push-checks](../../../skills/dsh-pre-push-checks/SKILL.md). The [pull-request template](../../../../.github/pull_request_template.md) asks for the change and the checks actually run, and marks the Issue reference optional. [.github/AGENTS.md](../../../../.github/AGENTS.md) states that every job runs on a standard hosted runner and that push lanes key on `main`.

Everything the code review and quality system owns is unchanged: the gate inventory in [run-gates.ts](../../../../scripts/run-gates.ts) minus the deleted policy test, the Agent Note requirement for non-trivial changes, the [testing policy](../../../../docs/testing.md), and the stacked-pull-request workflow.

## What the deleted decisions bought

The unified label taxonomy, consolidated into this note and deleted with it, answered two independent questions per pull request — dominant intent through a closed, mutually exclusive `kind/*` set, and materially affected durable domains through an open `area/*` set — and reserved every retired synonym so an obsolete spelling could not be recreated as an apparently unrelated operational label. It bought unambiguous cross-repository queries for a team reviewing many pull requests a day. One reader filing their own work needs no shared vocabulary to query, and an unenforced taxonomy degrades into stale labels, so its cost is now larger than its benefit.

The event-directed review-status commands treated `pull_request.review_requested` and a `changes_requested` submission as the two explicit handoffs an aggregate `reviewDecision` cannot express, and let automation move a Project Issue back from `In review` to `In progress` only when the latest status event for that Project came from the configured lifecycle actor. It bought an honest owner-of-the-next-step signal for work split between an author and a separate reviewer. A single contributor is always both, and the mechanism is unreachable without the Project it wrote to.

## Reintroduction conditions

Restore the control plane when a second regular contributor joins, or when work volume makes the pull-request queue unqueryable by hand. Restoring it requires the Project, the status field, the label inventory, and the lifecycle actor to exist first, because the policy resolves them at check time and fails the check when any is missing. The retired designs remain readable in git history; a restoration re-decides them against the repository that then exists rather than replaying them.

## Verification

`Issue policy` no longer appears in `.github/workflows/`, `.github/issue-management/` and `.github/ISSUE_TEMPLATE/` are absent, and no script or gate references `test:issue-management`. [ci-workflow.spec.ts](../../../../scripts/ci-workflow.spec.ts) pins the `main` push ref, the push-reachable job set, and the aggregate's required dependencies. Documentation gates prove no surviving prose links the deleted files.

## Alternatives considered

**Reconfigure the policy for this repository.** Pointing the configuration at `Fguedes90/deepseek-harness` and a new Project would keep the automation alive, but it requires creating a Project, its seven statuses, a Priority field, the whole label inventory, and an automation actor whose identity the backward status transition guards on — infrastructure that exists to coordinate people, for a repository with one person.

**Keep the workflow and relax its rules to warnings.** A check that never fails is a check nobody reads, and the policy's value was precisely that it blocked. It would also keep `.github/issue-management/` and its test in the gate inventory, paying maintenance for an unenforced rule.

**Keep the label taxonomy as an unenforced convention in AGENTS.md.** Rejected because a convention with no reader and no gate is documentation debt: the next change to the label set would have to be reconciled with prose nothing verifies.

**Rename the default branch to `master` instead of retargeting the workflows.** This would have kept the inherited workflow text untouched, but it renames the live branch that the remote, its open pull requests, and every local clone already use, to match copied configuration rather than reality.

**Keep `[main, master]` in the e2e triggers.** The dual list was already there and is harmless, but a branch that cannot exist in this repository is dead configuration that invites the next reader to assume a `master` lane exists.

## Consequences

A pull request can now be opened with an empty body and no labels, and CI still gates the merge; nothing recovers the intent or affected-area metadata that the closed `kind/*` set used to force.

Post-merge signals work for the first time in this copy: a push to `main` seeds the Wine apt cache, publishes the documentation site, and runs the sandbox and Landlock references.

Issues opened here get GitHub's blank form, so an Issue carries whatever structure its author gives it and no Project status is projected from pull-request events. Several implemented Agent Notes still describe upstream CI infrastructure — enterprise pools, self-hosted standby lanes, and their failover variables — that the workflows in this copy do not define; they are inaccurate here and are not authority for how this repository builds.
