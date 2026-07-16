# Publio Personal Multiplatform Publishing Workbench Design

- Status: Approved
- Approved on: 2026-07-15
- Product mode: Single-user, local-first personal tool
- Target platforms: WeChat Official Account, Xiaohongshu, Zhihu, and X

## 1. Decision Summary

Publio will be a local publishing workbench for an individual creator. Its job is to take one Markdown source draft, produce four platform-specific variants, validate and preview them in one place, and publish them after one explicit confirmation.

The product will not compete with full-featured writing tools or become a hosted SaaS. Users may either write inside Publio or import an existing Markdown file. Deterministic platform rules are the default adaptation mechanism; AI is an optional, explicit optimization step for a selected platform.

The canonical workflow is:

```text
Create or import source draft
  -> save source draft
  -> generate four platform variants
  -> optionally edit or AI-optimize individual variants
  -> run preflight checks
  -> preview final payloads
  -> confirm once
  -> publish platforms independently
  -> inspect receipts and retry only safe failures
```

## 2. Product Goal

Publio should remove the repeated work involved in copying one article into four platform backends, reformatting it, checking different constraints, uploading images, and tracking which destinations succeeded.

The first-stage success condition is:

> Starting from one completed source draft, the user can adapt, verify, and publish to all four platforms from one interface, and every failure has a clear and safe recovery path.

### 2.1 Primary user

The only primary user is the tool owner. The design may optimize for that user's devices, credentials, platform mix, and working habits. It does not need multi-user abstractions or generic administration features.

### 2.2 Product principles

- Local-first: drafts, receipts, assets, and configuration remain on the user's machine.
- One canonical source: every platform variant can be traced to one saved source-draft revision.
- Explicit publication: no content becomes public without a final confirmation.
- Deterministic core: rule-based adaptation works without AI.
- No silent overwrite: source changes never overwrite manually edited variants.
- Partial success is normal: one platform failure does not invalidate successful publications.
- Safe recovery over blind automation: ambiguous results are inspected before retrying.

## 3. Scope

### 3.1 In scope

- Create and edit Markdown source drafts.
- Import `.md` files as new local drafts.
- Save and recover local drafts.
- Generate variants for WeChat, Xiaohongshu, Zhihu, and X.
- Manually edit each platform variant.
- Optionally run AI optimization for one selected variant.
- Validate content, images, platform connections, and stale variants.
- Preview the exact content selected for publication.
- Publish selected platforms after one confirmation.
- Track independent platform states, links, errors, and recovery actions.
- Retry one safely retryable failed platform without republishing successful platforms.
- Manage, search, export, archive, and delete local drafts.
- Configure and verify platform and AI credentials locally.

### 3.2 Out of scope

- User accounts, teams, roles, or permissions.
- Hosted SaaS, cloud databases, or mandatory cloud sync.
- Scheduling, content calendars, or unattended batch publishing.
- Analytics dashboards, traffic aggregation, or performance recommendations.
- News, RSS, trends, topic discovery, or content ideation feeds.
- Fully automatic article generation.
- A plugin marketplace or general automation platform.
- Replacing mature Markdown knowledge bases or long-form writing applications.
- Mobile-first authoring. Mobile layouts only need to support review and minor edits.

## 4. Information Architecture

Publio retains three top-level routes.

### 4.1 Workbench `/`

The workbench contains the full creation-to-publication path and is organized into four sequential stages.

#### Stage 1: Source draft

- Create a new draft or import a Markdown file.
- Edit the title and Markdown body.
- Switch between editing and preview.
- Insert local images.
- Show explicit `unsaved`, `saving`, `saved`, and `save-failed` states.
- Save imported content as a local Publio draft rather than maintaining a live binding to the external file.

An import failure must leave the current editor content untouched. Importing a file with the same name creates a new draft and never silently overwrites an existing one.

#### Stage 2: Platform variants

The user switches among four platform tabs:

```text
WeChat | Xiaohongshu | Zhihu | X
```

Each variant displays:

- Final title, body, and images.
- Current length and relevant platform limits.
- Source-draft synchronization state.
- Adaptation source: rules, AI, or manual editing.
- Actions to regenerate from the source, run AI optimization, or restore the deterministic rule version.

When the source draft changes, a manually edited variant is marked stale but is not overwritten. The user must explicitly keep it, compare it, or regenerate it.

#### Stage 3: Checks and preview

The workbench presents all blocking errors and non-blocking warnings before publication.

