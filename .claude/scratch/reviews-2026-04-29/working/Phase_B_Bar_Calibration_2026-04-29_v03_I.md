---
title: Phase B Bar Calibration — Orchestra Box Office Hostile Review
id: phase-b-bar-calibration-2026-04-29
created: 2026-04-30
version: v03
status: draft (mid-/asae loop, iteration 3)
classification: working artifact
authored_by: Clauda (Sonnet 4.5)
purpose: Map the four-target-JD requirement categories onto per-section bar criteria for the hostile review doc, so /asae auditors have an external standard to verify the doc against.
phase: B (job-post bar synthesis)
gate: pending /asae
sources_locked_at_creation: 2026-04-30 (JD content fetched 2026-04-30 from greenhouse.io)
supersedes: working/deprecated/Phase_B_Bar_Calibration_2026-04-29_v02_I.md
---

# Phase B Bar Calibration — Orchestra Box Office Hostile Review

## Authoring discipline note

This artifact references the four target JDs by **URL + role title** only (§1) and refers to JD requirement *categories* by descriptor (e.g., "JD-4 strategic-measurement category") in the bar mapping (§3). It deliberately does NOT paraphrase or quote specific JD bullets. Reason: paraphrasing JD bullets invites source-fidelity errors (paraphrase-as-quoted, omitted required items, conflation of distinct JD sections such as "Required" vs "Good-fit profile"). Auditors verify category existence by re-fetching the JD URL and confirming the named category appears as a real section/requirement in the JD.

The brief snapshot at `working/Phase_B_Brief_Snapshot_2026-04-29_v01_I.md` is the immutable canonical record of Krystal's brief and amendments. This artifact references the snapshot by section/concept, not by quoted phrase.

## 1. The four target JDs (metadata only)

| Slot | Role title (per greenhouse page) | URL | Comp shown | Level shown |
|---|---|---|---|---|
| JD-1 | Research Engineer, Reward Models Platform | https://job-boards.greenhouse.io/anthropic/jobs/5024831008 | $350,000 – $500,000 USD | IC (no team-management responsibility stated) |
| JD-2 | Research Engineer, Universes | https://job-boards.greenhouse.io/anthropic/jobs/5061517008 | $500,000 – $850,000 USD | IC (research + engineering blend stated) |
| JD-3 | Performance Engineer | https://job-boards.greenhouse.io/anthropic/jobs/4020350008 | $280,000 – $850,000 USD | IC |
| JD-4 | Research Lead, Training Insights | https://job-boards.greenhouse.io/anthropic/jobs/5139654008 | $850,000 – $850,000 USD (single value) | Hands-on lead with small-team management stated |

Auditors verify each row's comp and level by re-fetching the URL. For section structure (Required / Good-fit / Strong-plus / Culture / etc.) and full content, the URL is the source-of-truth — this artifact does not reproduce JD section content.

**Why RLTI weights highest (interpretive note, not a JD claim):** The single-value JD-4 comp signals that the role is filled at a fixed comp; lower-bound roles in JD-1/2/3 leave room for placement variance. Per Amendment 1 of the brief snapshot, Krystal weights JD-4 highest because the bar that clears JD-4 subsumes the other three. This interpretation is Krystal's, captured in the brief snapshot, not asserted by any JD page.

## 2. The brief (anchor reference)

The canonical brief reference for /asae auditors is the brief snapshot at `working/Phase_B_Brief_Snapshot_2026-04-29_v01_I.md`. That snapshot captures:

