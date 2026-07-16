# Draft Import and Revision-Aware Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Markdown import and revision-aware platform variants so source-draft changes are visible without silently overwriting manual or AI-edited channel content.

**Architecture:** Keep the existing Vite SPA, Hono API, Zustand stores, registries, and atomic JSON persistence. Add monotonic draft revisions in the API, persist the source revision and stale state on variants, and make explicit regeneration an atomic API operation. Parse Markdown imports in a pure frontend utility, create imported drafts through the existing API, and load them into the current workbench.

**Tech Stack:** TypeScript 5, React 19, Hono 4, Zustand 5, Vitest 4, Testing Library, vanilla-extract, pnpm workspaces.

---

## Scope Boundary

This is the first implementation slice of the approved personal publishing workbench design. It delivers a complete source-integrity foundation:

- Markdown files can enter the workbench as saved local drafts.
- Every saved content change advances a draft revision.
- Every platform variant records the source revision it represents.
- Source changes mark variants stale.
- Manual and AI variants are never silently replaced.
- Explicit regeneration replaces one selected variant with the current source.

The following approved areas remain separate implementation plans:

- Immutable publication payload snapshots and safe single-platform retry.
- Consolidated final preview and publication-result recovery UI.
- Asset hashing/reuse, backup/restore UI, and release-level real-platform verification.

## File Structure

### Test infrastructure

- Modify `vitest.config.ts`: define independent web and API projects so each app resolves its own `@` alias and environment.
- Create `apps/api/src/test/testEnvironment.test.ts`: prove the API project uses Node and the API alias.
- Create `apps/web/src/test/testEnvironment.test.ts`: prove the web project uses jsdom and the web alias.

### Draft revisions

- Modify `apps/api/src/lib/drafts/types.ts`: add required `revision` to persisted drafts.
- Modify `apps/api/src/lib/drafts/store.ts`: normalize legacy records and increment revisions only for actual title/body changes.
- Create `apps/api/src/lib/drafts/store.test.ts`: cover creation, metadata-only updates, content updates, no-op updates, and legacy records.
- Modify `apps/web/src/lib/drafts/types.ts`: mirror the API response shape.

### Revision-aware variants

- Modify `apps/api/src/lib/platformVariants/types.ts`: add `sourceDraftRevision` and `stale`.
- Modify `apps/api/src/lib/platformVariants/store.ts`: normalize old records, mark variants stale, protect edited variants, and support explicit replacement.
- Create `apps/api/src/lib/platformVariants/store.test.ts`: cover stale transitions and protected/forced synchronization.
- Modify `apps/api/src/routes/drafts.ts`: propagate draft revision changes and make regeneration atomic.
- Create `apps/api/src/routes/drafts.test.ts`: verify the route-level revision-to-variant flow.
- Modify `apps/web/src/lib/platformVariants/types.ts`: mirror the API response shape.

### Markdown import

- Modify `apps/web/src/lib/drafts/importExport.ts`: add pure Markdown import parsing.
- Create `apps/web/src/lib/drafts/importExport.test.ts`: cover BOM/line ending normalization, frontmatter, H1, filename fallback, and invalid input.
- Create `apps/web/src/components/editor/MarkdownImportButton.tsx`: read one `.md` file, create a saved import draft, and report errors.
- Create `apps/web/src/components/editor/MarkdownImportButton.test.tsx`: verify successful file import reaches persistence before switching drafts.
- Modify `apps/web/src/pages/Home.tsx`: expose import in the existing More menu and load the returned draft without a second fetch.

### Stale-state UI

- Create `apps/web/src/lib/platformVariants/presentation.ts`: centralize stale labels and regeneration confirmation rules.
- Create `apps/web/src/lib/platformVariants/presentation.test.ts`: verify user-visible state decisions.
- Modify `apps/web/src/components/publish/PublishChecklist.tsx`: show stale state and replace the current two-request resync with one atomic forced regeneration call.
- Modify `apps/web/src/components/publish/PublishChecklist.css.ts`: style the stale warning without creating a new page-level component.

### Documentation

- Modify `README.md`: add Markdown import and revision-safe platform variants to the shipped writing workflow.
- Modify `README_zh.md`: make the equivalent current-state update in Chinese.

---

### Task 1: Split Vitest Into Web and API Projects

**Files:**
- Modify: `vitest.config.ts`
- Create: `apps/api/src/test/testEnvironment.test.ts`
- Create: `apps/web/src/test/testEnvironment.test.ts`

- [ ] **Step 1: Write environment and alias smoke tests**

