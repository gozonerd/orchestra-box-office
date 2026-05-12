---
name: D2R Plan — Desktop Unit Test Fixes
description: Zero-ambiguity Dare to Rise Code Plan for Haiku to fix 10 failing + 1 unloadable desktop unit tests
type: project
audience: martinez_methods_internal
classification_reason: INTERNAL _I classification per Martinez Methods classification convention; not approved for external release pending pre-publication IP scrub.
---

# Dare to Rise Code Plan — Desktop Unit Test Fixes
**Executor:** Haiku 4.5  
**Author:** Sonnet 4.6  
**Date:** 2026-04-14  
**Repository:** `C:\Users\NerdyKrystal\repos\orchestra-box-office`  
**Working directory for all commands:** `C:\Users\NerdyKrystal\repos\orchestra-box-office\desktop`

---

## Plan Skeleton

| Stage | Description | Model | Parallel? |
|-------|-------------|-------|-----------|
| Stage 00 | Enterprise Standards Research (already complete — see companion file) | Sonnet | Done |
| Stage 01 | Fix @tauri-apps/api import paths in 4 source/test files | Haiku | No — do sequentially, commit once |
| Stage 02 | Fix Dashboard.test.tsx mock method names | Haiku | Can run after Stage 01 OR in parallel — no dependency on Stage 01 |
| Stage 03 | Fix SyncPanel.test.tsx selectors (3 tests) | Haiku | No dependency on 01 or 02 |
| Stage 04 | Fix BudgetPage and RunsPage selectors | Haiku | No dependency on 01, 02, or 03 |
| Stage QA | Run full test suite, verify 75/75, adversarial review | Haiku | No — terminal |

---

## Pre-Execution: State Verification

Before executing ANY stage, run this command and confirm output:

```bash
cd /c/Users/NerdyKrystal/repos/orchestra-box-office/desktop
npm run test -- --run 2>&1 | tail -5
```

**Expected output must match exactly:**
```
 Test Files  6 failed | 5 passed (11)
      Tests  10 failed | 65 passed (75)
```

If the count is different from this, STOP. Do not execute any stage. Report the actual count and ask for updated instructions.

---

## Stage 01: Fix @tauri-apps/api Import Paths

### Why
`@tauri-apps/api` v2.10.1 exports `invoke` from `@tauri-apps/api/core`. The path `@tauri-apps/api/tauri` does not exist in v2 — the file `node_modules/@tauri-apps/api/tauri.js` does not exist. Four files use the wrong v1 path.

**Impact of defect:**
- `useCloudSync.test.ts` fails to load entirely (0 tests run, not counted in the 10 failing, but represents broken coverage)
- `useDatabase.ts`, `useSync.ts`, `useCloudSync.ts` will fail in production Tauri builds when the module cannot be resolved

### Step 1.1: Edit `desktop/src/hooks/useCloudSync.ts`

Read the file first:
```
Read file: /c/Users/NerdyKrystal/repos/orchestra-box-office/desktop/src/hooks/useCloudSync.ts
```

Find line 2. It currently reads:
```typescript
import { invoke } from "@tauri-apps/api/tauri";
```

Change it to:
```typescript
import { invoke } from "@tauri-apps/api/core";
```

Do not change anything else in the file.

### Step 1.2: Edit `desktop/src/hooks/useCloudSync.test.ts`

Read the file first:
```
Read file: /c/Users/NerdyKrystal/repos/orchestra-box-office/desktop/src/hooks/useCloudSync.test.ts
```

Find the line that reads:
```typescript
vi.mock("@tauri-apps/api/tauri", () => ({
```

Change it to:
```typescript
vi.mock("@tauri-apps/api/core", () => ({
```

Do not change anything else in the file.

### Step 1.3: Edit `desktop/src/hooks/useDatabase.ts`

Read the file first:
```
Read file: /c/Users/NerdyKrystal/repos/orchestra-box-office/desktop/src/hooks/useDatabase.ts
```

Find line 1. It currently reads:
```typescript
import { invoke } from "@tauri-apps/api/tauri";
```

Change it to:
```typescript
import { invoke } from "@tauri-apps/api/core";
```

