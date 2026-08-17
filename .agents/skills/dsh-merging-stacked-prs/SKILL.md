---
name: dsh-merging-stacked-prs
description: Use when landing a stack of dependent GitHub PRs (A ← B ← C, where each bases on the one below) onto master, merging a PR whose base is another open PR's branch, or whenever a request mentions "stacked PRs", "PR stack", "dependent PRs", or merging several related PRs in sequence. Requires every same-repository dependency chain to use GitHub's official stacked-PR feature before landing so GitHub owns stack-wide rules, CI, ordering, retargeting, and merge state.
---

# Landing an official GitHub PR stack

Land dependent PRs through GitHub's native stack object and `gh stack merge`. Do not reproduce stack semantics by merging and retargeting individual PRs with `gh pr merge` and `gh pr edit`. The root [AGENTS.md](../../../AGENTS.md) owns the allowed merge-forward and rebase histories; the [stack review guide](../../../docs/cookbook/responding-to-pr-review-on-a-stack.md) owns review-fix propagation.

## Require native stack support

The stacked-PR feature ships as the `gh stack` extension, installed with `gh extension install github/gh-stack`. A `gh` version floor is not a reliable gate: the CLI reference requires 2.0 or later while the quickstart says 2.90 or later, and the extension runs on 2.87.3. Treat a successful `gh stack version` as the client-side signal and the repository as enabled only when `GET repos/{owner}/{repo}/stacks` returns a JSON array, empty when the repository has no stacks; exit code `9` reports stacks disabled for the repository. Hard-stop if the extension or server-side feature is unavailable; do not fall back to manually merging and retargeting PRs one at a time. GitHub stacks require every head branch to live in the same repository, so hard-stop on a cross-fork chain.

Use a clean dedicated worktree. Fetch current PR metadata and exact head OIDs rather than trusting branch names or an earlier report:

```sh
gh pr view <pr> --json number,author,baseRefName,baseRefOid,headRefName,headRefOid,isCrossRepository,state,isDraft,reviewDecision,mergeStateStatus,statusCheckRollup
```

Query `PullRequest.stack` and `stackEntry.position` for at least one PR in each apparent chain; this official GitHub object, not base-branch inference alone, is the stack-membership authority. `PullRequestStack` exposes `id`, `number`, `baseRefName`, `size`, and `entries`; a standalone pull request returns `null` for both `stack` and `stackEntry`. There are no stack mutations in the public GraphQL schema, so stack writes go through `gh stack` or REST. Paginate `entries` when `size` exceeds the returned page:

```sh
gh api graphql -F owner=<owner> -F name=<repo> -F number=<pr> -f query='
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      number
      author { login }
      baseRefName
      headRefName
      stackEntry { position }
      stack {
        number
        baseRefName
        size
        entries(first: 100) {
          nodes {
            position
            pullRequest { number author { login } baseRefName headRefName state isDraft }
          }
        }
      }
    }
  }
}'
```

Establish the expected bottom-to-top order from the live PR bases: the bottom targets the trunk, and each higher PR targets the head branch immediately below it.

## Link missing stack members

`gh stack link` is not a metadata-only operation. It pushes branch arguments to the remote, creates pull requests for branches that lack one with the correct base chaining, and corrects existing pull requests whose base does not match the expected chain. It is additive: existing entries are never removed. Passing a stack number as the first argument appends to that stack, so re-listing its current PRs is unnecessary.

First compare any existing stack entries with the expected chain. One existing stack may contain an order-preserving subset of the requested chain; multiple stack numbers, an unexpected entry, or a conflicting order requires user direction before any mutation.

When any dependent PR is not yet in that official stack:

1. Compare every `author.login` exactly.
2. If all authors match, link the chain automatically in bottom-to-top order:

```sh
gh stack link --base <trunk> <bottom-pr> <next-pr> ... <top-pr>
```

3. If authors differ or any author is unavailable, ask the user whether to link before changing GitHub state.
4. Re-query GraphQL and require one stack number, the expected trunk, the complete PR set, and the expected positions and base chain.

Never dissolve or rebuild a stack without user direction. `gh stack link` is additive, and pull requests that are merged, merging, or queued cannot be removed from a stack. Interactive restructuring is `gh stack modify` (drop, fold, insert, reorder, rename, applied with Ctrl+S plus a cascading rebase), then `gh stack submit` to republish. `gh stack unstack` (alias `gh stack delete`) dissolves a stack, with `--local` to drop local tracking only.

## Refresh only when needed

Do not rewrite branches merely because a refresh mechanism exists. When the live merge state or repository rules require an updated trunk, choose either allowed history:

- **Native cascading rebase:** check out the remote stack with `gh stack checkout <pr-or-stack>` when it is not tracked locally, then run `gh stack sync`. Sync fetches, reconciles the remote stack, fast-forwards the trunk, cascade-rebases only when trunk moved, and pushes with `--force-with-lease` only when a rebase occurred; a clean remote-ahead update is pulled down without prompting. Immediately inspect the rewritten scope, run the relevant checks for every affected layer, and do not merge or claim readiness until they pass. If sync detects a rebase conflict, use `gh stack rebase`, resolve and validate it, then publish with `gh stack push`.
- **Incremental merge-forward:** merge the trunk into the bottom affected branch, then propagate each updated parent into its child in bottom-to-top order and push normally. If the base advances during an in-progress merge, preserve that checkpoint before merging the newer tip as specified by the [incremental-retargeting note](../../notes/implemented/process/2026-07-26-incremental-pr-base-retargeting.md).

In a non-interactive terminal, a diverged local/remote stack makes `gh stack sync` abort and exit successfully, having pushed nothing; exit status is therefore not evidence that a sync happened. Verify the resulting stack state and heads after every sync. If checkout or sync reports divergent local and remote stack compositions, cancel and ask rather than deleting or recreating the remote stack automatically.

Any history rewrite is allowed after review, but it invalidates commit-OID assumptions. Re-fetch exact heads and re-audit unresolved review threads, approvals, mergeability, and checks after the push. Never use raw `--force` or overwrite a concurrently advanced remote head.

## Preflight the merge range

Re-query the official stack immediately before merging. Require every selected PR to be open, non-draft, in the expected order, and compliant with the repository's review and check requirements. Treat each PR's state independently; a ready top layer does not prove its dependencies are ready.

"Land the stack" selects the whole stack. A partial landing requires an explicit boundary PR and includes every layer from the bottom through that boundary.

## Merge through the stack API

Merge the whole stack by its official stack number:

```sh
gh stack merge <stack-number> --yes --merge
```

For an explicitly requested partial landing, merge through the boundary PR:

```sh
gh stack merge <boundary-pr> --yes --merge
```

The command's flags are `--merge-method` (`merge`, `squash`, or `rebase`), `--merge`, `--squash`, `--rebase`, and `-y/--yes`; there is no `--delete-branch` flag. Do not manually retarget dependents or issue per-PR merge commands. GitHub merges the selected range bottom-up and retargets/rebases any remaining upper layers.

Before merging, `gh stack merge` checks only that each selected pull request is open and not a draft. GitHub evaluates branch protection and repository rules server-side when the merge runs, and any failure is reported back; they cannot be bypassed. A direct stack merge is all-or-nothing; when the trunk uses a merge queue, the stack is queued, the `--merge-method`, `--merge`, `--squash`, and `--rebase` flags are ignored with a warning, and the selected pull requests may land in separate groups.

If the native merge reports a blocker, inspect and resolve that blocker through the owning PR or stop and report it; never fall back to `gh pr merge`.

## Verify the landed state

Wait for every selected PR to report `MERGED`; a queued request is not a completed landing:

```sh
gh pr view <pr> --json number,state,mergedAt,mergeCommit,baseRefName,headRefName
```

For a partial landing, re-query the official stack and verify that every remaining PR is still linked in the expected order and targets the stack trunk or the layer below it. Re-check current heads, review state, and CI because GitHub may have rebased the remaining layers.

Delete branches only in a separate final pass after the corresponding PRs report `MERGED`. Before deleting each branch, require GitHub to report no open PR still using it as a base:

```sh
gh pr list --state open --base <branch> --json number --jq length
```

Anything other than `0` blocks deletion.

## Read the exit codes

`gh stack` signals operator-relevant states through these exit codes: `2` not in a stack or stack not found; `3` rebase conflict; `6` disambiguation required because the branch belongs to multiple stacks; `7` rebase already in progress; `8` stack locked by another process; `9` stacks not enabled for the repository.

## Checklist

- [ ] Native `gh stack` support is available (`gh stack version` succeeds and `GET repos/{owner}/{repo}/stacks` returns a JSON array without exit code `9`); every PR branch is in the same repository.
- [ ] Live PR bases and exact heads establish one bottom-to-top dependency chain.
- [ ] GraphQL reports one official stack with the expected trunk, entries, and order; an eligible same-author unstacked chain was linked automatically.
- [ ] After any `gh stack sync`, the resulting stack state and heads match the expected chain (a non-interactive sync that exits `0` may have pushed nothing).
- [ ] Any rewritten layers passed relevant validation, and review threads, approvals, mergeability, and checks were re-audited afterward.
- [ ] The whole stack, or an explicitly bounded prefix, was submitted through `gh stack merge --yes --merge`.
- [ ] Every selected PR reports `MERGED`; any remaining upper layers still form the expected official stack.
- [ ] Branch deletion happened only after merged-state and zero-dependent verification.
