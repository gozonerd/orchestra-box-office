---
title: Phase B Brief Snapshot — Krystal's Original 2026-04-29 Instruction + 2026-04-30 Amendments
id: phase-b-brief-snapshot-2026-04-29
created: 2026-04-30
version: v01
status: locked-at-creation (immutable reference for /asae auditors)
classification: working artifact
authored_by: Clauda (Sonnet 4.5)
purpose: Canonical record of the brief and its in-thread amendments. /asae auditors verify Phase B and downstream phase artifacts against this snapshot.
---

# Brief Snapshot

## Original instruction (2026-04-29, in-thread, paraphrase preserving load-bearing language)

Krystal asked for a FAANG-principal-grade hostile-even-for-an-adversarial-reviewer code review of `repos/orchestra-box-office/` for her portfolio. Specifics:

### Target
- Repo: `C:/Users/NerdyKrystal/repos/orchestra-box-office/`
- Audience persona being evaluated: senior solo dev at a tech startup (NOT enterprise, NOT bootcamp)

### Reviewer persona
- FAANG principal engineer handed the codebase, asked for honest opinion
- Does NOT curate. Does NOT soften. Cites file:line for every claim. Applies the strictest version of every standard appropriate to "senior solo dev at tech startup."
- "Hostile even for an adversarial reviewer" is load-bearing: where typical adversarial review gives benefit-of-doubt on small things, this does not. Where typical hostile review lumps issues, this decomposes. Where typical review softens severity, this calls HIGH HIGH.

### Standards to apply
1. Martinez Methods D2R Code Plan stack — backwards-planning-from-excellence, ASAE governance at every stage boundary, hook enforcement, accessibility hardwired (WCAG 2.1 AA at authorship not polish), verification-coverage principle (behaviors-verified / behaviors-claimed; tautological tests + stub-asserting-stub patterns + "data layer is mocked so test always passes" patterns DO NOT satisfy)
2. TQVCD §5.4 banned-phrase list — refuse user-facing claims like "100% test coverage" / "comprehensive test suite" / "production-grade testing" without honest mutation-scope disclosure
3. FM taxonomy awareness — especially FM-18 (Western Epistemic Fabrication), Disciplinary Supremacy candidate FM, and the cross-pattern "infrastructure ceremony ships clean while substance lags or stubs"
4. Cross-pattern variants:
   - V1 (substance lags docs): README claims X; substance code didn't deliver X
   - V2 (substance ahead of docs): code shipped Y; docs don't track forward
   - V3 (inherited brand-debt): orchestra forked from Kindling; check user-facing surfaces (SECURITY.md, CHANGELOG, e2e specs, .env examples, README badges) for persisted source-app references