Do not change anything else in the file.

### Step 1.4: Edit `desktop/src/hooks/useSync.ts`

Read the file first:
```
Read file: /c/Users/NerdyKrystal/repos/orchestra-box-office/desktop/src/hooks/useSync.ts
```

Find line 2. It currently reads:
```typescript
import { invoke } from "@tauri-apps/api/tauri";
```

Change it to:
```typescript
import { invoke } from "@tauri-apps/api/core";
```

Do not change anything else in the file.

### Step 1.5: Verify No Remaining Old Import Paths

Run this command. It MUST return zero results:
```bash
grep -rn "@tauri-apps/api/tauri" /c/Users/NerdyKrystal/repos/orchestra-box-office/desktop/src/
```

**Expected output:** (empty — no lines)

If any lines appear, fix them using the same pattern before proceeding.

### Stage 01-A: Self-Audit-Edit Gate (n=5)

For each of the 5 audit passes, verify ALL of the following. Track consecutive passes:

**Checklist (run every pass from scratch):**
1. Open `useCloudSync.ts` — confirm line 2 is `from "@tauri-apps/api/core"`, not `@tauri-apps/api/tauri`
2. Open `useCloudSync.test.ts` — confirm the `vi.mock` path is `"@tauri-apps/api/core"`
3. Open `useDatabase.ts` — confirm line 1 is `from "@tauri-apps/api/core"`
4. Open `useSync.ts` — confirm line 2 is `from "@tauri-apps/api/core"`
5. Run: `grep -rn "@tauri-apps/api/tauri" desktop/src/` — must return empty
6. No other changes were made to any of the 4 files

**Counter template (fill in after each pass):**

```
Pass 1: [PASS/FAIL — reason if fail] | Consecutive: [0 or 1]
Pass 2: [PASS/FAIL — reason if fail] | Consecutive: [0, 1, or 2]
Pass 3: [PASS/FAIL — reason if fail] | Consecutive: [0–3]
Pass 4: [PASS/FAIL — reason if fail] | Consecutive: [0–4]
Pass 5: [PASS/FAIL — reason if fail] | Consecutive: [0–5]
```

Do not proceed to Stage 01-B until consecutive counter reaches 5.

### Stage 01-B: Commit Gate

Run:
```bash
cd /c/Users/NerdyKrystal/repos/orchestra-box-office
git status
```

Confirm that the modified files are ONLY:
- `desktop/src/hooks/useCloudSync.ts`
- `desktop/src/hooks/useCloudSync.test.ts`
- `desktop/src/hooks/useDatabase.ts`
- `desktop/src/hooks/useSync.ts`

If any other files appear as modified, DO NOT include them in this commit.

Stage and commit:
```bash
git add desktop/src/hooks/useCloudSync.ts desktop/src/hooks/useCloudSync.test.ts desktop/src/hooks/useDatabase.ts desktop/src/hooks/useSync.ts

git commit -m "$(cat <<'EOF'
Stage 01: Fix @tauri-apps/api import paths from v1 to v2

WHAT: Changed 4 files from @tauri-apps/api/tauri (v1 path, does not exist)
      to @tauri-apps/api/core (v2.10.1 correct path for invoke)
      - desktop/src/hooks/useCloudSync.ts line 2
      - desktop/src/hooks/useCloudSync.test.ts vi.mock path
      - desktop/src/hooks/useDatabase.ts line 1
      - desktop/src/hooks/useSync.ts line 2
WHY: @tauri-apps/api/tauri.js does not exist in v2.10.1. This caused
     useCloudSync.test.ts to fail to load entirely (0 tests run).
     Source files with this import will fail in production Tauri builds.
VERIFIED: Self-audit-edit gate passed — 5 consecutive null-edit passes confirmed
STANDARDS: OWASP Desktop DA2, ISO/IEC 25010 Reliability
RESEARCH BASIS: Stage 00 Track 3 — @tauri-apps/api v2 import paths
EOF
)"
```

Push immediately:
```bash
git push origin master
```

Report the commit hash in the response.

---

## Stage 02: Fix Dashboard.test.tsx Mock Method Names