Create `apps/api/src/test/testEnvironment.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { validateTitle } from '@/lib/validation';

describe('api test project', () => {
  it('uses the API alias in a Node environment', () => {
    expect(globalThis).not.toHaveProperty('document');
    expect(validateTitle('有效标题')).toBeNull();
  });
});
```

Create `apps/web/src/test/testEnvironment.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { countCharacters } from '@/lib/contentStats';

describe('web test project', () => {
  it('uses the web alias in a jsdom environment', () => {
    expect(globalThis.document).toBeDefined();
    expect(countCharacters('Publio')).toBe(6);
  });
});
```

- [ ] **Step 2: Run the tests to verify the current single-project config fails**

Run:

```bash
pnpm test -- apps/api/src/test/testEnvironment.test.ts apps/web/src/test/testEnvironment.test.ts
```

Expected: FAIL because the root `@` alias points to `apps/web/src` for both test files and the API test cannot resolve `@/lib/validation`.

- [ ] **Step 3: Configure two inline Vitest projects**

Replace `vitest.config.ts` with:

```ts
import path from 'node:path';
import { defineConfig } from 'vitest/config';

const root = __dirname;
const commonExclude = ['**/node_modules/**', '**/dist/**', '**/.worktrees/**'];

export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '@': path.resolve(root, 'apps/web/src'),
            '@shared-types': path.resolve(root, 'packages/shared-types/src'),
          },
        },
        test: {
          name: 'web',
          environment: 'jsdom',
          globals: true,
          include: ['apps/web/src/**/*.{test,spec}.{ts,tsx}'],
          exclude: commonExclude,
        },
      },
      {
        resolve: {
          alias: {
            '@': path.resolve(root, 'apps/api/src'),
            '@shared-types': path.resolve(root, 'packages/shared-types/src'),
          },
        },
        test: {
          name: 'api',
          environment: 'node',
          globals: true,
          include: ['apps/api/src/**/*.{test,spec}.ts'],
          exclude: commonExclude,
        },
      },
    ],
  },
});
```

- [ ] **Step 4: Run both projects and verify they pass**

Run:

```bash
pnpm test -- apps/api/src/test/testEnvironment.test.ts apps/web/src/test/testEnvironment.test.ts
```

Expected: PASS, 2 files and 2 tests.

- [ ] **Step 5: Commit the test foundation**

```bash
git add vitest.config.ts apps/api/src/test/testEnvironment.test.ts apps/web/src/test/testEnvironment.test.ts
git commit -m "test: split web and api vitest projects"
```

### Task 2: Add Monotonic Draft Revisions

**Files:**
- Modify: `apps/api/src/lib/drafts/types.ts`
- Modify: `apps/api/src/lib/drafts/store.ts`
- Create: `apps/api/src/lib/drafts/store.test.ts`
- Modify: `apps/web/src/lib/drafts/types.ts`

- [ ] **Step 1: Write failing draft revision tests**

Create `apps/api/src/lib/drafts/store.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createDraftStore } from './store';
import type { ContentDraft } from './types';

function createStore(initialDrafts?: ContentDraft[]) {
  let id = 0;
  let tick = 0;
  return createDraftStore({
    createId: () => `draft-${++id}`,
    now: () => `2026-07-15T00:00:0${tick++}.000Z`,
    initialDrafts,
  });
}

describe('draft revisions', () => {
  it('starts new drafts at revision 1', () => {
    const draft = createStore().createDraft({ title: 'Title', content: 'Body', source: 'manual' });
    expect(draft.revision).toBe(1);
  });

  it('increments only when title or content actually changes', () => {
    const store = createStore();
    const created = store.createDraft({ title: 'Title', content: 'Body', source: 'manual' });

    expect(store.updateDraft(created.id, { status: 'ready' })?.revision).toBe(1);
    expect(store.updateDraft(created.id, { title: 'Title' })?.revision).toBe(1);
    expect(store.updateDraft(created.id, { content: 'Changed' })?.revision).toBe(2);
  });

  it('normalizes legacy drafts to revision 1', () => {
    const legacy = {
      id: 'legacy',
      title: 'Legacy',
      content: 'Body',
      status: 'draft',
      source: 'manual',
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-01T00:00:00.000Z',
    } as unknown as ContentDraft;

    expect(createStore([legacy]).getDraft('legacy')?.revision).toBe(1);
  });
});
```

- [ ] **Step 2: Run the draft store test and verify it fails**

Run:

```bash
pnpm test -- apps/api/src/lib/drafts/store.test.ts
```

Expected: FAIL because `ContentDraft` and created records do not contain `revision`.

- [ ] **Step 3: Add the revision field and normalization**