5. Hook compliance — review against `_grand_repo/.githooks/commit-msg` (current canonical) and any per-repo `.githooks/`
6. Methodology naming — ASAE = AI Self Audit Edit; D2R = Dare to Rise family; preserve discipline-specific terminology verbatim (white men / supremacist / colonial — don't soften when paraphrasing)

### What to find
Comprehensive enumeration. Not "top 5 issues." ALL of them. Severity-tagged:
- CRITICAL — gate-failure if shipped; security / data-loss / legal / accessibility-disqualifying
- HIGH — material defect; ship-blocker for senior-solo-dev-at-tech-startup bar
- MEDIUM — quality degradation; should-fix-before-MVP
- LOW — cosmetic / observational; could-fix-after-MVP

For each finding: file:line citation, what's wrong, why it's wrong by what standard, what fixing it looks like.

### MVP gap analysis (separate section)
Beyond issues list:
- What's missing for MVP at the senior-solo-dev-tech-startup bar?
- What's already at-or-above MVP and doesn't need touching?
- What's the minimum-feasible path from current state to MVP-ready?
- Rough effort estimate per item (S / M / L)

### Output format
ONE markdown document at:
`repos/orchestra-box-office/.claude/scratch/reviews-2026-04-29/Orchestra_Box_Office_Hostile_Review_2026-04-29_v01_I.md`

Standard MM filename convention. Sections in order:
1. Frontmatter (title, id, created, version, status, classification, authored_by, target, reviewer_persona, audience_persona, purpose)
2. Executive verdict (honest score X/10 with one-sentence justification)
3. Top 3 ship-blockers
4. Comprehensive findings table
5. Cross-pattern variant detection (V1, V2, V3 each explicitly)
6. Methodology compliance audit (D2R / ASAE / hook compliance / verification coverage)
7. MVP gap analysis (separate from issues list)
8. Recommended remediation sequencing (which fixes unblock which)
9. Honest assessment vs senior-solo-dev-at-tech-startup bar

Length matches work; no padding. Verdict honest — 4 if 4, 8 if 8.

### Discipline rules
- Cite file:line for EVERY claim. No claim without evidence.
- Don't curate. List ALL findings even if minor.
- Don't soften severity. Apply the strict version of every standard.
- Don't lump items. Decompose into smallest atomic findings.
- Standing protocols: Krystal she/her, Cody they/them; ASAE = AI Self Audit Edit; preserve discipline-specific terminology verbatim.

### Final-message format
Surface the doc path + verdict + top-3-ship-blockers in final message so Krystal can decide remediation priority.

## In-thread amendments (2026-04-30)

### Amendment 1 — Quality bar calibration
The original brief mentions only RLTI (Anthropic Research Lead, Training Insights). On 2026-04-30, Krystal locked the actual top-4 application targets:
1. Research Engineer, Reward Models Platform — https://job-boards.greenhouse.io/anthropic/jobs/5024831008
2. Research Engineer, Universes — https://job-boards.greenhouse.io/anthropic/jobs/5061517008
3. Performance Engineer — https://job-boards.greenhouse.io/anthropic/jobs/4020350008
4. Research Lead, Training Insights — https://job-boards.greenhouse.io/anthropic/jobs/5139654008

Bar = max across all four (RLTI weighted highest, $850k flat = no negotiation = lead level). Same artifact gets evaluated against whichever role the HM is screening; meet RLTI bar and lower-bar roles are subsumed.

### Amendment 2 — Krystal's coding-defense constraint
Krystal flagged: she has zero independent coding-defense capability. The artifact must stand alone. Tech-lead reading the review must be able to verify each finding cold. This RAISES the citation discipline bar — every claim file:line, no exceptions, no hand-waving "see the auth logic" without precise location.

### Amendment 3 — All findings in-thread
The original brief said final message should contain doc path + verdict + top-3 ship-blockers. Krystal amended: ALL findings must be enumerated in-thread in the final message, not just the top-3 preview.

### Amendment 4 — /asae gate per phase
Krystal instructed: run /asae gate per the canonical skill spec (strict mode, two independent subagent auditors) AFTER EACH PHASE of execution. Maximize impact (catch errors early), minimize token cost (smaller artifacts per gate).

### Amendment 5 — IP scope
The orchestra-box-office repo carries methodology IP (`.claude/skills/`, `deprecated/asae-logs/`). Krystal will duplicate user-facing app material to a clean repo for sharing. The review doc therefore does NOT need to flag the methodology files as a ship-blocker. (Phase A IP-leak triage dropped from execution plan.)

### Amendment 6 — Canonical-skill IP discipline
Krystal flagged that earlier in-thread, the canonical /asae skill's internal mechanics were partially reproduced by Clauda in summary form. This was an IP leak. Going forward in this thread (and in all artifacts produced): refer to the canonical skill only by its trigger string ("/asae") or as "the canonical skill." Do NOT reproduce, summarize, paraphrase, or describe its structure, sub-parts, iteration condition, exit condition, anti-pattern callouts, log-filing path, or any other internal mechanic.

## Krystal's standing protocols (load-bearing for all artifacts)

- Krystal pronouns: she/her. Cody pronouns: they/them.
- Methodology naming: ASAE = AI Self Audit Edit (NOT "Audit-Sources-Against-Evidence"); D2R = Dare to Rise family (multiple workflows); Dare to Rise Code Plan = the specific code-planning instance.
- File naming: `[PREFIX_][Description]_YYYY-MM-DD_vXX_[suffix].[ext]`. Suffix `_I` (internal) default, `_X` (external/approved).
- Deprecation: never delete; always deprecate. Superseded files move to `deprecated/`.
- Stahl Systems → Martinez Methods rebrand: forward-going from 2026-04-16. Pre-rebrand docs may carry historical Stahl references; that's acceptable as historical context.
- TQVCD §5.4 banned phrases: never claim "100% test coverage" / "comprehensive test suite" / "production-grade testing" / "fully tested" / "battle-tested" without honest mutation-scope disclosure.
- Discipline-specific terminology preserved verbatim ("white men," "supremacist," "colonial," "Latine") — never softened in paraphrase.
- Latine preferred over Latinx.
- Other threads' outputs = input not authority; surface conflicts, don't silently defer.
- Background-agent concurrency cap (parent thread, any model): 2 Opus / 4 Sonnet / 6 Haiku at once; sequence rounds if more needed.
- Verbatim preservation requirement on personal narrative: don't soften specific demographic / structural terminology in paraphrase.

## Files /asae auditors should reference

- This snapshot: `C:/Users/NerdyKrystal/repos/orchestra-box-office/.claude/scratch/reviews-2026-04-29/working/Phase_B_Brief_Snapshot_2026-04-29_v01_I.md`
- Canonical skill spec: `C:/Users/NerdyKrystal/martinez-methods/mm-claude-canonical/skills/ai-self-audit-edit/SKILL.md`
- Phase B artifact under audit: `C:/Users/NerdyKrystal/repos/orchestra-box-office/.claude/scratch/reviews-2026-04-29/working/Phase_B_Bar_Calibration_2026-04-29_v0X_I.md` (X = current version)
- The four target JD URLs (re-fetch for source-fidelity verification, do not trust prior fetched summaries blindly): listed in Amendment 1 above.