### Why
`Dashboard.tsx` line 24 destructures `{ listPipelines, listAllPipelineRuns, listAllBudgets }` from `useDatabase()`. The test mock at `Dashboard.test.tsx` provides `listPipelineRuns` and `listBudgets` — the wrong names. When the Dashboard component calls `listAllPipelineRuns()`, the value is `undefined`, and JavaScript throws `TypeError: listAllPipelineRuns is not a function`. This prevents the component from loading data, so 5 of 6 tests fail.

### Step 2.1: Edit `desktop/src/components/Dashboard.test.tsx`

Read the file first:
```
Read file: /c/Users/NerdyKrystal/repos/orchestra-box-office/desktop/src/components/Dashboard.test.tsx
```

Find the `vi.mock("../hooks/useDatabase", ...)` block. It currently contains:
```typescript
listPipelineRuns: vi.fn().mockResolvedValue([
```
Change to:
```typescript
listAllPipelineRuns: vi.fn().mockResolvedValue([
```

In the SAME `vi.mock` block, find:
```typescript
listBudgets: vi.fn().mockResolvedValue([
```
Change to:
```typescript
listAllBudgets: vi.fn().mockResolvedValue([
```

Do not change anything else in the file.

### Step 2.2: Verify the Mock Block is Correct

After editing, the `vi.mock` block at the top of `Dashboard.test.tsx` must read:
```typescript
vi.mock("../hooks/useDatabase", () => ({
  useDatabase: () => ({
    listPipelines: vi.fn().mockResolvedValue([
      { id: "p1", name: "Pipeline 1", description: "Test Pipeline" },
    ]),
    listAllPipelineRuns: vi.fn().mockResolvedValue([
      {
        id: "r1",
        pipeline_id: "p1",
        status: "completed",
        started_at: 1000,
        outcomes_count: 100,
      },
    ]),
    listAllBudgets: vi.fn().mockResolvedValue([
      {
        id: "b1",
        pipeline_id: "p1",
        period: "2024-01",
        allocated_cents: 100000,
        spent_cents: 50000,
      },
    ]),
  }),
}));
```

Confirm `listPipelines` (no "All") is unchanged — only the other two were renamed.

### Stage 02-A: Self-Audit-Edit Gate (n=5)

For each of the 5 audit passes, verify ALL:
1. Open `Dashboard.test.tsx` — mock block contains `listAllPipelineRuns`, not `listPipelineRuns`
2. Open `Dashboard.test.tsx` — mock block contains `listAllBudgets`, not `listBudgets`
3. Open `Dashboard.test.tsx` — `listPipelines` (singular) is unchanged
4. No other lines in the file were changed
5. Open `Dashboard.tsx` — line 24 confirms `listAllPipelineRuns` and `listAllBudgets` are the method names the component expects (do NOT change Dashboard.tsx — it was already correct)

**Counter template:**
```
Pass 1: [PASS/FAIL] | Consecutive: [0 or 1]
Pass 2: [PASS/FAIL] | Consecutive: [0–2]
Pass 3: [PASS/FAIL] | Consecutive: [0–3]
Pass 4: [PASS/FAIL] | Consecutive: [0–4]
Pass 5: [PASS/FAIL] | Consecutive: [0–5]
```

### Stage 02-B: Commit Gate

```bash
cd /c/Users/NerdyKrystal/repos/orchestra-box-office
git status
```

Only `desktop/src/components/Dashboard.test.tsx` should appear as modified.

```bash
git add desktop/src/components/Dashboard.test.tsx

git commit -m "$(cat <<'EOF'
Stage 02: Fix Dashboard.test.tsx mock method names to match component

WHAT: Renamed mock methods in vi.mock("../hooks/useDatabase") block:
      - listPipelineRuns -> listAllPipelineRuns (line 11)
      - listBudgets -> listAllBudgets (line 20)
WHY: Dashboard.tsx line 24 calls listAllPipelineRuns() and listAllBudgets().
     Wrong mock names caused TypeError, preventing 5 Dashboard tests from
     loading data. listPipelines (no "All") was already correct.
VERIFIED: Self-audit-edit gate passed — 5 consecutive null-edit passes confirmed
STANDARDS: ISO/IEC 25010 Testability, CWE-398
RESEARCH BASIS: Stage 00 Track 1 — CWE-398, Track 3 — mock method name matching
EOF
)"

git push origin master
```