- **Original 2026-04-29 instruction** — reviewer persona, audience persona, six standards (Martinez Methods D2R Code Plan stack; TQVCD §5.4 banned-phrase list; FM taxonomy including FM-18 Western Epistemic Fabrication, Disciplinary Supremacy candidate FM, "infrastructure ceremony ships clean while substance lags or stubs"; cross-pattern variants V1/V2/V3; hook compliance vs `_grand_repo/.githooks/commit-msg`; methodology naming preservation), severity scheme (CRITICAL/HIGH/MEDIUM/LOW), 9 mandated review-doc sections, citation discipline, no-curate / no-soften / no-lump rules.
- **Six in-thread amendments**:
  - Amendment 1 — quality-bar calibration (top-4 JD targets, RLTI weighted highest)
  - Amendment 2 — Krystal's coding-defense constraint (raises citation-discipline bar)
  - Amendment 3 — all findings enumerated in-thread in final message
  - Amendment 4 — /asae gate after each phase
  - Amendment 5 — IP scope (clean-fork strategy handles repo IP)
  - Amendment 6 — canonical-skill IP discipline (refer to /asae by trigger string only; no reproduction/summary/paraphrase/description of internal mechanics)

For verbatim brief content, auditors read the brief snapshot directly.

## 3. Per-section bar criteria + JD-category mapping

The same review-doc artifact gets evaluated against whichever role the HM is screening. RLTI bar weighted highest — meet RLTI and lower-bar roles are subsumed.

### Section 1: Frontmatter

| Bar criterion | Why (which JD requirement category / brief section this evidences) |
|---|---|
| All 11 brief-mandated frontmatter fields populated (title, id, created, version, status, classification, authored_by, target, reviewer_persona, audience_persona, purpose) — applies to the review doc deliverable, not to working artifacts | Brief output-format requirements; baseline professional-artifact discipline expected by all four JDs |
| MM filename convention exact: `Description_YYYY-MM-DD_vXX_suffix.md` | Brief discipline rules; Krystal standing protocol re file naming |
| Version, status, and classification fields reflect the artifact's actual state at gate exit | Audit-trail integrity; JD-4 results-orientation requirement category |

### Section 2: Executive verdict (X/10)

| Bar criterion | Why |
|---|---|
| Single integer score 1–10; honest; not curated up to look better than the §4 findings warrant | Brief explicit (verdict honest); JD-4 strategic-measurement requirement category |
| One-sentence justification names the load-bearing reason for the score | JD-4 communication requirement category — readable to HM (non-tech) and tech-lead (deep) |
| Numeric verdict reconciles with §4 severity profile (CRITICAL count, HIGH count, ratio); any divergence between §2 score and §4 distribution is explained explicitly in §2 or §9 | JD-4 cross-team-synthesis requirement category; epistemic honesty per brief discipline rules |

### Section 3: Top 3 ship-blockers

| Bar criterion | Why |
|---|---|
| Each ship-blocker is one of the items that absolutely must land for MVP — not "important but nice-to-have" | JD-4 strategic-measurement requirement category; brief MVP-gap-analysis section |
| Each ship-blocker named at finding-grain (file:line cited), not at theme-grain (e.g., "auth is bad") | Brief citation-discipline rule; Amendment 2 (tech-lead verifies cold); JD-2 debug-iterate-across-stacks requirement category |
| Ordering reflects impact, not severity-tag-count alone | JD-4 cross-team-synthesis requirement category |

### Section 4: Comprehensive findings table

| Bar criterion | Why |
|---|---|
| Every finding the explore agents surfaced PLUS any new ones found during authoring; no curation | Brief no-curate rule; JD-2 debug-iterate-across-stacks requirement category requires complete fault inventory |
| Severity-tag honesty per the brief's CRITICAL/HIGH/MEDIUM/LOW definitions; no inflation; no deflation | Brief no-soften rule; JD-4 deep-AI-safety-commitment requirement category |
| Each finding decomposed to atomic — no lumping multiple distinct issues into one row | Brief no-lump rule; JD-4 long-horizon-eval-rigor requirement category |
| Each row has: file:line citation; what's wrong; why it's wrong by what standard; what fixing it looks like | Brief explicit |
| Citations valid: cited file exists at the path stated, line numbers match the content cited as of the audit date | Amendment 2 (tech-lead verifies cold); JD-2 iterate-rapidly-across-stacks requirement category |
| No banned-phrase claims (TQVCD §5.4) about the review's own work | Krystal standing protocol; epistemic honesty per brief |

