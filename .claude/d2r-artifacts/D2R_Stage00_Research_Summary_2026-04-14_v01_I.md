---
name: D2R Stage 00 Research Summary — Desktop Test Fixes
description: Three-track research findings for fixing 10 failing + 1 unloadable desktop unit tests in Orchestra Box Office
type: project
audience: martinez_methods_internal
classification_reason: INTERNAL _I classification per Martinez Methods classification convention; not approved for external release pending pre-publication IP scrub.
---

# D2R Stage 00 Research Summary
**Task:** Fix 10 failing + 1 unloadable desktop unit tests in Orchestra Box Office  
**Date:** 2026-04-14  
**Prepared by:** Sonnet 4.6 for execution by Haiku 4.5

---

## Track 1: Enterprise Standards

### ISO/IEC 25010 — Reliability / Testability
- **Applicable requirements:** Test suite must produce a deterministic, repeatable signal. Tests that fail due to wrong mock method names or deprecated import paths are not flaky — they are wrong. All 11 test defects identified below are specification mismatches, not environment issues.
- **Exit criteria:** 75/75 tests pass on `npm run test -- --run` with no skipped tests and no `0 tests` suites.
- **Constrains:** All stages (a test that isn't run isn't verified).

### OWASP Desktop App Security Top 10 — DA2 (Improper Authentication)
- **Applicable requirements:** The `@tauri-apps/api/tauri` import path is from Tauri v1 and does not exist in Tauri v2.10.x. Source files using this path (`useCloudSync.ts`, `useDatabase.ts`, `useSync.ts`) may silently fall back to undefined behavior in production builds. The IPC bridge that triggers `invoke()` calls is a security boundary — a broken import risks the command handler not being called at all.
- **Exit criteria:** All four files use `@tauri-apps/api/core` (the v2 path). Zero remaining `@tauri-apps/api/tauri` references anywhere in `/desktop/src`.
- **Constrains:** Stage 01.

### OWASP Desktop App Security Top 10 — DA6 (Sensitive Data Exposure)
- **Applicable requirements:** Tests must not expose real credentials, tokens, or database connection strings. All mocks use fake data (confirmed — no fix needed).
- **Exit criteria:** No real secrets in any test file.
- **Constrains:** Stage QA (adversarial review).

### CWE-398 — Indicator of Poor Code Quality
- **Applicable requirements:** Tests using `screen.getByText()` when multiple matching elements exist will throw and fail. This is a test authorship error. The correct fix is `getAllByText()` with an index access or a more specific selector — NOT silencing the error or wrapping in try/catch.
- **Exit criteria:** No `getByText` call in any test file targets text that appears more than once in the rendered DOM.
- **Constrains:** Stages 02, 03, 04.

---

## Track 2: Claude Code Tooling

### Skill: `react-mock-generator`
- **What it does:** Generates React Testing Library mocks that match the hook's actual interface.
- **Applies to:** Stage 02 (Dashboard mock fix), Stage 03 (SyncPanel mock fix).
- **Action:** Not needed — Haiku will apply targeted surgical fixes to existing mocks. The correct method names are known from reading the component source.

### Skill: `react-coverage-analyzer`
- **What it does:** Analyzes test coverage gaps.
- **Applies to:** Stage QA Phase 1.
- **Action:** Use in QA to verify no coverage regressions after fixes.

### Vitest + @testing-library/react
- **Installed versions:** Vitest 1.6.1, @testing-library/react 14.3.1, @testing-library/jest-dom 6.9.1
- **Setup file:** `desktop/src/test-setup.ts` (created in prior session — already imports `@testing-library/jest-dom`)
- **vitest.config.ts:** `setupFiles: ['./src/test-setup.ts']` (already set in prior session)

---

## Track 3: Best Practices

### @tauri-apps/api v2 Import Paths
- **Installed version:** 2.10.1 (confirmed via `node_modules/@tauri-apps/api/package.json`)
- **v1 path (WRONG, does not exist):** `@tauri-apps/api/tauri`
- **v2 path (CORRECT):** `@tauri-apps/api/core`
- **Evidence:** `ls node_modules/@tauri-apps/api/` shows `core.js`, `core.cjs`, `core.d.ts` — no `tauri.js` file exists. The package `exports` field only exposes `.` and `./*`, mapping `./core` to `core.js`.
- **Applies to:** Stage 01.
- **Pitfall:** Do not use `@tauri-apps/api` (root) — `invoke` is not re-exported from the root index in v2. Must use `@tauri-apps/api/core`.

### @testing-library/react `getByText` vs `getAllByText`
- **Best practice:** Use `getByText` only when exactly one element matches. When the component renders the same text string in multiple places (e.g., a pipeline name in a header AND in a list row), use `getAllByText` and index into the result, or use a more specific query (e.g., `within(container).getByText`).
- **Source:** @testing-library docs — https://testing-library.com/docs/queries/bytext
- **Applies to:** Stages 02, 03, 04.
- **Pitfall:** Do not use `getAllByText()[0]` blindly without knowing which element you want. Check the rendered DOM structure to pick the right index or query.