---

## Stage 03: Fix SyncPanel.test.tsx Selectors

### Why
Three tests in `SyncPanel.test.tsx` use incorrect query strategies:
- **"should display last sync time":** `getByText(/Last sync:/)` fails because the JSX renders the text and the formatted time as adjacent text nodes in the same element. The regex `/Last sync:/` matches the string content but `getByText` looks at each element's text content as a whole — if the element renders `Last sync: 1h ago` as a single span, it works; if it splits across nodes, it fails. Regardless of root cause, the fix is a custom function matcher that checks `el.textContent`.
- **"should expand panel when clicked":** `getByText(/Sync Now/)` fails with "Found multiple elements" — "Sync Now" appears in multiple places in the component (a badge AND a button label). Use `getAllByText` and index.
- **"should display Sync Now button when panel is expanded":** Same issue — use `getAllByText`.

### Step 3.1: Read the Full SyncPanel.test.tsx

```
Read file: /c/Users/NerdyKrystal/repos/orchestra-box-office/desktop/src/components/SyncPanel.test.tsx
```

Confirm the file matches the structure described. You are looking for three specific tests. Do not edit anything until you have confirmed you are looking at the correct lines.

### Step 3.2: Fix "should display last sync time" Test

Find this test (approximately lines 40–46):
```typescript
  it("should display last sync time", async () => {
    render(<SyncPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Last sync:/)).toBeInTheDocument();
    });
  });
```

Replace the ENTIRE test body (lines inside `it(...)`) with:
```typescript
  it("should display last sync time", async () => {
    render(<SyncPanel />);

    await waitFor(() => {
      // Text may be split across sibling DOM nodes; use textContent to find parent
      const el = screen.getByText(
        (_, element) => Boolean(element?.textContent?.match(/Last sync:/))
      );
      expect(el).toBeInTheDocument();
    });
  });
```

### Step 3.3: Fix "should expand panel when clicked" Test

Find this test (approximately lines 54–64):
```typescript
  it("should expand panel when clicked", async () => {
    render(<SyncPanel />);
    const expandButton = screen.getAllByRole("button")[0];

    // First click to expand
    expandButton.click();

    await waitFor(() => {
      expect(screen.getByText(/Sync Now/)).toBeInTheDocument();
    });
  });
```

Change ONLY the line `expect(screen.getByText(/Sync Now/)).toBeInTheDocument();`  
Replace with: `expect(screen.getAllByText(/Sync Now/)[0]).toBeInTheDocument();`

The full test after edit:
```typescript
  it("should expand panel when clicked", async () => {
    render(<SyncPanel />);
    const expandButton = screen.getAllByRole("button")[0];

    // First click to expand
    expandButton.click();

    await waitFor(() => {
      expect(screen.getAllByText(/Sync Now/)[0]).toBeInTheDocument();
    });
  });
```

### Step 3.4: Fix "should display Sync Now button when panel is expanded" Test

Find this test (approximately lines 78–88):
```typescript
  it("should display Sync Now button when panel is expanded", async () => {
    render(<SyncPanel />);
    const expandButton = screen.getAllByRole("button")[0];
    expandButton.click();

    await waitFor(() => {
      const syncButton = screen.getByText(/Sync Now/);
      expect(syncButton).toBeInTheDocument();
      expect(syncButton.closest("button")).not.toBeDisabled();
    });
  });
```

Change ONLY the line `const syncButton = screen.getByText(/Sync Now/);`  
Replace with: `const syncButton = screen.getAllByText(/Sync Now/)[0];`

The full test after edit:
```typescript
  it("should display Sync Now button when panel is expanded", async () => {
    render(<SyncPanel />);
    const expandButton = screen.getAllByRole("button")[0];
    expandButton.click();

    await waitFor(() => {
      const syncButton = screen.getAllByText(/Sync Now/)[0];
      expect(syncButton).toBeInTheDocument();
      expect(syncButton.closest("button")).not.toBeDisabled();
    });
  });
```