### Section 5: Cross-pattern variant detection

| Bar criterion | Why |
|---|---|
| V1, V2, V3 each addressed with explicit finding (even when the finding is "no instances observed") | Brief explicit; FM-taxonomy rigor demonstration |
| V1 (claims-ahead-of-substance): every claim README/SECURITY/CLAUDE/LAUNCH-readiness make about the app is paired with a substance-verification result | JD-4 eval-framework-design requirement category — claims-vs-evidence is core eval methodology |
| V2 (substance-ahead-of-docs): undocumented features or behaviors identified | Same |
| V3 (inherited Kindling brand-debt): explicit scan of every user-facing surface; every hit cited | Krystal standing concern per brief snapshot; brief explicit |

### Section 6: Methodology compliance audit

| Bar criterion | Why |
|---|---|
| D2R compliance: backwards-planning visible? ASAE governance at stage boundaries? hook orchestration? a11y hardwired-at-authorship? verification-coverage principle honored? Each = evidenced or refuted with file:line | Krystal MM stack as portfolio asset; JD-4 novel-measurement-approaches requirement category |
| `/asae` compliance: was the canonical loop applied during the project's own development per the canonical skill spec? Verify per the spec at the canonical skill file path; do not restate verification criteria here | Krystal standing protocol; brief explicit; Amendment 6 |
| Hook compliance vs `_grand_repo/.githooks/commit-msg` (current canonical version): every divergence from canonical noted with line numbers | Krystal standing protocol; brief explicit |
| Verification-coverage ratio: behaviors-VERIFIED / behaviors-CLAIMED with criticality-weighting; tautological / stub-asserting-stub / mocked-data-layer patterns DO NOT count as verified per the brief's verification-coverage principle | Brief explicit; JD-4 novel-measurement-approaches requirement category — verification-coverage IS such a measurement |
| Banned-phrase scan completed: TQVCD §5.4 phrases hunted across all user-facing repo surfaces; every hit cited | Brief explicit; Krystal standing protocol |

### Section 7: MVP gap analysis (separate from issues list)

| Bar criterion | Why |
|---|---|
| Punchlist format, not prose | Brief explicit |
| Each gap has an effort estimate (S / M / L) | Brief explicit |
| Each gap is independent of the §4 issues table — represents what's missing, not what's broken | Brief explicit |
| Already-at-or-above MVP items called out as a "don't touch" list | Brief explicit |

### Section 8: Recommended remediation sequencing

| Bar criterion | Why |
|---|---|
| Dependency graph between fixes: each remediation item annotated with which other items it unblocks | Brief explicit; JD-3 fault-tolerant-system-design requirement category — sequencing IS dependency analysis |
| Sequencing reflects effort × unblock-count (not severity alone) | JD-4 cross-team-synthesis requirement category |
| Critical-path remediation items identified separately from parallel-work items | Same |

### Section 9: Honest assessment vs senior-solo-dev-at-tech-startup bar

| Bar criterion | Why |
|---|---|
| Numeric verdict in §2 matches the strengths-vs-gaps tally in §9; any divergence between §2 score and §9 narrative explained explicitly | Brief explicit (verdict honest); epistemic honesty |
| At least one strength called out explicitly (the "don't-touch" list of §7 is non-empty and §9 names at least one item from it) | Brief explicit; balances hostile review with fair acknowledgment of craft |
| Severity-tag distribution in §4 (count of CRITICAL/HIGH/MEDIUM/LOW) is honest per brief definitions and is referenced in the §9 reconciliation | Brief no-soften rule |

## 4. Cross-cutting bar criteria (apply to whole review doc)