### React Testing Library custom text matchers
- **Best practice:** When text is split across sibling elements (e.g., `<span>Last sync: </span><span>1h ago</span>`), `getByText(/Last sync:/)` fails because the regex matches the text node content of a single element, not the combined textContent. Use a custom matcher function: `screen.getByText((_, el) => Boolean(el?.textContent?.match(/Last sync:/)))`.
- **Source:** @testing-library docs — "TextMatch" section on using functions as matchers.
- **Applies to:** Stage 03 (SyncPanel "should display last sync time").

### Vitest `vi.mock` hoisting behavior
- **Best practice:** `vi.mock()` calls are hoisted to the top of the test file by Vitest (like `jest.mock`). A module path in `vi.mock("path")` must exactly match the import path in the source file being tested OR the test file itself. A mismatch means the mock is never applied.
- **Applies to:** Stage 01 — both `useCloudSync.ts` (source) and `useCloudSync.test.ts` (test) currently import from `@tauri-apps/api/tauri`. Both must be changed to `@tauri-apps/api/core` so the mock path matches.
- **Pitfall:** Changing only the test mock path without changing the source import means the mock applies to the test's direct import, but the source file still imports from the old path. In Vitest's module graph, the source file's import is a separate module entry — the mock must match the path that the source file uses.

---

## Known Defects (11 total, enumerated for Haiku)

### Defect Class A: Wrong Import Path (Tauri v1 → v2)
4 files use `@tauri-apps/api/tauri` which does not exist in @tauri-apps/api v2.10.1.

| # | File | Line | Old | New |
|---|------|------|-----|-----|
| A1 | `desktop/src/hooks/useCloudSync.ts` | 2 | `import { invoke } from "@tauri-apps/api/tauri"` | `import { invoke } from "@tauri-apps/api/core"` |
| A2 | `desktop/src/hooks/useCloudSync.test.ts` | 5 | `vi.mock("@tauri-apps/api/tauri", ...` | `vi.mock("@tauri-apps/api/core", ...` |
| A3 | `desktop/src/hooks/useDatabase.ts` | 1 | `import { invoke } from "@tauri-apps/api/tauri"` | `import { invoke } from "@tauri-apps/api/core"` |
| A4 | `desktop/src/hooks/useSync.ts` | 2 | `import { invoke } from "@tauri-apps/api/tauri"` | `import { invoke } from "@tauri-apps/api/core"` |

### Defect Class B: Mock Method Name Mismatch
The Dashboard component (`Dashboard.tsx` line 24) calls `listAllPipelineRuns()` and `listAllBudgets()`. The test mock provides `listPipelineRuns()` and `listBudgets()` — the wrong names. The component calls undefined functions, throws `TypeError: listAllPipelineRuns is not a function`, and renders nothing. 5 of 6 Dashboard tests fail.

| # | File | Line | Old | New |
|---|------|------|-----|-----|
| B1 | `desktop/src/components/Dashboard.test.tsx` | 11 | `listPipelineRuns: vi.fn()...` | `listAllPipelineRuns: vi.fn()...` |
| B2 | `desktop/src/components/Dashboard.test.tsx` | 20 | `listBudgets: vi.fn()...` | `listAllBudgets: vi.fn()...` |

### Defect Class C: `getByText` with Multiple Matching Elements
Tests use `screen.getByText(matcher)` but the rendered DOM contains multiple elements matching the same text. The Testing Library throws "Found multiple elements" and the test fails.

| # | File | Test name | Line | Current matcher | Fixed matcher |
|---|------|-----------|------|----------------|---------------|
| C1 | `RunsPage.test.tsx` | "should display pipeline runs after loading" | 58 | `screen.getByText("Pipeline 1")` | `screen.getAllByText("Pipeline 1")[0]` |
| C2 | `BudgetPage.test.tsx` | "should display budget metrics" | 80 | `screen.getByText(/Allocated/)` | `screen.getAllByText(/Allocated/)[0]` |
| C2b | `BudgetPage.test.tsx` | "should display budget metrics" | 81 | `screen.getByText(/Spent/)` | `screen.getAllByText(/Spent/)[0]` |
| C2c | `BudgetPage.test.tsx` | "should display budget metrics" | 82 | `screen.getByText(/Utilization/)` | `screen.getAllByText(/Utilization/)[0]` |
| C3 | `SyncPanel.test.tsx` | "should expand panel when clicked" | 62 | `screen.getByText(/Sync Now/)` | `screen.getAllByText(/Sync Now/)[0]` |
| C4 | `SyncPanel.test.tsx` | "should display Sync Now button when panel is expanded" | 84 | `screen.getByText(/Sync Now/)` | `screen.getAllByText(/Sync Now/)[0]` |

### Defect Class D: Text Split Across Elements
The SyncPanel renders "Last sync:" as a text literal inline with `{formatSyncAge(...)}` in JSX. At runtime this renders as separate DOM text nodes, so `getByText(/Last sync:/)` searches for an element whose text content is ONLY "Last sync:" — which no single element contains.

| # | File | Test name | Line | Current matcher | Fixed matcher |
|---|------|-----------|------|----------------|---------------|
| D1 | `SyncPanel.test.tsx` | "should display last sync time" | 44 | `screen.getByText(/Last sync:/)` | `screen.getByText((_, el) => Boolean(el?.textContent?.match(/Last sync:/)))` |