Add the field to both API and web `ContentDraft` interfaces:

```ts
revision: number;
```

In `apps/api/src/lib/drafts/store.ts`, normalize loaded records before constructing the map:

```ts
function normalizeDraft(draft: ContentDraft): ContentDraft {
  return {
    ...draft,
    revision: Number.isInteger(draft.revision) && draft.revision > 0 ? draft.revision : 1,
  };
}

const drafts = new Map<string, ContentDraft>(
  initialDrafts.map((draft) => {
    const normalized = normalizeDraft(draft);
    return [normalized.id, normalized];
  }),
);
```

Set new drafts to revision 1:

```ts
const draft: ContentDraft = {
  id: createId(),
  title: input.title,
  content: input.content,
  revision: 1,
  status: 'draft',
  source: input.source,
  ...(input.platforms ? { platforms: input.platforms } : {}),
  ...(input.tags ? { tags: input.tags } : {}),
  createdAt: timestamp,
  updatedAt: timestamp,
};
```

Compute revision changes in `updateDraft`:

```ts
const contentChanged =
  (input.title !== undefined && input.title !== current.title) ||
  (input.content !== undefined && input.content !== current.content);

const updated: ContentDraft = {
  ...current,
  ...input,
  revision: contentChanged ? current.revision + 1 : current.revision,
  updatedAt: now(),
};
```

- [ ] **Step 4: Run the targeted tests and type checks**

Run:

```bash
pnpm test -- apps/api/src/lib/drafts/store.test.ts
pnpm tsc --noEmit
```

Expected: the draft tests PASS and TypeScript exits 0.

- [ ] **Step 5: Commit draft revisions**

```bash
git add apps/api/src/lib/drafts/types.ts apps/api/src/lib/drafts/store.ts apps/api/src/lib/drafts/store.test.ts apps/web/src/lib/drafts/types.ts
git commit -m "feat: track draft content revisions"
```

### Task 3: Make Platform Variants Revision-Aware

**Files:**
- Modify: `apps/api/src/lib/platformVariants/types.ts`
- Modify: `apps/api/src/lib/platformVariants/store.ts`
- Create: `apps/api/src/lib/platformVariants/store.test.ts`
- Modify: `apps/web/src/lib/platformVariants/types.ts`

- [ ] **Step 1: Write failing variant freshness tests**

Create `apps/api/src/lib/platformVariants/store.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createPlatformVariantStore } from './store';

function createStore() {
  let id = 0;
  let tick = 0;
  return createPlatformVariantStore({
    createId: () => `variant-${++id}`,
    now: () => `2026-07-15T00:00:0${tick++}.000Z`,
  });
}

describe('revision-aware variants', () => {
  it('records the source revision and starts fresh', () => {
    const variant = createStore().syncVariantsFromDraft('draft-1', 'Title', 'Body', ['wechat'], {
      sourceDraftRevision: 1,
    })[0];
    expect(variant.sourceDraftRevision).toBe(1);
    expect(variant.stale).toBe(false);
  });

  it('marks all older variants stale without changing their content', () => {
    const store = createStore();
    const variant = store.syncVariantsFromDraft('draft-1', 'Title', 'Body', ['wechat'], {
      sourceDraftRevision: 1,
    })[0];
    store.updateVariant(variant.id, { content: 'Manual body' });

    store.markVariantsStale('draft-1', 2);

    expect(store.getVariant(variant.id)).toMatchObject({
      content: 'Manual body',
      manuallyEdited: true,
      sourceDraftRevision: 1,
      stale: true,
    });
  });

  it('refreshes rule variants but protects edited variants unless replacement is explicit', () => {
    const store = createStore();
    const wechat = store.syncVariantsFromDraft('draft-1', 'Title', 'Body', ['wechat'], {
      sourceDraftRevision: 1,
    })[0];
    const zhihu = store.syncVariantsFromDraft('draft-1', 'Title', 'Body', ['zhihu'], {
      sourceDraftRevision: 1,
    })[0];
    store.updateVariant(zhihu.id, { content: 'Manual body' });
    store.markVariantsStale('draft-1', 2);

    const ordinary = store.syncVariantsFromDraft(
      'draft-1',
      'New title',
      'New body',
      ['wechat', 'zhihu'],
      { sourceDraftRevision: 2 },
    );
    expect(ordinary.find((item) => item.id === wechat.id)).toMatchObject({
      content: 'New body',
      sourceDraftRevision: 2,
      stale: false,
    });
    expect(ordinary.find((item) => item.id === zhihu.id)).toMatchObject({
      content: 'Manual body',
      sourceDraftRevision: 1,
      stale: true,
    });

    const replaced = store.syncVariantsFromDraft(
      'draft-1',
      'New title',
      'New body',
      ['zhihu'],
      { sourceDraftRevision: 2, replaceProtected: true },
    )[0];
    expect(replaced).toMatchObject({
      content: 'New body',
      status: 'synced',
      generatedByAgent: false,
      manuallyEdited: false,
      sourceDraftRevision: 2,
      stale: false,
    });
  });
});
```