### Stage 03-A: Self-Audit-Edit Gate (n=5)

For each of the 5 audit passes, verify ALL:
1. "should display last sync time" uses the custom function matcher `(_, element) => Boolean(element?.textContent?.match(/Last sync:/))`
2. "should expand panel when clicked" uses `screen.getAllByText(/Sync Now/)[0]`
3. "should display Sync Now button when panel is expanded" uses `screen.getAllByText(/Sync Now/)[0]` 
4. The `syncButton.closest("button")` assertion remains unchanged — only the query changed
5. No other tests in the file were modified
6. The mock at the top of the file (`vi.mock("../hooks/useSync", ...)`) was not changed

**Counter template:**
```
Pass 1: [PASS/FAIL] | Consecutive: [0 or 1]
Pass 2–5: [PASS/FAIL] | Consecutive: [running total]
```

### Stage 03-B: Commit Gate

```bash
cd /c/Users/NerdyKrystal/repos/orchestra-box-office
git status
```

Only `desktop/src/components/SyncPanel.test.tsx` should appear as modified.

```bash
git add desktop/src/components/SyncPanel.test.tsx

git commit -m "$(cat <<'EOF'
Stage 03: Fix SyncPanel.test.tsx selectors for split text and multi-match

WHAT: Three test fixes in SyncPanel.test.tsx:
      1. "should display last sync time": replaced getByText(/Last sync:/) with
         custom function matcher checking element.textContent — handles text
         split across sibling DOM nodes
      2. "should expand panel when clicked": getByText -> getAllByText()[0]
         because "Sync Now" appears in multiple DOM locations
      3. "should display Sync Now button...": same getByText -> getAllByText()[0]
WHY: @testing-library getByText throws when multiple elements match. Custom
     textContent matcher is required when inline JSX splits text across nodes.
VERIFIED: Self-audit-edit gate passed — 5 consecutive null-edit passes confirmed
STANDARDS: CWE-398, ISO/IEC 25010 Testability
RESEARCH BASIS: Stage 00 Track 3 — RTL custom text matchers, getAllByText usage
EOF
)"

git push origin master
```

---

## Stage 04: Fix BudgetPage and RunsPage Selectors

### Why
Two tests use `screen.getByText()` for text that appears in multiple rendered elements:
- `BudgetPage`: "Allocated", "Spent", "Utilization" appear in both the metrics summary cards AND the per-budget table rows
- `RunsPage`: "Pipeline 1" appears in both the runs list header AND another location

### Step 4.1: Fix BudgetPage.test.tsx "should display budget metrics"

Read the file first:
```
Read file: /c/Users/NerdyKrystal/repos/orchestra-box-office/desktop/src/components/BudgetPage.test.tsx
```

Find the test "should display budget metrics". It currently reads:
```typescript
  it("should display budget metrics", async () => {
    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getByText(/Allocated/)).toBeInTheDocument();
      expect(screen.getByText(/Spent/)).toBeInTheDocument();
      expect(screen.getByText(/Utilization/)).toBeInTheDocument();
    });
  });
```

Replace ALL THREE `getByText` calls with `getAllByText(...)[0]`:
```typescript
  it("should display budget metrics", async () => {
    render(<BudgetPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Allocated/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Spent/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Utilization/)[0]).toBeInTheDocument();
    });
  });
```

Do not change any other test in BudgetPage.test.tsx.

### Step 4.2: Fix RunsPage.test.tsx "should display pipeline runs after loading"

Read the file first:
```
Read file: /c/Users/NerdyKrystal/repos/orchestra-box-office/desktop/src/components/RunsPage.test.tsx
```

Find the test "should display pipeline runs after loading". It currently reads:
```typescript
  it("should display pipeline runs after loading", async () => {
    render(<RunsPage />);

    await waitFor(() => {
      expect(screen.getByText("Pipeline 1")).toBeInTheDocument();
    });
  });
```

Change ONLY the `getByText` call:
```typescript
  it("should display pipeline runs after loading", async () => {
    render(<RunsPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Pipeline 1")[0]).toBeInTheDocument();
    });
  });
```