Checks cover:

- Required title and body content.
- Platform-specific length and format rules.
- Image availability, type, size, and count rules where applicable.
- Platform connection readiness.
- Variant staleness and incomplete AI generation.
- Content moderation warnings.

Every blocking result links to an actionable location, such as the relevant variant or platform setting. The preview shows the final payload selected for each platform, not a fresh transformation of the source draft.

#### Stage 4: Publication and results

The confirmation dialog identifies:

- Selected platforms.
- The exact variant selected for each platform.
- The fact that confirmation can make content public.

Once confirmed, platforms execute independently. The result view exposes each platform's state, public URL or platform content identifier, failure reason, and next action. A failed platform can be retried separately; a successful platform is never included in that retry.

### 4.2 Draft library `/drafts`

The library is responsible for local content management, not publication orchestration.

It supports:

- Search, tags, and status filters.
- Opening a draft in the workbench.
- Viewing its latest publication summary.
- Markdown export.
- Archive and delete actions.

### 4.3 Settings `/settings`

Settings contain low-frequency configuration only:

- Credentials and connection state for all four platforms.
- Connection checks, expiry information, and reconnect actions.
- AI provider configuration and connection test.
- Local data directory, backup, and restore controls.
- Default enabled platforms.

Templates, publication history, and ordinary content management do not belong in settings.

## 5. Domain Model

### 5.1 `Draft`

The source draft is the canonical content record.

Required fields include:

- Stable ID.
- Title and Markdown body.
- Local asset references.
- Tags and lifecycle status.
- Created, updated, and saved timestamps.
- Monotonically increasing `revision`.

Each successful save advances `revision`. Variants use that revision to determine whether they are current.

### 5.2 `PlatformVariant`

A draft has at most one current variant per platform. A variant records:

- Draft ID and platform.
- Title, body, and asset selections.
- Adaptation source: `rules`, `ai`, or `manual`.
- Source-draft revision used to generate it.
- Whether it has been manually edited.
- Whether it is stale relative to the current draft.
- Its most recent validation result.

Content precedence is:

```text
manual edit > accepted AI output > rule output > source fallback
```

AI output is provisional until the user accepts it. A failed AI request leaves the existing variant unchanged.

### 5.3 `PublishTask`

One final confirmation creates an immutable publication snapshot containing:

- Selected platforms.
- Final title, body, and asset references for each platform.
- Selected variant IDs.
- Source-draft revision.
- Creation time.
- Independent per-platform execution states.

Edits made after task creation cannot alter that task. A retry uses the same immutable snapshot unless the user explicitly creates a new publication task from updated content.

### 5.4 `PublishReceipt`

Each platform execution stores:

- Status: `pending`, `publishing`, `published`, `needs-action`, or `failed`.
- Platform content ID and public URL when available.
- Normalized failure code.
- User-facing error and next action.
- Attempt count and timestamps.
- Whether another automatic attempt is safe.

### 5.5 `Asset`

An asset record includes:

- Local path.
- MIME type and size.
- Content hash.
- Per-platform remote ID or URL after successful upload.

Previously uploaded platform assets may be reused when the local content hash matches. A missing or unsupported local asset is detected before publication.

### 5.6 `ConnectionProfile`

Connection profiles contain only non-secret state:

- Configuration completeness.
- Last verification time.
- Account label when available.
- Last failure reason.

Secrets remain in `.env.local` and are never copied into drafts, tasks, receipts, frontend persistence, or logs.

## 6. Adaptation Behavior

### 6.1 Deterministic rule version

Rule-based generation is always available and is the baseline for every platform.

- WeChat: preserve long-form structure and produce styled HTML-compatible content.
- Xiaohongshu: enforce title and body limits, normalize its supported image payload, and surface content that needs manual shortening.
- Zhihu: preserve long-form hierarchy and produce the platform's article format.
- X: convert Markdown to plain text and split long content into an ordered thread while respecting per-post limits.

Rules must not invent claims or silently remove substantial content. If a safe deterministic transformation is impossible, the variant exposes a blocking or warning state for manual action.

### 6.2 AI optimization

AI is an explicit action on one platform variant. It may adjust tone, structure, title, and compression for that platform, but it cannot publish or overwrite the accepted variant automatically.

The user can:

- Compare AI output with the current variant.
- Accept the AI output.
- Reject it without changing the variant.
- Restore the deterministic rule version later.