- [ ] **Step 2: Run the test and verify it fails on the new API**

Run:

```bash
pnpm test -- apps/api/src/lib/platformVariants/store.test.ts
```

Expected: FAIL because the sync method has no revision parameter and variants have no freshness fields.

- [ ] **Step 3: Extend the variant model and store**

Add to both API and web `PlatformVariant` interfaces:

```ts
sourceDraftRevision: number;
stale: boolean;
```

Add to `CreatePlatformVariantInput`:

```ts
sourceDraftRevision: number;
```

Normalize legacy variants when the store is created:

```ts
function normalizeVariant(variant: PlatformVariant): PlatformVariant {
  return {
    ...variant,
    sourceDraftRevision:
      Number.isInteger(variant.sourceDraftRevision) && variant.sourceDraftRevision > 0
        ? variant.sourceDraftRevision
        : 1,
    stale: variant.stale === true,
  };
}
```

Create and synchronize variants with these fields:

```ts
sourceDraftRevision,
stale: false,
```

Add this store method:

```ts
markVariantsStale(draftId: string, currentDraftRevision: number): PlatformVariant[] {
  const changed: PlatformVariant[] = [];
  for (const variant of variants.values()) {
    if (variant.draftId !== draftId || variant.sourceDraftRevision >= currentDraftRevision) continue;
    const updated = { ...variant, stale: true, updatedAt: now() };
    variants.set(updated.id, updated);
    changed.push(updated);
  }
  if (changed.length > 0) persist();
  return changed;
}
```

Change the sync signature to:

```ts
syncVariantsFromDraft(
  draftId: string,
  title: string,
  content: string,
  platforms: PlatformId[],
  options: { sourceDraftRevision?: number; replaceProtected?: boolean } = {},
): PlatformVariant[]
```

Resolve a legacy-safe local value at the start of the method:

```ts
const sourceDraftRevision = options.sourceDraftRevision ?? 1;
```

Inside the existing-variant branch, protect accepted AI or manual content unless replacement is explicit:

```ts
const protectedContent =
  existing.manuallyEdited || existing.generatedByAgent || existing.status !== 'synced';

if (protectedContent && !options.replaceProtected) {
  const preserved = {
    ...existing,
    stale: existing.sourceDraftRevision < sourceDraftRevision,
    updatedAt: timestamp,
  };
  variants.set(existing.id, preserved);
  results.push(preserved);
  continue;
}

const updated: PlatformVariant = {
  ...existing,
  title,
  content,
  status: 'synced',
  generatedByAgent: false,
  manuallyEdited: false,
  changeSummary: undefined,
  sourceDraftRevision,
  stale: false,
  lastSyncedFromDraftAt: timestamp,
  updatedAt: timestamp,
};
```

- [ ] **Step 4: Run variant tests and TypeScript**

Run:

```bash
pnpm test -- apps/api/src/lib/platformVariants/store.test.ts
pnpm tsc --noEmit
```

Expected: variant tests PASS and TypeScript exits 0 because the new options object is backward compatible with the existing route call.

- [ ] **Step 5: Commit the variant model and store together**

```bash
git add apps/api/src/lib/platformVariants/types.ts apps/api/src/lib/platformVariants/store.ts apps/api/src/lib/platformVariants/store.test.ts apps/web/src/lib/platformVariants/types.ts
git commit -m "feat: track platform variant freshness"
```

### Task 4: Propagate Revisions Through Draft Routes

**Files:**
- Modify: `apps/api/src/routes/drafts.ts`
- Create: `apps/api/src/routes/drafts.test.ts`

- [ ] **Step 1: Write a failing route integration test**

Create `apps/api/src/routes/drafts.test.ts`:

```ts
import { Hono } from 'hono';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetDraftRegistryForTests } from '@/lib/drafts/registry';
import { resetPlatformVariantRegistryForTests } from '@/lib/platformVariants/registry';
import { draftsRoutes } from './drafts';

const app = new Hono().route('/api/drafts', draftsRoutes);
let variantStore: ReturnType<typeof resetPlatformVariantRegistryForTests>;

describe('draft revision variant flow', () => {
  beforeEach(() => {
    let draftId = 0;
    let variantId = 0;
    resetDraftRegistryForTests({ createId: () => `draft-${++draftId}` });
    variantStore = resetPlatformVariantRegistryForTests({
      createId: () => `variant-${++variantId}`,
    });
  });

  it('marks variants stale and only replaces edited content when force is explicit', async () => {
    const createResponse = await app.request('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Title', content: 'Body', source: 'manual' }),
    });
    const created = (await createResponse.json()) as { draft: { id: string; revision: number } };

    const syncResponse = await app.request(`/api/drafts/${created.draft.id}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platforms: ['wechat'] }),
    });
    const synced = (await syncResponse.json()) as { variants: Array<{ id: string }> };
    const variantId = synced.variants[0].id;

    variantStore.updateVariant(variantId, { content: 'Manual body' });

    await app.request(`/api/drafts/${created.draft.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Changed body' }),
    });

    const staleResponse = await app.request(`/api/drafts/${created.draft.id}/variants`);
    const stale = (await staleResponse.json()) as {
      variants: Array<{ content: string; stale: boolean; sourceDraftRevision: number }>;
    };
    expect(stale.variants[0]).toMatchObject({
      content: 'Manual body',
      stale: true,
      sourceDraftRevision: 1,
    });

    const replaceResponse = await app.request(`/api/drafts/${created.draft.id}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platforms: ['wechat'], force: true }),
    });
    const replaced = (await replaceResponse.json()) as {
      variants: Array<{ content: string; stale: boolean; sourceDraftRevision: number }>;
    };
    expect(replaced.variants[0]).toMatchObject({
      content: 'Changed body',
      stale: false,
      sourceDraftRevision: 2,
    });
  });
});
```

- [ ] **Step 2: Run the route test and verify it fails**

Run:

```bash
pnpm test -- apps/api/src/routes/drafts.test.ts
```

Expected: FAIL because draft updates do not mark variants stale and the sync route does not pass revision or force replacement.

- [ ] **Step 3: Mark variants stale only when draft content revision changes**

In the PATCH route, retain the current draft before updating and propagate a real revision change:

```ts
const currentDraft = getDraftRegistry().getDraft(id);
if (!currentDraft) return apiError(c, '稿件不存在', 404);

const draft = getDraftRegistry().updateDraft(id, input as UpdateDraftInput);
if (!draft) return apiError(c, '稿件不存在', 404);

if (draft.revision !== currentDraft.revision) {
  getPlatformVariantRegistry().markVariantsStale(id, draft.revision);
}
```

- [ ] **Step 4: Make ordinary sync and explicit regeneration atomic**

Read the explicit flag and pass the saved draft revision:

```ts
const replaceProtected = body.force === true;
const variants = getPlatformVariantRegistry().syncVariantsFromDraft(
  id,
  draft.title,
  draft.content,
  platforms,
  { sourceDraftRevision: draft.revision, replaceProtected },
);
```

Do not require a second PATCH request from the frontend after this response.

- [ ] **Step 5: Run API tests and type checks**

Run:

```bash
pnpm test -- --project api
pnpm tsc --noEmit
```

Expected: all API tests PASS and TypeScript exits 0.

- [ ] **Step 6: Commit route propagation**

```bash
git add apps/api/src/routes/drafts.ts apps/api/src/routes/drafts.test.ts
git commit -m "feat: propagate draft revisions to variants"
```

### Task 5: Parse and Import Markdown as a Saved Draft

**Files:**
- Modify: `apps/web/src/lib/drafts/importExport.ts`
- Create: `apps/web/src/lib/drafts/importExport.test.ts`
- Create: `apps/web/src/components/editor/MarkdownImportButton.tsx`
- Create: `apps/web/src/components/editor/MarkdownImportButton.test.tsx`
- Modify: `apps/web/src/pages/Home.tsx`

- [ ] **Step 1: Write failing parser tests**

Create `apps/web/src/lib/drafts/importExport.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseMarkdownImport } from './importExport';

