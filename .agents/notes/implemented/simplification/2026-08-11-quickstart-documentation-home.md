# Agent Note: Route documentation roots to quick start

Status: implemented

## Problem

A separate documentation landing page duplicates product positioning and feature summaries owned by the product landing page. Those parallel claims require synchronization and review without helping readers reach technical instructions.

## Decision

The root is a redirect page. `/` sends readers to `./guide/quickstart`. The relative target preserves the configured `DOCS_BASE` when the site is hosted below an origin path.

`docs/user/index.md` owns the redirect as VitePress frontmatter. The [documentation-site projector](../process/2026-07-13-documentation-site-projection.md) publishes only that frontmatter for the root home, so the canonical Markdown does not render a second landing page.

Product positioning and feature summaries stay outside the documentation site. Guide, development, reference, and search remain available from the quick-start page.

## Alternatives considered

**Keep a documentation hero and synchronize its wording.** This preserves a promotional entry page but creates a second product narrative whose claims and terminology can drift from the product landing page.

**Render a documentation index at the root.** An index repeats the navigation already provided by the site and inserts another choice before the first actionable guide.

**Copy quick-start content to each locale root.** Two public routes would then own the same tutorial and require another synchronization mechanism.

**Use origin-absolute redirect targets.** Paths such as `/guide/quickstart` ignore `DOCS_BASE` and fail when the documentation site is hosted below an origin path.

## Consequences

Readers entering the root immediately reach the quick-start tutorial. The documentation site gives up a promotional home surface, while the product landing page remains the single owner of positioning and feature summaries. The stable root route remains a valid entry point, and quick-start content retains one canonical source.