### Stage 04-A: Self-Audit-Edit Gate (n=5)

For each of the 5 audit passes, verify ALL:
1. `BudgetPage.test.tsx` "should display budget metrics": three `getByText` → three `getAllByText(...)[0]`
2. `RunsPage.test.tsx` "should display pipeline runs after loading": `getByText("Pipeline 1")` → `getAllByText("Pipeline 1")[0]`
3. No other tests in either file were changed
4. The `BudgetPage.test.tsx` fix applied to ALL three matchers (Allocated, Spent, Utilization) — not just one or two
5. The `RunsPage.test.tsx` change was applied ONLY to the "should display pipeline runs after loading" test — the already-passing tests were NOT touched

**Counter template:**
```
Pass 1–5: [PASS/FAIL] | Consecutive: [running total]
```

### Stage 04-B: Commit Gate

```bash
cd /c/Users/NerdyKrystal/repos/orchestra-box-office
git status
```

Only these two files should appear as modified:
- `desktop/src/components/BudgetPage.test.tsx`
- `desktop/src/components/RunsPage.test.tsx`

```bash
git add desktop/src/components/BudgetPage.test.tsx desktop/src/components/RunsPage.test.tsx

git commit -m "$(cat <<'EOF'
Stage 04: Fix getByText to getAllByText for multi-match elements in component tests

WHAT: Two files, two tests fixed:
      - BudgetPage.test.tsx "should display budget metrics": getByText for
        /Allocated/, /Spent/, /Utilization/ -> getAllByText()[0] (x3 lines)
      - RunsPage.test.tsx "should display pipeline runs after loading":
        getByText("Pipeline 1") -> getAllByText("Pipeline 1")[0]
WHY: Component renders each label in multiple DOM locations (summary card +
     table row). getByText throws "Found multiple elements". getAllByText[0]
     selects the first occurrence, which is the intended assertion target.
VERIFIED: Self-audit-edit gate passed — 5 consecutive null-edit passes confirmed
STANDARDS: CWE-398, ISO/IEC 25010 Testability
RESEARCH BASIS: Stage 00 Track 3 — getByText vs getAllByText best practices
EOF
)"

git push origin master
```

---

## Stage QA: Stress Test + Adversarial Review + Convergence Loop

### QA Entry Condition

All four stages must have committed and pushed before Stage QA begins. Verify:
```bash
cd /c/Users/NerdyKrystal/repos/orchestra-box-office
git log --oneline -6
```

Must show 4 recent commits starting with "Stage 01:", "Stage 02:", "Stage 03:", "Stage 04:".

### QA Phase 1: Stress Test (Run Full Test Suite)

```bash
cd /c/Users/NerdyKrystal/repos/orchestra-box-office/desktop
npm run test -- --run --reporter=verbose 2>&1 | tail -20
```

**Required output (exact):**
```
 Test Files  0 failed | 11 passed (11)
      Tests  0 failed | 75 passed (75)
```

**If any tests fail:** Read the verbose output, identify which test fails and why, fix it (applying the same n=5 audit gate and commit gate discipline), then re-run Phase 1.

**If the count is not 75:** Run with `--reporter=verbose` and read the full output:
```bash
npm run test -- --run --reporter=verbose 2>&1 | grep -E "×|FAIL|Error|→"
```

Report the failure lines. Do not assume what's wrong — read the actual error messages.

### QA Phase 2: Adversarial Review

Read all 11 test files. For each one, actively try to find:

**Security review:**
- [ ] No real credentials, tokens, or secrets in any mock data
- [ ] No `console.log` statements that could leak data in CI
- [ ] No hard-coded IP addresses or production URLs

**Test quality review:**
- [ ] No test uses `try/catch` to hide errors
- [ ] No test uses `expect(true).toBe(true)` (tautology)
- [ ] No test has assertions that can never fail
- [ ] All `getAllByText()[0]` calls: verify `[0]` is actually selecting the element you intend (not a hidden element that happens to be first)
- [ ] The custom textContent matcher in SyncPanel: confirm it cannot match an element with completely different text that happens to contain "Last sync:" as a substring somewhere deep in the DOM