describe('parseMarkdownImport', () => {
  it('uses frontmatter title and removes frontmatter', () => {
    expect(
      parseMarkdownImport('fallback.md', '---\r\ntitle: "Imported title"\r\ntags: [one]\r\n---\r\n\r\nBody'),
    ).toEqual({ title: 'Imported title', content: 'Body' });
  });

  it('uses and removes the first H1 when frontmatter has no title', () => {
    expect(parseMarkdownImport('fallback.md', '\uFEFF# Heading\n\nBody')).toEqual({
      title: 'Heading',
      content: 'Body',
    });
  });

  it('falls back to the filename', () => {
    expect(parseMarkdownImport('my-article.md', 'Body')).toEqual({
      title: 'my-article',
      content: 'Body',
    });
  });

  it('rejects non-markdown and empty documents', () => {
    expect(() => parseMarkdownImport('article.txt', 'Body')).toThrow('请选择 Markdown 文件');
    expect(() => parseMarkdownImport('article.md', '   ')).toThrow('Markdown 文件没有正文内容');
  });
});
```

- [ ] **Step 2: Run the parser test and verify it fails**

Run:

```bash
pnpm test -- apps/web/src/lib/drafts/importExport.test.ts
```

Expected: FAIL because `parseMarkdownImport` does not exist.

- [ ] **Step 3: Implement deterministic Markdown parsing**

Add to `apps/web/src/lib/drafts/importExport.ts`:

```ts
export interface ParsedMarkdownImport {
  title: string;
  content: string;
}