| Bar criterion | Why |
|---|---|
| Every claim in the review doc has a file:line citation; zero exceptions | Brief explicit; Amendment 2 (tech-lead verifies cold) |
| Each section contains at least one substantive finding/claim; no section consists solely of rephrasing the section above it | Length-matches-work proxy (falsifiable replacement for "no padding") |
| At least one strength acknowledged in §9 (don't-touch list non-empty) | Hostile-but-fair principle |
| Pronoun discipline: Krystal she/her; Cody they/them | Krystal standing protocol |
| Methodology naming: ASAE = AI Self Audit Edit; D2R = Dare to Rise family; preserve discipline-specific terminology verbatim | Krystal standing protocol |
| No reproduction, summary, paraphrase, or description of canonical-skill internal mechanics — refer to the canonical skill by trigger string `/asae` or by file path only | Krystal standing protocol per Amendment 6 |
| MM filename convention enforced (`Description_YYYY-MM-DD_vXX_suffix.md`) | Krystal standing protocol |
| Deprecation discipline: never delete; superseded versions move to `deprecated/` adjacent to the working file | Krystal standing protocol |
| Branding: Martinez Methods (NOT Stahl Systems) for any forward-going references in the review doc; pre-2026-04-16 historical references in the cited target files acceptable as historical context | Krystal standing protocol re rebrand |
| Latine preferred over Latinx if either appears | Krystal standing protocol |
| Discipline-specific terminology preserved verbatim ("white men," "supremacist," "colonial," "Latine") — not softened in paraphrase | Krystal standing protocol |
| Other threads' outputs treated as input not authority — surface conflicts, don't silently defer | Krystal standing protocol |
| TQVCD §5.4 banned phrases ("100% test coverage," "comprehensive test suite," "production-grade testing," "fully tested," "battle-tested") not claimed by the review doc about its own work or about the app without honest mutation-scope disclosure | Krystal standing protocol |
| Background-agent concurrency cap respected if any further subagent work spawned (parent-thread cap: 2 Opus / 4 Sonnet / 6 Haiku at a time; sequence rounds if more needed) | Krystal standing protocol |

## 5. Verification checklist for this artifact

For /asae auditors verifying this Phase B artifact:

1. **Source fidelity (§1 metadata):** every row's URL, comp value, and level descriptor in §1 corresponds to the actual greenhouse.io page (re-fetch each URL to verify). Flag any row where comp range / level descriptor / role title misrepresents the JD page. §1 deliberately does NOT reproduce JD section content; the categories referenced in §3 (e.g., "JD-4 strategic-measurement requirement category") are verified separately under check 3.
2. **Brief fidelity (§2/§3/§4):** every reference to brief content in §2/§3/§4 traces to the brief snapshot at `working/Phase_B_Brief_Snapshot_2026-04-29_v01_I.md`. Flag any reference that contradicts the snapshot or claims content not present in the snapshot.
3. **Mapping honesty (§3 Why cells):** every "Why" cell in §3 cites either (a) a brief section/discipline-rule/amendment from the snapshot, or (b) a JD requirement category by structural descriptor. For JD-category citations, the auditor confirms the named category appears as a real section/requirement on the JD page (re-fetch URL). Flag mappings that cite invented brief content, invented JD categories, or that misattribute content between brief and JDs.
4. **Bar honesty (§3 / §4 criteria):** every "Bar criterion" entry is objectively verifiable by reading the future review doc. Flag criteria too vague to falsify (e.g., "be rigorous," "no waffling," "professional tone," "no padding" without a falsifiability test).
5. **Coverage (§3):** every brief-mandated review-doc section (1–9) has bar criteria in §3. Flag any section missing or merged.
6. **Cross-cutting completeness (§4):** every Krystal standing protocol in the brief snapshot's "Krystal's standing protocols" section is captured in §4. Flag any standing protocol omitted.
7. **No banned content (Amendment 6):** the artifact references the canonical /asae skill by trigger string or by file path only. No internal mechanics reproduced, summarized, paraphrased, or described — including but not limited to enumerated category-names that would tell a reader what structural elements the canonical skill has. Refer to the canonical skill spec at the file path in the brief snapshot for the authoritative definition of "internal mechanics."