**Coverage review:**
- [ ] `useCloudSync.test.ts` now loads (previously 0 tests — it should have test cases after the import fix)
- [ ] No test file shows `0 tests` or `skipped` in output

**Standards compliance:**
- [ ] All imports in source files use `@tauri-apps/api/core` — grep confirms
- [ ] Dashboard mock matches Dashboard component's actual method names

**Output for Phase 2:**

```
## QA Phase 2: Adversarial Review Results

Issues found: [count]

| # | Category | Severity | File | Line | Issue |
|---|----------|----------|------|------|-------|
```

If issues found: fix them, re-run Phase 1, then re-run Phase 2.

### QA Phase 3: Remediation

Fix any issues from Phase 1 or Phase 2. Apply n=5 audit gate and commit gate for each fix. Then return to Phase 1.

### QA Null Counter

```
QA Cycle 1: Phase 1 issues [N], Phase 2 issues [N] | Consecutive null cycles: [0 or 1]
QA Cycle 2: ...
...
QA Cycle N: Phase 1 issues [0], Phase 2 issues [0] | Consecutive null cycles: [5 of 5] — GATE PASSES
```

### Stage QA-B: Final Commit

After 5 consecutive null cycles:

```bash
cd /c/Users/NerdyKrystal/repos/orchestra-box-office
git add [any QA-remediated files]

git commit -m "$(cat <<'EOF'
Stage QA: Enterprise quality convergence — 75/75 tests passing

WHAT: [list any QA-remediated files, or "No additional changes required"]
VERIFIED: [N] QA cycles, [N] total issues found and fixed,
          5 consecutive null cycles confirmed
STANDARDS MET: OWASP Desktop DA2 (correct IPC imports), ISO/IEC 25010
               Testability (75/75 pass rate), CWE-398 (no indicator-of-poor-quality tests)
STRESS TEST: 75 tests, 100% pass rate
ADVERSARIAL REVIEW: [N] total issues across all cycles by severity
EOF
)"

git push origin master
```

---

## Final Report Template

After Stage QA-B, report:

```
## D2R Execution Complete — Desktop Test Fixes

| Stage | Description | Audit Loops | Edits | Commit |
|-------|-------------|-------------|-------|--------|
| 01 | @tauri-apps/api import fix (4 files) | [N] | [N] | [hash] |
| 02 | Dashboard mock method names | [N] | [N] | [hash] |
| 03 | SyncPanel selector fixes (3 tests) | [N] | [N] | [hash] |
| 04 | BudgetPage + RunsPage selector fixes | [N] | [N] | [hash] |
| QA | Convergence loop | [N cycles] | [N] | [hash] |

Test result before: 65/75 passing (10 failing, 1 file unloadable)
Test result after: 75/75 passing (0 failing, 11 files load cleanly)

Enterprise standards verified:
- OWASP Desktop DA2: IPC imports corrected
- ISO/IEC 25010 Testability: 100% test suite pass rate
- CWE-398: No indicator-of-poor-quality test patterns remaining
```

---

## Hard Rules for Haiku

1. **Read every file before editing it.** Never edit a file you haven't confirmed the current content of.
2. **Make ONLY the changes described.** If you see other issues while reading a file, note them in the report but do NOT fix them. Scope is exactly what this plan describes.
3. **Run the n=5 audit gate on every stage.** Do not skip to 3 or 4. Five means five.
4. **Commit after each stage, not at the end.** Every stage gets its own commit with the exact message template filled in.
5. **Push immediately after every commit.** Never accumulate local commits.
6. **If a test STILL fails after your fix:** Do not guess. Read the full error message. Report it. Do not continue to Stage QA until all 10 + 1 defects are resolved.
7. **Do not change Dashboard.tsx, SyncPanel.tsx, BudgetPage.tsx, or RunsPage.tsx.** Only test files and hook source files are in scope.
8. **Do not add new tests.** Fix existing ones only.
9. **Do not reformat, rename variables, or add comments.** Surgical changes only.
10. **The pre-execution state check is mandatory.** If the count doesn't match 65 passing / 10 failing, STOP and report.