function unquoteYamlValue(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function parseMarkdownImport(filename: string, raw: string): ParsedMarkdownImport {
  if (!filename.toLowerCase().endsWith('.md')) throw new Error('请选择 Markdown 文件');

  let value = raw.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();
  let frontmatterTitle = '';

  if (value.startsWith('---\n')) {
    const end = value.indexOf('\n---\n', 4);
    if (end >= 0) {
      const frontmatter = value.slice(4, end);
      const titleLine = frontmatter.split('\n').find((line) => /^title\s*:/i.test(line));
      if (titleLine) frontmatterTitle = unquoteYamlValue(titleLine.replace(/^title\s*:/i, ''));
      value = value.slice(end + 5).trim();
    }
  }

  const h1Match = /^#\s+(.+)$/m.exec(value);
  const h1Title = h1Match?.[1].trim() ?? '';
  const title = frontmatterTitle || h1Title || filename.replace(/\.md$/i, '').trim();

  if (h1Match && !frontmatterTitle) {
    value = `${value.slice(0, h1Match.index)}${value.slice(h1Match.index + h1Match[0].length)}`.trim();
  }

  if (!value) throw new Error('Markdown 文件没有正文内容');
  if (!title) throw new Error('无法确定稿件标题');
  return { title, content: value };
}
```

- [ ] **Step 4: Run parser tests**

Run:

```bash
pnpm test -- apps/web/src/lib/drafts/importExport.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 5: Write the import button test**

Create `apps/web/src/components/editor/MarkdownImportButton.test.tsx`:

```tsx
import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createDraft } from '@/lib/drafts/client';
import MarkdownImportButton from './MarkdownImportButton';

const mocks = vi.hoisted(() => ({ addToast: vi.fn() }));

vi.mock('@/lib/drafts/client', () => ({ createDraft: vi.fn() }));
vi.mock('@/stores/saveStatusStore', () => ({
  useSaveStatusStore: { getState: () => ({ isDirty: false }) },
}));
vi.mock('@/stores/toastStore', () => ({
  useToastStore: { getState: () => ({ addToast: mocks.addToast }) },
}));

describe('MarkdownImportButton', () => {
  it('persists parsed Markdown before reporting the imported draft', async () => {
    const draft = {
      id: 'draft-1',
      title: 'Imported',
      content: 'Body',
      revision: 1,
      status: 'draft' as const,
      source: 'import' as const,
      createdAt: '2026-07-15T00:00:00.000Z',
      updatedAt: '2026-07-15T00:00:00.000Z',
    };
    vi.mocked(createDraft).mockResolvedValue(draft);
    const onImported = vi.fn();
    const { container } = render(
      <MarkdownImportButton className="import" onImported={onImported} />,
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();

    fireEvent.change(input!, {
      target: {
        files: [{ name: 'article.md', text: async () => '# Imported\n\nBody' }],
      },
    });

    await waitFor(() => {
      expect(createDraft).toHaveBeenCalledWith({
        title: 'Imported',
        content: 'Body',
        source: 'import',
      });
      expect(onImported).toHaveBeenCalledWith(draft);
    });
  });
});
```

- [ ] **Step 6: Run the component test and verify the component is missing**

Run:

```bash
pnpm test -- apps/web/src/components/editor/MarkdownImportButton.test.tsx
```

Expected: FAIL because `MarkdownImportButton.tsx` does not exist.

- [ ] **Step 7: Create the import button**

Create `apps/web/src/components/editor/MarkdownImportButton.tsx`:

```tsx
import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { createDraft } from '@/lib/drafts/client';
import { parseMarkdownImport } from '@/lib/drafts/importExport';
import type { ContentDraft } from '@/lib/drafts/types';
import { useSaveStatusStore } from '@/stores/saveStatusStore';
import { useToastStore } from '@/stores/toastStore';

interface MarkdownImportButtonProps {
  className: string;
  onImported: (draft: ContentDraft) => void;
}

export default function MarkdownImportButton({ className, onImported }: MarkdownImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(file: File) {
    if (
      useSaveStatusStore.getState().isDirty &&
      !window.confirm('当前稿件尚未保存。导入后将切换到新稿件，是否继续？')
    ) {
      return;
    }

    setImporting(true);
    try {
      const parsed = parseMarkdownImport(file.name, await file.text());
      const draft = await createDraft({ ...parsed, source: 'import' });
      onImported(draft);
      useToastStore.getState().addToast('success', 'Markdown 已导入并保存');
    } catch (error) {
      useToastStore
        .getState()
        .addToast('error', error instanceof Error ? error.message : 'Markdown 导入失败');
    } finally {
      setImporting(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".md,text/markdown"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        className={className}
        disabled={importing}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={14} />
        {importing ? '导入中…' : '导入 Markdown'}
      </button>
    </>
  );
}
```

Then rerun:

```bash
pnpm test -- apps/web/src/components/editor/MarkdownImportButton.test.tsx
```

Expected: PASS, proving the imported draft is persisted before `onImported` switches the workbench.

- [ ] **Step 8: Load imported drafts directly into the workbench**

Import `MarkdownImportButton` in `Home.tsx` and add this callback after `useManualSave` is created:

```ts
const handleImportedDraft = useCallback(
  (draft: ContentDraft) => {
    loadedDraftIdRef.current = draft.id;
    setTitle(draft.title);
    setContent(draft.content);
    setCurrentDraftId(draft.id);
    reset();
    syncSnapshot({ title: draft.title, content: draft.content });
    setMoreMenuOpen(false);
    navigate(`/?draftId=${draft.id}`, { replace: true });
  },
  [navigate, reset, setContent, setCurrentDraftId, setTitle, syncSnapshot],
);
```

Add the button to the existing More menu before the template picker:

```tsx
<MarkdownImportButton className={styles.moreMenuItem} onImported={handleImportedDraft} />
```

Import the `ContentDraft` type from `@/lib/drafts/types`.

- [ ] **Step 9: Run web tests, type checks, and build**

Run:

```bash
pnpm test -- --project web
pnpm tsc --noEmit
pnpm build
```

Expected: web tests PASS, TypeScript exits 0, and Vite build completes.

- [ ] **Step 10: Commit Markdown import**

```bash
git add apps/web/src/lib/drafts/importExport.ts apps/web/src/lib/drafts/importExport.test.ts apps/web/src/components/editor/MarkdownImportButton.tsx apps/web/src/components/editor/MarkdownImportButton.test.tsx apps/web/src/pages/Home.tsx
git commit -m "feat: import markdown drafts"
```

### Task 6: Surface Stale Variants and Regenerate Atomically

**Files:**
- Create: `apps/web/src/lib/platformVariants/presentation.ts`
- Create: `apps/web/src/lib/platformVariants/presentation.test.ts`
- Modify: `apps/web/src/components/publish/PublishChecklist.tsx`
- Modify: `apps/web/src/components/publish/PublishChecklist.css.ts`

- [ ] **Step 1: Write failing presentation tests**

Create `apps/web/src/lib/platformVariants/presentation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getVariantFreshnessLabel, shouldConfirmVariantReplacement } from './presentation';

describe('variant presentation', () => {
  it('labels stale and fresh variants', () => {
    expect(getVariantFreshnessLabel({ stale: true })).toBe('主稿已更新');
    expect(getVariantFreshnessLabel({ stale: false })).toBeNull();
  });

  it('requires confirmation before replacing manual or AI content', () => {
    expect(shouldConfirmVariantReplacement({ manuallyEdited: true, generatedByAgent: false })).toBe(
      true,
    );
    expect(shouldConfirmVariantReplacement({ manuallyEdited: false, generatedByAgent: true })).toBe(
      true,
    );
    expect(shouldConfirmVariantReplacement({ manuallyEdited: false, generatedByAgent: false })).toBe(
      false,
    );
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm test -- apps/web/src/lib/platformVariants/presentation.test.ts
```

Expected: FAIL because the presentation module does not exist.

- [ ] **Step 3: Implement the presentation decisions**

Create `apps/web/src/lib/platformVariants/presentation.ts`:

```ts
export function getVariantFreshnessLabel(input: { stale: boolean }) {
  return input.stale ? '主稿已更新' : null;
}

export function shouldConfirmVariantReplacement(input: {
  manuallyEdited: boolean;
  generatedByAgent: boolean;
}) {
  return input.manuallyEdited || input.generatedByAgent;
}
```

- [ ] **Step 4: Extend the checklist's local card shape**

Add to `VariantCardData`:

```ts
sourceDraftRevision: number;
stale: boolean;
```

Map both fields from every fetched `PlatformVariant`.

Import and use the presentation helpers. Render the stale label beside the existing source tags:

```tsx
const freshnessLabel = variant ? getVariantFreshnessLabel(variant) : null;

{freshnessLabel && <span className={styles.staleTag}>{freshnessLabel}</span>}
```

- [ ] **Step 5: Replace the two-request resync with atomic regeneration**

Replace `handleResync` with:

```ts
const handleResync = useCallback(
  async (platform: PlatformId) => {
    if (!currentDraftId) return;
    const variant = variants[platform];
    if (
      variant &&
      shouldConfirmVariantReplacement(variant) &&
      !window.confirm('重新生成会覆盖这个渠道版本的人工或 AI 修改，是否继续？')
    ) {
      return;
    }

    const res = await fetch(`/api/drafts/${currentDraftId}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platforms: [platform], force: true }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { variants?: PlatformVariant[] };
    const regenerated = data.variants?.[0];
    if (!regenerated) return;
    setVariantId(platform, regenerated.id);
    await fetchVariants();
  },
  [currentDraftId, fetchVariants, setVariantId, variants],
);
```

The frontend must not PATCH the variant after the POST response.

- [ ] **Step 6: Add the stale tag style**

Add to `PublishChecklist.css.ts` using existing tokens:

```ts
export const staleTag = style({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: vars.radius.full,
  background: vars.color.warningBg,
  padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
  fontSize: vars.fontSize['2xs'],
  color: vars.color.warningText,
});
```

- [ ] **Step 7: Run targeted and full verification**

Run:

```bash
pnpm test -- apps/web/src/lib/platformVariants/presentation.test.ts
pnpm test
pnpm lint
pnpm format:check
pnpm tsc --noEmit
pnpm build
```

Expected: all tests PASS; lint, formatting, TypeScript, and build exit 0.

- [ ] **Step 8: Commit stale-state UI**

```bash
git add apps/web/src/lib/platformVariants/presentation.ts apps/web/src/lib/platformVariants/presentation.test.ts apps/web/src/components/publish/PublishChecklist.tsx apps/web/src/components/publish/PublishChecklist.css.ts
git commit -m "feat: protect stale platform variants"
```

### Task 7: Document the Shipped Workflow and Run Final Checks

**Files:**
- Modify: `README.md`
- Modify: `README_zh.md`

- [ ] **Step 1: Update current-state feature descriptions**

In the English Writing Desk section, describe the shipped behavior in present tense:

```markdown
Markdown editor with live preview, `.md` import, immersive full-screen mode, manual save with close/crash fallback, revision-aware platform variants, version history restore, content templates, and a media library.
```

In the Chinese README, add the equivalent current-state sentence:

```markdown
Markdown 编辑器支持实时预览、`.md` 导入、沉浸式全屏、手动保存与关闭/崩溃兜底保存；渠道版本会记录主稿修订号，避免主稿更新时静默覆盖人工或 AI 修改。
```

Do not mention implementation history or removed features.

- [ ] **Step 2: Run the complete repository verification**

Run:

```bash
pnpm check:no-js-source
pnpm lint
pnpm format:check
pnpm tsc --noEmit
pnpm test
pnpm build
git diff --check
```

Expected: every command exits 0; Vitest reports both `web` and `api` projects with no failed tests.

- [ ] **Step 3: Inspect the final scope**

Run:

```bash
git status --short
git diff --stat HEAD~6..HEAD
git log --oneline -7
```

Expected: only files listed in this plan changed, with one focused commit per task and no generated artifacts.

- [ ] **Step 4: Commit documentation**

```bash
git add README.md README_zh.md
git commit -m "docs: describe markdown import and variant freshness"
```

## Plan Completion Criteria

This plan is complete only when:

- A real `.md` file can be imported as a saved draft without overwriting the current draft on failure.
- New drafts start at revision 1 and real title/body changes increment revision exactly once.
- Existing persisted drafts and variants without new fields still load safely.
- Source changes mark older variants stale.
- Ordinary synchronization preserves manual and accepted AI variants.
- Explicit regeneration atomically replaces one protected variant after confirmation.
- The UI exposes stale state and no longer uses POST followed by PATCH for resynchronization.
- Web and API tests run under correct aliases and environments.
- The complete repository verification command set passes.