Missing or failed AI configuration does not block source editing, rule adaptation, checks, preview, or publication.

## 7. Publication State and Recovery

### 7.1 Preflight classification

Blocking errors include:

- Missing required content.
- Invalid platform length or format.
- Missing required assets for the selected platform payload type.
- Missing or invalid credentials.
- Unresolved stale variants.
- Unsaved source content.
- AI generation still in progress for a selected variant.

Warnings include moderation findings and variants that use an unoptimized source fallback. Warnings require explicit acknowledgement but do not necessarily prevent publication.

### 7.2 Runtime failure classification

| Failure class | Behavior |
| --- | --- |
| Network failure confirmed before request delivery | Retry at most twice, after 1 and 3 seconds |
| Platform rate limit | Honor `Retry-After` once, capped at 60 seconds; otherwise require a manual retry |
| Missing or expired authentication | Stop and request reconnection |
| Invalid or rejected content | Stop and return to the affected variant |
| Platform outage | Preserve the task and offer a later retry |
| Ambiguous result after request delivery | Mark `needs-action`; never retry automatically |

If Publio cannot determine whether a platform accepted the content, it must not risk a duplicate publication. The user verifies the platform state before deciding what to do.

### 7.3 Partial success

A task may complete partially. Successful receipts remain successful and are not rolled back. Recovery actions target only failed or action-required platforms.

### 7.4 Process interruption

Closing or restarting Publio preserves drafts, immutable task snapshots, and receipts. On startup, interrupted tasks are reconciled or marked for review; they are never automatically replayed.

## 8. Local Architecture and Security

The existing Vite SPA and Hono API split remains appropriate. The frontend manages user interaction and ephemeral UI state. The Hono API owns local persistence, secret access, platform communication, validation, and publication task execution.

The implementation continues to use `.publio-data/` and atomic JSON writes. A database is not introduced for this single-user scope.

Security requirements are:

- Bind the API explicitly to `127.0.0.1`.
- Retain request validation and localhost defense in depth.
- Keep platform and AI credentials on the backend.
- Redact cookies, tokens, secrets, and API keys from all logs and errors.
- Keep `.env.local`, `.publio-data/`, and uploaded local assets outside Git.
- Never publish in the background without an explicit confirmation.
- Confirm destructive local deletion and clarify that it does not delete already published platform content.

## 9. Verification Strategy

### 9.1 Unit tests

- Platform title, body, image, and format rules.
- X thread splitting and boundary cases.
- Variant precedence and stale-state transitions.
- Protection of manually edited variants.
- AI accept, reject, failure, and rule restoration.
- Failure classification and retry eligibility.
- Immutable publication snapshots.

### 9.2 API integration tests

Using mocked platform transports and isolated data directories:

- Draft import, save, update, and recovery.
- Variant generation and persistence.
- Preflight checks.
- All-success publication.
- Partial failure.
- Ambiguous result handling.
- Safe single-platform retry.
- Restart recovery without automatic replay.

### 9.3 Frontend flow tests

- Create and import source drafts.
- Save-state feedback and failed-save recovery.
- Generate, edit, and refresh platform variants.
- Navigate from checks to the exact problem.
- Review final payloads and confirm publication.
- Display partial success and retry one platform.

### 9.4 Manual platform verification

Real credentials and external platform behavior require a release checklist for each platform. The checklist verifies connection checks, representative text and image payloads, public URLs, platform review states, authentication expiry, and ambiguous timeout recovery.

## 10. Acceptance Criteria

The first stage is complete when:

- Both in-app writing and Markdown import reliably create source drafts.
- Four independent, editable platform variants can be generated.
- Rule adaptation works when AI is unconfigured or unavailable.
- Manual variant edits survive source changes until explicitly replaced.
- Blocking publication problems are detected before confirmation.
- Preview reflects the immutable payload that will be sent.
- One confirmation can start independent publication to selected platforms.
- Successful platforms are not republished during a failed-platform retry.
- Ambiguous results never trigger blind automatic retries.
- Drafts, tasks, and receipts survive application restart.
- Errors explain the next user action.
- Secrets do not appear in frontend persistence or logs.

## 11. Implementation Boundary

This document defines the product and system behavior. The implementation plan must compare these requirements against the current code and deliver the smallest sequence of changes that closes verified gaps. Existing behavior that already satisfies the design should be retained rather than rewritten.

The implementation plan must not add any out-of-scope product area listed in section 3.2.
